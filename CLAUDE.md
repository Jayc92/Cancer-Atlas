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
A static, no-build-step prototype: `cancer-atlas.html` is a thin shell (markup + CSS +
the three.js import map) that loads `js/main.js` as a real ES module, which in turn
imports the rest of the app from `js/` — vanilla JS + three.js (0.185.1, via an import
map — see Architecture notes), still no build step, no backend, no bundler. **Refactored
from one 2,816-line file into ES modules in this pass** (the "needs modularizing" item
this file's own Known Limitations had flagged since the three.js migration) — see
Architecture notes' "File layout / module map" for exactly what moved where and why. It
proves out the full navigation pattern end-to-end for **fourteen** organ/cancer pairs,
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
  applicable body — confirmed directly for Prostate, not assumed, when this
  organ was wired up: its marker DOM proxy carries `inertAncestor:true` and a
  zeroed bounding rect while the Female body is active, the same pattern
  every sex-inapplicable organ marker already uses.
  Brain/Lungs/Breast/Liver/Kidneys appear on both. **Ovaries, Breast, Lungs,
  Kidneys, Liver, Brain, and Prostate are all active now** — **Lungs, Kidneys,
  Liver, Brain, Prostate, and now Breast route to real anatomical meshes
  (`assets/lungs.glb`/`kidneys.glb`/`liver.glb`/`brain.glb`/`prostate.glb`/
  `breast.glb` — kidneys/liver/brain/prostate/breast from NIH 3D's Human
  Reference Atlas, CC BY 4.0; lungs, since 2026-09-01, is "Realistic Human
  Lungs" by the Sketchfab artist neshallads, CC BY 4.0, swapped in for its
  sculpted interlobar fissures — see the dated lungs-swap entry), not the
  procedural meshes described in earlier revisions of this file — see the
  "Organ mesh source" entry in Architecture notes for the full sourcing/
  topology/decimation history. Breast's source differs from the other five in
  one real way, not just a footnote: it's a custom hand-sculpted model
  (expert-reviewed against two anatomy textbooks) rather than traced from the
  Visible Human Dataset, and its real axillary tail — an actual anatomical
  extension toward the armpit the old capped-dome procedural mesh had no way
  to produce — is now visible and used as the Stromal/fatty tissue hotspot's
  anchor.** **Ovary remains procedural** — two research passes plus a third,
  final check (this pass) found no real, freely-downloadable ovary model
  worth integrating (see "Ovary real-asset research" in Architecture notes)
  — but its mesh proportions are now sized to a verified real measurement
  instead of an arbitrary shape (see the same entry). Body-marker positions
  on the body screen itself needed no new work for any of the newly-real
  organs — `ORGAN_MARKER_SPECS` was already placed and screen-space-verified
  during the body-mesh integration, well before any of these organ passes;
  only each organ's own `buildMesh`/hotspots changed.
- **Organ screen** — one screen, shown for whichever organ is currently
  selected (`renderOrganScreen(organKey)` repaints eyebrow/h1/sub/facts/desc/
  cancer-list from `ORGAN_DETAILS[organKey]` before the screen becomes visible).
  Each organ gets a real WebGL 3D mesh (three.js) via its own `buildMesh()`,
  drag-to-rotate + scroll-to-zoom via three's real `OrbitControls`, wrapped in
  the shared `makeViewer` helper (see Architecture notes). Four clickable
  "investigate" points raycast on click and populate an info card below the
  model. Below that: real anatomical facts, then a list of that organ's real
  cancer subtypes with real prevalence figures. **Ovary**: still a procedural
  organic/lumpy ellipsoid, but now sized to a real 3.5:2:1 length:width:
  thickness ratio (StatPearls — see "Ovary real-asset research" in
  Architecture notes) rather than the old, unsourced near-1:1 proportions;
  points are Surface epithelium / Cortex / Medulla / Hilum, only HGSOC wired.
  **Breast**: real anatomical scan (`assets/breast.glb`, a custom hand-
  sculpted model rather than a Visible Human Dataset trace — see "Organ mesh
  source" in Architecture notes), points are Ducts / Lobules /
  Stromal-fatty tissue / Nipple-areola complex — Ducts is deliberately framed
  in direct parallel to the ovary's Surface epithelium point ("~85% of invasive
  cancers arise here", same pedagogical shape) — only Triple-Negative (basal-
  like) is wired, others show "profile coming soon." **Lungs**: real anatomical
  mesh (`assets/lungs.glb` — since 2026-09-01 the artist-sculpted neshallads/
  Sketchfab model with real interlobar fissures and its own baked textures,
  no longer the HRA/VHD scan; see "Organ mesh source" in Architecture notes),
  points are Bronchi / Alveoli / Pleura / Hilum — Alveoli
  is framed the same way as Ovary's Surface epithelium and Breast's Ducts
  ("adenocarcinoma... most commonly arises here — directly paralleling..."),
  only Adenocarcinoma is wired, the other three (Squamous cell carcinoma,
  Large cell carcinoma, Small Cell Lung Cancer — explicitly noted in its own
  `share` text as a separate category from NSCLC entirely) show "profile
  coming soon." **Kidneys**: real anatomical scan (`assets/kidneys.glb`, left
  kidney only — see "Organ mesh source" in Architecture notes), points are
  Cortex / Medulla / Renal pelvis / Hilum — Cortex is framed the same "arises here" way as the
  three prior organs' points — only Clear cell renal cell carcinoma is wired,
  Papillary and Chromophobe show "profile coming soon." Its retroperitoneal
  location fact gets the same second-sentence treatment Lungs' dual blood
  supply got: it's the one anatomically distinct thing about this organ
  relative to every prior one (ovary/breast are intraperitoneal-or-overlying,
  lungs thoracic; kidneys sit behind the peritoneum entirely). **Liver**: real
  anatomical scan (`assets/liver.glb` — see "Organ mesh source" in Architecture
  notes), points are Hepatocytes / Portal vein / Bile ducts /
  Hepatic capsule — Hepatocytes gets the "arises here" framing every prior
  organ's first point uses, Bile ducts is deliberately the opposite: a
  contrast point stating that intrahepatic cholangiocarcinoma (the organ's
  other, not-yet-wired cancer) arises there *instead*, the same ductal-vs-
  lobular contrast Breast's own hotspots already draw. Its dual blood supply
  (portal vein ~75%, hepatic artery ~25% — StatPearls, "Physiology, Liver")
  gets the second-sentence treatment, framed as a different *kind* of dual
  supply than Lungs' (nutrient-rich/oxygen-poor vs. oxygen-rich, not
  oxygenated/deoxygenated by flow direction) — only Hepatocellular carcinoma
  is wired, Intrahepatic cholangiocarcinoma shows "profile coming soon."
  **Brain**: real anatomical scan (`assets/brain.glb`, base body from the
  Visible Human Dataset plus internal structure from the Allen Human Brain
  Atlas — see "Organ mesh source" in Architecture notes), points are White
  matter / Ventricular system / Cerebral cortex / Blood-brain barrier — White matter, not Cerebral
  cortex, gets the "arises here" framing (confirmed directly: StatPearls,
  "Glioblastoma," describes GBM as a subcortical white-matter disease first;
  the Cerebral cortex point is deliberately the opposite of every prior
  organ's first point — an explicit non-arises-here contrast, stated as such)
  — only Glioblastoma is wired, Lower-grade astrocytoma, Oligodendroglioma,
  and Meningioma show "profile coming soon."
  **Prostate**: real anatomical scan (`assets/prostate.glb`, gland body only —
  paired duct-like appendages in the source scan were isolated out; see "Organ
  mesh source" in Architecture notes), points are Peripheral zone /
  Transition zone / Central zone / Prostatic urethra — Peripheral zone gets
  the "arises here" framing every prior organ's first point uses (~75% of
  cases, StatPearls NBK540987), Transition zone is deliberately the opposite:
  a contrast point stating this is where BPH, not cancer, most often
  develops, the same not-arises-here contrast Liver's Bile ducts and Brain's
  Cerebral cortex points already draw — only Acinar adenocarcinoma is wired,
  the other four real-but-vanishingly-rare subtypes (Ductal, Mucinous,
  Signet ring cell, Neuroendocrine — see data rule 16) show "profile coming
  soon."
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
  (bone/liver/lung/brain) — bone (~24.5%), lung (~23.8%), and brain (~3.6%)
  confirmed directly against a SEER-based population study (Gao et al. 2023),
  liver confirmed as a real TNBC metastatic site (Yates et al. 2017; also
  discussed, without an overall percentage, in Gao et al. 2023's survival
  analysis) but with no overall percentage claimed for it, same honesty
  precedent LUAD/ccRCC use for their own unclaimed sites — an earlier,
  secondhand Foulkes et al. 2010 citation for all four sites' percentages
  didn't hold up on direct inspection (paywalled, no extractable numbers) and
  was dropped rather than kept; **LUAD**'s are also real
  distant-metastasis sites (bone/brain/liver/adrenal gland, per Riihimäki et
  al. 2014 — bone ~39% for adenocarcinoma specifically, not the higher
  all-NSCLC figure sometimes quoted); **ccRCC**'s are also real
  distant-metastasis sites (lung/bone/liver/brain) — lung (~54%) and bone
  (~20%) confirmed directly against a Swedish population-based registry
  (Dabestani et al. 2016), liver and brain confirmed as real major ccRCC
  metastatic sites via a separate population-based study (Bianchi et al.
  2012) but without a clean overall percentage extractable from its
  abstract, so none is claimed for those two — same honesty precedent as
  LUAD's unclaimed adrenal-gland percentage; **HCC**'s are also real
  distant-metastasis sites (lung/bone/lymph nodes/adrenal gland) — lung
  (~55%), lymph nodes (~41%), and bone (~28%) confirmed directly against a
  dedicated retrospective CT study (Katyal et al., Radiology, 2000; lung and
  bone re-checked against a larger, more recent SEER cohort — Zhuang et al.,
  Translational Cancer Research, 2025 — which closely corroborates lung
  [51%] but reports notably higher bone [43%], a real discrepancy stated
  explicitly in-product rather than smoothed over), adrenal
  gland confirmed as a real, clinically-recognized HCC metastatic site via
  dedicated case series (adrenalectomy and radiotherapy cohorts) but without
  a population-level percentage, same honesty precedent as the others' own
  unclaimed sites — same "sites" concept, five different real meanings,
  hence `legendTitle` is per-cancer, not hardcoded. HCC's TERT trunk figure
  (59%, Nault et al. 2013) was likewise cross-checked against three other
  independent cohorts and found to vary genuinely by population (~39–61%),
  not corrected but explicitly caveated in-product for the same reason.
  **GBM is a genuine structural departure, not a sixth "distant-metastasis
  sites" cancer** — see data rule 7 below for the full reasoning and its own
  standing note; the short version is that GBM's four "regions" (Enhancing
  core, Necrotic core, Infiltrative margin, Peritumoral edema) are zones
  within *one* tumor mass, `pos3d`-clustered tightly on purpose so the four
  blobs visually merge rather than reading as scattered organs, and
  `legendTitle`/`screenLabel` say so explicitly (`regionWord:'region'` even
  changes "site" to "region" throughout the panel/label text via a new,
  backward-compatible optional field on `CANCER_DETAILS` — every other
  cancer's entries simply omit it and fall back to "site").
  **Prostate acinar adenocarcinoma is a third, differently-shaped structural
  departure — not a second GBM** — see data rule 15 below. This cancer DOES
  metastasize in a real, bone-dominant way (Bubendorf et al., *Human
  Pathology*, 2000 — 90% of hematogenous metastases, confirmed directly), so
  the departure isn't "too rare to model" the way GBM's is. It's that the
  disease is genuinely multifocal, with independent clonal origins per focus
  (Fontugne et al., *JCI Insight*, 2022 — 76.5% of specimens have ≥2 foci):
  the four "regions" (Peripheral zone A/B/C, Transition zone) are
  independently-arising tumor foci within one gland, not distant organs and
  not zones of one contiguous mass, `pos3d`-clustered tightly the same way
  GBM's are, with `regionWord:'focus'`. Region names deliberately omit the
  word "focus" themselves (e.g. "Peripheral zone A," not "Focus 1") since
  `regionWord` already appends it wherever a name is shown standalone —
  caught and fixed during in-browser verification, the same class of
  double-suffix bug HCC's/GBM's dev-comment leaks were, just cosmetic instead
  of a leaked comment. TMPRSS2-ERG fusion and SPOP mutation are this
  cancer's two mutually-exclusive branch genes, split two-foci-each — same
  architectural pattern as HCC's TP53/CTNNB1 and GBM's EGFR/PDGFRA, not a
  fourth way of representing it.
- **Breadcrumb** at the top reflects the full chain (Body › organ › cancer ›
  [site] › [cell]) and is clickable at every level.
- **Organ library sidebar** — persistent, collapsible left rail visible across
  all three screens (a sibling of the `.screen` divs, never a child of one).
  One row per `ORGANS` entry in registry order (the same order search results
  inherit), each with a static thumbnail (`assets/thumbs/<key>.png`), the
  organ's name, its `system` label, and the same `Explore`/`Coming soon` tag
  vocabulary the search results use. Clicking a row goes through the one
  shared `selectOrgan` (active → organ screen; inactive → the existing toast
  + hotspot glow, no second "coming soon" mechanism). The currently-viewed
  organ's row is highlighted (`.current` + `aria-current="true"`) on both its
  organ screen and its cancer screen. Open by default on desktop; collapsed
  slide-over drawer on mobile (≤640px), auto-closing after a successful
  navigation. See "Organ library sidebar" in Architecture notes for the full
  layout/thumbnail/resize reasoning.
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

## Data rules (do not relax)
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
   not a near-universal founder like TP53 is for HGSOC/TNBC — see rule 11
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
   frequent in squamous (LUSC) than adenocarcinoma — see rule 11 below. Same
   "don't just trust the gene name" standard that caught ESR1/MDM4, applied
   twice more in one pass.)
4. **"Cooperating" and "competing" are two distinct mutation-framing models this
   atlas now uses — check which one actually applies per organ, never assume.**
   Lung/LUAD (rule 3 above) is a *competing*-driver cancer: KRAS/EGFR/ALK/ROS1
   are clinically mutually exclusive alternatives, so only one may ever be
   modeled as present. Kidney/ccRCC is the **opposite** pattern: PBRM1, SETD2,
   and BAP1 are not alternatives to the trunk VHL mutation at all — TCGA
   (*Nature*, 2013) reports chromosome 3p loss in 91% of ccRCC tumors
   "encompassing all of the four most commonly mutated genes (VHL, PBRM1, BAP1
   and SETD2)," meaning these genes' most common alteration *is* the same
   single 3p-deletion event that removes VHL, not four independent choices a
   tumor makes instead of one another. **Neither pattern generalizes to the
   next organ without checking.** The ccRCC pass itself proved this within one
   organ: KDM5C is ccRCC's fourth branch gene and does cooperate with VHL loss
   (not compete with it), but *not* via the same chromosome-3p co-deletion
   mechanism as PBRM1/SETD2/BAP1 — KDM5C sits on Xp11.22 (NCBI Gene ID 8242),
   not chromosome 3p, confirmed directly rather than assumed just because it's
   another branch gene in the same "cooperating" cancer. Whichever pattern a
   future organ turns out to have, verify it directly at the source the way
   both of these were, rather than defaulting to whichever pattern the most
   recently added organ used.
5. **A trunk mutation can be truncal for a temporal reason instead of a
   spatial one — check which, don't reuse the other organs' language by
   default.** Every trunk mutation before Liver/HCC (TP53 for HGSOC/TNBC, VHL
   for ccRCC) is truncal in the *spatial* sense established by Gerlinger et
   al.'s ccRCC work: present in every region of a tumor sampled at one point
   in time. HCC's trunk, TERT promoter mutation, is truncal for a different
   reason entirely — it is the earliest event in *time*, not the most
   spatially ubiquitous one. Nault et al. (*Nature Communications*, 2013)
   found it in premalignant cirrhotic macronodules before they become cancer
   at all, calling it "the earliest recurrent genetic event identified in
   cirrhotic preneoplastic lesions so far"; Schulze et al. (*Nature
   Genetics*, 2015) confirmed the ordering directly against this organ's two
   branch genes: "Although TERT promoter mutations were already frequent at
   early stages, CTNNB1 and TP53 mutation frequencies increased significantly
   with progression." The in-product trunk note for TERT was written to say
   this explicitly rather than reuse "present in every region" language that
   would be actively wrong here — HCC's own regional-heterogeneity story
   (rule 6 below) is about TP53/CTNNB1, not about TERT being everywhere at
   once. **Pancreas/PDAC is the second organ whose trunk is temporal (rule 18
   below): KRAS is already mutated in ~92–95% of even the earliest, lowest-
   grade PanIN precursor lesions, flat across every grade — it comes first in
   time. GBM's IDH-wildtype status is a third, classifier-shaped variant.
   Check which justification actually applies per organ; three now exist.**
6. **A gene pair can follow a third mutation-framing model — "general rule,
   with a documented exception" — distinct from both rule 3's *competing*
   and rule 4's *cooperating* patterns.** HCC's TP53 and CTNNB1 mutations are
   "largely considered to occur in a mutually exclusive manner" (Friemel et
   al., *BMC Clinical Pathology*, 2016, citing the foundational two-pathway
   paper, Laurent-Puig et al., *Gastroenterology*, 2001), each defining a
   distinct molecular phenotype the way HGSOC/TNBC's TP53 or ccRCC's VHL
   define one — but unlike Lung's KRAS/EGFR/ALK/ROS1, this exclusivity is not
   absolute, and the atlas represents both the rule and a real, documented
   exception rather than only the clean version. Friemel et al. (2016) is
   itself a case report finding a CTNNB1 mutation and a TP53 mutation
   together in one heterogeneous tumor, stating outright: "Intratumor
   heterogeneity challenges the concept of CTNNB1 and TP53 gene mutations
   being mutually exclusive molecular classifiers in HCC." Both the rule and
   the exception are wired into the TP53/CTNNB1 branch notes in-product, not
   left in a code comment only — the same standard ccRCC's convergent-
   evolution finding was held to (rule 12 below, Kidney/ccRCC sources), now
   applied to a finding that qualifies a rule rather than just illustrating
   one. Don't flatten this to "TP53 and CTNNB1 are mutually exclusive" the
   next time this organ's content is touched — the exception is real and
   sourced, not a hedge.
7. **The "sites" screen itself can be a structural departure, not just the
   mutation-framing model within it — check whether an organ's cancer
   actually has real distant metastasis before building four of them.**
   Every cancer before Brain/GBM has real, if sometimes rare or unclaimed,
   distant-metastasis sites (or, for HGSOC, a real intraperitoneal spread
   pattern) to model. Glioblastoma does not: extracranial metastasis occurs
   in under 1–2% of cases, confirmed directly from two independent sources
   (Majd et al., *The Oncologist*, 2024, "Extraneural metastases occur in
   less than 1% of all patients with glioblastoma"; Conejero Merchán et al.,
   *Open Respiratory Archives*, 2026, "less than 2% of cases"). Modeling
   four separate distant organs here the way every prior cancer's screen
   does would misrepresent the single most basic fact about how this
   disease spreads. What GBM genuinely has instead is well-documented
   *intratumor* regional heterogeneity — real histological/radiological
   zones (enhancing core, necrotic core, infiltrative margin, peritumoral
   edema; confirmed against both the Ivy Glioblastoma Atlas Project's own
   histological zonation and standard MRI-defined GBM zones) within one
   infiltrative mass. The fix reuses every existing mechanism — same
   region/branch-gene/raycast/keyboard machinery every prior cancer's site
   map uses — rather than building a new rendering system: `pos3d` values
   are deliberately clustered tightly (the opposite of every prior cancer's
   widely-spaced sites — see the Known Limitations note on this, so nobody
   "fixes" GBM's clustering thinking it's an oversight) so the four blobs
   visually merge into one lumpy mass, and a new optional `regionWord` field
   on `CANCER_DETAILS` (default `'site'`, GBM sets `'region'`) swaps the word
   used in every per-region label/aria-label/panel-subtitle string. Every
   other cancer's entry omits `regionWord` and is unaffected. **This
   departure is specific to GBM's own biology, not a new universal
   pattern** — the next organ added should default back to real distant
   sites unless its own literature says otherwise, checked the same way
   GBM's ~1–2% figure was, not assumed from this one exception.
8. **Mutation model vocabulary** (established and should stay consistent):
   - **Trunk** — present in ~all tumor cells; the founding/earliest driver event.
   - **Branch** — arose within one anatomical site/subclone, not all of them.
   - **Private** — unique to one sampled cell; illustrates ongoing heterogeneity.
   - **Driver** vs **Passenger** badge on every mutation.
   - Each mutation entry needs: gene/event name, class (driver/passenger),
     a frequency or CCF figure where one exists, and a one-line plain-language
     "why this matters" note (no jargon dump).
9. Ovary/HGSOC reference sources already used, for continuity:
   - TCGA, *Nature*, 2011 (integrated genomic analysis of ovarian carcinoma —
     TP53 ~96%, recurrent CDK12/NF1/RB1 alterations, CCNE1 amplification).
   - McPherson et al., *Nature Genetics*, 2016 (multi-site whole-genome
     sequencing of HGSOC — ovary → omentum → peritoneum → bowel spread pattern,
     BRCA1/2 pathway loss and HR-deficiency framing).
   - Real ovarian carcinoma subtype shares: HGSOC ~70%, endometrioid ~10%,
     clear-cell ~10%, mucinous ~3%, low-grade serous <5%.
10. Breast/TNBC reference sources, for continuity:
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
   - **Site-frequency correction (post-hoc verification pass, closing a rigor
     gap TNBC shipped with):** TNBC's four sites had real branch-gene picks
     but no cited *metastatic-site* frequency at all — unlike LUAD's bone
     ~39% and ccRCC's lung ~54%/bone ~20%, which were verified and recorded
     even though, on inspection during this same pass, neither is actually
     rendered as an on-screen percentage anywhere in the UI for any cancer;
     this project's real precedent is "verified and recorded in source
     comments + here," not a numeric badge in the 3D view. Brought to that
     same standard: a candidate citation, **Foulkes et al., *NEJM*, 2010**
     ("Triple-Negative Breast Cancer," PMID 21067385) — offered secondhand
     with lung 40%/brain 30%/liver 20%/bone 10% — was checked directly and
     did not hold up: it's a real review article, but its abstract is a
     scope-only summary with zero percentages, and the full text is
     paywalled with no PMC mirror, so the specific figures could not be
     confirmed from the source at all. Dropped, same as Steeghs was for
     LUAD, rather than kept on an unverifiable secondhand citation.
   - **Gao et al., *Precision Medical Sciences*, 2023** (DOI 10.1002/
     prm2.12107, open access — "Patterns of distant metastases in patients
     with triple-negative breast cancer—A population-based study"; SEER,
     24,822 TNBC patients 2010–2015, 1,026 with distant metastasis at
     diagnosis). Confirmed directly from the open-access full text: bone
     24.46% (251/1026), lung 23.78% (244/1026), brain 3.61% (37/1026) — the
     figures now used for those three sites. Liver is discussed only in the
     paper's survival analysis (grouped with brain as the worst-prognosis
     sites) and never given its own overall percentage anywhere in the
     text — confirmed by searching specifically for every mention of
     "liver," not inferred from its absence from a top-3 list — so none is
     claimed for Liver in-product, the same honesty precedent as LUAD's
     adrenal gland and ccRCC's liver/brain.
   - **Kennecke et al., *J Clin Oncol*, 2010** (PMID 20498394, not open
     access, but specific findings confirmed directly from the abstract
     text, not the review's own summary of it) — the real, distinctive
     finding this correction pass adds that wasn't represented anywhere in
     TNBC's content before: TNBC's organotropism genuinely differs from
     other breast cancer subtypes, not just a different set of numbers on
     the same pattern. Confirmed directly: "basal-like tumors had a higher
     rate of brain, lung, and distant nodal metastases but a significantly
     lower rate of liver and bone metastases" versus luminal subtypes, and
     "bone was the most common metastatic site in all subtypes except
     basal-like tumors." One real caveat preserved rather than
     over-generalized: the abstract separately states triple-negative
     *nonbasal* tumors specifically were "not associated with fewer liver
     metastases" — the lower-liver finding is strongest for basal-like, not
     TNBC as a whole, and the in-product comment reflects that distinction
     rather than flattening it.
11. Lung/LUAD reference sources, for continuity:
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
   - **Counting rule for that list, added 2026-09-07 on a second full-text
     read — it corrects how the list was USED, not what it says.** Every
     percentage in it is a MUTATION frequency; the paper prints them as
     "Mutations in tumour suppressor genes including STK11 (17%), KEAP1
     (17%), NF1 (11%), RB1 (4%) and CDKN2A (4%) were observed." So a figure
     from that list may only be attached to an entry that models mutation.
     Two consequences, both shipped together because the second exposed the
     first:
     - `CDKN2A loss` is now sourced, and **deliberately carries no number.**
       The paper's copy-number statement is "The CDKN2A locus was the most
       significant deletion", with that frequency in Supplementary Table 6
       and nowhere in the text; its CDKN2A 4% counts mutations; and promoter
       hypermethylation is in neither count — the paper keeps it separate,
       describing tumours "with low CDKN2A expression due to methylation
       (rather than due to mutation or deletion)". No percentage in the paper
       measures `CDKN2A loss`, so the entry quotes the superlative and states
       its counting rule rather than substituting a nearby figure.
     - `RB1 loss` was carrying `~4%` under a *loss* label — a mutation-only
       count wearing a total's name, and it only became visible because
       CDKN2A's counting rule was written one line above it. Corrected in
       place; its ccf now says which thing the figure counts. This is the
       mirror of the bladder CDKN2A entry's 22%-vs-32/33% reconciliation
       elsewhere in this file: there, two real measurements of one event;
       here, one measurement standing in for a different event.
     Also read and deliberately NOT claimed: the paper reports "alteration of
     cell cycle regulators" at 64%, but that module's membership list is in
     Supplementary Fig. 10, which has not been read — so this atlas does not
     assert that TCGA scores CDKN2A and RB1 as one module in LUAD. The open
     half of this item — whether `RB1 loss` should leave the pool as
     duplicating CDKN2A's pathway — lives in `js/panel.js`, in the pool-pair
     exclusivity audit on the line that decides whether an audited pair can
     be emitted at all.
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
     with **RB1 loss** (TCGA 2014, ~4%, directly confirmed — and see the
     counting-rule bullet above, added later: that 4% is a MUTATION
     frequency, which is what the entry's ccf now says out loud rather than
     leaving a *loss* label to imply otherwise). **PTEN loss**,
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
12. Kidney/ccRCC reference sources — **every citation in this section was
   verified directly at the source before being written into the app, not
   after (see data rule 4 above for why that discipline matters here
   specifically — this organ's genes cooperate rather than compete, which is
   easy to get wrong in the other direction the same way LUAD's ESR1/MDM4/
   SMAD4/PTEN picks were wrong):**
   - **Moore et al., *PLOS Genetics*, 2011** ("Von Hippel-Lindau (VHL)
     inactivation in sporadic clear cell renal cancer: associations with
     germline VHL polymorphisms and etiologic risk factors"; PMID 22022277,
     PMCID PMC3192834, open access). **Authorship correction:** this paper is
     what the original task prompt referred to as "Nickerson et al." —
     Nickerson ML is a real coauthor, but the first author is Moore LE.
     Confirmed directly from the abstract: 86.6% of ccRCC cases showed VHL
     inactivation via sequence alterations or promoter hypermethylation — the
     trunk figure used in-product (rounds to the "~87%" the task prompt
     specified). The abstract does not itself characterize VHL as truncal —
     that claim comes from Gerlinger et al. 2012 below, cited separately for
     exactly that reason, per the task's own instruction to verify the two
     citations independently rather than treating them as interchangeable.
   - **Gerlinger et al., *NEJM*, 2012** ("Intratumor heterogeneity and
     branched evolution revealed by multiregion sequencing"; PMID 22397650,
     PMCID PMC4878653, free to read via Europe PMC though not open-licensed).
     Confirmed directly from the full text: "Of these driver genes, only VHL
     was mutated ubiquitously in all analyzed regions" — the source for VHL's
     *architecturally* truncal status, not just its frequency. Also directly
     confirmed a real, distinctive finding not previously represented
     anywhere in this atlas: **convergent evolution**, where different
     specific mutations in the same gene arise independently in different
     regions of one tumor. Three genes show this in the paper — SETD2 (three
     distinct mutations: a missense change shared by the metastases, a
     splice-site change in one region, a frameshift deletion shared by every
     other region), KDM5C (disruptive mutations in most regions, a distinct
     splice-site mutation in the metastases), and PTEN (two independent
     mutations — splice-site and missense — in separate regions). Wired into
     the SETD2, KDM5C, and PTEN mutation notes in-product, each restating the
     specific detail rather than a generic "convergent evolution happens
     here" gloss, since the task asked for this only if it could be confirmed
     directly rather than paraphrased from its own summary — it could, in
     full and in more genes (three, not the two originally suggested) than
     expected.
   - **TCGA (Cancer Genome Atlas Research Network), *Nature*, 2013**
     ("Comprehensive molecular characterization of clear cell renal cell
     carcinoma"; PMID 23792563, PMCID PMC3771322, open access). Confirmed
     directly from the open-access full text: chromosome 3p loss in 91% of
     samples "encompassing all of the four most commonly mutated genes (VHL,
     PBRM1, BAP1 and SETD2)" — the source for this organ's "cooperating, not
     competing" framing (data rule 4). Individual gene frequencies confirmed
     directly: PBRM1 41%, BAP1 15%, SETD2 12%. KDM5C, PTEN, and MTOR are
     confirmed real, recurrent ccRCC genes — VHL, PBRM1, SETD2, KDM5C, PTEN,
     BAP1, MTOR, and TP53 are named as the paper's eight most significant of
     19 total significantly mutated genes (q<0.00001) — but no overall-cohort
     percentage for any of these three could be extracted from the available
     text (only molecular-subtype-specific figures, e.g. PTEN "11% in m3 vs
     1%" in other clusters), so none is claimed for KDM5C or PTEN in-product,
     same honesty precedent as LUAD's unclaimed KDM5C-equivalent figures. The
     ~28% MTOR-mutation figure used in-product is a precisely different claim
     than "MTOR gene mutated in 28%" — confirmed directly that it's "an
     unsupervised pathway analysis... identified mutually exclusive patterns
     of alterations targeting multiple components of the PI3K/Akt/mTOR
     pathway in 28% of the tumors," i.e. 28% of tumors have *some* alteration
     across that whole pathway (MTOR, PTEN, PIK3CA, etc.), with those
     alterations mutually exclusive *with each other* — not the MTOR gene
     itself mutated in 28% of tumors (its own gene-level figure is a
     molecular-subtype-specific "12% vs 4%," not an overall one). Worded
     precisely in-product for this reason. KDM5C's chromosomal location
     (Xp11.22, not chromosome 3p — NCBI Gene ID 8242) was checked
     independently rather than assumed to share PBRM1/SETD2/BAP1's
     co-deletion mechanism just because all four are ccRCC branch genes —
     see data rule 4.
   - **Dabestani et al., *World Journal of Urology*, 2016** ("Renal cell
     carcinoma recurrences and metastases in primary non-metastatic
     patients: a population-based study"; PMID 26847337). Confirmed directly
     from the full abstract (Swedish National Kidney Cancer Register, 4,527
     patients 2005–2009, 623 recurrences during 5-year follow-up): "the most
     frequent sites of metastases were lung (54%), lymph nodes (22%) and bone
     (20%)" — the source for the Lung and Bone figures used in-product.
     Neither liver nor brain metastasis is mentioned anywhere in this
     abstract, with any percentage — confirmed by searching the full
     abstract text specifically for both, not inferred from their absence
     from a "most frequent" top-3 list. These two real figures replaced the
     task prompt's suggested "~45%"/"~30%" once verification turned up a
     real, precise, population-based number that didn't match — same
     "verify, then use what's actually confirmed" standard as LUAD's KRAS
     trunk figure.
   - **Bianchi et al., *Annals of Oncology*, 2012** ("Distribution of
     metastatic sites in renal cell carcinoma: a population-based analysis";
     PMID 21890909, Nationwide Inpatient Sample, 11,157 metastatic RCC
     patients, 1998–2007, not open access). This is the source for Liver and
     Brain being included as real ccRCC metastatic sites at all — its own
     abstract explicitly frames the study as examining "lung, bone, liver and
     brain metastases" as the four sites of interest. But its actual reported
     figures are conditional/subgroup rates, not simple overall percentages:
     bone metastases "10% in patients with exclusive abdominal metastases and
     49% in patients with abdominal, thoracic and brain metastases," brain
     metastases "2%... and 16%..." by the same kind of subgroup — confirmed
     directly by requesting the complete abstract text, not just a
     percentage-shaped excerpt of it. No liver-specific or brain-specific
     overall percentage could be verified from this abstract, which is
     exactly why none is claimed for those two sites in-product — this
     paper's role here is establishing the sites are real, not supplying a
     number, the same limited role Riihimäki's adrenal-gland mention plays
     for LUAD.
   - Real renal cell carcinoma subtype shares: Clear cell ~75–80%, Papillary
     ~15%, Chromophobe ~5% — standard NCI/WHO-style figures, same treatment
     (no individual citation fetch) as every other cancer's subtype-share
     list in this file.
13. Liver/HCC reference sources — **every citation in this section was
    verified directly at the source before being written into the app, the
    standard held from the start rather than corrected after the fact (see
    the LUAD correction record above for what "after the fact" looks like).
    This organ needed two novel checks no prior organ did: a temporal, not
    spatial, trunk justification (data rule 5), and a "general rule plus
    documented exception" mutation-framing model (data rule 6).**
    - **Nault et al., *Nature Communications*, 2013** ("High frequency of
      telomerase reverse-transcriptase promoter somatic mutations in
      hepatocellular carcinoma and preneoplastic lesions"; PMID 23887712,
      PMCID PMC3731665, open access). Confirmed directly from the full text:
      TERT promoter mutations in 59% of 305 HCCs (179/305) — not the task
      prompt's suggested ~49%, a real, precise, directly-confirmed figure
      used in place of it, same "verify, then use what's actually confirmed"
      standard as every prior correction in this file. Confirmed the
      temporal-trunk claim directly: 5 of 20 (25%) cirrhotic macronodules —
      premalignant, not yet HCC — carried TERT promoter mutations, "the
      earliest recurrent genetic event identified in cirrhotic preneoplastic
      lesions so far." The task's suggested HBV ~32%/HCV ~66% split also
      didn't hold up as stated: the paper's own Table 1 gives raw counts
      (49 of 68 total HCV+ patients had TERT mutations; 26 of 67 total HBV+
      patients did), computed directly into ~72%/~39% rather than quoting
      the paper's own percentages verbatim, since those describe a different
      statistic (etiology composition *within* the mutated group, not
      TERT-mutation rate *within* each etiology) — confirmed by requesting
      the complete table, not a percentage-shaped excerpt of it, after an
      initial extraction attempt returned an internally-inconsistent
      percentage that turned out to be exactly this mismatch.
    - **Representativeness cross-check (post-hoc, before committing this
      organ):** because 59% was anchoring both the trunk percentage and the
      temporal-ordering claim, it was checked against Nault's own cohort
      composition (N=305, two *French* hospitals, surgically resected —
      i.e. resectable disease specifically — etiology skewed toward alcohol
      at 39% over HBV 22%/HCV 26%, Sanger-sequenced) and against independent
      cohorts rather than assumed globally representative: Schulze et al.
      (2015, also French) found ~60%; TCGA (*Nature*, 2017, mixed US
      cohort, N=196, PMID 28622513) found 44% (87/196); an HBV-dominant
      Asian cohort (Aizimuaji et al., *World Journal of Gastrointestinal
      Oncology*, 2025, N=66, PMID 41480220) found only 39.4% (Sanger) to
      45.5% (digital PCR). The spread (~39–61%) tracks Nault's *own*
      etiology finding — their HCV+ patients had far higher TERT rates than
      their HBV+ patients — so a French, alcohol/HCV-skewed cohort running
      high and an HBV-dominant cohort running low is exactly what the
      biology predicts, not an unexplained discrepancy needing resolution
      one way or the other. Kept 59% as the headline figure (still real,
      precise, and from the same paper the temporal claim depends on) but
      both the in-product `ccf` string and note now state the real
      cross-cohort range explicitly, the same "note real variability, don't
      present one number as universal" treatment LUAD's KRAS (~30–37%) and
      ccRCC's VHL figures already use. A separately-referenced ~49% pooled
      meta-analysis figure (from a >4,000-case multi-source review) could
      not be located after eight distinct searches across Europe PMC,
      Crossref, and Semantic Scholar (rate-limited) — noted honestly here
      rather than fabricating a citation for it; the four independently-
      confirmed cohorts above already establish the real variability that
      figure would have illustrated, even without pinning its exact source.
    - **Schulze et al., *Nature Genetics*, 2015** ("Exome sequencing of
      hepatocellular carcinomas identifies new mutational signatures and
      potential therapeutic targets"; PMID 25822088, PMCID PMC4587544, open
      access). Confirmed directly the specific temporal-ordering sentence
      the task asked for: "Although TERT promoter mutations were already
      frequent at early stages, CTNNB1 and TP53 mutation frequencies
      increased significantly with progression" — the source for TERT being
      trunk for a *temporal* reason, the standing note in data rule 5. Also
      one of the four cohorts in the representativeness cross-check above.
    - **Guichard et al., *Nature Genetics*, 2012** ("Integrated analysis of
      somatic mutations and focal copy-number changes identifies key genes
      and pathways in hepatocellular carcinoma"; PMID 22561517, PMCID
      PMC3819251, not open access but full text confirmed accessible).
      Single coherent source for every branch/private gene frequency used
      in-product, all confirmed directly from the same cohort rather than
      stitched together from papers with different methodologies: CTNNB1
      32.8%, TP53 20.8%, AXIN1 15.2%, ARID1A 16.8%, ARID2 5.6%, NFE2L2 6.4%.
      TP53's figure closely matches the task's suggested ~21%; CTNNB1's real,
      confirmed 32.8% does not match the task's suggested ~40%, and the
      lower, verified figure was used instead. Also the source for the
      mechanistic-fit checks data rule 6 required: confirmed directly that
      "CTNNB1, AXIN1 and APC gene alterations were mutually exclusive (only
      one HCC was mutated for both CTNNB1 and AXIN1)" — AXIN1 is an
      *alternative* route to the same Wnt/β-catenin activation CTNNB1
      mutation already provides, not a cooperating event, and was excluded
      from the private pool for exactly that reason (see the in-code comment
      above `REGIONS_HCC` for the full reasoning — this is the one gene from
      the task's own suggested list that got dropped after verification,
      the same "don't just trust the gene name" standard that caught
      ESR1/MDM4 and LUAD's SMAD4/PTEN, caught before shipping this time).
      ARID1A ("a significant association with CTNNB1 mutations") and NFE2L2
      ("6 out of 8 NFE2L2 mutated HCC were also mutated for CTNNB1,
      P=0.015") were both confirmed to cooperate with CTNNB1, not compete —
      safe for the shared private pool. ARID2's cooperation with CTNNB1 was
      confirmed via more recent work, since this 2012 paper's own text didn't
      address that specific pair directly — recorded here for months as only
      "multiomics analyses naming 'CTNNB1-ARID2 comutations'", an UNNAMED
      source. **NAMED ON RULING 2026-09-06 (name-it-or-remove-it, not
      downgrade — an unnamed source was doing load-bearing work against a
      named one): Li Z et al., *Human Mutation*, 2026, PMID 42016321,
      PMC13092802, OA.** "Low-risk patients were characterized by frequent
      CTNNB1-ARID2 comutations" (verbatim). Reading it narrowed it three
      ways: FIGURE-DERIVED (Fig 7c,d heatmaps; no OR/p for this pair in
      prose), SCOPED to the low-risk stratum of that paper's own WGCNA/ML
      risk model rather than to HCC at large, and NOT INDEPENDENT — a
      reanalysis of TCGA + GSE54236, so the word "independent" credited a
      reanalysis with a separate cohort (**attribution error, the prostate
      TCGA/Taylor-2010 class**). It is also SILENT on ARID1A-vs-ARID2, which
      is the pair the shared pool actually turns on — see the pool-member
      exclusivity sweep below.
    - **Laurent-Puig et al., *Gastroenterology*, 2001** ("Genetic alterations
      associated with hepatocellular carcinomas define distinct pathways of
      hepatocarcinogenesis"; PMID 11375957, not open access). The
      foundational two-pathway paper Friemel et al. (2016, below) cites as
      the origin of the "largely considered... mutually exclusive" framing:
      confirmed directly that HCC divides into a chromosomally-stable group
      (beta-catenin/CTNNB1 mutation, chromosome 8p loss) and a chromosomally-
      unstable group (AXIN1 and p53 frequently mutated together) — the
      source for framing TP53/CTNNB1 as two distinct phenotypes, not just
      two individually-common genes.
    - **Friemel et al., *BMC Clinical Pathology*, 2016** ("Liver cancer with
      concomitant TP53 and CTNNB1 mutations: a case report"; PMCID
      PMC4888639, open access). Confirmed directly and in full: a mixed
      hepatocellular/cholangiocellular carcinoma where "a p.D32V mutation in
      exon 3 of the CTNNB1 gene occurred concomitantly with a TP53 intron
      7/exon 8 splice site mutation" in the tumor's hepatocellular component,
      with the paper stating outright that "intratumor heterogeneity
      challenges the concept of CTNNB1 and TP53 gene mutations being
      mutually exclusive molecular classifiers in HCC." This is the source
      for data rule 6's documented exception — confirmed directly rather
      than paraphrased from the task's own summary, exactly as the task
      asked, and wired into both the TP53 and CTNNB1 branch notes in-product
      rather than left as a comment only.
    - **Katyal et al., *Radiology*, 2000** ("Extrahepatic metastases of
      hepatocellular carcinoma"; PMID 10966697, 403 consecutive HCC patients,
      148 with extrahepatic metastasis, single institution [University of
      Pittsburgh], CT-imaging-based retrospective series, not open access
      but full abstract confirmed accessible). Confirmed directly: lung 55%
      (81/148), abdominal lymph nodes 41% (60/148), bone 28% (41/148) — the
      source for three of this organ's four sites. Adrenal gland is not
      mentioned anywhere in this paper's abstract at all — confirmed by
      requesting the complete abstract text and searching it specifically,
      not inferred from its absence from a "most common" list. Adrenal gland
      was still included as this organ's fourth site (per the task's own
      suggestion) because it's independently confirmed as a real,
      clinically-recognized HCC metastatic site via dedicated case series
      (adrenalectomy and radiotherapy cohorts specifically for HCC-to-adrenal
      spread), just without a population-level percentage to cite — same
      honesty precedent as every other organ's unclaimed sites (LUAD's
      adrenal gland, ccRCC's liver/brain).
    - **Representativeness cross-check (post-hoc, before committing this
      organ):** Katyal et al.'s cohort is single-institution, CT-imaging-
      based, and now over two decades old — checked against a larger, more
      recent, population-based study before treating it as current best
      evidence. Found one: **Zhuang et al., *Translational Cancer
      Research*, 2025** (PMID 41158259, PMCID PMC12554466, open access; SEER
      registry, N=2,197, 2010–2015, restricted to patients with a *single*
      metastatic site — a different denominator than Katyal's "any site
      among all extrahepatic-met patients"). Confirmed directly: lung 51%
      (1,116/2,197) — closely corroborating Katyal's 55% across 25 years and
      two different methodologies (clinical CT imaging vs. SEER registry
      coding) — but bone 43% (938/2,197), notably higher than Katyal's 28%.
      Zhuang's study does not include lymph nodes as a studied site at all,
      so Katyal's 41% lymph-node figure has no independent modern
      corroboration either way. Kept Katyal as the primary source (still the
      only dedicated all-sites distribution study with real lymph-node
      data) rather than replacing it outright, since the discrepancy is
      plausibly a denominator difference (all-sites vs. single-site-only)
      rather than either study being simply wrong — but the Lung and Bone
      branch notes in-product now state the corroboration and the
      discrepancy explicitly, and the Lymph nodes note states plainly that
      no modern study corroborates or revises that figure, rather than
      presenting a 25-year-old single-institution number as uncontested.
    - Standard liver anatomy facts (four lobes, hepatocytes ~80% of liver
      mass) are treated the same "no individual citation fetch" way as every
      cancer's subtype-share list — except the dual blood-supply split
      (portal vein ~75%/hepatic artery ~25%), which the task explicitly
      asked to be verified directly and was: confirmed via StatPearls,
      "Physiology, Liver" (NCBI Bookshelf NBK535438, PMID 30571059) — an
      exact match to the task's suggested figures, no correction needed.
    - Real primary liver cancer shares: Hepatocellular carcinoma ~75–85%,
      intrahepatic cholangiocarcinoma ~10–15% — standard NCI/WHO-style
      figures, same no-individual-citation treatment as every other
      cancer's subtype-share list.
14. Brain/GBM reference sources — **every citation in this section was
    verified directly at the source before being written into the app. This
    organ needed a structural-departure check no prior organ did (data rule
    7) before any data-sourcing work even started.**
    - **Majd et al., *The Oncologist*, 2024** (PMID 38837109, PMCID
      PMC11379637, open access — "Metastatic extraneural glioblastoma
      diagnosed with molecular testing"). Confirmed directly: "Extraneural
      metastases occur in less than 1% of all patients with glioblastoma" —
      one of two independent sources establishing the structural-departure
      premise (data rule 7) before any other work on this organ began.
    - **Conejero Merchán et al., *Open Respiratory Archives*, 2026** (PMID
      41541893 — "Pulmonary Metastasis From Glioblastoma: An Uncommon
      Clinical Entity"). Confirmed directly: "extracranial metastasis...
      occurs in less than 2% of cases" — the second independent source, as
      the task asked for, not a single citation taken on trust.
    - **Louis et al., *Neuro-Oncology*, 2021** ("The 2021 WHO Classification
      of Tumors of the Central Nervous System: a summary"; PMID 34185076,
      PMCID PMC8328013, free to read via Europe PMC). Confirmed directly:
      "eliminates the term 'Glioblastoma, IDH-mutant'" and "all IDH-mutant
      diffuse astrocytic tumors are considered a single type (*Astrocytoma,
      IDH-mutant*)" — the source for this organ's trunk-level classifier
      being IDH-wildtype status itself, not merely a percentage split within
      a single disease the way TP53/VHL frequencies are elsewhere in this
      file. No prevalence percentage for IDH-wildtype vs. IDH-mutant among
      grade-4 astrocytic tumors could be extracted from the accessible text
      after multiple attempts — not claimed in-product for that reason,
      same honesty precedent as every other organ's unclaimed figures.
    - **TCGA (Brennan et al.), *Cell*, 2013** ("The somatic genomic
      landscape of glioblastoma"; PMID 24120142, PMCID PMC3910500, free to
      read via Europe PMC). Confirmed directly: EGFR alterations 57.4%,
      PDGFRA alterations 13.1% (both combined mutation-and/or-amplification
      figures — worded precisely as such in-product, since an amplification-
      only figure could not be isolated from the accessible text despite
      several attempts, the same "word precisely, don't overclaim" standard
      ccRCC's MTOR-pathway figure used); CDKN2A/B deletion 57.8%; PI3K
      pathway mutations 25.1%, "mutually exclusive of PTEN mutations/
      deletions," with 59.4% of GBM showing one or the other — PTEN's own
      ~34% figure used in-product is computed (59.4% − 25.1%) from these two
      directly-confirmed numbers, not read verbatim, and stated as such. Also
      the source for three real, GBM-specific mechanistic-fit exclusions
      (data rule 7's comment block in `cancer-atlas.html` has the full
      reasoning for each): NF1 loss (~10%) confirmed mutually exclusive with
      EGFR alterations; RB1 loss (7.6%) confirmed mutually exclusive with
      CDKN2A/B deletion and CDK4/6 amplification ("78.9% of tumors had one or
      more alteration affecting Rb function," never several stacked); and
      the same PI3K/PTEN exclusivity above ruling out adding PIK3CA/PIK3R1
      mutation alongside PTEN loss. Each was a real gene at a real GBM
      frequency that would have competed with a gene already in use — the
      same class of mistake as HCC's AXIN1, caught before shipping this
      time, three times over in one organ.
    - **Killela et al., *PNAS*, 2013** ("TERT promoter mutations occur
      frequently in gliomas..."; PMID 23530248, PMCID PMC3625331, not open
      access but full text confirmed accessible). Confirmed directly: "The
      prevalence of TERT promoter mutations was remarkably high in GBMs of
      adults (83% of 78 tumors)" — used in place of a smaller, less
      representative subsample (25 of 423 patients) in the TCGA/Brennan 2013
      cohort above, which predates TERT promoter sequencing being routine.
      83% is high enough that TERT promoter mutation is modeled as a second
      **trunk**-level entry alongside IDH-wildtype status, not a private-pool
      finding the way the task's own suggested placement implied — genuinely
      trunk-tier by this atlas's own established range (TP53 ~96%/~80% for
      HGSOC/TNBC, VHL 86.6% for ccRCC), confirmed directly that `trunk`'s
      shared rendering (`txMutGroup`) already `.forEach`s over the array, so
      two entries needed no new code.
    - **Snuderl et al., *Cancer Cell*, 2011** ("Mosaic amplification of
      multiple receptor tyrosine kinase genes in glioblastoma"; PMID
      22137795, not open access). Confirmed directly: "up to three different
      receptor tyrosine kinases (EGFR, MET, PDGFRA) amplified in single
      tumors in different cells in a mutually exclusive fashion" — the
      primary source for representing EGFR and PDGFRA as region-specific
      branch genes rather than population-level alternatives the way Lung's
      KRAS/EGFR/ALK/ROS1 are (data rule 3): the mutual exclusivity here is
      *spatial* (which region of one tumor), not *populational* (which
      patient), which is exactly why splitting them across regions rather
      than pooling them is the mechanistically correct choice, not just a
      convenient one.
    - **Sottoriva et al., *PNAS*, 2013** ("Intratumor heterogeneity in human
      glioblastoma reflects cancer evolutionary dynamics"; PMID 23412337,
      PMCID PMC3593922, not open access). Independently confirmed the same
      spatial-heterogeneity finding for PDGFRA specifically: in one real
      patient's tumor, "fragments T and T2 show no alterations, [while]
      focal gain and amplification are evident in fragments T3 and T4" —
      two independent papers confirming the same specific mechanism, not one
      citation doing double duty.
    - **ATRX loss, checked and excluded** (the task's own suggested private-
      pool candidate list included it): confirmed directly that ATRX loss is
      a defining marker of IDH-*mutant* astrocytoma specifically, part of
      the "early lineage-defining alterations (IDH1/2, ATRX, TP53)" in that
      lineage — not IDH-wildtype glioblastoma, which typically retains ATRX
      function. Including it here would have blurred the exact molecular
      boundary this organ's trunk-level classifier exists to draw. The
      clearest single mechanistic-fit catch in this pass, structurally the
      same mistake as HCC's AXIN1 but one step earlier: not "competes with a
      branch gene already in use," but "belongs to the other diagnostic
      entity this cancer's own trunk note explicitly distinguishes itself
      from."
    - **MGMT promoter methylation, deliberately excluded from the ledger and
      explained in prose instead** — the task asked for an explicit decision,
      not silent omission or an awkward fit. MGMT methylation status is the
      single strongest predictor of temozolomide response in real GBM
      management, but it is an epigenetic silencing mark, not a DNA
      mutation, and this atlas's mutation ledger (`gene`/`class`: driver or
      passenger/`ccf`/`note`) has no schema slot for a change that isn't
      genetic — confirmed directly that the badge CSS only styles `.driver`
      and `.passenger`, so any other `class` value would render unstyled
      rather than actually representing a third real category. Explained in
      the IDH-wildtype trunk note's own prose instead, where a user reading
      "what defines this tumor" would naturally encounter it.
    - **Price et al. (CBTRUS), *Neuro-Oncology*, 2025** ("CBTRUS Statistical
      Report: Primary Brain and Other Central Nervous System Tumors
      Diagnosed in the United States in 2018-2022"; PMID 41092086, not open
      access). Confirmed directly: glioblastoma "13.7% of all tumors and
      52.2% of all malignant tumors"; meningioma "42.6% of all tumors." The
      report's own abstract gives gliomas overall as 22.2% of all tumors but
      does not separately break out astrocytoma or oligodendroglioma — after
      repeated attempts to find an individually-verified split (including
      checking two earlier CBTRUS report years for a more granular table),
      none was found, so both are stated as sharing the remaining ~8.5%
      rather than a fabricated-looking precise split. Meningioma is listed
      in this organ's cancer list despite arising from the meninges, not
      brain tissue itself — the same "real primary tumor of this organ
      system, different cell of origin" treatment HCC's cholangiocarcinoma
      listing already established.
15. **A third, distinct site-model can exist for a different reason than the
    one that produced the second — check per organ, don't assume only two
    patterns exist now.** GBM's departure (rule 7) was "real distant
    metastasis is too rare to model — the four 'sites' should be intratumor
    regions of one mass instead." Prostate acinar adenocarcinoma required a
    different check entirely: this cancer DOES metastasize in a clinically
    real, bone-dominant way (Bubendorf et al., *Human Pathology*, 2000 — 90%
    of hematogenous metastases in a 1,589-patient autopsy series, confirmed
    directly) — that is not what makes this organ a departure. The real
    departure is that prostate adenocarcinoma is genuinely **multifocal**,
    with separate tumor foci in the same gland arising from **independent
    clonal origins** rather than one tumor spreading locally (Fontugne et
    al., *JCI Insight*, 2022 — 76.5% of specimens have ≥2 foci, confirmed
    directly). This atlas now has three distinct real site-models, not two:
    real anatomical spread (HGSOC/TNBC/LUAD/ccRCC/HCC), intratumor regions of
    one contiguous mass (GBM), and independently-arising multifocal origins
    within one organ (Prostate acinar adenocarcinoma) — each got its own
    `regionWord` (default `'site'`, `'region'` for GBM, `'focus'` for
    Prostate). **Check which of these three (or a fourth, not yet seen)
    actually applies to any future organ's own literature before defaulting
    to any of them** — real distant-metastasis sites is still the most
    common case (five of seven organs so far), not a fallback to avoid just
    because two exceptions now exist. Two related corrections this pass
    also needed, same "verify, don't assume the task prompt's citation or
    anecdote holds up" standard as every prior organ:
    - **Authorship correction**: the task's suggested "Boutros et al.,
      *Nature Genetics*, 2015" is not a real first-author paper. The actual
      paper is Cooper CS, Eeles R, Wedge DC, Van Loo P, Gundem G, et al.
      (*Nature Genetics*, 2015, PMID 25730763, PMC4380509) — Boutros and
      Fraser are among 50+ coauthors. Same pattern as ccRCC's
      Nickerson→Moore correction (rule 12).
    - **A claim that directly contradicts a real finding, not just thin
      evidence, gets dropped outright**: "MYCL amplification with TP53 loss"
      does not appear in the real Cooper et al. 2015 paper at all, and TCGA's
      own prostate paper (Cancer Genome Atlas Research Network, *Cell*, 2015,
      PMID 26544944, PMC4695400) explicitly states "we found no focal,
      clonal MYCL amplifications...in either data set nor in a separate set
      of 63 untreated prostate cancer samples" — a direct contradiction.
      Dropped entirely, no substitute needed, the cleanest rejection this
      atlas has had.
    - **An unverifiable specific anecdote, replaced with real population-
      level data**: the task's suggested "documented case of one ERG+ focus
      adjacent to a SPOP-mutated focus" does not appear in Cooper et al.
      2015 or any later multifocality paper checked — that paper actually
      documents the opposite kind of finding, *convergent* ERG evolution
      across independently-arising clones, explicitly stating "we did not
      see convergent evolution for other potential driver genes." Replaced
      with real, corroborated discordance data instead: Fontugne et al.
      (2022) found 59.7% (139/233) of multifocal specimens had discordant
      ERG/SPINK1 status between foci, corroborated by Cyrta et al. (*J
      Pathol*, 2022, PMID 35220606) and Segura-Moreno et al. (*Cancer
      Reports*, 2023, PMID 36199157); Mehra et al. (*Cancer Research*, 2007,
      PMID 17804708) found the ERG-specific figure (21/30, 70%, discordant
      between foci). Same move as swapping the unverifiable Foulkes et al.
      2010 citation for Gao/Kennecke on the TNBC pass (rule 10) — don't force
      an unconfirmed secondhand claim, substitute real data that supports the
      same real point.
16. Prostate/acinar adenocarcinoma reference sources — **every citation in
    this section was verified directly at the source before being written
    into the app.** This organ needed the third site-model check (rule 15)
    before any data-sourcing work started, plus a genuinely different
    mechanistic-fit question from every prior organ: two branch genes with a
    *soft*, one-sided cooperating relationship (not the hard mutual-
    exclusivity of rule 3's competing-driver model or the AXIN1/NF1/RB1/
    PIK3CA exclusions) are safe in a shared private pool, the same way HCC's
    ARID1A/ARID2/NFE2L2 already were — checked explicitly rather than
    defaulting to exclusion just because a cooperating relationship exists.
    - **Cooper et al., *Nature Genetics*, 2015** ("Analysis of the genetic
      phylogeny of multifocal prostate cancer identifies multiple independent
      clonal expansions in neoplastic and morphologically normal prostate
      tissue"; PMID 25730763, PMC4380509, open access). The real paper behind
      the task's "Boutros et al." misattribution (see rule 15). Confirmed
      directly: documents independent clonal origins across foci in the same
      gland as real, and a real complication — convergent evolution of ERG
      rearrangements specifically across separately-arising clones, with no
      such convergence found "for other potential driver genes." Does not
      mention MYCL at all, and does not contain the task's suggested
      ERG+/SPOP-adjacent-foci case.
    - **TCGA (Cancer Genome Atlas Research Network), *Cell*, 2015**
      ("The Molecular Taxonomy of Primary Prostate Cancer"; PMID 26544944,
      PMC4695400, open access). Confirmed directly: SPOP mutation ~10-11%,
      "Tumors defined by SPOP mutations were mutually exclusive with all ETS
      fusion-positive cases" — the source for this organ's two mutually-
      exclusive branch genes (TMPRSS2-ERG fusion / SPOP mutation). Also
      confirmed PTEN homozygous deletion ~15-17% with "the preponderance of
      PTEN deletions in ERG fusion-positive cases" (a real, *differential*
      enrichment, not an absolute exclusivity claim — safe for the shared
      private pool for that reason), CHD1 deletion associated with the
      SPOP-mutant subtype specifically (no overall cohort-wide percentage
      extractable), and the explicit MYCL null finding used to drop that
      candidate (rule 15).
    - **Fontugne et al., *JCI Insight*, 2022** (PMID 35050902, PMC8876549,
      open access). Confirmed directly: 76.5% (251/328) of radical
      prostatectomy specimens had ≥2 separate tumor foci — this organ's
      trunk `ccf` figure; 59.7% (139/233) of multifocal specimens had
      discordant ERG/SPINK1 status between foci — the population-level
      discordance data that replaced the unverifiable task-suggested
      anecdote (rule 15). Also the source for SPINK1's confirmed mutual
      exclusivity with ERG fusion status, which is why SPINK1 — despite
      being on the task's own suggested gene list — was checked and
      excluded from the shared private pool the same way AXIN1/NF1/RB1/
      PIK3CA were: it competes with a branch gene already in use (ERG),
      and the private pool draws onto every focus's cells regardless of
      that focus's branch.
    - **Mehra et al., *Cancer Research*, 2007** (PMID 17804708). Confirmed
      directly: 21/30 (70%) of rearranged multifocal cases showed discordant
      ERG status between foci — the specific ERG-only discordance figure
      used in the ERG branch note, distinct from Fontugne's broader
      ERG/SPINK1-combined figure above.
    - **Cyrta et al., *J Pathol*, 2022** (PMID 35220606) and **Segura-Moreno
      et al., *Cancer Reports*, 2023** (PMID 36199157) — both confirmed
      directly as independent corroboration of Fontugne's interfocal
      discordance finding, not one citation doing double duty.
    - **Chen et al., *Nature Cancer*, 2025** (PMID 40360905). Confirmed
      directly: "Concurrent genetic alterations in SPOP and CHD1 define a
      unique subtype of PCa" — independent corroboration of TCGA 2015's
      SPOP/CHD1 association, used in the CHD1 private-pool note.
    - **Siech et al., *Annals of Surgical Oncology*, 2026** (PMID 41718902,
      PMCID PMC13179204). Confirmed directly from the full text: of 427,055
      SEER patients, 425,692 (99.68%) harbored acinar, 855 (0.20%) ductal,
      324 (0.08%) mucinous, 54 (0.01%) signet ring cell, and 130 (0.03%)
      neuroendocrine carcinoma — the source for this organ's cancer-list
      subtype breakdown, deliberately stated as the lopsided real split it
      is rather than forced into false symmetry with every other organ's
      more balanced multi-way splits (HGSOC/LUAD/HCC/GBM).
    - **Bubendorf et al., *Human Pathology*, 2000** (PMID 10836297,
      1,589-patient autopsy study). Confirmed directly: "hematogeneous
      metastases were present in 35% of 1,589 patients with prostate cancer,
      with most frequent involvement being bone (90%), lung (46%), liver
      (25%), pleura (21%), and adrenals (13%)" — the real, verified source
      behind the commonly-repeated bone-dominance figure, deliberately NOT
      built into a fourth drill-down level (this organ's site map already
      represents something else — independent multifocal origins, not
      distant spread — and forcing a real, well-sourced fact in anyway would
      have diluted that departure rather than supporting it) but
      acknowledged in a line of prose in the trunk note instead, so the real
      fact isn't simply unused.
    - **Standard prostate zonal anatomy** (peripheral zone ~70% of gland
      volume/~75% of cancer origin, central zone surrounding the ejaculatory
      ducts, transition zone surrounding the urethra and the site of BPH) —
      StatPearls, "Anatomy, Abdomen and Pelvis, Prostate" (NCBI Bookshelf
      NBK540987, PMID 31082031), confirmed directly, same no-individual-
      citation-fetch treatment as every other organ's basic anatomy facts
      except where a figure was specifically flagged for verification.
17. Colon/colorectal adenocarcinoma reference sources — **every citation in
    this section was verified directly at the source before being written into
    the app. This organ contributes a FOURTH mutation-framing model (standing
    note): a real but MODEST statistical anti-correlation, strictly between
    rule 3's hard *competing* exclusivity and simple independence.**
    - **THE KRAS×TP53 ANTI-CORRELATION (standing constraint for this organ):**
      KRAS and TP53 are individually two of CRC's commonest mutations but
      co-occur LESS than chance predicts — pooled OR 0.69 (95% CI 0.51–0.95,
      p=0.02, n=638 across nine studies; Domingo et al., *J Pathol*, 2013,
      Supplementary Table S4, read from the actual deposited xlsx, not the
      abstract), multivariate OR 0.55–0.56 in the VICTOR cohort. It is NOT
      exclusivity: ~17% of tumors carry both, 8 of the 9 pooled studies were
      individually non-significant, and in metastatic surgical cohorts
      RAS/TP53 co-mutation is a recognized adverse subgroup at ~28–31% (Chun
      et al., *Ann Surg*, 2019, N=401). Design consequence, applied and to be
      preserved: KRAS and TP53 are branch genes of DIFFERENT sites (separate
      subclones), NEITHER may ever be added to this cancer's shared private
      pool, and both notes state the statistic with its size. The same tables
      supply the two calibration contrasts wired into the notes: KRAS×BRAF is
      near-total exclusion (OR 0.02; 1 of 303 KRAS-mutant tumors, p=2e-16) —
      **BRAF must never appear anywhere in this cancer's ledger**, same
      standing class as LUAD's EGFR rule — and KRAS×PIK3CA is strong
      CO-occurrence (OR 4.0, P=4.4e-11), which is what makes PIK3CA safe as a
      coexisting branch. PIK3CA is also negatively associated with TP53 (OR
      0.36) — second reason both live at their own sites, not in the pool.
    - **Trunk: APC** — 81% of non-hypermutated vs 51% of hypermutated CRC
      (TCGA, *Nature*, 2012; 16% of CRCs are hypermutated — the qualifier is
      mandatory); WNT pathway altered in 93%. **Citation-trail correction the
      task's own brief needed:** Fearon & Vogelstein (*Cell*, 1990) NEVER
      names APC (the gene was cloned in 1991; the paper says "the familial
      adenomatous polyposis gene on chromosome 5q") and its own section
      heading is "Accumulation, Rather Than Order, Is Most Important" —
      APC-comes-first cites Powell et al. (*Nature*, 1992: present in adenomas
      "as small as 0.5 cm," frequency constant across progression); TP53-late
      cites Vogelstein et al. (*NEJM*, 1988: 17p loss "usually lost only in
      carcinomas," 75%).
    - **Liver-metastasis figures — the highest-stakes correction of this pass;
      the task brief's numbers were effectively swapped and inflated.** The
      brief said ~25% at presentation rising toward ~50% lifetime. Verified:
      synchronous liver metastasis is **14.0–17.7%** across five national
      registries (Johannsen et al., *JAMA Netw Open*, 2025, Denmark N=72,722;
      Reboux et al., 2022, France N=26,813 — whose Discussion explicitly
      rebuts higher figures; Engstrand et al., 2018, Sweden; Hackl et al.,
      2014, Germany; Manfredi et al., 2006, Burgundy), and 5-year cumulative
      incidence is **~20–27%** — the ~50% figure is rejected in print ("the
      incidence of CRCLM was lower than the 50% often cited in the
      literature," Engstrand et al., *BMC Cancer*, 2018). Portal-venous
      mechanism confirmed (Wong et al., 2022; Imai et al., 2019).
    - **Sites (one source, one denominator):** Riihimäki et al. (*Sci Rep*,
      2016, PMID 27416752, Swedish national cohort, N=49,096): among
      metastatic colon-cancer patients, liver 70%, thorax 32%, peritoneum 21%,
      nervous system 5%. The denominator ("of the ~30% with recorded
      metastases") is stated in-product per note — mixing it with all-patient
      rates is exactly how the debunked "half get liver mets" figure
      propagates. Supplementary: Segelman et al. (*Br J Surg*, 2012) 8.3%
      peritoneal carcinomatosis of all patients; Christensen et al. (2016)
      brain 1.55% pooled; Qiu et al. (2015) SEER at-diagnosis rates.
    - **Branch frequencies:** KRAS ~35–45% (34% stage II/III Domingo; 44%
      metastatic MSS Yaeger et al., *Cancer Cell*, 2018 — cohort stage, not
      disagreement); TP53 60% non-hypermutated/20% hypermutated (TCGA)/78%
      metastatic MSS (Yaeger); SMAD4 has NO canonical figure — 8.6% full
      sequencing (Fleming et al., 2013, n=744) to 12% hotspot panel (Mehrvarz
      Sarshekeh et al., 2017 — a PLoS One author-name-only erratum exists,
      checked, no data corrected) to 16.2% metastatic (Wang et al., *Cancers*,
      2022, PMID 35892903 — NOT 35892997, a wireless-sensor-network paper;
      caught at verification), stated as an assay/cohort range; PIK3CA 14–15%
      (91/590 population-based Nosho et al., 2008; 105/757 Rosty et al., 2013;
      hotspot mechanism Ikenoue et al., 2005).
    - **Private pool (dedicated verification pass + two literature sweeps):**
      FBXW7 (11% nHM, TCGA Fig 1b), TCF7L2 ("deleted or mutated in 12%",
      TCGA; 9% mutation-only), AMER1/FAM123B (7%, TCGA) — all three have
      PUBLISHED positive APC co-occurrence (Cornish et al., *Nature*, 2024,
      2,023 genomes: +0.086**, +0.066*, and SOX9 +0.081**; Li et al., *Cancer
      Science*, 2025, n=6,530: APC–KRAS–FBXW7–AMER1 named as an MSS
      co-occurrence set). **SOX9 checked and EXCLUDED** — no published
      constraint, but direct computation on three cohorts' deposited data
      found a TP53 anti-correlation that replicates and survives Bonferroni
      (pooled OR 0.32, p<0.0001) — same conflict class as HCC's AXIN1, caught
      by computation instead of citation. **ARID1A excluded** (~5% MSS vs ~34%
      MSI — any mixed figure is contaminated — and not among the 96 dNdScv
      drivers in Nunes et al., *Nature*, 2024). TCGA's FBXW7-metastasis
      "never co-occurred (P=0.0019)" claim was investigated: the absolute
      reading is refuted (FBXW7 in 5.7% of 476 resected liver metastases,
      Kawaguchi et al., 2021), a relative depletion directionally replicates.
      **Timing honesty (recorded decision):** Nunes et al. (*Nature*, 2024)
      times TCF7L2/FBXW7/SOX9 as EARLY/clonal — the private tier here
      illustrates per-cell heterogeneity, not late timing, and the FBXW7 note
      says so; the documented late/subclonal genes (TRPS1, GNAS, CEP170) have
      figure-only frequencies and unchecked constraints and were not used.
    - **Anatomy:** ~5 ft (StatPearls NBK507857) / ~1.5 m (Skok et al., 2025) /
      3–5 ft range (Santucci & Velez, 2024) — range stated; six-segment
      sequence needs two chapters (NBK507857 omits the rectum; NBK470577
      completes it); 1–2 L chyme → 200–250 mL feces (the one self-contained
      water figure — the "up to 5 L/day" capacity figure from the same source
      measures something else and is deliberately not shown beside it);
      SMA/IMA watershed kept soft ("near the splenic flexure") because
      sources genuinely disagree (StatPearls: splenic flexure; an
      embryological source: distal third of transverse colon). Hotspot set =
      the verified-strongest four: mucosa/glandular epithelium (origin:
      Zheng et al., 2020 + ~85% CIN/APC framing, Drage & Mino-Kenudson,
      *Cells*, 2026), crypts of Lieberkühn (~15 million, ~2,000 cells each,
      stem-cell niche — same source), teniae coli & haustra (StatPearls
      spelling "teniae"; causal link from Santucci & Velez), muscularis
      propria (cited via AJCC T2/T3 staging, the clean route — the bare
      anatomical term was uncited anywhere).
18. Pancreas/PDAC reference sources — **every citation verified directly at
    the source. This organ is the atlas's THIRD temporal trunk (see rule 5)
    and its cascade carries a mandatory modern caveat.**
    - **Two wrong PMIDs in the task brief caught before shipping:** Hruban
      progression model is PMID 10955772 (11106242 is a Wilms'-tumor paper;
      the Hruban paper itself is inaccessible — AACR 403, no PubMed abstract —
      so the classical model is attested via Notta 2016, which states it
      verbatim); Iacobuzio-Donahue SMAD4/metastasis is PMID 19273710
      (19581604 is a CMAJ cardiovascular-spending paper).
    - **Trunk: KRAS 93%** (140/150, TCGA/Raphael et al., *Cancer Cell*, 2017,
      hotspots at ~30,000x depth; "90% to 95%", Wood et al., 2022; "near
      ubiquitous", Waddell et al., *Nature*, 2015) — the most near-universal
      ONCOGENE trunk in the atlas (HGSOC's TP53, a tumor suppressor, reaches
      ~96%; worded that way in-product rather than overclaiming "cleaner than
      TP53"). Temporal: flat at ~92–95% from PanIN-1A onward (Kanda et al.,
      2012, pyrosequencing 92.0/92.3/93.3/95.4% by grade; Hosoda et al.,
      2017) — the old rising gradient (36→44→87%, Löhr 2005) was an
      assay-sensitivity artifact; never reintroduce it.
    - **The classical cascade is real but NOT four ordered steps (standing
      note):** Notta et al. (*Nature*, 2016) states the model verbatim —
      "KRAS, followed by CDKN2A, then TP53 and SMAD4" — then refutes its
      universality: "neither gradual nor follows the accepted mutation
      order"; "Two-thirds of tumours harbour complex rearrangement patterns
      ... consistent with punctuated equilibrium ... the simultaneous, rather
      than sequential, knockout of canonical preneoplastic genetic drivers."
      Safe form (used in-product): a relative THREE-tier ordering — KRAS
      earliest; CDKN2A early-to-intermediate (already lost in 30% of
      PanIN-1A, Wilentz 1998 — the tiers OVERLAP); TP53 and SMAD4 late
      (grouped by every source: Wilentz 2000, Hosoda 2017, Maitra 2003) —
      labeled the CLASSICAL model with the Notta caveat alongside. Not safe:
      four discrete steps, rising per-grade frequencies, non-overlapping
      tiers, or sequential-acquisition as the universal mechanism.
    - **Counting-rule discipline (both wide ranges are method, not
      contradiction, and each ccf string states its rule):** CDKN2A 35%
      (mutations+SVs, Waddell 2015) to 98% (Rb/p16 pathway incl. promoter
      hypermethylation, Schutte 1997); SMAD4 31% (mutations+SVs, Waddell) vs
      ~50% classical incl. homozygous deletion — deletion is the DOMINANT
      mechanism (25/84, Hahn et al., *Science*, 1996). TP53 70–74% (Redston
      1994; Waddell 2015 — two cohorts 21 years apart converging).
    - **SMAD4 metastasis association worded precisely:** Dpc4 status "highly
      correlated with the presence of widespread metastasis but not with
      locally destructive tumors (P = .007)" in 76 rapid autopsies
      (Iacobuzio-Donahue et al., *J Clin Oncol*, 2009) — "associated with,"
      never "drives."
    - **Excluded from the private pool: BRAF, GNAS, CTNNB1** — TCGA 2017
      analyzed the 10 KRAS-wild-type tumors and found them concentrated there
      as ALTERNATIVE drivers (6/10 carried an alternative RAS-MAPK
      activator). GATA6/MYC amplification: real, but NO citable percentage —
      left out entirely. Pool used (all verified): KDM6A 18%, RNF43 10%,
      PREX2 10% (all Waddell 2015, 100 whole genomes), TGFBR2 4.1% (Goggins
      1998), BRCA1/2 5–10% (Wood 2022; TCGA germline).
    - **Sites (Oweira et al., *World J Gastroenterol*, 2017, SEER 2010–2013,
      N=13,233 stage IV at diagnosis):** liver 76%, lung 19.9%, distant
      lymph nodes 9.4% — presentation frequencies, sum >100% because 33.7%
      multi-organ. **Peritoneum modeled with NO number** because the source
      says so itself ("peritoneal deposits ... not detailed in the SEER
      database") — same honesty class as LUAD's adrenal gland. Yachida et
      al. (*Nature*, 2010) timing confirmed: 11.7 y initiation→parental
      clone, +6.8 y→metastatic seeding, +2.7 y→death (7-autopsy series plus
      model; stated with that caveat).
    - **Anatomy:** divisions are head/neck/body/tail with the uncinate
      process part of the head, NOT a fifth division (StatPearls NBK532912 +
      Pancreapedia agree); two-thirds of PDACs arise in the head (StatPearls
      NBK518996, verbatim); exocrine mass is a LIVE source conflict —
      Pancreapedia ">95%" vs StatPearls "~80%" — stated in-product as a
      discrepancy (HCC bone-figure precedent); "arises from the ductal
      epithelium via PanIN precursors" is safe, but the CELL of origin is
      explicitly controversial (acinar-to-ductal metaplasia — Wood 2022), so
      the duct hotspot's wording claims the epithelium and the precursor,
      never the founding cell type.
19. Stomach/diffuse-type gastric adenocarcinoma reference sources — **every
    citation verified directly at the source. The organ's cancer list IS the
    Lauren classification, and the wired subtype is a deliberate, recorded
    choice.**
    - **The circulating Lauren split "54/32/15" is a MIS-CITATION CHAIN,
      rejected:** Hu et al. (2012) cites Polkowski et al. (1999) — a
      41-patient ESOPHAGEAL/GEJ cohort whose real figures are 54% intestinal
      / 32% MIXED / 15% DIFFUSE; the diffuse and mixed values were transposed
      en route and applied to the wrong organ (the 54+32+15=101% rounding
      artifact is the tell). Real figures used: KGCA 2009 nationwide surgical
      survey (N=14,658, *J Gastric Cancer*, 2011): intestinal 50.0% / diffuse
      39.0% / mixed 10.9%; Dutch population data (van der Kaaij et al., 2020,
      N=32,312): 55%/44%. Cross-series ranges: 46–57 / 22.5–44 / 11–21%.
      Do not use SEER for Lauren shares (two SEER studies disagree wildly and
      exclude mixed by design).
    - **Why diffuse is the wired type (recorded decision):** its driving
      lesion — E-cadherin/cell-adhesion loss — is a mechanism class no other
      atlas cancer has; the CDH1 → discohesion → signet-ring → linitis
      plastica chain is verified end to end; its slide is genuinely distinct
      (intestinal-type is BY DEFINITION "similar to intestinal
      adenocarcinoma" — a colon-slide repeat); and intestinal incidence is
      falling while diffuse holds/rises.
    - **Trunk: CDH1 inactivation** — 37% of TCGA's genomically-stable subtype
      (which is 73% diffuse-type, P=7.5e-17 — TCGA, *Nature*, 2014); 56.3%
      somatic mutation in sporadic diffuse (9/16, and 0/7 intestinal —
      Machado et al., *Oncogene*, 2001) + promoter hypermethylation as the
      second, non-mutational route (56.3% same series; the "second hit" in
      >half of mutation carriers — Grady et al., *Nat Genet*, 2000); germline
      = HDGC (Guilford et al., *Nature*, 1998; Blair et al., *Lancet Oncol*,
      2020). NOT near-universal — trunk in the LUAD-KRAS sense
      (subtype-defining driver), stated in the ccf string.
    - **Branch pair: RHOA mutation and CLDN18–ARHGAP fusion — strict
      TCGA-stated mutual exclusivity** ("The CLDN18–ARHGAP fusions were
      mutually exclusive with RHOA mutations and were enriched in genomically
      stable tumours"; 15% + 15%, together 30% of the subtype) — split two
      sites each, the GBM EGFR/PDGFRA architecture. Do not extend the
      exclusivity to CDH1 (a review asserts the trio; TCGA documents only the
      pair).
    - **Excluded, each for a verified molecular-subtype reason:** ARID1A (83%
      MSI / 73% EBV vs 11% non-EBV/MSS — wrong subtypes — AND "negatively
      associated with mutations in TP53", Wang K et al., *Nat Genet*, 2011,
      with TP53 in this pool); PIK3CA (EBV-defining, 80%); RNF43
      (MSI-associated); ERBB2/CCNE1-class amplifications (CIN =
      intestinal-side). Private pool used: TP53 ~50% overall (van Beek et
      al., 2018 — placed with the precise note that its home subtype is CIN
      at 71%, not diffuse; sequencing shows no Lauren-axis association
      either way), APC and SMAD4 (TCGA's 25 significantly mutated gastric
      genes; no clean subtype percentage → none shown).
    - **Claims checked and NOT used:** "diffuse is more common in women" —
      NOT CONFIRMED (incidence M/F 1.07 vs intestinal 2.65, Derakhshan et
      al., *Gut*, 2009; diffuse is sex-EQUAL); "TP53 defines the intestinal
      type" — contested on the Lauren axis across three sources (clean only
      on the CIN molecular axis); a StatPearls sentence ("Intestinal-type
      cancers may be associated with signet-ring cells") that contradicts its
      own chapter and every other source — flagged as a source error; H.
      pylori is "equally associated with the intestinal or diffuse type"
      (Huang 1998) — only the Correa CASCADE is intestinal-specific.
    - **Sites (Riihimäki et al., *Oncotarget*, 2016, N=7,559):** among
      metastatic patients — liver 48%, peritoneum 32%, lung 15%, bone 12%,
      with the diffuse-relevant flip stated in-product: signet-ring histology
      shifts to peritoneum (58% vs 28%, OR 2.3) and away from liver (16% vs
      53%, OR 0.3) and lung (OR 0.4). Zheng et al. (2008, N=814): peritoneal
      spread 10.0% diffuse vs 3.4% intestinal. Thomassen et al. (2014):
      peritoneal carcinomatosis in 14% of ALL patients. **Lymph nodes are
      real but deliberately NOT a modeled site** — the source explicitly
      excluded nodal metastases from its distribution, so no citable
      percentage exists (PDAC's-peritoneum honesty class, resolved the
      opposite way because four quantified sites exist). **Krukenberg tumor**
      (ovary) carried in the Bone site's note: two-thirds of cases have
      stomach primaries (Kiyokawa et al., 2006, N=120); non-intestinal
      Lauren type OR 3.4 and signet-ring components OR 3.3 (Li et al., 2020,
      N=1,696 women); no site-distribution percentage citable (registry
      groups ovary into "other").
    - **Anatomy:** five regions citable (two PMC sources verbatim) with
      StatPearls' four-region variant flagged in-product; J-shape is Gray's
      1918 verbatim (with its own "no one form can be described as typical"
      caveat); dimensions from Cunningham 1905 (25–27.5 cm distended length,
      10–11.2 cm greatest diameter, 7.5–12.5 cm cardia–pylorus chord) and
      Gray's (greater curvature 4–5x the lesser); capacity: measured MRI
      empty volumes (25±18 mL Grimm 2018; 35±7 mL Mudie 2014 — the folkloric
      "~50 mL" was checked and NOT found citable), 2–3 L StatPearls, ~4 L
      OpenStax; the inner oblique muscle layer "is unique to the stomach"
      (StatPearls NBK482334, the organ's distinguishing-fact slot); origin =
      "arises from the glandular epithelium of the gastric mucosa" (World J
      Surg Oncol, 2009). **Gastric SEROSAL color: an honest gap** — no
      fetchable source states it in words; the mesh color is a flagged
      inference from continuous GI serosa descriptions (colon "pink-tan and
      smooth", Cureus 2022), recorded in stomach.js and here — and, after
      the first review round asked for it, USER-FACING too: one sentence in
      the #disclaimer sources panel and a closing note in the Stomach organ
      description itself (data rule 2's say-what's-illustrative standard,
      applied to a material color for the first time).
20. Skin/cutaneous melanoma reference sources — **every citation verified
    directly at the source (four dedicated verification passes before any
    build work: anatomy/subtypes, genomics, metastatic pattern, histology/
    layer-colors). This organ is a structural departure on a NEW AXIS — organ
    representation, not the site model (do not conflate it with GBM's or
    Prostate's departures, which are about what the four cancer-screen blobs
    mean):** skin is the first organ that is not a discrete organ mass, so
    its organ screen is a schematic layered CROSS-SECTION BLOCK (epidermis /
    pigmented basal band / dermis / hypodermis, undulating rete-ridge
    junction, hair follicles with emerging shafts), while its cancer screen
    uses the ORDINARY real-distant-metastasis site model (family 1, like
    eight of the other ten cancers — melanoma metastasizes hard; no
    `regionWord`). Decided at a pre-build checkpoint with the reviewer, like
    Prostate's gland-vs-ducts and the Stomach asset question.
    - **A NEW asset-rejection class, third in the taxonomy** (not "no asset
      exists" — Ovary/Stomach — and not "license regime" — Open Anatomy):
      **structurally unsuitable real asset.** The HRA publishes whole-body
      Skin reference organs (3DPX-020986 Female / 3DPX-021016 Male, CC BY
      4.0, Visible Human-derived). The female GLB was downloaded (12,246,132
      bytes) and its JSON chunk parsed directly: ONE mesh, 191,322 vertices,
      no sub-structure, bbox 0.97×1.67×0.33 m — a body-shaped outer-surface
      shell with zero layer information. Rejected on measurement: the organ
      screen's whole job for melanoma is the layered structure (melanocyte
      location, Breslow depth), which a shell cannot show, and a second
      full-body figure would duplicate the body screen the user just left,
      at 8.3x the size of the entire female body model. Kept on file if a
      whole-body distribution view is ever wanted.
    - **Sex-differentiated body marker — the first organ whose marker sits
      at a DIFFERENT place per sex, and it is registry data:** "the trunk
      was the most common location in men (range 31%-58%) and the lower
      limbs and hips in women (26%-40%)" (Di Carlo et al., CONCORD-3,
      Eur J Cancer, 2025, N=1,578,482, 59 countries — verbatim). Male
      marker: upper anterior chest (0.78/+33 — front-visible by review
      decision; hotspot dots are DOM overlays with no occlusion culling but
      the 3D anchor sphere IS depth-occluded, so a back anchor would be the
      one marker whose sphere hides at the default view; the anterior trunk
      is equally inside the verified category). Female marker: lower leg
      (0.17/+75). Mechanism: `markerSpec.points[]` entries may now carry an
      optional `sexes` filter (one-line, backward-compatible body.js
      change). **The leg marker's side-on angle is geometric necessity:**
      findBodySurfaceAnchor's ray passes through the body's central axis,
      and at calf height the legs straddle it — a front-on ray threads the
      gap and misses (the colon pass's thigh-gap trap in pure form); only a
      near-side-on ray (≳60°) intersects the near leg. The placement
      asymmetry is explained to the user in the organ description.
    - **Trunk: BRAF V600E + TERT promoter (two entries, GBM precedent),
      honestly framed as NOT near-universal:** BRAF 52% (TCGA, Cell, 2015,
      N=318), real cohort range 43–70% (Colombino 2012 primaries 43%; Jakob
      2012 47% of 677; Haluska 2006 ~60–70% of SSM) — stated in the ccf
      string, never rounded to look like PDAC's KRAS. V600E = ~72% of BRAF
      mutations (Jakob's printed 71.9%). Earliest event: "the earliest and
      most common genetic alteration in human melanoma" (Dankort 2009,
      verbatim); 82% of benign nevi carry it (63/77, Pollock 2003 — which
      writes **V599E**, the pre-renumbering name; quote it as written or
      flag the renumbering, never silently modernize). TERT promoter:
      **75% of the BRAF subtype specifically** (39/52, TCGA Table 1), 71%
      of the Huang 2013 discovery cohort; C228T/C250T are mutually
      exclusive UV-signature C>T transitions at a dipyrimidine motif
      (Huang, verbatim) — the atlas's fourth temporal-trunk instance (rule
      5) and its SECOND organ whose trunk gene is literally TERT: melanoma
      and HCC were flagged side by side in the same 2013 Huang screen (5/6
      melanoma, 4/6 HCC cell lines), a real cross-organ thread stated in
      the product text. Horn 2013's 33% is PRIMARY tumors vs 85% metastatic
      tissue in the same paper — a specimen-type difference, NOT
      discovery-vs-replication; never frame it as replication. Timing
      pillar: Shain et al., NEJM, 2015 (37-tumor evolutionary series,
      abstract verbatim): 77% of intermediate lesions/melanomas in situ
      carry TERT promoter mutations; benign lesions harbor BRAF V600E
      exclusively; "Biallelic inactivation of CDKN2A emerged exclusively in
      invasive melanomas"; PTEN and TP53 "only in advanced primary
      melanomas."
    - **THE DEFINING HARD EXCLUSION — NRAS must never appear anywhere in
      this cancer's ledger** (the LUAD-EGFR standing class): 4 of 677
      tumors (0.6%) carried both BRAF and NRAS activating mutations —
      **source is Jakob et al., Cancer, 2012 (PMID 22180178), NOT Colombino
      as the task brief guessed** (Colombino's cohort is 291 tissues/132
      patients and reports no double-mutant figure; the attribution was
      traced through a citing review's reference list and verified in the
      primary). TCGA independently: exactly one double-mutant in 318,
      p < 1e-15. **The documented exception is real but CANNOT touch this
      tumor:** class 3 BRAF mutants (low-activity/kinase-dead — D594 etc.)
      DO co-occur with RAS because they require it; V600E is class 1,
      RAS-independent (Yao et al., Nature, 2017, Table 1 — per-variant,
      definitive). With V600E as trunk the exclusion is hard; the exception
      lives in the trunk note as prose (HCC rule-plus-exception precedent,
      resolved the opposite way: prose, not a modeled exception). Second
      documented route, also prose: treatment pressure — NRAS-mutant
      resistant subclones under BRAF inhibitors, "but not through secondary
      mutations in B-RAF(V600E)" (Nazarian 2010).
    - **Branch pair: CDKN2A loss + PTEN loss — COOPERATING (rule 4),
      verified for this cancer, not inherited:** PTEN loss positively
      co-occurs with BRAF (Tsao 2004: 80% of PTEN-altered lines also
      BRAF-mutant; TCGA: "PTEN mutations and deletions were more frequent
      in BRAF-mutant melanomas"; computed OR 3.39, p=3.1e-05 on the
      PanCancer re-processing, pipeline validated against six paper-stated
      figures first). Dankort 2009 mouse: BRAF V600E alone = benign
      hyperplasia that never progresses; + Pten silencing = melanoma "with
      100% penetrance, short latency and with metastases" — a branch
      mutation doing exactly what the model says. CDKN2A is
      subtype-orthogonal ("nearly evenly distributed across subtypes,"
      TCGA) and ~60% of the BRAF subtype counting mut/del/hypermethylation
      (Table 1; deletion-dominant — label it "loss," the LUAD/GBM
      convention). 15.6% of BRAF-hotspot tumors carry BOTH (computed) — the
      two-sites-each split reflects real co-occurrence. The NRASxPTEN
      exclusion trend's popular mechanism ("NRAS activates PI3K itself") is
      NOT verbatim anywhere fetched — sources say "epistatic" (Tsao) and
      RAS functions "portioned by mutations in the pathways lying
      downstream" (Haluska, whose three-way partition is the citable
      version: "In general, melanomas carry a mutated NRAS, a mutated BRAF,
      or concurrent BRAF and PTEN mutations").
    - **Private pool (ranked by verified safety): PPP6C R264C** (~10% BRAF
      subtype; "exclusively in tumors with mutations in BRAF or NRAS" —
      Krauthammer 2012, a documented co-occurrence REQUIREMENT, the
      cleanest profile in the atlas; UVB hot spot per Hodis), **ARID2**
      (~15% all-mutations / 7% LoF-only — two counting rules, both stated),
      **IDH1 R132** (~6%; the only candidate in all four TCGA subtype
      columns; same gene as GBM's diagnostic classifier, carrying no
      classifying weight here — the cross-organ echo is in the note),
      **TP53** (~10% of BRAF subtype with TCGA's own printed caveat "TP53
      wild-type in ~90% of BRAF subtype" stated in the ccf; late per
      Shain), **TTN passenger** (with melanoma's Alexandrov 2013 framing:
      UV/tobacco cancers "exhibited the highest prevalence" of somatic
      mutations — the atlas's heaviest mutation burden).
    - **Excluded, each for a verified reason:** NF1 (anti-correlated with
      hot-spot BRAF, p=1.93e-9 TCGA verbatim; alternative MAPK driver; also
      one of Yao's two class-3 partners — trunk-note prose only); KIT (0%
      on non-chronically-sun-damaged skin, Curtin 2006 verbatim; Triple-WT-
      defining per TCGA — belongs to the acral/mucosal/CSD forms, mentioned
      in the trunk note's site-variation prose); HRAS/KRAS (TCGA verbatim
      mutual exclusivity); RB1 (SOFT, mechanistic-fit class — TCGA Table 1
      lists it only in the NF1 column, and it duplicates CDKN2A's pathway;
      computed OR 0.67 p=0.39 NOT significant, so never record it as an
      exclusivity); **MAP2K1 — excluded for pathway redundancy and its
      BRAF/MEK-inhibitor resistance role, explicitly NOT exclusivity: the
      data trend TOWARD co-occurrence (computed OR 1.59, 16
      double-positives; the only contrary evidence is n=2 in Hodis).
      Recording MAP2K1 as "mutually exclusive with BRAF" would be
      unsupported — this is the atlas's first exclusion whose stated ground
      is redundancy while the statistics lean the other way**; RAC1 P29S
      (admissible but outranked: ~2x depleted in BRAF-mutant tumors,
      Krauthammer 12.5%-vs-6.2% verbatim, and documented as EARLY — cuts
      against per-cell private framing).
    - **Sites (Riihimäki et al., Cancer Med, 2018, PMID 30328287 — the
      same Swedish-registry group/infrastructure as the colon and stomach
      site sources; their all-cancers capstone is what covers melanoma;
      there is no melanoma-specific Riihimäki paper, checked against the
      author's full 47-item PubMed record):** N=4,923 metastatic melanoma
      patients; of metastatic patients, multi-site counting, EXTRANODAL by
      design. Verbatim sex-split: Nervous system 49% M / 44% F, Lung 41/39,
      Liver 29/27, Skin (distant) 18/22 — modeled as the four sites,
      mapping exactly onto AJCC-8 M1d/M1b/M1c/M1a (Gershenwald 2017).
      **Bone (18/16) is the stated omission** (skin outranks it in women,
      ties in men, and is the melanoma-distinctive site). **Distant lymph
      nodes: real, M1a-grouped, and carry NO number anywhere** — the
      frequency source excluded nodes by design and the one population
      study covering them (Abdel-Rahman 2018) is paywalled; stated in the
      Skin site note. "Nervous system" is ICD-10 C79.3/4, slightly broader
      than brain — stated, not silently renamed. The site name "Skin
      (distant)" carries the AJCC distinction in its note: distant
      skin/soft-tissue (M1a) is a different entity from satellite/
      in-transit disease (stage III, intralymphatic, Gershenwald verbatim
      definitions).
    - **Brain-predilection framing — the denominators are the whole game:**
      "highest rate per incident case" is FALSE (lung wins: 19.9% vs
      melanoma's 6.9%, Barnholtz-Sloan 2004); the verified claims shipped:
      among patients METASTATIC AT DIAGNOSIS melanoma has the highest
      proportion with brain mets of any primary (28.2%, Cagney et al.,
      Neuro Oncol, 2017 — **PMID 28444227; the task brief's 28666227 is a
      chromatography paper, caught before anything cited it**); nervous
      system is melanoma's own #1 site (Riihimäki, prose verbatim); 44% of
      advanced-melanoma trial patients developed brain mets (Davies 2011 —
      denominator is "regional or systemic metastatic" trial patients, not
      pure stage IV). The "~75% at autopsy" figure survives ONLY at review
      level (citation chains traced to secondary sources; the 2020
      review's "75%" cites Davies, whose own abstract says 44%) — carried
      in-product explicitly as a review estimate. AJCC-8's M1d category
      (CNS, new in the 8th edition) is cited as the staging-level evidence
      of brain's special status.
    - **Cancer list = the real skin-cancer landscape with the death
      asymmetry stated where users see it:** melanoma ~2% of skin cancers
      but >80% of deaths (NCI PDQ verbatim — **the commonly-repeated "~75%
      of skin-cancer deaths" is the WRONG number**, and the underlying
      mortality source is Weinstock 1991, old but still what NCI carries);
      BCC/SCC = 5,434,193 keratinocyte carcinomas in 3,315,554 US patients
      (2012, Rogers 2015) with **BCC:SCC treated ratio 1.0 in Medicare —
      the folkloric "BCC is 4x SCC" is NOT what the study found, do not
      ship it**; Merkel cell 0.7/100,000 (StatPearls). **Melanoma subtype
      shares carry a denominator trap, resolved in the share text:** "SSM
      ~70%" holds only among subtype-SPECIFIED melanomas (~50% of SEER
      records are NOS, Bradford 2009 stated outright; against ALL
      registrations SSM is 36%, CONCORD-3 2022). Shares shown are COMPUTED
      from Bradford's SEER-17 incidence rates (SSM 68.4 / NM 15.1 / LMM
      14.3 / ALM 2.1% of specified) — which corroborate the aging SEER
      Training Module's SSM/NM but CONTRADICT its LMM ~5% (real ~14%) and
      ALM ~8% (real ~2%); the module's "ALM = up to 70% of melanomas in
      Blacks" is superseded by Bradford's registry 36%. **Nodular = 15–20%
      of primaries but ~40% of melanoma deaths (StatPearls verbatim) — in
      the share text by review decision,** the TNBC-organotropism class of
      surfaced asymmetry.
    - **The acral equity fact (trunk-note prose):** ALM's absolute
      incidence is the SAME in Black and non-Hispanic White Americans (1.8
      per million person-years each, Bradford verbatim) — it dominates in
      darker skin by proportion (36% vs 1%) only because UV-driven subtypes
      are rarer; "sun exposure has not been shown to be a risk factor for
      ALM." The equivalence is documented for Black-vs-NHW specifically
      (Hispanic Whites higher at 2.5, Asian/Pacific Islanders lower at 1.1)
      — do not over-generalize it.
    - **Site-variation claims: Curtin 2005's circulating four-way BRAF
      split (59/11/23/11%) is UNVERIFIABLE** (NEJM paywall, no open-access
      restatement — the Foulkes 2010 failure mode) and is not used; its
      abstract's combined "81%... BRAF or N-RAS" IS verbatim-usable, and
      **Curtin 2006 (JCO, PMID 16908931) carries the whole site-variation
      claim verbatim** (BRAF/NRAS "commonly mutated in melanomas on
      intermittently sun-exposed skin," infrequent on acral/mucosal/CSD
      skin; KIT 39%/36%/28% there but 0% on non-CSD skin) — the citation
      used.
    - **Citation-trail defect worth remembering: TCGA 2015 itself
      mis-cites Pollock 2003 twice** (for BRAF/NRAS anti-correlation and
      for BRAF-PTEN co-occurrence; its only Pollock reference is the nevi
      paper, which addresses neither claim — reference list extracted and
      checked). Both claims are sound (TCGA measured them in its own
      cohort; both independently reproduced by computation) — cite TCGA's
      own data or Tsao/Goel, never TCGA's Pollock attribution. Same class
      as the prostate pass's Cooper-as-"Boutros" catch, one level deeper:
      a landmark paper's own reference list carrying the error.
    - **Histology (SSM depicted):** Breslow definition has three
      independent verbatim sources (PathologyOutlines "Invasive melanoma";
      Gontijo 2026; Asato 2024) and the superlative is "THE most important
      prognostic factor" — **"the SINGLE most important" is unsupported**
      (one source names ulceration as the other key indicator; worded
      accordingly). **The AJCC-8 paper (Gershenwald) contains NEITHER the
      granular-layer definition NOR the superlative** — verified by
      full-text search; cite it only for staging mechanics. **Solar
      elastosis is a lentigo-maligna background finding — SSM is low-CSD
      (PathologyOutlines classification), so the slide deliberately omits
      it.** Melanin's drawn brown is an assembled two-source inference
      (dusty/granular pigment + eumelanin "brown-black"), recorded in the
      skin.js histology comment. The task brief's Smoller PMID was off by
      one (16446714, not ...15 — a nevi paper); Smoller is not used as a
      quote source (paywalled, criteria not in abstract).
    - **Anatomy (block + facts):** three layers with 4-vs-5 strata
      distinction (StatPearls); epidermis avascular verbatim from OPENSTAX
      (StatPearls only implies it — attribute correctly); measured
      epidermal thickness 31.2–596.6 µm (Lintzeri 2022 meta-analysis, 133
      studies) vs the textbook "0.05–1.5 mm" (SEER Training Modules —
      tradition, its 1.5 mm palm figure ~2.5x the measured pooled max;
      both stated, labeled); dermis 1.5–4 mm rests on SEER alone (no
      dermal-thickness meta-analysis exists — checked); surface area
      1.5–2 m² (Jebbawi 2020); **"~15% of body weight" is UNCONFIRMABLE**
      (sources scatter 5–10% / one-sixth / ~2.7 kg — no percentage is
      claimed anywhere); melanocyte density 1,000–2,000/mm²,
      race-independent, 1:10 basal ratio vs 1:30–40 per epidermal melanin
      unit (Brenner 2008 + Cichorek 2013 — two different real ratios, do
      not merge); the skin-tone equity fact is double-sourced (Brenner
      verbatim + StatPearls Histology verbatim) and stated in the desc,
      the facts panel, AND the basal-band color choice. **Layer colors:
      dermis WHITE/ivory (Liu 2023 human graft prep, corroborated
      Heitzmann 2024; the conventional diagram PINK could not be verified
      in any fetched source and is deliberately not used — recorded in
      skin.js and the disclaimer); fat light-yellow (surgical figure
      captions — the weakest sourcing tier in this organ, flagged as
      such); surface tone = one mid-brown point on a real continuum,
      stated in-product.** De novo vs nevus-associated: 70.9%/29.1%
      (Pampena 2017 meta-analysis, I²=99% flagged — quote as "about").

21. Ovary/clear-cell carcinoma (OCCC) reference sources — **every citation
    verified directly at the source (four dedicated verification passes
    before any build work: ARID1A trunk, PIK3CA cooperation, spread
    pattern, histology/gene fit). Second wired cancer under one organ —
    HGSOC untouched; the architecture needed zero structural change, only
    data.** Trunk anchor: **ARID1A loss ~49% (205/421, Bolton, Clin Cancer
    Res, 2022 — the largest sequenced cohort), honest range ~40–65%;
    discovery figures 46% (55/119, Wiegand, NEJM, 2010) and 57% (24/42,
    Jones, Science, 2010), BOTH sequencing; biallelic 45.1% (46/102, Chao,
    BMC Cancer, 2024, PMID 39543535, PMC11566382).** The atlas's FIFTH temporal trunk and the first
    documented in a benign precursor: ARID1A protein absent from the
    endometriotic cyst lining in DIRECT CONTINUITY with the carcinoma in
    31/31 informative cases while distant endometriosis retains it (Ayhan,
    Int J Gynecol Cancer, 2012); clone-level corroboration in Wiegand
    (17/42 contiguous vs 0/52 distant clones). Deliberately NOT claimed:
    "ARID1A loss is a general feature of cancer-free endometriosis"
    (Anglesio 2017: 2/39 deep-infiltrating lesions, one at 8% VAF, lesion
    class carries "virtually no risk of malignant transformation";
    Yamamoto 2012: 22/22 solitary endometrioses ARID1A-intact) and "the
    single first event" (Chao puts ARID1A/PIK3CA/TERT/KRAS in one early-
    clonal tier; Gan 2023 argues KRAS earlier).
    - **Task-brief corrections (all verified at source):** "ARID1A 43–78%"
      is wrong at both ends — 78% traces to NO primary (it is Bennett
      2021's background-precursor frequency, not an ARID1A figure), 43% is
      Ge 2021's MMR-intact subgroup only. **"IHC reads higher than
      sequencing" is BACKWARDS** — in Wiegand itself IHC 42% vs sequencing
      46%; 13 verified IHC cohorts span 15–69%, bracketing not exceeding.
      "PIK3CA ~30–46%" also wrong at both ends (real span 28.5–54%; 33%
      and 46% are the SAME paper's mixed-vs-purified arms, a DNA-purity
      artifact — Kuo, Am J Pathol, 2009). **Bolton's own abstract says
      PIK3CA 49% while its Results say 45% (188/421 = 44.7%) — cite the
      Results.** Bolton also prints one internally contradictory sentence
      asserting co-occurrence AND exclusivity for overlapping gene sets
      (Supplementary Fig. S7, unverifiable) — never quote it; only its
      quantified TP53/ARID1A OR is usable.
    - **Second trunk entry = TP53 STATUS (GBM classifier-entry precedent):
      "usually wild-type here," ~15% (Kuo 2009, n=97; 16%, N=71 Bolton) vs
      HGSOC's 96% founding event** — the atlas's two ovarian cancers are
      near-opposites on this gene, and multi-hit-ARID1A tumors are the
      least likely to mutate TP53 (OR 0.21, 95% CI 0.07–0.54). Platinum
      contrast carried in this note with the verified nuance: **the
      response deficit lives in the platinum-SENSITIVE setting (ORR 51.3%
      vs 76.0% HGSOC, Watanabe, J Obstet Gynaecol Res, 2026); in resistant
      relapse they are indistinguishable (18.2% vs 15.6%) — "OCCC is
      platinum-resistant" as a blanket claim is NOT supported and NOT
      stated.** (That paper's Table 4 PFI row labels are INVERTED vs its
      own abstract/body; the abstract figures are authoritative. Sugiyama
      2000's oft-quoted "11.1%" response rate is paywalled-unverifiable —
      dropped.)
    - **Branch = the cooperation model the user asked for, verified to the
      mouse:** PIK3CA 45% on the primary site — ARID1A-only mice: 0 tumors
      over ~1 year; PIK3CA-only: 80% hyperplasia, 0 tumors; double mutant:
      77% (23/30) at median 7.5 weeks, sustained-IL-6 mechanism (Chandler,
      Nat Commun, 2015; independent one-hit-insufficient replication Guan,
      JNCI, 2014 — whose ARID1A+PTEN arm yields ENDOMETRIOID, not clear
      cell). Two popular glosses FAIL at source and are not used: "IL-6
      rises only when both mutations present" (each alone raises it) and
      "ARID1A loss unleashes PI3K signaling" ("did not further enhance").
      Other branches: KRAS ~17% (17/102 Chao; range 5–21%; **Mayr 2006
      must NEVER be cited for OCCC KRAS — its only KRAS mutations were
      serous+mucinous, zero clear-cell, despite Mabuchi's table saying
      5%**), ZNF217 amplification 31–36% (clear-cell-specific vs serous,
      positively associated with ARID1A loss P=0.028 — Kuo, Clin Cancer
      Res, 2010; Huang, Mod Pathol, 2014), PPP2R1A ~7–19% with R183W
      hotspot 11/16 (Chao). KRAS and PPP2R1A deliberately sit in
      DIFFERENT regions, never one cell: PPP2R1A R183W can paradoxically
      enhance RAS-MAPK signaling, so they are not co-drawn unchecked.
    - **Private pool = a flagged structural departure: TWO passengers,
      ZERO drivers — the first driverless pool in the atlas — because no
      additional recurrent driver survives fit-checking.** PTEN excluded
      (pathway redundancy with PIK3CA, melanoma-MAP2K1 class, PLUS the
      mouse histotype divergence above; the circulating "PTEN deletions
      37%" is really IHC protein loss 15/40, Hashiguchi 2006); CTNNB1
      excluded (wrong entity — 53% in low-grade ovarian ENDOMETRIOID vs 3%
      here, the GBM-ATRX class); **TERT promoter excluded on the strongest
      statistics in the atlas: mutually exclusive with BOTH trunk
      (p=4.4×10⁻⁹, Wu, J Pathol, 2014; replicated p=1.3×10⁻⁷ Chao, P=0.003
      Huang 2015) AND branch partner (p=0.0019) — and absent from
      contiguous endometriosis, i.e. a LATE event**; **ARID1B excluded on
      a NEW rejection class, #4 in the mutation-fit taxonomy: synthetic-
      lethal dependency — ARID1A-deficient cells REQUIRE functional ARID1B
      to survive (Helming, Nat Med, 2014), so drawing its loss depicts a
      cell that cannot live**; SMARCA4 insufficient (Bolton's own authors:
      driver capacity "requires further study"; 0/68 protein loss); MET
      insufficient (true amplification 6%, not "37%" — that figure
      conflates DISH copy-gain with amplification AND its source paper
      carries a 2026 correction saying the underlying data for six figures
      are unavailable); dMMR prose-only (3–6% per-tumor subset). **TTN
      deliberately absent — zero TTN mentions across four OCCC cohorts
      totalling 634 tumors; passenger slots instead ship the verified
      quiet-genome story (median 46 non-silent mutations; the clock-like
      signatures SBS1/SBS5 the most widespread, in 92% and 84% of tumors, counted
      on a median 143 single-base substitutions per tumor — a different base from
      the 46, so never "dominated" — Chao) and OBSCN R3140Q labeled explicitly as a
      single-tumor observation (Yang, Neoplasia, 2020 supplementary).**
    - **Site model — the gating question, answered with primary sources
      BOTH ways: same routes, different timing. Family 1, NO departure.**
      Kondo (J Gynecol Oncol, 2020; 166 recurrences from the 619-patient
      JGOG3017 trial): "No CCC-specific recurrence site was identified."
      Rose 1989 autopsy (n=428): sites "nearly identical" across
      histotypes. A departure needs a hard number and the numbers refuse:
      GBM departed at <1–2% extracranial spread; OCCC has 35.5% distant
      recurrence. What IS different (legend line + framing, no per-site %
      in UI per the kidneys-pass rule): **72.4% localized+regional at
      diagnosis vs 22.1% HGSOC (Peres, JNCI, 2019, n=28,118 — USE COUNTS:
      the printed 78.9% HGS-distant fails its own arithmetic, 13,898/
      17,837=77.9%, column sums to 101%), ~90–93% unilateral (Tanaka 2016;
      2026 Chinese cohort) vs serous 70.5% bilateral.** Sites: ovary/
      endometriotic-cyst primary (74% pathology-confirmed endometriosis,
      Parra-Herran 2019 — method-dependent: ~40% clinical/MRI; never blend
      the two), pelvis (13/13 single-site recurrences pelvic, Hemman
      2022), peritoneum (54.2%, THE most frequent recurrence site — kept
      against the temptation to swap in a distant organ), retroperitoneal
      nodes (33.1%; node-only 18% Hogen 2019; para-aortic > pelvic in four
      series; **nodal involvement NOT higher than serous — 7.9% vs 13.6%
      Chan 2008 — the region note says so**). Endometriosis association:
      OR 3.05 (2.43–3.84), strongest of any subtype, HGSOC null (1.13,
      p=0.13) — Pearce, Lancet Oncol, 2012, self-reported caveat. Recurs
      multi-site: 62%/62%/64.4% across three continents. NOT usable: Ye
      2020's per-LESION site table (its "4.9% peritoneal" contradicts
      Kondo because 61 lesions ≠ 45 patients + surgical selection);
      "better OS at stage I" (false for OS — Peres localized 81.7 vs 84.0,
      Matsuo HR 0.62 p=0.24; true ONLY for PFS 84.7% vs 66.9%). Projected
      separation (CRC method, default camera): **2.02 units — second-best
      in the atlas (melanoma 2.15); live-probe min label separation 210px/
      0.233 canvas heights, no box overlaps** (HGSOC ships at 110.7px).
    - **Histology — PathologyOutlines was UNREACHABLE for this pass (HTTP
      429, Retry-After 86400, four attempts over two days), so the
      morphologic load rests on the WHO-2020-based review (Diagnostics,
      2021, PMC8070731 — chosen because it describes OCCC and HGSOC in the
      SAME paper: <5 vs >12 mitoses/10 HPF is a same-source contrast),
      DeLair (Am J Surg Pathol, 2011, n=155, abstract-verified), Uekuri
      (Oncol Lett, 2013).** Drawn: small ROUND papillae, no hierarchical
      branching, ≤3 cell layers, cores EXPANDED by dense hyaline material
      (the direct negation of the HGSOC slide's branching fronds);
      hobnail cells as "eccentric, rounded, bulbous nuclei" bulging into
      lumens (the only citable ovarian phrasing — the "scant-cytoplasm
      bulging-nucleus" definition exists only in a URINARY-tract source,
      not usable); mixed clear+eosinophilic+flattened cells (a uniformly
      clear field would overclaim — rare OCCCs are entirely eosinophilic);
      UNIFORM nuclei (atypia "frequently present, but never diffusely" —
      DeLair) with exactly ONE mitotic figure; free-standing hyaline
      bodies (never "eosinophilic hyaline globules" — sources say hyaline
      bodies). NOT drawn: psammoma bodies (serous feature, no OCCC
      source); any papillary/tubulocystic/solid percentage split (NONE
      exists — only the rank "papillary and tubulocystic most frequent" is
      citable; a made-up split would repeat the rejected liver-%s error);
      chicken-wire vasculature (that is ccRCC's signature). **The ccRCC
      "clear cell" echo is a PARTIAL overlap, stated as such: OCCC
      clearing is attributed to glycogen (hedged "includes" in the only
      attributing source); ccRCC's is glycogen AND lipid with the lipid
      tied to VHL/HIF — not "the same substance," and kidneys.js's slide
      text is not echoed verbatim.** HNF1B/Napsin A are protein markers —
      prose-only if ever added, never ledger entries.
    - **Search: "clear cell" is now a deliberate two-organ disambiguation
      (Kidneys + Ovaries — both really have one), and the Enter key was
      fixed to auto-navigate ONLY on a unique match** — it used to take
      matches[0], a live pre-existing bug ("carcinoma" matched five
      organs, "adenocarcinoma" four, "cell" two, "crc" two) that would
      have silently rerouted "clear cell" to Ovaries because ovary loads
      first. The false "collision-free by design" comments in
      js/organs/index.js and kidneys.js were corrected in place. 'occc'/
      'ovarian clear cell' resolve uniquely to Ovaries; 'ccrcc'/'renal
      cell carcinoma' uniquely to Kidneys. Share text: ~10% (9.6%,
      2,695/28,118 Peres) with the Japan asymmetry stated in the row
      (26.9% — Machida 2019; its US 8.4% is four-subtype-restricted, which
      is why the headline stays Peres's complete-denominator 9.6%).
22. Testis/seminoma reference sources — **organs #13/#14, added together with
    Bladder/Urothelial carcinoma (rule 24). Every citation verified directly
    at the source**, including anatomy (StatPearls' "Anatomy, Abdomen and
    Pelvis: Testes," NBK470201, and its "Male Genitourinary Tract" chapter,
    NBK562291, fetched separately for the rete testis/mediastinum testis
    detail the Testes chapter itself doesn't carry).
    - **Site model — GATED and RESOLVED before building: stays in the
      ordinary real-anatomical-spread family, no new region-word.** The
      candidate departure was seminoma's real, sequenced, contiguous chain
      (abdomen → chest → neck, Wood et al., *J Urol*, 1996: "The contiguous
      nature of disease spread from abdomen to chest and neck in seminoma is
      confirmed"). Ruling: the site-model taxonomy has never been about
      whether spread has internal order — it's about what KIND of thing the
      four blobs represent (real distant destinations vs. GBM's intratumor
      regions vs. Prostate's independent foci). A sequenced chain of real
      lymph-node stations plus one real distant hematogenous site is still
      real anatomical spread; seminoma clears neither GBM's (<1–2%
      extracranial) nor Prostate's (76.5% multifocal) numeric departure bar.
      The real finding is encoded through `pos3d` (true anatomical height,
      caudal→cranial — not a literal straight line, since Lung sits at
      chest height alongside Mediastinal nodes rather than "above" the
      neck) and prose, not new schema. Primary geography anchor: Paly et
      al. (*J Urol*, 2013, PMID 23321493, 145 nodes/90 patients) — 84%
      para-aortic, 9% common iliac, 7% pelvic, 99% within 2.5cm of the
      aorta below T12/L1. Wood 1996 used ONLY for the qualitative
      contiguous-ordering claim and the seminoma-vs-NSGCT lung-metastasis
      contrast (9% vs 40%) — its own station-level percentages were judged,
      on a closer read, to carry real ambiguity about whether they describe
      marginal prevalence or a conditional/template relationship between
      stations, so none of those specific numbers are used.
    - **Trunk — i(12p)/12p gain, corrected mid-verification from an initial
      precursor-documented framing to the actual invasion-defining one.**
      i(12p) is absent from GCNIS by definition and appears only once
      invasion occurs (Fichtner et al., 2026, PMC12700052: "the isochromosome
      12p develops during the progression of a GCNIS to an invasive TGCT";
      Ravisankar et al., 2026, PMID 42628849: i(12p) is "a hallmark of
      invasive germ cell tumors that is absent in GCNIS," with its own FISH
      series' seminoma components negative for i(12p) all showing polysomy 12
      instead — "these are mutually exclusive alterations," a real alternate
      route to the same net gain). **Two different quantities, not one
      range**: i(12p) specifically, 87% (114/131, TCGA/Shen et al., *Cell
      Rep*, 2018), with the 17 i(12p)-negative tumors all retaining ≥4 copies
      of 12p; 12p gain BY ANY MECHANISM, ~73% (536-specimen FISH series,
      PMID 33798590). Framed explicitly as a different KIND of genomic event
      — a whole-arm chromosomal gain, not a point mutation — with the real
      cross-reference to this atlas's other non-point-mutation trunk/branch
      event, Prostate's TMPRSS2-ERG fusion.
    - **Branch — KIT (~5–35% depending on cohort/whether pure-seminoma-
      restricted) at the two proximal sites, KRAS (~14%, TCGA) at the two
      distal sites — the same "two real genes, four sites, repeat each
      twice" structure Prostate's TMPRSS2-ERG/SPOP split already
      established**, here because the two co-occur (6 TCGA seminomas carried
      both) rather than because they're exclusive like Prostate's pair. KIT
      range anchors: Coffey et al. (2008, n=220, the largest single cohort)
      5.1% exon 17; TCGA ~18% of its full 137-tumor cohort, ~35% within the
      72-tumor pure-seminoma subset specifically — stated as two different
      denominators, not one number. **No bilateral-disease claim is made**:
      Biermann et al. (2007, PMID 17768701) reports KIT exon 17 enriched in
      bilateral TGCT (63.6% vs 6.4%); Coffey et al. (2008, larger bilateral
      n=32) reports 3.1% and states "We find no evidence for an increased
      frequency of KIT mutations in bilateral TGCT" — two primary sources in
      direct conflict, so the claim is dropped entirely rather than hedged.
    - **Private pool — PIK3CB admitted on real but thinner evidence (~7.4%,
      2/27, a real-world sequencing cohort, PMC12469615, reported alongside
      KIT/KRAS with no documented conflict against either) plus the standard
      TTN passenger. NRAS deliberately excluded** despite being real and
      TCGA-significant (4%, "exclusively in seminomas except for one KRAS
      mutation in an NSGCT") — TCGA: "mutations in KRAS and NRAS co-existed
      in only one seminoma," a near-mutual-exclusivity with the KRAS branch
      gene. Because the private pool draws into cells at every site
      regardless of that site's branch gene, NRAS would randomly co-occur
      with KRAS-branch cells at the rate the real data says essentially
      doesn't happen — the same same-tumor-co-occurrence-conflict check
      OCCC's private-pool exclusions already established, applied here for
      the first time against a NEAR- rather than fully-exclusive pair.
    - **Distinctive facts led with, not buried:** quiet genome (median 0.5
      mutations/Mb, TCGA — this atlas's second "quiet genome" cancer after
      OCCC's median-46-mutations story; worth naming as a standing pattern
      only if a third instance ever justifies it, not yet); and the cure-rate
      story, verified better than the task brief's own framing — there is
      **no poor-prognosis IGCCCG risk category at all for metastatic
      seminoma** (Beyer et al., *Ann Oncol*, 2021 update, PMID 33729863,
      n=2,451): 5-year OS 95% good-risk, 88% intermediate-risk. Carried in
      the `cancerEntries.share` text (this atlas's existing convention for a
      second, more important fact riding alongside a share percentage —
      Skin's melanoma entry does the same with its death-share) and repeated
      in the Trunk panel's own note.
    - **GCNIS-as-precursor — the task brief's "nearly all cases" framing
      checked and NOT shipped as a flat percentage.** The natural-history
      case for GCNIS as a real precursor is strong and verified (von der
      Maase et al., *Int J Androl*, 1986: of men under contralateral
      surveillance, biopsy-proven CIS carried a 50% risk of invasive cancer
      at 5 years, while 0 of 473 men WITHOUT it developed any), but the one
      clean empirical figure for how often GCNIS is actually FOUND adjacent
      to a primary tumor on pathological review is lower than "nearly all"
      — 78.7% (85/108, a 2019 pathological-evaluation series) — and is
      stated as that real number, with the honest reason for the gap
      (detection depends on how many sections are sampled, and invasive
      tumor can overgrow the very lesion it arose from) rather than rounded
      up to match the brief's premise.
    - **Body-marker placement hit a real, more extreme version of the
      ray-through-the-thigh-gap trap this file's own Colon marker comment
      already documents — caught by live probing, not assumed fine from one
      screenshot.** The scrotum sits right at the groin crease where the two
      legs are closest together, so the first values tried (±18–30deg at
      heightFrac 0.36–0.42) produced two markers projecting to the IDENTICAL
      pixel at every heightFrac from 0.30–0.39, and only 2px apart at
      0.42/±30. A live angle sweep (same probing technique the Colon pass
      used) found real separation only from ±55–60deg onward; shipped at
      heightFrac 0.40 / ±65deg, ~55px apart on the male body.
23. **Apparent exclusivity that dissolves under stratification — a named,
    generalizable check, structurally a Simpson's-paradox pattern in
    mutation data.** Before building a two-entry "divergent pathway" model
    (two active cancer entries, or a two-way branch split presented as real
    biological either/or) on ANY correlation or anti-correlation finding,
    **verify it holds within the relevant strata (stage, grade, subtype) —
    not just in the pooled cohort.** A correlation that is significant
    pooled but vanishes within every stratum checked is very likely a
    cohort-composition artifact, not a biological exclusivity — and treating
    it as biology would hard-code a statistical artifact into the app as if
    it were established fact, a categorically different and more dangerous
    error than a wrong percentage or a misattributed paper, because it looks
    exactly like good data until stratified. **The case that surfaced this
    (Bladder/Urothelial carcinoma, rule 24):** the FGFR3/TP53 anti-
    correlation is significant pooled (OR 0.25) and within pT1 (OR 0.47,
    Neuzillet et al., *PLoS ONE*, 2012, PMC3521761, 535+382 tumours) — but
    "no dependence was detected in the five tumour groups considered," and
    is explicitly ABSENT within pTa alone (OR 0.56, p=0.12) and within MIBC
    alone (OR 0.99, p=0.35). Building two cancer entries on "FGFR3 path vs.
    TP53 path" would have modeled a stage confound as if it were two
    distinct diseases. Checking this is now a required step whenever a
    design gate involves a correlation/anti-correlation finding, the same
    standing weight as the mechanistic-fit check in rule 1 and the
    cooperating-vs-competing check in rule 4 — not a one-off Bladder note.
24. Bladder/urothelial carcinoma reference sources — **organ #14, added
    together with Testis/Seminoma (rule 22). Every citation verified directly
    at the source**, including anatomy (StatPearls' "Anatomy, Abdomen and
    Pelvis: Bladder," NBK531465).
    - **Design gate — ONE cancer entry, not two, per rule 23's standing
      check.** The candidate two-entry model (an "FGFR3-pathway"/NMIBC entry
      and a "TP53-pathway"/MIBC entry, mirroring Ovary's two active cancers)
      was rejected once the pooled FGFR3/TP53 anti-correlation was checked
      by stage and dissolved (see rule 23 for the numbers). Two further
      structural reasons: NMIBC/MIBC is a STAGE, not a histologic entity, and
      this atlas's `share` field reads as a histologic percentage — building
      two entries on a stage split would have silently relabeled a stage as
      a different cancer; and a real, stage-INDEPENDENT trunk event was
      sitting right there once looked for (TERT promoter, below). Ruling:
      one entry, "Urothelial carcinoma," two-entry trunk (TERT + a
      pathway-divergence status entry, the same GBM-classifier/OCCC-status
      architecture), FGFR3/TP53 as branch genes at different sites.
    - **Trunk — TERT promoter mutation, the atlas's THIRD TERT-trunk cancer
      (after Melanoma and HCC), and explicitly stage-independent** —
      Rachakonda et al. (*PLoS ONE*, 2013, PMC3808633, n=327): 65.4%
      (214/327), "with even distribution across different stages and
      grades," verbatim; Allory et al. (*Eur Urol*, 2014): 70%/79% across
      two independent cohorts, C228T alone 83%, "not associated with
      clinical or pathologic parameters," and MORE frequent specifically in
      FGFR3-mutant tumours (p=0.0002) — a real positive association with one
      of the branch genes, stated as cooperation because that's what the
      source shows. Second trunk entry, pathway-divergence status, carries
      the rule-23 stratification nuance directly in its own note.
    - **CDKN2A — the 22%-vs-32/33% discrepancy RECONCILED, not shipped as an
      unresolved range or forced to one side.** Computed directly in both
      major TCGA cohort versions (`blca_tcga_pub_2017` and
      `blca_tcga_pan_can_atlas_2018`, both n=408): deep deletion 33.3%
      (136/408) and 31.9% (130/408) respectively — the two versions AGREE,
      ruling out cohort/platform as the cause. Retrieved the paper's own
      sentence (NCBI efetch, after Europe PMC's `fullTextXML` returned 0
      bytes for this PMC id — the fallback this atlas now uses whenever that
      happens): **"The most common recurrent (22%) focal deletion (copy
      number &lt;1) contained CDKN2A."** Same event, two real definitions:
      22% = focal deletion at a strict absolute copy-number-&lt;1 threshold
      (TCGA's own criterion); ~32–33% = GISTIC's "putative deep deletion," a
      thresholded relative call. Both figures shipped, with the definitional
      reason for the gap stated — the same resolution pattern as OCCC's
      ARID1A/PIK3CA range differences (identify the real cause of variation,
      don't pick a side), one level cleaner since this one fully resolved
      rather than needing the LUAD-style both-figures-unresolved fallback.
    - **Gene-to-site map is evidence-driven from one source's full
      exclusivity/co-occurrence table** (TCGA, *Cell*, 2017): CDKN2A is
      mutually exclusive with TP53 and RB1 (q&lt;0.2) — kept at different
      sites than TP53 — but CO-OCCURS with FGFR3 in 7% of tumors ("which may
      be MIBCs that have progressed from non-invasive tumors") — carried in
      each gene's own note, not modeled as a shared site, since this
      schema's branch slot is one gene per site. ERBB2 is anti-correlated
      with FGFR3 specifically in metastatic disease (OR 0.47, p=0.010,
      n=1,014, "complementary distribution") — kept at a different site than
      FGFR3 for that reason. RB1 co-occurs with TP53 (q&lt;0.2) but was not
      given its own site — carried in TP53's note instead, since the schema
      has four site-slots and five real evidence-backed candidate genes
      (FGFR3/TP53/CDKN2A/ERBB2/RB1) for them.
    - **Sites — real bone-dominant metastatic pattern, explicitly cross-
      referenced to Prostate's own bone-dominant spread** (Bone 38.3% /
      Lymph nodes 36.8% / Lung 33.5% / Liver 22.6% of metastatic patients,
      n=4,317, Wang et al., *Front Oncol*, 2023, PMC10605465 — same
      bladder-primary SEER cohort as the subtype shares; denominators differ
      per site since not every metastatic record reports every site).
      TP53 placed at Bone specifically because Alessandrino et al. (2020,
      PMID 32228295, n=103) found TP53 mutation associated with osseous
      metastases (RR 1.9, P=.02) and lymphadenopathy (RR 1.7, P=.002) — a
      real, sourced reason for that placement, not narrative convenience.
      **First pos3d pass produced a real but tight 80px minimum projected
      separation** (Lymph nodes~Lung, live-probed) — passing the no-overlap
      check but tighter than this atlas's post-CRC standard; X/Z widened and
      Y de-clustered for Lymph nodes/Lung/Liver, re-probed to 114px minimum
      (Bone~Lung), in line with luad/tnbc/melanoma's own 96–112px band.
    - **Subtype shares and the lateral-wall-not-trigone origin finding, both
      from the same bladder-primary cohort** (Wang et al., 2023): Urothelial
      carcinoma ~92% (48,789/53,142) vs. Neuroendocrine ~3.2% (1,683),
      Squamous cell ~3.1% (1,667), Adenocarcinoma ~1.9% (1,003) — ordered by
      the source's real counts, not textbook convention (this cohort's
      neuroendocrine count is very slightly ahead of squamous cell, the
      reverse of the usual teaching order). Lateral wall is the real most
      common site of tumor ORIGIN (8,056 of a ~19,000-tumor subsite
      breakdown, more than double the trigone's 2,977) — stated plainly in
      the organ description and the Bladder wall hotspot's own text, rather
      than letting the trigone's real anatomical distinctiveness (the only
      real 3D GLB sub-mesh landmark for this fact) imply false primacy.
    - **Bladder mesh is a REAL asset, not procedural** — NIH 3D's Human
      Reference Atlas 3D Reference Object Library (CC BY 4.0), male
      urinary-bladder reference organ (`assets/bladder.glb`), Visible-Human-
      Dataset-derived like Kidneys/Liver/Brain/Prostate (and Lungs at the
      time this entry was written — Lungs alone has since moved to a
      Sketchfab source; see the 2026-09-01 lungs-swap entry). No
      individually-documented creator/DOI was found for this asset (checked
      directly, the same way Colon/Pancreas's DOIs were found) — attributed
      at the level the source actually documents, same as the five organs
      above it, rather than inventing a citation. Its six real, separately-
      named anatomical sub-meshes (bladder neck, dome, trigone, both
      ureteral orifices, each carrying its own UBERON/FMA ontology id) are
      used directly for hotspot placement: every anchor is that sub-mesh's
      real vertex centroid, computed from the binary buffer (**a real
      glTF-parsing bug caught and fixed mid-computation: accessor-level
      `byteOffset` is additive to its bufferView's own `byteOffset`, not a
      replacement for it — a naive parse that ignored the accessor-level
      offset put the trigone sub-mesh's centroid far outside its own
      accessor-declared bounding box before the fix**), nudged outward from
      the mesh's overall centroid. **A second real bug in the same pipeline,
      caught during REVIEW rather than before shipping**: the first nudge
      factor (1.35, tuned by eye against the two large sub-meshes, dome/
      base1) pushed the two SMALL, tight sub-meshes past their own real
      geometry — a live rotated screenshot in the review packet showed
      Bladder neck floating visibly off the mesh silhouette; checked
      numerically and confirmed Neck (114 vertices, an 8mm-tall taper)
      landed below its own sub-mesh's bounding-box minimum, and Ureteral
      orifices exceeded its own bbox too, less visibly. Re-swept down to
      1.15 — the largest factor at which all four points stay within their
      own sub-mesh's real bounding box, confirmed numerically before
      reshipping. **Lesson for any future real-GLB organ using this
      centroid-nudge technique: verify the nudge factor against each
      sub-mesh's own bounding box individually, not just visually against
      the largest one** — a factor safe for a sub-mesh with thousands of
      vertices spanning a wide patch can push a tiny, tightly-clustered
      sub-mesh clean off its own surface.
    - **Histology — PathologyOutlines was unreachable again (HTTP 429, the
      same block Testis and OCCC both hit), so the morphologic load rests on
      a 2026 open-access grading review (PMC12700064) that quotes the WHO
      1973/2004 criteria directly.** High-grade invasive disease is drawn,
      not low-grade, because it matches this organ's own trunk framing
      ("almost all MIBC cases are high grade," verbatim, same source).
      Umbrella-cell loss is drawn as a real, named contrast ("umbrella cells
      often -" in high grade vs "+" in low grade, the source's own table),
      not left as a prose caveat.
25. (Pipeline note 2026-09-03: this rule's NoColorSpace workaround is retired — the corrected pipeline ships SRGBColorSpace; tone provenance below unchanged.) **Lungs texture tone is artist-authored, NOT independently verified
    against a gross-anatomy color reference — a disclosed, accepted
    limitation, not an oversight (2026-09-01).** Every flat material color in
    this atlas is either verified against a real gross-anatomy/pathology
    description (ovary, prostate, most organs) or explicitly flagged as its
    file's "weakest-sourced parameter" (testis, bladder, skin's hypodermis).
    The lungs mesh swap (see the dated 2026-09-01 lungs-swap entry in
    Architecture notes for the full provenance) replaced the previous flat
    hex — `0xb08d90`, which HAD been color-verified in the real-tissue pass —
    with the neshallads asset's native baked textures, whose tone runs
    notably redder than that verified pink-gray and traces to the artist's
    palette, not to any anatomical color source. The tradeoff was accepted
    deliberately: per-texel surface/normal/specular detail (and the sculpted
    fissures) was the entire reason this asset was sourced over the
    alternative, and stripping the textures to restore a verified flat color
    would discard exactly that. Standing implications: (a) do not cite the
    lungs' on-screen color as verified anywhere — it is the one organ whose
    surface color is currently artist-authored; (b) if a future pass wants to
    close this gap, the options are recoloring the baked base-color maps
    toward a verified reference (preserving detail, changing hue) or
    documenting a real source that supports the current tone — not silently
    accepting it as if it had been verified; (c) this rule is the
    discoverable, standing record of the limitation — the narrative
    lungs-swap entry cross-references it, and neither supersedes the other.
26. (Same pipeline note as rule 25: NoColorSpace retired 2026-09-03.) **Colon texture tone is artist-authored, NOT independently verified — the
    second organ under the rule-25 pattern (2026-09-02).** The colon mesh swap
    (dated entry in Architecture notes) replaced the HRA asset — whose flat
    material used the verified pale-pink serosal hex `0xc99f92` — with the
    antonia.sundberg asset's native baked textures, kept because the source
    carries a real 2048px normal map (per-texel surface detail, the same
    justification class as Lungs) and because the live A/B showed visibly
    richer haustral-crease shading than the recipe path. The baked tone (a
    salmon-pink, mesh mean RGB (143,83,63) under the app's lighting after the
    colorspace fix) traces to the artist's palette, not to a gross-anatomy
    color source. Same standing implications as rule 25: never cite the
    colon's on-screen color as verified; the two closure paths (recolor the
    base-color map toward the verified reference, or source-verify the
    current tone) remain open; the narrative colon-swap entry
    cross-references this rule and neither supersedes the other. If a THIRD
    organ ever lands here, consider folding rules 25/26 into one standing
    "native-texture tone" rule with a per-organ list.
27. Thyroid reference sources — **organ #15, papillary + follicular added
    together as the app's second two-active-entry organ (the Ovary
    precedent, not Bladder's design-gate rejection), gate-approved on WHO
    2022's own classification language (2026-09-02).** Every citation
    verified verbatim at source during Phase 2; the full verification record
    is in the session transcript, and the load-bearing anchors are:
    - **Shares, one denominator:** Lim et al., JAMA, 2017 (SEER-9,
      n=77,276): papillary 64,625 (83.6%), follicular 8,359 (10.8%),
      medullary 1,685 (2.2%), anaplastic 975 (1.3%) — and anaplastic's
      asymmetry, 471/2,371 = 19.9% of thyroid-cancer deaths, stated in its
      inactive share row (skin's nodular-share precedent).
    - **Entity split:** Baloch et al., Endocr Pathol, 2022 (PMID 35288841,
      the WHO 2022 overview), verbatim: PTCs "represent the BRAF-like
      malignancies, whereas invasive encapsulated follicular variant PTC and
      follicular thyroid carcinoma represent the RAS-like malignancies."
      Same source family: NIFTP is no longer carcinoma; oncocytic carcinoma
      is now a distinct third entity — historical "80–85% papillary" shares
      predate these moves, which is why the Lim registry denominator is the
      one used.
    - **PTC numbers (all TCGA, Cell, 2014, PMC4243044, results-text
      verbatims):** BRAF 248/402 (61.7%), mostly V600E; BRAF/NRAS/HRAS/KRAS
      "virtually mutually exclusive" (Fisher p=1.1×10⁻⁵, MEMo p<0.01), one
      driver in 300/402 (74.6%), "having more than one mutation confers no
      clonal advantage"; RET fusions 6.8%; RAS 52/402 (12.9%), codons 12/61;
      TERT promoter 36/384 (9.4%; 27 C228T/1 C228A/8 C250T), NOT associated
      with BRAF or fusions, recurrence-risk p=7×10⁻⁸ holding within BRAF
      tumors; SCNA classes: quiet 72.9%, 22q-del 9.9% (NF2+CHEK2; 70 tumors
      22q-loss, 5 CHEK2-mutant, 4 both, p=0.0035), 1q-amp 14.8%
      (TCV p<0.0001 + BRAF p<0.05 enriched, higher MACIS/stage); PPM1D/CHEK2
      SMGs "occurred concomitant with MAPK-pathway driver mutations";
      EIF1AX 1.5% exclusive with RAS/BRAF → REJECTED from the model (the
      LUAD-EGFR class); mutation density 0.41 non-synonymous/Mb, correlated
      with age p=5.2×10⁻¹⁸; thyroglobulin 11/402 (2.7%), not an SMG (the
      pool's TTN-logic passenger); unknown-driver fraction 25%→3.5%.
    - **FTC structure is the Prostate status-trunk pattern, forced by**
      Nikiforova et al., J Clin Endocrinol Metab, 2003 (PMID 12727991):
      RAS 49%, PAX8–PPARγ 36%, both 3% — "two distinct and virtually
      nonoverlapping molecular pathways"; follicular ADENOMAS carry RAS at
      48%, which is why genotype cannot call malignancy and the histology
      slide is built on the capsule criterion instead. Modern frequencies:
      Hsia et al., J Pers Med, 2025 (PMC12843263; AACR GENIE, n=168): NRAS
      57 (33.9%, Q61R 63% of those), TERT 38 (22.6%, all promoter, adults
      only), DICER1 26 (15.5%; pediatric 44.4% vs adult 4.6%), HRAS 20
      (11.9%), PTEN 18 (10.7%), ATM 13 (7.7%), KMT2D 12 (7.1%); NRAS more
      frequent in metastatic samples — 27/64 = 42.2% vs 26/89 = 29.2%, the
      Results text's own counts. **The abstract prints 42.4%, which matches
      no count anywhere in the paper, and the served note carried that
      figure until 2026-09-08**: cite the Results — the same rule rule 21
      records for Bolton's abstract-versus-Results PIK3CA figure — and put
      the counts beside the percentage, which is what lets `fraction_check`
      hold the arithmetic from now on. **Build-time
      exclusivity discovery: NRAS–DICER1 mutually exclusive (p=0.02, zero
      co-occurring samples; NRAS–HRAS p<0.001) → DICER1 appears NOWHERE in
      the modeled NRAS-founded tumor** — its pediatric-third-road story
      lives in the trunk note only. GENIE's TP53 row (n=22, "6.5%") fails
      its own arithmetic (22/168=13.1%) and was not shipped. FVPTC straddle
      quantified from Zhu et al., Am J Clin Pathol, 2003 (PMID 12866375):
      FV = RAS 43%/RET-PTC 3%, non-FV = RET-PTC 28%/RAS 0%.
    - **Route contrast, one same-source table** (Luvhengo et al.,
      Biomedicines, 2023, PMC10135557): lymph-node mets PTC "Common
      (20–90%)" vs FTC "Rare (<10%)"; hematogenous FTC "Frequent (29%)" vs
      PTC "Rare (9%)"; FTC distant sites verbatim "bone, lung, and brain";
      nodal mets in supposed FTC → re-review slides for missed FVPTC;
      capsular/vascular invasion as the FTC-vs-adenoma criterion, FNA
      structurally unable to make the diagnosis; lateral-neck nodal disease
      27% at presentation and ~10% presenting metastatic from StatPearls
      "Papillary Thyroid Carcinoma" (NBK536943, also the PTC nuclear-feature
      verbatims: Orphan Annie eyes, grooves, pseudo-inclusions, psammoma
      bodies, fibrovascular stalks — where HGSOC's slide deliberately does
      NOT draw fibrovascular cores, PTC's deliberately DOES).
    - **Anatomy:** StatPearls NBK470452 (isthmus at 2nd–3rd tracheal rings;
      pyramidal lobe in 28–55%; C5–T1; superior thyroid artery = external
      carotid's first branch) and NBK551659 (follicles, colloid =
      thyroglobulin, C cells neural-crest-derived → medullary contrast).
      **Do NOT cite StatPearls for thyroid size:** its own sentence (~25 g
      AND 6.6 mL) is internally inconsistent 3.6×. Size claims anchor to
      Lin et al., Biol Trace Elem Res, 2023 (PMC10620313): median total
      volume 8.26 mL, upper reference 19.06 mL, ellipsoid constant 0.479 —
      which also refutes the common "each lobe 5×3×2 cm" paraphrase
      (implies 28.7 mL total, i.e. a goitre).
    - **Mesh decisions (andycopo55/UJAT asset, CC BY 4.0, embedded-metadata
      verified):** gland isolated from the neck assembly by texture-colour
      class + measured trim planes; UNIFORM scale to the verified 8.26 mL
      (anisotropic correction rejected — no verifiable target length);
      proportion trade disclosed in the HTML disclaimer (lobe length 2.77 cm
      short of textbook, depth correspondingly deep, per-lobe width 1.34 vs
      1.31 cm reference); isthmus verified as geometry by pure-coordinate
      measurement (midline-bridging band ~1 cm tall, thin AP, 0.96 cm
      posterior tracheal concavity); NO pyramidal lobe in the mesh (zero
      midline bridging above the band) → fourth hotspot is Superior pole,
      as the integration spec permitted; all four hotspot anchors are
      measured mesh coordinates on anterior-facing surface; color texture
      resampled 2048→1024px (3.99→1.67 MB) under the lungs downscale
      protocol, same-camera live deltas mean 0.15–0.34/255 within the lungs
      pass's own band, geometry byte-identical and re-verified post-swap.
    - **Integration found and fixed an app-wide latent bug:** the shared
      viewer camera's near plane was 0.1 m while frameContents() computes
      camera distance purely from bounding radius with no floor — any real
      mesh under ~3 cm bounding radius frames the camera INSIDE its own
      near plane (thyroid framed to 9.6 cm; prostate, the previous
      smallest, escapes at ~12.5 cm). Because artist meshes ship
      doubleSided, the failure renders as a convincing sliced-open shell,
      not a blank view — from behind, the anterior wall's interior reads as
      a clean solid organ. Caught because front and back silhouettes
      disagreed, which an opaque closed mesh cannot do. Fix: near 0.1→0.01
      in makeViewer (js/viewer.js), full regression green after. Standing
      lesson: a "correct-looking" single-angle render is not proof — check
      opposite views agree, and check camera distance > near plane whenever
      an organ is smaller than anything shipped before.
    - **Structural adaptations of the approved Phase-2 plan, made because
      the app needs four region branches per cancer (disclosed at review,
      cheap to swap):** PTC promotes PPM1D + CHEK2 from pool to branches
      (they are the only verified BRAF-co-occurring candidates left; pool
      backfills with the clock-like entry + thyroglobulin); FTC keeps the
      approved pool (TERT + PTEN) verbatim and fills its last two branch
      slots with ATM + KMT2D, hedged in-product as recurrent-but-
      unadjudicated. PAX8–PPARγ is drawn at a metastatic site as "the other
      road" with explicit not-in-this-tumor framing (the approved
      "branch genes at different sites" design, prostate's license).
28. **The quiet-genome pattern — a named, standing content pattern
    (anticipated by the Testis pass, formalized this build, 2026-09-02).**
    Three atlas cancers now teach that a tumor's mutation LIST can be
    nearly empty without the tumor being any less real: ovarian clear-cell
    (median 46 non-silent mutations, clock-like signatures), seminoma
    (~0.5 mutations/Mb), and papillary thyroid carcinoma (0.41
    non-synonymous/Mb, age-correlated p=5.2×10⁻¹⁸ — the quietest yet).
    Standing implications: (a) when an organ's genome is quiet, say so as a
    led-with teaching fact, not an apology — the private pool is the place
    (clock-like/background entries, zero invented drivers); (b) never pad a
    quiet genome's pool by importing another cancer's passenger (the
    OCCC-TTN precedent: verify the passenger exists in THIS disease's
    cohorts or use the organ's own big-gene equivalent — thyroid uses
    thyroglobulin, verified 2.7% and non-SMG in TCGA); (c) the pattern is a
    cross-atlas teaching contrast with the loud genomes (melanoma, bladder)
    — cross-reference it when a fourth lands.
29. Ovary real-mesh swap — **the atlas's first MRI-derived organ (left
    ovary from "Pelvic Organs from MRI" by audreybyrd, CC BY 4.0,
    2026-09-02), replacing the procedural mesh after a fourth,
    Sketchfab-focused hunt succeeded where three prior hunts (HRA/NIH 3D)
    conclusively failed.** Decisions and their evidence:
    - **Provenance (page verbatim, three-channel license check):**
      high-resolution MRI of a 25-year-old woman, OSU Biomedical Imaging
      Laboratory + Center for Health Sciences Neuroanatomy Laboratory,
      Spring 2022, Avizo+Blender segmentation. License verified on the live
      page, via the public API ("Author must be credited. Commercial use is
      allowed."), and in embedded asset.extras.
    - **Named nodes are NOT organ meshes:** the source's `ovaries_2` node is
      three arbitrary ~65,532-vertex index-buffer chunks (Sketchfab 16-bit
      split) — one chunk's bbox spans "44 cm" merely because it holds
      leftover triangles from BOTH distant ovaries. Weld first (131,880 →
      22,132 verts), THEN decompose: five components — two ovary outer
      shells + three smaller closed surfaces PROVEN interior by ray-parity
      containment (internal follicles / corpus luteum captured by the
      segmentation; dropped, disclosed in the disclaimer). Standing lesson:
      a labeled node in a downloaded assembly tells you the REGION, not the
      topology — weld and decompose before believing it.
    - **Left shell shipped** (22,038 tris, one component; richer surface
      character — the crease field is the MESOVARIAN BORDER, confirmed by
      deriving the medial direction from the assembly's own uterus centroid,
      which lands exactly on it; the Hilum hotspot anchors there). Right
      shell (17,606 tris) documented as the cleaner alternative.
    - **Scale is volume-anchored, not length-anchored:** exactly 7.7 mL —
      Kelsey et al., PLoS ONE, 2013 (n=59,994): PEAK ovarian volume 7.7 mL
      (95% CI 6.5–9.2) AT AGE 20. State it as the nearest well-established
      landmark, NOT an age-25 match (the curve declines gently after 20;
      the specimen is 25). Length-anchoring to the textbook 3.5 cm was
      computed and rejected — it implies 15.5 mL, double the reference.
    - **Proportion disclosure, in-situ framing (stronger footing than
      Thyroid's stylization trade):** 2.71 × 2.77 × 2.05 cm, near-round
      (1:0.98:0.74) vs the StatPearls excised-almond 3.5×2×1 (1:0.57:0.29).
      This is real anatomical variation between in-situ imaging (live organ
      compressed by pelvic neighbors) and an idealized reference shape —
      write it as that, never as "the asset falls short of the citation."
    - **Material B ships (first B verdict; Lungs/Colon/Thyroid chose A):**
      the source's flat segmentation red (0.93/0.23/0.23, no texture, glTF
      metallic-1 default) is a labeling convention, not a tissue color —
      nothing to preserve. Recipe uses the previously verified grayish-pink
      0xc9ac9e (PathologyOutlines/IMAIOS — the verification describes the
      ORGAN, so it survives the mesh swap) + mottle + specularIntensity
      0.25 (material-pass standard; the old 0.15 predated that pass).
    - **Glow-halo retirement:** pos-anchored hotspots flip isRealMesh, so
      the ovary's designed marker-glow PointLights are gone by design
      (clip-fix rule). Ovary's 0.34% halo — formerly the living precedent
      cited by Testis's accepted baseline flag — is retired; the Testis
      flag now stands on its own reasoning (rewritten in this same change,
      see the harness entry). Hotspot anchors are measured on-surface
      coordinates; Cortex/Medulla are depth layers anchored at disclosed
      representative surface points (their texts already say "beneath").
    - Near-plane note: a true-scale ~2.8 cm ovary frames the camera to
      ~8 cm — safe only because of the Thyroid pass's near 0.1→0.01 fix
      (this organ would have been the second casualty).
30. Stomach real-mesh swap — **"Realistic Stomach" by Brain Diagno
    (Sketchfab, CC BY 4.0, 2026-09-03), replacing the procedural swept-tube
    J; the atlas's 12th real mesh and its weakest-provenance adoption,
    accepted on MEASURED landmark fidelity, not author authority.**
    NUMBERING ERRATUM (reviewer-caught at this commit's gate, recorded here
    as the living correction since the affected titles are pushed history):
    the registry has 14 ORGANS and 16 CANCER PAIRS. The Testis/Bladder
    commit title's "organs #13-14" were pair numbers (organ count was 13
    after that pass), and Thyroid's "organ (#15)" — also in rule 27's
    opening — inherited the +1 drift: thyroid is the 14TH ORGAN, carrying
    pairs #15-16. Real-mesh count as of this commit: 12 of 14 (Skin is a
    deliberate schematic, Testis procedural). Count from the registry
    (js/organs/index.js ORGAN_MODULES), never from prior labels.
    - **License verified three ways** (page, API requirements text, embedded
      asset.extras — the label is the author's own). Two standing lessons
      from the hunt: (a) **license-laundered reupload, a named rejection
      subtype** — a "CC BY" copy of neshallads' CC BY-NC stomach whose own
      description admits the source; a reuploader's license selection cannot
      relicense NC work, and Sketchfab's embedded extras echo the uploader's
      claim, so CHECK REUPLOAD PROVENANCE, NOT THE LABEL (caught twice this
      pass: the user's first download was that exact file — refused on
      embedded-identity check before any geometry work). (b) neshallads —
      the Lungs artist — publishes their stomach as NC; same artist does not
      mean same license. Also rejected: Dundee CAHID's 5.2M-tri "stomach"
      (an Artec scan OF A PLASTIC TEACHING MANNEQUIN, organ occluded),
      Splanchnology (CC BY-SA), Sketchfab-Standard-licensed models.
    - **Topology (cleanest source of any pass):** one component, ZERO
      boundary edges, ZERO non-manifold edges, watertight, outward-wound;
      35,226 verts (32,480 welded) / 64,960 tris; tube mouths are modeled
      rims (open-lumen look on a closed surface) — the two >40° dihedral rim
      rings ARE the esophageal/duodenal mouths and served as measurement
      endpoints.
    - **Landmarks are GEOMETRY** (flat-shade proven): greater/lesser
      curvature asymmetry with incisura, fundus, antral taper. The stippling
      and vessel tracery are TEXTURE-ONLY (dihedral mean 2.63°) — disclosed;
      nothing load-bearing rides on them.
    - **Scale: length-class anchor, volume REJECTED** (opposite of Ovary,
      principled: gastric volume is state-dependent 25±18 mL → 2–4 L, no
      single volume is "the" stomach). Greatest inscribed J-plane diameter
      → 10.4 cm (Cunningham 1905 mid-range, the retired procedural's own
      figure) puts everything else in cited bands unforced: 25.4 × 17.6 ×
      7.8 cm overall (Cunningham 25–27.5 length headline, stubs included),
      AP-flattened 0.75:1, enclosed volume 216 mL (coherent moderate fill).
      NOT claimed: Gray's 4–5× curvature ratio — the measurable
      mouth-to-mouth arc ratio (1.45) includes both stubs and is not
      comparable. Duodenal loop is LONG: kept with disclosure (trim would
      re-open a watertight mesh; it gives the pylorus hotspot context).
    - **Material A ships — decided by a THREE-WAY live test** (A native /
      B recipe / B′ gloss-boosted recipe at roughness 0.36 + spec 0.6,
      reviewer-requested structure): the recipe's tissue mottle, tuned on
      smaller organs, reads as artificial leopard spots on this large
      smooth form; B′'s gloss does not rescue it; A's baked vessel speckle +
      normal map read as tissue. Recipe-scale lesson: mottle frequency is
      organ-scale-sensitive — do not assume the recipe transfers to large
      smooth organs. Wet-sheen ceiling documented at review: the reference-
      photo gloss is offline path-tracing; this pipeline has no envmap and
      SSS/transmission measured pixel-identical (material pass), so
      roughness/specular are the only levers and both sit under clip
      guardrails. A's texture tone is artist-authored, NOT color-verified
      (rule-25/26 class); the old serosal-color-inference note is retired
      with the procedural mesh and recorded in the disclaimer.
    - Textures downscaled 4096²→1024² ×3 (31.04 → 4.24 MB) under the lungs
      protocol: same-camera live deltas mean 0.15–0.40/255, p99 ≤ 3.3.
    - Hotspots re-anchored as measured coords; pylorus snapped to the
      visible ANTRAL NECK (first pick "2.8 cm from the duodenal mouth"
      landed mid-duodenum because the C-loop is long — anatomy beats fixed
      offsets); wall-layer hotspots are representative surface points, texts
      already say the layer is within the wall. Export frame matches the
      app's mirror-view convention (duodenum image-right). No glow/precedent
      consequences: stomach was already pos-anchored (isRealMesh true).

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
- **File layout / module map (ES-modules refactor, this pass).** `cancer-atlas.html` is now
  a shell: `<head>` (fonts, the three.js import map, all CSS — CSS stayed inline rather than
  splitting out, since there's no build step to make a separate stylesheet request pay for
  itself and it's tightly coupled to one page anyway) and the unchanged `<body>` markup, ending
  in one line, `<script type="module" src="./js/main.js"></script>`, instead of the ~2,450-line
  inline `<script type="module">` block this file used to carry. Every module is a real
  `export`/`import`, no bundler, servable exactly as before (`python3 -m http.server` — verified
  directly: `Content-type: text/javascript` on every `.js` response, zero console/network
  errors loading the split app fresh). Module map, grouped by what each layer is for:
  - **`js/rng.js`** — `makeSeededRandom`/`seedFromKey`/`shuffleWithRandom`. Pure PRNG, no
    DOM/THREE dependency. Used by both `viewer.js` (spike placement) and `panel.js` (cell
    layout/mutation draws) — pulled out on its own specifically to avoid either one importing
    the other for three unrelated functions.
  - **`js/viewer.js`** — `makeViewer`, `organicDisplace`, `organicSpiculate`,
    `applyMottleVertexColors`, `makeMoveTracker`, `cssVar`, `LEGACY_LIGHT_SCALE`, and the
    `THREE.ColorManagement.enabled = false` side effect. Everything here is pure/self-contained
    (no reference to `screen`/`currentOrganKey`/any app-level state) — confirmed by inspection
    before extracting, not assumed from "it's in the SHARED 3D HELPERS section" alone. This is
    the one piece of the original file that already matched the user's proposed "shared
    viewer.js" module with zero redesign needed.
  - **`js/accessibility.js`** — `makeActivatable`, `landFocus`. Same reasoning: pure DOM
    helpers, no state coupling, direct lift.
  - **`js/organs/{ovary,breast,lungs,kidneys,liver,brain,prostate}.js`** — one module per
    organ, each exporting `organEntry` (its `ORGANS` array entry), `markerSpec` (its
    `ORGAN_MARKER_SPECS` entry), `cancerEntries` (its `CANCERS` array entries), `organDetail`
    (its `ORGAN_DETAILS` entry, referencing its own `buildXMesh`), and `cancerDetails` (an
    object of its `CANCER_DETAILS` entry/entries) — plus the `buildXMesh` function itself. This
    is the module boundary that actually addresses the tech debt Known Limitations flagged
    ("the file itself keeps growing linearly with content"): adding organ #8 now means adding
    one new file and one line in `js/organs/index.js`, not touching any of the other six
    organs' files or `main.js` at all.
  - **`js/organs/index.js`** — the registry. Imports all seven organ modules and assembles the
    flat `ORGANS`/`CANCERS` arrays and the `ORGAN_DETAILS`/`CANCER_DETAILS`/`ORGAN_MARKER_SPECS`
    lookup objects every other module actually consumes — nothing outside `js/organs/` imports
    an individual organ file directly.
  - **`js/state.js`** — every piece of shared mutable state the original single closure held
    in bare `let`s (`screen`, `currentOrganKey`, `currentCancerId`, `txLevel`,
    `txCurrentRegion`, `txCurrentCell`, `txPanelOpener`, the three viewer instances, the body
    sex/group/hover/ready flags), collected into one exported `state` object so every module
    that used to read/write a bare variable now reads/writes `state.xxx` instead — same
    shared-mutable-reference semantics, just addressed through an object because ES module
    bindings for a `let` are read-only outside the module that declares it (you can read
    `import {x} from './m.js'` live, but you cannot reassign it from outside). `regionCellCache`,
    `bodyMarkerRecords`, and `organMarkers` are exported as plain `const` arrays/objects instead,
    since they're only ever mutated in place (`.push`, `.length = 0`) rather than reassigned, so
    they don't need the same treatment. `siteBlobs`/`siteLabelEls` ARE reassigned wholesale on
    dispose, so they get `export let` plus a `setSiteBlobs`/`setSiteLabelEls` pair rather than a
    `state.` property — a live `let` binding can be read directly by any importer, just not
    reassigned from outside its own module.
  - **`js/sidebar.js`** — the organ library sidebar (`initSidebar`,
    `updateSidebarActive`). Same register-once pattern as search/body:
    `initSidebar(selectOrgan, onLayoutChange)` is called once from `main.js`'s
    bootstrap; the second callback re-fires `.resize()` on every live viewer
    after a toggle, because opening/closing the rail changes every screen's
    width and nothing else would tell the viewers (there is no ResizeObserver
    anywhere — `viewer.js` only listens to window `resize`).
    `updateSidebarActive()` is called from `setScreen()` so every navigation
    path (hotspot, search, breadcrumb, sidebar itself) keeps the highlighted
    row in sync.
  - **`js/breadcrumb.js`** (`renderCrumbs`) and **`js/panel.js`** (`buildRegionCells`,
    `txRenderCellLayer`, `txOpenCell`, `txMutGroup`, `txClosePanel`, `dismissMutationPanel`,
    `PRIVATE_RING_SHADOW`) and **`js/search.js`** (`organMatchesQuery`, `findOrganMatches`,
    `organActionLabel`, the search input wiring) and **`js/body.js`** (the whole body viewer:
    mesh loading, markers, sex toggle, `bodyTick`) — the four "shared UI module" splits the task
    asked for. `panel.js` and `search.js` and `body.js` turned out to be one-directional leaves
    (they import `state.js`/`organs/index.js`/`accessibility.js`/`rng.js` and get called BY
    `main.js`, but never need to call back into it) — except each needs exactly one callback
    `main.js` owns (`selectOrgan` for body/search; nothing for panel). `breadcrumb.js` is the one
    module that genuinely needs to call back into `main.js` (a crumb click can trigger
    `setScreen` or `txGoLevel`, both defined there). Rather than a circular import (ESM allows
    it as long as neither side calls the other at module-evaluation time, but it's easy to get
    subtly wrong and hard to eyeball as correct), each of these three uses a **register-once**
    pattern: `initBreadcrumb({setScreen, txGoLevel})` / `initSearch(selectOrgan)` /
    `initBody(selectOrgan)`, called exactly once from `main.js`'s own bootstrap sequence, storing
    the callback(s) in a closure the module's exported functions read from thereafter — the ESM
    equivalent of what the original single closure gave every function for free, made explicit
    at the one seam that needed it instead of applied everywhere by default.
  - **`js/main.js`** — the entry point: the color-management setup import side effect (via
    `viewer.js`), `setScreen`/`selectOrgan`/`renderOrganScreen`/`renderCancerList` (screen 1→2),
    `initOrganViewer`/`disposeOrganViewer`/`showOrganInfo`/`organTick` (screen 2's 3D viewer),
    `initSiteViewer`/`disposeSiteViewer`/`siteTick`/`txEnterRegion`/`txGoLevel`/
    `enterCancerScreen` (screen 3's site map), and the bootstrap sequence at the bottom
    (`initBreadcrumb`/`initSearch`/`initBody`/the three `requestAnimationFrame` kicks/the
    initial `renderCrumbs()`). Everything left in `main.js` either owns a piece of `state` that
    several other modules read, or is the one place a cross-module callback needed to land —
    it is not a dumping ground for "things I didn't feel like splitting further," and the
    Known Limitations note used to read "no per-organ/per-cancer file split, so the file itself
    keeps growing linearly with content" — that's specifically fixed; `main.js` itself is a
    fixed, bounded size that doesn't grow when organ #8 is added, only `js/organs/` does.
  - **Verbatim-preservation method, since this refactor's only real risk was a silent
    transcription error in a citation or figure while moving it:** every gene name, `ccf`
    string, `note`, hotspot `text`, `pos3d`, `dir`, viewer config number, and hex color was
    diffed programmatically (`sed`-extracted exact line ranges into the new files, then a
    normalized-line diff of every `gene:`/`ccf:`/`note:`/`text:`/`share:`/`desc:` field and
    every `id:`/`pos3d:`/`dir:`/`class:`/`heightFrac:`/`angle:`/`active:`/`organKey:` field
    between the pre-refactor commit and the split files) rather than trusted from having typed
    it once — this caught a real gap on the first pass (four per-organ alias-collision-check
    comments dropped when splitting `ORGANS` into per-organ files: lungs/breast/liver/kidneys),
    fixed by restoring them verbatim before considering the split done. 366 text fields and 97
    numeric/geometry fields diffed at zero differences on the final pass.
- **Screen state machine:** top-level `screen` = `body | organ | cancer`.
  Within `cancer`, `txLevel` = `1` (site map) `| 2` (cell scatter) `| 3` (panel
  open). `renderCrumbs()` derives the full breadcrumb from both.
- **One organ screen, one cancer screen — data-driven, not one pair per
  organ.** Adding Breast/TNBC was the first real test of whether a second
  organ means a second `#screenOrgan`/`#screenCancer` (copy-pasted markup +
  JS, doubling the maintenance surface every organ after) or a data entry into
  the existing ones. It's a data entry: `ORGAN_DETAILS[organKey]` (eyebrow/
  title/sub/facts/desc/hotspots/buildMesh/viewer opts) drives
  `renderOrganScreen()`/`initOrganViewer()`, and `CANCER_DETAILS[cancerId]`
  (title/screenLabel/legendTitle/regions/trunk/privatePool, plus an optional
  `regionWord` — default `'site'`, GBM sets `'region'` since its four
  "sites" are zones of one tumor, not distant organs; see data rule 7)
  drives `enterCancerScreen()`/`initSiteViewer()`. `state.currentOrganKey`/
  `state.currentCancerId` (see the File layout note above for why these live on
  a shared `state` object now, not bare `let`s) track which one is loaded;
  `initOrganViewer`/`initSiteViewer` no-op if asked
  to rebuild the one already showing, and dispose-and-rebuild (canvas +
  renderer + DOM proxies) if asked for a different one — only one organ's and
  one cancer's WebGL viewer exist in the DOM at a time. **Adding organ #3
  should mean adding an `ORGAN_DETAILS`/`CANCER_DETAILS` entry and a
  `buildMesh()`, not a new screen** — now literally a new `js/organs/*.js`
  module, per the File layout note. One real ordering bug surfaced while
  building this: `enterCancerScreen` must call `initSiteViewer(cancerId)` (which
  sets `state.currentCancerId`) **before** `setScreen('cancer')` (which calls
  `renderCrumbs()`, which reads `CANCER_DETAILS[state.currentCancerId]`) — the
  other order throws on the very first visit to a given cancer, since
  `state.currentCancerId` is still whatever it was before (`null`, or the
  previous cancer). Region ids (`REGIONS_*[i].id`) must stay unique across
  every cancer's regions, not just within one cancer's own list (and, now,
  not just within one organ's own module) — `regionCellCache` is keyed by
  region id and shared across all cancers regardless of which file each
  cancer's regions are defined in.
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
  **Revisited and reconfirmed (tech-debt pass, same session as the mesh-detail
  pass below) — still parked, not adopted.** Every screenshot taken across
  seven organs and seven cancers this pass showed vibrant, correctly-saturated
  meshes matching this file's own signed-off palette, with no visible defect
  the modern pipeline would fix; adopting it now would be a deliberate
  redesign (re-tuning five lights, re-validating every material against a
  new target look) orthogonal to whatever prompted revisiting it, not a bug
  fix. Don't re-litigate this without a real visual defect driving it.
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
  **SUPERSEDED FOLLOW-UP (2026-09-03, Multires-upgrade pass): the faceting
  problem below is FIXED and the replacement-asset hunt is CLOSED.** The
  shipped GLBs are now the bundle's Multires level 2 surfaces (338,720 tris
  each), meshopt-compressed — not a new asset, the same CC0 bundle exported
  at the resolution it was sculpted toward. The chain that got there, each
  step measured: (1) the bundle re-downloaded from download.blender.org
  (v1.4.1 zip; its own README still reads "Version 1.4", and the stale
  Rain-Rig LICENSE quirk documented above is still present); (2) the export
  pipeline REPRODUCED first — a fresh L0 export matched the shipped GLBs to
  0.00007 mm mean per-vertex, after rediscovering the undocumented
  bbox-centering step now recorded in body.js next to the multires-levels
  gotcha; (3) L0/L1/L2 compared at all four problem zones (shoulder, elbow,
  knee, hand) per sex at the legal minRadius-0.9 zoom: L0 fails everywhere,
  L1 fixes ~80% but leaves banding on the female shoulder ball, female
  thigh/knee, and forearms, L2 resolves everything (sculpted fingernails and
  knuckle relief emerge); (4) L2's raw 36.75 MB pair priced POST-compression
  per the reviewer's decision rule (<= ~10 MB -> ship L2) instead of
  deferring to the compression pass: gltfpack -cc gave 4.03 MB but the
  quantization gate CAUGHT visible normal banding on the female shoulder
  (mean px delta 10.77/255 vs raw) — the -vn 8 default octahedral normals,
  not position loss; -vn 12 fixed it (delta 0.049/255, pair 4.64 MB) —
  **standing lesson — THE GATE IS THE RULE, THE VALUE IS
  NOT: always gate compression on a raw-vs-compressed zone capture at the
  viewer's real zoom, never on file size or triangle counts (both pass on
  a mesh with banded normals). -vn 12 is a fact about THIS geometry — a
  large smooth sculpted body, octahedral banding's best case — not a
  project default; the organ meshes must derive their own precision
  against the same gate when their compression pass runs.** (5) Verified on the exact shipped bytes:
  regression 161/3 = documented baseline, body markers 15/16 visible,
  zero findBodySurfaceAnchor misses at any level, sex-toggle camera
  bit-identical. Residual observation for the visual-audit pass: a faint
  vertical quad-flow striping on the thighs under grazing light exists in
  the RAW L2 too — a property of the sculpt's topology, not compression.
  js/body.js now registers MeshoptDecoder (load-bearing: a compressed GLB
  with no decoder fails to load entirely). One toolchain note: the two body
  GLBs can no longer be parsed by the raw-GLB accessor scripts used in
  review packets; verify body geometry through the live app (the organ
  GLBs remain uncompressed until the dedicated compression pass decides
  otherwise).
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
- **Organ mesh source — Lungs/Kidneys/Liver/Brain/Prostate, full history
  (2026-08-27):** these five now load a real anatomical scan (`assets/lungs.glb`,
  `kidneys.glb`, `liver.glb`, `brain.glb`, `prostate.glb`), replacing the
  procedural `LatheGeometry`/displaced-`SphereGeometry` approximations each
  organ used before. **Ovary and Breast deliberately were not touched in this
  pass and remain on procedural meshes** — same partial-sphere/scaled-sphere
  construction as always; a real-scan swap for those two is a separate,
  not-yet-made decision, not an oversight.
  - **Source and license, verified per organ at the source, not batch-assumed:**
    all five come from NIH 3D's (formerly NIH 3D Print Exchange) "Human
    Reference Atlas 3D Reference Object Library" collection, account "HRA" —
    Lungs `3DPX-020974`, Kidneys `3DPX-020967` (left kidney only; the
    collection has no separate right-kidney model — used generically to mean
    "a kidney," same as the procedural version's unlabeled-side ellipsoid
    did), Liver `3DPX-020973`, Brain `3DPX-020959`, Prostate `3DPX-021015`.
    CC BY 4.0 on every one of the five entry pages — quoted directly per
    organ, not inferred from the collection level. Unlike the body meshes'
    CC0 bundle, CC BY 4.0 attribution is **legally required**, not a
    courtesy — the `#disclaimer` text credits NIH 3D and the underlying data
    sources by name for exactly this reason. Underlying data: the Visible
    Human Dataset (Spitzer & Whitlock, *Visible Human Project*, 2002;
    Spitzer, Ackerman, Scherzinger & Whitlock, 1996 for the male-specific
    scan) for all five organs' base geometry, plus — brain only — the Allen
    Human Brain Atlas (Ding et al., *J Comp Neurol* 524(16):3127-3481, 2016,
    "Comprehensive Cellular-Resolution Atlas of the Adult Human Brain," 141
    structures mirrored/resized to fit) for the brain's specific internal
    structure.
  - **Download path, reverse-engineered because the obvious one doesn't
    work:** NIH 3D's entry page (`3d.nih.gov/entries/3DPX-0XXXXX`) links to a
    download page (`3d.nih.gov/entries/download/<5-digit-id>/1.01`) whose raw
    HTML embeds a `submissionId` and a `submissions/<id>/runs/<uuid>` path,
    plus direct S3 URLs that 403 if fetched raw. The actual working download
    is `3d.nih.gov/api/submissions/<submissionId>/runs/<runUuid>/output-
    files/<fileId>` — confirmed via curl per organ, not assumed to generalize
    from one.
  - **Format conversion, verified lossless rather than assumed:** source
    files are binary STL (72K-656K triangles, no UVs/rigging, matching the
    prior research pass's figures almost exactly). Converted to GLB via
    Blender headless (`blender --background --python`), same tool the body
    meshes already made this project depend on at build time, not runtime.
  - **Topology inspection, same discipline as the body-mesh MakeHuman catch,
    including a real false alarm caught and fixed mid-pass:** a bmesh
    BFS connected-component walk (one component per organ, no stray
    geometry — the same class of check that caught MakeHuman's fused-thigh
    defect and stray debug cube) plus a degenerate-face count. The first
    pass used one fixed absolute face-area threshold (`1e-9`) across all five
    organs and reported Prostate at **39.4% degenerate faces** — a number
    that would be a real blocker anywhere else. Investigated rather than
    reported or ignored: Prostate's real bounding box is far smaller than
    the other four organs' (0.083×0.071×0.043m), and its median face area
    (1.35e-9) is 2-3 orders of magnitude smaller than the others' (Lung
    8.07e-8, Kidney 9.7e-7, Liver 2.9e-6, Brain 7.8e-7) — it's simply
    tessellated far more finely per unit area, not defective. Fixed by
    rewriting the check to threshold relative to each mesh's own median face
    area (`median/10000`) instead of one absolute number; re-run, all five
    organs land at a comparable, negligible 0.005%-0.70%. Non-manifold edge
    counts were also checked (small, boundary-seam-scale numbers on all
    five) but not treated as disqualifying on their own — a closed,
    single-component, non-self-intersecting surface with a handful of
    non-manifold edges at a real seam is still raycastable and renders
    cleanly, which every render_preview.py screenshot confirmed directly
    before integration, not just the numeric check alone.
  - **Visual confirmation, silhouette-level, per organ before integration —
    the actual point of this whole pass:** Blender headless render
    (`BLENDER_WORKBENCH` engine, `STUDIO` shading — `BLENDER_EEVEE_NEXT` is
    not a valid enum in this Blender build) at a generic camera angle scaled
    to each object's own bounding box. Confirmed real anatomical structure
    the procedural meshes structurally could not produce: Lung's actual
    bilobed/trilobed shape with visible bronchial branching near the hilum;
    Kidney's real concave hilum notch (invisible at the first camera angle —
    only found by trying a second, more oblique one, `render_preview2.py`);
    Liver's visible right/left lobe division with a real fissure between
    them; Brain's real gyral folding plus a separate, distinctly-textured
    cerebellum mass; Prostate's walnut/olive-shaped gland body (after
    isolation — see below).
  - **Performance, checked rather than assumed too heavy:** a synthetic
    THREE.js benchmark (same workaround the prior mesh-detail pass used,
    since `document.hidden` stays `true` in this headless preview
    environment and the app's own `requestAnimationFrame` loop never fires)
    found raw WebGL render cost was a non-issue at full resolution for all
    five organs — every one under 0.12ms/frame. The real cost is file
    size/load time (Brain at 54.8MB, Lung at 24.9MB as first exported), not
    GPU cost, which reframed the whole decimation decision below as a
    download-size problem, not a frame-rate one.
  - **The real fix turned out to be shading, not the Decimate modifier —
    worth recording because it wasn't the first hypothesis:** `remove_doubles`
    (position-welding) barely shrank the exported file size at all (e.g.
    Lung: 147,683 unique-position vertices at the Blender-mesh level, but the
    exported GLB's own glTF accessor count — read directly from the binary
    via `struct`/`json`, not trusted from Blender's or Three.js's own
    reporting — was 875,288, close to `faces × 3`, i.e. almost zero index
    sharing). Root cause: STL import has flat per-face shading, and glTF can
    only store one normal per vertex *index* — a vertex touching two faces
    with different normals gets re-split at export regardless of upstream
    position-welding. Fixed by calling `shade_smooth_by_angle(angle=~35°)`
    (Blender 4.1+/5.x; falls back to plain `shade_smooth()` if unavailable)
    *after* welding and *before* export — lets genuinely co-planar faces
    (a real curved organ surface) share one averaged normal and one vertex
    index, while still splitting at genuinely sharp boundaries (e.g. where
    two lung lobes meet). This alone cut Lung from 24.9MB to 8.18MB and Brain
    from 54.8MB to 18.4MB with **no Decimate modifier involved yet** — a
    shading fix, not a geometry change, confirmed by the exported accessor
    count dropping to a much closer ~1.3x of the true vertex count (the
    remaining gap is real hard edges, correctly still splitting).
  - **Decimation, applied selectively, not to all five uniformly:** with
    render cost already confirmed a non-issue and the shading fix alone
    bringing every organ within range of the existing body-mesh baseline
    (`female_body.glb` 1.48MB, `male_body.glb` 512KB) except two, only
    **Brain** (COLLAPSE ratio 0.3, 653K→196K faces, 18.4MB→7.19MB) and
    **Lung** (ratio 0.4, 292K→117K faces, 8.18MB→3.54MB) were decimated
    further; Kidney (1.35MB), Liver (1.72MB), and Prostate (0.29MB) were left
    at shading-fixed-only resolution since decimating them further wasn't
    "needed" by the task's own framing, and every additional cut is a real
    (if small) risk to the anatomical detail this pass exists to add.
    Each decimation ratio was visually re-confirmed against its
    pre-decimation render before being finalized — Brain's gyral folding and
    Lung's lobe/hilum silhouette both survive at these ratios; a higher
    ratio was not tried since these already landed in range and further
    cuts only add risk for a size budget that's no longer under real
    pressure.
  - **Prostate needed an extra isolation step the other four didn't: the raw
    scan includes duct-like appendages beyond the gland body itself.**
    Identifying the real gland among 54 disconnected components took three
    failed automatic heuristics before falling back to direct, manual
    identification — recorded because the failure mode (a heuristic reports
    success and changes nothing, or changes the wrong thing) is worth
    recognizing early next time, not re-discovering:
    1. An aspect-ratio-from-whole-bounding-box heuristic reported excluding a
       component, but the re-render was pixel-identical to the original —
       the heuristic's measurement didn't match the tip-cross-section
       analysis that had actually found the ducts.
    2. Explicit exclusion by the exact vertex counts of the two components
       already positively identified as duct-like still left the render
       unchanged — confirmed via a direct raw-STL bounding-box check that
       several *smaller* (~1,200-1,500 vert) components among the ones kept
       were independently spanning the same wide spatial area.
    3. Ranking all 54 components by bounding-box *volume* and keeping only
       those spatially contained near the largest picked a 500-vertex
       component with a large, sparse bbox as "largest" — volume rewards
       spread as much as mass, the same class of measurement error the
       degenerate-face absolute-threshold bug above made.
    - **What actually worked:** abandon automatic classification and
      directly extract the one component *already* positively identified
      (by `render_largest_component.py`'s bbox output matching real
      prostate dimensions, 51.5×26.7×23.0mm) by its exact vertex count
      (7,961) — `isolate_gland3.py`. Confirmed clean both visually (single
      closed gland shape, no tendrils) and topologically (1 component, 0
      degenerate faces by the corrected relative threshold, 31 non-manifold
      edges at the real seam where the ducts used to attach).
    - **Ejaculatory ducts vs. vas deferens — investigated per explicit
      instruction, not left as a passing guess.** The excised appendages are
      two ~20mm paired components with a smooth, tapering cross-section from
      one end to the other (measured via `inspect_ducts.py`) rather than an
      abrupt flat-cut face — consistent with a real anatomical terminus and
      matching real ejaculatory-duct length, more so than a vas-deferens
      segmentation artifact (which would extend well outside a
      prostate-only model and more plausibly show a flat cut where the
      source scan's crop boundary sliced through it). Not certain either way
      with no ground-truth labels available. Dropped from the shipped mesh
      either way, for visual consistency with every other organ's clean
      single-silhouette presentation — **if this is ever revisited, a real
      ejaculatory-duct sub-mesh is a plausible, separately-scoped future
      refinement (with its own hotspot, sharpened against the existing
      Prostatic urethra point so the two don't overclaim being the same
      structure), but it was deliberately not built into this pass.**
    - The seam's own non-manifold-edge centroid (31 edges, found directly in
      the source mesh, not guessed) was reused as a real anatomical landmark
      for the Central zone hotspot below — it marks where the ejaculatory
      ducts actually entered the gland, which is literally what the central
      zone is defined as surrounding.
  - **Hotspot re-derivation — every organ's investigate points were
    re-anchored from scratch against the real mesh, not carried over:** the
    procedural organs' `dir` vectors work as literal `direction ×
    hotspotScale` positions only because those meshes are scaled ellipsoids;
    a real scan has no such closed form. Built a one-off interactive picker
    (three.js + `GLTFLoader`, loaded over the project's own dev server so
    same-origin `fetch()` works) that raycasts the real GLB on click/direction
    and prints the local-space hit point — used to visually place each
    point, cross-checked against the render_preview.py screenshots for
    anatomical sense (e.g. Kidney's Hilum/Renal pelvis both land inside the
    real concave notch; Lung's Bronchi lands on the actual small branching
    cluster near the medial root, not just "somewhere on the mesh"). Every
    organ's hotspots switched from `dir:[x,y,z]` (normalized, scaled by
    `hotspotScale`) to `pos:[x,y,z]` (a literal local-space point, meters) —
    `initOrganViewer()` in `main.js` branches on whichever field a given
    hotspot object has, so the still-procedural Ovary/Breast keep working
    unmodified through the same function. Labels and "arises here" framing
    are unchanged from the procedural version for all 20 points across the
    five organs — only the anchor coordinates moved.
  - **Async loading, a first for the organ viewer (the body viewer already
    had this, the organ viewer never did before now):** `GLTFLoader` has no
    synchronous path, so each of the Lungs/Kidneys/Liver/Brain/Prostate
    `buildMesh` functions returns a `Promise<THREE.Object3D>` instead of an
    `Object3D` directly.
    `initOrganViewer()` wraps every organ's `buildMesh()` result in
    `Promise.resolve()` so procedural (sync) and real-mesh (async) organs
    share one code path. Guards against the same race body.js's loader
    doesn't have to worry about (only one body, loaded once at startup) but
    the organ viewer does (a user can switch organs again before a GLB
    finishes loading): the in-flight load closes over its own
    `state.organViewer` reference and checks it's still the current one
    before touching the scene or `organMarkers`, rather than comparing
    `organKey` strings, which would miss a stale load racing a fresh one for
    the *same* organ. A `#organLoading` status element (same pattern as
    `#bodyLoading`) covers the gap.
  - **Camera framing and marker scale had to be re-derived, not reused,
    because the Lungs/Kidneys/Liver/Brain/Prostate GLBs are real-world meters
    and the procedural organs were an arbitrary ~1-2 unit
    scale:** `initOrganViewer()` calls
    `thisViewer.frameContents([mesh], 1.3)` (the same call body.js already
    makes against its two body GLBs) whenever any hotspot on the organ uses
    `pos` rather than `dir` — this re-derives camera distance from the
    mesh's own real bounding sphere instead of trusting a hardcoded
    `opts.radius`. `minRadius`/`maxRadius` in each of the five organs'
    `viewer:{...}` config were still hand-updated to real-meter-scale numbers
    though, since `frameContents()` only ever widens `maxDistance`, never
    changes `minDistance` — leaving the old ~2-unit `minRadius` in place
    would have locked the camera out of ever zooming in close on a
    real object that's only centimeters across. Marker sphere radius and
    point-light falloff distance are similarly scaled off the loaded mesh's
    own bounding-sphere radius (`× 0.045` and `× 2.4` respectively) rather
    than the old fixed `0.06`/`1.2` unit numbers, which would have either
    swallowed Prostate whole or barely registered against Brain.
  - **Default camera angle (`theta`/`phi`) needed a real, per-organ check, not
    a blanket carry-over from the procedural defaults — caught for real on
    two of the five, not just theorized:** every organ inherited the same
    `theta:0.5, phi:1.15` the procedural meshes had used, on the assumption
    that camera angle is independent of what mesh is loaded. It mostly is —
    Liver, Brain, and Prostate's hotspots (spread fairly evenly around the
    mesh) land at least partially in view at that angle by coincidence — but
    Kidneys' four hotspots all cluster tightly on one side (the medial/hilum
    region — see the hotspot-anchoring note above), and at the inherited
    angle every one of them was on the far side of the model, invisible
    without rotating first. A hotspot a user can't see is a hotspot they
    have no way to discover, which defeats the "click a glowing point"
    pattern this whole app depends on — this is the same bar the Lungs
    silhouette (below) was held to, just failing for a different reason
    (interaction affordance, not anatomical legibility). Fixed by aiming
    `theta`/`phi` at the hotspot cluster's own average direction
    (`theta:-1.278, phi:1.375`), found by placing the live camera directly
    against the real mesh and confirming by screenshot — not computed from
    an unverified axis-conversion formula (see the caching entry below for
    exactly how that kind of unverified-formula chasing wastes real time).
    Lungs' own `theta:0.5, phi:1.15` needed no change at all — its default
    view already showed the bilobed shape and bronchial cluster correctly;
    it only ever *looked* broken because of the caching bug below, and the
    fix there was to the dev server, not to this file.
  - Verified after integration: full mouse + keyboard regression pass across
    all seven organ/cancer pairs (Ovary/Breast confirmed still on their
    unmodified procedural meshes; click-vs-drag guard, search+aliases, and
    the male/female body toggle and Prostate's male-only scoping all
    unaffected), plus full-organ (not just close-zoom hotspot-crop)
    screenshots per changed organ confirming the real anatomical features
    above are actually visible in the shipped app, not just in the
    standalone Blender renders used to vet the source files. **Run twice,
    for real, not as a formality:** the first full pass was quietly checking
    stale JavaScript the whole time (see the dev-server caching entry
    immediately below) and every one of its "confirmed" results had to be
    re-earned under a working reload before they meant anything.
  - **SUPERSEDED FOR LUNGS (2026-09-01): `assets/lungs.glb` is no longer the
    HRA/VHD-derived mesh this entry built.** The HRA lung model ships no
    interlobar fissures at all — and the HRA library has no alternative lung
    asset (source exhausted, not under-searched) — so Lungs alone moved to
    "Realistic Human Lungs" by the Sketchfab artist neshallads (CC BY 4.0,
    license verified verbatim on the model page). Everything in this entry
    stays accurate for Kidneys/Liver/Brain/Prostate and as the history of
    how the OLD lungs.glb was built; the full swap write-up (weld/component
    identification, kept-vs-dropped pieces, license, texture color-space
    decision, re-anchored hotspots, size flag) is the dated 2026-09-01 entry
    near the end of this file.
- **Dev-server caching gap — found while chasing a camera-angle bug that
  kept not staying fixed, worth its own entry because of how much it could
  quietly invalidate (2026-08-27).** `python3 -m http.server` (this
  project's whole local-preview setup — see Architecture notes) sends no
  `Cache-Control`/`Expires`/`ETag` header at all, only `Last-Modified`. With
  no explicit cache directive, browsers are free to apply RFC 7234
  *heuristic* freshness off `Last-Modified` alone — meaning a JS module
  fetched once could keep being served from the browser's own disk cache for
  well over an hour, on every subsequent reload, **with zero network
  request** — not stale-while-revalidating, just silently never asking the
  server again. Caught only because a Lungs camera-angle fix kept
  appearing to not work no matter what values were tried; direct scene
  introspection (checking the loaded mesh's actual vertex count and
  bounding box in the live app) eventually proved the browser was still
  running the pre-integration procedural `buildLungsMesh` — not the GLB
  loader — despite the file on disk, and the server's own HTTP response
  (confirmed via `curl`), both being correct the whole time. Neither a
  cache-busted URL on the HTML document, nor a full tab close/reopen, nor
  even fully killing and restarting the server process fixed it — every one
  of those leaves the *module scripts'* own cached disk entries untouched,
  since each has its own URL with no query string and its own independent
  cache lifetime. **Fixed at the server, not the browser side:**
  `.claude/nocache_server.py` subclasses `SimpleHTTPRequestHandler` to add
  `Cache-Control: no-store, must-revalidate` to every response;
  `.claude/launch.json` now runs this instead of the bare `http.server`
  module. This is a standing fix for the dev workflow, not a one-off
  workaround — without it, the exact same trap (edit a file, reload, and
  silently keep testing the old version with no error or warning of any
  kind) is waiting for the next person who touches this project locally.
  **Practical consequence for everything above:** the first full
  verification pass on the five organ meshes ran, unknowingly, against
  stale JavaScript for an unknown fraction of its length, which is why every
  finding from that pass — including the Lungs framing "fix" itself — had
  to be re-checked from scratch (confirmed via live vertex-count/bounding-box
  introspection that the *real* mesh was loaded, not just a plausible-looking
  render) before any of it could be trusted. The Lungs default view turned
  out to need no change; Kidneys' did, for the reason described above.
- **Colour-managed pipeline correction — {ColorManagement on + sRGB output +
  AgXToneMapping @ exposure 1.0} (2026-09-03), superseding the parked
  "reproduce the r128 look" decision.** Landed on a measurement record, not
  taste (packet: cancer-atlas-p2-pipeline-report): the legacy pipeline was
  identity only for the flat-lit case (historical colour verifications stay
  valid for what they measured); its shading maths ran in gamma space and
  its 1.0/channel hard clip was the root cause of the blown-white bug
  class. Corrected {CM+sRGB} leaves the lit-face palette statistically
  unmoved (hue 4.8° vs 4.9°, sat dev 0.397 vs 0.378 against cited albedos).
  Operator chosen from a measured four-way (control/ACES/Neutral/AgX):
  **AgX best sat fidelity (0.174 — better than legacy's own 0.378); Neutral,
  the pre-favoured candidate, WORST (0.594 — its preserve-saturation
  guarantee faithfully preserves this warm rig's overshoot); ACES
  hue-rotates the darkest reds. All three operators: ZERO blown pixels at
  lights ×1.35 across 14 organs × 12 angles** — so fidelity alone decided.
  Exposure 1.0; "match legacy brightness" was measured and rejected as the
  wrong target (per-organ ratios ×0.85–1.76: legacy's gamma-space lighting
  CRUSHED dark albedos — liver/kidneys brightening is the correction
  working, accepted at review with the pale organs individually inspected;
  testis's blown glow blooms tame to soft accents). LEGACY_LIGHT_SCALE
  retired (π folded into full-precision literals, numerically identical);
  NoColorSpace → SRGBColorSpace on the four textured organs (the legacy
  double-decode fix would now itself be the bug). Light intensities
  deliberately UNCHANGED — raising energy and restoring the stripped glow
  lights is a separate, individually-gated pass against the new zero-clip
  baseline. **Standing conditions from the ruling: (1) DISCHARGED by the
  env-map pass (2026-09-03, next entry): the operator was re-measured at the
  shipped env 0.25 and AgX re-confirmed — but its winning MECHANISM flipped
  (it now undershoots cited saturation on 6 of 9 rather than offsetting an
  over-saturating rig), so the P2 rationale must not be carried into any
  later lighting change as a rule of thumb; the next rig change re-measures;
  (2) measurement scripts must echo their parsed configuration back and
  assert it matches the request — a zsh word-split silently no-op'd an
  entire operator comparison and was caught only because byte-identical
  results across four operators is implausible on its face; a partial
  swallow would have produced plausible wrong numbers. A run that cannot
  state what it measured must not produce a number.
  (3) Added at the env-map ruling: measurement scripts must READ identity,
  not infer it. Three self-caught bugs in three passes were one failure —
  a script that looked like it knew what it was looking at: the zsh
  word-split above, a Float32Array readback of a HalfFloat render target
  (INVALID_OPERATION leaves the buffer zeroed, which reads as "the texture
  is black"), and a geometry-type staging heuristic
  (CylinderGeometry/PlaneGeometry) that mislabelled the skin slab's hair
  shafts as staging and misread the testis plinth as clipped. The fix shape
  is always the same: replace the inference with a fact the code exposes —
  staging is now the named group `groundStaging` reachable via the viewer's
  `ground()` accessor, and anything separating staging from anatomy uses
  that, never geometry type. Applied to raw-GLB tooling at the 4A ruling:
  any script that parses GLB accessor BUFFERS directly must first check
  the JSON chunk's extensionsUsed for EXT_meshopt_compression and REFUSE
  to proceed if present — a compressed buffer parsed as raw floats yields
  plausible wrong numbers, the geometry-type heuristic in different
  clothes. (JSON-chunk metadata — names, accessor counts, extensions — is
  uncompressed and stays fair game either way.)
  APPLIED AT THE PHASE A BUILD (2026-09-09, user): the tumour masses are
  NAMED (`phaseA-mass`, with `userData.phaseA.reserved`) so the lit-face
  fidelity measurement EXCLUDES reserved masses BY IDENTITY — they wear a
  colour from outside the tissue gamut on purpose, carry no citation to
  deviate from, and left in would register as an enormous hue and saturation
  error against a value that was never claimed. Cited masses wear an
  unsourced tissue-tan and are excluded for the same reason: no cited
  albedo, nothing to measure fidelity to.
  (4) Recorded at the 4A masters ruling: GIT HISTORY IS THE RAW-ASSET
  ARCHIVE — `git show a131649:assets/<organ>.glb` reproduces any
  uncompressed master byte-exactly, and no second copy is kept because a
  second copy drifts. That silently makes "history at and before a131649
  is immutable" a CORRECTNESS requirement, not hygiene: a squash, rebase,
  force-push, or large-blob history purge would destroy the masters with
  no error and no visible loss. Do none of those on this repository.
  (5) Generalised at the Prompt-6 ruling from two independent findings
  with one cause: NOTHING TINTED WITH AN ACCENT COLOUR MAY ENTER THE
  ILLUMINATION PATH — no accent-coloured light, env-map stop, or any
  other illumination tint — because illumination pushes its hue onto
  every cited albedo it reaches, and the albedos are individually cited.
  The env-map derivation excluded accents on principle (P3); the glow
  measurement converted the principle to numbers (P6: a teal PointLight
  at ANY offset turns 50–75% of an organ's pixels teal-dominant, with
  blown-pixel counts reading 0 throughout). This rule is what to cite
  when the next instance arrives — a hover highlight, a selection glow,
  a tumour-map site indicator: accent identity belongs on unlit/DOM
  elements (dots, rings, toneMapped:false markers), never on lights.
  (6) Recorded at the Tier-1 marker fix: WHEN THE INTERACTION IS A
  RAYCAST, AUDITING THE DOM AUDITS THE WRONG OBJECT. The 24×24 DOM
  proxies passed every prior a11y pass while the actual pointer target —
  the raycast marker sphere — projected at 6–12px at the default view on
  every organ. Any future a11y check in this project measures the
  PROJECTED SIZE OF THE ACTUAL HIT TARGET (the thing the click handler
  tests), not the element carrying the ARIA.
  (7) Adopted at the extractor-audit ruling (2026-09-04), generalising a
  fix invented once at 4A (the L0-cage swap that proved the
  triangle-count guard fails loudly) after the pattern reached FOUR
  instances: A CHECK THAT REPORTS ZERO MUST BE DEMONSTRATED CAPABLE OF
  REPORTING NON-ZERO BEFORE ITS ZERO IS BELIEVED. The four: the
  blown-pixel gate reading 0 while teal flooded 50–75% of the organ
  (P6); the coverage guard counting staging pixels (P5); the photometric
  lit-face selector sampling the quantity it measured (Tier 3); and
  "zero journal-mismatches" in the backfill sweep, unreachable by
  construction because a recorded journal was enforced inside the query
  and mismatches presented as zero hits. Every one reported clean
  because it structurally could not report otherwise. Discipline: every
  new detector ships with a demonstration that it fires on a known
  positive (a fixture, a deliberately broken input, a swapped asset)
  and stays silent on a known negative, BEFORE its first real zero is
  accepted. First application at birth: citation_polarity.py refuses to
  scan unless its self-test proves both directions.
  EXTENDED BIDIRECTIONALLY at the crosscheck ruling (2026-09-04), after
  the ref-line retraction showed the same failure with the opposite
  sign: A CLEAN SYSTEMATIC PATTERN IS WEAK EVIDENCE, NOT STRONG
  EVIDENCE, WHEN THE MEASURING INSTRUMENT IS UNVALIDATED. The "+1
  offset" was persuasive PRECISELY BECAUSE it was tidy — random noise
  announces itself as noise, but an off-by-one in a display function
  presents as a discovered law, so conviction ran backwards from
  evidence. Both directions now: a check reporting zero AND a check
  reporting a clean pattern need an independent instrument before
  belief. The catch mechanism is the part to remember: v2 kept failing
  against the truth table, and the fix was FOLLOWING THE DISAGREEMENT
  instead of the table — the instinct in that moment is to fix the
  thing that's failing, and it is exactly wrong.
  (7-bis) OPERATIONAL COROLLARY (2026-09-05, after the gate failure —
  qualitatively different from the domain-check instances because it
  was THE GATE ITSELF: /tmp purge broke puppeteer-core, regress
  crashed inside a commit chain, and a grep-for-FAIL read empty
  output as pass): THE REPORT OF ZERO MUST BE SHOWN TO HAVE BEEN
  PRODUCED AT ALL. Every tool ends with a mandatory DONE line, last,
  after every write; consumers require it present; absence-of-FAIL is
  never a pass. Swept across all six tools same day (share_sum had NO
  completion marker — a mid-loop crash looked like a short clean
  list; crosscheck and polarity printed summaries BEFORE their
  writes). The recoverability property, written down so the next such
  discovery is not an archaeology project: A VACUOUS GATE ON AN
  INTERMEDIATE COMMIT IS HARMLESS IF THE END STATE IS VERIFIED UNDER
  A TRUSTWORTHY RUN — only HEAD ships; one green run at HEAD is the
  whole remedy. The irony one layer deep: a battery of self-testing
  instruments, all of which could have been reporting nothing while
  appearing to report clean. MECHANIZED same day (the consumption rule
  was a habit, and a rule that depends on remembering to apply it is
  exactly what failed the first time): .claude/run_checked.sh wraps
  every tool invocation, requires the tool's DONE marker, and exits
  non-zero when it is absent — the vacuous run fails the invocation
  itself. Condition-(7) three-arm self-test at birth (rejects
  exit-0-without-marker, accepts marker-printing runs, propagates
  non-zero exits); verified live against the real tools (crashed
  regress → exit 1 through the wrapper; vacuous run → exit 3). Six
  call sites, one wrapper, invocation forms in its header. Structural
  check rather than standing note — (7-bis) now on the right side of
  this project's own line. EXTENDED TO READ METHODS (2026-09-05, the
  Curtin catch — the first non-tool instance): a numeral-only percent
  grep reported zero on an abstract containing four spelled-out
  percentages ("Eighty-one percent"). A search returning nothing must
  be shown capable of returning something in that document
  (.claude/figure_search.py: three forms — numerals, spelled
  cardinals, worded fractions — plus has_any_figure as the capability
  check; zero quantitative tokens in a quantitative abstract indicts
  the pattern, not the paper). The re-check of every pending verdict
  reached by possibly-blind searches recovered LIVASY (fractions were
  in the abstract all along — the van der Kaaij shape caught before
  hardening) and converted Brenner/Guichard/Peres pendings from
  assumed to instrument-verified. MECHANISM SEPARATED (2026-09-05,
  user): Livasy's actual miss was PHRASE-form blindness — the window
  anchored on the ATLAS's phrasing sampled past the answer; the
  atlas's wording is not the source's wording, which is why scope
  drift exists as a class. METHOD INVERSION adopted: ANCHOR ON THE
  NUMBER, NOT THE PHRASE (numbers have a tiny form space; phrases
  have dozens of paraphrases) — find the figure first, then read the
  sentence around it. Capability port: atlas-phrase-zero → test any
  distinctive term; none = wrong document, some = wrong phrase, go
  read. BOUND: phrase blindness produces false negatives only, so
  verified-quoted verdicts are safe; the exposed population was the
  negatives, re-passed and closed 2026-09-05 — zero verdicts rest on
  phrase-form assumptions.
  (7-ter) THE COMMIT IS ALSO A GATE (2026-09-05, the live-site parse
  failure — the second half of the recoverability property, learned
  the hard way the same day the first half was written down). 4b2c8c5
  SHIPPED A SyntaxError TO PRODUCTION: three ASCII apostrophes
  ("atlas's" ×2, "TCGA's" ×1) typed into SINGLE-QUOTED note strings at
  pancreas.js:219 and skin.js:407 terminated the literals, and the
  whole app failed to initialise — femaleBodyGroup null, zero
  hotspots, zero body markers. Confirmed live rather than inferred:
  the deployed js/organs/*.js were fetched from Pages and parsed, both
  broken. THE WRAPPER WORKED — run_checked.sh caught the crashed
  regression exactly as designed (exit 3, "marker '==== DONE:' ABSENT
  — vacuous run, treated as failure"). What had no mechanism was THE
  STEP AFTER IT: the shell variable holding the regression output was
  empty, and the commit was made and pushed with an empty gate quote
  in its message. run_checked.sh guards the RUN; nothing guarded the
  COMMIT. So the earlier comfort clause gets its missing half: A
  VACUOUS GATE AT HEAD IS NOT HARMLESS, BECAUSE HEAD IS WHAT SHIPS —
  the intermediate-commit dispensation was always load-bearing on the
  end state being verified under a trustworthy run, and this time it
  wasn't.
  THE DEFECT CLASS, stated so it generalises past one typo: every
  citation edit in this project writes ENGLISH PROSE INTO
  SINGLE-QUOTED JS STRING LITERALS, so possessives, contractions and
  quoted source titles are a standing hazard ON THE EDIT PATH itself
  rather than an occasional slip — and the class was invisible to all
  eight citation instruments, every one of which reads the file as
  TEXT and never as CODE. The aggravating detail is the one worth
  keeping: the same two lines ALREADY CONTAINED the correct
  typographic form ("TCGA’s own table", "genome’s", "p53’s"). The
  convention wasn't unknown; it was unchecked.
  PARSE GATE (.claude/syntax_check.sh): node --check across all 26
  modules as ESM (via an .mjs copy — a .js file parses as CommonJS and
  rejects every import), naming file, line and column in under a
  second. Not a replacement for the regression, which does catch this:
  the regression costs ~15 minutes and dies as a HARNESS ERROR at
  regress.js:80 naming puppeteer internals rather than the file at
  fault, leaving no report.json and no DONE line — a cheap gate that
  names the culprit is the difference between a run before every
  commit and one that gets skipped. Condition (7) at birth: fires on
  the exact defect shape, passes the curly-apostrophe form; it also
  calibrated for real, reporting 2-of-26 with both filenames before
  the fix and 0-of-26 after.
  COMMIT GATE (.claude/commit_checked.sh): the DONE-quote practice
  mechanized, because remembering to paste it is precisely what
  failed. It runs the gate through run_checked.sh, extracts the DONE
  line, and WRITES THE COMMIT MESSAGE ITSELF — so the quoted numbers
  are copied from the run by machine and can neither drift from it nor
  be silently absent, the two ways this practice has now failed, once
  each. Self-test against a scratch repo and real commits — every arm
  refuses or commits for real rather than asserting on a string, and the
  arms are the file's own list, not a count restated here (this
  paragraph said "three-arm" for a day after there were six). It
  refuses on no marker, on a non-zero exit even though the marker
  printed, and on output whose only "DONE" text is prose; it commits
  quoting BOTH DONE-line forms verbatim and no prose — see WHAT COUNTS
  AS A DONE LINE for why the second form is named explicitly and what
  went missing while it wasn't. Append-only by construction: no amend,
  no rebase, no force — the archive-immutability rule is not this
  tool's to bend, and it does not have the flags to try.
  DEPLOY GATE (.claude/deploy_check.js): the THIRD layer, and the only
  one that verifies what users actually load. THE CHAIN IS local green
  → HEAD green → DEPLOYED green, and the third diverges from the other
  two INDEPENDENTLY — a build failure, a CDN cache, propagation lag, a
  file that pushed but did not publish. On 4b2c8c5 the live site served
  a dead app and no instrument noticed; it was found by inference,
  mid-investigation, hours later, while both other gates would have
  read green. Three questions only the deployed origin can answer:
  PUBLISHED (hash-compare every text asset against the HEAD BLOBS, not
  the working tree — a dirty tree is not supposed to be live; this is
  the layer that catches pushed-but-not-published and a stale cache,
  neither of which touches the repo), INITIALISES (femaleBodyGroup /
  maleBodyGroup present, hotspots > 0 — the 4b2c8c5 shape is a page
  that parses as HTML and is dead as an app), CLEAN (zero page errors
  beyond a DECLARED benign set, currently one entry: the favicon 404).
  Deliberately POST-PUSH — there is nothing to check before the push —
  and re-runnable any time to re-confirm production is still up.
  THE ECHO CORRELATION, the one place it excuses an event it cannot
  read: Chrome reports a failed request twice, once as a response event
  carrying the URL and once as a console line that does NOT ("Failed to
  load resource: ... status of 404 ()"). Matching that text by pattern
  would swallow every 404's echo INCLUDING A MISSING JS MODULE — the
  benign list widening silently, which its own arm 2 forbids. So the
  echo is benign IFF every HTTP>=400 response observed was itself
  declared benign; one undeclared 404 and the echo is a finding again.
  Condition (7), nine arms, including two that exist because the first
  ones passed for the wrong reason: the blank-page arm exits at the
  unreachable-module branch and never touches the MISSING branches, so
  a separate arm asserts the 4b2c8c5 shape (loaded page, null state)
  reports all three. AN ARM THAT FAILS FOR THE WRONG REASON IS NOT A
  CAPABILITY CHECK FOR THE RIGHT ONE.
  (7-quater) THE GUARD THAT SHIPS BEFORE ITS POPULATION EXISTS
  (2026-09-09, user ruling, on the uncharacterised-margin default's
  unreachability check — a FIRST for this project). Every guard so far
  arrived after a defect or alongside a repair: the coverage guard after
  the plinth occlusion, the ratchet after a silent shrink, the universals
  guard after the TTN claim. The unreachability check — the reserved
  margin form must be unreachable from any cited category's parameter
  range — ships before the first cited category is wired, so nothing it
  guards exists when it lands. CONSEQUENCE, DECIDED UP FRONT: condition
  (7) is satisfied against a FIXTURE, because there is no live population
  to fire on. Normally that is the weak form and real bytes are pushed
  for; HERE IT IS THE CORRECT FORM — the guard's whole purpose is that
  the population never contains a violation, so a live firing would mean
  the rule had already been broken. THE CHECK ITSELF MUST SAY SO, in its
  own header, or a later reader will read "fixture-only" as a gap and go
  looking for the real demonstration that should not exist. The general
  form, for the next guard of this kind: when a guard precedes its
  population, fixture-only demonstration is the design, not the
  shortfall, and the absence of a live positive is the property being
  guarded.

## ABSENCE-CLAIM instrument (2026-09-05, user-directed; ninth in the battery)

- **The rule in two words (user): "exists" versus "found".** An
  UNSCOPED absence claim asserts a fact about the world's literature —
  "no canonical figure EXISTS", "no interaction analysis HAS FLAGGED
  it", "no functional study HAS ADJUDICATED". Its instrument is an
  unrecorded literature search with no query, no scope and no date, so
  it is a zero-reporting check that cannot be shown capable of
  non-zero: **condition (7) exactly**, in the form already extended to
  cover human annotations. A SCOPED claim asserts a search outcome or a
  dataset fact — "no clean population-level frequency WAS FOUND to cite
  here", "zero samples IN THE GENIE COHORT" — and the second is a
  downgrade of the first, which is always available and always
  preferable to a weak substitution.
- **Why mechanized rather than noted (user):** the atlas produced the
  bad form at a HIGHER rate than the good one (4 defective vs 3
  correct at the time of the ruling), every new note is an opportunity
  to write another, and the corpus is heading from 16 entries to ~120.
  Same reasoning as fraction_check: **the population is created by the
  editing, not just found in it.**
- **THREE exemptions, all real instances.** SOURCE-ATTESTED (a named
  source is QUOTED attesting the absence, so the claim is cited rather
  than the atlas's own unrecorded search — pancreas.js:208 quotes the
  site-frequency source saying the site "is not detailed in the SEER
  database"; requires a quotation ≥20 chars plus a citation, and the
  length floor is the discriminator because an attestation is
  sentence-length while a term of art is a word or two).
  SELF-EVIDENCING (colon.js:210 says no canonical figure exists and
  then prints three divergent sourced figures; the dispersion IS the
  support). REASON-GIVING (stomach.js:231 states WHY, which is
  checkable). The REASON connective was deliberately tightened to
  explicit causals — an earlier draft accepted a bare em-dash, which
  ordinary atlas prose contains constantly: **a loose exemption is
  worse than no exemption, because it fails silently in the passing
  direction.**
- **Condition (8) earned its keep on the FIRST run, in both
  directions.** The calibration scan reported 7 sites where hand-reading
  had found 5. One (thyroid.js:263) was a real defect a neighbouring
  clause had laundered. The other (pancreas.js:208) was CORRECT CONTENT
  IN AN UNRECOGNISED FORM, and reading it is what produced the
  source-attested class — a better rule than the reason connective I
  would otherwise have widened. **A first run finds defects the reader
  missed AND exemptions the instrument missed, and the second kind is
  what teaches you the taxonomy.**
- **NEITHER GRANULARITY IS SAFE ALONE, and finding that out cost a
  second read.** Fine clauses fix LAUNDERING (a scoped clause shielding
  an unscoped one beside it). But English spells a list comma and a
  clause comma with the same character, so splitting on commas SEVERS
  the negation from its predicate across a list: "No conflict with
  CDH1, RHOA, or the fusion IS DOCUMENTED." is a textbook unscoped
  claim and the fine split reports NONE on it — a false clean, the
  direction that matters, and **my own remediation then walked straight
  into it.** So the gate runs BOTH granularities and takes the WORSE
  verdict. The cost is over-flagging when an unrelated negation and
  existence verb share a sentence; that costs a read, and a read is the
  cheap error.
- **What it does not claim.** liver.js:243 is not in its output and
  should not be: that sentence IS scoped ("the most recent large SEER
  analysis found for this organ"). Its defect was FACTUAL — it said the
  study didn't examine lymph nodes when the study EXCLUDES lymph-node
  patients by design — and a lexical instrument cannot reach that.
  The rephrase is also **the third time a drift fix produced better
  copy than it replaced** (user): "a study that excludes lymph-node
  patients by design cannot corroborate or revise Katyal's 41%" is a
  sharper reason than "didn't study it", and it is what the source
  actually supports.
- **Capability check on files, not fixtures:** the same instrument
  reports 6 defects against the HEAD tree and 0 against the remediated
  one. The fixtures ARE the real instances, so a clean live run is weak
  evidence of generality — tuning against known answers is sampling on
  the dependent variable. Its real job is REGRESSION INSURANCE on notes
  not yet written; **read its second run, not its first.**

## BATTERY RUNNER (2026-09-05, user-directed; .claude/battery.py)

**AN INSTRUMENT THAT ISN'T INVOKED CAN'T FAIL** (user). This is the
guard on the SET, and it was the last unguarded step: `run_checked.sh`
guards each invocation, `commit_checked.sh` guards the commit message,
`deploy_check.js` guards the deploy — **nothing guarded the set.**

- **The proof it was a real hole, not tidiness.**
  `citation_polarity.py` had been unrunnable since the v2 extractor
  landed (`KeyError: 'refs'`, dead before printing a line) and
  surfaced only because a human ran the whole battery by hand on
  2026-09-05. Ten instruments, and no mechanism could answer "did all
  ten run?".
- **Two assertions; the rest is plumbing.** (1) Every declared member
  of the phase RAN AND PRINTED ITS OWN MARKER — not "was attempted",
  which is a different claim and only the second one is a check.
  (2) **Every tracked file in `.claude/` is declared**, as an
  instrument or explicitly as a non-instrument with a reason.
- **Why assertion 2 exists, in `record_sync_check.py`'s own words:**

  QUOTES .claude/record_sync_check.py
  > an undeclared pair is invisible to this check, and the map is
  > itself a record that can go stale

  That caveat applies to a
  declared instrument list with equal force — it is *this tool's own
  failure mode reintroduced one level up*. Here the closure is cheap
  because the population is one directory, so the list is CLOSED OVER
  `.claude/`: a new file fails the battery until someone classifies
  it, and calling something a non-instrument becomes a decision on the
  record rather than an omission.
- **Phases, because `deploy_check.js` cannot run pre-commit:**
  `pre-commit` (9 members) and `post-push` (1). A third assertion
  falls out — every instrument must belong to a real phase, since a
  typo'd phase name would silently retire one. That is the tool's own
  failure mode sneaking in through its own declaration, so it gets an
  arm.
- **Commit form:** `.claude/commit_checked.sh "<subject>" "DONE "
  python3 .claude/battery.py pre-commit` — the `"DONE "` marker quotes
  EVERY member's DONE line plus the battery's own into the message, so
  a commit records the whole set's numbers verbatim.
- **Demonstrated on the real dead instrument, not a fixture**
  (condition 7): the pre-`03ef214` `citation_polarity.py` was restored
  into the tree and the battery reported `NO DONE LINE:
  citation_polarity — ran without printing its marker (vacuous run;
  the 7-bis failure)` and `8/9`. Assertion 2 also fired unprompted on
  its first run — on `battery.py` itself, declared but not yet staged
  — which is why the message distinguishes NOT TRACKED (exists,
  unstaged, would not ship) from DECLARED BUT ABSENT (stale
  declaration).
- **"reported", not "reported clean"** in the battery's DONE line:
  `regress.js` exits 0 carrying two KNOWN label-overlap failures, so
  "clean" would be false on every green run. Each member's own DONE
  line carries its own findings; the runner counts only
  marker-printed-and-exit-zero and says exactly that.

**DEGRADATION IS WORSE THAN DEATH** (user ruling, same day):
"A dead instrument announces itself. A degraded one produces a
plausible number." `citation_polarity` died loudly and was caught the
same day. `citation_crosscheck` silently degraded from 142 records to
110 without its `argv[1]` artifact — `if len(sys.argv) > 1 else []` —
and printed a normal-looking DONE line over a scan missing 32 records.
It now **REFUSES** without the artifact (exit 2, no DONE line, so
`run_checked.sh` fails the invocation too), its flags artefact is
overridable and self-creating like polarity's, and `battery.py`
regenerates the records first so the refusal only ever fires on a
hand-run without one. Both directions have selftest arms: a refusal
that fired on a legitimate invocation would make the instrument
un-runnable, which is the hole `battery.py` exists to close.

**THE RATCHET — ASSERTION 4** (user ruling, hours after the gap was
named). The runner first shipped naming a **silently shrinking
extractor** as uncovered: it asserted the records artifact was
non-empty and printed its count, so a v3 emitting 300 records where 408
stood would have passed. The stated reason for leaving it — a floor
constant goes stale on the next legitimate corpus growth — is true of a
floor and **the wrong conclusion.** A ratchet does not go stale.

- **Record the previous count, fail on a decrease, let an increase move
  it up automatically.** Growth never trips it, shrinkage always does,
  and a real reduction takes an explicit `--lower-ratchet=N
  --lower-reason="…"` — a deliberate step over the gap instead of a
  silent one, which is the kind of step this project tolerates.
- **A lower moves the bar; it does not switch the check off.** The
  lowered value is applied first and then compared like any other, so
  lowering to 380 on a corpus that actually holds 300 still fires.
  There is no special case for "lower", which is why it cannot become
  an escape hatch.
- **ANY decrease is material, and that is a defined threshold, not a
  hedge.** `extract_citations.py` is deterministic over the local
  corpus, so on an unchanged tree the count cannot move at all. There
  is no noise band to tolerate, and inventing a tolerance would be a
  floor with extra steps — the thing the ratchet replaces.
- **State: `.claude/record_count.json`**, committed (an uncommitted
  ratchet resets on every fresh clone, which is a floor of zero wearing
  a ratchet's clothes), declared in `NON_INSTRUMENTS` as machine-written
  state. **Assertion 2 fired on this file before it existed** —
  `DECLARED BUT ABSENT` — and the battery refuses to run while its own
  selftest fails, so the tool could not create the file it writes. It
  was seeded empty by hand once, on the record in the file's own note;
  counts start absent so the first run INITIALISES and says so.
- **A corrupt state file is a problem, not a reset.** Re-initialising
  from an unparseable file would discard the floor while printing a
  calibration note — the degradation class again, so `load_ratchet`
  refuses instead.
- **Keyed by metric**, so extending it is a declaration rather than a
  redesign. **Which metrics are wired is not listed here** — that is
  `.claude/record_count.json` and the sidecars a run prints, and a list
  in this file would be a second source of truth for something the state
  file already holds. **Still unratcheted, named:** `regress.js`'s check
  count, able to shrink under a green DONE line the same way. Its
  **current value is deliberately not written here** — exactly the class
  the drift rule below names; its own DONE line is the source of truth.
  (This bullet named **two** unratcheted metrics until 2026-09-06, when
  the second — `citation_crosscheck`'s identifier total — became the
  sidecar convention's first producer. The prose had to be hand-edited to
  keep up, which is the restatement hazard demonstrating itself inside
  the passage warning about it, for the second time in one file.)
- **Demonstrated on live extractor output, not fixtures** (condition
  7): with the stored count tampered to 500, the battery reported
  `RATCHET: records SHRANK 500 -> 408 (92 fewer)`, exited 1, and left
  the file at 500 — **a breach does not write itself down.** All 9
  instruments still reported in that run, so the failure was
  attributable to the ratchet alone. 23 selftest arms, including a
  shrink of **one** (the arm that pins "material" to any decrease) and
  a reasonless lower being refused.

**THE SIDECAR CONVENTION — how the ratchet generalises** (user,
2026-09-05). Recorded as a **shape, not a task**, so a later session
finds a plan here instead of a hole. **Read this before writing a new
instrument.**

- **The wrong way** to ratchet the other metrics is to parse the
  numbers back out of each instrument's DONE line: nine formats to
  track, and it recreates the prose-restatement problem *inside the
  runner* — deriving a machine number from a human-facing string is the
  same mistake one level in.
- **The convention:** each instrument emits a machine-readable sidecar
  alongside its human-readable DONE line —
  `SIDECAR {"name": "regress", "metrics": {"checks": 167, "failures": 2}}`
  — so the ratchet reads **structure** and the DONE line stays a
  sentence for humans. Each is then the authority for its own audience
  and neither is derived from the other. The numbers in that example are
  a **form, not a reading**: whatever the run produced. This file is not
  their source of truth either, which is why the two are unnamed above.
- **No sweep.** It applies to the **next instrument written**, and to
  each existing one **when it is next touched for another reason.** The
  ratchet generalises for free over time and nothing is rewritten for a
  gap that is still theoretical — `regress`'s count dropping would
  almost certainly follow a deliberate code edit rather than the silent
  producer change the extractor demonstrated.
- **The reader ships with the first producer, not before it.** A
  consumer with no producer could only ever be demonstrated against a
  fixture, and the standard here is capability shown on real output
  (conditions 7 and 8). Whoever writes that instrument wires both ends
  and gets the live demonstration for free; building the reader today
  would spend it.

**IT SHIPPED THAT WAY** (2026-09-06, with `citation_crosscheck`). **The
trigger was the convention's own**, not enthusiasm: crosscheck had to be
touched anyway for an independent and sufficient reason (below), it is a
battery member, so every run until it was fixed could absorb a blip and
present a smaller corpus as clean. That is an **active hole in the chain,
not a deferred improvement** — and the sidecar and reader came along
free, which is precisely the case "when it is next touched" was written
for. Deferring would have meant touching crosscheck twice, or building
the reader later with no producer.

Three things **only the live wiring could have taught**, each of which
would have been guessed wrong on a fixture:

- **A `ratchet` array is part of the convention, not an extra.**
  crosscheck reports `records` beside `flags`, and those are different
  kinds of number: `records` is **coverage** and must never shrink,
  `flags` is a **defect count** — ratcheting it would fail the battery
  for *fixing a flag*. **Only the producer knows which is which**, so the
  producer declares `"ratchet": ["records"]` and the reader ratchets
  nothing it was not asked to. A reader that ratcheted every metric it
  saw would have punished every repair.
- **That array opens a producer-side loophole, closed in the same
  commit.** Any instrument could stop being watched by dropping a metric
  from its own array, or by ceasing to print the sidecar — every later
  run still green, one metric fewer under guard. `vanished_ratchets()`
  fails on both, **against committed state rather than a hand-maintained
  map of who-reports-what**, because such a map is exactly the staleness
  assertion 2 exists to refuse. Same shape as assertion 1, one level in.
  It is **scoped to members that ran, reported and exited zero**: a
  failing member is already failing by name and its absent sidecar is a
  *consequence*, so an unscoped reader would have printed "you dropped
  your ratchet" on top of crosscheck's own abort and pointed at the wrong
  thing. That scoping opens nothing, since a producer that quietly stops
  ratcheting still exits zero and is still in scope.
- **Metric keys are namespaced per producer, and that is a finding rather
  than a style choice.** Two different numbers are both called `records`
  — the extractor's corpus total and crosscheck's identifier-carrying
  subset, which is much smaller. Unnamespaced, **the reader's first live
  run would have compared one against the other and fired `RATCHET
  SHRANK` on a corpus that had not moved.** A new gate whose first act is
  a false positive teaches people to reach for `--lower-ratchet`, which
  is worse than the gap it closed. The key is `<producer>.<metric>`; the
  extractor's bare `records` is left alone, so no existing state migrates.
- **`--lower-ratchet` keeps its bare form.** `=N` still means the
  extractor's metric, because that is what the documented flag has always
  meant; a sidecar metric is addressed `=<producer>.<metric>:N`. Silently
  repurposing a documented flag to gain uniformity would break the one
  escape hatch the ratchet has, for style.
- **Demonstrated live in all three directions, not on fixtures**
  (conditions 7 and 8): run one **initialised** the metric and said it
  was calibration; run two **held** it; and a deliberate probe lowering
  the bar *above* the real value fired
  `RATCHET: citation_crosscheck.records SHRANK 150 -> 142 (8 fewer)`,
  exited 1, and **left the state file byte-identical** — a breach still
  does not write itself down. The DONE line carries the count of metrics
  actually ratcheted, so a reader that silently read nothing would say
  `0` rather than looking like a quiet pass.

**A FOURTH PROPERTY** (2026-09-07, user ruling), and the only one found
by a ratchet **misfiring** rather than by wiring one up. Its other home
is the fourth item of `battery.py`'s sidecar-convention block.

- **A ratcheted metric must derive from tracked files.** In the user's
  words: *"what ships is what's tracked — a fresh checkout has only
  tracked files, so any ratcheted metric derived from a filesystem glob
  records a number a clean checkout cannot reproduce."*
- **The incident.** While `.claude/pointer_check.py` was still an
  untracked draft, `internal_quote_check` globbed `.claude/`, counted the
  draft's marked quotes and moved its ratcheted `marked` floor **up to a
  value no clone can reach** — so a fresh checkout would fail `SHRANK`
  with no defect anywhere in it. `battery.py` was the one that was right:
  its `tracked_claude_files()` already read git's index, and **the two
  instruments disagreed about what the corpus is.**
- **Fixed at every ratcheted producer**, reading the **index rather than
  `HEAD`** so a newly `git add`ed file counts in the commit that adds it:
  `internal_quote_check` and `pointer_check` over `.claude/`, and
  `extract_citations` over `js/organs/` — whose `corpus_paths()`
  `citation_paren_ledger` now **imports** instead of keeping its own
  byte-identical copy of the same glob, which was a second population
  free to drift from the first.
- **Measured behaviour-neutral on the day**: the glob and the index
  listed the same corpus and `git status --porcelain --untracked-files=all`
  was empty, so no record moved and the read-every-removal rule had
  nothing to read. That is the only way to satisfy it with no diff.
- **Scope declared in both directions.** Three instruments still glob
  `js/organs/` — `citation_head_check`, `citation_reach_check`,
  `fraction_check` — and are **left that way**: each declares
  `'ratchet': []`, and for a pure defect count, seeing an untracked draft
  organ is a **feature** (it fails loudly on a file that will not ship,
  where missing a tracked one would be silent). Each carries the trigger
  as a comment **on its own glob line** — the line that would have to
  change — rather than only in a header nobody adding a ratchet reads.
- **Not mechanised — considered and DECLINED on evidence** (user ruling,
  2026-09-07), which is a different note from a held shape and is written
  as one deliberately. A fifteenth battery member is buildable: the
  property is decidable from source text — a tracked `.claude/*.py` that
  both calls `glob.glob` and declares a non-empty `ratchet` array — so a
  checker would have named all four sites **by inspection instead of by
  waiting for one to fire**.
  - **The reason is that the ratchet already *is* that guard**, in the
    user's words: *"a glob-derived metric counts untracked files, so it
    records a number higher than the tracked corpus supports. On a clean
    checkout the count comes back **lower** — and a lower count is exactly
    what the ratchet fires on. Loudly, with a named metric, one checkout
    away."* The new member would catch **at authoring time** what the
    existing mechanism already catches **at checkout time**. Earlier is
    nicer; it is not load-bearing.
  - **The other polarity was checked, not assumed** — "the guard already
    fires" is a claim about both directions. A glob can see *fewer* files
    than the index only when a **tracked** file is missing from the working
    tree, and then the count drops in the author's own tree, so `SHRANK`
    fires there rather than one clone later. The index readers that
    replaced those globs behave the same way on the same input:
    `internal_quote_check` and `pointer_check` skip a missing file via
    `os.path.exists`, so its absence **lowers** the count instead of
    crashing the run, and `extract_citations` does not guard its read at
    all, so it raises — and a gate with no DONE line is a refusal. Loud in
    every one of those shapes.
  - **The cost of declining, declared**: detection is later, the
    diagnosis is indirect (the message names a metric that `SHRANK`, not
    "your floor came from an untracked file"), and it lands on whoever
    clones next, who did nothing wrong. The written record is what buys
    that down — it is the thing to find when `SHRANK` fires on a fresh
    clone with a clean tree.
  - **DEMONSTRATED BY A ROUTINE RUN, NOT BY A HAND AUDIT** (2026-09-08,
    user: "a graduation worth noting"). The first settle run for `7d6c221`
    printed `RATCHET RAISED: pointer_check.pointer.pointers 580 -> 584` on a
    CLAUDE.md draft that had named four adjudicated sites by `file:line`,
    the form the pointer ruling retired. Every prior instance of a defect
    written while documenting one — the stale pointers in the pointer
    instrument's own header, the heading that broke its own uniqueness,
    the slash-joined composite — was found by a hand audit or by an
    instrument on its first run. This one was caught by an existing guard
    on a routine run, on a population change that WAS the defect. In the
    user's words, that is the class moving from "found by looking" to
    "caught by the chain", and the mechanism is the one this decline
    leaned on: *the ratchet fires on the population, and the population is
    what a bad pointer changes.* It fired at authoring time, in the
    author's own tree, because a settle run before staging is a checkout
    of the tree about to be committed — so the declared cost of declining,
    later and indirect and landing on whoever clones next, was paid by
    nobody. The pointers were replaced by file-plus-span and the raise was
    discarded rather than staged.
  - **The bar is reusable, which is why the reasoning is recorded and not
    just the verdict: "the existing guard already fires on this" is enough
    to turn down a new instrument.** Same reasoning that stops the chain
    at four layers, one level down. Contrast the two genuinely *held*
    shapes so this is not misread as one: the sidecar reader (held until a
    producer existed, then shipped) and `record_sync_check`'s marker token
    (held, pending a change across every declared pair) both read *"not
    yet"*. This one reads *"no"*.
- **And where the fix is a specific line, the note goes on that line**
  (user ruling, 2026-09-07; general form in `battery.py`'s block, which
  is where an instrument or matcher author is told to read). One
  designated location is necessary and **not sufficient**: the same-bug
  pair in that block's family enumeration broke twice one day apart even
  though the lesson had been written at the site that fixed it, because
  the person editing a *different* file never opened that header. The
  constraint is invisible where it binds. A comment on the exact line
  that would have to change cannot be missed by the person changing it —
  and with the checker above declined, **that comment is the mechanism**,
  not a reminder that one exists.
- **The procedural half, recorded where a commit boundary gets drawn**
  (`.claude/commit_checked.sh`, beside the sequencing rule): **gate the
  tree you're committing, not the tree you're working in.** Those diverge
  the moment an untracked file exists, and the bad ratchet value above was
  caught only by moving the draft aside and re-running.
  - **THE SAME RULE ONE LAYER OUT, AND IT IS PRACTICE RATHER THAN A SHAPE TO
    BUILD** (user ruling, 2026-09-08). That rule says the tree you are about
    to commit is not necessarily the tree you are working in. The same
    failure with a different artefact says **the file you are about to write
    is not necessarily the file you read.** Observed this session: a second
    session appended to a prose index outside this repo while it was being
    consolidated, between the read and the write. **Nothing in this chain
    guards that and nothing should** — the battery, `record_sync_check` and
    every ratchet assume a single writer, and that file is not in the repo at
    all, so no gate here can reach it. Neither half has a mechanism; both are
    **read immediately before acting**, and that is the entire remedy. It
    held: the other writer's append survived underneath the consolidation
    because the file was taken as FOUND rather than as LOADED. The reason to
    write it down anyway is that a single-writer assumption is invisible
    until it is wrong, and its failure is silent — an overwrite leaves a
    clean tree and a green gate.
- **AND THE RULE EXTENDS PAST METRICS TO REASONING: UNTRACKED THINGS ARE
  NOT PART OF THE CORPUS, INCLUDING THE CORPUS OF CONVENTIONS** (user
  ruling, 2026-09-07, correcting their own earlier sentence — the second
  time this rule has been found by watching it broken rather than by
  wiring it up). Declining the `ccf_load` instrument, the ruling cited
  *"the `pointers.py` precedent — a script whose output is evidence rather
  than a gate."* I reported that no such file exists. **That was the wrong
  correction.** It does exist, at `/tmp/atlas-guard/pointers.py`, saved
  during the pointer census; the defect was calling it a **precedent**, in
  the user's words *"when a file outside the repo can't be a precedent for
  how to declare something inside it."*
  - **THE FILE BEING PRESENT IS WHAT MAKES THE POINT, NOT A WEAKENING OF
    IT.** It is on this disk right now, 8981 bytes, readable by anything
    running here — and still cannot be cited, because **presence on one
    machine is not the test; being in the index is.** A precedent has to
    be something a fresh clone can find, for exactly the reason a ratchet
    floor has to be a number a fresh clone can reproduce. Same rule, one
    level up: the tracked set bounds not just what gets measured but
    **what may be appealed to.**
  - **AND THE PROHIBITION HAS A DIRECTION — which is the half that keeps it
    from reading as a contradiction later** (user ruling, 2026-09-08, on
    noticing the property above was stated as a prohibition with its
    direction never worked out): **OUTWARD IS FREE; INWARD NEEDS THE INDEX.**
    A tracked rule may govern something outside this tree — it carries its
    authority with it. An untracked thing may not be appealed to for
    anything inside this tree — it has none to carry. So the
    read-every-removal procedure governing a consolidation of a prose index
    that lives outside this repo is **not** a breach of this property, and
    `extract_citations.py` says so at the line where the two would otherwise
    look inconsistent. **Record the direction at the moment the two sites
    could be compared, not when the objection arrives** — the objection
    arrives as a re-litigation of the rule, and by then the person raising it
    has already read both sites and concluded they disagree.
  - **The real exemplars are `figure_search.py` and `extract_citations.py`**
    — tracked, declared, output-is-evidence — and `ccf_load.py`'s header
    cites those. Note the trap in the near-miss name: `pointer_check.py` IS
    tracked and IS in `.claude/`, and it is an **instrument**, so citing it
    would have imported the opposite standing to the one intended.
  - **The verdict was unaffected**, which is why this is filed as a
    reasoning defect and not as a reversal: the decline stands on
    commit-binding, and only the exemplar was wrong. **Say which half of a
    ruling the error touched** — reporting "your precedent doesn't exist"
    when the truth is "your precedent isn't citable from here" invites a
    re-litigation of the decision instead of a fix to the citation.
  - **THE THIRD INSTANCE OF ONE CLASS, AND ITS NAME (user ruling, 2026-09-08):
    A CLAIM ABOUT THE REPO'S CONTENTS CARRIED FROM A SESSION SUMMARY RATHER
    THAN READ FROM THE TREE.** The `pointers.py` precedent cited from memory
    is the first. The second is the 2026-09-07 "personal files moved out"
    report accepted without checking the population it actually measured —
    old paths, not the tree — which stood false for three days. The third is
    `f26bf63`'s correction: the 7d6c221 bullet that called the testis
    bare-plural comparison open when `6e3c310` had removed it from the served
    field two days earlier, written from a compaction summary's open-items
    list. The three differ in what they asserted and agree in where the
    assertion came from. **THE REMEDY IS THE FORM RULE ONE LEVEL UP: A CLAIM
    ABOUT THE TREE GETS READ FROM THE TREE** — not from a prior report, not
    from a summary, not from memory of having done it. The form rule replaced
    an ambient cwd with an absolute path because ambient state is invisible in
    the transcript; a summary is ambient state one level up, and an open-items
    list inherited from one is a set of claims about the tree, each of which
    is read against the tree before it is repeated.

**A FIFTH PROPERTY** (2026-09-07, user ruling), and the only one found by
misreading a green DONE line rather than by any check firing.

- **`set unchanged` reports the record set, not the sidecar metrics.** In
  the user's words: *"Those move independently, and reading one as covering
  the other is what left `record_count.json` dirty."* Written in that
  specific form on ruling, because *"'check the tree after the gate' is the
  vaguer version that wouldn't have caught it"* — the general advice says to
  look but not what at, and the whole defect is a reader who believed the
  looking had already been done for them.
- **The incident (`1145d01`).** The battery reported the record set
  unchanged, which was true, and I read it as *nothing in
  `record_count.json` moved*, which was not: `internal_quote.marked` and
  `pointer.pointers` had both ratcheted up in the same run. The file stayed
  dirty through the commit, layer four went red on a clean-looking tree, and
  **amend is forbidden here**, so the repair cost a whole forward commit
  (`7de8f07`). One green line, read one clause too widely.
- **THE REMEDY ALREADY EXISTED IN THE TOOL'S OUTPUT, WHICH IS THE
  UNCOMFORTABLE PART.** The battery prints `RATCHET RAISED: <metric> A -> B
  — growth moves it up with no ceremony; git add .claude/record_count.json
  in this commit`, naming the metric and the exact command. It printed that
  at `1145d01` too. So this was never a missing mechanism; it was an unread
  line, and no sixth layer would have helped — the fifth would have been the
  same words one line further down.
- **Verified as fixed on the next commit that could have repeated it**
  (`ad134b3`, whose `refusals.log` entry carries the raise verbatim):
  `citation_crosscheck.records` moved when a new author entered the corpus,
  the raise was caught before staging, `record_count.json` went in with the
  change, and the tree was clean afterwards. **The check that catches this
  is `git status` before the commit, not after it** — after is where the
  amend ban makes it expensive.
- **And the two halves can disagree in the other direction too**, which is
  what makes the claim precise rather than a slogan: a run can move a
  sidecar with the record set frozen (this session, where a citation left
  and another arrived and the total held), and it can move the record set
  with every sidecar frozen (any pure line shift, reported as `moved`).
  Neither number implies the other in either direction, so **read both**.

## REPAIRING A LINE SHIFT: NO SINGLE INSTRUMENT'S OUTPUT IS THE WORKLIST (2026-09-07, user ruling)

**One 21-line comment insertion into `js/organs/lungs.js`, three instruments
that resolve `file:line`, three different reads — and none of them wrong.**
Each answers a different question, so each is incomplete as a worklist:

| consumer | what it answered | what it said |
|---|---|---|
| `record_count.json`'s `record_keys` | did the record SET change? | **nothing** — a same-file shift is `moved`, by design |
| `pointer_check.py` | do hand-typed refs still land on their referent? | **5 refs OFF LINE**, with a nearest-candidate hint |
| `citation_paren_ledger.py` | is every scored span still scored? | **2 problems from ONE unmoved span** — `STALE` at the old address, `UNSCORED` at the new |

- **THE PROCEDURE: cross-check across consumers, then repair by CONTENT.**
  Run all three, take the union as the worklist, and resolve each site by
  matching the **old line's exact text** against the working copy — not by
  adding the diff's offset, and not by accepting a tool's suggestion.
- **THE CONCRETE COST OF TRUSTING ONE OUTPUT IS MEASURED, NOT HYPOTHETICAL:
  `pointer_check`'s hint was wrong on 1 of 5.** For the ref at `:236` it
  named `Yoshizawa|2011` at `:253` — the right answer was `:259`, because
  that name+year occurs **twice** in the file and the hint names the
  *nearest*. The offsets even agree (+17 and +23 are both plausible for a
  +21 insertion), so arithmetic cannot break the tie. Content can. This is
  `NEAREST IS NOT IDENTITY` firing a fifth time; the hint proposes and
  **never applies**, and that is why.
- **ONE SPAN CAN PRODUCE TWO PROBLEMS, so problem count is not site count.**
  The ledger reports the old address as `STALE` and the new one as
  `UNSCORED` — two lines of output, one edit to make. Counting problems
  would have over-estimated the work and, worse, invited two independent
  "fixes" to one span.
- **RE-ADDRESSING IS NOT NEW EVIDENCE — `basis` STAYS `FIT` THROUGH A MOVE.**
  The span was byte-identical; only its address changed. Scoring it `TEST`
  because its line number moved would **manufacture support for the very
  rule it is recorded to withhold support from**. An address is not an
  identity. The rationale sits above the key in
  `citation_paren_ledger.py`, on the line that changed.
- **AND CLASSIFY THE SITES BEFORE REPAIRING ANY: AN ADDRESS IS LOAD-BEARING
  ONLY WHERE SOMETHING RESOLVES IT.** 17 sites named the old address; **9
  were live identities and got repaired**, and the rest were left alone on
  purpose — opaque fixture strings in `battery.py` (nothing resolves them,
  so they are just bytes), FLOOR-only prose, and **a dated transcript of a
  real run, which is annotated rather than corrected**: rewriting it to
  agree with a tree it predates would make it a worse record, not a
  fresher one. A sweep that "fixed" all 17 would have broken three
  fixtures and falsified one transcript.

## WHAT COUNTS AS A DONE LINE (2026-09-06, user ruling; `.claude/commit_checked.sh`)

**The commit gate quoted by substring on a hand-passed marker, and that
failed in both directions at once — neither of which announced itself.**

- **TOO WIDE — prose got quoted.** Any line containing the literal
  `DONE ` was copied into the message, so selftest arm *descriptions*
  mentioning "DONE line" landed in the permanent record beside real gate
  output. **Present in `58748d3`, `a3e5015` and `aafbe04`** (two lines
  each in the first two, three in the last). Not a wrong number — every
  real DONE line is still verbatim — but a reader cannot tell a gate's
  own words from prose, in the one artefact whose whole purpose is being
  a gate's own words.
- **TOO NARROW — a gate went missing, and this is the worse half.**
  `regress.js`'s marker is `==== DONE: …`, which **does not contain
  `DONE `** — the character after `DONE` is a colon. So the *documented*
  aggregate invocation `commit_checked.sh "<subject>" "DONE " python3
  .claude/battery.py pre-commit` **silently dropped the 167-check
  regression from the commit message.** `aafbe04` has no regress line;
  `a3e5015` and `58748d3` do, because those runs were given the marker
  `DONE` without the trailing space. **The most important gate in the
  chain came and went from the record depending on one invisible
  character in an argument typed by hand.**

**The ruling: quote by FORM, not by the passed marker, and name both
forms explicitly.** A naive `^DONE ` anchor fixes the prose and *keeps*
the regress hole — a gate getting quieter without saying so, which is the
failure class this whole chain exists for. The form it took, and the one
copy of it in this file that is machine-checked against its source:

QUOTES .claude/commit_checked.sh
> DONE_LINE_RE='^DONE |^==== DONE'

- **Do not reword the arm descriptions** (user). That changes the data to
  fit the matcher, which **hides the constraint rather than removing
  it**: the next person who writes "DONE line" in a description
  reintroduces the pollution and nothing tells them why they shouldn't.
- **The passed marker still governs refusal.** The caller declares which
  gate they are gating on. A separate stricter marker check was written
  and **removed the same hour**: with quoting anchored, the empty-capture
  test already refuses a prose-only run, and `run_checked.sh` already
  fails a marker typo — so a third check would have added only a way to
  refuse a *legitimate* invocation, since `DONE ` does not appear in
  regress's line. **Redundant checks are not free when one of them can
  fire wrongly.**
- **`battery.py`'s `run_member()` now indents by the same two forms.**
  Indentation decides whether the anchored matcher can see a line, so
  printer and matcher must agree on what a DONE line *is*. Marker-based
  indenting already had a latent instance: a member whose selftest prints
  `DONE <name>_selftest:` does not contain its own marker `DONE <name>:`,
  so it was indented and would have been dropped — `deploy_check`'s is
  exactly that shape. The definition is **duplicated across a `.sh` and a
  `.py`, knowingly**, and both sites say so and name each other.
- **CONDITION (7) APPLIED TO A MATCHER** (user): *show it still finds
  what it used to find, not just that it drops what you wanted dropped.*
  Verified against real gate output and against all three historical
  commit messages — the old matcher's own captures. New matcher keeps
  **every** line beginning `DONE` or `====` in all three, drops **only**
  indented prose, and **restores** regress's line. `aafbe04` keeping one
  fewer than the other two is the silent loss showing up in the
  arithmetic. Three new selftest arms, including the regress form under
  the documented aggregate marker — the arm that would have caught it.
- **The three polluted commits are left alone** (user). History is
  append-only by construction, immutability is a standing condition, and
  it is what makes `git show a131649:assets/*.glb` the masters archive.
  **Cosmetic cleanup of a commit message is nowhere near worth touching
  that.** The pollution is recorded here with its range instead:
  `58748d3` … `aafbe04`, 2026-09-05 to 2026-09-06.

## A STATUS CLAIM CARRIES ITS BACKING — the fourth property of a declaration (2026-09-09, user ruling)

A `cited` margin status rested on a harvest seed for four build commits and
nothing could see it: the status census counts declarations, and it cannot
tell a declaration backed by a citation from one backed by a seed. The seed's
sentence was about a different entity (encapsulated FVPTC, not follicular
carcinoma). Closed with the discipline already in place — **a `cited` status
must carry a resolvable identifier (PMCID, PMID, NBK, DOI) in its own ref or
in the ledger record its R-number resolves to** — as an extension to
`margin_reserve_check` — since renamed `reserve_check` — (`citedBackingViolations`), not a new member. A seed
has none, so the check fires at build step 1 rather than at wiring time.

This is the fourth property of a declaration, after evidence-not-conclusion,
reason-required and closed-enumerated-set (the three the coverage-split
section below and the battery's declared sets already enforce). **The other
three govern what a declaration says; this one governs whether it is entitled
to say it.** Its limit is stated in the check's header: an identifier proves a
source EXISTS, not that it speaks of the entry at gross register — that
remains the read's job under the register rule. Guard before repair applied:
the check was written and run first, fired on exactly the three seeded
statuses (TNBC, GBM, prostate acinar), and that output was the worklist.
**The harvest stays useful, gated by this property rather than distrusted**
(user): it found histology because the atlas's own richest prose is
histologic — a selection effect in the instrument (good recall, poor
register precision), not a property of the entries — and the property
catches exactly that failure.

## BODY MARKERS RESOLVED, BUT NOT CORRECTLY — the placement check (2026-09-09, user finding)

THE BUG: the two Testis markers rendered on the LEGS. THE MECHANISM: the spec
sat at `heightFrac 0.40`, below the male mesh's crotch (the perineum is at 0.453
of standing height, 0.464 on the female mesh — measured by a ray up the central
axis from under the feet), so `findBodySurfaceAnchor`'s inward ray entered the
inter-leg gap and took `hits[0]` off the front of each thigh: valid geometry,
wrong body part, 17 cm off the axis against a trunk exit of 4 cm. The spec's own
comment shows it was tuned for pixel SEPARATION between the two dots and never
for placement — the "comfortable ~55px" it settled on was the symptom (two
thighs are far apart; two testes are not).

THE FINDING WORTH MORE THAN THE BUG (user): **`regress.js` verified that markers
RESOLVE, not that they resolve CORRECTLY.** The body is a closed mesh, so the
raycast always hits something and the miss-logging never fires; 15/16 visible
with matching minDist pairs was green while a marker sat on a thigh, since the
specs were written. The floor-versus-identity gap of the prose pointers, in the
body screen: range-checked, not identity-checked. **On a medical atlas an organ
marker on the wrong body part is the same severity class as a wrong figure** —
something a reader carries away as fact — so it was fixed in its own commit at
once, not batched.

THE CHECK, guard before repair (`regress.js`, 'body marker placement <sex>'):
two facts per marker read from the mesh itself — BELOW-CROTCH (anchor lower
than the perineum hit) and BEYOND-TRUNK (from the axis at the anchor's height, a
double-sided probe ray toward the anchor exits the trunk/head column at some
distance; an anchor more than 3 cm farther out sits on a limb the inward ray met
first). Identity is READ, not inferred: `body.js` now stamps every marker sphere
with `userData.marker` (organ, sex, spec point, declared site); a spec point may
declare `site:'limb'` and is exempt — exactly one does, skin's female lower-leg
marker (CONCORD-3). Per-anchor geometry lands in `body_marker_anchors_<sex>.json`.
THE WORKLIST IT PRODUCED, before any repair: exactly the two Testis anchors on
the male body; every other marker on both bodies sits on the trunk column (the
"more than one" prediction answered in the negative), with one margin worth
knowing — Prostate at 0.458 clears the male crotch by 0.005 of height, about
8.5 mm on a 1.7 m body: THE FINDING, NOT A FOOTNOTE (user). Nothing moves — the
prostate genuinely sits that low — and the margin is recorded beside the spec in
prostate.js, because it reframes what the audit bought: not the one defect it
found but the conversion of a scheduled silent failure (any re-export, mesh swap
or change to the crotch measurement) into a loud one. The L2 re-export is NOT the
cause — AN INFERENCE, NOT A MEASUREMENT: 0.40 is 9 cm below the crotch and
Catmull-Clark moves surfaces by millimetres; the 21K cage was not re-measured and
this must not be remembered as if it had been. ON PREDICTING COUNTS (user, on
their own errors running both directions — three dry wells that were not dry, one
family that was a single): the lesson is not to adjust the prior; it is to stop
predicting counts and specify the measurement, which is what the guard did anyway.

THE FIX, probed on a height/angle grid with the check's own two tests: 0.455
still lands under the crotch (the curved surface puts the hit at 0.4527); 0.457
is the lowest height on the trunk column — the lowest front of the pelvis, where
the scrotum hangs — and ±30° gives the pair 16px at the default framing, 3.3 cm
either side of the midline. Look: before/after crops of the regression's own
male screenshot (evidence under /tmp/atlas-verify/audit2/, ephemeral) — before,
two dots on the thighs below the pelvic cluster; after, both at the base of the
pelvis, nothing on the legs. BASELINE MOVED, as expected of a placement fix:
male minDist 10px (Prostate~Bladder) → 4px (Prostate~Testis); female unchanged
at 4px (Ovaries~Bladder); regress 169 → 171 checks, the 2 known failures
unchanged. The 4px pair is anatomy — prostate internal, scrotum external, one
height on the front surface — the crowding FLOOR, not tuned away; the marker
SIZE pass that follows is sized against the measured pairwise separations.

## BODY MARKER SIZE — a conflation, not a constraint; sized against a measurement (2026-09-09, user)

The body spheres were at 23px visible because "the spheres dipped under the floor
when zoomed out" — but Tier 1 had already separated VISIBLE SIZE from HIT TARGET:
the body click and hover paths use the 24px screen-space test
(`BODY_MARKER_HIT_RADIUS_PX` 12) and the 24×24 DOM proxies hold the WCAG floor, so
the sphere is free to shrink and the organ screen already ran this way at 11px.
Placement was fixed first (previous section), because a marker on the wrong body
part is part of the perceived crowding.

THE MEASUREMENT (regress.js `body_markers_<sex>.json`, every visible marker at
the default framing): female 15 markers, 105 pairs — 4.1px Ovaries~Bladder, then
13.4px the Ovaries pair, 14.1px Pancreas~Stomach, 14.9px Ovaries~Bladder (other
side), 17.0px Ovaries~Colon and Ovaries~Kidneys; male 16 markers, 120 pairs — 4.0px
Prostate~Testis, 7.2px Testis~Bladder, 10.0px Prostate~Bladder, 11.7px
Pancreas~Stomach, 12.6px Prostate~Testis (other side), 14.4px the Testis pair. THE
RULE — visible diameter below HALF the minimum pairwise separation — cannot be met
by any legible dot: half of the true minimum is 2px, and even excluding the pelvic
set it is 5.8px, against the Pancreas~Stomach pair, which is itself anatomically
adjacent (the stomach lies over the pancreas). The rule was set against the global
minimum where the pelvic cluster is adjacent anatomy and overlap is the correct
depiction — a mis-specification the user named, and the reason reporting beat
relaxing it. So the pairs under ~12px are
reported as THE FLOOR — genuine anatomical proximity on one height of the front
surface, not a rendering fault — and the size is chosen against everything else.
**11px**: the organ screen's value (one law product-wide), a 2.1× reduction; at
11px the only overlapping pairs at the default framing are the pelvic set (female
Ovaries~Bladder; male Prostate~Testis, Testis~Bladder, Prostate~Bladder); at 23px
there were 9 (female) and 10 (male). Constant-screen-size behaviour kept — it is
what separates markers as the user zooms in. Hit test untouched.

VERIFIED: regression re-run on the size-changed tree — placement green both sexes,
minDist pairs and values identical (female 4px Ovaries~Bladder, male 4px
Prostate~Testis), 15/16 visible, centres unmoved apart from two male markers by 1px
between runs (auto-rotation timing, not the diameter). Look: torso crops of the
regression's own screenshots (/tmp/atlas-verify/size3/, ephemeral) — at 23px the
abdominal discs merge into blobs; at 11px every dot is distinct inside its ring and
only the pelvic cluster still stacks.

THE PELVIC HIT TEST, MEASURED AND NOT REPAIRED (user: measure first). Three
targets inside 10px with 24px rings; the app's rule is in-radius 12px then DEPTH
(nearest to the camera wins). Probed in-page on the male body at the default
framing, clicking each pelvic marker's own centre: prostate → BLADDER selected;
testis(L) → BLADDER selected; testis(R) → testis(R); bladder → bladder. Nearest-
centre would have matched the clicked dot in all four cases. At the six pair
midpoints the two rules disagree in six of six (ambiguous by construction). Camera
distances differ by ~1.5% (bladder 3.663, prostate 3.684, testis(L) 3.721): these
markers sit at similar depth on one surface, where depth is the wrong
discriminator — depth is right when one thing occludes another. Recorded as a
measurement at one camera pose (the body auto-rotates; the order of depths changes
with yaw); no change made. Evidence: the probe's table, ephemeral under /tmp.

REPAIRED (user authorization, same day): not a preference between two rules but one
rule wrong at the only input where correctness is unambiguous, and non-deterministic
under auto-rotation on top. Restructured, not swapped: DEPTH IS A VISIBILITY GATE
(an occluded marker is never eligible — the old far-side click-through is gone),
NEAREST CENTRE IS THE CHOOSER, one exported picker shared by click and hover
(`pickBodyMarker`). THE GATE'S MECHANISM WAS MEASURED, NOT ASSUMED. First candidate,
a facing test on the anchor's stored normal: across 24 yaws on both bodies NO
threshold on normal·toCamera separates visible from occluded markers (visible dots
down to −0.93 on the skin's leg marker, occluded up to +0.80) — parametric
distinctness is not perceptual distinctness, again. Second candidate, an exact
camera→marker raycast: correct, but ~24 ms per call on the 339K-triangle body — the
regression's oracle, not a hover path. Chosen: a DEPTH-BUFFER TEST — when a pick has
candidates, the body is rendered once with `MeshDepthMaterial` (RGBADepthPacking)
into an offscreen target with the marker spheres excluded on their own render layer,
and each candidate's centre is compared with the body depth at its pixel (1 cm
tolerance; a centre sits 5 mm outside its surface). Exact at pixel resolution, no new
dependency, nothing spent when the pointer is over empty canvas. TWO LESSONS PAID
FOR ON THE WAY: (1) three 0.185's RGBADepthPacking puts the MOST SIGNIFICANT BYTE IN
RED — the first unpack read alpha as the MSB (the older layout) and every marker
came out occluded; the raw bytes at a visible pixel settled the order and the fix
reproduces the marker's own depth to five decimals — measure the packing if three is
ever re-pinned; (2) THE ORACLE MUST MEASURE WHAT THE GATE MEASURES: a zero-width ray
to the exact marker point disagreed with the 3 mm pixel at three silhouette edges in
279 samples; the oracle now casts through the centre of the sampled pixel, so a
disagreement is a defect in the pass, the unpack or the mapping, never quantisation.
THE ASSERTION, the picking counterpart of the placement check (`regress.js` 'body
marker picking <sex>', through the module's own exports, never a replica): every
eligible marker's own projected centre selects that marker, and the gate agrees with
the raycast oracle at the default framing and across an 8-yaw sweep — green at
15/15 + 16/16 own-centre picks, 0/248 sweep disagreements, both bodies. Regress
171 → 173 checks, the 2 known failures unchanged.

## CONTENT-ANCHORED POINTERS — the cost, estimated not paid (2026-09-09, user: "I want the number, not the change")

Third pointer-shift refusal (testis comment, prostate note, and the class before them).
MEASURED with `pointer_check`'s own `collect()`: 581 hand-typed `file:line` occurrences
(339 in `citations.json`'s refs, 70 in CLAUDE.md, the rest in instrument headers and
fixtures), 281 distinct targets across 20 files, all organ files; 266 carry an
author+year oracle. ANCHORABILITY: 572 of 581 target lines are unique in their file by
whole stripped text, so a `path:"quoted line"` form converts mechanically; 9 point at
structural lines (`];`, `};`, a blank, a comment rule — span ends) and need a
line-after-phrase form or a hand anchor; 7 more are under twelve characters (weak but
unique). THE COST: a converter (~1.5 h), a resolver in `pointer_check` with arms and
unchanged ratchet semantics (~2 h), the two consumers that split refs on `:` —
`regress.js`'s citations check and the manifest's `code_refs` format — (~1 h), the run
and a diff review across the 20 target files' homes (~1 h), the nine by hand (~0.5 h):
**about six hours, most of a day.** By the ruling's own threshold (an hour is worth it, a
day is not) THE WORKAROUND WINS: notes go on the existing line or in CLAUDE.md, and an
insertion above pointed lines in an organ file is expected to trip `pointer_check`.
Re-estimate if the refusal count keeps climbing — the converter is 98.5% mechanical.

A HARNESS HAZARD FOUND ON THE WAY, fixed in the same commit: `regress.js` read
`assets` and the manifest's code_refs relative to process.cwd(). The battery always
pinned cwd to the repo, so it never saw it; a standalone run launched from /tmp
produced two false FAILs (and my own scratch server, started from /tmp, served a 404
page first — the same ambient-cwd class, twice in one pass). Explicit form over
ambient state: the harness now roots every repo read at its own location, proven
by a run launched from /tmp reporting the same 171 checks / 2 known failures.
GENERALISED THE SAME DAY (user): **a wrapper that reliably supplies a condition
hides every dependency on it** — the battery pinned cwd for every member, so the
sweep that followed found 4 of 15 independent, 8 failing loudly from /tmp and 3
passing GREEN over an empty corpus. The rule, the table and the mechanism (every
member runs from a bare directory; the counts, not the verdict, are the
discriminator) live as convention D in `battery.py`'s READ THIS BEFORE WRITING A
NEW INSTRUMENT block, which is where a new member's author is told to read.

## READ COVERAGE BY IDENTITY INTO THE FACTS FILE — a house pattern (2026-09-09, user: "write it down as one")

Twice in one day a suspicion became a number because the harness wrote, into its own
facts file, a count read BY IDENTITY from the objects it was testing rather than
inferred from what they looked like: `body_marker_anchors_<sex>.json` (every anchor's
height fraction, radial distance and trunk exit, keyed by `userData.marker`) turned
"the testis looks wrong" into "two anchors, 17 cm off the axis, below a crotch at
0.453"; `facts.json`'s `growthFalloff` (touched vertices per organ mesh, keyed by
`userData.growthFalloff`) turned "the ring looks invisible" into "7609 of 7609 vertices
of the pancreas head, 111,411 of 113,252 of the brain" — and refuted my own frame-bug
hypothesis on the spot. THE PATTERN: whenever a render is being judged, have the
harness emit the coverage or geometry that produced it, read from the objects'
declared identity, alongside the pixels. It costs a few lines and it is what lets a
look be argued with.

THE PATTERN'S SCOPE (user, 2026-09-10 — before it gets miscited): IDENTITY FOR DISCRETE,
ENUMERABLE POPULATIONS; COUNT FOR SAMPLED ONES THAT TWO CORRECT RUNS CAN LEGITIMATELY
DIFFER ON. The test is exactly that question — can two correct runs differ? If they can,
an identity claim is false however much you want it. Worked example, the same day the
pattern was written: verifying that a placeholder mass drew no dissolve, an identity claim
("pixel-identical to the baseline") was about to go in the record; between two correct
frozen runs 759 pixels differed by more than 6/255 across the whole organ from sub-pixel
pose jitter, so identity was false — while the COUNT (1878 of 1880 baseline teal pixels
kept, against 618 when dissolved) was true and sufficient. Anchors, coverage, statuses:
identity. Renders across runs: counts with a threshold.

TWO HARNESS NOTES THAT BELONG BESIDE IT (user). (1) THE MECHANISM GETS MEASURED BEFORE
IT GETS CHOSEN: the obvious visibility gate for the body picker — a facing test on the
anchor's normal — failed outright across 24 yaws on both bodies, and only the
measurement said so. (2) TWO INDEPENDENT MECHANISMS DISAGREEING IS HOW YOU LEARN EITHER
IS WRONG — condition (7) doing its job: the depth-buffer gate and the raycast oracle
disagreed at three silhouette edges, which is how the oracle's own geometry (a
zero-width ray to the exact point instead of through the sampled pixel) was found.

## A RESERVED SIGNAL OUTRANKS AN ILLUSTRATIVE MAGNITUDE (2026-09-09, user ruling; standing for the class)

When a reserved (placeholder) signal and an illustrative magnitude compete for the same
pixels — the reserved teal apex against rim-blend's dissolved band on a margin-
uncharacterised mass with cited infiltrative growth — the reserved signal wins. One is a
provenance truth-claim; the other is invented-and-disclosed by construction, and
degrading the claim to preserve the invention has the trade backwards. Applied as a
MEASURED FLOOR encoded in `reserve_check` (`RESERVED_APEX`). RE-DERIVED ACROSS THE ORBIT
(2026-09-10, user: the check had verified the cap matched a measurement, not that the
measurement generalised — one pose, one organ, on a viewer that auto-rotates): a 24-yaw
sweep on two organs found the default pose FAVOURABLE (lungs 0.34 at default, 0.20 at
its worst yaw; kidneys 0.03) and no nonzero band cap surviving the kidney geometry, so a
placeholder now draws NO dissolve and says so on its badge; a nonzero cap must be backed
by a two-organ sweep minimum at or above the floor, never a default-pose number. Enforced
before any live entry has the combination — which is exactly why it would otherwise
arrive unannounced. THE ORGAN-SIDE FALLOFF FAMILY IS RETIRED STRUCTURALLY in the same
pass: a mass is 22% of the organ radius, so a ring in mass radii is organ-scale by
construction — 98% of the brain's vertices at half a degree of hue, invisible and
'diseased throughout' at once. Not a tuning question; do not re-open it in Phase C
(design document §10).

## SMALL-POPULATION INVARIANTS — enumerated before Phase C (2026-09-10, user; desk exercise, no fixes)

THE FAMILY: cwd-always-pinned hid the harness's path dependence; closed-mesh-always-resolves
hid the body markers' identity gap; one-entry-per-category hid the badge's citation keying.
Each was an invariant that held by accident of population size, silent until the population
grew. Phase C takes sixteen active entries to roughly a hundred and twenty — a seven-fold
increase, and this class is its defining hazard. Listed now, by prompt, while it is cheap.

KEYED BY CATEGORY RATHER THAN ENTRY: the margin category's default `badgeSource`/`badgeQuote`
still lives on the category — a second entry sharing a category inherits the first's citation
silently unless it carries its own (GBM caught it; a check that requires an own citation on
every sharer does not yet exist); `sameAppearanceAs` and `divergence` are per category too.
ONE ORIGIN HOTSPOT PER ORGAN (`ORIGIN_HOTSPOT`): every cancer of an organ shares one origin
and one anchor — at 8–9 entries per organ, cancers that arise at different sites (cardia vs
antrum, cortex vs pelvis) would all sit on one point. STACKING BY COUNT: masses march along one
tangent at 2.2 radii per extra entry (`massR*2.2*placed`) and badge chips stack vertically —
both walk off the organ and out of the frame past three or four. A MASS IS 22% OF THE ORGAN
RADIUS (`MASS_RADIUS_FRACTION`): fine for one or two, organ-covering for eight.

UNIQUENESS RESTING ON n≈1: bare-basename pointer resolution (a second `colon.js` anywhere in
the tree resolves every `colon.js:N` to nothing); internal-quote spans required to occur
exactly once in their file; the mapping document's single record_sync marker; ONE declared-
benign 404 in `deploy_check`; ONE declared-unmappable id in `citation_crosscheck`; one shared
organ material per GLB, which the rim-blend albedo sampler and the depth-pass injection both
lean on.

ASSERTIONS VACUOUS OR TRIVIAL AT PRESENT COUNTS: `citation_paren_ledger.basis_test` ratcheted at
0 (any count passes); one `sameAppearanceAs` declaration; two growth categories; the regression's
hard counts — exactly 4 hotspots per organ, exactly 4 sites per cancer, ≥20 cells, ≥3 histology
features, ≥9 body markers — shaped to today's authoring, not to a rule; `citedBackingViolations`
accepts any identifier-shaped token, and since 2026-09-09 any https URL, without resolving it.

RATCHETS WHOSE INCREMENT IS NOISE-SIZED: `internal_quote.marked` 15, `reserve_check.categories`
5, `growth_categories` 2, `citation_crosscheck.records` 145 — a change of one is a real event
today and will be background at a hundred and twenty entries; the set-composition audit
(`record_keys`) is what still sees a swap under a flat total.

LAYOUTS THAT FIT SIXTEEN: two label-overlap failures already stand (GBM, acinar) at today's
density; the pelvic body-marker cluster already forced a measured floor; the tumour-badge chip
carries two axes and will be asked to carry composition; the sidebar's per-organ cancer list is
one to two rows deep today; the regression loops per cancer, so the five-minute gate scales with
the corpus. Fixes are a separate decision (user).

TOOLING NOTE, same day: `/tmp/atlas-verify/node_modules` (the scratch `puppeteer-core` every
headless gate depends on) vanished overnight; re-installed at the same path. The cure is
`cd /tmp/atlas-verify && npm install puppeteer-core`; the battery's $TMPDIR warning already
said not to trust that directory's contents, and now its tooling too.

## FOUR SHORT ITEMS, 2026-09-10 (user): the overlaps triaged, /tmp retired, the pattern scoped, render coverage counted

1. THE LABEL OVERLAPS WERE A RED CHECK INSIDE A GREEN GATE. `regress.js` printed its failure
   count and exited 0 regardless, so its 173 checks were reporting-only and none could fail
   the gate — the two site-label overlaps (GBM: Infiltrative margin ~ Peritumoral edema;
   acinar: Peripheral zone A ~ Transition zone) had been red since they were written, and the
   record called them "known". Visually: chips intersecting by a few pixels at the default
   pose, text legible — minor, but live. BOTH HALVES FIXED THE SAME DAY: a deterministic
   per-frame collision resolver in the site tick (labels pushed down by the overlap plus a
   gap, box computed from the CSS anchor), and the regression now exits non-zero on any
   failing check not DECLARED by name with a reason (`KNOWN_FAILURES`, empty at birth; a
   declaration whose check passes is reported stale). A regression that reports and never
   refuses is the resolve-versus-resolve-correctly gap in the gate itself.
2. /tmp IS RETIRED AS A DEPENDENCY. puppeteer-core lives at `~/.cache/cancer-atlas/`
   (persistent, machine-local, path built from the home directory at runtime — no literal in
   the tree); resolution is installed → `PUPPETEER_CORE` → the home cache → the old /tmp path
   last. THE QUESTION THAT MATTERED MORE: when it vanished, would the gate refuse or skip?
   Measured by simulation (every copy hidden, the refusal log redirected): the wrapped
   regression exits 1 and logs a refusal — the gate REFUSES. Convention D holds for this
   failure mode.
3. The identity pattern is scoped where it is recorded (above).
4. RENDER COVERAGE IS NOW A NUMBER. Two mechanisms push cited properties out of the render
   and into text — the understated-extent label and growth on a margin-reserved mass; each
   was forced by a measurement and each is right, and the aggregate is what nobody would
   notice: an atlas drifting toward a text database with a decorative 3D view inverts the
   premise. `reserve_check` now reports cited-and-rendered against cited-and-text-only, per
   entry and in total (today 9 of 17 cited properties render; 8 are text-only, all of them
   growth categories with no mechanism built yet). Reported, not ratcheted — a ratio to watch.
   THE TRIGGER (user): the class "margin-reserved with cited infiltrative growth" is empty
   today; TNBC, FTC, prostate acinar and ccRCC are all demoted pending gross-register sources
   and TNBC's read is next. When the FIRST entry lands in the class, reopen whether the
   reserved signal belongs on the mass surface at all rather than somewhere the dissolve
   cannot reach — declined on speculation earlier; the kidney sweep is evidence. Not before.

THREE CORRECTIONS TO THE ENUMERATION ABOVE (user): the label overlaps were present-tense,
not a Phase C hazard (item 1). EIGHT OR NINE MASSES PER ORGAN AT 22% OF ORGAN RADIUS is the
largest rendering hazard on the list and has no current symptom to triage — COSTED EARLY:
the mass code places one mass at the organ's single origin hotspot and marches extras along
one tangent at 2.2 radii; at eight entries the masses cover the organ and leave it, and the
badge chips stack out of frame. The options are structural, not parametric: masses shrink
(and the reserved form's legibility, tuned at 22%, is re-derived), OR the per-organ view
changes (one mass shown at a time, selected by the cancer list, the rest as markers), OR
origin becomes per-entry so masses sit at their own sites. Any of the three reshapes Phase
C's content model rather than patching it — decide before Phase C content is written. THE
URL-ACCEPTING IDENTIFIER CHECK was misfiled: not a small-population property but a check
that did not check — the instrument that would have caught the pancreas's dangling citation
and the prostate's unverifiable quote. Treated on its own merits: a URL identifier must now
carry the date it was last followed (`verified YYYY-MM-DD`), asserted by `reserve_check`
without network; a link nobody has followed is not a resolved identifier.

## A TOLERATED COUNT LAUNDERS A DEFECT INTO A CONSTANT (2026-09-10, user; the sweep — report, not fix)

THE REFRAME (user): the two label overlaps were not hidden — they were PUBLISHED, in every
report, as "2 known failures". Everyone matched the number, nobody re-read the list, and a
stable 2 became indistinguishable from health. The bare-cwd sweep made "same counts, not
just green" the discriminator — and a laundered defect is precisely a stable count, so the
instrument built to catch vacuous passes was structurally blind to this. The fix shape is
zero, or a NAMED list with reasons, with stale declarations reported; the healthy pattern
is the watchlist's EXPIRY DATE, which is what stops a count becoming furniture.

THE SWEEP, every accepted non-zero count in the battery's DONE lines, classified by the one
question — is it a list someone re-reads, or a number people match?

LISTS WITH REASONS (healthy, no expiry): `deploy_check` BENIGN (one favicon 404); crosscheck
`DECLARED_UNMAPPABLE` (one id); reach `DECLARED_UNREACHED` (five, with kinds); the absence
check's three EXEMPT classes (each instance reasoned); the paren ledger's four scored spans;
`KNOWN_FAILURES` (empty at birth). WITH AN EXPIRY (the pattern that works): only
`_uncited_migrating_watchlist` (its expiry date is the record-sync marker for that pair, so it is not repeated here).

NUMBERS PEOPLE MATCH (furniture risk, in order of what they may be hiding):
- `citation_crosscheck` "3 flags": the list lives only in a $TMPDIR artifact. Read: Nunes
  2024 recorded under journal 'Nature + Molecular Cancer (two mentions)' vs 'Mol Cancer';
  'PNAS' 2013 and 'Neuro-Oncology' 2021 recorded with the JOURNAL in the author field
  (Sottoriva A; Louis DN). Three real record-format defects, tolerated since 2026-09-06.
- `duplicate_figure_check` "4 drift flags": printed each run, never declared. skin.js
  391 vs 395 carry different CDKN2A figures at two sites (49%/44% vs 29%/27%) with a note
  saying they are the same event; pancreas 212 a 1997/1998 year pair; stomach RHOA 0.3 vs
  0.4 and the CLDN18 pair. Each is either a deliberate different denominator or a real
  drift, and the count cannot say which — a re-read per flag is owed.
- `fraction_check` "1 mismatch, 1 comment flag": pancreas 206/149, "classically ~50% …
  (25/84 tumors, Hahn 1996)" — read: a FALSE POSITIVE (the 25/84 is the deletion
  mechanism's share, not the ~50%'s fraction), tolerated as a stable 1 for want of a
  declaration mechanism; the instrument has one for two-year ranges and not for this.
- `share_sum_check` "1 gap": liver family sums to 87.5 — "transplant candidate, human reads
  the label" — an instruction to a human with no owner and no date.
- `absence_claim_check` "2 universals flagged for a read, 2 world-scoped": kidneys 'unlike
  every other organ', bladder 'unlike any other wall modeled', lungs 'Uniquely among
  organs', stomach 'found nowhere else in the GI tract' — printed each run as pending reads,
  no expiry; the earlier queue read three universals and these four remained.
- `citation_reach_check` "151 unreached spans": a census by kind, moved 150 → 151 this week
  and nobody asked which span.
- `regress` "2 page errors": the favicon 404, twice — declared benign in deploy_check, not
  here.
- THE STATUS TABLES (margin 7 uncharacterised / 3 unread; growth 4 unread / 1
  uncharacterised): lists with refs — but no expiry; the PathologyOutlines window that
  would resolve four of them is recorded in prose, not on the rows.
Fixes are a separate decision (user). The shape of each would be: a declaration with a
reason and a date, printed and expiring — or zero.

## MEASURED-CATASTROPHE VERSUS FAILED-TO-MEASURE — a standing rule (2026-09-10, user)

Any instrument that can emit a catastrophic verdict must distinguish MEASURED catastrophe
from FAILED-TO-MEASURE, and failed-to-measure may never borrow the other's wording. The
deploy checker dressing its own detached frame as "the app did not initialise" was the
third of a family — the /tmp false failures, the oracle sampling the wrong point — and the
worst, because it manufactured the most severe verdict the system has: the alarm that
would roll back a healthy deploy. THE AUDIT of the other instruments for the same exposure:
`regress.js` could report 173 manufactured failures about a page it never saw (a 404 from a
mis-rooted server read as 'body markers female 0 visible') — FIXED: an initialisation
precondition names a PROBE FAILURE and runs no check, proven against an empty server root
(exit 1, 'the app did not initialise in the harness … not a finding about the app').
`citation_reach_check` and `citation_head_check` over an EMPTY record artifact report
'N problems' phrased as declaration defects ('declared gated ids missing') rather than as
an unmeasurable population — the same exposure, lower stakes, an open item: refuse when the
record set is empty, as the corpus-glob checks now do. The three formerly vacuous instruments
already refuse an empty corpus; `deploy_check` now retries once and prints 'hotspots
UNMEASURED (probe failure)'; `capture_organs` names a missed sidebar row as its own miss.

## AN UNDECLARED COUNT IS EVIDENCE OF AN UNREAD COUNT (2026-09-10, user ruling; `.claude/tolerated.py`)

**The ruling, verbatim in substance:** "Three flags turning out to be three real record-format
defects is the second confirmed instance ... An undeclared count is evidence of an unread count ...
every tolerated non-zero count resolves to fixed, declared-with-reason, or dated-for-re-read. No
count persists as a bare number." The two instances: the regression's "2 known failures" (two live
label overlaps, printed in every report) and the crosscheck's "3 flags" (a journal in the author
field, twice; one journal field carrying two journals). Both sat in green gates for as long as the
gates existed. Why the rule holds: if someone had read the count and found it benign they would have
declared it benign — so a bare number accumulates real defects by construction.

**The mechanism, ported once, not reinvented per instrument.** `.claude/tolerated.py::resolve(name,
flags, declared)` is regress.js's `KNOWN_FAILURES` shape: an instrument computes its flags as
`{content-key: detail}`, keeps a `DECLARED` list of `{key, reason, until}` beside its other
declarations, and gets back the problems — UNDECLARED flag, EXPIRED date (the re-read is owed),
STALE declaration (declared but no longer flagged), REASONLESS declaration. Any problem is fatal to
the instrument's exit code. Keys are CONTENT (organ|gene|figures; file|field|span head), never line
numbers, so an edit above the flag does not churn the declaration and a changed figure makes a new,
undeclared key that gets read again. Its selftest proves the four classes and runs in the battery
(`tolerated_selftest`).

**Every tolerated count, resolved (read from the tree at bcb625a, then acted on):**
- `citation_crosscheck` — 3 flags → FIXED. PMID 23412337 author `PNAS`→`Sottoriva`, PMID 34185076
  author `Neuro-Oncology`→`Louis` (fixNotes on the records). The third was the ONE-PAPER-PER-AUTHOR-
  YEAR INVARIANT: the Nunes 2024 record carried `Nature + Molecular Cancer (two mentions)` in one
  journal field because extraction assumed an author-year names one paper; colon.js cites two (Nature
  at :244/:276/:278, Molecular Cancer at :277). Split: the Nature record resolved BY HAND from its
  two-candidate list to PMID 39112715 (esummary: Nature 2024 Sep, first author Nunes L, the CRC
  whole-genome cohort the corpus quotes; the other candidate was a Nature Physics comment on AI); the
  Molecular Cancer record (PMID 39587554) now names its journal alone. 0 flags of 146 records.
- `duplicate_figure_check` — 4 drift flags → READ, all four DECLARED PERMANENTLY with the mechanism:
  each is two DIFFERENT quantities on one shared template, the residual false-positive class the check
  named at calibration and left to "the human read" with no record of the read. Years of two papers
  on one journal template (Schutte 1997 / Wilentz 1998); brain vs liver involvement (Riihimaki 2018);
  liver vs lung odds ratios (Riihimaki 2016); peritoneum vs bone shares. The user's "get dates"
  assumed unread; read, they are settled, so they carry reasons rather than dates.
- `fraction_check` — 1+1 mismatch → DECLARED PERMANENTLY: pancreas `~50%` is the pathway-level SMAD4
  loss share and `25/84` the homozygous-deletion mechanism's share within it; the matcher pairs the
  nearest percent to the nearest fraction. The comment block mirrors the field.
- `share_sum_check` — the liver gap (sum 87.5) → OWNED AND DATED to 2026-10-01: re-read the cited
  epidemiology source for the ~12.5% remainder, then add the row or scope the label. "Human reads the
  label" was an instruction with no owner and no date.
- `absence_claim_check` — 4 universals "flagged for a read" → 2 PERMANENT (every organ has an
  "arises here" site, settled by construction and counted on the served page; skin is the only cut
  block, settled by a `layerSlab` census that now runs beside the declaration), 2 DATED to
  2026-10-01 (the stomach's "uniquely three muscle layers" claim, twice — a textbook read; OpenStax
  A&P is CC BY and quotable).
- `regress.js` — "2 page errors" → both the browser's favicon.ico 404 → DECLARED BENIGN in
  `BENIGN_PAGE_ERRORS`; an undeclared page error or a stale benign declaration now exits 1.
- `citation_reach_check` — 150 unreached spans → a TRACKED SET, not a number:
  `.claude/reach_unreached.json` (machine-written, 95 content keys `file|kind|head|year`, multiset
  counts). ADDED/REMOVED prints on every whole-corpus run; the staged diff is the acceptance, so a
  new unreached span is read at the commit that adds it. Second run: 0 added, 0 removed, file
  byte-identical. THE 151ST SPAN, identified first as ordered: `js/organs/prostate.js:13
  [data-span-year] 2026` — this author's own margin note "(user, 2026-09-09)", a digit year inside a
  data line. Date spelled out; census back to 150. A note written to record a finding created the
  next finding.
- STATUS TABLES — every `unread` row in `MARGIN_STATUS` / `GROWTH_STATUS` carries `until`
  (2026-09-17 for the reads scheduled today — ccRCC's PathologyOutlines probe, TNBC's gross-register
  read; 2026-10-01 for second-tier reads). `reserve_check` reports an unread row with no date, an
  overdue date, an uncharacterised row that does not say what was read, and a cited row carrying a
  date. Three negative controls (DELETE the date, SUBSTITUTE a past date, ADD a date to a cited row)
  each exited 1 with the right sentence; the file was restored byte-identical.

**Two more from the same message.** Reach and head now REFUSE an unmeasurable population (empty
glob, or an extractor that produced 0 records) instead of reporting "5 problems" about declarations —
the measured-catastrophe rule applied to themselves. Bladder: the extent shares first summed to 50
because the check summed four categories and the page has five; in situ (50%) is now REPORTED AS ITS
OWN CATEGORY in the row, the sum, the ledger and the sentence ("most are found in situ, before any
invasion, and the next largest share localized"), not scoped out.

**The depth measurement (item 4) is in `.claude/phaseA_extent_design.md` §9:** the skin block's
exaggeration is PER-LAYER (epidermis ≥3.7× the measured maximum, dermis 2–5×, hypodermis ~1× and
truncated), so a Breslow millimetre placed in it lands in the wrong layer; depth is text unless the
block is re-proportioned; true scale rejected (hairline epidermis), uniform ×8 priced at about half a
day and not recommended now; the axis designed as CITED MAGNITUDE, generic, Breslow first, text by
default. No build without the ruling.

## PATHOLOGYOUTLINES IS CLOSED TO THIS CLIENT — measured over three windows (2026-09-10)

Probe #1 of the four-probe plan (ccRCC page, 2026-09-10T16:38Z, one request, honest user agent
naming this project) returned HTTP 429 with `retry-after: 86400` from Sucuri/Cloudproxy — the THIRD
consecutive window (2026-09-06, 2026-09-09T01:38Z, 2026-09-10T16:38Z), each entered after the
previous Retry-After had elapsed. One fetch cannot distinguish a daily cap from a persistent block;
three windows can: the block is persistent for this client. No second probe inside a window (plan
rule), so TNBC, FTC and prostate acinar were not probed. Consequences, recorded rather than worked
around: (1) the gross-register route back to `cited` for those rows is closed to this tooling, and
it was the only route (the OA corpus has now been shown thin FIVE times — the fifth is
PMC7550871, read in full for TNBC: histologic register only); (2) the rows stay `uncharacterised`
(TNBC growth moved there from `unread` on the read — R24), which is the honest state, not a
failure; (3) the way back is a HUMAN read of the gated pages — a quoted sentence with the page URL
and a verified date is a citation under the fourth property whoever fetched it — and that is the
user's call, asked, not assumed. Bypassing the limit (other clients, archives, proxies) is not on
the table. Composition re-counted after the run by the §10 C method: four, unchanged.

## CHECK-VALIDATED-BY-DEFECT — the fourth accidental invariant, and a full self-test audit (2026-09-10, user finding)

**The species, named.** The crosscheck's live known-positive assertion required two real author-field
defects to exist in the corpus to pass. It was never a hermetic self-test — it was validated by the
very defects the tool exists to catch, so it could only be green WHILE the corpus was broken, and
would have gone silent, not merely quiet, the moment the corpus was cleaned. Fixing the defects
should have broken the self-test; had that happened at any earlier point the likely response would
have been to weaken the assertion rather than notice the coupling. This is the opposite of what a
ratchet is for: checks are supposed to get stricter as a project improves, not weaker.

**The family, four members now.** An accidental invariant is a property that held in every case seen
so far, got relied on without being stated, and stayed invisible until a case violated it:
1. **cwd-always-pinned** — "CONTENT-ANCHORED POINTERS" (2026-09-09, the cwd-hazard passage): the battery always ran from the repo root, so nothing noticed every instrument's paths were relative until a run from elsewhere produced false fails and false-green vacuous passes. Generalised as convention D: every member roots itself, and the counts (not the verdict) are the discriminator.
2. **closed-mesh-always-resolves** — "BODY MARKERS RESOLVED, BUT NOT CORRECTLY — the placement check" (2026-09-09, user finding): the body is a closed mesh, so a raycast always hits something and a miss never fires; the regression verified markers RESOLVE, never that they resolve to the right one, while one sat on a thigh.
3. **one-paper-per-author-year** — "AN UNDECLARED COUNT IS EVIDENCE OF AN UNREAD COUNT" (2026-09-10, own section above): citation extraction assumed one author+year names one paper, so a record silently carried two different journals in one field until the crosscheck's OWN flags forced the read.
4. **check-validated-by-defect** (this entry): a self-test's positive control was the corpus's own defect rather than a fixture, so the check's validity was coupled to the thing it exists to find — it fails in the direction nobody watches, since a project getting healthier makes the coupled check go quiet, and quiet reads as passing.

**The fix already shipped (previous commit):** the crosscheck's live assertion no longer needs a real
defect. It resolves one real esummary record from the actual fetched data, then checks a SYNTHETIC
wrong author (`'Zzyzx-Not-An-Author'`) against it — proof that the checker fires, decoupled from
whether the corpus currently has anything wrong.

**The audit, run today, all 19 instruments with a `selftest()` or an equivalent live-run
self-check** (`absence_claim_check`, `battery`, `ccf_load`, `citation_crosscheck`, `citation_head_check`,
`citation_paren_ledger`, `citation_polarity`, `citation_reach_check`, `deploy_check.js`,
`duplicate_figure_check`, `extract_citations`, `figure_search`, `fraction_check`, `internal_quote_check`,
`pointer_check`, `record_sync_check`, `reserve_check.js`, `share_sum_check`, `tolerated`):
**exactly one instance found, and it is the crosscheck instance already fixed. Zero others.** Method:
every `selftest()` body was checked for a live read of the real corpus (`glob('js/organs/*.js')`,
`open('.claude/citations.json')`) used as its OWN proof of firing, then re-checked more broadly for
real filenames, `RECORD`/`attached(`/`unreached_spans(` calls, `sys.argv`-driven paths. `duplicate_figure_check`,
`absence_claim_check`, `fraction_check`, `share_sum_check` and `record_sync_check` each showed a live
read on the FIRST pass — all five were the same false positive: a function-boundary regex that
over-captured past `selftest()`'s own `return` into the inlined `main()` block below it; re-bounded at
`if __name__`, all five are clean (synthetic fixtures only). `citation_paren_ledger`, `pointer_check`
and `battery` each mention real organ filenames (`js/organs/thyroid.js`, `.../lungs.js`,
`.../prostate.js`) inside their selftests; every occurrence checked by hand is a LITERAL STRING
constant used as fixture input (e.g. `battery.py`'s arm 17, "the REAL ones from d54bd1a,
TRANSCRIBED" — a frozen snapshot of a historical commit, not a live read), never an `open()`/`glob()`
call. `reserve_check.js`'s own selftest is explicitly fixture-form BY DESIGN ("no live population can
carry a violation while the rule holds") — it was already built the honest way round. Nothing here
needs converting; there was nothing else coupled.

## THE BLADDER CAPTION, VERIFIED — and a guard against the next drift (2026-09-10, user question)

**Is "which is how most are found" still live on bladder? No.** The phrase is still in
`extentSentence` (`js/morphology.js`) — it is a shared template, not a per-entry string — but it is
gated behind `ext.modal === 'localized'`, and bladder's `modal` is `'in situ'`, which routes to its
own dedicated sentence instead. The three-way form (in situ / localized / other) that makes this
routing possible landed in `c440900`, already pushed and deploy-verified; the two-way form it
replaced would have sent anything that wasn't `'localized'` to the same "beyond it" branch bladder
now gets its own sentence for. There is no live instance of the flagged defect.

**Is it templated on the other fifteen, and could pancreatic be next? Checked directly, not
inferred.** Every cited entry's `modal` field was independently recomputed from its OWN `shares` (the
true argmax) and compared against the stored value: **16/16 match, zero mismatches.** Pancreatic
(pdac) is `modal: 'distant'` (51% of its own SEER distribution), matching its true argmax exactly —
it gets the "least extensive; most are found already beyond it" framing, not the flagged one. The six
entries whose true modal is regional or distant (pdac, crc, luad, hgsoc, clear, gdiff) all route
correctly; the eight whose true modal is localized (melanoma, gbm, tnbc, ccrcc, hcc, acinar, ptc, ftc)
all route correctly, and "which is how most are found" is TRUE for every one of them by their own
cited numbers. The predicted second casualty did not materialize because the fix already generalises
on the data, not on the entry.

**The guard, added anyway.** Nothing here is broken, but a `modal` field is exactly the kind of prose-
that-summarises-data the user has flagged before: it can go stale the moment a `shares` value is
corrected without anyone re-checking which share is still largest. `reserve_check.js` now asserts, for
every cited extent entry, that `modal` equals the argmax of its own `shares` — a GUARD, not a repair,
since it has not yet fired on a live defect. Proven with its own negative control: `pdac.modal` set to
`'localized'` against its true `'distant'` fired with the exact sentence naming the false majority,
then the file was restored byte-identical.

**Follow-up (user): the guard proves `modal` matches the data, not that each branch's SENTENCE is true for its branch — the same shape one level up.** Checked by hand, then guarded the same way. The in-situ branch hardcodes "the next largest share localized"; true today only because bladder (the one live in-situ entry) happens to have localized in second place. The "other" branch's "least extensive; found already beyond it" covers regional and distant correctly but would be false for a hypothetical `modal: 'unknown'` entry (undetermined is not "beyond"). Two more arms added to the same reserve_check.js block: an in-situ entry's own second-largest share must be `localized` (else the hardcoded clause is wrong for it), and `modal === 'unknown'` is flagged outright since no current branch can honestly render it. Both proven with negative controls (bladder's second-place share forced to regional; its modal forced to `'unknown'`) and both silent on the live tree; file restored byte-identical after each.

## THE REGISTER FINDING — established for three entities, not ruled universal (2026-09-10, user question)

**The question:** is TNBC's negative read (R23/R24) the same failure as FTC (R20) and prostate acinar
(R22) — gross-register description systematically unavailable rather than merely unfound — and does
ccRCC (R3/R4) make a fourth?

**Four actual reads, four-for-four the same signature.** Of the six margin/growth records touching
these entities, four were READS (a search happened, register checked) and two (R3, R4, ccRCC) are
explicitly UNREACHED (the record's own words: "blocked-to-tooling, NOT a negative"). All four reads —
FTC margin (R20), prostate acinar margin (R22), TNBC margin (R23), TNBC growth (R24) — found real,
citable literature that answers a DIFFERENT question than the one the axis asks: histologic
(microscopic-architecture) register, not gross (macroscopic-appearance) register. That is 4/4, not a
coincidence sample of one.

**Established for three entities, with a reason each, not just a count.** The pattern has a cause,
checkable in the same records already in the ledger, not only a tally:
- **FTC** is diagnosed BY capsular/vascular invasion (R20's own quote: MI/EA/WI subtypes, defined by
  how far the tumour crosses its capsule) — a criterion invisible without a microscope. Gross
  literature has little reason to describe a margin no gross exam can resolve.
- **Prostate acinar adenocarcinoma** is frequently GROSSLY INAPPARENT — R22's own near-miss quote
  ("If there was no grossly visible tumor, a systematic sampling strategy was used") describes the
  clinical workaround for a tumour often invisible to the eye it would need a margin description of;
  this is the same "grossly inapparent" shape pre-registered before the read (R22), now supported by
  adjacent textual evidence rather than a direct statement.
- **TNBC** is defined by receptor immunophenotype (ER/PR/HER2 status), not by any gross morphology of
  its own — R23's own findings show the ONLY entity-specific gross-circumscription sentences found
  belong to rare morphologic SUBTYPES (secretory carcinoma, fibromatosis-like metaplastic carcinoma),
  which have their own distinct look precisely because they are morphologic exceptions to ordinary
  TNBC, not because TNBC itself has one.

**ccRCC is a different failure mode, and stays open, not folded in.** R3/R4 found NO description in
either register (a colour statement and an unpredicated "solid or cystic" are the nearest misses) —
literature silence, not a register mismatch. That is evidence for a different, more basic problem
(nothing found yet) and is neither confirmation nor refutation of the register limit; ccRCC keeps its
`unread` status and `until` date rather than being downgraded by analogy.

**Recorded as a PRINCIPLED, PARTIAL limit on the margin axis, not a search-effort backlog.** For
FTC, prostate acinar and TNBC, more searching is not expected to change the outcome: the register
mismatch follows from how each entity is actually diagnosed or defined, not from where the corpus
was drawn. **Phase C implication:** if 3 of the ~14 entities read so far hit a limit intrinsic to how
they are diagnosed (invasion-graded, often-inapparent, or receptor-defined rather than
morphology-defined), a comparable fraction of Phase C's roughly 120 entities should be EXPECTED to
land on `uncharacterised` permanently, and that expected fraction is a ceiling to budget for now
rather than a debt to keep chasing with more reads later.

**Sized (user: "the sizing is what makes it actionable"), from the live `MARGIN_STATUS` table, not estimated.** Of 16 entries: 6 cited (37.5%); 3 uncharacterised for the REGISTER reason (tnbc, acinar, ftc, 18.75%); 4 uncharacterised for an UNRELATED reason each (hgsoc: source says the surface is variable; clear: no margin-character category in the source; luad: a pre-registered negative; crc: margin subsumed by the cited growth form — 25%); 3 unread/pending (ccrcc, gdiff, uc — 18.75%). Among the 9 entries where the register question was actually DECIDED (the 6 cited plus the 3 register-limited), **3/9 = 33% hit the wall** — the same rate as 3/16 = 19% applied to everyone, by two independent routes to the same range: roughly a fifth to a third.

**Projected to Phase C's ~120:** both routes land close together — 120 × 3/16 ≈ 22.5, or (120 × 9/16) tested-equivalent × 1/3 ≈ 22.5 — **roughly 20–25 of 120 entries permanently margin-uncharacterised on the register limit alone**, before counting whichever fraction of the other-reason class (25% today, with no articulated mechanism to project confidently) recurs at scale. That other-reason class is reported for completeness, not folded into the headline number: it has no identified generalisable cause the way the register limit does.

**The intersection the user named: masses per organ.** SMALL-POPULATION INVARIANTS already flagged 8–9 masses per organ at Phase C scale as structurally crowded. Every uncharacterised or unread entry renders its mass in the reserved default (teal), not a cited category's form — so the register limit's ~20% (of all 16) to ~33% (of tested entries) rate, applied to 8–9 masses on one organ, means roughly **1.5 to 3 of every organ's 8–9 masses would be permanently, indistinguishably teal** — on top of, not instead of, the crowding the invariant already named (one shared origin hotspot, one stacking tangent, 22%-of-radius sizing). Two flagged hazards intersect: the organs already scheduled to carry the most masses lose colour as a distinguishing cue for a fixed fraction of them, and losing colour is exactly the cue the crowding hazard needs most.

**A further question this sizing is now big enough to raise, sized and deferred to Phase C, not answered here (user, 2026-09-10).** Roughly two permanently-reserved masses per crowded organ is not a rare flag anymore — it is a recurring visual element appearing in clusters, and at that frequency it stops reading as "we don't know" and starts reading as its own CATEGORY of tumour, purely from how often it shows up. Semantic drift caused by frequency alone, not by anything the colour was designed to claim. The alternative worth weighing then — rendering NOTHING rather than rendering reserved — cuts both ways: quieter, but it collapses "uncharacterised" (no gross-register evidence exists) into "characterised as unremarkable" (evidence exists and there is nothing distinctive to show), which is precisely the distinction the reserved form was built to keep visible. Not resolved now — recorded with the number attached above so Phase C inherits a sized question, not a vague discomfort.

## THE COUPLING AUDIT NEEDED ITS OWN POSITIVE CONTROL (2026-09-10, user: "closes the loop on itself")

**The point, sharpened:** "exactly one instance in 19" from the prior audit rested on a script that
had already shown a boundary bug in the direction that's visible (over-capture, five false positives,
caught because five wrong answers look wrong). An under-capturing regex produces silence, which looks
identical to a clean bill. The audit needed the same fix everything else in this session got: prove
the checker fires, on a synthetic case, before trusting what it reports about the real one.

**The fixture, planted (scratch, `/tmp/ca-coupling-fixture.py`, not a repo file):** a `main()` with a
live corpus read (`glob('js/organs/*.js')`) feeding a conditional `sys.exit`, disguised on purpose —
no "known positive" phrasing, and not inside a `def selftest()`. Both properties were chosen to defeat
the ORIGINAL audit method specifically: it searched for suspicious phrases, and it scanned only
`selftest()` bodies. **The original method missed the fixture, exactly as predicted** — an empirical
demonstration of the gap, not just an admission of one.

**The fix: broaden from phrase-matching to a one-hop data-flow heuristic** — inside every top-level
function, track which names are tainted by a live `glob`/`open`/`urlopen` call (directly, or one
assignment downstream), then flag any `assert` or `sys.exit` whose nearby lines mention a tainted name.
This caught the fixture. Re-run against the real instrument suite, it also raised 10 candidates across
7 files that the narrower method had never looked at — the correct outcome for a broadened net, and
each was read by hand, not auto-cleared:
- **8 of 10 are the REFUSING-TO-REPORT-on-an-empty-population pattern** (`citation_head_check`,
  `citation_reach_check`, `absence_claim_check`, `duplicate_figure_check`, `share_sum_check`) or a
  tool's own **normal result-reporting exit** (`sys.exit(1 if fires else 0)` in `figure_search`,
  `internal_quote_check`, `pointer_check`, `record_sync_check` — `fires` there is the tool's OWN finding
  list; exiting non-zero because a real scan found real problems is the correct, wanted behaviour of a
  defect detector, not a capability self-check). Different, already-understood, deliberate mechanisms —
  cleared.
- **The remaining 2 are the crosscheck's OWN already-fixed synthetic control** (`assert live is not
  None`, `assert any('author:' in f for f in check_one('Zzyzx-Not-An-Author', ...))`). This is the
  audit's honest limit, stated plainly rather than smoothed over: **a structural heuristic cannot tell
  the fix from the bug**, because both touch live-fetched data — the difference is that the asserted
  condition's truth is guaranteed by the SYNTHETIC probe value, not by a property the corpus happens to
  have, and that is a semantic fact about the assert's logic, not a syntactic one about its inputs. It
  had to be read, same as the first time. Cleared by reading, not by the detector.

**Net result: still zero new instances, now shown against a detector proven capable of catching the
disguised shape, with the one genuinely ambiguous hit correctly requiring — and getting — a human
read rather than an auto-clear.** "One in 19" now means "one that a broadened, fixture-verified method
can see," which is a materially stronger claim than the first pass supported.

**Considered and declined: a permanent `coupling_audit` battery instrument.** Every one of the 10
broadened-detector hits on real files needed a human read to clear; a heuristic with that false-positive
rate is not a hard pass/fail gate, it is a triage aid. Kept as a documented, repeatable manual method
(this section, plus the fixture and both detector versions, reconstructable from this write-up) to
re-run whenever a new instrument's self-test design is in question, rather than wired into every commit.

## THE COVERAGE SPLIT — DECLARED-AND-TOLERATED vs FATAL (2026-09-06, user ruling; `.claude/citation_crosscheck.py`)

**The instrument that refuses to scan without its input could still
silently scan less of it.** `citation_crosscheck.py` mapped each
identifier to a PMID inside a `try/except Exception: pmid = None`, so a
**failed fetch** and a **genuinely unmappable identifier** landed in the
same bucket — and the total printed on the DONE line was of records it
*reached*, not records that *exist*.

**This is not hypothetical, and it is not a demonstration either — it is
a recorded instance.** On 2026-09-06 a battery run printed
`141 records checked` under a green DONE line and `0 problems`, where the
committed message from the previous commit said 142. Three standalone
re-runs on the same artifact gave 142 every time, so the cause was a
transient network failure being filed as an unmappable id. **A transient
failure cannot be summoned on demand**, so what exists is an instance
plus a diagnosed mechanism, not a live shrink waiting to be caught. That
is still better evidence than a fixture, because it actually happened —
and it happened **one day after** the header predicting exactly this
class was written, in the tool that header was in.

**The fix needs the deploy gate's shape, or it makes the instrument
permanently red.** There is one *stable* unmappable identifier in the
corpus. A tool that exits non-zero whenever anything is unexamined fails
forever on that record, and a permanently-red gate gets ignored, which is
the failure it was built to prevent wearing a different hat. So:

- **Stable-unmappable is DECLARED AND TOLERATED**, the way the favicon
  404 is declared-benign in `deploy_check.js`. `DECLARED_UNMAPPABLE` is a
  dict of `id -> reason` and mirrors `BENIGN`'s role: **the gate's honesty
  surface**, where every entry is something it has been told not to see,
  so it stays short. **A reason, not a bare id list** — a bare list would
  hide a coverage hole behind an id, and a selftest arm requires every
  entry carry one.
- **Transient-unreached is FATAL, and it refuses to print a total at
  all.** A smaller total *is* the defect, so printing one and flagging it
  would be publishing the wrong number with an apology attached. It
  aborts before the metadata pass and before any DONE line.
- **A NEW unmappable id also fails** — correctly, because that is an
  **undeclared change in what the scan can reach**, which is a different
  claim from "this record is unmappable" and only the second one is
  something a human decided.
- **The two statements the declared entry keeps apart:** *the claim is
  unchecked* and *this instrument cannot reach it*. The one declared
  record was read at the publisher during ccf batch 1 and its figures
  verified verbatim; what is missing is a PMID for the automated metadata
  cross-check, because the journal is not PubMed-indexed. Storing the
  reason is what keeps those from collapsing into each other.
- **Condition (7) without a network:** the classification is a pure
  function over `(raw_id, ref, failure)` triples, so all four directions
  — fatal on a failed fetch, fatal on a new undeclared id, tolerant of a
  declared one, and every declared entry carrying a reason — are proven by
  selftest arms with no fetch at all.

**THE QUOTED-SPAN CHECK — recorded as a shape, on the sidecar's terms**
(user, 2026-09-06, from the `garlandlike` finding in ccf batch 1). **A
misquoted quotation is worse than a loose paraphrase**, because quote
marks assert exactness and paraphrase does not. brain.js quoted Wippold's
"garlandlike" as "garland-like" — a hyphen, and the only defect of the
batch that no amount of number-matching could have caught, since there is
no number in it.

- **The shape:** `citations.json` now archives source text verbatim, and
  code carries quoted spans inside quote marks. Where a record has both,
  the comparison is mechanizable and **total over that subset** — the
  test the drift rule sets for building a detector at all. It is not
  total over the corpus, and must not claim to be: the population is
  "records whose archived text contains the quoted span", which the
  instrument can enumerate for itself rather than being told.
- **Scope discipline it must encode:** only spans inside quote marks are
  in scope. brain.js keeps `garland-like` hyphenated in two places
  deliberately, as paraphrase, and a checker that flagged those would be
  training its reader to ignore it.
- **Same treatment as the sidecar: build it when something touches
  citation fidelity anyway**, and it inherits the sidecar convention as
  the first new instrument written. Not now — one hyphen in fifty claims
  is not a rate that justifies an instrument, and the honest reason to
  record it is that the NEXT one will be found the same accidental way.

**WHY THE CHAIN STOPS AT FOUR** (user, recorded so nobody adds a fifth
from momentum). Set → invocation → commit message → deploy is
**complete, not arbitrarily truncated.** The property that makes it
complete is that the battery is a **single entry point**: one command
covers everything downstream of it. A guard above it would need its own
guard, and that regress only ever bottoms out at a human running one
thing. Four is where the recursion stops because four is where the
human is.

## THE INTERNAL QUOTED-SPAN CHECK (2026-09-07, user ruling; `.claude/internal_quote_check.py`)

The inward face of the shape above, built first because it is **strictly
the easy case**: both sides are in the repo, so no fetch, no
Unicode-normalisation policy, no figure-derived marker. What is left is a
string comparison. It was ordered because **the same failure had happened
twice in one day** — and by the time it was built, four times.

- **The four, because a hand-assembled enumeration grows on contact and
  this one grew inside the reason for the instrument.** (1) `battery.py`
  quoted `record_sync_check.py`'s caveat "verbatim" and editing the source
  left the copy fiction. (2) Moving the sidecar convention left the
  demonstrative *"the wrong way to close those two"* with its referent
  behind in another item. (3) `citation_head_check.py`'s copy of
  `citation_reach_check.py`'s blind-spot span substituted **single quotes
  for the source's double** — two characters, inside a span whose own
  sentence says verbatim. (4) `battery.py`'s anchor-family entry joined
  **two separate `commit_checked.sh` spans with a slash inside one pair of
  quote marks**; the composite existed in no file. Found by this
  instrument on its first live run, in the file hosting the family
  enumeration it was being added to. **Only (4) was not found by a human
  reading carefully** — which is the argument for the instrument.
- **DRIFT AND FABRICATION ARE TWO SUB-SHAPES, and (4) is the second one**
  (user, on reading the first live run). The check was built for **drift**
  — the target moves, a once-exact copy stops being exact. What it found
  first was **fabrication**: each half verbatim, the whole invented,
  existing in no file *at any time*. **Drift has a moment when it was
  true; fabrication never did**, and that changes the repair. Drift is
  fixed mechanically, by re-quoting the source or quoting less of it,
  which is what (1) and (3) got. Fabrication cannot be re-quoted, because
  there is no source span to return to — (4) had to be **restructured**
  into two markers, one per real span, and the composite abandoned. A
  reader who assumes drift will go hunting for the version of
  `commit_checked.sh` that said it, and there isn't one. The instrument
  does not distinguish them and does not need to: both surface as the same
  not-found flag reporting zero occurrences, and which one it is becomes
  obvious the moment a human looks for the source. Named so nobody narrows the
  purpose to "keeping copies in sync with their originals".
- **THE DISCIPLINE TRANSFERS — that is what this find is evidence for**
  (user, 2026-09-07). Three instances in one day of **quote marks
  asserting more than their content supports**: `brain.js` quoting
  Wippold's "garlandlike" as "garland-like"; the prostate TCGA span whose
  **framing was wrong while its text was exact**; and (4) here. The first
  two are the atlas's *citations*, found by the epi pass. The third is the
  atlas's **own tooling prose**, found by the same technique, in the file
  hosting the family enumeration it was being added to. A fourth instance
  if trailing punctuation tucked inside quote marks counts, which is the
  same assertion made one character at a time. **The class was never about
  citations specifically** — it is about a mark that claims exactness, and
  it holds on both sides of this repo.
- **The convention, because unmarked prose would have to be guessed at.**
  A naive survey over markdown produced 1324 not-found hits, confirming
  the premise: the checker must not guess. A marker line `QUOTES <path>`
  followed by a `>` gutter run holding the quoted text; it passes when
  that text, whitespace-collapsed, occurs **exactly once** in the target.
- **Two deviations from the form as sketched, flagged rather than taken
  quietly.** The `:<anchor>` was **dropped** — the quote is its own
  anchor, since a span occurring exactly once already resolves to one
  place, and a second hand-typed string is a second thing that can rot
  with nothing checking *it*. The delimiter is a **`>` gutter, not quote
  marks**: a `"`-delimited region cannot express a quote containing `"`,
  and breakage (3) is exactly that. A third reason appeared while marking
  rather than while designing — **all three CLAUDE.md quotes carried a
  trailing `.` or `,` inside the quote marks that the source does not
  have**, the ordinary habit of tucking punctuation inside quotes applied
  to a span called verbatim. The gutter deletes the temptation instead of
  catching it.
- **A member of the family it guards, stated by the user before it could
  be discovered**, so both of rule C's properties are decided by asking
  which property of the match is *decidable*. The **marker is anchored by
  POSITION** — the corpus already held two mid-sentence uses of the word
  as English, and selftest arms 8 and 9 use those two lines verbatim, so
  the anchor is demonstrated against the strings that would break it. The
  **span is anchored by COUNT**: zero and many are different defects, and
  many means the span identifies no place.
- **Condition (7) met on the real corpus, not on a fixture.** After every
  site was marked *exactly as it already read*, the first live run fired
  on two of eight and passed six — and the two were the two already known
  bad. The repair removed that evidence, so it is preserved two ways:
  recorded in the instrument's header, and as fire/pass arm pairs on real
  bytes from `git` (arms 1–2 and 12–13). Arms 12–13 also pin why the
  comparison normalises **whitespace only** — a normaliser that folded
  quote characters together, tempting the first time a copy differs only
  by punctuation, would pass arm 12 and blind the instrument to the defect
  that motivated it.
- **THE ABSENCE HOLE, DECLARED AT BIRTH because the user named it as the
  thing to watch.** The check is total over *marked* spans only, and an
  unmarked quote reaches no instrument — the same absence-versus-decrease
  shape as the ratchet, and the same unclosable population as
  `record_sync_check.py`'s undeclared pairs, since "prose that is a quote"
  cannot be enumerated. Two narrowings, neither a closure: the marked
  count is **ratcheted**, so deleting a marker to silence a fire fails the
  battery; and this is **the first thing in this chain that asks the
  author to do something at write time** rather than deriving from what is
  already written. Whether that holds is the open question, not a settled
  one. Evidence it does not hold automatically: the instrument's own
  header contained an unmarked internal quote until the marking pass
  reached it, and three more sat in this file.
- **What it cannot reach, so the remedy is elsewhere.** A demonstrative
  has no span to resolve and no target to compare — breakage (2) is
  unreachable *by construction*, which is why its remedy is deletion (see
  the sweep below). A quote of a file's **own past state** is refused
  rather than half-supported. Three spans in this file are therefore
  deliberately left unmarked, declared here so the exemption is a decision
  and not an omission: `run_checked.sh`'s deleted "six call sites";
  breakage (2)'s *"the wrong way to close those two"*, quoted above as the
  defect under discussion and **deleted from `battery.py` by the
  demonstrative sweep**, so marking it would fire one commit later; and
  breakage (4)'s slash-joined composite, which existed in no file at any
  point. All three are citations of text that is gone or never was — there
  is nothing live to resolve against.
- **A larger adjacent population is declared and deliberately unmarked:**
  `extract_citations.py`'s fixtures assert "`<file>:<line>` verbatim"
  about corpus text dozens of times. Same defect class, now mechanisable,
  not marked here because **a reach change gets declared and measured on
  its own commit**.

## A WRAPPER THAT CANNOT TELL IT WAS CALLED WRONG (2026-09-07, user ruling; `.claude/run_checked.sh`)

Found by misinvoking it while building the check above. `run_checked.sh`
was called with the marker omitted — `run_checked.sh python3
.claude/battery.py --phase=pre-commit` — which satisfied its `$# -lt 2`
usage test, ran `.claude/battery.py` as a bare executable (exit 126), and
appended a refusal entry saying `marker="python3"
tool=--phase=pre-commit`. **The refusal was genuine and both of its labels
were false**, in the file whose entire purpose is append-only evidence.
That is worse than a missing entry, because it reads as fact.

- **`$# -lt 2` cannot see a three-argument call with the wrong three
  arguments** (user). The count was right and the contents were shifted.
- **The entry stays.** It is a real refusal and the log is append-only
  evidence; editing it out to tidy the record would be worse than the
  wrong labels. The durable fix is the assertion that stops the next one
  from being mislabelled, not a cleaner history.
- **THE RULED MECHANISM WAS MEASURED FIRST AND HALF OF IT IS
  DESTRUCTIVE**, per the standing rule that a ruling's named mechanism can
  be destructive while its outcome is reachable another way. The ruling was
  *reject a marker or tool argument beginning with `-`*. On a throwaway
  copy the tool half **failed 5 of the wrapper's own selftest arms**: the
  legitimate `sh -c '…'` form puts `-c` in exactly the refused position.
  And the obvious repair defeats the catch — deriving the tool by skipping
  option words turns the real misinvocation into `tool=battery.py`, which
  the `-` rule then passes. **The tool position is not where that call is
  decidable.**
- **The outcome delivered at the marker instead, as a positive contract
  that strictly contains the ruled rule** (nothing beginning with `-`
  begins with `DONE` or `====`) **and reaches the real case, which the
  ruled rule did not.** A marker must begin with `DONE` or `====`. Not a
  new convention: every marker in `battery.py`'s `INSTRUMENTS` is one of
  `DONE` or `====`, and `commit_checked.sh`'s `DONE_LINE_RE` already defines
  a DONE line as exactly those two forms. (Both homes said "all 14 markers"
  for a day. The number is derivable from `INSTRUMENTS` and the claim is
  stronger without it — EVERY marker — and `run_checked.sh`'s header is the
  one that already lost a count this way, saying "six call sites" while ten
  instruments existed.)
- **The tool field is fixed rather than guarded**, since with the marker
  contract in place an option can no longer reach that position by a
  shift: an option word is skipped, so `sh -c` archives `tool=sh` instead
  of the `tool=-c` it used to write. Same defect as the false labels, one
  degree quieter — a field that lied about a *legitimate* call.
- **Condition (7), with isolation shown.** Two negative controls, each
  reverting one guard: without the marker contract exactly one arm fails
  (the misinvocation *runs* rather than being refused first); without the
  derivation fix exactly one arm fails (the tool field names an
  option). Every other arm passes in both, so neither guard is carrying the
  other's weight.
- **AN ABSENCE ASSERTION HAS A FALSE-PASS MODE, and this one was caught
  false-passing.** Arm 10 *as first written* asserted the refusal log stays
  *empty*. The first negative control was written without an execute bit, so
  every self-invocation died at exec, the log stayed empty for the wrong
  reason, and **the arm reported ok while measuring nothing** — condition (8)
  arriving in the harness rather than the instrument. The arm also
  requires the guard's own message, which distinguishes "refused by the
  guard" from "never ran". The exit code cannot: both are non-zero.
- **THE EMPTY-LOG HALF WAS REVERSED THE SAME DAY, AND THE LESSON ABOVE IS
  WHY THE REVERSAL IS SAFE** (user ruling, 2026-09-07 — see "A REFUSAL THAT
  LEAVES NO RECORD" below). A misinvocation is now *logged*, with
  `reason=MISINVOKED marker="n/a" tool=n/a`, so arm 10 asserts a PRESENT
  entry with named fields instead of an absence — and a present entry with
  named fields has no false-pass mode of that shape, because a call that
  never ran writes no entry to find. Only the *labels* were ever the defect;
  the entry was not.

### A REFUSAL THAT LEAVES NO RECORD IS AN ABSENCE (2026-09-07, user ruling)

**The ruling, reversing behaviour shipped hours earlier in `ae56833`:** "The
guard's job was to fix the *labels*; removing the *entry* is a second change
nobody asked for, and it's the wrong direction. A refusal that produces no
record is an absence, and absences are exactly what this chain has spent two
days learning it cannot see — same shape as the ratchet's absence-versus-decrease
hole."

**The decisive argument is refusal 2 itself** (user): "its entire value today is
that it's the incident that motivated `ae56833`. Under the new behaviour that
incident leaves no trace, which means the guard's own motivating evidence would
be missing from the archive built to hold precisely that class of evidence."

- **A GUARD THAT REFUSES EARLIER MADE THE ARCHIVE BLINDER.** That is the
  generalisable form, and it is not obvious: moving a refusal earlier in the
  pipeline is normally strictly better. It is worse when the pipeline's later
  stage was the only thing WRITING ANYTHING DOWN. The guard was scored on what
  it prevented and nothing scored what it stopped recording.
- **`tool=n/a marker=n/a reason=MISINVOKED`** — "more honest than the old lying
  labels and more useful than silence" (user). There is no marker and no tool
  in a misinvocation; that is what the refusal *is*.
- **The bad argument is not lost, it MOVES.** The guard's message quotes it
  (`first argument "python3" is not a DONE marker`) and the message is what the
  entry's output block carries. So the raw word is recorded as *the word that
  was passed* rather than as a field *claiming to be a marker* — which was the
  whole complaint about the original entry. Verified against real bytes on a
  scratch log, not reasoned about.
- **ONE WRITER.** The entry goes through `log_refusal`, which holds the
  line-start guard that a real defect bought (the seeded header's missing
  terminator, which made `grep -c '^==== REFUSAL '` report zero over present
  data). A second append written inline in the guard could drop the terminator
  the same way. The quotes around `marker="n/a"` are that writer's format
  string, not a choice made at the call site.
- **Both halves of arm 10 shown able to fire, separately.** Deleting the
  `log_refusal` call fails on the count alone. Deriving the fields the old way
  instead **reproduces the original defect byte for byte** —
  `marker="python3" tool=battery.py` — and fails on honesty alone. The second
  mutation is the one worth having: the arm catches the exact entry the guard
  exists because of, not merely *some* entry.

## A GUARD THAT WRITES ITS FINDINGS MUST NOT BE ABLE TO WRITE A FINDING THAT FAILS ITSELF (2026-09-08, user ruling; `battery.py` assertion 6 + `run_checked.sh`'s `log_refusal`)

**The sharpest thing in `12abb27`, and the easiest to miss in its report: the guard against
machine-specific paths could have committed one.** Assertion 6 fails the battery when a tracked
file names an account; `run_checked.sh` refuses; `log_refusal` archives the refusing run's tail
into `.claude/refusals.log`, which is TRACKED and append-only by its own header. Had the problem
string quoted the offending path, or had the writer not scrubbed the machine's home, one firing
would have machine-written the leak into the index — and the assertion would then have fired on
it on every later run, in a file no human is allowed to hand-edit. **A self-wedging guard.**

- **THE CLASS, in the user's words: *"a guard that writes its findings must not be able to write
  a finding that fails itself."*** Both ends were closed before shipping: the message DESCRIBES and
  never QUOTES (file and line, never the text), and `log_refusal` substitutes `$HOME` symbolically
  the way it already did `$TMPDIR`, with a selftest arm asserting both directions and a mutant
  that fails exactly that arm.
- **THE FIRST TIME IN THIS ARC A GUARD'S OWN FAILURE MODE WAS ANTICIPATED RATHER THAN DISCOVERED.**
  Every prior instance — the coverage guard counting the staging it was built to exclude,
  `deploy_check`'s byte-matched total printed over stale bytes, the refusal log's own header
  making `grep -c` read one present entry as zero — was found after it fired. This one was found
  by asking, before the first run, what the guard WRITES and whether what it writes can satisfy
  its own predicate.
- **WHY IT IS A CLASS AND NOT A FOOTNOTE TO ASSERTION 6:** every guard in this chain writes
  something — a problem string, a DONE line, a sidecar, a refusal entry, a state file — and
  several of those writes land in tracked files. The question generalises to each of them: can
  the written finding be the thing the next run flags?
- **Recorded at the FAILURE position of `battery.py`'s placement checklist**, because the
  constraint is on that position's home — the problem string — which turned out to have a second
  reader: the archive. **That is the part worth keeping** (user): the position as written put its
  reader at a red terminal, and a leaking problem string is read there once and forgotten — but it
  is also read durably, in a machine-written file nobody may hand-edit, and the durable reading is
  the expensive one. The checklist's phrasing never suggested it existed, so whoever writes the
  next problem string reasons about the terminal and not the log; the position now says so.

## A CONSTRAINT THAT OUTLIVES ITS CAUSE HAS TWO SIGNS (2026-09-08, user ruling)

**This is the first record of the stale-constraint class AS a class; until now
its instances lived only at their own sites.** The user named the class on
ruling the `fraction_check` inversion, and it is recorded with both signs
together because the remedy is the same for both — check whether the reason
still holds — while the cost of missing one is not.

- **THE RESTRICTION THAT OUTLIVED ITS CAUSE — every instance found before
  2026-09-08 had this sign.** Three, from one arc. `m ≤ 1` on the tissue
  mottle is stated in `viewer.js` as clip-safe by construction against a
  hard 1.0 clip ceiling, and the corrected pipeline has no hard clip — AgX
  has measured rolloff headroom — so the cause is gone while the constraint
  stands (the Tier 3 albedo pass named it and closed before relaxing it: a
  found stale restriction, not a lifted one). The glow diagnosis in
  `main.js` reasoned from distance-zero clipping, which the corrected
  pipeline retired — and the re-measurement kept the VERDICT on a different
  reason, an accent in the illumination path, which is why its comment says
  not to read it as a constraint AgX lifted. And the ccf read-unit entry's
  "bound to a commit because no instrument prints it, the only way
  available" was true when written and false once `ccf_load.py` existed;
  corrected in place. In each, a statement survived after the condition
  that made it load-bearing was discharged. An obsolete restriction wastes
  effort — someone obeys it, or re-derives why it no longer binds — and it
  is at least visible: the statement is there to be questioned.
- **THE CAUTION THAT BECOMES A RECOMMENDATION ONCE ITS GUARD EXISTS — the
  other sign, first instance at `0b2d5c2`.** `fraction_check` was built
  because remediation was ADDING fraction/percentage pairs with nothing
  behind them — the repair creating the risk, and the instrument's header
  opens by saying so. The carry-both form rule now says to add them
  deliberately. Same action, opposite verdict, and the only thing that
  changed is whether a guard is watching. From the instrument's birth on
  2026-09-05 until `0b2d5c2`, the check existed and the practice it made
  safe was never recommended, because nobody looks for these: a guard
  landing feels like a closure rather than a moment to revisit what was
  being discouraged.
- **WHY THE SECOND SIGN IS THE EXPENSIVE ONE** (user): an obsolete
  restriction merely wastes effort, while an obsolete caution leaves a good
  practice discouraged — and nobody notices the absence of something that
  was never done. The first fails as a statement someone can question; the
  second fails as silence.
- **ONE REMEDY, AND THE SECOND SIGN HAS A TRIGGER.** Check whether the
  reason still holds. For a restriction the prompt is the next pass that
  bumps into it. For a caution the prompt is a guard landing: when an
  instrument ships, ask what practice it was built against and whether that
  practice is now the mechanism. `fraction_check`'s header does this for
  its own birth caution, as the worked example.

## NO CROSS-BLOCK DEMONSTRATIVE — THE DELETION REMEDY, SWEPT (2026-09-07, user ruling)

**The ruling:** "apply the deletion remedy for demonstratives, since there's
no cheap mechanism for those: no cross-block demonstrative anywhere in
`.claude/` or `CLAUDE.md` — name the referent. 'Those two' is unanchorable by
construction; a named target survives a move. That's a prose sweep, not a
checker." Breakage 2 of the internal-quote work was exactly this: moving the
sidecar convention left `"the wrong way to close those two"` with its referent
behind in another item, and **no quoted-span checker can reach it** — there is
no span to resolve and no target to compare.

- **THE PATTERN SET, RECORDED SO THE SWEEP IS RE-RUNNABLE AND NOT MERELY
  RE-READABLE.** Four patterns over `.claude/*.{py,sh,js,md}` + `CLAUDE.md`,
  matching demonstratives used as NOUN PHRASES:

  | name | pattern |
  |---|---|
  | bare-with-count | `\b(?:those\|these)\s+(?:two\|three\|…\|\d+)\b` |
  | bare-pronoun | `\b(?:those\|these)\b(?!\s+(?:[a-z]+(?:s\b\|\b)))\|\b(?:that\|this)\s+one\b` |
  | ordinal-reference | `\bthe\s+(?:former\|latter)\b` |
  | positional | `\b(?:the\s+above\|as\s+above\|as\s+below\|said)\b` |

  **The boundary is a declared decision, not an oversight.** `this`/`that`
  immediately followed by a noun is OUT — the noun names its own referent and
  survives a move. So are `it`/`they`/`them`, which are the whole of English
  and cannot be swept. That leaves the shapes a move actually breaks.
- **THE COUNT, AND WHY IT IS NOT A RESTATED MACHINE NUMBER.** The sweep found
  **113 candidate lines across 25 files** (bare-pronoun 41, bare-with-count 36,
  positional 31, ordinal-reference 5) and left **98**. These are a DATED
  MEASUREMENT of a one-time pass, not a description of current state, which is
  the distinction the number-restatement rule turns on: "on 2026-09-07 the
  sweep found 113" stays true forever, where "there are 113" rots on the next
  edit. Re-run the patterns above rather than trusting the totals.
- **THE DIFF OF THIS COMMIT IS THE ENUMERATION OF WHAT WAS FIXED**, which is
  why no hand-counted total appears here: re-run the patterns above over
  `git show`'s removed lines and 21 of them carry one, four edited for a
  different reason (two stale pointers, two restated counts) with the
  demonstrative legitimately kept. Three shapes dominated the rest.
  (1) **A comment describing the tuple BELOW it**, three times in
  `battery.py`'s `INSTRUMENTS` — "this one takes the case where the copy IS the
  anchor" sitting between `record_sync_check`'s entry and
  `internal_quote_check`'s, where the nearest preceding name is the wrong
  referent. Naming each entry removes a real ambiguity, not just a fragility.
  (2) **A sub-bullet pointing at its parent** ~190 lines up, twice, both
  "these five" for the organ GLBs. (3) **`the former`/`the latter`**, fixed
  *regardless of block* — a declared extension of the ruling, flagged rather
  than taken silently, because position-within-an-enumeration is unanchorable
  by construction even inside one sentence: an edit that reorders the two
  alternatives silently inverts the meaning, with no move required.
- **THE SWEEP ALSO DELETED THREE RESTATED NUMBERS IT WAS NOT LOOKING FOR**,
  because "these three"/"the other 15" carries a count as well as a
  demonstrative and one edit removes both.
- **WHAT IS KEPT, WITH THE REASON, SO A LATER READING DOES NOT "FINISH" THE
  SWEEP.** Four classes: the **records of the defect** (eight sites quoting
  `"the wrong way to close those two"` as the example — deleting them deletes
  the evidence); **quoted source text** (TCGA's own "The former", plus the
  prose that glosses what it refers to); **referent named in the same sentence
  or block**; and **self-reference to the containing file** ("this one owns
  `.claude/record_count.json`"), which a move cannot break because the file is
  the referent.
- **THE `positional` PATTERN CONTRIBUTED 31 HITS AND ZERO REAL ONES.** Every
  match was the English verb "say"; the corpus holds no "the above", no "as
  above", no "as below", and no legal-style "said X" anywhere. Recorded because
  a pattern that fires 31 times and finds nothing is worth knowing about before
  someone re-runs it and reads the volume as signal.
- **AND THE SCANNER IS LINE-BASED, WHICH IS ITS OWN FALSE-POSITIVE CLASS.** A
  determiner phrase split across a line wrap ("whether those / papers") is
  judged without its noun and reads as bare. Three such hits; they need no fix.
- **THE HOLE IS THE SAME ONE THE INSTRUMENT HAS.** A sweep is a moment, not a
  guard: the next cross-block demonstrative typed after this commit is invisible
  to everything. That is accepted — the ruling named it a prose sweep on purpose,
  and a checker here would have to guess what stands in for what.

## A FILE:LINE POINTER IN PROSE IS THE `:<anchor>` FIELD THE CONVENTION DROPPED (2026-09-07)

**Found by the demonstrative sweep, not by a checker, and it is the sharpest
thing the sweep turned up.** Reading `internal_quote_check.py`'s own header
line by line surfaced four hand-typed `file:line` pointers in its prose. **All
four were wrong** — in the file whose convention deliberately has no
`:<anchor>` field, on the user's ruling that "a redundant hand-typed field is a
liability that nothing checks… the span delivers uniqueness and the line number
derives."

- **BOTH SUB-SHAPES, IN ONE FILE, ON THE SAME DAY THE DISTINCTION WAS DRAWN.**
  `citation_head_check.py` line 88 and `citation_paren_ledger.py` line 125
  (spelled, not colon-delimited — see below) were TRUE at
  the parent commit and **went stale inside the commit that wrote them**,
  because that same commit added a `QUOTES` block near the top of each target
  and pushed the lines down: **DRIFT**, with a mechanism worth naming — writing
  a pointer while reading the pre-edit file. `battery.py` line 151 (twice) was
  **FABRICATION**: 151 has never been one of that span's addresses at any commit,
  so the pointer resolved to nothing at any point in history. The addresses the
  span HAS held are derivable from git and are deliberately not enumerated here —
  the enumeration that used to sit in this sentence named two of them and was
  already wrong before `457ce7d`, which is a machine number drifting in prose
  inside the record of a drifted number.
- **ALL THREE ADDRESSES IN THE BULLET ABOVE ARE SPELLED, NOT COLON-DELIMITED, ON
  PURPOSE** (user ruling, 2026-09-08). `pointer_check.py`'s pattern covers `.py`
  as well as `.js`, so while they were written in matchable form all six copies —
  three addresses, two homes each — sat in its **counted** population and
  **resolved**, meaning addresses this record calls stale or fabricated reported
  green on every run. Deletion was the wrong repair: for these six the address is
  simultaneously the defect and the evidence the defect existed, so removing 151
  would leave the claim about 151 with no referent to check. Spelling reads the
  same to a human and is invisible to the matcher, so the evidence survives and
  the instance does not. The floor was lowered by exactly six accordingly.
  `battery.py`'s designated block carries this as a **corollary** to
  describe-the-shape-don't-instantiate-it, and `internal_quote_check.py`'s note
  carries it at the line.
- **THE POPULATION FIGURES IN THIS BULLET ARE SUPERSEDED** — by the entry titled
  "THE GUARD CAME BEFORE THE REPAIR, AND THE FLOOR WAS THE DECISIVE NUMBER".
  As measured on 2026-09-07 by an unsaved hand grep: 191 pointers,
  136 in `.claude/` and 55 in `CLAUDE.md`, of which only 5 were cheap to check
  because all but five point into corpus `js/` files that nothing here could
  verify without reading the target. The finding those numbers carried still
  stands and is why they are kept: of the five pointing into a `.claude/`
  instrument — files whose lines move for TOOLING reasons, on the same commits
  that edit the prose — **four were the four wrong ones**, and the fifth,
  `CLAUDE.md`'s `fraction_check.py:13`, is correct. **What is superseded is the
  totals, not the ratio**, and they are not simply larger now: `pointer_check.py`
  defines a wider population (manifest refs and `code_refs` as well as prose) with
  a saved, re-runnable rule, so its count and this one are not the same
  measurement and do not subtract. **The count lives in that instrument's DONE
  line**; a total written here would be one more instance of the
  machine-derivable-number rule this file records under 2026-09-05.
- **THE REMEDY IS THE ONE ALREADY RULED:** name the file and quote the span.
  Applied to all four. `battery.py`'s "the wrong way to close those two" cannot
  drift and cannot be fabricated — if it is wrong, it is wrong loudly, and
  `internal_quote_check` would catch it if it were marked.
- **NOT SWEPT AT THE TIME: the corpus pointers.** A different population with a
  different cost, and widening the sweep to it is a change in reach that has to
  be declared and measured on its own commit rather than slipped into this one.
  **DONE, on its own commits, later the same day** — the census came first, then
  the guard, then the repair, recorded under "THE GUARD CAME BEFORE THE REPAIR,
  AND THE FLOOR WAS THE DECISIVE NUMBER". The reach change happened the way this
  bullet asked for: declared before it happened, measured after, and the
  measurement is a saved instrument rather than a number.
- **THE SAME FILE, THE SAME THING TWICE, CAUGHT EARLIER (2026-09-09).** Phase A's
  build step inserted a renderer above main.js's site-map code and moved every
  later line, staling the three tracked pointers into that file — the shape
  893b3c8 found in a settle run. This time it was caught PRE-COMMIT, because the
  pointed lines were re-read from the tree rather than the draft message's own
  claim ("both insertions sit below those lines", false) being trusted; all
  three were re-pointed by content. pointer_check reported green throughout,
  as its declared FLOOR-only boundary says it will for prose pointers. The
  class is graduating the way the ratchet class did — toward caught rather
  than found — with the difference that the catch is still a person reading.
- **THIRD MOVE, SAME FILE, SAME DAY — SO THE THREE POINTERS WERE CONVERTED, NOT
  RE-POINTED AGAIN (2026-09-09).** Wiring the first cited category added lines
  inside the same renderer, above the site-map code, and the three pointers
  moved a third time (caught pre-commit, by the same reading). "Two catches by
  the same method isn't a mechanism" (user), and a third would not have been
  one either — so the pointer ruling's own remedy was applied: name the file
  and quote the span. The roadmap now names the site-map blob loop's
  organicSpiculate call by the constants on its next line, and the two
  idiom-collision records quote the spread-pattern comment they already
  carried beside the number. pointer_check's floor was LOWERED by exactly
  three on the record (`--lower-ratchet` with its reason), the same step the
  six spelled pointers took. No tracked `main.js:<line>` pointer remains.

## THE GUARD CAME BEFORE THE REPAIR, AND THE FLOOR WAS THE DECISIVE NUMBER (2026-09-07, user ruling; `.claude/pointer_check.py`)

**The user refused both of the obvious moves and ordered a third.** Not "sweep
the pointers" — *"count them, don't sweep them… If most resolve, it's a small
cleanup; if most don't, hand-typed pointers are a defect class in their own right
and the remedy is deletion rather than repair — which is a different ruling and
wants the number first."* And then, once the number was in, not "repair them"
either: *"the guard produces the worklist and then prevents its recurrence,
rather than being written afterward against a state someone already cleaned by
hand."* Census → guard → repair, in that order, on separate commits.

- **WHY THE ORDER IS A RULING AND NOT A PREFERENCE, in the user's own reason:**
  *"Drift clusters by file because **one edit moves many pointers at once** —
  eleven in `prostate.js`, nineteen in `liver.js` — so repairing 49 today buys a
  state that the next content commit partially undoes, silently, with nothing
  reporting it."* A guard written after a hand cleanup is a guard demonstrated
  against a corpus with no defects left in it — condition (7) unmeetable by the
  corpus, only by fixtures. This one fired on the live corpus first, and its
  output *was* the worklist.
- **THE FLOOR IS THE DECISIVE NUMBER, NOT THE EXACT-MATCH RATE** (user: *"529/529
  resolving at the floor is the decisive number, not the 217. Nothing is
  fabricated; every defect is recoverable. That's what makes this repair rather
  than deletion"*). Two questions, two populations, deliberately never blended
  into one score: **FLOOR** — is there a tracked file with that many lines? —
  answerable for every pointer, so nothing is excused from it. **IDENTITY** — is
  the named thing actually *at* that line? — answerable only where the pointer
  carries its own oracle, which here means a manifest ref accompanied by its
  citation's author and year. The floor came back **TOTAL, with a zero gap**:
  every pointer in this repo names a real file at a line that exists. So no
  pointer was ever fabricated, every identity failure was a referent sitting
  elsewhere in the file it named, and **a referent that is somewhere in its file
  had a moment when the pointer was true** — which is what makes it re-pointable.
  Deletion would have destroyed recoverable information. The figures are not
  restated here; `pointer_check.py`'s DONE line is their only home, and commit
  `3fa9e1a`'s message quotes the pre-repair run verbatim, because a repaired
  corpus can no longer produce it.
- **THE ORACLE IS THE PART NOBODY REVIEWS, AND IT HAD TWO BUGS** — either of
  which would have sent the repair-versus-deletion ruling the wrong way. A bare
  substring test for surnames looked fine until 33 records turned out to have a
  needle of four characters or fewer: `Li` matches "likely", `Hu` matches
  "human", `Ding` matches "finding", `Ther` matches "therapy". **The total did not
  move when word boundaries went in, which is exactly why the tightening was
  worth doing** — a number that survives a stricter oracle is why it is
  believable. Then a **±25-line search window invented a defect class**: fifteen
  referents came back GONE, and searching the whole file found every one of them,
  up to 53 lines away. That window was never part of the question; it was an
  artifact of how the answer was computed, and it argued for deleting the
  population. There is no window constant in the instrument on purpose, and the
  distance is reported rather than thresholded.
- **NEAREST IS NOT IDENTITY, WHICH IS WHY THE GUARD PROPOSES AND NEVER APPLIES.**
  Its repair candidate was the **wrong line in four of the flags**: three
  wrapped citations, plus an author whose nearest occurrence is a comment
  *quoting* the paper while the referent is a data string far below it. Every
  candidate was read before it was used. **An auto-fixer would have written four
  wrong numbers and reported success.** The better evidence is the BLOCK OFFSET —
  flags in a file share one, because one edit moved them together — but that stays
  a reading aid rather than a rule: a modal offset over a handful of flags is a
  thin vote, and here it returned two confident wrong answers off one vote and
  two votes. **A vote whose count nobody reads is not evidence.**
- **A WRAPPED CITATION IS IMPRECISE FROM BIRTH, NOT DRIFT**, and the repairs go
  opposite directions. Where a citation splits across two lines — surname ending
  one, year and journal beginning the next — a pointer at the YEAR line names a
  real place that never held the whole citation. Drift is re-pointed **forward**;
  this is re-pointed **up**, to the surname. The check accepts that by design: a
  name-only match on the pointed line counts as on-line, because demanding author
  and year on one line would make the corpus's own wrapping unrepresentable.
- **A POINTER CAN BE RIGHT FOR ONE RECORD AND STALE FOR ANOTHER**, so a repair is
  keyed to **(record, ref)** and never to (file, line). `brain.js:234` is cited by
  two records: stale for the one whose site moved, correct for the other, whose
  subject line 234 still is. A global rewrite would have broken the passing one —
  and within one file the same number appeared as both an *old* line and a *new*
  line, so applying the pairs in sequence would have re-broken what it had just
  fixed. Before applying, every ref instance matching a repair pair was checked to
  have been individually flagged; exactly one was not, and it was left alone.
- **A FIXTURE MAY REUSE A REAL POINTER; IT MUST NEVER INVENT ONE.** The census
  reached its population with a hand-maintained list of fixture filenames to skip,
  and **that list hid eight dangling pointers** — selftest fixtures spelling out
  `file:line` for files that do not exist. Copying the list into the instrument
  would have made its total a statement about the list, which is the staleness
  `battery.py`'s assertion 2 exists to refuse. So the fixtures changed instead:
  they compose their refs from parts, no literal pointer appears in either
  selftest, and the invariant is now absolute with nothing to keep in step.
  Reusing a real pointer is harmless — the fixture makes the same true claim the
  live pointer does. **Inventing one is a false claim that no reader and no tool
  can tell apart from a live pointer.**
- **THE DECLARED-EXEMPTION PATH SHIPPED FROM BIRTH AND EMPTY**, on the user's
  ruling — *"Give it the declared-exemption path from birth, with the three
  properties… Retrofitting that after the first false positive is how the other
  declarations acquired their scars one at a time."* Its quote must be a verbatim
  substring of the exempted line **occurring exactly once in the file**, which is
  `citation_reach_check.py`'s quote-the-span idea finally mechanised, with the
  loophole it declined to build around closed by this chain's own
  count-not-position rule. Empty is a claim, not a stub: no pointer in the corpus
  needs excusing. Its five refusal arms are what demonstrate it, and that is the
  state a declaration list should ship in.
- **A DECLARED UNIQUE MARKER MAKES ITS OWN HEADING UNQUOTABLE, and this entry
  found that out by failing the gate.** The first draft above cited a sibling
  section by its exact title, to avoid a positional reference like "the section
  below" — and that title's distinctive span is a `record_sync_check` dual-home
  marker, required to occur EXACTLY ONCE in this file. So the check reported
  `NOT A MARKER … 2 occurrences in the target`, the battery refused, and the
  invocation was logged as a refusal. **Two of this repo's conventions collide
  head-on:** name a section by its title rather than its position, and reserve a
  unique span as a marker. The resolution is to cite a *different* span of the
  title than the declaration reserved, or to name the rule and its date instead
  of quoting the heading. Worth recording because the error message does not
  suggest the fix, and because the count-not-position anchor rule caught the
  person who wrote it.
  **The user's reframing, which is the more accurate reading: the uniqueness rule
  fired on a live attempt to create a duplicate, in prose, on its first real
  opportunity — that is the guard working, not two conventions failing.** And the
  third refusal-log entry being an agent's own, logged and explained in the commit
  rather than tidied away, is the archive being used exactly as designed.
  **The structural fix is recorded as a shape, not done** (`record_sync_check.py`
  header, on the user's ruling — the same treatment the sidecar reader got before
  a producer existed): **decouple the marker from the heading**, giving the
  checker a dedicated token placed once at each record's home and leaving headings
  as free prose anything may quote. Deferred because it is a change across every
  declared pair, in every target file, and done badly it leaves pairs green by
  coincidence — the exact failure the uniqueness rule closed. Until then the
  collision recurs by design, because the constraint is invisible at the site
  where it binds: nothing tells an author which headings are markers.
- **RULED AND FIXED — TWO BATTERY MEMBERS DISAGREED ABOUT WHAT THE POPULATION
  IS.** `internal_quote_check.py` **globbed** `.claude/`, while `battery.py`
  declares its file set **from git**. So an *untracked* draft in `.claude/`
  participated in one member's count and not the other's: this instrument,
  sitting untracked with a marked quote in its header, silently moved the
  ratcheted marked-quote metric, and committing that `record_count.json` would
  have recorded a number the committed tree could not support — a fresh checkout
  would fail the coverage ratchet. Caught by restoring the ratchet and moving the
  draft aside so the gate validated exactly the tree being committed. **The
  user's ruling: `battery.py` was right, and the general form is that a ratcheted
  metric must derive from tracked files** — recorded, with the fix, the declared
  scope and the procedural half, as the sidecar convention's fourth property.
- **THE ORDERING TESTED ON CITATION DATA, NOT CODE (2026-09-09, user ruling).**
  Re-reading testis.js before wiring seminoma's margin category showed the Phase
  A harvest ledger had filed the span "well-circumscribed solid intratesticular
  nodule" under PMC6906820; it is PMC13218944's, a different case report, and
  PMC6906820 carries its own general statement. A span under the wrong id,
  inside the record built to avoid exactly that, written days earlier under
  this discipline — the class does not exempt the records built to avoid it.
  Caught BEFORE wiring rather than after, which is guard-before-repair applied
  to citation data: the first time that ordering has been tested on something
  other than a defect in the corpus. The verdict stood; only the filing moved,
  corrected in place in both homes.

## ANY MACHINE-DERIVABLE NUMBER RESTATED IN PROSE WILL DRIFT (2026-09-05)

Stated as a rule rather than rediscovered a fourth time. **Three for
three in one session**, all the same shape — a number the tooling knows,
copied into prose, still sitting there after the tooling moved:

| restatement | said | was |
|---|---|---|
| `run_checked.sh`'s header enumerating its call sites | "six call sites" | ten instruments |
| the Phase 2 pass description | "36 polarity-flagged windows" | 59 (10 + 49) |
| the crosscheck record | "3 of 141" | 3 of 142 |

**Three remedies, in order of preference:**

1. **Delete the duplicate.** `run_checked.sh` no longer lists its call
   sites at all; it points at `battery.py`'s `INSTRUMENTS`. A number
   that exists once cannot disagree with itself. Prefer this whenever
   the prose does not actually need the value.
2. **Point at the source of truth.** The 49-window read order is
   regenerated by the battery, never snapshotted, for exactly this
   reason.
3. **Quote the line.** Where the number must appear — a commit message
   — `commit_checked.sh` copies the DONE line by machine, so the
   message's numbers cannot drift from the run that produced them.

**The ratchet is the one case where a number is deliberately stored**,
because a comparison needs something to compare against. It is safe
because no human writes it and the only permitted movement is up.

**No detector for this, deliberately.** A general one would need a
declared list of (prose location, live value) pairs — a fourth
hand-maintained list carrying `record_sync_check.py`'s own caveat,

QUOTES .claude/record_sync_check.py
> the map is itself a record that can go stale

and by its own logic it
would be the next thing to drift. The failure is *prevented* by the
three remedies, not caught after the fact. Where a check is cheap and
total over its population — `.claude/` for the instrument list — build
it; where it is another hand-maintained list, use remedy 1 instead.

## POLARITY MENTION READS — the 10 corrective windows (2026-09-05)

User ruling: split the 59 flags and **use the split as ordering.** The
10 corrective-window records go first as a standalone batch, because
each one unread is a booby trap for the epi pass — a citation the
atlas invokes to say something ABOUT a paper rather than draw from it,
which a figure-checking read scores as a defect against a line that
already says the figures are wrong. That is the **Hu 2012** shape, and
it is why the `not-a-source-claim` outcome state exists.

**ALL TEN READ AT MENTION LEVEL. 2 are anti-citations; 8 are real
source claims sitting beside a rejection.**

| record | site | verdict |
|---|---|---|
| Boutros 2015 | prostate.js:139 | **NOT-A-SOURCE-CLAIM** — the atlas asserts this paper does not exist as a first-author work; real source is Cooper CS 2015 (PMID 25730763) |
| Hu 2012 | stomach.js:24 | **NOT-A-SOURCE-CLAIM** — the class-defining case; the atlas documents the transposition chain, it does not assert 54/32/15 |
| Jakob 2012 | skin.js:297 | source claim — the CORRECTION TARGET, already verified verbatim ("Four (0.6%) patients had activating mutations in both BRAF and NRAS", N=677) |
| Lauren 1965 | stomach.js:21 | source claim — the classification source itself; flagged only by window bleed from the mis-citation text two lines below |
| Polkowski 1999 | stomach.js:25 | source claim, **provenance-load-bearing** — its real figures (54% intestinal / 32% mixed / 15% diffuse, 41 esophageal/GEJ patients) are the EVIDENCE FOR the rejection; if they fail, the rationale collapses even though the wrong-organ ground survives |
| Grimm 2018 | stomach.js:146 | source claim — 25 ± 18 mL is IN USE on screen; the rejection is of the folkloric "~50 mL", not of Grimm |
| Mudie 2014 | stomach.js:146 | source claim — 35 ± 7 mL, same |
| Derakhshan 2009 | stomach.js:187 | source claim, **refutation-load-bearing** — M/F 1.07 vs 2.65 is what retires "diffuse is commoner in women"; "the claim is not used" refers to the folk claim, not to Derakhshan |
| Kim 2025 | stomach.js:252 | source claim, **provenance-transparency** — cited precisely as a paper ATTRIBUTING the ≥50% signet-ring threshold to WHO, because no WHO document stating it was found |
| Machlowska 2020 | stomach.js:253 | source claim, same |

- **THE INVERSE TRAP IS THE LARGER ONE, and reading is what found
  it.** The predicted hazard (a verifier scoring an anti-citation as a
  defect) is real but rare: 2 of 10. The common case runs the other
  way — **a reader who trusted the window verdict would skip 8 real
  source claims as "not source claims,"** including two that are
  load-bearing for a rejection and two on-screen figures in active
  use. Both directions are removed by the same read, which is what the
  ruling bought.
- **THE PREDICTION WAS BACKWARDS, and that is the part worth keeping**
  (user, on their own ruling). The batch was ordered first on the
  grounds that each unread record was a trap for the epi pass — which
  implies the hazard was **reading them as sources.** The composition
  says the opposite: 2 anti-citations against 8 real source claims,
  several with figures live on screen. The dominant risk was a reader
  **trusting the window verdict and skipping eight legitimate
  citations**, including the ones whose numbers are the evidence *for*
  the rejection. The ruling was right and its stated reason was
  inverted, so the ordering earned its keep for a reason nobody
  predicted — which is an argument for reading batches whose hazard you
  think you already know.
- **That is the flag-then-human-read contract earning its design.**
  Every window verdict is correct as a window verdict; the error in
  either direction would have come *entirely* from treating one as a
  mention verdict. The window/mention distinction is the thing the
  guard was built to **preserve rather than resolve**, and a guard that
  had tried to resolve it — ruling "not a source claim" on its own
  regex evidence — would have produced 8 wrong rulings here while
  looking more decisive.
- **The guard was right at its own granularity.** Every one of the 8
  sits within ±3 lines of genuinely corrective text, so each window
  verdict is correct AS A WINDOW VERDICT. This is the flag-then-read
  contract working exactly as `citation_polarity.py`'s header
  describes, not a defect in it:

  QUOTES .claude/citation_polarity.py
  > window-level regexes cannot tell the negated mention (Colombino)
  > from the correction target (Jakob) two tokens later
- **Negated mentions are invisible to the extractor, checked not
  assumed:** Colombino 2012 (the wrong-source attribution) yields no
  record at all, so it cannot become a trap. Only Boutros and Hu are
  extracted anti-citations.
- **Consequence: no content edits.** All ten lines are correct as
  written. The batch's output is the verdict table above, which is
  what the epi pass needs so it does not re-litigate them.
- **Stale count corrected:** the Phase 2 pass description said "the 36
  polarity-flagged windows are the candidate population." The live
  scan reports 59 (10 corrective, 49 caveated) over 408 records. Same
  class as the recorded "141" crosscheck total — a number frozen at
  the moment it was written while the extractor moved.

## THE 49 CAVEATED WINDOWS BECOME THE ccf READ ORDER (2026-09-05)

User ruling: they fold into the ccf queue, **not as a separate pass —
as the read order.** A caveated window means the guard has already
spotted a hedge in the vicinity, and the ccf addendum's whole thesis
is that hedges are where certainty drift lives. Reading those clauses
first tests the prediction on the population most likely to confirm or
refute it, which is worth more than file order.

- **22 distinct sites, not 49 reads.** The flags cluster hard: four
  sites carry 26 of the 49 (skin.js:400 with 10, colon.js:212 with 6,
  colon.js:210 with 5, prostate.js:219 with 5). Workload is 22 comment
  windows.
- **No snapshot committed, deliberately.** The order is regenerated,
  not stored: `python3 .claude/battery.py pre-commit` rebuilds the
  records artifact and the polarity scan, and the caveated-window
  records come out in file order within it. A committed list would rot
  against the corpus the way the "36" and the "141" did.
- **THE RATE MEASURED HERE IS NOT THE CORPUS RATE.** This ordering is
  deliberate sampling on the dependent variable — the same shape as
  the displacement read, which was dissolved by widening the aperture,
  and the same reason the absence-claim instrument's own header says
  its clean live run is weak evidence. The ruling wants a TEST of the
  addendum's prediction, and that is what it gives. The
  **pre-registered drift rate for batch 2 must therefore be measured
  on an unordered sample**, or the pre-registration is against a
  population chosen for being hedged.

# Phase 2 roadmap (2026-09-05, user-authored; decisions TAKEN)

- **Decisions:** breadth to ~120 cancers (NCI A–Z scope); content
  PULLED from maintained sources (NCI PDQ, SEER, ClinicalTrials.gov
  v2 API, WHO classification as hand-mapped taxonomy) rather than
  hand-transcribed; tumour visual pass first. RATIONALE CORRECTED IN
  PLACE (2026-09-10, user: "your wrinkle contradicts the roadmap, and the
  roadmap should lose") — the original sentence here said every defect
  class found — scope drift, denominator transplants, attribution errors
  — was a COPY error, so removing the copy (hand-transcription) removes
  the class. FALSE, and it was about to justify a design on the strength
  of being false. A copy error is a transcription typo; this project has
  found almost none of those. Every defect actually found was semantic —
  a true figure attached to the wrong population, register, denominator,
  or certainty (scope drift, denominator transplants, certainty drift, the
  gross/histologic register mismatch, stage-at-diagnosis read as growth
  behaviour, a SEER entity broader than its entry) — and every one of
  those SURVIVES automation intact, several WORSE, because the human read
  that caught each one is the thing automation removes. Pulling from a
  maintained source still buys real things (currency, and consistency
  across a hundred more entries no hand-transcription pass could hold to
  one standard) — it does not buy freedom from this defect class, and the
  atlas's verification discipline does not get to concentrate on
  hand-written prose alone while pulled figures ride unreviewed. See
  `.claude/phaseB_design.md`'s reviewed-versus-unreviewed reframing, which
  replaces this rationale and states what governs content nobody reads
  per-entry.
- **EPI-PASS RE-SCOPE (executed 2026-09-05, same day):** migrating =
  55 share clauses (~19 unread RETIRED, incl. every remaining orphan
  hunt); not-migrating = 156 ccf clauses + histology + anatomy + all
  mechanism prose (~127 unread = the concentrated budget, six-state +
  scope-first + number-anchored searches); known-defective-on-screen
  = fix immediately regardless of migration (bucket empty today).
  Uncited-but-unrefuted migrating figures ride until migration —
  WITH AN EXPIRY (2026-09-05 amendment; a conditional status with no
  review trigger quietly becomes unconditional, the exact annotation
  failure shape): the ten figures with NO source at all (breast ×4,
  ovary ×4, liver-iCCA, gmix clause B) sit on a dated watchlist
  (manifest _uncited_migrating_watchlist, expiry 2026-10-17); if
  Phase B hasn't landed by then they revert to source-or-remove and
  get decided on their own merits.
- **Phase A — tumour visual pass (first):** target is BEHAVIOURALLY
  correct, not anatomically correct (tumours have no canonical shape;
  chasing anatomical correctness produces a confident-looking lie).
  THE CATEGORY IS CITED; THE MAGNITUDE IS NOT (2026-09-05, the one
  conceptual gap closed before the pass): a source says "spiculated
  margin" — no source says sharpness:11. Every parameter mapping
  carries TWO claims of different epistemic status: the behavioural
  CATEGORY, citable and cited; and the numeric VALUE expressing it, a
  design choice DISCLOSED AS ILLUSTRATIVE. This is Tier 3's
  amplitude-vs-structure split applied to geometry — bounded by the
  citation on WHAT the tumour does, illustrative on HOW STRONGLY it
  is drawn. Failing the separation produces the worst available
  outcome: geometry that appears citation-backed to the depth of its
  numbers when the citation reaches only the category — the same
  overclaim as a scope drift, expressed in mesh instead of prose.
  Record the two halves separately per property; the UI-facing
  provenance states that tumour morphology is illustrative of cited
  behaviour, not measured from it. BUILD STEP 1 SHIPPED (2026-09-09): the
  unreachability check (`margin_reserve_check`, renamed `reserve_check` on
  2026-09-09 when the ruling bound the reserved colour to the object and the
  obligation to every axis; the sixteenth battery
  member, fixture-form (7) by design per (7-quater)) and the reserved
  default rendered for uncharacterised/unread entries with its
  non-optional badge — full record in `.claude/phaseA_mapping.md`; cited
  categories wire in next, each proving the reserved form still
  unreachable. THE COLLISION RULE HAS THREE ARMS (user, 2026-09-09):
  reserved-versus-cited, the reserved form yields; deadlock, a
  non-geometric answer (taken: `RESERVED_COLOUR`, a desaturated interface
  teal from outside the tissue gamut, its unreachability from every
  cited tissue albedo asserted by the same check); CITED-VERSUS-CITED,
  NEITHER MOVES — two citations may describe one gross appearance, and
  two categories rendering identically with the distinction carried in
  prose is the truthful outcome; manufacturing a difference between them
  is the invention the split forbids. A harvest seed is not a citation
  and does not make a category wireable. THREE COLLAPSES ARE A VOCABULARY
  FINDING, NOT THE AXIS RUNNING OUT OF ROOM (user, 2026-09-09): the
  ill-defined family carries several names on one appearance while
  melanoma separated on a different property the same day; and a margin
  collapse that relocates a word to the growth axis (GBM's "topographically
  diffuse") lands only once the growth axis DRAWS that property — held
  until the growth build, because a property drawn nowhere is worse than a
  declined axis position. THE GROWTH AXIS IS DESIGNED, NOT BUILT:
  `.claude/phaseA_growth_design.md` (2026-09-09) — four mechanisms tested
  against the ledger, two amendments; RULED the same day: GBM → EDGE tier
  (tier follows ORGAN ARCHITECTURE, not the clinical word — hollow/parenchymal
  dimension in the mechanism table; pre-registered falsifier: a falloff that
  reads as whole-organ tumour sends GBM to a labelled extent), composition
  counted at FOUR (a sibling axis, deferred), one reserved colour bound to the
  object, falloff channel by bake-off against a pre-registered criterion;
  BUILD ORDER FLIPPED — infiltrative falloff first (multifocal has ZERO
  renderable members today), then extent breach, then wall; the growth reserve
  hooks exist in `reserve_check` in fixture form. THE FALLOFF BAKE-OFF RAN
  (design document §9): rimBlend — the mass keeps its colour at the apex and
  takes the organ's albedo where it meets the organ — is the one channel that
  met the pre-registered criterion; opacity and every organ-side channel failed
  on measurement (the organ-side family RETIRED STRUCTURALLY — 22% radius ratio).
  RULED 2026-09-09: rim-blend approved; the reserved apex floor measured on a fixture
  and encoded (`RESERVED_APEX`, cap 1.0 for margin-reserved masses); GBM's extent
  as a KNOWN-TO-UNDERSTATE label in a reusable form; composition re-tested as
  mischaracterised-vs-unexpressed — all four unexpressed, deferral stands. INFILTRATIVE
  WIRED (2026-09-09, design §11): growth statuses for all sixteen entries under the
  fourth property (11 cited / 1 uncharacterised / 4 unread), PDAC and PTC drawn at
  extent 1.0, GBM at 2.5 — THE GBM HOLD IS LIFTED, its badge stating the drawing is
  known to understate the cited extent. A class caught in the first capture: when a
  category is shared, the citation belongs to the entry (GBM's badge had quoted
  PDAC's source). APEX FLOOR RE-DERIVED ACROSS THE ORBIT (2026-09-10): placeholders
  draw no dissolve; a nonzero cap needs a two-organ sweep minimum. SMALL-POPULATION
  INVARIANTS enumerated before Phase C (own section). Extent-by-category rationale
  recorded beside the constants. 2026-09-10: label overlaps fixed and regression
  failures made fatal behind a declared list; puppeteer-core off /tmp; identity
  pattern scoped; render coverage counted (9/17). THE EXTENT-BREACH DESIGN DOCUMENT
  (`.claude/phaseA_extent_design.md`, 2026-09-10): two constraints pre-committed by
  the user before any entry source is read — SEER Summary Stage, never AJCC; breach is
  MODAL and the render must not make it factual — plus the second-structure problem
  designed first; predicted outcome fifteen entries to TEXT (the understated-extent
  form generalised from SEER Stat Facts distributions), melanoma the one geometric
  candidate; three rulings requested. RULED 2026-09-10 (design §8): SIXTEEN to text — melanoma's plug is
  DEPTH, not breach, reassigned to a cited-magnitude axis (§9: the skin block's exaggeration
  measured PER-LAYER, so depth is text unless the block is re-proportioned; priced, not
  recommended; no build without the ruling); `EXTENT_STATUS` wired for all sixteen from 14
  SEER Stat Facts pages, detection-framed. TOLERATED COUNTS RESOLVED 2026-09-10 (own
  section; `.claude/tolerated.py`, one mechanism). PHASE A CLOSED 2026-09-10 (`.claude/phaseA_closeout.md`): wall is the one unbuilt growth
  mechanism with real, unblocked members (stomach, CRC); placement has members behind an
  unmeasured luminal-reachability precondition; count/multifocal has none (checked, not
  assumed — register-H, model-precondition-blocked, or cited-equal-to-default, one reason each);
  composition stays deferred at four. PHASE B OPENED, then REFRAMED and RE-SCOPED TWICE
  (`.claude/phaseB_design.md`): reviewed-vs-unreviewed replaced build-time-vs-runtime as the real
  axis; the roadmap's own "pulling removes the copy class" rationale was corrected in place
  above (2026-09-10) as wrong and load-bearing; the `pulled` schema's own scoring of itself was
  then retracted — an unverified declaration is a laundered claim, not a catch — leaving a
  two-tier architecture (Tier 1 verbatim-plus-qualifiers, machine-checkable, scales; Tier 2
  interpreted, hand-read, stays small) where every defect this session found lives in Tier 2.
  A corpus-wide certainty-drift census (three methods, one proven against a known positive
  before being trusted) found no NEW live instance beyond the one already fixed in kidneys.js,
  bounded to the repeated-citation slice only. Declaration layer (Tier 1/Tier 2 boundary check)
  first, sixth field (`certainty`, rescoped to `backfill`/Tier 2) last, fetcher not started.
  FEASIBILITY TESTED WITH REAL REQUESTS (2026-09-10): ClinicalTrials.gov v2 CONFIRMED
  reachable and structured (a live 200, clean JSON, no account); SEER's real API's 401 was READ
  AS "CONFIRMED BLOCKED" — CORRECTED THE SAME DAY (phaseB_design.md §12): a 401 proves auth,
  not sufficiency, and SEER's own registrar-facing documentation states directly that this API
  serves coding reference data (staging schemas, disease/drug dictionaries, site recode) at
  every account tier, never stage-at-diagnosis or survival statistics, which live behind a
  separate, heavier microdata-request process delivered only through a Windows desktop
  application, not any REST/JSON endpoint. A key would not have helped either way. PDQ has no
  documented content API found after a real search. THE SCRAPER PATH PRICED AND PROVEN
  (phaseB_design.md §13): a layout-guarded scraper against SEER's own public Stat Facts pages
  reproduces all fifteen already-shipped extent lines exactly (plus recovers 5-year
  survival-by-stage, unused anywhere in the app today), refuses correctly on five constructed
  negative controls, needs no account, and confirmed build-time-only (no CORS header on any
  page) — not committed as an instrument yet, priced for a build decision. ARCHITECTURE RULED
  SETTLED; feasibility for statistics now rests on the scraper, not on anyone registering a key.
  Census given its denominator (6-23 of ~139-180 distinct citations, 3-15% coverage, zero live
  instances found within it; a separate ranked-not-sampled certainty-drift pass, §15, read 24 of
  58 flagged clauses and found + fixed one real instance in liver.js, plus two false positives in
  the ranking method itself). Epi-pass re-scope RE-READ AND RESOLVED (§14): the named "~19"
  never reconciled to more than twelve locatable items — skin's melanoma share was found to be a
  bookkeeping miss in the 2026-09-05 note (already cited a week before the note was written, so
  never unowned), and "StatPearls rows" resolves to exactly two bare citations (skin.js SCC/MCC).
  The watchlist is merged to twelve and its expiry rewritten to depend on nothing downstream —
  cite-or-remove, unconditionally, on the date already set (record-sync-guarded, not repeated
  here). Why no record-sync check caught the discrepancy: the one declared pair touching this
  watchlist guards a single date string's uniqueness, not the list's membership against reality —
  a real, named gap, left unbuilt on purpose given the watchlist itself is now resolved rather
  than guarded. Gate timing sized (§17): ~30-45 min/commit today at 16 cancers, `regress.js`
  driving nearly all of it and looping per organ/cancer — the SMALL-POPULATION INVARIANTS
  entry's own predicted hazard, now measured rather than merely named, with Phase C's ~120-entry
  target as the thing that makes it worse. FIVE-ITEM FOLLOW-UP (2026-09-10, phaseB_design.md
  §§18-22): the SEER-401 finding STATED PLAINLY rather than left inferable (a second,
  independent SEER page — the API's own root/docs — corroborates the registrar-coding-only
  reading with zero vocabulary overlap into statistics). THE SCRAPER'S LAYOUT ASSERTION GIVEN
  A REAL POSITIVE CONTROL: three structural mutants (move a section, rename a header, reorder)
  found the first two correctly refuse and the third correctly does NOT (unrelated content
  moved, target block untouched, output byte-correct) — and a fourth, more serious construction
  (a duplicate spurious block with fabricated data) found a REAL gap the original eight
  assertions never covered: `re.search`'s first-match semantics silently bind to an earlier
  duplicate. Fixed with a ninth assertion (exactly one such block per page, or refuse).
  BUILD-TIME STALENESS POLICY DESIGNED: a vintage-string compare (SEER's own basis footnote)
  as the primary staleness signal, a quarterly calendar floor under it, a `stale` state added
  to the `pulled` schema candidate (current/check-due/stale) so aging is visible not silent —
  plus the OTHER argument for build-time, independent of CORS: committed output passes the
  full gate chain every other figure does, a runtime fetch never would. CERTAINTY-DRIFT READ
  RE-DONE AGAINST A DEFINED STOPPING RULE: the prior round's own claimed depth (24 of 58) was
  a miscount — the actual read was 18 distinct, non-contiguous ranks. Redone in strict rank
  order with a stated rule (stop after 10 consecutive clean since the last defect); the four
  skipped ranks (6, 10, 11, 12) read fresh and confirmed clean; rule satisfied exactly at rank
  14 — the corrected, honest depth. RANKER COMMITTED as `.claude/certainty_rank.py` (declared
  NON_INSTRUMENT), its own header stating explicitly why the hedge-word list must NOT be
  tightened after a false positive — inverted economics from a gate, a false negative here is
  permanent and silent. POINTER RATCHET SPLIT BY POPULATION: `pointer_check.py`'s single
  `pointer.pointers` total is retired in favor of `pointer.pointers_code` (manifest structured
  refs + .claude/*.py`/`.sh` comments, floored, unchanged semantics) and `pointer.pointers_prose`
  (CLAUDE.md + `.claude/*.md` + the manifest's own narrative keys, reported every run, explicitly
  NOT floored) — the 579 shrink was the population's actual failure mode, not a one-off, and a
  documentation condensation can now proceed without tripping a floor built to protect a
  different population. Migration disclosed: the stale combined key removed from
  record_count.json's stored counts in the same commit; live split 452 code + 138 prose = 590,
  matching the pre-split total exactly. CONVENTION F ADDED (battery.py's standing-conventions
  block): a parser/extractor's own condition-(7) fixture set must include a PLAUSIBLE-BUT-WRONG
  input, not only a broken one — named from the scraper's own duplicate-block gap, where eight
  assertions and eight broken-shape fixtures all passed and only a well-formed, fabricated
  SECOND block surfaced the real failure (silent wrong data, not a refusal). RECORD-SYNC GAP
  RE-SCOPED TO THE CLASS (phaseB_design.md §16): "the watchlist is resolved" answered the
  instance, not the class it belongs to; verified two more live members (MARGIN_STATUS/
  GROWTH_STATUS's per-entry status claims, the hand-swept "composition four") and split the
  class into two sub-shapes — claims about text already in this repo (cheaply automatable,
  left unbuilt on frequency grounds, not a structural limit) versus claims about literature
  outside it (not automatable without a live fetch, the same limit external quote-verification
  has always had). CERTAINTY-DRIFT RESULT RE-FRAMED (§20): 44 of 58 ranked clauses are UNREAD,
  not clean — the stopping rule certifies the pre-registered low-yield assumption was never
  contradicted, not that the tail was checked; recorded separately as a VALIDATED PROPERTY of
  the ranking itself (the one defect landed at rank 4, ten clean reads followed, real evidence
  the ordering works, not a lucky run). CWD-RESET RULE WIDENED (run_checked.sh, a third live
  instance this session): the explicit-form rule covers every background-issued command, not
  only ones whose output becomes a claim — this one was a mutation (a commit attempt) that
  failed safely by luck, not by design. PHASE D OPENED AS ITS OWN DESIGN DOCUMENT
  (`.claude/phaseD_trials_design.md`): the condition-mapping method demonstrated live on two
  entries (ccRCC clean at 7/8 with one named broadening; gastric diffuse-type caught a REAL
  cross-domain false match — a brain-tumor basket trial — from naive subtype-keyword matching,
  corrected by dropping the colliding term), the three duty-of-care constraints made concrete
  (fixed copy, a neutral sort key, no eligibility reproduction), status/staleness designed
  (an include-list of open statuses, display + fetch timestamp both), the four-state failure
  mode specified (borrowing deploy_check's own measured-catastrophe-vs-failed-to-measure
  distinction), location handling decided (ignore, with reasoning and a revisit trigger), and
  a live CORS check finding ClinicalTrials.gov permissive (unlike SEER) — confirming trials CAN
  be a genuine client-side runtime fetch. No fetch code, no component, no schema field touched;
  a ruling on the document is the next step. Then wall; multifocal when it has a renderable
  member. COLD-SESSION ENTRY POINTER: read
  CLAUDE.md, then Phase A of this roadmap; conditions (1)–(8) are
  binding — that is the whole prompt.
  Four cited properties: site (pos3d, already modelled), margin
  character (spiculated/circumscribed/lobulated → sharpness/
  spikeCount), growth pattern — NARROWED (2026-09-05, user): render
  the CONSEQUENCE, not the pattern. Diffuse/linitis-plastica → a
  thickened, rigid organ WALL (the one genuinely new expression);
  exophytic → a mass protruding into a lumen (placement +
  orientation, already parameterised); infiltrative → indistinct
  boundary as a soft falloff at the tumour margin (the current
  material can do it); multifocal → several small masses (already
  how the site maps work). Three of four fall out of existing
  machinery; the open question per cancer is WHICH consequence, and
  the pre-registered negative applies to whatever doesn't map —
  stage-size (radius ← SEER Summary Stage). PREMISE VERIFIED in
  source 2026-09-05: organicSpiculate(geometry, {amplitude, freq,
  seed, spikeCount, spikeLength, sharpness}) at viewer.js:223, driven
  today by constants + idx-seed at the site-map blob loop's
  organicSpiculate call in main.js (the one whose next line carries
  `amplitude:0.14, freq:4.2`) — the pass is
  re-pointing existing knobs at cited behaviour, not a new renderer.
  New citation class (4 properties × cancers, ~64 items) —
  CLASSIFICATION-FACT EXCEPTION (2026-09-05, resolves the Phase-B
  dependency): these are not statistics but stable classification
  facts (WHO / PDQ pathology sections; an infiltrative growth pattern
  reads the same in 2030), a PERMANENT exception to the content-model
  shift, hand-cited NOW at the existing standard with nothing to
  migrate later. Refined content rule: PULL statistics (the revisable
  numbers); HAND-CITE stable classification facts and mechanism
  prose. Living tertiaries still get Phase-3 treatment. Gates: lesion-vs-shadow INVERTED (does normal tissue read as
  diseased?), regress, P3 framing checks. PRE-REGISTERED NEGATIVE:
  some cancers have no distinctive visual behaviour — a generic mass
  with an honest label beats an invented characterisation.
- **Phase B — integration architecture:** build-time vs runtime is
  the shaping decision; likely BUILD-TIME for statistics (frozen,
  auditable, detector-checkable) and RUNTIME for trials (they change
  weekly). PDQ-BACKBONE ASSUMPTION, first evidence (2026-09-05,
  calibration lesson #1 logged here as well as Phase A): PDQ's
  coverage is shaped by its purpose — treatment summaries — rich
  where management lives, thin on gross pathology. "The backbone" is
  PARTIAL: verify per-field coverage during integration design rather
  than discovering it again then. Provenance schema redesign: field ← endpoint ← retrieval
  date ← discipline. One integration verified thoroughly beats two
  thousand transcriptions — but only if the contract is explicit.
  Conditions (1)–(8) + run_checked govern integrations from birth.
  ASSERTION INDEX (2026-09-05 addition, twice-earned in one day): the
  manifest indexes citations by SOURCE, not by what they ESTABLISH —
  so "do we already have a cited basis for seminoma's margin" is a
  grep through prose rather than a query, and coverage gets
  rediscovered instead of looked up. Twice today the atlas already
  contained what a pass was about to source externally (van der
  Kaaij's abstract-verifiable clause; the harvest's five fully-cited
  morphology categories, one with a PMC id). The redesign records
  what each citation ASSERTS — subject, property, claim — alongside
  where it came from, so the next pass queries the index and the
  answer is complete rather than as-good-as-the-grep. Payoff already
  demonstrated: the harvest retired a third of the margin/growth
  population and changed the rate-limit arithmetic before the
  constraint was measured.
- **Phase C — breadth to ~120:** two early decisions — each new
  organ is an asset hunt under the licence playbook (the expensive
  half of Phase 1; some will end in documented negatives), and BLOOD
  CANCERS (~10% of incidence) break organ-centric navigation
  entirely: leukaemia cannot be clicked; a second navigation model
  (system / cell lineage / parallel entry) is a design decision to
  take before it forces itself.
- **Phase D — staging + trials:** SEER Summary Stage (US-gov public
  domain), NOT AJCC (copyrighted; describe its existence, link, never
  reproduce the tables). TRIALS carry a different duty of care:
  eligibility is not conveyable (the UI must not imply a listed trial
  is available to the reader); no endorsement, no ranking by apparent
  promise — neutral order, stated; THE HANDOFF IS THE POINT (a reader
  arriving at their oncologist with informed questions, said on the
  page). Framing designed BEFORE the integration. **DESIGNED, 2026-09-10:
  `.claude/phaseD_trials_design.md` — trials taken ahead of the rest of
  Phase B (the one source confirmed both available and sufficient, no
  key, and CORS-permissive per a live check, unlike SEER). The
  condition-mapping method demonstrated on two entries, not just
  described; the three constraints above given concrete form; status/
  staleness, the failure-mode states, and location handling all
  designed with reasoning. Awaiting a ruling before any fetch code.
  **RULED AND BUILT, 2026-09-11:** a live re-query found the ccRCC corpus
  had already moved (zero NCT-id overlap with the prior day's sample),
  which moved the guard from a one-time query verification to a standing
  FETCH-TIME FILTER on each returned study's own declared conditions —
  `js/trials.js`, wired for `ccrcc`/`gdiff` via `#txTrialsToggle`/
  `#txTrialsLayer` at the cancer screen's site-map level. Verified live in
  the browser on both entries (real fetches, correct sort, the drop count
  reported in-page, a "multi-condition trial" note firing correctly on
  basket-trial titles) and against a planted wrong-disease fixture pair
  (Convention F) before being trusted. One real accessibility gap
  (`#txSiteViewer` hidden via CSS but not `inert`, leaving its buttons
  keyboard-reachable underneath the panel) was found and fixed while
  building, not after. Full record in `.claude/phaseD_trials_design.md`
  §§1a–1d, §9. The remaining fourteen entries' mappings are still not
  built — deferred to whenever a ruling opens that scope.
- **ccf-READ CONTRACT ADDENDUM (2026-09-05, user-authored; full text
  in the manifest's _ccf_read_addendum):** the ~127 remaining clauses
  are mechanism prose with no number to anchor on. THE ANCHOR IS THE
  NAMED ENTITY (PIK3CA is exactly as unparaphrasable as 17/23):
  extract entities → find them in the source → read the surrounding
  sentence for the RELATIONSHIP. Capability check ports unmodified.
  The drift direction holds but the dropped qualifier is EPISTEMIC —
  mechanism drift drops HOW CONFIDENTLY IT WAS SHOWN ("associated
  with"→"causes"; hedges; "suggests"→"shows"; "in this cohort"→∅;
  "proposed"→"established") — and THE IN-VITRO/MOUSE OMISSION IS THE
  ONE TO WATCH HARDEST: most common in review-derived prose, least
  visible, most consequential — a patient reasonably assumes a
  mechanism claim was shown in humans. NEW STATE: VERIFIED-CLAIM,
  CERTAINTY-DRIFT (mechanism real and cited, assertion stronger than
  the source; consequence = copy edit restoring the dropped qualifier
  in the source's own words). verified-derived does not apply. RATE
  deliberately NOT pre-registered — batch 1 establishes it, then it
  pre-registers before batch 2 (condition (8): the first batch
  calibrates the method, not the content). GATES unchanged, plus:
  where a mechanism claim rests on a REVIEW, record it — the
  secondary-source rule governs (verifies what the review asserts,
  not what the underlying work showed).
- **ccf BATCH 1 — READ AND CLOSED (2026-09-06). 11 records, 5 sites,
  boundary declared before reading. CERTAINTY-DRIFT: 0 of 11.** Ten
  verified (nine verified-quoted, exact to numerator and denominator
  wherever numeric) and one confirmed anti-citation (Foulkes 2010,
  correctly recorded as carrying no percentages — figures had been
  dropped rather than kept). Four copy-edits shipped: Segelman's verb
  and denominator, Fleming's dropped "sporadic", Wippold's misquoted
  hyphen and its unrecorded review status. **The batch's real output is
  two measurements about the METHOD, which is what condition (8) says a
  first batch is for.**
  **(a) THE READ ORDER DID NOT SELECT WHAT IT WAS BELIEVED TO SELECT.**
  Measured at dc12997, not assumed: the 22 caveated sites are generated
  by 12 distinct hedge locations, and 39 of the 49 flagged records sit
  on a line carrying no hedge at all — they are NEIGHBOURS of one.
  `colon.js:210`'s single "disputed" marks 3 sites and 14 records;
  `skin.js:397`'s "paywall" marks 3 sites and 15. With `REGIONS_*`
  entries written as ~1,000-character single-line literals, a ±3-line
  radius is a ~3,000-character aperture, so "this record sits in a
  caveated window" is a correct window verdict and nearly uninformative
  as a record verdict. Same window-versus-mention distinction the
  polarity mention reads established, now quantified.
  **(b) THE BATCH TESTED THE PREDICTION ON THE WRONG SUBSTRATE.** 7 of
  the 11 were numeric claims with explicit denominators, where fidelity
  is exactly checkable and drift cannot hide; only 2 were mechanism
  prose of the kind the addendum describes. The hedges cluster in
  numeric-provenance comments, so caveated-first order preferentially
  surfaces EPIDEMIOLOGY. **The zero is therefore not evidence against
  certainty drift — it is evidence that this ordering cannot sample
  for it.**
  **THE ACCIDENT THAT HELPED (user, and the reason batch 2 is cleaner
  than planned): because 80% of flagged records sit on unhedged lines,
  batch 1 was retrospectively NOT a hedged sample — it was an unordered
  sample of numeric claims.** That makes batch 1 vs batch 2 a clean
  SUBSTRATE comparison with no hedging confound, since neither cell is
  actually hedged. A failed ordering produced a better experiment than
  the intended one.
  **PRE-REGISTERED, BATCH 2 (substrate, not inversion):** mechanism
  prose drifts more than numeric claims, because a number either
  matches or it doesn't while a hedge can evaporate. Stake: n=15 drawn
  unordered from mechanism `note` prose across organs, polarity flags
  ignored entirely, **1–3 CERTAINTY-DRIFT instances, strictly more than
  batch 1's zero**, with the in-vitro/mouse omission the most likely
  form.
  **BATCH 3, QUARANTINED DELIBERATELY:** the inversion hypothesis — that
  hedged prose drifts LESS because a hedge marks work already done —
  remains untested and needs its own cell: **hedged mechanism prose,
  drawn from the 12 real hedge locations, not from the 49-record window
  expansion.** Small, and run THIRD. Folding it into batch 2 would
  reintroduce exactly the confound the aperture measurement just handed
  us a way around.
  **Method note, on false zeros:** four zeros in this batch were
  artefacts, not findings — two publisher cookie walls (PubMed, Wiley),
  one truncated PMC page, and one paper that reported the finding in
  different words ("No significant difference … was observed" for a
  claim of no enrichment, with zero hits for "enrich"). **Absence of the
  search term is not absence of the finding**, and a zero from a source
  read is a hypothesis about the fetch before it is a fact about the
  paper.
- **ccf BATCH 2 — READ AND CLOSED (2026-09-06). 15 records drawn from a
  frame of 48 mechanism-`note` sentences, seed `int('b0f7330',16)` — the
  HEAD at which the frame was built, fixed before the draw and
  ~~auditable~~ **NOT AUDITABLE: CORRECTED IN PLACE (2026-09-08), and the
  strikethrough is deliberate because the word is the finding.** The frame
  was fixed before the draw, which is the part that was true and is worth
  keeping; it is not auditable, because THE SAMPLE CANNOT BE REPLAYED.
  Established by trying, not by noticing an absence — the three checks and
  their counts live in `.claude/ccf_load.py`'s header, which is where the
  frame-and-draw machinery that replaces this now lives. The short of it:
  no frame or draw artefact was ever tracked, the only commit in all of
  history carrying the string `b0f7330` is the one that WROTE this
  sentence, and ten mechanical readings of "mechanism-`note` sentences" at
  that tree yield no count matching the one above. **A SEED IS NOT A
  RECIPE** — replay needs the frame MEMBERSHIP and the draw PROCEDURE too,
  and commit-binding does not help, because `b0f7330` pins the tree the
  frame was drawn FROM and says nothing about which of it was IN the
  frame. This is `ccf_load.py`'s own "a figure that only a remembered
  method can reproduce is not really bound to anything", firing on a
  SAMPLE rather than a figure. **CERTAINTY-DRIFT: 4 of 15, against a
  pre-registered 1–3.**
  The stake was right in direction and wrong in magnitude, and the
  over-range result is recorded as measured rather than trimmed to fit.
  The four: `kidneys.js:141` "found convergent evolution" where Gerlinger
  says "**suggesting** convergent **phenotypic** evolution" — the
  addendum's own canonical example, live; `lungs.js:215` "**recurrent**
  mechanism" where the word has zero hits in Awad and the finding is two
  patients on adagrasib monotherapy out of 38; `colon.js:274` and
  `colon.js:275` both "**confirmed**" over Cornish β P-values the source
  labels "**Uncorrected** two-sided P-values", where another panel of the
  same paper reports Q<0.05.
  **TWO MORE DEFECTS, OTHER CATEGORIES, ON USER RULING — total 6 of 15.**
  `colon.js:275` also dropped Li's population entirely (**SCOPE DRIFT**,
  the Paly/kidneys/testis shape: "6530 CRC tissue samples obtained from
  6530 **Chinese metastatic** CRC patients", and the quoted co-occurrence
  sentence is scoped "In the **MSS** group" — 6,056 of the 6,530 we
  printed as its denominator). `colon.js:210` cited Fang for SMAD4
  **loss** where the meta-analysis screened out "63 articles relate to
  SMAD4 **protein expression**" and measures mutation (**CATEGORY
  SUBSTITUTION**, the TNBC-for-basal-like shape — a substitution, not a
  rounding).
  **THE LI QUALIFIER IS LOAD-BEARING, NOT DECORATION**, which is the
  strongest argument yet for the scope-drift class: Li's own discussion
  reports APC mutated in "62.8% in our MSS samples and 77.9% in the MSK
  MSS samples", so the cohort we cite for an *APC* co-occurrence has a
  materially different APC base rate than the Western cohorts nearly
  every other frequency here comes from. Dropping "Chinese" dropped the
  one caveat that bears on the claim being made.
  **PLUS ONE ATTRIBUTION ERROR, RECATEGORISED ON USER RULING (Beyer /
  Paly / Zeng / Wood class, own category and own count):** `prostate.js:222`
  said "TCGA (2015) **found**" a preponderance TCGA explicitly attributes
  elsewhere — "**The former** included the preponderance of PTEN
  deletions in ERG fusion-positive cases **(Taylor et al., 2010)**", where
  "the former" is *already-known* alterations. I had filed this as a
  copy-edit by analogy with Wippold's unrecorded review status; the ruling
  separates them, because Wippold was a missing annotation on an accurate
  claim and this asserts the wrong author. Recategorising rather than
  folding in preserves batch comparability *and* files it correctly.
  **THE TWO RATES ARE ON DIFFERENT AXES AND MUST NOT BE MERGED.** 4 of 15
  is the CERTAINTY-DRIFT rate and is what batch 3 is measured against,
  because batch 3's hypothesis is about hedges and a hedge is a certainty
  marker — no hedge would have protected against a dropped cohort or a
  substituted category. 6 of 15 is the total-defect rate on this
  substrate, which is what the remediation-load estimate uses. Both are
  written here with their axes named precisely because, unnamed, a later
  reader would "update" one to the other and the batch-3 comparison would
  silently change base.
  **THE CORPUS AS ITS OWN CONTROL — second and third instances after
  Segelman, and a source-free signal worth naming even if nothing is
  built on it.** The Cornish pair is the sharpest: `colon.js:222` tracks
  "the only pairwise signal that survived Bonferroni" and `colon.js:275`'s
  very next clause tracks an anti-correlation that "did not survive
  multiple-testing correction", so the file already knew the distinction
  the note dropped. Third instance in the same record: the comments at
  `:222` and `:258` both carry Li's MSS scope that the user-facing note
  omitted. A defect detectable without opening the source at all.
  **[3] PAIRS WITH THE BLADDER DEMONSTRATION** as the second defect class
  invisible to number-matching: the number and the quoted span are both
  verbatim correct, and only the sentence AROUND the quote betrays it.
  Two instances in two batches is a pattern, not an accident.
  **QUOTED-SPAN CHECK — two design inputs from this batch.** (a) Li's
  quote differs from source by one character: `co‐occurrence` U+2010 vs
  ASCII `co-occurrence`. In an `ensure_ascii=True` corpus a byte-comparing
  checker fires on every legitimate transliteration, so a
  Unicode-normalisation policy is a precondition, not a refinement. (b)
  Cornish's `+0.066`/`+0.086` have zero hits in the article text — read
  off an Extended Data figure. Legitimate, but a span check finds no span,
  so figure-derived numbers need a declared marker: the
  declared-and-tolerated shape again.
  **MODELLING VOCABULARY, STATED ONCE (user ruling).** "Cooperating"
  appears 30 times in `js/organs/*.js` and only 10 carry the contrastive
  frame, so the convention is not self-evident from the pattern, and it is
  modelling vocabulary wearing the clothes of a mechanistic claim. One
  sentence now closes the provenance copy in `cancer-atlas.html`, beside
  the site→gene teaching-device sentence it is modelled on — and it covers
  the consequence-language labels too (`PTEN loss` ×8, `CDKN2A loss` ×5,
  `SMAD4 loss` ×3, `VHL inactivation`, …), which is the root the Fang
  substitution grew from. The labels are NOT renamed: the convention is
  corpus-wide and defensible, and the defect was in the clause that
  attributed a mutation finding to "loss".
  **A STRONGER RESULT DECLINED ON CONVENTION GROUNDS.** `colon.js:222`
  records that AMER1×APC co-occurrence survived Bonferroni in this
  project's OWN three-cohort computation (TCGA nHM / DFCI MSS / MSK MSS) —
  which would have supported "confirmed" better than Cornish does. It
  stays out of the user-facing note: own computation governs
  inclusion/exclusion decisions in the record, and is not cited to the
  reader as a finding. Downgrading was still the right edit.
  **NOT VERIFIED, RECORDED AS SUCH:** Gerlinger's full text is unreachable
  (epmc-xml 404, pmc-www 167-char throttle, epmc-www 1,514 chars), so the
  three SETD2 mutation specifics are UNVERIFIED-BY-FETCH — kept, not
  deleted, because an unreachable fetch is not a refutation. Cooper 2015
  has a Corrigendum (PMID 26018901) whose content is unchecked.
  **PLANNING CONSEQUENCE (user):** the remaining ccf queue is *all*
  mechanism prose, so at this substrate's rate the remediation load is
  materially higher than the old mixed-content figure implied — and
  correspondingly the value per read is higher too.
  **BATCH 3 IS DIRECTIONAL, NOT A RATE (user ruling).** 12 hedge locations
  will not yield 15 mechanism claims, and a rate from ten records is
  noise. The question is binary and worth answering anyway: near zero and
  the hedge really does mark epistemic work already done; near the
  certainty-drift rate above and hedging is irrelevant — which kills the
  ordering idea outright rather than leaving it mis-specified.
- **ccf BATCH 3 — READ AND CLOSED (2026-09-06). The inversion test. Frame
  n=8 at `ab3ed93`; four members were lines edited that same day in
  `ab3ed93` and were EXCLUDED AS CONTAMINATED rather than adjusted for.
  INDEPENDENT n=4. CERTAINTY-DRIFT: 0 of 4. TOTAL DEFECTS: 1 of 4.**
  Pre-registered before reading: near zero, and the killer would be "a
  hedge present but misplaced — hedging the mechanism while stating the
  scope flatly."
  **THE HEADLINE IS THAT THE TEST CANNOT ANSWER ITS OWN QUESTION.** At
  batch 2's 4/15, P(0 of 4 clean) = 0.733⁴ ≈ 29%. So 0 of 4 does not
  exclude 27%, and "directional" was still too strong a frame for four
  records. **Do not cite batch 3 as evidence that hedging works.** What it
  does establish is a matched comparison, which needs no rate: each clean
  record cleared the exact axis a batch-2 record failed. `bladder.js:232`
  carried Allory's FGFR3 counter-association INTO the user-facing note
  (Cornish's record dropped a distinction the same file knew);
  `pancreas.js:206` labels an immunolabeling endpoint "SMAD4 loss" and its
  ccf separates mutation+SV from homozygous deletion (Fang's record called
  a mutation meta-analysis "loss"); `liver.js:251` used Guichard's own
  significance word at a boundary p=0.05 rather than strengthening it.
  **THE REAL FINDING — THE DRIFT MOVED, IT DID NOT VANISH, AND THE UNIT
  WAS WRONG.** `bladder.js:232`'s user-facing note is clean while the
  provenance COMMENT feeding it carried two defects: Allory's numerator as
  282/357 where the source says "283 of 357", and the first series called
  "a primary NMIBC cohort" where the source says UBCs "of different
  stages" — the stage heterogeneity contradicting the stage-independence
  argument the note rests on (**corpus as its own control, fourth
  instance**).
  Same at `liver.js`: the framed line clean, the adjacent ARID2 record
  resting on an unnamed source. So hedging predicts a clean USER-FACING
  sentence and says nothing about the record beneath it. The ordering idea
  is not dead and not confirmed; it is mis-specified in the UNIT.
  **CONSEQUENCE, ON USER RULING — RE-SPECIFY THE UNIT AS RECORD-PLUS-
  COMMENT BEFORE THE NEXT BATCH, NOT AFTER.** Batch 2's 6/15 was measured
  on the wrong unit too, and the remaining ~127-clause queue counts
  CLAUSES, not the comments under them. **The true remediation load is
  larger than the clause count implies.**
  **THE 282/357 CASE IS THE FIRST KNOWN DEFECT `fraction_check` CANNOT
  SEE, and it is recorded in that tool's header, not only here.** Two
  blind spots, both proven by running `check_string` rather than reasoned
  about: (1) 282/357 = 78.99% and 283/357 = 79.27% both print as "79%", so
  a wrong numerator surviving its own rounding is invisible on the very
  tolerance that makes "~92%" for 91.8% legal — 250/357 does fire, so the
  check is live; (2) `FIELDS` scans quoted field literals only, and this
  fraction was in a `//` comment, so it was never a candidate at all. **The
  instrument's own header has carried the correct 283/357 the whole time**
  (`fraction_check.py:13`) — **corpus as its own control, fifth instance,
  and the sharpest: the tool documented the right number and still could
  not catch the wrong one.** Extending `FIELDS` to comments is deliberately
  NOT done: a change in reach must be declared and measured (aafbe04).
  **FETCH AND METHOD NOTES.** Allory finally resolved by exact title after
  two failed author searches: PMID 24018021, Eur Urol 2014. Rachakonda
  verified at full text (214/327, 65.4%, "even distribution across
  different stages and grades" verbatim, population "urothelial cell
  carcinoma of bladder" — organ scoping correct). Guichard's PMC page
  serves fine at 170 KB; `/tmp/ft.py` reported it as "TOO SHORT
  (wall/throttle/stub)" — **the same conflation of an extraction failure
  with a wall that aafbe04 removed from `citation_crosscheck`, recurring
  one layer down in the scratch helper.** `pmc.ncbi.nlm.nih.gov` served a
  **reCAPTCHA challenge page** for two articles; NOT attempted, read via
  the Europe PMC REST API instead. **A gated fetch is recorded as gated.**
- **THE ccf READ UNIT, RE-SPECIFIED BEFORE BATCH 4 (2026-09-07), which is
  the batch-3 ruling above being executed rather than acknowledged.
  SUPERSEDED — THE RE-SPECIFICATION DID NOT SURVIVE THE BATCH IT WAS MADE
  FOR: reverted to RECORD-ONLY on ruling (2026-09-08), with the grounds at
  batch 4's write-up below.** The entry is kept as written because a
  negative result is only interpretable against the claim it tested, and
  because the attachment machinery it specifies is still built and still
  used — for batch 4's replay and for the one narrower class that survived.
  Read on for what was claimed; do not read it as current. The
  unit **WAS** **THE RECORD PLUS ITS PROVENANCE COMMENT**, and attachment is
  mechanical rather than judged: the contiguous `//` block immediately
  above the record's own line, PLUS the contiguous `//` block immediately
  above the declaration of the array the record sits in. Both kinds, not
  either — the bladder defect was in the SECOND kind, a block above
  `const TRUNK_UC = [` with no comment at all immediately above the record,
  so an inline-only rule would have reproduced the exact miss that forced
  this re-specification.
  **THE LOAD, MEASURED AT `37aa47a` ON A CLEAN TREE** — bound to a commit,
  which is the last of the four ways the number rule allows: 144 records
  carry a `gene:` field and 117 of those carry a ccf; **those 144, not the
  117**, attach 29 distinct comment blocks totalling 984 comment lines; the
  median record attaches 17 such lines, one `liver.js` record attaches 120,
  and 55 records attach none.
  **"THE ONLY ONE AVAILABLE HERE" WAS TRUE WHEN WRITTEN AND IS NOW FALSE**,
  corrected in place rather than reworded: `.claude/ccf_load.py` re-derives
  every figure above on demand, so POINTING AT THE SOURCE OF TRUTH is
  available too, and commit-binding is now a choice rather than the last
  resort. The figures stay bound to `37aa47a` regardless, because a number
  written into prose needs a tree named next to it whatever else exists.
  What changed is that the binding is CHECKABLE: `ccf_load.py --verify`
  re-measures that commit and refuses to agree quietly.
  **WHICH IS HOW THE AMBIGUITY ABOVE WAS FOUND.** The sentence used to read
  "they attach 29 distinct comment blocks", and "they" can mean either
  population. Scored over the 117 the same tree gives 26 blocks, 951 lines,
  a median of 25 and 39 attaching none — so the first draft of the script
  read the smaller population, disagreed with all four figures, and **was
  about to report the RECORD as wrong.** The sweep said otherwise: the
  record reproduces exactly, on all seven figures, and the script was
  reading 117 records where the record had read 144. **A FIGURE THAT ONLY A
  REMEMBERED METHOD CAN REPRODUCE IS NOT REALLY BOUND TO ANYTHING** — the
  commit pinned the tree but not the unit, and the unit was the part that
  moved. That is the argument for saving the script, made by the script.
  **AND NO FRESHNESS INSTRUMENT WAS BUILT — CONSIDERED AND DECLINED
  (2026-09-07), not held.** The failure mode is already closed: a figure
  bound to a named tree cannot go stale, so what an instrument adds is
  freshness, which is nicer and not load-bearing. Its cost is a sixteenth
  declared instrument and another sidecar to keep in step — the same bar the
  glob checker was declined on, and the same reasoning: an existing remedy
  that closes the hole beats a second one that closes it sooner. `ccf_load.py`
  is the middle that is actually better than either, a declared
  NON-instrument whose output is evidence rather than a gate.
  **IF THAT IS EVER REVISITED, THE CLAUSE THAT HAS TO CHANGE IS THIS ONE,
  QUOTED SO IT CAN BE FOUND RATHER THAN COUNTED TO** — "bound to a commit,
  which is the last of the four ways the number rule allows". Naming it by
  position would have been this session's own defect one more time: a
  hand-typed address into prose that any insertion above it falsifies. An
  instrument would make the commit-binding
  unnecessary rather than merely optional, and that sentence is where the
  decision is written down, so that is where the argument has to be re-made.
  **THE COMMENT LINES ARE SHARED, AND THAT IS THE THING THE ADJECTIVE
  "LARGER" WAS HIDING IN BOTH DIRECTIONS.** A block above a container
  serves every record inside it, so the load is clauses PLUS blocks, not
  clauses TIMES lines: 984 lines read once each, not 117 × 17. Larger than
  the clause count, as ruled — and BOUNDED, which the clause count never
  was, because it counted the wrong thing rather than too few of them.
  **AND THE QUEUE'S IDENTIFIERS HAD TO MOVE WITH THE UNIT — THE FINDING
  THAT FORCED IT, WHICH CAME FROM READING AND NOT FROM AN INSTRUMENT.**
  Batch 3's three records are named in this file by `file:line`, and **TWO
  OF THE THREE WERE ALREADY WRONG IN THE COMMIT THAT WROTE THEM**
  (`2f35ac8`). Checked against git rather than reasoned about: at
  `2f35ac8^` the TERT record sat at bladder.js:232 and the ARID1A record at
  liver.js:251 — which is what the reader read, so both were right at read
  time — and the SAME commit's repair inserted comment lines above each,
  pushing both down. The third survived only because that file had nothing
  inserted above its referent. All three pointer strings entered this file
  in that one commit, so this is staleness at birth, not drift afterwards.
  **NOT A NEW CLASS, AND SAYING SO IS THE POINT:** the mechanism is already
  named in `internal_quote_check.py`, about two pointers of its own —

  QUOTES .claude/internal_quote_check.py
  > both were stale by the time this file was committed, because the
  > same commit added a QUOTES block near the top of each target and
  > pushed the lines down.

  **AND IT IS NOT CONFINED TO BATCH 3 — MEASURED AT BATCH 4's START
  (2026-09-08), because a class found once is worth testing on the
  neighbouring population before it is filed as an incident.** Batch 2's
  six defect pointers were resolved against git the same way, and **TWO OF
  ITS SIX ARE STALE AT BIRTH TOO, IN A DIFFERENT COMMIT (`ab3ed93`) FROM
  THE SAME CAUSE.** All six are correct at `ab3ed93^`, the tree the reader
  read: `colon.js:274` is `gene:'TCF7L2 alteration'` and `colon.js:275` is
  `gene:'AMER1 (FAM123B/WTX) mutation'` there. The same commit's repair
  inserted six comment lines above them and pushed both to 277 and 278,
  where the record was then committed. The other four sit in files with
  nothing inserted above their referent and survived — the identical
  survival pattern batch 3's third pointer had. **So the count is four
  stale pointers across two commits, not two in one**, and the mechanism is
  not "that one repair commit" but ANY commit that both fixes a record and
  writes down where the record was.
  What is new is only the POPULATION: prose pointers from this file into
  `js/organs/*.js`, which `pointer_check.py` gives FLOOR ONLY under an
  explicitly declared boundary. It reported `530/530` and `266/266` green
  at `37aa47a` while two of these pointers named the wrong line, and **that
  is the declared boundary behaving as declared, not a defect in it** — the
  same flag-then-read contract recorded for `citation_polarity.py` above.
  **THE REMEDY ALREADY EXISTS AND IS ALREADY CHECKED, SO NOTHING IS BUILT
  HERE.** `internal_quote_check.py` scans this file for `QUOTES <path>`
  markers, its targets may be any path in the repo, and it requires the
  quoted span to occur EXACTLY ONCE. So a batch-4 record names its unit by
  SPAN, not by line, and the span is verified by an instrument that already
  runs. **FEASIBILITY MEASURED RATHER THAN ASSUMED:** at `37aa47a`, 116 of
  the 144 records are uniquely identified by their bare `gene:'…'` span;
  the remaining 28 are the same gene modeled at two sites in one file,
  where EXACTLY ONCE fails and the span must be lengthened into the ccf or
  the region id before it can anchor anything.
  **WHAT THIS DELIBERATELY DOES NOT DO.** It re-reads nothing. Batch 2's
  6/15 and batch 3's n=4 were measured on the old unit and are NOT restated
  on the new one — ~~re-deriving them is batch 4's work, not a footnote
  here~~ **SUPERSEDED (2026-09-08): RE-DERIVING BATCH 2's IS IMPOSSIBLE, NOT
  MERELY DEFERRED.** That sample cannot be replayed and its only still
  identifiable members are its six defects, so batch 4 substitutes a
  within-batch control; see the pre-registration below. The sentence is
  struck rather than reworded because "batch 4's work" is exactly the
  expectation that had to be given up.
  The two stale pointers are repaired when their records are next read,
  rather than by a sweep: a hand sweep buys a state the next content commit
  partially undoes, which is `pointer_check.py`'s own reason for putting
  the guard before the repair.
- **ccf BATCH 4 — PRE-REGISTERED, NOTHING READ (2026-09-08). It is NOT the
  re-derivation this file said it would be, and the reason is recorded at
  batch 2 above: that sample cannot be replayed.** The only members of
  batch 2 still identifiable are its six defects — which are exactly the
  six `ab3ed93` repaired. **IDENTIFIABILITY AND VALIDITY ARE
  ANTI-CORRELATED HERE**, because what made a record identifiable was the
  defect that got it named, and naming came with fixing. So a
  same-records-new-unit comparison is not available at any n.
  **THE REPLACEMENT IS A WITHIN-BATCH CONTROL, AND IT IS BETTER THAN THE
  COMPARISON IT REPLACES.** Records attaching NO comment block are records
  for which the re-specified unit and the old unit are THE SAME OBJECT.
  Drawing from both strata measures the record-only rate and the
  record-plus-comment rate in one batch, on fresh uncontaminated records,
  with one reader — a control group instead of a historical claim about a
  population that has since been repaired. The stratum is a property of the
  UNIT, not of the content, which is what makes it usable as a control.
  **THE FRAME, THE DRAW AND THE EXCLUSIONS ARE ALL IN THE TRACKED SET THIS
  TIME**, which is the whole point of the commit that precedes this one.
  Frame: every `gene:`-bearing record at `a3088be`, minus the records
  already read (declared in `ccf_load.py`'s `ALREADY_READ`, keyed by
  `(path, span)` with a reason each). Frame and stratum sizes are not
  restated here — the commands print them, and these two are also the
  replay:

      python3 .claude/ccf_load.py a3088be --draw 6 a3088be --stratum comments
      python3 .claude/ccf_load.py a3088be --draw 6 a3088be --stratum none

  Seed `int('a3088be',16)` — the HEAD at which the frame was built and at
  which this paragraph was written, which is batch 2's intent with the two
  missing halves supplied. **THE DRAW HAS NOT BEEN RUN AT THIS SEED.**
  Throwaway seeds `0` and `1` were used to exercise the code; those samples
  are not batch 4's, and saying which seeds were burnt is part of what
  makes the registered one meaningful.
  **HOW A RECIPE GETS PROVED RUNNABLE WITHOUT BEING RUN**, since a
  registration nobody validated is its own kind of worthless: both commands
  above were executed verbatim at `--draw 0`. That parses the seed, resolves
  both strata, applies the exclusions and prints the procedure while drawing
  NOBODY — and it cannot leak the sample, because each invocation seeds a
  fresh `random.Random(key)`, so drawing zero tells you nothing about which
  six drawing six would return.
  **PRE-REGISTERED, IN DIRECTION AND NOT IN MAGNITUDE.** (1) The total
  defect rate in the `comments` stratum is at least that of the `none`
  stratum. (2) Among defective units in the `comments` stratum, at least
  half carry the defect in the COMMENT rather than on the record line —
  batch 3's **"THE DRIFT MOVED, IT DID NOT VANISH, AND THE UNIT WAS
  WRONG"** turned into a stake, quoted whole because two of those three
  clauses is a different and weaker finding.
  (3) PRE-REGISTERED NEGATIVE: the `none` stratum **cannot** show a comment
  defect, so if it comes out HIGHER, the unit re-specification bought
  nothing and the record-plus-comment framing gets re-examined rather than
  defended.
  **AND THE POWER IS PRE-REGISTERED AS INADEQUATE, WHICH IS BATCH 3's ERROR
  DECLARED IN ADVANCE INSTEAD OF DISCOVERED AFTER.** Six per stratum can
  separate only a LARGE difference from noise; a null result will be
  reported as UNINFORMATIVE, not as evidence of no difference. Batch 3
  learned this only after reading: at batch 2's rate, drawing four clean
  records had probability ≈ 29%, so, in its own words, **"0 of 4 does not
  exclude 27%"** — and even its pre-registered frame, the user ruling
  "BATCH 3 IS DIRECTIONAL, NOT A RATE", was then judged **"still too strong
  a frame for four records"**. So the output at this n is what batch 3's
  real output turned out to be: MATCHED EXAMPLES, which need no rate. A
  rate will not be claimed to settle anything.
  **THE ONE CONFOUND THAT CANNOT BE REMOVED, WITH ITS SIZE.** Batch 2 named
  6 of its 15 and batch 3 named 3 of its 4, so **ten already-read records
  remain in the frame unnamed** and can be drawn again. That is the direct
  cost of the unreplayable draw, and it is bounded rather than unknown. It
  is also NOT a straight re-read: what cleared those records was the OLD
  unit — their record lines — and their comments were never examined, which
  is precisely where batch 3 found the drift had moved. A re-draw therefore
  re-reads a cleared clause with UNREAD provenance attached.
  **THE READ-LIST GUARD COULD NOT BE MADE TO FIRE ON REAL HISTORY, AND THAT
  IS THE MORE INTERESTING RESULT.** Condition (7) says a zero must be shown
  capable of being non-zero, so every key was resolved at `b0f7330`,
  `2f35ac8`, `dc12997`, `37aa47a` and `a131649` — every tree tried,
  including trees from before the reads happened — and all of them resolve
  to exactly one member at every one. **The repairs edited `note` prose and
  provenance comments and never the `gene:`/`ccf:` fields the keys are
  built from**, so the identity survived edits that moved every line number
  around it. That is span-naming's own argument, arriving as a failed
  attempt to break it; the guard is demonstrated on constructed cases
  instead — a key matching NOTHING, a key matching TWICE, a key matching
  ONCE — and the file says why, because an unattacked zero is precisely what
  condition (7) exists to catch.
- **ccf BATCH 4 — READ AND RULED, AND THE RE-SPECIFICATION IT EXISTED TO
  TEST CAME BACK NEGATIVE (2026-09-08).** Twelve units read at the
  registered seed, six per stratum; the two `--stratum` commands above are
  the replay and they reproduce the sample exactly. **2 of 6 defective in
  EACH stratum, and all four defects sit ON THE RECORD LINE — zero in a
  provenance comment.** `comments` stratum: `brain.js:202`'s EGFR ccf
  qualifier and `ovary.js:269`'s "dominated by", both on the record line,
  both comment halves clean. `none` stratum: `brain.js:215`'s false
  universal and `prostate.js:231`'s mis-addressed pointer, both repaired at
  `d17a15f`. The other two needed source re-reading rather than a corpus grep,
  and were REPAIRED on 2026-09-08 against the fetched full texts. Brennan 2013
  (NCBI efetch, PMC3910500 — Europe PMC's fullTextXML again returned zero bytes
  for this id) reads "at least one RTK was found altered in 67.3% of GBM
  overall: EGFR (57.4%), PDGFRA (13.1%)": an ALTERATION figure, focal
  amplification and/or mutation, so the second EGFR record — and the second
  PDGFRA record, the same shape — now carries the qualifier its sibling already
  had under a label that says "amplification". Chao 2024 (PMC11566382) reads
  "The median non-silent mutations count was 46" and, separately, "a median
  of 143 SBSs ... per tumor" with SBS1/SBS5 "present in 94 (92.2%) and 86
  (84.3%) of tumors ... with a median of 25 ... and 89 ... mutations attributed
  to each": the note now states the two bases apart, says "non-silent" where
  it said "protein-altering", and drops "dominated".
  **`ovary.js:269` IS THE SHARPEST OF THE FOUR, AND IT CUTS AGAINST THE
  UNIT RATHER THAN FOR IT.** The source attributes a median of 25 and 89
  mutations to SBS1/SBS5 — 114, on the all-somatic base. The note welds
  "dominated by" onto the 46 PROTEIN-ALTERING figure, a smaller and
  different denominator, so the attributed counts cannot even be a subset
  of what they modify. The COMMENT half states the 46 correctly and makes
  no dominance claim: on the one unit where the two halves disagreed, the
  comment was the half that was RIGHT.
  **THE THREE PREDICTIONS, SCORED.** (1) came out a TIE and is reported
  UNINFORMATIVE — the pre-registered power statement being honoured rather
  than a hedge, since six per stratum separates only a large difference and
  a tie is not evidence of no difference. (2) is **FALSIFIED, 0 of 2**: on
  the stratum that exists to test it, neither defect was in the comment.
  (3), the pre-registered negative, was NOT formally triggered — `none`
  came out EQUAL, not higher — but its substance landed on (2)'s
  falsification, and the ruling did what (3) said to do: re-examine the
  framing instead of defending it.
  **THE RULING, AND IT IS THE USER OVERTURNING THEIR OWN
  RE-SPECIFICATION:** "I ruled the record-plus-comment re-specification.
  Batch 4 says it doesn't generalize: zero defects in the comment half, and
  prediction (2) falsified 0 of 2 — on the stratum that exists to test it,
  at real reading cost, with the strata not even effort-matched. The
  bladder case that motivated it was real, but it was n=1, and one instance
  is what a pre-registration exists to keep from becoming a rule."
  **BATCH 5 REVERTS TO RECORD-ONLY AS THE DEFAULT UNIT.** The superseded
  entry is corrected at its own sentence above rather than only here, and
  the declaration in `ccf_load.py` is corrected at its own line. None of
  the attachment machinery is removed — three live things still need it,
  and that file names the single line that would have to change if
  record-only ever became a REMOVAL instead of a default.
  **WHAT SURVIVES IS NARROWER, AND IT IS A GREP RATHER THAN A READ UNIT:** a
  comment block that CONTRADICTS its own record. In the ruling's words,
  "Reading the comment half found nothing; comparing the two halves
  mechanically would have found bladder." That is the internal-inconsistency
  shape, at five instances as of this entry — the fifth being
  `fraction_check.py` carrying the correct `283/357` in its own header,
  where the instrument holding the right number still cannot catch the
  wrong one.
  **ONE SUB-SHAPE OF THAT GREP MEASURED (2026-09-08, queue), NOT BUILT.** A
  record that claims INDEPENDENCE over an axis — stage, grade, subtype, age,
  sex; "evenly distributed across", "independent of", "across every grade",
  "stage-independent" — while its attached provenance comment (ccf_load's
  attached(): own block plus the array-opener block) names a RESTRICTED LEVEL
  of that axis (NMIBC, stage II, high-grade, basal-like, pediatric) is
  decidable by lexicon, and it is the exact shape bladder had: "evenly
  distributed across stage and grade" over a comment saying "primary NMIBC
  cohort". A scratch probe FIRES on bladder.js at `2f35ac8^`, the pre-repair
  tree, and against the tree at this commit finds 3 independence claims among
  143 records and 1 candidate — the same bladder record, now firing on the
  repaired comment's NEGATED mention of the old descriptor and on the
  design-gate discussion in its shared opener block; the other two (pancreas
  grade, skin subtype) read clean. Real, tiny, and carrying the polarity
  guard's known false-positive mode, so it wants the flag-then-read contract
  if it is ever built. **DECLINED AT THIS SIZE, WITH A TRIGGER (user ruling,
  2026-09-08).** Today the arm would be 0 signal and 1 noise, and clearing the
  noise means either declaring bladder's comment permanently or making the arm
  depend on `citation_polarity`'s classification — real machinery for three
  items. The growth argument is the only good one and it is genuine: at ~120
  cancers the population grows with the corpus. So the decline is a CONDITION
  rather than an open deferral: **revisit when the axis-independence claim
  count crosses roughly fifteen**, decidable by re-running the lexicon above,
  which is already the measurement. The probe is scratch and deliberately not
  in the tracked set; the lexicon is the shape to rebuild it from.
  **THE DESIGN CONSTRAINT WHOEVER REVISITS WILL HIT FIRST: REMEDIATION PROSE
  TRIPS LEXICON MATCHERS BY NAMING WHAT IT REPAIRED.** The single flag is a
  false positive caused by the repair text — bladder's fixed comment names the
  descriptor it removed, and a lexicon matcher cannot see the negation. Fourth
  instance of that family: Colombino's negated mention inside an authorship
  correction, Boutros backfilled onto a negated mention, the pointer addresses
  that are the evidence of their own staleness, and now bladder. And here the
  negated mention IS the evidence of the repair, so the corollary applies: it
  stays, spelled rather than removed — if the arm is ever built, the bladder
  comment is rewritten into a form the matcher does not count, never deleted.
  **THE ADJUDICATION HELD A STAKE AND WAS RESOLVED AGAINST IT, recorded
  because nothing else would show it.** `testis.js:230`'s two candidates
  both dissolved at the source, leaving one borderline: the ccf says
  "cohort of testicular germ cell TUMORS" where the source says PATIENTS.
  The reader held a stake in the `comments` stratum showing defects, so
  that borderline was scored CLEAN WITH A NOTED IMPRECISION and not
  counted. Scored the other way it would have been 3 of 6 against 2 of 6
  and would have satisfied (1) — so the tie is the conservative reading,
  not a convenient one.
  **TWO DESIGN FINDINGS, BOTH CONFOUNDS THE PRE-REGISTRATION FAILED TO
  NAME.** First, UNIT SIZE MEASURES COMMENT ATTACHMENT, NOT READING LOAD:
  `skin.js:400` is unit=1 — nominally the cheap stratum — and carries about
  a dozen citation clusters, so "the `none` stratum is cheap" was false and
  THE STRATA ARE NOT EFFORT-MATCHED. That record is scored **no defect
  found at partial depth**, four of those clusters verified, rather than
  clean, because a clean at partial depth is a weaker and different claim
  than a clean. Second, STRATUM SEPARATION CANNOT BE ENFORCED AT
  READ-WINDOW LEVEL: `brain.js:215` was seen while reading `brain.js` lines
  124-218 for a `comments`-stratum unit, so one of the two `none`-stratum
  findings was surfaced by a `comments`-stratum read. Disclosed rather than
  laundered — it does not touch the record-line/comment split, which is
  what (2) turned on.
  **AND THE FINDING THE BATCH WAS NOT LOOKING FOR: A SOURCE-FREE DEFECT
  CLASS, FALSE CLAIMS ABOUT THE ATLAS'S OWN CONTENTS.** Two of the four
  needed no fetch, no paywall and no source at all — they are decidable by
  grep. `ovary.js:266` does not merely fail to support `brain.js:215`; it
  CONTRADICTS it, with a citation of its own.
  **THE MISS HAS A SHAPE, AND THIS IS THE USER'S OWN TALLY OF IT:** "That's
  a new source-free class, which makes three times I've declared that well
  dry and been wrong. The pattern in the misses is consistent: each time, I
  enumerated classes about the corpus's relationship to EXTERNAL sources and
  missed one about its relationship to ITSELF. Share sums, duplicate
  figures, and fraction agreement were all internal too — I keep finding
  that category and then forgetting it's a category."
  **THE CLASS IS GUARDED RATHER THAN HAND-SWEPT, AND THE INSTRUMENT COUNT
  HOLDS AT FIFTEEN.** `absence_claim_check` absorbs it instead of a
  sixteenth instrument being declared, on the ruling's own argument: "A
  universal claim is the POSITIVE MIRROR of an absence claim — 'in every
  other cancer modeled in this atlas' and 'no functional study has
  adjudicated' are the same object: an unscoped quantification over a
  population, checkable against that population." The guard was built
  BEFORE the repairs and its output was the worklist; the hand count and
  the guard's count were different numbers, which is recorded in
  `d17a15f`'s message rather than restated here.
  **THE THREE UNIVERSALS THE GUARD FLAGS FOR A READ, READ (2026-09-08).** The
  guard prints them as needs-a-read on every run by design and will go on doing
  so; this is the read, and it names each site by file and quoted span rather
  than by line, because the first draft wrote four `file:line` pointers and the
  settle run raised `pointer_check`'s ratchet by exactly four — the drift-prone
  form the pointer ruling retired, caught by the ratchet doing its job. `brain.js`'s White matter hotspot ("every other organ in this atlas has its
  own 'arises here' structure") is TRUE by census: each of the other thirteen
  organ files names where its wired cancer arises, in a hotspot text or, for
  bladder and thyroid, in the organ description. `skin.js`'s organ description ("the only one
  this atlas shows as a cut block") is TRUE: twelve real meshes and testis's
  procedural ellipsoid are whole shapes. `prostate.js`'s trunk ccf ("the way every other
  trunk entry in this atlas represents" a once-for-the-whole-tumor founding
  event) was FALSE — the status-shaped trunk entries (GBM's IDH-wildtype status,
  OCCC's TP53 status, bladder's pathway-divergence status, follicular thyroid's
  RAS-versus-PAX8 status) represent no founding event at all — and is reworded
  to compare against a shared trunk mutation, with no quantifier over the
  corpus. `testis.js`'s bare-plural histology comparison ("unlike the marked
  pleomorphism this atlas's other tumors often show") was NOT open: `6e3c310` had
  already dropped it from the served field, and the phrase survives only in the
  comment recording that removal — which is why the guard does not list it. The
  first draft of this sentence said it "stays on the open list", a false claim
  about the repo's own contents written into the record of adjudicating three
  others, and carried from a summary instead of read from the tree; corrected
  in place (2026-09-08).
- **LUAD's `RB1 loss` REMOVED FROM THE PRIVATE POOL — QUESTION (2) CLOSED ON
  RULING (2026-09-07), AND THE GROUNDS WERE IN-CORPUS ALL ALONG.** The
  exclusion is SOFT, MECHANISTIC-FIT class, and explicitly NOT an
  exclusivity claim — the form `skin.js`'s own RB1 exclusion set, copied
  including the parts that make it honest. **WHAT DISSOLVED THE
  IMPORT PROBLEM:** the atlas already asserted the redundancy IN LUAD'S OWN
  VOICE. Both notes said the alteration "Removes a cell-cycle checkpoint"
  and called it "a common co-occurring event alongside KRAS rather than an
  alternative driver, adding proliferative pressure", in near-identical
  words, in the same pool — so no melanoma or GBM finding had to travel, and
  the ESR1/MDM4 rule was never engaged. The circuit under it is hand-cited
  under the classification-fact carve-out above, whose refined content rule
  already covers exactly this ("HAND-CITE stable classification facts and
  mechanism prose"): `Serrano et al., Nature, 1993`, PMID 8259215.
  THAT CARVE-OUT'S HEADING IS DELIBERATELY NOT REPRODUCED IN THIS SENTENCE,
  and the reason is worth more than the paraphrase: the heading is also
  `_classification_fact_exception`'s sync marker, and `record_sync_check`
  requires a declared marker to occur EXACTLY ONCE in its target. This
  bullet first wrote it a second time and the check fired NOT A MARKER on
  its own author, which is a marker's uniqueness being load-bearing rather
  than decorative — a citation pointing at "the second one" resolves to
  nothing. **A PROSE PHRASE MAKES A FRAGILE MARKER: it stays unique only
  while nobody writes the obvious sentence about it**, and the near-miss
  here is one more argument for the held item that gives these pairs a
  dedicated token instead. Until then, cite this rule by description.
  **CITED FOR THE CIRCUIT, NOT FOR THE INFERENCE, AND THE GAP IS WHY THE
  EXCLUSION IS SOFT** — that paper reports CDK4 and D-type cyclins, NOT
  CDK4/6, and never says losing either node disables the same checkpoint.
  Its own hedge is preserved in the quotation ("p16 **seems to** act in a
  regulatory feedback circuit…") because the hedge does load-bearing work.
  Read at the abstract via the Europe PMC REST API; the paper is not open
  access, so **the abstract is the whole of what was read, and the claim was
  cut to fit it** rather than the citation stretched to cover more.
  **SILENCE RECORDED AS SILENCE:** TCGA 2014 does not state the pair
  exclusive in LUAD, and Supplementary Fig. 10 — which holds the 64%
  cell-cycle module's membership list, the only LUAD-native grounds
  available — is UNREACHABLE BY FETCH (three PMC URL forms plus Europe PMC's
  `supplementaryFiles`; HEAD requests only, nothing downloaded).
  **UNREACHABLE IS NOT REFUTED AND IS NOT SUPPORT.**
  **AND THE RATCHET DID NOT MOVE, WHICH IS THE FINDING WORTH KEEPING.** Both
  `js/panel.js` and the removal itself were written predicting a lower, and
  the measurement overturned it: the removed record left as the Serrano
  record entered, so `records` held at 488 while the SET changed one out and
  one in, and **no lower was needed at all.** The removal was still READ
  INDIVIDUALLY first and found VALID, so it is recorded as a LOSS and not a
  fix — reading is what distinguishes them, and a flat total cannot.
  **THIS IS `record_keys`' FIRST LIVE INSTANCE OF THE CASE IT WAS BUILT
  FOR**, verified by replaying every commit that has ever touched
  `record_count.json` rather than assumed because it sounded like a first.
  The count alone would have reported nothing.
- **POOL-MEMBER EXCLUSIVITY — A DEFECT CLASS THAT GENERATES RATHER THAN
  DESCRIBES, SWEPT AND BOUNDED (2026-09-06). THE FIX IS HELD FOR RULING;
  THE BOUND IS NOT.** Every other defect in this arc is a DESCRIPTION that
  overstates. This one is a GENERATOR that can produce an object its own
  cited source says does not exist: a user can rotate a liver tumour whose
  cell carries a genotype Guichard reports as exclusive. It outranks the
  batch that found it.
  **MECHANISM (`js/panel.js:48`):** p=0.42 a cell carries private
  mutations; of those, p=0.3 draws TWO DISTINCT members of `privatePool`.
  So **every unordered pool pair is producible, in ~12.6% of cells.**
  **ROOT CAUSE — A HAND-CHOSEN PARTNER LIST.** Exclusivity was checked
  pool-member against TRUNK and BRANCH genes and never pool-member against
  POOL-MEMBER. `liver.js` states the check explicitly ("None of the three
  compete with CTNNB1, TP53, or TERT — safe to include in a pool shared
  across every site"), and the inference does not follow: the premise is
  about the trunk/branch axis, the conclusion is about an axis never
  tested. **Fixing the pair closes the instance and leaves the mechanism**
  — the pattern the testis four was held for.
  **THE SWEEP (cheap, source-free, on user ruling).** Parsed all 16
  cancers' TRUNK/REGIONS/PRIVATE_POOL arrays into a 71-symbol modeled-gene
  universe, then matched every "exclusiv"/`&perp;`/⊥ span in the organ
  files, `CLAUDE.md` and `cancer-atlas.html` against producible
  co-occurrence. 87 spans name ≥1 modeled gene; 40 name ≥2. Most
  cross-organ matches are NOISE and were discarded by hand — a melanoma
  exclusivity says nothing about ccRCC's pool. **TWO REAL INSTANCES:**
    - **HCC ARID1A ⊥ ARID2** (known). Guichard: ARID2 mutations "less
      frequent but exclusive from ARID1A mutations". Both in
      `PRIVATE_POOL_HCC`. The flawed justification had also PROPAGATED —
      `prostate.js:183` cites HCC's pool decision as precedent, so the
      unchecked assumption was doing work in a second organ's reasoning.
    - **ccRCC MTOR ⊥ PTEN** (new, and worse). `kidneys.js:157` prints, in
      a user-facing ccf, that the PI3K/Akt/mTOR pattern has "alterations
      across pathway components mutually exclusive with each other";
      `kidneys.js:158` declares PTEN "part of the same" pattern. Both are
      in `PRIVATE_POOL_CCRCC`. **A viewer can read the exclusivity in one
      panel and see both alterations in one cell** — where ARID1A/ARID2's
      exclusivity lives only in a source, this one is printed in the
      product, in adjacent lines of the same array.
      **FIX DIRECTION UNDETERMINED, AND THE READ IS BLOCKED.** If TCGA
      states component-level exclusivity, the pool must not co-draw the
      pair; if it does not, the ccf overstates and the pool is fine. The
      TCGA ccRCC 2013 abstract says only "The PI(3)K/AKT pathway was
      recurrently mutated" — no exclusivity, no 28% — and the full text is
      unreachable (PMC www CAPTCHA-gated, EPMC fullTextXML 404 despite
      OA:Y). **Either way it is a defect; which one it is needs that read.**
  **THE SWEEP'S OWN BLIND SPOT, MEASURED, NOT ASSUMED — AND IT IS WHY THE
  ccRCC HIT WAS LUCK.** A gene-PAIR matcher cannot see exclusivity
  asserted over a PATHWAY or MODULE, because those spans name no partner
  gene: 13 such spans exist ("across pathway components", "at module
  level", "one or the other", "mutually exclusive of"). `kidneys.js:157`
  is one of them, and the pair-sweep surfaced it ONLY because `VHL`
  happened to sit in the same span, which misfiled it as pool×trunk.
  **So the sweep as run bounds the pair-named class and does NOT bound
  the pathway-asserted class** — the second instance was found by accident
  and a third would be too. Any real detector for this class must resolve
  a named pathway to its member genes, which is not a source-free
  operation. **Unadjudicated, listed not filed:** TNBC's pool holds both
  PIK3CA and PTEN, and a PI3K/PTEN exclusivity was used to EXCLUDE PIK3CA
  from GBM's pool (`CLAUDE.md`, Brennan 2013). That finding is
  GBM-specific and does not transfer, so this is a question, not a defect.
  **THE REMEDY EXPOSED A THIRD BLIND SPOT, IN THE EXTRACTOR — AND "NAMED"
  IS NOT THE SAME AS "REACHABLE".** Naming the ARID2 source wrote
  `Li Z et al., … (PMID 42016321, PMC13092802, OA)` into the liver comment
  in PubMed's own author style. `extract_citations.py`'s `P_ETAL` matches a
  BARE SURNAME before "et al.", so the initial broke the head, the citation
  yielded no record, and both identifiers were dropped with it:
  `citation_crosscheck`'s identifier-carrying population did not move, so
  the two ids the name-it-or-remove-it ruling existed to produce reached no
  instrument. **The failure is silent in both directions** — nothing fires,
  and the ratchet cannot see it either, because a citation that never
  becomes a record is an ABSENCE, not a decrease, and the ratchet only
  guards against decrease. Dropping the initial made the same line yield a
  record carrying both ids, which put the PMID inside the crosscheck, where
  PubMed's metadata then CORROBORATED the hand read (author, journal and
  year all clean). Full account in that tool's header, on the same ruling
  that put `fraction_check`'s two blind spots in its own — a blind spot
  known only to a log is not known to the next person who trusts a clean
  run. Widening the surname pattern to swallow initials is NOT done: it is
  a change in reach, so it must be declared and measured (aafbe04), and the
  measurement is not free — "Li Z" and "Li Zhang" are the same shape to a
  regex that stops caring about token length. **The transferable rule: a
  citation is produced only when the corpus's own extractor can see it.
  Check the record appeared; do not assume the text is the record.**
- **Sequencing:** re-scope (done) → A → B → C∥D. Detector survival:
  rendered-output checks (fraction/share-sum/duplicate) persist and
  matter MORE under pulled content; citation checks shrink to the
  hand-written residue.
  (8) Adopted at the attribution ruling (2026-09-04), converting a
  three-time discovery into the default: A NEW DETECTOR'S FIRST RUN IS
  INSTRUMENT CALIBRATION, NOT FINDINGS. Three first runs, three piles
  dominated by upstream noise rather than data: the no-match pile (10
  of 13 were the parser's own artefacts, zero real defects), the
  coverage guard (counting the staging it was built to exclude), and
  the crosscheck (Ziol/Cyrta/Fichtner/Shen/Segura were all extractor
  bugs, and the extension's first run echoed an already-fixed line
  through stale input). The sequence is now standing: run, triage the
  flags, fix the pipeline, re-run, and read the SECOND run as
  evidence. Budgeting the first output as calibration costs nothing
  and stops it from being reported as a result.**
- **Environment map + ground staging (2026-09-03), the pass the pipeline
  correction was gating.** scene.environment is now a 256×128 linear-float
  equirect gradient derived from the design tokens through cssVar() — floor
  `--bg`, horizon `--panel`, sky `--text`; accents deliberately excluded from
  the illumination spectrum — at scene.environmentIntensity 0.25, with a
  `--line` plinth + baked radial contact shadow added per viewer. Key
  findings, all measured (packet: /tmp/atlas-verify/p3/): **(a) PMREM
  resolution cliff** — PMREMGenerator's cube face is equirectWidth/4 and its
  blur chain floor is LOD_MIN=4 (16-texel face); below W=64 the roughness
  mips are never written and diffuse IBL evaluates to EXACTLY ZERO, silently
  (probe: 0.0 at W=32/48, 120.75 at W=64, converged ±0.2% above). This also
  retroactively corrects the reference-app premise: thebuggeddev/anatomy
  ships a 16-wide map (cube face 4, below the floor), so its env map almost
  certainly lights nothing and "they have IBL, we don't" was wrong on both
  halves. **(b) Intensity 0.25** — minimax of the pale/dark albedo split
  (curves cross at 0.25: pale 0.043 / dark 0.042), and it dominates 0.20 on
  hue (4.40 vs 4.47) and value (−0.052 vs −0.054) for 0.001 of |dSat|; a
  single GLOBAL level, per-material-class envMapIntensity refused because
  the disagreement is between albedos inside one class and a per-lightness
  env would assert pale tissues sit in a dimmer room. Light intensities
  UNCHANGED (dVal negative at every level; blown 0 everywhere). **(c)
  Operator re-measured at the shipped config** — AgX |dSat| 0.043 vs ACES
  0.079 / control 0.107 / Neutral 0.207, blown 0 under all four; AgX stands,
  Neutral still worst by 5×, control best on hue (3.67° vs 4.40°) but 2.5×
  worse on saturation with no headroom (P2: control clipped 247px at ×1.35
  where every operator held zero). Mechanism flip recorded in condition (1)
  above. **(d) Staging per viewer** — body YES (figure stands on the disc),
  organ YES for 13/14 (all discs measured fully in-frame, addGround
  provably never moves the camera), tumour site map NO (blob heights encode
  spread pattern), and **testis EXCLUDED on a geometric impossibility**: its
  box is height-dominated (2.20 over a 1.38×1.38 near-square footprint), so
  framing puts the organ's lowest point at ~pixel 300/318 while containing
  the footprint needs disc r=1.07; at the default pitch (near-rim drop
  ≈0.65·r, consistent across all 14) any disc that fits needs r≤0.21, 5×
  too small — the full disc reads as a dark silhouette cut on three sides,
  shadow-only sits entirely out of frame. REVISIT TRIGGER at the call site:
  if the Prompt-5 audit changes the testis framing, re-test the plinth.
  Staging is named (`groundStaging` → `groundPlinth`/`groundContactShadow`)
  and exposed as viewer.ground(), which returns null where staging is
  deliberately absent. Regression after the pass: 163/2, exactly the
  documented baseline (GBM + acinar label overlaps), zero new failures.
  The framing-latch question (parked as Prompt 5's opening blocker) was
  RESOLVED pre-push (2026-09-03, /tmp/atlas-verify/p3/sidebar_latch.js +
  body_latch.js): applyFraming()'s fit is purely ANGULAR (radius·padding /
  sin(halfAngle), no pixel term), so the hasFramed latch admits stale
  framing only when the container's ASPECT changes after framing. Organ
  viewer: #organViewerWrap pins aspect-ratio:1/1 in CSS, so the latch is
  STRUCTURALLY UNREACHABLE there at any window size (exact to container
  SIZE; to aspect, exact up to integer clientWidth/clientHeight rounding —
  a CSS square can land 318×317, <0.4% jitter, absorbed by the 1.3
  padding) — measured live:
  container 318×318 and margins byte-identical across both toggle
  directions on the three widest plinth ratios (pancreas/prostate/breast),
  camera untouched. Body viewer: latch REACHABLE (inset:0; aspect
  1.5306→1.2776 across a toggle with camera provably unmoved —
  resize-without-reframe confirmed live) but HARMLESS at desktop layouts:
  the fit's limiting angle is vertical while aspect stays >1, and the
  sidebar's 248px cannot push it below 1 (margins 567→443, nowhere near
  the edge); site viewer is the same inset:0 class. RESIDUAL for Prompt 5:
  (a) the live edge on body/site screens is NOT "portrait reshape" as
  such — it is anything that pushes the container aspect through 1.0
  after framing, flipping the limiting axis, and the sidebar toggle
  contributes 248px toward the flip (framed wide + toggled narrower
  reaches it at a WIDER window than reshape alone). The concrete P5 test
  case: narrowest window where the body viewer is still usable, THEN
  toggle the sidebar — findable, where "reshape to portrait" invites a
  tablet test and a false all-clear. The fix is design work, not a patch
  (re-frame-on-resize would snap the user's zoom; a correct fix re-fits
  only when content would clip, or only before the user has zoomed); (b) RESOLVED (2026-09-03, pre-4A at the user's
  sequencing ruling — a capture rig that clips content off-frame would
  false-pass 4A's raw-vs-compressed gate on banding in the clipped-off
  region): the headless off-centre captures were never the renderer —
  they were the PHOTOGRAPH. Puppeteer's element/clip screenshot path
  (puppeteer-core 25.9.0 + Chrome 152, dpr-INdependent) applies a
  transient device-metrics override at a different width (~1405 element /
  ~1313 clip), the app relayouts to it (margin:auto centring shifts
  #organViewerWrap left by exactly (1500−W)/2 — fingerprint-matched to
  0.09px against a width sweep), the capture rasterises that transient
  layout at pre-capture clip coordinates, and the layout recovers <400ms
  later. Plain full-viewport page.screenshot() never does this, so
  `.claude/regress.js` was never affected. FIX: pass
  `captureBeyondViewport: false` on every element/clip screenshot —
  measured: layout does not move and the capture is correct. GATE run
  post-fix (capture_gate/, 14 organs, DOM dots hidden so PNG and buffer
  compare like-for-like): PNG content box agrees with the drawing-buffer
  content box to ≤1 device px on every edge, 14/14, full organ in frame
  with positive margins everywhere (testis top margin 8px — its known
  edge-hugging framing, P5 item). One measurement gotcha recorded with
  it: the wrap's 18px border-radius arc defeats a straight-inset border
  exclusion (its --line pixels drag a content scan to full-frame); mask
  the corner squares. Review renders regenerated on the fixed rig.
- **4A asset compression — 12 organ GLBs meshopt-compressed, gltfpack 1.2
  `-kn -cc` (2026-09-03).** assets/ organ payload 43.72MB → 19.52MB
  (2.24×): mesh-only organs compress 4.19–6.09×; the textured four are
  image-dominated so much lower (lungs 1.13×, thyroid 1.06×, stomach
  1.99×, colon 2.56×). The 4.5× preview number was plain `-cc` on bladder
  alone and carried node-merging — superseded by this measured table (user
  amendment: never carry a preview measured with flags you won't ship).
  **`-kn` is REQUIRED, not optional**: plain `-cc` merges named nodes
  (bladder's six VH_M_* ontology-named sub-meshes → one "Mesh_0") —
  runtime-safe (no getObjectByName in js/organs/; hotspot anchors are
  baked literal coords derived offline from the named centroids) but it
  destroys the named segmentation the provenance packets verify against.
  With `-kn` the full name-set survives on all 12 (verified by JSON-chunk
  comparison), at +0.01MB total. **`-vn 8` defaults suffice — zone gate
  12/12**: raw-vs-compressed drawing-buffer diff, 8 poses/organ at the
  closest permitted zoom (controls.minDistance), 16×16 zone map, gate =
  worst-zone mean < 3.0 and global mean < 1.0 against the body pass's
  banding reference (10.77) — worst was liver 2.64, visually confirmed as
  a whisper-level smooth shading shift (max Δ6/255, no banding structure
  at 8× amplification); lungs' 315 px>8 is isolated silhouette-edge
  rasterisation jitter from re-indexing, not a coherent zone. `-vn 12`
  (+0.75MB) is measured waste here — the marching-cubes prediction held.
  THE THRESHOLD IS ONE-SIDED: 3.0 is calibrated from a single known-bad
  point (10.77), which establishes where bad lives, not where the
  boundary sits — passing under 3.0 is necessary, not sufficient, and any
  future recompression landing in the 2–3 band gets the amplified visual
  check (as liver 2.64 did here), never a green tick from the number
  alone.
  Textured four: image bufferView bytes sha1-IDENTICAL raw vs compressed
  (`-cc` only, NO `-tc`/KTX2 — no KTX2Loader exists in this app, and the
  fresh NoColorSpace→sRGB migration was verified by the zone gate rather
  than assumed safe; UV quantization -vt 12 is covered by the same gate).
  MeshoptDecoder registered in all 12 organ loaders (body.js pattern;
  harmless against raw, load-bearing against compressed). **Blender
  premise STALE, workaround dropped**: Blender 5.2.0 LTS imports
  EXT_meshopt_compression natively (bladder round-trip: tris exact
  10,073=10,073, verts −2 standard weld, bbox Δ~1e-4) and
  `.claude/render_thumb.py` rendered a compressed GLB correctly with zero
  modification. Load time: fetch −24.2MB and total parseAsync 252ms →
  238ms (meshopt decode is cheaper than parsing the larger raw buffers) —
  no tradeoff. Regression on compressed assets: 163/2 = baseline exactly.
  BUDGET SIGNPOST: the corpus is now TEXTURE-DOMINATED — lungs 1.13× and
  thyroid 1.06× mean their remaining bytes are almost all image data,
  which -cc structurally cannot touch. If budget pressure ever returns,
  the lever is texture dimensions or encoding, NOT compression flags;
  gltfpack has nothing left to give here.
  **Vertex-count provenance ruling: recorded counts are AS-SOURCED** (the
  raw master, addressable forever via `git show a131649:assets/X.glb`);
  gltfpack welds duplicate vertices so shipped accessor totals differ on
  six organs: bladder 5,515→5,513, brain 201,588→200,693, kidneys
  38,034→38,028, lungs 23,462→23,224, pancreas 26,351→25,757, thyroid
  3,220→3,210 (breast, colon, liver, ovary, prostate, stomach unchanged).
  A verification against a shipped file that hits one of these numbers is
  seeing the weld, not a discrepancy. AND THE WELD DELTAS ARE NOT A
  TOPOLOGY-HEALTH SIGNAL (P5 carry-forward): gltfpack welds only vertices
  identical across ALL attributes, so a seam split with divergent normals
  — precisely the configuration that produces faceting — survives
  compression untouched. Brain's −895 says the source carried redundancy;
  it says nothing about whether brain shades smoothly. If the P5 audit
  finds faceting anywhere, the weld count will not have predicted it, and
  the fix is a tolerance-based merge plus normal recompute, not anything
  gltfpack does. Evidence: /tmp/atlas-verify/p4/
  (compress_matrix, zone captures + diffs, parse timing, worst-zone
  strips, Blender import test).
- **4B baked ambient occlusion — 7 of the 8 mottle organs, liver excluded
  on a measured negative (2026-09-03).** Composition decided by MECHANISM
  before any bake, per the prompt's gate: AO multiplies into the SAME
  vertex-colour attribute — the GLB ships raw per-vertex AO as COLOR_0,
  applyTissueMottleVertexColors stashes it once as 'aoBaked' (idempotent
  re-application) and writes final = m × (1 − k·(1−ao)). Both factors ≤ 1
  so the mottle's clip-safe-by-construction property survives
  unconditionally; k (aoStrength) lives in JS so per-organ tuning or
  disabling (k=0 = pre-4B exact) never re-bakes an asset. Replacement was
  rejected (mottle is albedo variation, AO is occlusion — different jobs)
  and a second attribute was rejected (needs onBeforeCompile shader
  patching for zero mathematical benefit — grey factors commute). Bake =
  `.claude/bake_ao.py` (Blender 5.2 Cycles CPU, 128 samples, seed 0, ray
  cap 0.5×bbox-diag, POINT-domain colour attribute, all sub-meshes kept
  in-scene so they occlude each other), run against the a131649 masters —
  masters + script = the reproducible transform. **The pre-registered
  negative landed, but not where predicted**: vertex-density BANDING was
  never observed, not even on the sparsest mesh (bladder, 5.5K verts —
  smooth gradients in AO-only isolation). The real failure mode is
  INTERPENETRATING SEGMENTATION SHELLS: buried/twin surfaces bake black,
  so whole-mesh AO means are misleading (brain 0.050, kidneys 0.070) while
  the VISIBLE surface reads correctly — visibility filters to the bright
  mode (brain's sulcal walls hold most vertices; its gyral crowns bake ~1
  and the sulci gain real depth — the single biggest visual win of the
  pass). LIVER is the one organ where the artefact reaches visible skin:
  near-black blotches at millimetre-range twin-surface occlusion, reading
  as HEPATIC LESIONS — false pathology on a medical atlas, instantly
  disqualifying, and no ray cap fixes mm-distance occluders. Excluded (no
  COLOR_0 in its GLB, exclusion comment at the liver.js call site;
  revisit only if the mesh is rebuilt as a clean manifold). Palette
  fidelity survives k=1.0: lit-face |dSat| moves ≤0.012 on every baked
  organ vs the env_025 record (brain IMPROVES 0.063→0.053), dVal shifts
  ≤0.016, blown 0 (p3measure tag ao_k10). Cost: +287KB across the 7
  (assets total ~19.81MB); COLOR_0 survives gltfpack -kn -cc at 8-bit
  quantization (composed attribute mean identical to 3 decimals; node
  name-sets unchanged). Regression 163/2 = baseline exactly. RESOLVED AT
  REVIEW — k=1.0 ships globally, by the ruling's decision rule rather
  than taste: because liver proved the bakes contain a NON-ANATOMICAL
  occlusion component (twin shells) that k scales identically with the
  real component, the test is binary — does any dark region read as a
  LESION (discrete focal object with an edge on otherwise-normal tissue)
  rather than a SHADOW? Applied over the AO-only isolations (the most
  sensitive detector: no albedo to hide in) at front + below-equator
  reveal poses on all seven organs: 7/7 PASS — every AO-added dark
  region is continuous and follows anatomical form. The only discrete
  dark marks found (two small edged pits on the prostate near the base)
  are present at k=0 in identical position/shape — pre-existing MESH
  geometry, not AO; noted for the P5 audit. Per-organ k deviations:
  none needed — held to one number until an organ forces it (per-organ k
  would assert "this bake is more contaminated," a measurable claim, but
  only liver measured that way and liver is excluded outright). TWO P5
  CARRY-FORWARDS: (a) liver is now the only mottle organ without AO and
  will read FLATTER than its neighbours — deliberate, not defective;
  if the audit fails it on flatness the fix is a remeshed asset without
  interpenetrating shells (asset work), never a lower global k; (b) the
  prostate's two dark pits, above. FOR THE RECORD, three passes running:
  the pre-registered negative landed each time but never where predicted
  (Neutral-wins → Neutral worst; bladder banding → liver twin shells;
  -kn ratio cost → texture domination). The predictions are consistently
  wrong about WHERE; pre-registering one is consistently right about
  THAT — keep pre-registering.
- **Prompt-6 glow-restoration evaluation — DO NOT RESTORE, measured
  (2026-09-03; fenced in-page evaluation, ZERO source changes — the
  shipped procedural-only glow branch is already the right code).**
  Conditions: the shipped glow params (0x35c9c1, 0.5π, reach 0.9R, decay
  1) injected onto the four concave-zone organs (kidneys/lungs/breast/
  prostate) at h.pos + n̂·{0, 0.04R, 0.10R}, normals read from each
  marker's nearest surface vertex (identity, not centroid inference),
  vs the shipped no-glow control, at zone-aimed + default poses.
  THE FAILURE CLASS CHANGED UNDERNEATH THE CANDIDATE FIX — fourth pass
  running where the pre-registered negative lands somewhere else: the
  expected residual was soft BLOOM at concave zones (luminance), and
  blown-pixel counts are 0 in EVERY condition (the old detector is
  formally dead under AgX, exactly as the prompt predicted). The actual
  disqualifier is HUE: teal-dominant pixels jump from ~1-2% (the marker
  dots themselves) to 50-75% of the organ under glow — kidneys 4,185 →
  127,875 px, prostate 1,634 → 176,710, breast 4,791 → 106,024 — and the
  renders show it plainly: mint-green floods across the hilum, the
  plinth glowing cyan, cited albedos surviving as islands. Four markers
  cluster in one zone, each light reaches 0.9R, so the organ is lit BY
  the accent — this is the env-map derivation's own exclusion argument
  ("putting an accent in the illumination pushes a hue onto every cited
  albedo") now measured as fact rather than stated as principle. THE
  NORMAL-OFFSET FIX IS BACKWARDS for this failure: it cures the
  distance-zero geometry but INCREASES contamination monotonically
  (off10 worst everywhere — more unoccluded solid angle), and it washes
  out exactly the concave-zone AO depth 4B just shipped. Marker identity
  remains the DOM dot + ring plus the 3D sphere, unchanged; the approved
  material-pass look modelled no marker lights. Restoration would need a
  redesign (tiny reach, non-accent colour) that no longer resembles the
  authored feature — out of scope by the prompt's own fence. The lungs
  zone-pose caveat (7.8K mesh px) was diagnosed before filing rather than
  carried: the fissure markers sit low, so the naive cluster-direction
  pose dropped the camera BELOW THE PLINTH (camera y −0.496 vs plinth y
  −0.192) and the disc occluded the organ — hiding staging via
  viewer.ground() multiplied subject pixels 14.8× (7,841 → 116,309),
  prediction stated before the run. Verdict unaffected (the other three
  organs each independently disqualify), but it is a RIG REQUIREMENT FOR
  THE P5 AUDIT, where every organ must stand on its own evidence: (a)
  close-zoom pose machinery must keep the camera above the plinth plane
  or hide staging by name for the shot — the plinth is staging, not
  subject; (b) every capture carries a minimum-subject-coverage guard
  that FAILS LOUDLY below a floor instead of feeding a verdict — a
  capture that barely photographed its subject must not produce a
  judgement (the condition-(2)/(3) family, applied to framing). Evidence:
  /tmp/atlas-verify/p6/ (32 shots + telemetry.json + lungs_pose_probe).
- **Prompt-5 visual-quality audit — RUN, RULED, CLOSED (2026-09-03; audit
  only, no app changes).** Two-phase per the ruling: phase one judged all
  16 subjects (14 organs + 2 bodies, 48 captures: default/close/floor per
  organ, default/torso/leg per body) from the images BEFORE consulting
  the inherited docket — with the honesty caveat on the record that the
  auditor authored the docket, so literal coldness was unavailable; what
  partly redeems it is five findings that were on no list (pancreas
  sub-mesh seam at close zoom; brain gyri faceting at floor zoom; DOM
  marker discs don't scale with camera distance and occlude anatomy at
  close zoom; bladder floats conspicuously off its plinth and fills <5%
  of its default frame; kidneys/breast/liver become blank colour walls at
  floor zoom). RIG: plinth-plane check + coverage guard on every capture.
  The guard's v1 COUNTED STAGING PIXELS — the exact blind spot it was
  built to close — found via its own disclosure, fixed to subject-only
  counting (staging hidden via ground(), marker spheres excluded), and
  the full capture re-run: 47/48 over floor, with bladder/default now
  honestly UNDER floor (18,963 vs 20k) — an app fact confirming the
  composition finding; bladder's surface verdict rests on its close shot
  (221k px). RANKING (forced, best→worst): lungs, stomach, colon,
  body_male, body_female, brain, kidneys, prostate, skin, pancreas,
  liver, breast, bladder, ovaries, thyroid, testis. PASS ×10; MARGINAL
  bladder/breast/liver/ovaries; fail-adjacent: THYROID (superior-pole
  shard/flap debris + UV smear — the only defect visible at the DEFAULT
  view, on a textured asset) and TESTIS (featureless procedural
  ellipsoid, overfilled framing, marker half-cut). Bottom-three
  characterisation: testis = material + framing (procedural by design);
  thyroid = source-mesh debris (asset cleanup); ovaries = rectangular
  shading patches at close zoom, attributed by three-state isolation
  (present in BOTH mottle-only and AO-only at identical spots; the mottle
  formula is continuous and cannot make corners) ⇒ PRE-EXISTING mesh
  tessellation/normal steps, accentuated but not created by 4B. DOCKET:
  aspect-flip RETIRED with mechanism (at 1200/1150-wide the aspect
  crosses 1.0 after a sidebar toggle — 1.22→0.97 — and the body still
  fits with ≥281px margins: the sphere fit is sized by the tall axis, so
  the flip only bites content with on-screen ratio near 1; the body is
  ~0.38, unreachable at any usable width); testis framing caught cold;
  female thigh striping reproduced ONLY under grazing light from behind
  (faint quad-flow bands) — RULED: clears the bar; liver flatness caught
  cold at rank 11 (waxy sheen) — per standing ruling, path is a remeshed
  manifold if ever pursued, never a lower k; prostate pits seen faintly —
  tolerable; weld≠topology CONFIRMED (brain floor-faceting, weld −895
  predicted nothing). PRE-REGISTERED PREDICTION CONFIRMED with a
  gradation sharper than registered: the textured four took ranks 1–3
  (skin schematic aside), all eight untextured organs are monochrome, and
  the AO organs escape only at DEFAULT distance — shading carries them
  until the camera gets close, and then nothing does: albedo's value is
  concentrated exactly where the audit found the failures. And the
  ranking taught what the prediction couldn't: thyroid has texture and
  ranked 15th — albedo is NECESSARY, NOT SUFFICIENT; a visible defect
  trumps a present strength. RULINGS (at review): ZOOM CLAMP — NO. It
  fixes only the floor-only failures, the real failures (thyroid, testis,
  ovary rectangles) sit above any workable clamp, and the clamp is the
  reference app's EVASION (minDistance 4.8 on a 3.8-unit model hides its
  meshes); seven passes fixed mechanisms rather than hiding symptoms —
  re-ask after albedo. FIX QUEUE: Tier 1 (cheap, now) = scale the DOM
  marker discs by camera distance (best value in the queue) + testis
  framing (carries the plinth re-test trigger). Tier 2 = ONE asset-
  hygiene pass, not four tickets: thyroid debris (severity lead), ovary
  tessellation, pancreas seam, brain floor faceting — the merge-and-
  recompute-normals items deferred from the first conversation, now
  correctly at the top of the queue. Tier 3 = ALBEDO for the untextured
  organs — a work stream, not a fix; open design question (no usable
  UVs on scan meshes), to be designed collaboratively, not prompted
  cold. Evidence: /tmp/atlas-verify/p5/ (shots, sheets, guard.json,
  aspect-flip numbers, thigh grazing set, ovary attribution set).
- **Tier 1 — marker scaling law + testis framing (2026-09-04).** The
  audit's marker finding, measured, inverted the expected fix: the DOM
  proxy was the COMPLIANT element (24×24, keyboard/AT, pointer-events:
  none) and the world-sized sphere was both the pointer target (canvas
  raycast) and the occluder — projecting 6–12px at the DEFAULT view
  (under the WCAG 2.5.8 24px floor at the distance every user starts
  from; a live a11y failure on the app's primary interaction, surviving
  every prior a11y pass because the audited element was never the thing
  anyone clicks — standing condition (6)) and 30–118px at the zoom floor
  (the P5 occlusion). THE LAW: the visible sphere holds a constant
  projected diameter (organ 11px, body 23px — the medians of the approved
  defaults, so the look moves ≤ ~1.4px), scaled per frame in the tick
  loops; the pointer is a 24px-diameter SCREEN-SPACE hit test replacing
  the raycast in all three paths (organ click, body click, body hover),
  with far-side click-through preserved and DEPTH breaking ties among
  in-radius candidates — restoring the raycast's front-marker priority,
  verified on a real crowded pair (breast at yaw 2.62: midpoint click
  selects the near marker). COMPLIANCE IS QUALIFIED, NOT ASSERTED: over
  a 12-yaw sweep, 12 of 14 organs have marker pairs crossing under 24px
  at some rotation angle (worst breast 2.2px) — transient projective
  crowding during auto-rotation shrinks the effective target to the
  Voronoi split. Recorded with the mitigations: the old raycast was
  strictly worse in the same alignments (5.5px spheres fully occlude),
  depth priority gives the crowd to the visible marker, and the 24×24
  DOM proxies are WCAG 2.5.8 equivalent controls. Site map: NO conflict
  (blobs are organ-scale targets; labels non-interactive). Verified
  14/14: 11px at default AND floor on every organ, floor occlusion
  ≤0.26% of subject, click/miss-reject/keyboard pass (harness lesson:
  the app's click is pointerdown-on-container + pointerup-on-window
  through tracker.isClick(); a bare 'click' event is invisible to it).
  TESTIS FRAMING: the one organ frameContents never touches (procedural,
  no h.pos) — its hardcoded radius IS its framing. radius 3.6 → 4.4, not
  taste: frameContents' own fit applied by hand (1.1×1.3/sin 19° = 4.39),
  so the procedural organ obeys the real-mesh convention; occupancy
  89%→72% of frame height, all margins healthy, top marker no longer
  cut; skin untouched (narrow fix chosen precisely to avoid re-verifying
  a passing organ). PLINTH RE-TEST fired per the P3 trigger: STILL
  excluded — the footprint disc (r=1.07 at the base plane) now overruns
  only the bottom edge, by 23px (~7% of frame height) vs 5× before. A
  SUB-FOOTPRINT disc would fit inside the overrun and is CONSIDERED AND
  REJECTED, not unexplored: Prompt 3's staging rule is footprint-
  circumscribing, and breaking a staging convention for one organ costs
  more than the plinth is worth. Regression 163/2 = baseline. Evidence:
  /tmp/atlas-verify/t1/.
- **Tier 2 — asset-hygiene pass: brain FIXED, pancreas FIXED, thyroid
  PARTIALLY FIXED + escalated, ovary ESCALATED untouched (2026-09-04;
  transforms in `.claude/mesh_hygiene.py`, run against the a131649
  masters — masters + script = the chain, bake_ao.py's contract).**
  DIAGNOSIS FIRST, and it redistributed the tickets: BRAIN — 78% of its
  vertices were exact position-duplicates (156,631 of 201,588 across
  50,967 positions) with normal divergence to 180°: the floor-zoom
  faceting was split normals, exactly the tolerance-merge case. OVARY —
  a PERFECTLY CLEAN manifold (zero non-manifold edges, zero duplicated
  positions, smooth shared normals, 0.50mm mean edge): the rectangles are
  per-vertex colour interpolation over genuinely coarse tessellation —
  the pre-registered escalation ("subdividing a real-scan mesh is a
  fidelity decision"), so NOTHING was changed. RULED at review: closed as
  TIER-3 EVIDENCE, not a hygiene ticket — ovary's density is the
  measured lower bound at which per-vertex colour visibly quantises, and
  it converts Tier-3 option 1 from "try and see" into a SCREENING TEST.
  Measured (mean projected edge at the close audit pose, 0.45×default,
  318px canvas): ovary = 5.9px = the calibrated FAIL threshold. Screen
  of the eight mottle organs: bladder 6.4 / brain 6.2 / kidneys 6.0 —
  FAIL, coarser than the calibrated failure; prostate 5.2 / pancreas
  5.0 / liver 4.1 — MARGINAL; breast 1.6 — pass. Per-vertex albedo is
  screened OUT as the general mechanism before any bake code exists —
  three organs sit above the threshold and only one clears it with
  margin, at exactly the zoom where the P5 audit located all of
  albedo's value. PANCREAS — 288 positions
  shared across the five named sub-meshes, 43 with >20° divergence; and
  the visible seam SURVIVED the normals weld, because it was never a
  normals problem: isolation renders show AO-only seamless across the
  boundary and mottle-only carrying the line — the mottle recipe
  normalises its sin/cos field to EACH sub-mesh's own bounding box, so
  the pattern phase-jumps at every part boundary. THYROID — not "some
  shards": 373 disconnected open fragments (largest 319 of 3,199 faces,
  316 confetti components of 1–4 faces, 2,769 boundary edges), a
  patchwork its texture holds together visually. FIXES, none of which
  moves a vertex (topology/attribute repairs, not smoothing — landmark-
  safe by construction and verified numerically: brain and pancreas
  fixed-vs-master unique position sets differ by ZERO points; thyroid by
  exactly the 10 debris vertices): brain = weld at 1e-6m + all-smooth
  normals (verts 201,588→95,924, faces exactly preserved; floor-zoom
  facets → smooth organic shading, identical silhouette; shipped file
  DROPS 572KB); pancreas = (a) cross-object normal weld at all 288
  boundary positions with the node structure untouched (the -kn
  provenance rule respected literally) + (b) the real fix, runtime: the
  mottle helper now accepts opts.frame (a WORLD-space union box + each
  mesh's matrixWorld — world-space because compressed GLBs carry
  dequantisation transforms on wrapper nodes) so multi-mesh organs
  sample ONE continuous field; pancreas.js passes the union frame; the
  seam is gone in the after renders. Bladder shares the mechanism
  latently across its 6 sub-meshes but shows no visible seam at freq 4 —
  left alone deliberately (no defect, signed-off look). THYROID = proud-
  debris deletion only: 15 floating micro-components (23 faces) beyond
  the 95th-percentile radius removed; raising the ceiling 25→100 faces
  deleted the SAME 15, proving the remaining visible flaps are ROOTED in
  large anatomy-carrying fragments — carving those is a judgment cut on
  a real-scan asset, ESCALATED and RULED at review: ACCEPT THE
  REDUCED STATE. Explicit-face-list cuts REJECTED on an anatomical
  specific — the rooted flaps sit at the superior pole and isthmus,
  which is exactly where a PYRAMIDAL LOBE lives (present in roughly half
  of people); variant-vs-artefact there is an anatomist's call not
  available in this loop, and the failure mode is deleting real anatomy
  from a medical atlas. Re-unwrap+rebake ELIMINATED on provenance, not
  deferred: thyroid.js records the asset as a Sketchfab artist scene
  ("TIROIDES ANDREA DACS UJAT") isolated by texture-colour
  classification — the painted texture atlas IS the only colour source,
  so a re-unwrap re-projects the same smear onto more islands without
  adding information. THE PATH IS A RE-SOURCE HUNT, opened as its own
  tracked item under the full license-verification playbook with a
  pre-registered negative — the Ovary/Stomach/Testis standard. Tier-3
  planning note recorded with it: thyroid is textured and ranked 15/16 —
  it is the COUNTEREXAMPLE to "albedo solves the bottom of the ranking"
  (its problem is geometry), not an instance of it. PIPELINE RE-RUN per the prompt's constraint 2:
  AO re-baked from the fixed brain and pancreas (means consistent with
  4B), gltfpack -kn -cc, COLOR_0 + name-sets verified, zone gate 3/3 at
  -vn 8 (the newly-smooth brain was the banding suspect — worst zone
  0.830, well clear). The thyroid texture was re-encoded by the Blender
  round-trip (size −452B; the byte-identity invariant of 4A does not
  survive a mesh edit by necessity) — visually verified at default and
  close. Regression 163/2 = baseline. Evidence: /tmp/atlas-verify/t2/
  (diagnoses, position-identity checks, before/after pairs, seam
  isolation, zone gates).
- **Citation-durability pass — RUN AND RULED (2026-09-04). Tier 3 held;
  this pass outranked it.** Opened by Tier 3 Phase 1's incidental finding
  (1-in-8 colour citations verifiable at source) and re-scoped by class
  because that sample was colour only for an incidental reason. CENSUS:
  719 citation-carrying lines — epidemiological 372 (126 distinct
  sources), licence 152 (5 families), anatomical 126, colour 69.
  VERIFICATION RATES (stratified sample, dated 2026-09-04, three-state:
  verified / reachable-but-quote-absent / unreachable): epidemiology ≈78%
  (Waddell's 100 genomes, Oweira's N=13,233, Peres's n=28,118 all
  verbatim in abstracts; Di Carlo's melanoma cohort verbatim IN THE
  PAPER'S TITLE — 1,578,482 adults, 59 countries; Johannsen at JAMA Netw
  Open 2025; KGCA series located) versus colour 12.5% — THE PREDICTION
  CONFIRMED: DOI-bearing sources are durable by design, teaching pages
  are not. SOURCE-CLASS POLICY adopted from it: any claim that must stay
  verifiable prefers a permanently-addressed source. LICENCES split by
  the same axis: all four Sketchfab artist pages verified verbatim
  ("CC Attribution" live on each; colon's and thyroid's never-recorded
  URLs RECOVERED into the manifest), Blender CC0 verified — but the HRA
  FAMILY (SEVEN of twelve organ GLBs: kidneys, liver, brain, prostate,
  pancreas, bladder, breast) is QUOTE-ABSENT: entry pages verify identity
  and render no licence text at all, escalated as the only item with an
  obligation attached; lead: HRA's DOI-bearing release records, not the
  per-model pages. And the colon/thyroid embedded-extras verification
  legs are UNREPRODUCIBLE from the repo — the isolation re-exports
  DROPPED the extras the claims cite (ovary's pipeline preserved them =
  the model; extras-preservation assertions queued for mesh_hygiene.py
  and bake_ao.py). THE MANIFEST (.claude/citations.json, 23 entries:
  quotes, URLs, retrieval dates, hashes; text only, never images) makes
  records DURABLE, NOT TRUE — initial verification is the single point of
  failure and it demonstrably failed once: PROSTATE's "Tan to pink…
  confirmed directly" was NEVER at the named source (today's pages carry
  no colour text; the Wayback snapshot of 2025-08-20, predating the
  material pass, carries none; site-wide exact-phrase search returns
  zero). A bad citation entered during a two-way-verification pass and
  survived review — care at entry is the only defence for that class.
  PHASE-4 DOWNGRADES applied per the downgrade-over-substitution ruling:
  prostate (bad attribution, evidenced three ways), bladder (never had a
  source; now disclosed in the user-facing #disclaimer, not only in a
  code comment), pancreas (dangling pointer since first commit — the
  attribution failed, the description stands as illustrative). RULING ON
  STATISTICS: downgrade-to-illustrative works only where an illustrative
  home exists (colour); a statistic reads as fact regardless of label,
  so Wang et al. Front Oncol 2023 (the bladder screen's 48,789/53,142 ≈
  92% urothelial share, NOT RELOCATED after three time-boxed searches) is
  RE-SOURCE OR REMOVE, no middle — queued. STRUCTURAL CHECKS added to
  regress.js (manifest parses; every entry resolves to a real file; every
  mottle colour and every shipped GLB has an entry) — deterministic,
  offline, no live link-checking; they catch a claim-with-no-record and a
  record-pointing-nowhere, the two failures that shipped. BASELINE
  163/2 → 167/2, the one legitimate move. GEOMETRIC LIT-REGION SELECTOR
  (the standing exception) implemented and ADOPTED WITH REBASELINE: the
  old top-luminance-quartile selector is photometric — a function of the
  measurand — and its bias is now measured: at a=0 the geometric selector
  (view-space normal·light > 0.6 from a MeshNormalMaterial pass, staging
  hidden by identity) tracks recorded hue to ≤1.1° on all nine cited
  organs while saturation moves TOWARD cited on exactly brain
  (0.053→0.021), kidneys (0.038→0.009), and testis (0.087→0.043) — the
  three organs whose lit-region brightness distribution is most distorted
  (baked AO ×2, glow halos ×1): the quartile was preferentially sampling
  desaturated highlights. The geometric a=0 record (geo_a0) is the new
  reference; this is an instrument change, never a silent swap.
  CONSEQUENCE QUEUED: the P3 "AgX undershoots cited saturation on 6 of 9"
  mechanism-flip finding may be selector artefact — the four-operator
  table re-runs on the new instrument to correct the recorded reasoning
  (the AgX VERDICT is not in question; it won by 2–5× margins). Queue
  after this commit: HRA licence home → operator re-measurement → extras
  assertions → Wang. QUEUE OUTCOMES (same day): (1) HRA RESOLVED — the
  per-model NIH 3D pages were the wrong verification surface; the durable
  instrument is the project-level statement on
  humanatlas.io/3d-reference-library, verbatim: "All HRA 3D reference
  objects are released under Attribution 4.0 International (CC BY 4.0)",
  with the formal Browne et al. HuBMAP CCF 3D Reference Object Library
  citation — archived in the manifest, escalation closed for all seven
  assets. (2) OPERATOR RE-MEASUREMENT on the geometric instrument
  CONFIRMS the standing warning rather than retracting it: AgX undershoot
  survives at exactly 6 of 9 (same 3/6 split), magnitudes smaller (worst
  −0.043 vs −0.087 — the old selector exaggerated but did not create the
  effect), and AgX's fidelity win WIDENS (0.029 vs ACES 0.090, control
  0.114, Neutral 0.220). viewer.js's condition block carries the
  confirmation coda. (3) EXTRAS-PRESERVATION ASSERTIONS added to both
  transform scripts (mesh_hygiene.py, bake_ao.py): source asset.extras
  are captured, re-injected into the derived GLB post-export, and
  verified — a transform that would ship a derived asset without its
  source attribution now fails loudly. (4) WANG — RESOLVED, and the
  "hunt exhausted" verdict was WRONG in an instructive way: the code
  comment carried a PMCID (PMC10605465) that six metadata-based searches
  never used, and it resolved on the first attempt. The paper is real —
  Hyung Kyu Park, Current Oncology 2023, doi:10.3390/curroncol30100656 —
  and the recorded "Wang et al., Front Oncol" got BOTH author and
  journal wrong ("Wang J." is an entry in the paper's own reference
  list: a transcription slip at entry). Every figure re-verified
  VERBATIM at the permanent address: all four subtype counts in one
  sentence, bone 38.3% for UC, SEER 17-registry extraction 2010+ —
  registry data, answering the cohort-vs-population category question;
  53,142 is the atlas's computed sum, never printed in the paper (why
  the full-text number search returned zero). Citation metadata
  corrected across bladder.js. THIS IS THE THIRD ENTRY-TIME CITATION
  ERROR (prostate's quote, pancreas's pointer, this attribution) in a
  ~dozen-item sample: the entry-time error rate — not rot — is the
  epidemiological class's real risk, and it is unbounded on this sample.
  QUEUED PROGRAMME: a fuller epidemiological verification pass,
  prioritised by user-facing prominence (numbers rendered on screen
  before numbers in comments; a wrong on-screen figure is something a
  person carries away). The one mitigating pattern is now policy — and
  RULED THE PRIMARY RULE, subsuming the source-class preference: RECORD
  THE PERMANENT IDENTIFIER (PMID/PMCID/DOI) IN THE CITATION ITSELF,
  always. "Prefer permanently-addressed sources" only helps when you
  choose the source; the identifier rule works regardless of source
  quality — a weak source with a DOI stays recoverable, an excellent
  source recorded as a page title does not. TWO CORRECTIONS RECORDED AT
  THE PARK RESOLUTION: (a) the "hunt exhausted" verdict was wrong (the
  identifier was in the comment all along); (b) the category diagnosis
  behind the re-source ruling was ALSO wrong — it reasoned from
  N=53,142 to "cohort" to "cohort N cannot support a population claim",
  but 53,142 was the atlas's own computed sum and the source was
  already a SEER 17-registry extraction: the category error never
  existed, and the ruling reached the right outcome by an incorrect
  route. THE THREE ENTRY-TIME DEFECT SHAPES, separated because only one
  is fixable: ATTRIBUTION ERROR (Park — right source, wrong metadata;
  recoverable FROM the identifier), DANGLING POINTER (pancreas —
  reference to nothing; detect and downgrade only), CONTENT ERROR
  (prostate — quote never at the source; detect and downgrade only).
  The epi pass's realistic output is therefore: correct the attribution
  errors, downgrade or remove the other two shapes — do not burn budget
  hunting sources that were never there. SEQUENCING: HARVEST IDENTIFIERS
  FIRST, structurally, before verifying anything — RUN 2026-09-04:
  of ~211 paper-type epidemiological source keys (regex-approximate;
  some keys are journal-name fragments), 41 carry an identifier
  somewhere with the citation and ~170 do not — IDENTIFIER COVERAGE
  ≈19%, i.e. four of five epidemiological sources are UNRECOVERABLE-IF-
  WRONG, with three entry-time errors already found in a sample of
  twelve. The partition (/tmp/atlas-verify/cite/identifier_harvest.json)
  is the pass's scope statement: the recoverable minority can be
  repaired later; the unrecoverable majority is where verification
  effort and any downgrades must concentrate, on-screen figures first.
  IDENTIFIER BACKFILL RUN (2026-09-04, the cheap pass between harvest
  and verify): resolving an identifier from recorded metadata and
  verifying a claim are wildly different costs for different benefits,
  and the failure mode is the payoff — metadata that resolves to
  NOTHING is the entry-time-error signature (Wang/Park resolved to
  nothing under its wrong metadata because the metadata was never
  true). PubMed eutils sweep over 188 structured identifier-less
  records with a MULTI-FIELD AGREEMENT GATE (first-author surname +
  year + journal-when-recorded + topic-consistency; EXACTLY ONE
  candidate may pass; refusals, never best guesses — an automated
  title-match writing a confident wrong identifier is citation-shopping
  with better throughput). RESULT (3.5 min, zero API errors):
  46 BACKFILLED (each carrying method + resolution date in the
  manifest's `backfill` block — a backfilled identifier asserts "this
  metadata resolves uniquely to this paper", NOT "this paper was
  verified to support the claim", and never carries entry-time weight);
  13 NO-MATCH — TRIAGED SAME DAY AND THE PILE EMPTIED: all 13 were
  EXTRACTOR artefacts, not entry-time errors. 10 were journal-name
  fragments parsed as authors ("Gastroenterol 2025", "Hepatology 2018",
  "PNAS 2013"…) — reclassified parse-noise with the triage reason
  recorded; 3 were real citations with mangled author tokens (compound
  surname "Mehrvarz Sarshekeh" split; "Sottoriva et al. (PNAS," and
  "Louis et al., Neuro-Oncology" patterns), and all 3 re-resolved
  UNIQUELY under the SAME gate with corrected tokens: 28267766
  Mehrvarz Sarshekeh/PLoS One/SMAD4, 23412337 Sottoriva/PNAS/GBM
  heterogeneity, 34185076 Louis/WHO-2021 classification. Louis
  additionally needed the source line's journal constraint because
  bare "Louis[au] AND 2021[dp]" hit retmax truncation — the retrieval-
  miss mechanism attributed to the no-field-match pile, demonstrated
  live on a known-real target. ZERO new entry-time errors: the
  Wang/Park defect class does NOT recur in the auto-detectable band.
  The detector coming back clean AFTER triage is a finding, not a
  disappointment — and the triage step is mandatory before reading any
  no-match count as a defect count, because the pipeline's own parser
  was the dominant defect source in its own flag pile. 11 AMBIGUOUS
  (multiple passers, refused — several are two REAL same-author-same-
  year papers, e.g. Shain 2015, Gershenwald 2017, Pollock 2003, which
  need the claim itself to disambiguate: epi-pass work; Park 2023 is
  already identifier-carrying in `entries` from the durability pass,
  refusal correct, no action); 97 NO-FIELD-MATCH (hits exist but none
  pass all fields — NOT a defect list: common-surname retrieval misses
  and title-topic strictness; means "not auto-resolvable", nothing
  more); 21 parse-noise at extraction + 10 reclassified at triage.
  Identifier coverage roughly DOUBLES in one sweep: 41 → 90
  identifier-carrying sources (46 sweep + 3 triage corrections).
  Epi-pass triage order after the pile emptied: the 11 ambiguous, then
  user-facing no-field-match — with the taxonomy's expectation set:
  fix attribution errors, downgrade dangling pointers and content
  errors.
  GATE-STRENGTH AUDIT + SWEEP 2 (2026-09-04, both user-pushed before
  accepting the residue). The audit question — how much unstated work
  was "journal-when-recorded" doing — had a sharp answer: effective
  strength of the 46 sweep-1 backfills was 24 A+Y+J+T / 13 A+Y+J /
  6 A+Y+T / 3 A+Y-ONLY. Zero journal-mismatches is STRUCTURAL, not
  clean luck: a recorded journal was enforced inside the query ([ta]),
  so a mismatch presents as zero hits, never as the dedicated status.
  The A+Y-only class was then tested against ground truth and failed
  2/3: "Zhu 2003" (thyroid) had been backfilled to a PLANT-GENETICS
  paper while its true PMID 12866375 sat on the next source line, and
  "Boutros 2015" (prostate) was a NEGATED MENTION inside an authorship-
  correction comment — the line itself says the cited paper does not
  exist — decorated with an unrelated methods paper. Both retracted.
  On every backfill testable against an entry-time identifier the
  ≥3-field machinery went 4/4 correct (Jakob, Livasy, Luvhengo by
  sweep-1; Wippold by sweep-2, converging on the exact PMIDs already
  in the source) and A+Y-only went 2/2 wrong. RULE: automated backfill
  needs at least three agreeing fields; author+year+uniqueness alone
  is never sufficient. Every backfilled entry now carries
  fieldsChecked — the strength ACTUALLY applied (a run that can't
  state what it measured shouldn't report a number). NEW EXTRACTOR
  DEFECT CLASS surfaced by the audit: multi-line citation
  parentheticals — five records (Zhu, Luvhengo, Jakob, Livasy,
  Wippold) carried their identifiers ON the citation's continuation
  line and were harvested as identifier-less; all five reclassified
  entry-time. Corollary lesson: negated mentions inside correction
  comments must not be harvested as citations.
  SWEEP 2 on the 97 no-field-match (the Louis case proved the
  retrieval leaky — a retrieval miss and a metadata error land in the
  same pile): retmax 8→100 with the esearch count recorded; topic
  terms IN the query (All Fields) with the instrument recorded per
  entry (topic:title vs topic:query); Crossref as a second engine;
  identity-dedupe across engines (title-token Jaccard ≥0.7), union
  must contain EXACTLY ONE paper. Result (337 s, 97/97): 37
  RESOLVED — the "not-auto-resolvable" label had been ~38% query
  artefact — incl. Wippold (validation) and Curtin 2005 → 16291983,
  exactly the NEJM paper whose CLAIM the source documents as
  paywall-unverifiable (identifier ≠ claim verification, the recorded
  semantics). Residue now characterised, not lumped: 39 AMBIGUOUS-2
  (genuine multi-passer collisions — 0 identity-dedupe suspects on
  audit, several are two real same-author-same-year papers), 11
  SATURATED (pubmed count>100, exhaustiveness unclaimable), 10
  ZERO-PASS (candidates exist, none pass all fields — the true
  gate-fail residue). COVERAGE: 46 entry-time + 80 backfilled = 126
  of ~211 (≈60%, from 19% at harvest). The 11 sweep-1 ambiguous stay
  refused (user ruling: genuinely-two-real-papers is exactly the case
  only the claim can settle — epi-pass work by construction).
  EXTRACTOR AUDIT + POLARITY GUARD (2026-09-04, the three extractions
  from the ground-truth ruling, executed same day). The extractor was
  the least-validated component in the pipeline — two defect classes
  found by accident, downstream, while looking for something else — so
  it got the direct audit: seed=42, n=30 of 188, every parse compared
  to its source line BY HAND (full verdicts in the manifest's
  _extractor_audit). Rates: AUTHOR 24/30 (5 journal-as-author
  fragments, all screened downstream; 1 LIVE author-order error —
  "Li, Kang & Tang" → Tang — refused downstream only by luck); YEAR
  30/30; JOURNAL RECALL 11/25 = 44% — the headline: 25 of 30 sampled
  citations carry a journal ON the line and the extractor recorded 11,
  so the gate's "journal-when-recorded" qualifier concealed a harvest
  failure and ran 3-field where 4 were available; six sampled RESIDUE
  records (Moore/PLOS Genetics, Mariette/Gastric Cancer, Mehra/Cancer
  Research, Zhuang/Transl Cancer Res, Salgado/Ann Oncol, Wiegand/NEJM)
  have their unharvested journal sitting on the source line —
  re-extraction converts residue to resolvable. TOPICS defective
  ~11/30 (empty-where-available or polluted by neighbouring entries).
  REF LINE systematically +1 in ~29/30 — one deterministic
  window-indexing bug that ALSO explains the "identifier on the next
  line" misses: the ref pointed AT the identifier's line while the
  parse ran elsewhere. Refs deliberately NOT blanket-mutated (windows
  absorbed the offset; the fix belongs in the extractor). DOWNSTREAM
  DAMAGE measured, not assumed: the 13 sampled backfills were
  title-verified — 11/12 correct, ONE RETRACTED: "Arends 2026"
  (colorectal grading, Histopathology — journal on the line, missed)
  had been backfilled to a Streptococcus pneumoniae paper in ISME J
  because the topic gate matched 'colon' as a SUBSTRING of
  'colonization'. Word-boundary topic matching is required in any
  future sweep. Backfilled now 79; coverage 46+79 = 125 of ~211.
  POLARITY GUARD (.claude/citation_polarity.py): the Boutros failure
  is a CLASS — a token-matcher has no notion of claim polarity, and
  the epi pass reads the same lines. The guard classifies windows
  (corrective/caveated/clean), contract = flag-then-human-read (a
  window regex cannot tell the negated mention Colombino from its
  correction target Jakob two tokens later — pretending otherwise
  would be a confident wrong answer). Validated under condition (7)
  AT BIRTH: self-test proves it fires on four known-corrective
  fixtures and stays silent on three known-clean ones; the scan
  REFUSES to run on a failing self-test — and the first self-test run
  caught a mislabelled FIXTURE (the guard was right, my label was
  wrong: "checked and NOT found citable" IS a rejected claim).
  Scan: 152 clean / 9 corrective / 27 caveated across all 188; flags
  written into the manifest (`window` + `windowMarkers`); mention-
  level reads of all flagged backfilled/entry-time records: all keep
  (Jakob = correction target; Lauren asserted beside the frequency-
  chain correction; Hu 2012 cited AS the mis-citer — identifier
  correct, but the epi pass must NOT verify the transposed 54/32/15
  figures against it as if asserted). THE EPI PASS CONSUMES THESE
  FLAGS: flagged window ⇒ human polarity read before verifying,
  resolving, or fixing anything in it. Colombino itself was never
  harvested (extractor missed the mention — lucky, not safe).
  NEXT CHEAP PASS OPENED BY THE AUDIT (user-gated): extraction v2 —
  fix the +1 offset, journal recall, author-order, topic pollution,
  substring matching — then re-run the 60-record residue with
  recovered journals; six sampled residue records already
  demonstrated recoverable-by-re-extraction.
  EXTRACTION V2 + RESIDUE RE-RUN (2026-09-04, user-approved), WITH A
  RETRACTION FIRST: the audit's "systematic +1 ref-line offset"
  finding was FALSE — manufactured by the audit's own context
  printer, whose label arithmetic was off by one. A v2 line-attribution
  "bug" that wouldn't die led to a raw probe; grep -n re-check showed
  v1 refs were EXACT all along (Moore 154, Zhu 267 = the author lines
  themselves), and v2's supposed failures were my TRUTH table
  inheriting the printer bug. Condition-(2)/(3) family, inside the
  audit itself: the instrument that measured the instrument was
  unvalidated, and its off-by-one read as a clean systematic pattern.
  Every other audit rate re-checked against raw grep/sed and stands.
  The dependent claim also corrected: Zhu's PMID sits on ref+1 (the
  continuation-line miss mechanism stands; "the ref pointed AT the
  identifier's line" did not).
  V2 (.claude/extract_citations.py, a repo tool — the epi pass reads
  citations too): ref = author-token line by construction; journal
  parsed between author block and year, validated structurally;
  first-surname-of-list author ("Li, Kang & Tang" → Li); nearest-head-
  to-year priority (an et-al farther back must not shadow a nearer
  &-list — caught by the Skok/Santucci validation case); lowercase
  particles ("von der Maase"); topics from the citation's OWN clause;
  entry-time ids attached from the clause; polarity window on every
  record. VALIDATED against grep-derived ground truth: 28/28 author,
  28/28 journal, 28/28 ref line, including every v1 failure. 372
  records, 73% journal presence (v1: 35%), 41 entry-time ids.
  RESIDUE RE-RUN (60 records, v2 fields, word-boundary topics
  everywhere, min-3-fields, PubMed retmax=100 [ta]-constrained +
  Crossref, union single-candidate): 26 RESOLVED, all 26 title-read by
  hand — incl. Cooper 2015 → 25730763 EQUAL to the entry-time id in
  the authorship-correction comment (convergence), Siech → pmid on its
  own line (reclassified entry-time), and 5 author-corrections doing
  exactly their job (Brenner-not-Hearing, Li-not-Tang class, Gershenwald
  from the "Clin" fragment, Zhuang and Aizimuaji from journal
  fragments). Identity-dedupe GROUPS corrigenda with originals (title
  Jaccard ≥ 0.7 — correct: same work); pmids record the originals
  (Mariette 30167905, Cooper 25730763). Residue after: 15
  still-ambiguous / 8 still-saturated / 10 still-zero-pass / 1
  no-v2-match (+ 11 sweep-1 ambiguous standing refused) = 45,
  characterised. SOURCE-DEFECT CANDIDATE recorded for the epi pass
  (found by cross-referencing, not fixed): bladder.js:174 attributes
  Rachakonda 2013 to "PLoS ONE" while carrying PMC3808633 = PMID
  24101484 = PNAS — right identifier, wrong journal attribution, the
  taxonomy's fixable class. COVERAGE: 48 entry-time + 103 backfilled
  = 151 of ~211 (≈72%, from 19% at harvest).
  CROSSCHECK + JOURNAL-REQUIRED RULE (2026-09-04, the Rachakonda
  generalisation, user-specified). The wrong-backfill census is
  CATEGORICAL — all four in the no-journal class, zero in any
  journal-checked class — so minimum-three measured the wrong thing:
  it counted fields as fungible when journal is high-entropy (nearly
  impossible to match spuriously) and topic is low-entropy and was
  actively defective. JOURNAL IS NOW REQUIRED for automated backfill
  (~14% no-journal error rate as evidence, 4/29; v2's 73% recall makes
  it affordable where v1's 44% would not have); no-journal records
  resolve only by human title-read. THE CROSS-CHECK
  (.claude/citation_crosscheck.py): for every identifier-carrying
  record, recorded journal/first-author/year vs the identifier's own
  esummary metadata — one bulk pass, no papers read, attribution-error
  detection and backfill validation by construction (retrospectively
  it would have flagged Zhu, Arends, Wilentz and Oweira — four finds
  that cost 29 hand-read titles now cost one API pass, forever).
  Condition (7) both directions at birth (fires on all three fields,
  passes agreeing fixtures incl. an NEJM-abbreviation must-not-flag;
  live run asserts its known positives). RUN: 130 records, 7 flags,
  all classified — 3 expected artifacts + FOUR NEW GENUINE attribution
  errors, all identifier-right-journal-wrong: Beyer 2021 testis.js:34
  ("Ann Oncol" → J Clin Oncol, 33729863), Paly 2013 testis.js:149
  ("J Urol" → Radiother Oncol, 23321493), Zeng 2025 testis.js:154
  ("Front Oncol" → J Urol, 39977396), Wood 1996 testis.js:157
  ("J Urol" → Clin Radiol, 8617040). With Rachakonda: FIVE, four in
  testis.js — journal names shuffled among neighbouring citations,
  one writing session's systematic slip. All recorded not fixed
  (one-word fixes awaiting the go). The run also hardened v2 — id
  over-reach across citation boundaries, a head-fallback shadowing
  bug, a head-ownership gap — instruments now check each other.
  PMC/doi mapping is the recorded limitation (Rachakonda's PMC find
  came from manual idconv). THE DAY: 19% → 72% identifier coverage,
  with the precision attached rather than assumed.
  ATTRIBUTION RULING (2026-09-04 evening): RACHAKONDA FIXED in source
  (bladder.js:174 "PLoS ONE" → "PNAS"; isolated, different file, no
  cluster; validated by the detector itself — post-fix run passes,
  wrong pair preserved as a permanent self-test fixture). THE TESTIS
  FOUR HELD, deliberately: the crosscheck validates identifier against
  metadata, so an ENTIRE citation block that migrated onto the wrong
  claim is internally consistent and structurally invisible to it —
  if a shuffle can move journals across neighbours it can move
  identifiers the same way, and a one-word journal fix would make each
  record pass while leaving open whether the identifier belongs to
  that claim at all: converting a visible defect into an invisible
  one. The four flags are evidence of a disturbance in the FILE, not
  four typos. testis.js goes to the FRONT of the epi-pass claim-level
  queue, every citation in the file, because the shuffle mechanism
  does not respect the boundary of what the detector could detect.
  CROSSCHECK EXTENDED same day (PMC via elink, doi via esearch[doi]):
  141 records examined, the one unmappable id listed never silent;
  the extension's first run treated as calibration per condition (8)
  — stale-input and tag artifacts triaged, pipeline fixed, second run
  read as evidence: 7 flags of 141, exactly the expected set (three
  artifacts + the four held).
- **Epidemiological verification pass — FROZEN CONTRACT (2026-09-04,
  user-authored; full text in the manifest's _epi_pass_contract; the
  outcome vocabulary, milestone definition and testis.js entry
  procedure are frozen, everything else iterates).** WHAT THIS PASS
  IS NOT, stated before starting because the board reads as
  mostly-done and it isn't: the identifier work established that
  citations point at real papers and NOTHING about whether those
  papers support the claims attached to them. 72% identifier coverage
  means 72% CAN BE claim-checked; the claim surface is ~211 sources
  of which roughly EIGHT have been claim-checked (the durability
  sample). Every instrument so far — harvest, resolver, crosscheck,
  polarity guard — is a pre-condition for this pass, not partial
  completion of it. FIVE OUTCOME STATES, each addition forced by a
  real case: verified-quoted; verified-derived (record the arithmetic
  — Wang/Park's 53,142 was the atlas's own sum of four counts,
  printed nowhere in the paper, so number-search verifiers fail every
  derived value or coincidence-match one wrongly); failed
  (attribution → fix; content → the statistics ruling: for ON-SCREEN
  figures re-source or remove, no illustrative middle — a user reads
  a number as a fact); not-a-source-claim (Hu 2012 — the atlas
  documents the transposition, it does not assert 54/32/15; the
  polarity-flagged windows are the candidate population, each gets a
  mention-level human read before any verdict — recorded here as 36
  when written, 59 on the 2026-09-05 live scan of 408 records, and the
  10 CORRECTIVE windows are now all read: see the mention-read table,
  2 anti-citations and 8 real source claims); unverifiable-by-access
  (Curtin 2005 — identifier sound, text unreachable: the claim STANDS
  with the limitation recorded, NOT a failure, else paywalls strip
  correct claims; expect common, not edge). MILESTONES, because
  completion is not the goal and probably isn't reachable: M1 =
  on-screen figures (share values, ORGAN_DETAILS facts, hotspot text
  — a few dozen items, the only claims a user actually reads); M2 =
  testis.js in full (may run first if the disturbance confirms); long
  tail = comment-level citations, may never complete, acceptable
  provided the record distinguishes CHECKED from CHECKABLE per entry.
  Conditions (1)–(8) standing; (7) both directions applies to the
  shuffle reconstruction itself (a tidy offset from one pass is
  exactly what the +1 looked like), (8) makes the first claim-read
  batch calibration — read the second batch as evidence.
  SHUFFLE TEST RUN SAME DAY — DISCONFIRMED, decisively: the four
  flagged lines are the ONLY occurrences of those journal names in
  the file (grep, whole file), no neighbour's true journal is
  "Ann Oncol" or "Front Oncol", and the recorded set is not a
  permutation of the true set; the single clean adjacency (Paly's
  recorded "J Urol" = Zeng's truth) is orphaned by both of its
  would-be chain links — coincidence, not displacement. Condition (7)
  satisfied: verdict checked against raw lines + the full ordered
  17-record citation map. Contract fork taken: four independent wrong
  labels, ordinary fixable class, urgency DROPS, M1 (on-screen
  figures) leads and M2 becomes a normal read. CALIBRATION BATCH
  (condition (8) — the four held flags doubled as the first claim
  reads, abstracts via efetch): Beyer VERIFIED-QUOTED (2,451 men,
  5-yr OS 95%/88% — all verbatim in the abstract); Zeng
  VERIFIED-QUOTED verbatim (laterality rule + 6–11.1% contralateral
  microscopic spread); Wood VERIFIED-QUOTED verbatim word-for-word
  ("The contiguous nature of disease spread from abdomen to chest and
  neck in seminoma is confirmed."); Paly VERIFIED-QUOTED on every
  figure (90 patients, 145 nodes, 84/9/7%, 99% within 2.5 cm inferior
  to T12/L1) with ONE calibration caveat for revision: the atlas's
  cohort descriptor "isolated nodal relapse" vs the paper's
  "infradiaphragmatic adenopathy" — over-specification, not a figure
  error. ALL FOUR identifiers demonstrably belong to their claims;
  the four journal labels are ordinary attribution errors, the signal
  the hold protected is fully consumed, and the one-word fixes await
  the go.
  GO GIVEN — ALL FIVE ATTRIBUTION FIXES APPLIED (2026-09-04): the
  testis four (Beyer → J Clin Oncol, Paly → Radiother Oncol, Zeng →
  J Urol, Wood → Clin Radiol) join Rachakonda; every fix
  detector-validated — the post-fix crosscheck reports exactly the
  three known artifacts and ZERO genuine flags (3 of 141 as recorded;
  3 of **142** on the 2026-09-05 re-run, the extra record an extractor
  revision, not a regression — the same frozen-number class as the
  "36" polarity count). THE HOLD
  IS DISCHARGED, recorded as such rather than marked done: it existed
  to stop a one-word fix erasing the question of whether the
  identifiers belonged to their claims, and reading all four claims
  answered it. USER SELF-CORRECTION recorded with its shape named:
  the displacement read was SAMPLING ON THE DEPENDENT VARIABLE — a
  mechanism inferred from the flagged records, which are precisely
  the records surfaced because something was wrong with them; a
  pattern inside a non-random sample doesn't generalise to the file.
  The full ordered map was the right instrument BECAUSE it included
  the unflagged records, where a real displacement would also have
  left traces. Same family as the +1 offset: a tidy pattern from
  partial data, dissolved by widening the aperture.
  SIXTH OUTCOME STATE, by user amendment (the contract's own rule — a
  real case forced it): VERIFIED-FIGURE-SCOPE-DRIFT — every figure
  verbatim, citation sound, but the claim attaches the figures to a
  narrower or different population than the source measured;
  consequence differs from all five: no citation action, a COPY EDIT
  to the surrounding text. Born from Paly ("isolated nodal relapse"
  vs the paper's "infradiaphragmatic adenopathy"), which survived a
  line whose own header says "SOURCES, verified directly". It is a
  state, not a footnote, because (a) it is invisible to the obvious
  reading method — find-the-figure verification passes every scope
  overstatement, and the calibration batch went 4/4 on figures while
  1 of 4 carried this defect: a 25% miss rate for a number-matching
  reader on the batch chosen to calibrate the method; and (b) it is
  the likely-common class — compressing a study population into a
  tidier phrase is exactly what happens writing UI copy, and
  compression pressure peaks on-screen, so M1 is where it should be
  most frequent. CALIBRATION LESSON: verify the population and scope
  descriptor alongside the figure — not "does 84% appear" but "does
  84% describe the thing this sentence says it describes". Paly's
  copy edit applied (the state's first discharge, using the paper's
  own descriptor). NO PRIOR INTO M1: the 4/4 batch is a biased sample
  (records already known defective on attribution) — it says the
  journal errors were isolated to labels, it does not predict the M1
  rate.
  VERIFIED-ANNOTATION CENSUS + CONDITION (7) PAST INSTRUMENTS
  (2026-09-04, user ruling: Paly's drift survived a "SOURCES,
  verified directly" header, which makes "verified" annotations a
  POPULATION rather than a reassurance — a line marked verified
  carrying a defect is worse than an unmarked one because it actively
  spends a future reader's trust). Census: 18 "verified directly"
  sites, mostly BLOCK-LEVEL coverage claims — 4 organs assert EVERY
  citation verified (colon, stomach, pancreas, skin), 11 more assert
  it for whole HISTOLOGY sections. Known defect rate at census: 1/1.
  Rules: verified-marked lines are NOT deprioritised (a defined
  population with known-nonzero defect rate); the population is a
  bounded high-yield sub-batch (each finding retires a false coverage
  claim as well as fixing a defect). A HUMAN ANNOTATION ASSERTING
  CLEANLINESS IS ALSO A CHECK THAT REPORTS ZERO, with the same
  obligation to demonstrate it could have reported otherwise —
  "verified directly" with no record of what was compared is
  unfalsifiable by construction.
  M1 CALIBRATION BATCH (2026-09-04, 12 claims, cross-type,
  verified-marked and unmarked mixed, no prior carried; full table in
  the manifest's _m1_calibration). Surface census first: the real
  on-screen surface is ~336 items (51 shares + 51 facts + 116 ccf +
  118 feature labels), bigger than the contract's "few dozen" guess.
  VERDICTS: 7 verified-quoted (kidneys VHL 86.6% verbatim incl. the
  mechanism phrase; bladder 65.4% + "even distribution" verbatim and
  Allory's 70%/79% cohorts verbatim; liver Katyal 55% verbatim; Hahn
  25/84 verbatim; Rosty 105/757 verbatim; Livasy's four phrases
  verbatim); 2 verified-derived with arithmetic recorded (testis
  64.5% = 22,634/35,066; pancreas ~50% classic from Hahn's two
  counts); 1 CLEAR SCOPE-DRIFT — the testis share generalises a
  Germany-2003-2014 registry proportion with the population qualifier
  silently dropped (copy-edit staged, not applied: calibration
  verdicts are expected to be revised); plus one low-severity scope
  note (kidneys drops "sporadic", which does real work since
  hereditary VHL inactivation is ~100% by definition); 7 sub-figures
  PENDING-FULL-TEXT; 0 failed; 0 not-a-source-claim. METHOD
  CORRECTION AT CALIBRATION, exactly what condition (8) is for: the
  first instinct was to stamp body-bound figures
  unverifiable-by-access — wrong by the contract's own definition,
  because six of the seven have open-access full text (PMC ids
  recorded). State 5 is for UNREACHABLE text; the honest verdict is
  pending-full-text, and the structural lesson is that ~37% of this
  batch's figures live in paper bodies, so M1's reading method
  requires PMC full-text fetch as standard equipment. FIRST EVIDENCE
  ON THE OLD PASS'S METHOD: Livasy, under a HISTOLOGY
  "verified directly" header, has all four quoted phrases verbatim in
  the abstract while its fractions live in the body — consistent with
  quote-checking without figure-checking.
  M1 SPLIT + BATCH 2 (2026-09-04, user rulings after the 336-item
  census). M1a = 51 shares + 51 facts (102 items, the real
  milestone). M1b CENSUS: the two populations are OPPOSITE — ccf
  strings are statistics (105/116 cited, 1 plain and it's an honest
  no-figure disclaimer) and JOIN the claim-read queue; feature labels
  are descriptive (107/118 plain morphology under the block-level
  HISTOLOGY citations, ~11 with own figures) and belong to the
  annotation sub-batch's vocabulary. Effective statistical surface
  ≈ 229 items.
  BATCH 2 TRANCHE (evidence batch, PMC full-text equipment): four of
  the seven pending figures resolve VERIFIED-QUOTED at full text —
  Fontugne "251 (76.5%) had multifocal tumors" of 328 RPs; Waddell
  "31% for SMAD4 (9 structural variants and 22 mutations)"; Cichorek
  "ratio of melanocytes to keratinocytes is 1:10 in the epidermal
  basal layer"; Zhuang "1,116 (51%) with lung metastasis" of 2,197.
  Brenner and Guichard are OA-RESTRICTED in PMC and Livasy has no
  PMC: the batch's three legitimate unverifiable-by-access candidates
  at current equipment (recorded provisional — PMC route exhausted,
  publisher routes not attempted; claims stand). SCOPE RE-CHECKS
  (user rule: batch-1 FIGURES found in abstracts stand and are not
  re-read; SCOPES were provisional by construction because
  populations live in methods): Moore's full text CONFIRMS sporadic
  (507 sporadic RCC / 470 ccRCC) — copy-edit applied, kidneys ccf now
  says "sporadic clear cell renal cell carcinoma"; Rosty and
  Rachakonda scope-ok; Katyal/Hahn/Allory remain provisional (no OA
  text; abstract-level scope consistent). The staged testis edit
  applied with batch-2 confirmation: the share now reads
  "22,634/35,066 in a German 2003–2014 registry". BOOKKEEPING RULE:
  verified-quoted carries sectionsConsulted — the verdict records its
  real strength, not its specified one, same as fieldsChecked.
  HYPOTHESIS SAMPLE RESULT (deliberate test): reachable figures under
  "verified directly" headers went 4/4 CORRECT (Cichorek, Waddell,
  Hahn, Rosty); quotes verbatim everywhere tested; the one known
  defect in the population remains a SCOPE DESCRIPTOR (Paly). The
  "quote-checked not figure-checked" diagnosis is NOT supported by
  figure failures — the demonstrated gap class is scope descriptors.
  REVISED SUB-BATCH INSTRUCTION: under verified headers read
  SCOPE-FIRST with figure spot-checks — inverting the original
  check-figures-skip-quotes plan. Sample is small (4 reachable
  figures): second sample before generalising, per condition (8).
  SCOPE-FIRST PROMOTED M1-WIDE (2026-09-04, user ruling — the
  inversion generalises): every defect found in M1 and testis.js so
  far is a scope drift (Paly, kidneys' sporadic, testis's German
  registry — three for three) against ~17 figures checked with zero
  errors. Mechanically sensible: numbers copy atomically, population
  descriptors get paraphrased, and paraphrase is where qualifiers
  fall out — compression lands on prose, not digits. Also the cheaper
  allocation: a scope check is one methods read; figure-hunting is
  the expensive part. ADAPTIVE GATE rather than a fixed ratio: figure
  spot-check rate tied to the running figure-error count, raised the
  moment one appears — 17-for-zero is suggestive, not settled.
  SECONDARY-SOURCE RULE recorded before the paywalls arrive: a
  primary's figure found quoted in a review or later paper does NOT
  verify the claim — it verifies that someone else read it that way,
  a different assertion (the chain this project already refused twice
  under license-laundering and same-artist). If a secondary is all
  that's available: state 5 WITH the secondary noted as
  corroboration, never verified-quoted with a substituted source.
  Brenner/Guichard/Livasy stay provisional until publisher routes are
  actually tried.
  UNCITED-FIGURE QUEUE-JUMP (2026-09-04): the census's 10 uncited ccf
  figures triaged ahead of M1a — an uncited on-screen number is worse
  than a badly-cited one because it cannot be verified at all, and
  the statistics ruling governs directly. SIX were cited-nearby
  (census false positives: prostate ERG ×2 via the comment trail;
  testis KIT via its fully-cited sibling; thyroid RET/RAS under the
  "All numbers verbatim from TCGA (Cell, 2014, PMC4243044)" block;
  thyroid GENIE ×2 with the database named on-screen). FOUR genuine
  orphans, all breast/ovary pool entries, resolved against the
  canonical TCGA full texts: ovary HRD ~50% VERIFIED ("defective in
  about half of tumors") and RE-SOURCED on-screen to TCGA Nature
  2011 — the ruling's "source it" arm discharged; ovary CCNE1
  "~15–20%" understates TCGA's "greater than 20%" — ADJUST CANDIDATE;
  breast BRCA1 "~15–20% of TNBC" vs TCGA's "~20% BRCA1 OR BRCA2
  combined in basal-like" (gene scope and figure both off) — ADJUST
  CANDIDATE; breast PIK3CA "~39% overall" is TCGA's HER2-ENRICHED
  subtype rate, not overall (the 9% basal-like half of that sentence
  is verbatim-verified) — ADJUST CANDIDATE. Three adjust candidates
  reported, not edited (content changes need the go; each has a
  TCGA-verifiable form). Attaching TCGA to all four would have
  manufactured three confident wrong attributions — the no-shopping
  guard doing exactly its job on the cheapest items in the queue.
  ALL THREE TCGA FORMS ADOPTED AND APPLIED (2026-09-04, on the go):
  ovary CCNE1 → "amplified in >20% of HGSOC tumors (TCGA, Nature,
  2011)" — when an uncited figure disagrees with the canonical
  source, THE FIGURE MOVES; hunting a source that endorses the
  already-written number is citation-shopping in reverse. Breast →
  "BRCA1/2 alteration ... ~20% of basal-like tumors (TCGA, Nature,
  2012)" — the serious one: TNBC and basal-like are NOT synonyms (one
  immunohistochemical, one gene-expression intrinsic; different
  instruments), so presenting a basal-like measurement as a TNBC rate
  was a CATEGORY SUBSTITUTION, not a rounding; the note's TNBC
  mention corrected too, so the substitution doesn't survive in
  prose. Breast PIK3CA → "~9% of basal-like tumors, against 39% in
  HER2-enriched (TCGA, Nature, 2012)" — the re-label makes the
  sentence BETTER, not merely correct: it was always a subtype
  comparison with one side mislabeled "overall", and now both sides
  say what the source measured.
  THE DIRECTION (user ruling, the sharper instrument): all SEVEN
  defects so far drift the same way — 15–20% for >20%; TNBC for
  basal-like; BRCA1 for BRCA1/2 (one gene as a family); "overall" for
  HER2-enriched; Paly's cohort; kidneys' sporadic; testis's registry.
  Seven for seven, every one stating the finding MORE BROADLY than
  the source supports. Uncited figures and scope drifts share one
  mechanism: paraphrase toward the general — compression drops
  qualifiers rather than adding them. The M1a scope question is
  therefore not "does this match" but "IS THIS STATED MORE BROADLY
  THAN WHAT WAS MEASURED": a subtype as overall, a cohort as a
  population, a gene as a family, a registry as the world. COROLLARY:
  a claim NARROWER than its source is surprising and gets a second
  look rather than a pass. All ten uncited-figure items now resolved:
  6 cited-nearby, 1 re-sourced, 3 adjusted-to-verified.
  GUARDRAILS BEFORE M1a (user): (1) QUOTE REQUIREMENT — every
  scope-drift verdict quotes the source's own restricting language
  verbatim; no quotable restriction ⇒ the verdict is VERIFIED, not
  drift (that's a paraphrase the reader is uncomfortable with). Makes
  the difference falsifiable rather than a judgement call at scale.
  (2) PRE-REGISTERED RATE: ~7 defects / ~30 claims ≈ 23%; an M1a rate
  far below means cleaner ground or a reader who stopped looking, far
  above means the prior is doing the finding — either departure gets
  investigated. The pair: one catches over-finding case by case, the
  other in aggregate.
  M1a BATCH 1 (20 share claims, 5 organs; full table in the
  manifest's _m1a_batch1). FIGURES 0 errors in ~14 checks, every one
  verbatim — including the first clean ANNOTATION SPOT-CHECK: Lim's
  in-comment "Verified from the paper's own table" checks out
  completely against the JAMA table. SCOPE: four new drift-causes,
  all with quotable restrictions, all broader-than-measured (the
  direction now 11-for-11): PROSTATE medium ("of prostate cancers" vs
  Siech's "patients ... treated with RP or RT", SEER 2004–2020 — a
  treated-cohort distribution as all prostate cancers); BLADDER
  medium ("~92% of bladder-primary carcinomas" on a FOUR-TYPE
  denominator — "conventional UC, NEC, SCC, and ADC were identified"
  — caught by scope-first where the durability pass's
  figure-verification passed it); BRAIN low (vs "Diagnosed in the
  United States in 2018–2022"); THYROID low (vs "SEER-9 areas during
  1974–2013"). Four causes touch 17 sibling strings; edits reported
  not applied — the qualifier placement across each string family is
  one design decision awaiting the go. Stomach is the exemplar:
  "Korean nationwide surgical survey, N=14,658" carried on-screen.
  RATE: 4 causes / 20 claims = 20%, at the pre-registered ~23% — no
  departure, nothing to investigate. UNRESOLVED: ovary (Peres JNCI is
  OA-restricted — paywalled canonical; 4 sibling shares stay orphaned
  pending an alternative canonical); breast ×4 / kidneys ×3 / liver
  ×2 orphan queue; lungs/colon/pancreas/skin are web-source read
  types, queued.
  QUALIFIER-PLACEMENT PRINCIPLE (user ruling, covers the remaining
  ~80 items): placement follows BIAS vs PROVENANCE. A qualifier that
  changes how the number should be read travels WITH the number,
  inline — one row, or a screenshot of it, must not deliver a
  conditioned figure as unconditioned (prostate's treated cohort;
  bladder's four-type denominator). A where-and-when qualifier that
  doesn't imply the number would differ elsewhere sits once per
  family (brain). PREFER STATING THE DENOMINATOR TO HEDGING IT — the
  PIK3CA move; stomach was already the good form. THYROID SECOND
  LOOK: reclassified BIAS — SEER-9 1974–2013 spans the papillary-
  microcarcinoma overdiagnosis wave and Lim's own headline is the
  papillary-driven tripling across exactly that window, so the pooled
  share mixes eras; inline. Bonus catch: the deaths figure runs on a
  DIFFERENT window (2,371 deaths, 1994–2013) — the anaplastic row now
  carries two windows, one per clause. ALL 14 EDITS APPLIED (bladder
  ×4 denominator-stated, prostate ×5 treated-conditioned, brain ×1
  anchor provenance, thyroid ×4 inline + deaths split). The medium/
  low grading mapped onto bias-vs-provenance exactly.
  THE BLADDER DEMONSTRATION — recorded as the answer to "why not just
  verify the figures": the durability pass verified Park's counts
  verbatim, the M1a re-read verified them verbatim again — figure-
  checking passed the claim cleanly, TWICE — and scope-first caught
  the four-type denominator presented as exhaustive. A demonstration,
  not an argument: number-matching gives false assurance on claims
  already marked checked; the population the number describes is
  where the defects live.
  THE THYROID DEMONSTRATION — the second worked example of a limit on
  the method, recorded beside the first on the user's ruling
  (2026-09-08), and a NEW CLASS: THE ATLAS WAS ACCURATE TO ITS SOURCE
  AND THE SOURCE WAS WRONG. Every defect class before it was
  divergence from a correct source. This is faithful copying of an
  incorrect one: thyroid.js's NRAS branch note carried the GENIE
  metastatic rate as 42.4%, which is what Hsia et al. (J Pers Med
  2025, PMC12843263) print in their abstract — while their Results say
  "27 NRAS mutations (42.2%) among 64 samples" and their Discussion
  repeats 42.2%; 27/64 = 42.19%, and 42.4% matches no count in the
  paper. Verbatim verification PASSES on that line, because "42.4%
  appears in the abstract" is true, and the contract's verified-quoted
  is silent on it by construction. The defect was findable only by
  checking the paper against itself. Bladder showed that
  figure-checking misses scope drift; this shows that verbatim-checking
  misses source error. Same discipline, two different blind spots, both
  now with a case attached rather than an argument. It is also none of
  the three entry-time defect shapes: the attribution is right, the
  pointer resolves, and the content matches its source.
  THE REMEDY GENERALISES INTO A CONTENT CONVENTION (user): WHEREVER THE
  SOURCE GIVES BOTH A COUNT AND A PERCENTAGE, CARRY BOTH, in the same
  parenthetical. Putting 27/64 beside 42.2% did not just fix the line —
  it converted a source-dependent claim into a self-checking one and
  extended fraction_check's reach without touching the instrument: a
  bare percentage is invisible to every guard in the chain, a
  percentage with its fraction is arithmetic that holds itself, and
  27/64 against 42.4% would have fired at authoring time. No
  instrument, no declaration, no ratchet — a form rule that puts
  existing machinery onto claims it cannot currently see. Recorded at
  fraction_check too, where a reader of its reach needs to know that
  the population is partly a function of how claims are written. The
  line was fixed at 80f74fc.
  THE DIRECTION, AS A CONCLUSION: across ~50 claims read, not one has
  turned out narrower than its source — compression toward the
  general, qualifiers dropped never added, a durable property of how
  the atlas was authored. A narrower-than-source claim is anomalous:
  investigate it.
  FIRST COUNTEREXAMPLE (ccf batch 1, 2026-09-06) — the corollary fired
  as designed. colon.js:210 carried Segelman 2012's 8.3% figure as "8.3%
  of all patients" inside a COLON ledger, but the source's denominator is
  all 11,124 COLORECTAL patients in Stockholm County: a claim NARROWER
  than its source, the anomalous direction. Recorded as a counterexample
  rather than filed as wording drift, on the user's ruling, for two
  reasons. It was caught by the corollary that pre-registered it, NOT by
  number-matching — every digit was exact, and what moved was the
  population the number describes, the same failure mode the scope-first
  demonstration above establishes. And for once the bias runs the safe
  way: Segelman makes colonic origin an independent predictor of
  metachronous PC (HR 1.77), so a colorectal denominator UNDERSTATES the
  colon rate. The tally at the moment it was found: thirteen defects,
  twelve broad, one narrow. ONE COUNTEREXAMPLE DOES NOT OVERTURN THE
  CONCLUSION — AN UNEXAMINED ONE WOULD QUIETLY WEAKEN IT, which is why
  it sits here beside the claim it qualifies and not only in the batch
  log.
  SECOND NARROW INSTANCE, AND THE SUB-SHAPE NOW HAS A NAME (ccf batch 3,
  2026-09-06, user ruling). `bladder.js:212` rendered Alessandrino 2020's
  cohort as "a real metastatic cohort" when the source is 103 consecutive
  patients with muscle-invasive urothelial cancer followed by serial
  imaging — 16% metastatic at diagnosis, 37% developing it. A restriction
  ADDED rather than dropped, so it runs the anomalous way, and unlike
  Segelman it is not safe in either direction: it makes the relative risks
  read as pattern-given-metastasis when the denominator may be the whole
  cohort. **TALLY: FOURTEEN DEFECTS, TWELVE BROAD, TWO NARROW.** The same
  edit carried a THIRD instance of one sub-shape, which is now frequent
  enough to name in its own right rather than live as an example of the
  narrow direction: **A BROADER ANATOMIC OR HISTOLOGIC CATEGORY RENDERED
  UNDER A NARROWER ORGAN HEADING** — colorectal-as-colon (Segelman,
  batch 1), colorectal-as-colon again (Li, batch 2, where the population
  qualifier was also dropped), and now urothelial-as-bladder, since MIUC
  includes upper-tract disease and the paper does not say bladder-only.
  Watch for it wherever an organ file cites a study whose own name for the
  disease is broader than the file it sits in; it is invisible to
  number-matching every time, because the numbers are exact.
  **UNRESOLVED ON THIS ONE: Radiology 2020 is not OA and has no PMC full
  text, so whether the RR denominator was the metastatic subset is unread.
  The edit was written to be true either way — the downgrade-is-always-
  available move — which is why the item closed without the fetch.**
- **Tier 3 — CLOSED (2026-09-04), on the outcome its own prompt
  pre-registered as legitimate and final: close-zoom monochrome
  accepted, on a documented citation limit.** The range-capable set fell
  from four organs to three (brain, plus kidneys and breast on qualified
  verification-time records) when prostate's colour citation proved a
  bad attribution — and the two organs the pass most wanted, bladder
  (13th in the audit) and ovary (14th), are unrecoverable: bladder has
  no colour source at all and ovary's descriptor is a point, not a
  range. A delivery bake-off run on three mid-ranking organs would
  choose a mechanism on geometry unrepresentative of the organs that
  need it most — the same reason the pass was held at four. Stated
  plainly, because it is the honest shape of the result: THE CITATION
  DISCIPLINE THAT MAKES THIS PROJECT CREDIBLE IS PRECISELY WHAT
  FORECLOSES ITS MOST-WANTED VISUAL IMPROVEMENT. The albedo gap is real,
  the P5 audit measured it correctly, and the project cannot fill it
  without inventing colour. That is not the discipline failing — it is
  the discipline working, and being expensive. Reopening conditions, for
  the record: a citable colour RANGE surfacing for bladder or ovary
  (nothing in the current queue can produce one), or a policy change on
  illustrative colour variation that only the user can make.
- **Regression harness — `.claude/regress.js` (moved into the repo during the
  Thyroid pass, 2026-09-02; previously lived only at
  /tmp/atlas-verify/regress.js with no git history, rebuilt whenever /tmp was
  wiped).** Usage: `node .claude/regress.js [outDir] [port]` against the
  nocache dev server (port also settable via `ATLAS_PORT`; puppeteer-core
  resolved normally or via `PUPPETEER_CORE`, Chrome via `CHROME_PATH`).
  The move exists because of a closed defect worth remembering: the suite's
  per-organ blown-white checks had passed VACUOUSLY since before the Lungs
  pass — readPixels in a separate evaluate reads a cleared buffer, so
  meshPx was always 0, and pct '0' passes the <1.0% bar. The gap the Lungs
  entry recorded ("that harness never got the preserveDrawingBuffer shim,
  so all 13 of its blown-white checks pass VACUOUSLY on meshPx=0") was
  never fixed in the suite file itself — the shim lived only in scratch
  scripts (bladder_tune.js, thy_shots.js), and every pass since re-derived
  real numbers independently while the standing checks stayed meaningless.
  Fixed in this file: the shim, PLUS a guard requiring meshPx > 0 so a
  zeroed buffer FAILS loudly instead of passing as 0% if this ever breaks
  again. The fixed suite reproduces the Lungs-era one-off almost exactly
  (lungs 2,452 mesh px vs recorded 2,447; ovary halo 0.34% vs 0.36%;
  testis 1.19% vs 1.20%) — and therefore surfaces testis's documented
  angle-dependent ~1.2% blip as a REAL failure. **Baseline is now
  163 checks / 2 failures** (161 + two body-mesh-resolution guards added
  after the Multires-L2 upgrade: they assert 338,720 tris per body through
  the live app — the only guard on body.js's documented silent re-export
  traps now that meshopt hides triangle counts from raw-GLB parsing; a
  wrong-level export passes every other check because markers re-derive by
  raycast). History of the third flag: from the harness fix until the
  pipeline correction (2026-09-03) the baseline was 163/3, the extra
  failure being testis blown-white — documented and accepted below. **The
  pipeline correction resolved it for a pre-flight-predicted reason** (the
  glow+key sum that used to hard-clip sits under the ceiling in linear
  space and compresses under AgX; measured 2.38% → 0.08% at {CM+sRGB}
  alone, 0.00% with the operator; verified 163/2 on the landed bytes with
  testis at 0.00% on 9,860 real mesh px). Flag #3 is therefore fully
  HISTORICAL — the glow lights still exist on testis, they simply no
  longer clip. The two remaining accepted failures: the GBM and
  Prostate/acinar label overlaps (deliberately clustered site designs,
  standing since their own passes) and testis blown-white ~1.2%
  (accepted 2026-09-02 after a diagnostic-only characterization whose
  screenshot packet was scratch outside the repo and is gone — what
  follows is the retained record, and it is the whole basis). The testis
  characterization, proven by isolation rather than inferred: an
  84-sample deterministic angle sweep (harness-verbatim measurement)
  fails only inside one θ15–45° × φ55–85° window — the camera aligned
  with the key light's own (3,4,5) axis (θ31.0/φ55.5) — which CONTAINS
  the default view, hence the suite's reproducible ~1.19%; far side
  0.00%. Glow PointLights off → 0.00%; key light off → 0.03%; material
  specular 0.15→0 → no effect (that candidate eliminated); hiding the
  marker spheres nearly DOUBLES the count because they occlude the
  hottest core — the blown ring sits on the organ surface around each
  marker. Mechanism: the DESIGNED procedural marker-glow halo clipping on
  the atlas's palest procedural albedo (0xd6b98f, R 0.839 × 1.07
  warm-diffuse peak ≈ 0.90 before the teal glow lands). [Historical note:
  this flag originally cited Ovary's 0.34% halo as the living precedent
  for the same mechanism; the Ovary real-mesh swap (rule 29) retired that
  halo — pos-anchored real meshes carry no glow lights — making Testis
  the atlas's ONLY glow-halo organ. The acceptance stands unchanged on
  its own three reasons below, which never depended on Ovary's number;
  the 0.34% figures elsewhere in this entry are historical measurements
  from the harness-fix cross-validation and remain true as records of
  that run.] Accepted because the pixels were looked
  at: smooth radial white→yellow→tan falloff that reads as an
  intentional glow affordance around clickable markers, not broken
  rendering; it is marker-associated light, not tissue-color rendering,
  so no anatomical-fidelity claim is touched; and the scoped-tweak
  alternative (reduce glow 0.5 intensity / 1.2 reach) would spend a
  visual change plus an Ovary re-verify purely to keep the <1.0% bar a
  clean invariant — a testing-tidiness concern, not a quality problem.
  If a future pass changes procedural marker glow, the organ lighting,
  or testis's material/albedo, re-run the sweep (driver pattern:
  /tmp/atlas-verify/testis_sweep.js — freeze autoRotate, spherical
  camera at framed distance, forced render, harness-verbatim readback)
  before assuming this flag still covers the number.** Historical
  Lungs/Colon blown-white claims stand — both had dedicated real-pixel
  measurements outside the suite.
- **Organ mesh source — Breast, added in a later pass (2026-08-27), source
  discipline different from the prior five in a real way, not a footnote:**
  `assets/breast.glb` is NIH 3D's "Human Reference Atlas 3D Reference Object
  Library" entry 3DPX-020977 — CC BY 4.0, confirmed directly on the entry
  page (`creativecommons.org/licenses/by/4.0/` badge link, same pattern as
  every prior organ). Unlike Lungs/Kidneys/Liver/Brain/Prostate, this is
  **not** a Visible Human Dataset trace — it's a custom hand-sculpted model,
  expert-reviewed against two anatomy textbooks (Krstić, *Human Microscopic
  Anatomy*, 1991; Gilroy, MacPherson & Ross, *Atlas of Anatomy*, 2008),
  confirmed directly from the entry page's own description, not assumed from
  the collection level. Attribution (required, quoted verbatim from the
  entry's own attribution-instructions field, not paraphrased): "Heidi
  Schlehlein 2022. 3D Reference Organ for Breast (mammary gland), Female
  left, v1.0, https://doi.org/10.48539/HBM378.VWZG.633. Accessed on December
  15, 2022." Same STL→GLB pipeline as every prior organ: downloaded via the
  same reverse-engineered `api/submissions/<id>/runs/<uuid>/output-files/
  <fileId>` path, verified as a valid binary STL (270,799 triangles,
  file size matching the STL header's own triangle count exactly).
  - **Topology: 52 connected components — investigated before assuming
    either "junk" or "fine," the same discipline Prostate's duct appendages
    got, landing on the opposite conclusion this time.** A scale-relative
    degenerate-face check (median-face-area-based, same corrected method as
    every prior organ) found a negligible 0.063% degenerate rate — no
    repeat of the Prostate false alarm. But 52 disconnected components (vs.
    1 for every prior organ except Prostate's 54) needed a real answer, not
    a guess, before deciding whether to isolate anything out. Component
    bounding boxes showed one large body (128×182×106mm — real breast scale)
    plus many smaller pieces (17-70mm range) all spatially contained within
    that body's own bounding volume — consistent with internal
    sub-structures, not external junk, but not proof on its own. **Confirmed
    via the atlas's own ontology tags** (extracted directly from the entry
    page's embedded metadata, not guessed): 9 distinct real, individually-
    labeled anatomical structures — Areola, left nipple, areolar tubercle
    (a Montgomery gland), mammary lobe, Main lactiferous duct, Lactiferous
    sinus, Set of lactiferous glands, Interlobar adipose tissue, and
    Suspensory (Cooper's) ligament. **Conclusion: nothing to isolate out —
    every component is real, deliberately-modeled anatomy worth keeping**,
    the opposite of Prostate's finding but reached by the same
    investigate-first method, not assumed either way from the component
    count alone.
  - **Weld + smooth-shade (before any decimation) cut the file size the same
    way it did for every prior organ:** welded/smoothed export landed at
    153,585 exported vertices against 135,691 true welded-mesh vertices — a
    1.13x ratio, even tighter than Lung's 1.3x, consistent with a mostly-
    smooth organic surface needing few genuinely hard creases. Final GLB:
    6.94MB, no Decimate modifier applied at all.
  - **Decimation was checked via the real render-cost benchmark, not
    skipped or assumed unnecessary:** a synthetic THREE.js benchmark (same
    method as every prior organ — this app's own rAF loop is unmeasurable in
    this headless preview environment) measured 0.038ms/frame at full
    270,693-face resolution, an order of magnitude under the already-
    negligible numbers every prior organ measured. Combined with a file size
    (6.94MB) already comparable to Brain's post-decimation 7.19MB, the
    benchmark result was the actual basis for not decimating — not an
    assumption carried over from the other four un-decimated organs.
  - **Hotspots re-anchored via the same literal-raycast picker method as
    every prior organ**, landing Ducts/Lobules on the main body surface,
    Nipple-areola complex on the real nipple tip, and Stromal/fatty tissue
    on the real axillary tail specifically (a genuine anatomical landmark
    the old procedural dome had no equivalent for, not just "some point on
    the periphery"). Default camera angle (`theta:0.4, phi:1.05`, unchanged
    from the procedural mesh's own values) was checked exactly like Lungs'
    and Kidneys' were — confirmed by screenshot to already show all four
    hotspots and the real axillary tail on first load, needing no fix this
    time either.
- **Organ library sidebar (2026-08-27) — the app's first persistent cross-screen
  chrome besides the breadcrumb/disclaimer/toast.**
  - **Layout mechanism:** `#sidebar` is a `position:absolute` left rail
    (248px) inside `#app`, a sibling of the three `.screen` divs. On desktop
    (`min-width:641px`), `#app:not(.sidebar-collapsed)` shifts every
    `.screen`'s and `#header`'s `left` to 248px — the screens' width genuinely
    shrinks, no overlay. On mobile (≤640px) the rail is a slide-over drawer
    instead: screens keep full width, the open rail overlays them with a
    shadow, and it starts collapsed (desktop starts open). Collapse hides the
    rail by `transform:translateX(-100%)` — same off-canvas mechanism
    `#txPanel` uses, never `display:none` — with the toggle tab attached to
    the rail's right edge so it rides to the viewport's left edge when
    collapsed. Toggle placement (mid-left vertical tab) deliberately avoids
    the breadcrumb (top-left), `#txLegend` (bottom-left, cancer screen), and
    `#disclaimer` (bottom-right).
  - **Viewer resize on toggle — the one real hazard this feature had:**
    renderers size off `container.clientWidth/clientHeight` and only listen to
    window `resize` (no ResizeObserver), so a sidebar toggle — a layout change
    the window never sees — must push `.resize()` to every live viewer
    itself. `initSidebar`'s second callback does exactly that, once
    immediately and once after the 0.28s `left`/transform transition settles.
    Verified numerically in the live app (1280px viewport, DPR 2): body
    canvas 2064px wide with the rail open (container 1032 = 1280−248), 2560px
    collapsed (container 1280), back to 2064 reopened — the full chain, not
    just "looks right."
  - **Thumbnails are static PNG assets, not live WebGL:**
    `assets/thumbs/<key>.png` (256×256, transparent background so the row's
    own CSS radial-gradient backdrop shows through — the same "specimen
    viewer" background the organ viewer uses). Rendered offline via Blender
    headless from each organ's real shipped GLB + real shipped material color
    + the `warmLighting` recipe (warm key toward (3,4,5), warm ambient,
    shadows disabled to match the app's shadow-mapping-free renderer — the
    same verification-renderer configuration the material-color pass
    validated). Ovary, the one procedural organ, gets an exact Python port of
    `organicDisplace(geo, 0.045, 6.5, 1.7)` plus `buildOvaryMesh`'s real
    scale — the app's actual deterministic sine displacement, not an
    approximation. Static assets were chosen over live-rendered thumbnails
    (reusing `buildMesh` at runtime) deliberately: seven simultaneous small
    WebGL scenes cost seven contexts plus seven GLB fetches (~28MB) just to
    draw 44px images, against this project's consistent
    simplicity-over-runtime-cost preference. Consequence: if an organ's mesh
    or material color ever changes, its thumbnail must be re-rendered by hand
    — there is no build step to automate it. One Blender gotcha recorded so
    it isn't re-discovered: Prostate's mesh is ~5cm across and Blender's
    default 0.1m camera near-clip swallowed it whole at thumbnail framing
    distance (rendered fully transparent, caught by an opaque-pixel-count
    check, not visually) — `clip_start` must be tightened for real-world-
    meter organ scales.
  - **Accessibility, matching the app's existing standard:** every row goes
    through `makeActivatable` (role="button", tabindex="0", Enter/Space),
    with its accessible name from `organActionLabel` — the same helper search
    rows use, so the two never drift. The toggle is a real `<button>` (same
    reasoning as the sex toggle: plain control, no drag gesture near it) with
    `aria-expanded` + a state-describing `aria-label`. `#sidebarInner` gets
    `inert` while collapsed — the rail hides by transform, which alone would
    leave every row focusable (the `#txPanel` trap). The current organ's row
    carries `aria-current="true"`, not just the visual highlight. Tab order:
    the nav sits after the three screens and before `#header` in the markup,
    for the same document-order reasoning as `#header`'s own placement —
    forward Tab reaches screen content first, then the sidebar, then the
    breadcrumb.
  - **Environment note for future verification passes:** CSS transitions do
    not advance in this project's headless preview pane (`document.hidden`
    stays `true` — the same constraint already documented for rAF), so a
    toggled sidebar appears "stuck" mid-transition to computed-style checks.
    Verify layout with transitions disabled (`*{transition:none}`) or in
    headless Chrome, where they run normally; the shipped behavior is fine.
- **Disclaimer overflow fix (2026-08-27, found during sidebar screenshot
  review — a latent bug, NOT a sidebar regression, verified rather than
  assumed from timing):** `#disclaimer`'s citation text has grown with every
  organ pass (seven organs' worth now), and its CSS never had a height cap or
  overflow handling — measured at the pre-sidebar commit directly (a `git
  worktree` of HEAD, served and measured in headless Chrome): 1,597px tall on
  a 900px viewport, top at −715px, towering off the screen and overlapping
  every 3D viewer on every screen. The width was always the designed 260px;
  the defect was unbounded height. It went unnoticed because full-viewport
  desktop screenshots weren't part of any prior pass's verification — the
  sidebar pass's screenshot set was simply the first to make it unmissable.
  Fix: `max-height:38vh; overflow-y:auto` plus `pointer-events:auto` (a
  deliberate flip from `none` — scrolling requires it; the corner stops being
  drag-through for the viewers, the necessary cost of CC BY attribution
  staying reachable, since truncating legally-required credits is not an
  option). `#app.panel-open #disclaimer` now also sets `pointer-events:none`
  so the invisible box can't dead-zone the mutation panel's corner. The
  element gained `role="region"`/`aria-label`/`tabindex="0"` (a scrollable
  region needs keyboard access to meet this app's own bar) and moved from
  first child of `#app` to last — same document-order tab-order reasoning as
  `#header`'s own placement comment; paint position is unchanged
  (`position:absolute`). If the disclaimer keeps growing, the next step is a
  collapsed "Sources" toggle, not a taller cap — deferred, not decided.
- **Ovary real-asset research (2026-08-27) — a third, final check, plainly
  negative, not forced into an integration.** Two prior research passes had
  already found nothing usable (NIH 3D's own low-poly placeholder; Sketchfab's
  real pelvic-organ MRI sets blocked behind a mandatory account signup this
  project does not create unprompted). This pass re-checked both directly
  rather than trusting that prior "nothing found" still holds:
  - **NIH 3D now has a dedicated, real-organ-titled entry** — "Ovary, Female,
    Left" (3DPX-020979) and "Ovary, Female, Right" (3DPX-020980), both HRA,
    both CC BY 4.0, both genuinely Visible Human Dataset-sourced (confirmed
    directly on the entry page, same bibliographic citation as every other
    real-scan organ). This sounded, at first, like exactly the missing
    asset. **Downloaded and checked directly rather than assumed better
    because the sourcing looked right:** the STL is 424 triangles — the same
    low-poly-placeholder tier as what the prior two passes had already found
    and rejected, just reachable under a clearer title this time. Rendered
    (`ovary_left_preview.png`) to confirm visually, not just by triangle
    count: a faceted, featureless almond/pebble shape with zero surface
    detail — visibly *lower* quality than the current procedural mesh's own
    `organicDisplace`-based surface variation, not an upgrade.
  - **Sketchfab re-checked with the "Downloadable" + open-license filters
    applied directly** (not a plain unfiltered search): the same two
    MRI-derived pelvic-organ sets found in the prior two passes ("Bony Pelvis
    and Pelvic Organs from MRI," "Pelvic Organs from MRI") are still the only
    plausible real candidates, and downloading either still requires being
    logged in — confirmed directly this time by opening a result's page
    while logged out and finding no download control rendered at all (only
    Add To/Embed/Share/Report), not inferred from remembering the prior
    passes' conclusion.
  - **Conclusion, stated plainly rather than settled for silently: nothing
    better than the already-known placeholder exists and is downloadable
    without creating an account.** Per the explicit instruction that
    produced this research pass, the fallback taken instead: real anatomical
    *proportions* on the existing procedural mesh, not a real mesh. The old
    `mesh.scale.set(0.9, 1.28, 0.98)` was a near-1:1 width:thickness blob
    despite this same file's own `facts` panel already stating a real
    "~3 × 1.5 × 1cm" size that the geometry never actually matched — an
    inconsistency worth fixing on its own even setting the research aside.
    Re-derived from a source checked directly for this pass (StatPearls,
    "Anatomy, Abdomen and Pelvis, Ovary": 3.5cm length × 2.0cm width × 1.0cm
    thickness — a real, citable figure, superseding the app's own older,
    unsourced "~3 × 1.5 × 1cm" text, which is updated to match). Y stays the
    length axis (matching the existing Hilum hotspot's `dir`, already near
    the -Y pole); X/Z are rescaled to the verified 2:1 width:thickness ratio
    off that same length. `hotspotScale` updated identically so the
    existing `dir` vectors keep landing on the real (now-corrected) surface
    without their own values needing to change. Visually confirmed by
    screenshot: a noticeably flatter, more almond-like shape than the old
    near-spherical blob, closer to what "almond-sized" in this organ's own
    `sub` line has always claimed.

- **Organ mesh source — Colon/Pancreas (2026-08-28): a BETTER pipeline than the
  five originals, plus a deliberate provenance-over-convention call.**
  **SUPERSEDED FOR COLON (2026-09-02): `assets/colon.glb` is no longer this HRA
  asset — see the dated colon-swap entry below (haustra faint / taeniae absent,
  source confirmed exhausted). The pipeline notes here remain accurate for
  Pancreas, and as the historical record of how the colon shipped 08-28..09-02.**
  `assets/colon.glb` (3DPX-021005, Large Intestine, MALE) and
  `assets/pancreas.glb` (3DPX-020983, Pancreas, Female) are NIH 3D HRA entries
  (CC BY 4.0, verified per entry page), but unlike Lungs/Kidneys/Liver/Brain/
  Prostate as built in that pass (Lungs has since left HRA sourcing entirely
  — 2026-09-01 lungs-swap entry) they are the ORIGINAL HRA-authored GLBs served by
  `3d.nih.gov/api/files/<inputFileId>` (the entry JSON at `api/entries/<id>`
  carries the file id) — no STL, no Blender conversion, byte-identical to
  upstream (sha256 84a66fb4… / edb41456…, checkable against the source), which
  preserves the HRA's NAMED sub-meshes the STL route flattens (colon: ten —
  caecum, ileocecal valve, vermiform appendix, ascending/hepatic flexure/
  transverse/splenic flexure/descending/sigmoid colon, rectum; pancreas: five —
  head, neck, body, tail, uncinate process). 34,178 and 12,894 triangles —
  no decimation needed (Prostate ships at a comparable scale and every
  render-cost benchmark so far has been noise-dominated).
  - **Male colon, deliberately — provenance beat the female-variant
    convention:** the female large-intestine model's own documentation says
    verbatim it is "not based on direct imaging data, as no suitable source
    was available at the time," while the male is "primarily based on
    colonoscopy-derived data provided by Arie Kaufman (Stony Brook
    University)." Real imaging won; used generically for both sexes (the
    left-kidney precedent). The pancreas keeps the female convention —
    there, convention and Visible-Human provenance agree.
  - **HRA GLBs are authored in body-space** (each organ's bbox centered where
    the organ sits in a standing body — the pancreas ~26cm above the origin),
    and `applyFraming()` orbits the ORIGIN, so each buildMesh recenters
    `gltf.scene` by its bbox center at load. Hotspot `pos` values are derived
    in that recentered frame — computed directly from the named sub-mesh
    VERTICES (anterior-most vertex near each anatomical target), newly
    possible because the sub-meshes survive, instead of the hand-held raycast
    picker the first five organs needed.
  - **Stomach: procedural, deliberately (Ovary precedent), and the search was
    real:** the HRA library contains NO stomach (confirmed four ways: all 80
    NIH 3D entries enumerated, HRA reference-organs API, HRA LOD catalog,
    live search — the stomach is outside HRA/HuBMAP scope, no ASCT+B table).
    NIH 3D's only stomach (3DPX-021124) has four mutually contradictory
    attributions and GLB metadata exposing a Sketchfab artist sculpt;
    BodyParts3D's is 1,810 triangles with a self-contradictory license (site
    CC BY 4.0, embedded OBJ header still CC BY-SA 2.1 Japan); Z-Anatomy is
    CC BY-SA copyleft. **Best rejected candidate, kept on file:** Open
    Anatomy's SPL Liver Atlas `Model_41_Stomach.vtk` — real CT-derived,
    35,088 points, login-free — but under the 3D Slicer BSD-style license
    whose distribution terms require reproducing the entire license text
    prefaced by a mandated sentence: a second license regime alongside the
    clean CC BY story, left as a user decision, not adopted. The procedural
    build is a swept tube (CatmullRom axis + arc-length-stationed radius
    profile + hemisphere end caps + organicDisplace) sized to VERIFIED
    dimensions — Gray's 1918 J-shape, Cunningham 1905 lengths/diameters,
    greater-curvature 4–5x ratio (see data rule 19) — with two real bugs
    caught by measurement: inverted triangle winding (raycast hit the far
    wall; normals inward) and a radius profile initially indexed by
    control-point number while the curve samples by ARC LENGTH, which slid
    every radius to the wrong station (thin fundus, fat pylorus).
    **Silhouette revision (first review round): the reviewer was right that
    the first build read as a blob, and the root cause was geometric, not a
    tuning nudge** — the tube's end "caps" were single pole-vertex fans,
    i.e. CONES, so a wide fundus end could only ever render as a
    taper-to-a-tip (the wider the radius, the worse; the narrow pylorus hid
    the same defect). Both ends are now real hemisphere caps (three
    intermediate rings + pole, slightly squashed 0.92 along the axis), the
    axis STARTS at the dome's equator (the cap supplies everything above
    it), the radius falloff after the body is much steeper (0.052 → 0.038 →
    0.026 → 0.017 m — the antral narrowing), the axis hook is tighter (the
    lesser curvature goes genuinely concave), and the pyloric tube is longer
    and climbs, ending ~8.5cm above the greater curvature's lowest point.
    Revised measurements, checked not eyeballed: ~29cm axis length — inside
    the 26–34cm range Cunningham attributes to the authorities he surveys,
    just past his own 25–27.5cm headline figure, stated as such — 10.4cm
    greatest diameter, ~11.6cm cardia–pylorus chord. Delta re-verification
    on the live pipeline after the reshape: 4/4 hotspots visible at the
    default rotation, blown-white 0.00%, zero page errors; thumbnail
    re-rendered from the same geometry. Its hotspots use `pos` anchors computed from
    the same parameterization — the `isRealMesh` branch keys on pos-vs-dir,
    not on mesh provenance, so a procedural organ gets frameContents + scaled
    markers + no glow lights (correct: these anchors sit ON the surface,
    where a point light degenerates — see the clip-fix entry).
  - **Thumbnails** for all three were re-rendered with a rewritten Blender
    script (`render_thumb.py`, Cycles, warm sun 0xffddb0 + world ambient
    0xfff1e0, film transparent, 256px), CALIBRATED against the shipped
    liver.png (sun 3.5 / ambient 1.2 / pad 0.74 reproduces its coverage and
    red channel; the shipped thumbs predate the clip-fix specular taming, so
    new thumbs run slightly less white-lifted in G/B — closer to today's live
    look, accepted). Gotchas hit for real: Blender's OBJ import axis options
    do NOT produce the identity you'd expect (the stomach OBJ is exported
    with a 180-degree-about-Z pre-compensation; verified by rendering marker
    spheres at known anatomical coordinates, not by eyeballing silhouettes);
    the glTF import path has no such quirk (verified the same marker way on
    the colon).
  - **Body markers: a raycast trap discovered and worked around** —
    heightFrac values below ~0.46 at moderate off-axis angles let
    `findBodySurfaceAnchor`'s inward ray slip through the thigh gap and land
    on the far buttock surface (wrong side of the body, one or both sexes).
    Found by probing a height/angle grid against both meshes after the
    colon's marker landed mid-pelvis; the colon spec (0.48/-50) was chosen
    from that grid. New-organ markers: pancreas 0.58/0 (epigastrium), stomach
    0.585/-32 (LUQ, mirroring the liver's +40 across the midline per the
    app's existing marker-side convention), colon 0.48/-50. Verified by
    front-view screenshot on both sexes; the tightest marker pair on either
    body remains the pre-existing Ovaries pair.
  - **Site-map `pos3d` design got a real method this pass** (see Known
    limitations): the three new cancers' spreads were optimized for
    PROJECTED separation at the site viewer's default camera (theta 0.6,
    phi 1.15) rather than raw 3D distance, after the colon's first spread —
    3D-min-distance 2.09, matching prior organs — still visually merged two
    blob pairs at the default rotation. Projected min separation now: CRC
    1.75, PDAC 1.68, GDIFF 1.97 units.

- **Organ mesh source — Skin (2026-08-28): procedural schematic cross-section
  block, a NEW rejection class, and the live viewer's first near-plane catch.**
  `buildSkinMesh()` in `js/organs/skin.js` builds four stacked layer slabs
  (epidermis / pigmented basal band / dermis / hypodermis) from shared
  interface-height functions (`surfY`/`dejY`/`dhY` — undulating rete-ridge
  junction, lobular fat boundary), plus two hair follicles with emerging
  shafts (the "this is skin, not geological strata" legibility feature — the
  stomach J-hook lesson applied in advance). The hotspot `pos` anchors are
  computed FROM THE SAME functions at module load (one step stronger than the
  stomach's transcribed-from-parameterization values — they cannot drift).
  Faces get their own vertices per slab (top grid / bottom grid / four wall
  strips) so `computeVertexNormals` keeps the cut edges crisp — the walls ARE
  the cut faces the representation exists to show. Asset decision and layer
  colors are data rule 20's story (measured rejection of the real HRA
  whole-body skin shell; verified white dermis / yellow fat).
  - **Near-plane trap, live-viewer edition:** `makeViewer`'s camera is
    `PerspectiveCamera(38, 1, 0.1, 100)` — near plane 0.1 m. A true-scale 3cm
    block frames the camera ~7cm out, INSIDE the near plane: the mesh
    renders as floating clipped fragments (missing layers, see-through
    gaps). Same class as the Blender thumbnail near-clip gotcha already
    recorded for Prostate, but in the app itself — no prior organ was small
    enough to trigger it (Prostate, the previous smallest, frames at ~21cm).
    Fix: the block renders at `SCALE = 5` presentation scale
    (`group.scale.setScalar`), the one organ whose absolute rendered size is
    deliberately not a real-world claim (the user-facing wording — organ desc
    and disclaimer — states that neither overall size nor layer proportions
    are to scale, broadened from thickness-only phrasing at final review;
    hotspot anchors multiply by the same SCALE since markers are scene-level,
    not mesh children). **If an organ smaller
    than ~8cm is ever added at true scale, this trap fires again — scale it
    or make the near plane adaptive in frameContents (an open, undecided
    alternative).**
  - **Per-sex marker points:** `body.js` now filters a spec's points by an
    optional per-point `sexes` field (one line, backward-compatible; only
    skin uses it — see data rule 20 for the epidemiology and the leg
    marker's geometric side-on-angle necessity).
  - **Thumbnail — the atlas's first multi-material one:**
    `render_thumb_multi.py` (same calibrated recipe as `render_thumb.py`:
    sun 3.5 / ambient 1.2 / pad 0.74, Cycles, transparent film) imports a
    manifest of per-part OBJs exported from the live page with each part's
    own color/roughness, using the stomach pass's verified `v -x z y` OBJ
    axis convention (det +1, no face flip).
  - **Verification (live pipeline):** all four hotspots visible at the
    default rotation; blown-white 0.00% (PIL pixel counts on the headless-
    Chrome screenshot — note the in-page canvas readback used by regress.js
    reports meshPx 0 for this organ, a non-preserved-drawing-buffer
    artifact, so the PIL number is the real one); layer cut-face colors
    pixel-sampled (dermis 0xf2eee6 renders (213,189,158) on the front cut
    face — near the whitest this warm-lit legacy pipeline can show, R/G 1.13
    vs ~1.06-1.10 for a theoretically pure-white albedo); melanoma site
    spread designed by the projected-separation method at 2.15 units
    (best of any cancer); search aliases skin/melanoma/mole/cutaneous/
    epidermis/derm all resolve uniquely; full 11-organ battery 99 checks
    with the only 2 failures the documented GBM/Prostate deliberate-
    clustering flags.

- **Microscopic (histology) view — cancer screen, level 2 (`js/histology.js` +
  a `histology` data block per cancer in each `js/organs/*.js`):** a
  procedurally generated, stylized 2D evocation of each cancer's real,
  documented H&E architecture — the 2D cousin of `organicDisplace`'s
  principle: generate real variation procedurally instead of shipping stock
  imagery (this app has never used any). Key decisions and facts:
  - **Data layer:** each active cancer's `cancerDetails.<id>` carries
    `histology: { intro, ariaSummary, citation, features:[{key,label,text}] }`.
    Every architectural claim was verified DIRECTLY at the source before being
    written in (three parallel research passes with verbatim quotes), same
    standard as every other citation. Notable verification outcomes, recorded
    in each organ file's comment block: HGSOC's "fibrovascular cores" was
    checked and REJECTED (the phrase attaches to low-grade serous and
    endometrial serous descriptions, not HGSOC — the drawing deliberately
    omits a vessel core); the task prompt's suggested HCC pattern percentages
    (~70/20/10/1%) were checked and REJECTED — no source carries them and
    PathologyOutlines' explicit frequency ordering (trabecular >
    pseudoglandular > solid > macrotrabecular) contradicts their implied
    order; the citable HCC frequency facts are "most common" (trabecular),
    "50% of cases have mixed patterns," and macrotrabecular-massive = 12% of
    Ziol et al.'s cohort (Hepatology, 2018) with independently-worse
    recurrence — not "~1%". GBM's necrosis/microvascular proliferation are
    WHO 2021 DIAGNOSTIC CRITERIA (five OR-joined criteria, Louis et al.,
    verified verbatim), not just descriptions — the in-product text says so.
    Prostate's 3→4→5 field is labeled a "schematic composite of the grading
    spectrum," never "a typical field" (verification found patterns genuinely
    coexist — that's why the score sums primary+secondary — but no source
    describes an ordered gradient in one field), and the score wording avoids
    asserting the secondary slot is always second-most-prevalent (needle
    biopsies grade the worst pattern as secondary instead).
  - **Rendering:** seeded SVG generators in `js/histology.js`, one per cancer
    id (`hgsoc/tnbc/luad/ccrcc/hcc/gbm/acinar`), 800×500 viewBox, deterministic
    via `makeSeededRandom(seedFromKey('histology-'+id))`. The H&E palette is
    content color (depicting the stain), deliberately NOT design-system vars;
    the slide is deliberately LIGHT on the dark app because H&E is
    bright-field microscopy — chrome around it stays design-system. LUAD and
    HCC both use multi-pattern honesty framing (LUAD draws three of the five
    WHO patterns as labeled zones — "frequently … complex heterogeneous
    mixtures" per the WHO paper itself; HCC draws trabecular, the most
    common, with the other three named in text).
  - **Interaction/placement:** a view MODE of the cell-scatter level, not a
    fourth drill level — `#txHistologyToggle` (real button, `aria-pressed`,
    visible only at level 2) swaps `#txCellLayer` ↔ `#txHistologyLayer` with
    the same opacity/inert discipline as every other layer swap; breadcrumb
    depth unchanged. Feature labels are `makeActivatable` DOM buttons over
    the SVG; clicking one rewrites `#histInfoCard` (aria-live, same
    reasoning as `#organInfoCard`). Toggling from level 3 dismisses the
    mutation panel first (it describes a cell that's no longer on screen)
    and pins focus back on the toggle, since the panel's own focus-restore
    aims at a cell dot the mode-switch just inerted. `txEnterRegion` resets
    to cells + shows the toggle; `txGoLevel(1)` resets + hides it.
    In hist mode the site legend, center caption, and floating disclaimer
    are hidden (`#screenCancer.hist-open` CSS) — the legend keys the 3D site
    map, the caption belongs to the cell view, and the disclaimer follows
    the exact `#app.panel-open` precedent (the card carries its own citation
    plus a fixed "stylized illustration … not a real patient micrograph"
    line, data rule 2 applied to a visual).
  - **Accessibility:** the SVG gets `role="img"` + `ariaSummary` (a real
    textual walk of what's drawn — the non-sighted user's equivalent of the
    visual, not just labeled points); the slide wrapper stays `role="group"`
    (NOT `role="img"`) for the same collapse-the-buttons trap documented on
    every viewer wrapper.
  - **Bugs caught during this pass's own verification, all fixed:** GBM's
    top-left vascular tuft and Prostate's cribriform lumens were initially
    hidden under their own centered labels (anchors moved off the
    structures; prostate's lumens also enlarged/densified — a near-solid
    cribriform mass would depict pattern 5 in the pattern-4 slot);
    mobile (≤640px) had the wrapped 4-line breadcrumb clipping the slide and
    the disclaimer overlapping the card (layer pins below crumbs +
    scrolls, touch-only by design since desktop never overflows); the cell
    layer's caption ghosted through the transparent layer gap. One
    harness-only artifact worth knowing: puppeteer's `isMobile` viewport
    switch RELOADS the page mid-session — a programmatic `.click()` on the
    then-hidden toggle threw on `CANCER_DETAILS[null]`; unreachable by real
    interaction (hidden buttons take no clicks/focus) but guarded anyway in
    `enterHistology`, and the null===null path through the
    `builtForCancerId` check was the subtle part.

- **Real-tissue material colors + warm organ lighting (commit `1162e51` — this
  entry was written retroactively during the clip-fix pass below, which found
  the history had never been recorded here despite the pass's own
  documentation standard):** every organ's material color was replaced with a
  verified real-tissue tone, each cited to a real gross-anatomy source in its
  own organ file's comment (Brain: LMU Pressbooks; Lungs/Kidneys/Prostate/
  Ovary: Monash Pathology / PathologyOutlines.com / IMAIOS; Liver: Johns
  Hopkins + BCcampus; Breast: MGH Pathology), replacing colors that measured
  as washing toward neutral gray before lighting was even applied. Added the
  `warmLighting` opt-in to `makeViewer` (organ viewers only — body and
  tumor-site viewers keep the cool/teal look; the color-management pipeline
  decision stays parked). Verification was Blender-based numeric pixel
  sampling (the pane's rAF constraint); the approved review artifacts were
  those Blender renders — a method gap the clip-fix entry below turned out to
  hinge on.

- **Organ-viewer clip-fix pass (blown-white concave patches — root cause was
  NOT the reported hypothesis, and NOT a regression):** hard-edged white
  patches in concave regions (lung fissure, areolar indent, prostate's medial
  fold, brain sulci, kidney's medial notch) were reported as a suspected
  ambient-light regression from the sidebar/histology commits. Investigated
  per the evidence, not the hypothesis:
  - **Not a regression:** `git diff 1162e51..HEAD` touched no lighting or
    material code, and a git-worktree of `1162e51` measured statistically
    identical blowout (lungs 25.8% of on-screen mesh pixels pure white vs
    26.3% on HEAD) — latent, not introduced.
  - **Not (primarily) the warm lights, and not specular:** lowering warm
    ambient+key from 0.55/0.9 to 0.42/0.65 (diffuse peak 1.45→1.07, below
    clip for every verified albedo) helped only the lungs; rebalancing toward
    ambient made things WORSE (higher diffuse floor = more area near clip);
    porting the approved Blender model's specular reduction
    (`MeshPhysicalMaterial` + `specularIntensity:0.15` — the Blender
    verification always had Specular IOR 0.15, but `MeshStandardMaterial` has
    no specular control, so the live app never got that half of the approved
    material) barely moved brain/kidneys. Each hypothesis measured, kept for
    its own justification, but none was the driver.
  - **Actual root cause: the per-marker teal glow `PointLight`s.** Each organ
    hotspot ships a 0.5π-intensity teal point light; the real-mesh port set
    its reach to `meshBoundingRadius * 2.4` — the procedural original was
    1.2 units on ~1.3-unit organs, a DESIGNED ratio of ~0.9× — so four teal
    floodlights washed the whole organ. Worse, real-mesh markers sit at
    raycast points exactly ON the surface (procedural markers float 4% above
    a smooth convex ellipsoid), so concave walls hugging a marker receive the
    light at distance ~0: full intensity under any falloff, unbounded grazing
    specular, and additive teal (strong G+B) on warm-lit tissue (R already
    near clip) = all three channels clipped = flat white. Kidney was worst
    because all four of its markers cluster in the medial notch. Intensity
    reduction (0.5→0.18) was tried and measured: plateaus shrank but stayed —
    no intensity fixes a distance-zero light.
  - **Fix:** glow lights removed for real-mesh organs (kept, untouched, for
    the procedural Ovary — convex, floating markers, measured 0.0-0.5% and
    looks as originally designed); warm lights 0.42/0.65;
    `MeshPhysicalMaterial` + `specularIntensity:0.15` on all seven organ
    materials (colors/roughness untouched). Dropping the marker lights moves
    the live app TOWARD the approved material-pass renders, which modeled
    ambient+key only — no marker lights ever appeared in an approved artifact.
  - **Result, measured in the live pipeline (puppeteer + PIL pixel counts,
    not Blender):** blown-white pixels 26.3%→0.0% (lungs), 24.5%→0.0%
    (brain), 8.6%→0.0% (kidneys), 8.2%→0.0% (prostate), 5.4%→0.0% (breast),
    2.9%→0.0% (liver); ovary 1.7%→0.5% (designed glow halo). Midtone hue
    ratios verified in-family with each organ's cited tissue target (e.g.
    brain R/G 1.76 vs target 1.72). Marker activation, drag-vs-click, and
    organ→cancer navigation regression-checked on a real-mesh and a
    procedural organ; zero page errors.
  - **Verification-method note for every future organ-look pass:** the
    material pass's approved artifacts were Blender approximations that (a)
    had tamed specular the app lacked and (b) modeled no marker lights — two
    gaps that together hid all of this. Organ-look changes must be verified
    against the LIVE pipeline (puppeteer headless renders rAF/WebGL fine;
    the in-app pane does not), with pixel sampling, before approval
    screenshots go out.

- **Material/lighting realism pass — roughness, specularIntensity, per-vertex
  tissue mottle, all nine real-scan organs (2026-08-31; reviewed and approved
  on the before/after screenshots per this project's own oldest standing rule,
  committed together with the Bladder mottle-frequency tune below. Lungs'
  file itself ships in the FOLLOWING commit: the lungs mesh swap developed
  alongside this pass replaced its material with the new asset's native baked
  textures, superseding this recipe for that one organ — see the lungs-swap
  entry added there):**
  - **Scope:** brain, lungs, breast, liver, kidneys, prostate, colon,
    pancreas, bladder — every real-scan `MeshPhysicalMaterial` organ.
    Deliberately NOT touched: Ovary/Skin/Stomach/Testis (still procedural)
    and the tumor-site blob material in `main.js`'s `initSiteViewer`
    (confirmed untouched by `git diff --stat` before this entry was written).
  - **The recipe, applied as shared PARAMETERS only — each organ keeps its
    own verified color and its own roughness/specularIntensity starting
    point, the same convention `specularIntensity:0.15` already set in the
    clip-fix pass above:**
    - Roughness × 0.82 per organ (glossier, ordering preserved): brain
      0.70→0.57, lungs 0.65→0.53, breast 0.60→0.49, liver 0.50→0.41, kidneys
      0.55→0.45, prostate 0.60→0.49, colon 0.60→0.49, pancreas 0.62→0.51,
      bladder 0.58→0.48.
    - `specularIntensity` 0.15→0.25 (uniform), tighter/brighter highlights.
    - New `applyTissueMottleVertexColors(geometry, seed, opts)` (`viewer.js`,
      next to `applyMottleVertexColors`) — amplitude 0.28, freq 13 (shared
      defaults) on all nine; only `seed` differs per organ (1.3/2.6/3.9/
      5.2/6.5/7.8/9.1/10.4/11.7 for brain/lungs/breast/liver/kidneys/
      prostate/colon/pancreas/bladder — organ's position in `ORGAN_MODULES`
      × 1.3, deterministic-but-arbitrary, not tuned per organ).
  - **Why (1) and (2) are the risky half, checked with that risk in mind, not
    tuned once by eye:** this pipeline still has no tone mapping
    (`ColorManagement.enabled=false`, `LinearSRGBColorSpace` out, per the
    top of `viewer.js`), so it still hard-clips at 1.0/channel exactly the
    way the clip-fix entry above found. Breast's `0xe3d3a0` is this atlas's
    palest verified channel (R 0.89 — the same figure the clip-fix pass's own
    warm-lighting comment cites) — at the current warm ambient+key (0.42+0.65
    = 1.07× peak), that's 0.952 diffuse before specular even lands, ~0.048 of
    headroom. Lower roughness concentrates the same specular energy into a
    smaller, brighter peak rather than spreading it out — it does NOT reduce
    clip risk, it raises it, on top of specularIntensity's own direct
    increase. Both were verified iteratively against the live pipeline, not
    assumed safe by analogy with the already-fixed clip-fix numbers.
  - **Mottle is clip-safe by construction, and deliberately NOT a port of
    `applyMottleVertexColors`' lerp-toward-necrotic technique:** vertex
    colors and `material.color` multiply in this renderer's fragment shader
    (`diffuseColor.rgb *= vColor`), so baking each organ's own real hex into
    the vertex-color attribute (the necrotic-mottle function's approach)
    would square that color at every unmottled vertex — silently darkening
    the WHOLE mesh, not just the patches; the tumor-blob material never sets
    its own `color` for exactly this reason (defaults to white, so
    `material.color * vColor === vColor`). `applyTissueMottleVertexColors`
    instead writes a plain `(m,m,m)` gray MULTIPLIER, `m<=1` always, on top
    of each organ's own untouched `color:` — 1.0 (no change) across most of
    the surface, dipping toward `1-amplitude` inside patches. A multiplier
    that can only ever be ≤1 can only ever reduce a vertex's brightness
    relative to the unmottled base — provably unable to push a pixel closer
    to this pipeline's 1.0 clip ceiling, independent of the roughness/
    specularIntensity risk above. Also recenters against each sub-mesh's OWN
    bounding box rather than normalizing raw vertex position to a unit
    sphere the way the tumor-blob version does (correct only because that
    geometry is a freshly-constructed Icosahedron always centered at its own
    origin) — colon.js and pancreas.js recenter the gltf *node*, not the
    underlying `BufferGeometry`'s own position attribute, which stays
    ~19-26cm off-origin in HRA body-space; feeding that raw offset into the
    same sin/cos basis would have biased the pattern into a narrow slice of
    the curve instead of spreading patches across the surface.
  - **Transmission — investigated directly, not shipped:** `makeViewer` sets
    neither `scene.environment` nor `scene.background`, and the renderer is
    `alpha:true` with nothing behind these meshes in the WebGL scene itself
    (confirmed by reading `viewer.js` directly; the visible gradient behind
    each organ canvas is a CSS background on the DOM container, invisible to
    three's own render). Tested live on the Kidneys viewer at two settings —
    `transmission:0.15/thickness:0.05/ior:1.4`, then a deliberately extreme
    `transmission:0.7/thickness:0.3/ior:1.4` — and both were pixel-for-pixel
    indistinguishable from the untouched baseline by eye, with identical
    blown-white/dark-pixel counts. Not shipped on any of the nine organs:
    with a measured null effect, shipping it would misrepresent this pass's
    own recipe as doing more than it does. Matches this same file's earlier
    B.3 diagnostic finding (`cancer-atlas-lungs-realism-diagnostic` packet)
    that `transmission`/`thickness`/`ior` are real, available properties in
    this exact three@0.185.1 build and simply unused — now confirmed unused
    for a specific, tested reason rather than left as an open question.
  - **Clipping verification, iterative, measured in the live pipeline** —
    puppeteer + real headless Chrome, same discipline the clip-fix entry
    above established, plus one new harness finding worth recording for the
    next pass: reading pixels back via a separate `page.evaluate()` call
    reliably returned all-zero `(0,0,0,0)` on every organ despite the model
    rendering correctly in a `page.screenshot()` of the same frame — Chrome
    is free to clear/discard the WebGL drawing buffer any time after it is
    presented when `preserveDrawingBuffer` defaults to false, and by the
    time a later CDP task runs, several `rAF` ticks have already gone by.
    Fixed with a harness-only `getContext` shim forcing
    `preserveDrawingBuffer:true` on every WebGL context the page creates —
    does not change what the app itself renders, only whether the buffer
    survives being read after the fact. With that fix: all nine organs
    measured 0.00% blown-white across a ~44° autoRotate sweep (5 samples,
    2s spacing); the three worst organs from the original clip-fix pass
    (lungs 26.3%, brain 24.5%, kidneys 8.6% pre-fix) plus breast (this
    atlas's palest verified channel) were additionally swept ~198° (12
    samples, 3s spacing, over half a full rotation) — still 0.00% on all
    four. Real, unused margin, not a knife-edge pass.
  - **No organ needed different numeric treatment to clear the clip bar —
    all nine pass under the identical shared parameters with real margin.**
    One purely aesthetic (non-clipping) observation, stated plainly rather
    than smoothed over: Bladder's mottle reads visibly denser/more
    "stippled" than the other eight in side-by-side screenshots. Its GLB is
    the smallest and almost certainly lowest-vertex-density asset here
    (199KB total vs. Liver's 1.7MB) — the shared spatial frequency (13)
    under-samples on a sparser mesh, producing a more faceted, dot-like
    pattern rather than the smoother patches visible on denser meshes like
    Liver or Breast. Not a numeric exception (same amplitude/freq/formula as
    every other organ) — a mesh-resolution interaction worth knowing about,
    not a defect worth re-tuning this pass's shared recipe over.
    (RESOLVED in review before commit: the reviewer asked for a Bladder-only
    frequency tune — freq 13 -> 4 on Bladder's own call site, shared
    function/amplitude/every other organ untouched — live-probed smooth and
    organic across 4 rotation angles, 0.000% blown-white across 5; the
    dot-grid read is gone.)
  - **Regression suite, rebuilt fresh** (this pass's own
    `/tmp/material-pass/regress.js`, not a checked-in harness): 138 checks
    across all 13 active organs (mesh renders, blown-white <1.0%, 4
    hotspots), all 14 active cancers (4 site labels, no label overlap except
    the two documented exceptions below, ≥20 sampled cells, mutation panel
    has "Trunk" and no "undefined", ≥3 histology features), and 17
    alias-search terms — 137 passed. The two documented pre-existing
    label-overlap exceptions (GBM and Prostate/acinar, both deliberately
    clustered per this file's own "Tumor-site blob positions" entry) were
    excluded from the overlap gate rather than allowed to fail it, per that
    entry's own standing rule. **One new finding surfaced, and left
    unfixed as out of scope:** `organ:testis blown-white <1.0%` failed at
    one sampled rotation angle (1.209%). Confirmed via `git diff --stat`
    that `testis.js` (and `ovary.js`/`skin.js`/`stomach.js`) are completely
    untouched by this pass; a dedicated 20-sample/28.5-second sweep on
    Testis alone shows blown-white oscillating between 0.01% and 1.2%
    depending on rotation angle — a genuine, pre-existing, angle-dependent
    characteristic of Testis's own procedural material and the shared
    cool-lighting rig it uses (not `warmLighting`), surfaced only because
    this pass's harness samples multiple rotation angles rather than one
    frame. Testis is explicitly out of scope for this pass (procedural, not
    one of the nine real-scan organs) — flagged here for whoever next
    touches that organ, not fixed under this pass's own mandate.
  - **Two harness-methodology alias-search failures caught and fixed before
    they were mistaken for regressions, recorded because the next pass will
    hit the same traps otherwise:** an early harness version reported every
    one of the 17 alias-search checks as a zero-match failure — root cause
    was running those checks with `#screenCancer` still active, at which
    point `#searchInput` (which lives inside `#screenBody`, per
    `cancer-atlas.html`) sits `inert`; fixed by reloading to the body screen
    first. A separate early version reported "mutation panel has Trunk"
    failing on every cancer but one — root cause was reading
    `#txPanelBody.innerText` (which reflects the rendered, CSS-transformed
    text: `.grp-title` renders as "TRUNK MUTATIONS" via `text-transform:
    uppercase`) against a case-sensitive `/Trunk/` regex; the one apparent
    pass was a coincidental match against an unrelated, properly-capitalized
    "Trunk panel" cross-reference inside Bladder's own prose note, not the
    check actually working. Fixed with a case-insensitive `/trunk/i`. Neither
    was a real app defect at any point.
  - **Alias-check wording departure, stated rather than silently
    mis-implemented:** the task brief for this pass asked for "zero
    collisions" across 17 alias terms including "adenocarcinoma" and "clear
    cell" — but this file's own Architecture notes (index.js's own comment)
    already document both as DELIBERATE multi-organ matches (adenocarcinoma:
    Lungs/Colon/Pancreas/Stomach, all four real aliases; clear cell:
    Kidneys/Ovaries, both real clear-cell carcinomas). Verified directly
    against every organ's own `aliases` array before writing the harness,
    not assumed from the brief. The regression suite instead asserts the
    exact expected matching organ SET per term (the documented multi-organ
    set for "adenocarcinoma" and "clear cell", a single-organ set for every
    other term) — a strictly more precise check than "zero collisions" that
    doesn't flag this app's
    own by-design behavior as broken.

- **Lungs mesh swap — "Realistic Human Lungs" (neshallads, Sketchfab) replaces
  the HRA/VHD-derived lungs.glb (2026-09-01; developed alongside the
  material/lighting realism pass above and committed as its own commit
  immediately after it, following the same human screenshot review — this
  commit also carries the post-review 2048->1024px normal-map downscale,
  A/B-verified indistinguishable, 14.9MB -> 9.4MB):**
  - **Why:** the HRA lung mesh has no interlobar fissures — the most
    identifying external feature of lung anatomy — and the HRA library has no
    other lung asset (exhausted, not under-searched). The replacement has the
    fissures SCULPTED INTO THE GEOMETRY, verified by flat-shaded renders and
    concave-crease tracing, not read off a thumbnail: a deep oblique plus a
    subtler mid-height horizontal fissure on the right lung (two =
    anatomically correct), one oblique groove on the left; each lung stays
    one watertight piece (grooves, not disconnected lobes).
  - **Source/license:** "Realistic Human Lungs" by Sketchfab user neshallads
    — license quoted verbatim on its model page ("CC Attribution / Creative
    Commons Attribution", i.e. CC BY 4.0; attribution legally required).
    `#disclaimer` updated: lungs removed from the NIH-3D/VHD credit list
    (kidney/liver/brain/prostate stay), new credit + model URL added
    (sketchfab.com/3d-models/realistic-human-lungs-ce09f4099a68467880f46e61eb9a3531).
    **Texture tone caveat: the baked color is artist-authored, not
    color-verified the way the previous flat hex was — see data rule 25, the
    standing record of that accepted limitation.**
  - **Build (Blender 5.2 headless, script pattern cribbed from the bladder
    pass's component analysis):** import source GLB (17.1MB, two mesh objects
    24,166 + 9,288 raw verts) -> weld each object (remove_doubles, threshold
    = bbox_diagonal x 1e-5) -> separate by loose parts -> identify the 5 TRUE
    components BY WELDED VERTEX COUNT (object names after separation are
    unreliable): trachea+main bronchi 13,215v KEEP; larynx 5,396v DROP;
    thyroid gland 4,513v DROP; left lung 4,461v (bbox center x>0) KEEP;
    right lung 4,412v (x<0, and larger than the left in every bbox dimension,
    matching real right-lung anatomy) KEEP. Sidedness asserted in-script, not
    assumed. Imported materials/textures untouched. Centering BAKED into the
    export (world-bbox center -> origin, verified by re-importing the
    exported file: center (0,0,0), glTF-frame dims 0.2233 x 0.3687 x
    0.1423m) — matching lungs.js's own convention (the old lungs.glb was
    origin-centered too; buildLungsMesh has never done the
    gltf.scene.position.sub(center) node-recenter colon/pancreas need).
  - **A Blender API trap caught mid-build, recorded so the next mesh pass
    doesn't re-learn it:** `Object.bound_box` does NOT refresh after directly
    editing `mesh.vertices[i].co` (even after `mesh.update()`) — the first
    anchor pass silently filtered vertex height-bands against pre-shift bbox
    limits and landed two "fissure" candidates on the apex band and the
    cardiac impression instead. Every geometric query was redone against
    bboxes computed from the vertex data itself, on the re-imported exported
    GLB, so the shipped anchor coordinates are provably in the file's own
    frame.
  - **Size, flagged rather than hidden: 14.9MB, vs the old mesh's 3.5MB —
    a 4.2x asset-weight increase and this app's largest file.** Textures
    dominate (13.6MB of the 14.9; over half of that is the two 2048px normal
    maps at 3.4MB + 5.1MB). Deliberately NOT recompressed in this pass —
    that's an owner decision, and the two normal maps are the obvious first
    lever if it has to shrink. The kept subset did shed the larynx/thyroid
    GEOMETRY, but not their texture bytes: both dropped components share the
    airway's material and texture atlas, so no image could drop out of the
    export (the 17.1 -> 14.9MB saving is geometry plus glTF re-packing only).
  - **Materials — the one real-mesh organ OFF the shared recipe (owner
    decision made before integration, not an omission):** buildLungsMesh no
    longer overrides the imported material with the flat verified-hex
    MeshPhysicalMaterial and no longer calls applyTissueMottleVertexColors —
    that recipe exists to fake surface variation on untextured scan geometry,
    and this asset ships real baked color/normal/AO/specular maps that a
    painted-on gray-multiplier mottle would fight. The material-pass entry
    above still says "all nine real-scan organs" — true when written; as of
    this entry lungs runs on the asset's own materials and the other eight
    are untouched (verified by git diff scope: this pass edits lungs.js
    only among organ files). The GLB carries KHR_materials_specular, so
    GLTFLoader builds MeshPhysicalMaterial with a real per-texel
    specularIntensity map — the imported material arrives WITH the specular
    control the clip-fix pass had to add by hand elsewhere. The verified
    dusty pink-gray 0xb08d90 now lives only in the sidebar thumbnail
    (re-rendered via `.claude/render_thumb.py`, which renders every organ as
    its flat tissue hex by design).
  - **Color space — tested live, both ways, numbers recorded (the trap the
    pipeline comment at the top of viewer.js implies but had never hit,
    because no organ had textures before):** this pipeline never re-encodes
    output (ColorManagement off, LinearSRGB out, no tone mapping), but
    sRGB-TAGGED TEXTURES STILL GET GPU-DECODED to linear on sampling — so
    GLTFLoader's default sRGB tag on the baseColor map gamma-crushes the
    baked colors exactly once, with no round trip. Measured on the live
    default view: loader default = mesh mean RGB (118,35,34), a dark
    oversaturated blood-red, R/G 3.4; `map.colorSpace = THREE.NoColorSpace`
    = (153,80,73), R/G 1.9 — matching the model's authored soft mottled
    pink-red (its own textures under neutral Cycles light in this pass's
    build renders). NoColorSpace shipped — the same untouched-bytes
    treatment every hand-picked hex in this app already gets under this
    pipeline (LinearSRGBColorSpace on the map would behave identically;
    NoColorSpace is the explicit opt-out). Side-by-side capture in the
    review packet.
  - **Hotspots re-anchored; labels and educational text untouched (all four
    are source-verified and did not move):** anchors derived GEOMETRICALLY in
    the build scripts and verified per-anchor against their own geometry (the
    Bladder lesson), then re-checked numerically in the LIVE app against the
    loaded GLB (nearest-vertex distances: alveoli/pleura/hilum 0.05-0.08mm =
    exact mesh vertices; bronchi 1.1mm = the airway component's vertex
    centroid, an interior reference point inside the trachea). Bronchi =
    airway vertex centroid (just above the bifurcation); Alveoli =
    most-lateral left-lung vertex in the lower-middle height band (the
    periphery its text describes); Pleura = a vertex ON the right lung's
    oblique fissure groove — found by concave-crease clustering (signed
    dihedral angle < -0.30 rad) after hull-depth search proved the wrong
    tool (the mediastinal/cardiac concavity out-deepens the fissures on BOTH
    lungs, ~38-39mm vs the fissures' 2-4mm groove depth), then confirmed with
    marked renders; anatomically honest placement too, since the visceral
    pleura lines the interlobar fissures. Hilum = the right-lung vertex
    nearest the airway component (0.5mm gap — literally where the bronchus
    meets the lung). All four dots on-screen at the default camera, verified
    live (and re-verified by the regression harness's own visibility check).
  - **Viewer params re-derived by the Bladder convention (old value x
    bbox-largest-dim ratio, not fresh guesses):** old mesh 0.2511m largest
    dim -> new assembly 0.3687m = x1.468: minRadius 0.15 -> 0.22, maxRadius
    1.2 -> 1.76, nominal radius 0.5 -> 0.73 (moot once frameContents runs).
    viewerAria rewritten to describe what is now actually on screen (paired
    lungs joined by trachea/bronchi, visible fissure grooves) — a visual
    description, not sourced medical content, so it tracks the model.
  - **Verification, live pipeline (puppeteer + real headless Chrome against
    the repo's own nocache server, per the standing verification-method
    rule):** blown-white 0.000% at all 10 sampled rotation angles including
    vertical tilts (preserveDrawingBuffer shim active; real mesh-pixel counts
    1,574-2,776 per frame, not a zeroed buffer). Full regression
    (/tmp harness, 146 checks): 2 failures = exactly the two documented
    pre-existing GBM + Prostate/acinar label-overlap flags. One harness gap
    found while running it, worth recording: that harness never got the
    preserveDrawingBuffer shim, so all 13 of its blown-white checks pass
    VACUOUSLY on meshPx=0; re-run with only the shim added: lungs 0.00% on
    real 2,447 mesh px, every other organ 0.00% except Ovary's designed
    0.36% glow halo and the already-documented angle-dependent Testis 1.20%
    (testis.js untouched by anything in this working tree). Before/after,
    close-zoom, and rotated fissure-silhouette screenshots (the fissures
    being visible is the point of the whole swap) went to a scratch
    directory outside the repo and are gone. The numbers above are the
    retained record, and the mesh those shots depicted is tracked at
    `assets/lungs.glb` (swapped in at f358c0a), so the fissure claim is
    RE-CHECKABLE rather than resting on lost images — which is the
    difference between an ephemeral pointer that costs nothing and one
    that strands a claim. Writing a scratch path into this file promises
    retrievability that a scratch location cannot keep, so DESCRIBE what
    was measured and name where the subject lives instead — stated as an
    instruction, because "later entries do this" would be a claim about
    this repo's own contents of exactly the kind 6e3c310 had to drop. A
    check that every path-shaped reference here resolves on disk was
    CONSIDERED AND DECLINED: it would read this machine's `/tmp` and home
    directory, so it could never be green on a fresh clone, and a gate
    that cannot pass for a new contributor is worse than the defect. The
    cost of declining is that the next such pointer also goes unguarded,
    which is what makes this note the mechanism.

- **Colon mesh swap — "Small and large intestine" (antonia.sundberg, Sketchfab)
  replaces the HRA large-intestine model (2026-09-02; developed directly after a
  landmark-fidelity audit of the five unaudited real-scan organs — Brain/Kidneys/
  Liver/Pancreas passed, Colon was the one failure):**
  - **Why:** the HRA colon models the tube's path and caliber but its haustra are
    only FAINT (soft bulges, not crisp pouches) and its taeniae coli are ABSENT —
    while colon.js's own Teniae hotspot text and viewerAria described a
    "segmented, haustrated" silhouette. (The landmark-audit packet's own claim
    that "no hotspot references taeniae" was WRONG — corrected there; the gap was
    a real content mismatch, not just visual fidelity.) Source confirmed
    exhausted before replacing: never decimated (shipped file WAS upstream), and
    HRA's newer large-intestine v1.3 hash-matches v1.2's vertex data exactly
    (position md5 8b4d2481..., both) despite a changed filename prefix.
  - **Source/license, double-checked:** "Small and large intestine" by Sketchfab
    artist antonia.sundberg — the file's own embedded asset.extras says
    "CC-BY-4.0" AND the live model page says "CC Attribution / Creative Commons
    Attribution" (both read directly). Made for a scientific-illustration course
    at Malardalen University. Disclaimer updated: colon credit swapped to
    sundberg with model URL; Pancreas keeps its HRA/DOI credit (the old combined
    colon+pancreas sentence was split).
  - **Build (Blender headless):** only the two Tjocktarm (large-intestine) meshes
    used; Tunntarm (small intestine) dropped (lungs larynx/thyroid reasoning).
    The two Tjocktarm meshes join+weld to exactly ONE connected component
    (109,400 -> 102,178 verts; 7,222 UV-seam duplicates — the lungs 16/7 false-
    split pattern again), i.e. one continuous cecum-to-rectum tube with real
    geometric haustra, a modeled taenia band, appendix and rectum. Centered to
    origin, scaled 0.000968 to calibrate frame height to the old real-scale
    asset's 0.45m; final dims 0.396 x 0.45 x 0.195m.
  - **TWO REAL BUGS caught during the build, both worth the record:** (1) the
    source's FBX empty hierarchy carries ancestor scales (0.1 and 0.037) that
    transform_apply does NOT bake — the first export rendered at ~1.7mm world
    size, caught by an in-app probe showing camDist(0.22) INSIDE the mesh's
    bounding sphere; fix = unparent + delete empties before export. (2) my own
    "authoritative" GLB verification parsed accessor min/max (vertex space)
    without walking node transforms — it validated a microscopic asset. The
    verifier now multiplies through the exported hierarchy; standing lesson:
    accessor bounds are NOT world bounds.
  - **Materials — decided by live A/B, not lungs analogy:** native baked
    textures kept BECAUSE the source carries a real 2048px normal map on a
    second UV set (per-texel detail, the lungs justification class) and the
    recipe path rendered visibly flatter in the haustral creases; the recipe
    variant was actually rendered and compared, not assumed worse. Same
    sRGB-tag gamma-crush as lungs, same fix (map.colorSpace = NoColorSpace;
    mesh mean RGB (101,36,25) -> (143,83,63)). Tone is artist-authored, NOT the
    verified 0xc99f92 serosal pink — data rule 26 is the standing record.
  - **Orientation verified by x-sign color-coded flat renders, not camera
    algebra:** cecum+appendix at x<0 = patient's right = viewer-left at the
    default camera; descending x>0; transverse top; rectum bottom-center —
    matching the existing viewerAria exactly (which needed no change). All four
    hotspots re-anchored to real vertices of geometrically-selected segment
    bands (sigmoid / ascending / transverse / descending), verified live at the
    default camera; hotspot TEXT untouched (all verified content).
  - **Size:** 687KB -> 9.17MB (geometry dominates: 102k welded verts + normals
    + 2 UV sets; textures only ~2.5MB of it). Under the 10MB lungs-precedent
    bar but a 13x jump, flagged at review. Verified: 0.000%% blown-white across
    16 deterministic angles; full regression 146 checks / 2 pre-existing
    documented failures; thumbnail re-rendered with the old verified hex.

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
  Architecture notes) for regenerating the two body GLBs; nobody should need
  it just to run the app.
- Tumor-site blob positions are schematic, not anatomically precise. **Check
  `pos3d` spacing against the default camera framing, not just against other
  sites' blob-mesh overlap.** **FIXED (tech-debt pass):** TNBC's Brain/Lung
  site labels and meshes sat stacked directly on top of each other at the
  default site-map rotation (`pos3d` distance 0.91, vs. 1.6+ for every other
  pair in this cancer and in HGSOC's own spread) — this had been flagged
  since the LUAD pass as "confirmed pre-existing in both older organs," but
  direct re-verification during this pass found **HGSOC was already clean**
  (all four sites ≥1.6 apart, no visual overlap at the default rotation —
  left untouched rather than "fixed" to match a premise that didn't hold up
  on inspection). Only TNBC needed a real fix: Lung moved to
  `{1.6,1.4,0.6}` and Brain to `{-1.0,1.3,-0.3}` (Bone/Liver untouched, two
  respacing iterations — the first fix cleared Lung/Brain but drifted Lung
  into Liver, caught by re-screenshotting rather than declaring done after
  one edit). Click-to-navigate and keyboard access reverified on all four
  TNBC sites post-fix. LUAD reused TNBC's exact Brain `pos3d` for its own
  Brain site at first and inherited the identical overlap with Adrenal
  gland — caught via screenshot, fixed by respacing LUAD's four `pos3d`
  values further apart (HGSOC's original 4-way spread was the model to
  follow, not TNBC's). ccRCC (organ #4) and HCC (organ #5) both designed
  their own fresh `pos3d` values from scratch rather than copying any prior
  cancer's, and both were screenshot-verified clean at the default rotation.
  The underlying risk (any future cancer that copies coordinates instead of
  designing its own) is still there — a shared minimum-angular-separation
  pass over each cancer's `REGIONS_*` would close it structurally, not yet
  done. **The three-organ pass (Colon/Pancreas/Stomach) upgraded the design
  method, though: raw 3D pairwise distance is NOT sufficient — CRC's first
  spread had min 3D distance 2.09 (better than HGSOC's 1.6) and still merged
  two blob pairs on screen, because the separating vectors were
  depth-dominant at the default camera. The metric that works is PROJECTED
  pairwise distance at the site viewer's default camera (theta 0.6, phi
  1.15, screen-up = world-Y is the rotation-invariant axis); the three new
  cancers' spreads were optimized against it (projected minima 1.75/1.68/
  1.97) and screenshot-verified at the exact default rotation via a camera
  reset, not a timing race against the auto-rotate. Use this method for
  every future cancer. Melanoma (organ #11) did: its first spread had
  projected minimum 1.43 and visually merged two blobs — exactly the trap —
  and shipped at 2.15 (the highest yet), screenshot-verified.** **GBM (organ #6) and Prostate (organ #7) are the two deliberate
  exceptions to "spread the four `pos3d` values apart" — do not "fix"
  either's clustering thinking it's an oversight.** Both are clustered
  tightly *on purpose* (data rules 7 and 15) so their blobs visually merge
  into one mass/gland, matching their real biology (intratumor regions;
  independently-arising multifocal origins) — both screenshot-verified at
  the default rotation to confirm their labels stay individually legible
  despite the tight spacing, the opposite check every real-distant-site
  cancer's `pos3d` pass runs (spread apart enough to *avoid* merging).
- **Mesh geometry resolution — FIXED (tech-debt/quality pass).** Every organ
  `SphereGeometry` was 48×48 segments (2,401 vertices) and every tumor site/
  region/focus mesh was one shared `IcosahedronGeometry(0.6, 3)` call
  (960 vertices after `organicSpiculate`) — visibly faceted on the lit
  highlight of rounder organs (Brain, freq 8) and, more sharply, on tumor
  blobs' spike tips (`organicSpiculate`'s `sharpness:11` angular falloff
  needs real vertex density near a spike's tip to read smoothly; no amount
  of `computeVertexNormals()` — already called after every displacement —
  fixes an undersampled tip). Confirmed by screenshot before touching
  anything, not assumed from "looks rough" alone. Bumped organ spheres to
  80×80 (6,561 vertices), the shared tumor-blob Icosahedron to detail 5
  (2,160 vertices), lungs' `LatheGeometry` 32→48 radial segments, and the
  breast dome/cap/nipple proportionally — see the in-code comments at
  `buildOvaryMesh` and the tumor-blob loop in `initSiteViewer` for the exact
  numbers. Performance checked directly: this app's own `requestAnimationFrame`
  loop can't be measured in this project's headless preview environment
  (`document.hidden` reports `true` even when the tab is fronted, so rAF
  never fires between tool calls) — worth knowing if a future pass reaches
  for real-fps profiling here and gets nothing. The real substitute used
  instead: a synthetic `THREE.WebGLRenderer` benchmark (same
  `organicDisplace`/`organicSpiculate` code, isolated from the app) timing
  raw `render()` calls from 48 up to 192 organ-sphere segments and
  Icosahedron detail 3 through 9 — every level stayed under 0.08ms/frame,
  noise-dominated with no scaling trend, so the chosen resolutions have
  wide headroom to spare rather than being maxed out just because the
  budget allowed it. Raycasting, the click-vs-drag guard (re-tested
  specifically against GBM's overlapping clustered blobs, same scenario
  CLAUDE.md already flags for this), and the full keyboard chain (organ
  hotspot → cancer row → tumor site → cell panel, dispatched as real
  `KeyboardEvent`s since this environment's synthetic OS-level key events
  don't reliably reach a backgrounded tab either) were all reverified
  after the change — zero regressions, zero console errors across all
  seven organ/cancer pairs.
- **FIXED (ES-modules refactor, this pass).** Single HTML file with vanilla JS
  closures — the organ/cancer *screens* were already generalized (see
  Architecture notes), but there was no build step and no per-organ/per-cancer
  file split, so the file itself kept growing linearly with content. Now a real
  `js/organs/*.js` per organ plus a small set of shared modules — see
  Architecture notes' "File layout / module map" for the full breakdown. Still
  no build step and no bundler, by explicit constraint, not by not having
  gotten to it — plain ES modules resolve fine over a static file server.
- No backend/data layer yet — everything is a hardcoded JS object per organ.
  Worth deciding early whether additional organs stay static JSON/JS or move
  to something queryable, especially if this grows past ~5-6 organs.

## Suggested next steps (priority order)
1. Done: real project structure decided and set up (ES modules, no build step,
   no bundler — see Architecture notes' "File layout / module map"). The
   no-build-step constraint was kept deliberately, not left undecided.
2. Done: `makeViewer`, `organicDisplace`, `organicSpiculate`,
   `applyMottleVertexColors`, `makeMoveTracker` live in `js/viewer.js`; the
   mutation panel in `js/panel.js`; the breadcrumb in `js/breadcrumb.js`.
3. Ovary/HGSOC, Breast/TNBC, Lungs/LUAD, Kidneys/ccRCC, Liver/HCC,
   Brain/GBM, Prostate/acinar adenocarcinoma, Colon/colorectal
   adenocarcinoma, Pancreas/PDAC, Stomach/diffuse-type gastric
   adenocarcinoma, and — added in its own pass (2026-08-28) after a
   pre-build representation checkpoint — Skin/cutaneous melanoma are all
   done (twelve pairs; see data rule 20 for skin's organ-representation
   departure, the cross-section block, and the sex-differentiated body
   marker). For the next organ, pick pair #12 and
   repeat the real-data-sourcing process documented above — **verify every citation directly at the source before writing it
   into the app, not after**, the standard ccRCC, HCC, GBM, and Prostate all
   held themselves to from the start rather than fixing in a follow-up
   correction pass the way LUAD needed to. The screens themselves are ready
   (see the `ORGAN_DETAILS`/`CANCER_DETAILS` note in Architecture notes); it
   should mean a data entry and a `buildMesh()`, not new markup. Remember to
   check which mutation-framing model actually applies — competing/mutually-
   exclusive drivers like Lung's KRAS/EGFR/ALK/ROS1, cooperating/co-occurring
   drivers like Kidney's VHL/PBRM1/SETD2/BAP1, a "general rule with a
   documented exception" like Liver's TP53/CTNNB1, or a *soft*, one-sided
   cooperating relationship safe for a shared private pool like Prostate's
   PTEN/CHD1 (data rules 3/4/6/16) — not every cancer will fit any of these
   patterns cleanly, but check before assuming the most recently added
   organ's pattern carries over. Also check whether the new organ's trunk
   mutation is truncal for the usual spatial reason, a temporal one like
   Liver's TERT, or a "no shared founder" fact-statement like Prostate's
   (data rule 5) — don't reuse "present in every region" language by
   default. **Most importantly, check whether the new cancer's "sites"
   should be real distant-metastasis organs, intratumor regions of one
   mass, or independently-arising multifocal foci** (data rules 7/15) — GBM
   and Prostate are each a departure for a *different* reason (too rare to
   model vs. genuinely multifocal with real metastasis besides), so don't
   assume either exception is now the default. Most cancers will have real
   distant-metastasis sites the way five of seven organs so far do.
4. Done: the body screen now loads real static meshes (Blender's "Human Base
   Meshes" bundle, `assets/*.glb`) instead of procedural primitives — the
   third asset source tried, after MakeHuman (abandoned, source-topology
   defect) and DNC44 on Sketchfab (blocked, account-gated download). Remaining
   follow-up, not started: compress the GLBs (Draco/meshopt) if load time ever
   becomes a real complaint rather than a theoretical one, and reconsider
   whether organ hotspots should eventually anchor to real anatomical
   landmarks on the mesh rather than height-fraction + angle.
5. Done: Lungs, Kidneys, Liver, Brain, and Prostate's own organ-screen meshes
   now load real anatomical scans (NIH 3D's Human Reference Atlas, CC BY 4.0)
   instead of procedural primitives — see "Organ mesh source" in Architecture
   notes for the full sourcing/topology/decimation/hotspot-re-anchoring
   history. **Ovary and Breast were deliberately left on their procedural
   meshes** — not started, a separate future decision, not an oversight.
   If picked up: NIH 3D's own collection may or may not include either organ
   (not checked as part of this pass, since the task scope was the five
   organs above); verify a real model exists and its license independently
   before assuming the same source generalizes. Also open, noted but not
   built into this pass: Prostate's isolated-out duct-like appendages are
   more consistent with genuine ejaculatory ducts than a segmentation
   artifact (investigated, not certain) — a real ejaculatory-duct sub-mesh
   with its own hotspot, sharpened against the existing Prostatic urethra
   point, is a plausible separate follow-up, not assumed necessary.

## Source files
`cancer-atlas.html` is now a thin shell (markup + CSS + the three.js import map,
~365 lines) that loads `js/main.js` as an ES module — it is no longer the single
source of truth for the app's logic or data on its own. See Architecture notes'
"File layout / module map" for the full `js/` breakdown before making changes:
read the shell plus whichever module(s) the change actually touches — for a
new organ, that's `js/organs/index.js` plus the one new organ module; for
anything touching shared state or cross-screen wiring, `js/state.js` and
`js/main.js`; for a citation/data correction to an existing organ, just that
organ's own `js/organs/*.js` file.
