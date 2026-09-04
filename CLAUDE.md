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
      confirmed via independent, more recent work (multiomics analyses
      naming "CTNNB1-ARID2 comutations" as a recurring HCC pattern), since
      this 2012 paper's own text didn't address that specific pair directly.
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
      at 71%, not this one; sequencing shows no Lauren-axis association
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
      discovery-vs-replication; never frame it the latter way. Timing
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
    BMC Cancer, 2024).** The atlas's FIFTH temporal trunk and the first
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
      quiet-genome story (median 46 non-silent mutations, clock-like
      SBS1/SBS5 dominant — Chao) and OBSCN R3140Q labeled explicitly as a
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
      frequent in metastatic samples (42.4% vs 29.2%). **Build-time
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
  the existing ones. It's the latter: `ORGAN_DETAILS[organKey]` (eyebrow/
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
  with no decoder fails to load entirely). One toolchain note: these two
  files can no longer be parsed by the raw-GLB accessor scripts used in
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
    synchronous path, so each of these five `buildMesh` functions returns a
    `Promise<THREE.Object3D>` instead of an `Object3D` directly.
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
    because these five GLBs are real-world meters and the procedural organs
    were an arbitrary ~1-2 unit scale:** `initOrganViewer()` calls
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
  that, never geometry type.**
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
  (accepted 2026-09-02 after a diagnostic-only characterization — packet
  ~/Downloads/cancer-atlas-testis-blownwhite-diagnostic/). The testis
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
    set for these two, a single-organ set for the other 15) — a strictly
    more precise check than "zero collisions" that doesn't flag this app's
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
    being visible is the point of the whole swap) in
    `~/Downloads/cancer-atlas-lungs-integration-review/`.

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
  Architecture notes) for regenerating these two files; nobody should need it
  just to run the app.
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
