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
proves out the full navigation pattern end-to-end for **seven** organ/cancer pairs,
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
  Kidneys, Liver, Brain, and Prostate are all active now** — Breast routes to a real breast mesh (a capped partial-sphere
  dome with a small nipple-apex bump, not a stretched ellipsoid like the ovary);
  Lungs routes to a `LatheGeometry` profile that pinches to a radius of 0 at both
  poles, so it closes into a solid tapered point at apex/base with no separate cap
  mesh (unlike the body torso, which needs explicit `topCap`/`botCap` discs); Kidneys
  routes to a flattened, elongated `SphereGeometry` ellipsoid (no literal concave
  medial notch — see Architecture notes) — the kidney marker positions on the body
  itself needed no new work, since `ORGAN_MARKER_SPECS.kidneys` was already placed
  and screen-space-verified during the body-mesh integration, well before this organ
  was wired up; activating it was only the `ORGANS`/`ORGAN_DETAILS` flip. Liver
  routes to a wide, wedge-like `SphereGeometry` ellipsoid (same non-lobed
  simplification as the kidney's missing concave notch — the "four lobes" fact is
  stated in text, not modeled as four mesh pieces) — its body-marker position also
  needed no new work, same reason as Kidneys. Brain routes to a rounded, loosely
  convoluted `SphereGeometry` ellipsoid — body-marker position, again, needed no
  new work.
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
  coming soon." **Kidneys**: flattened ellipsoid, points are Cortex / Medulla /
  Renal pelvis / Hilum — Cortex is framed the same "arises here" way as the
  three prior organs' points — only Clear cell renal cell carcinoma is wired,
  Papillary and Chromophobe show "profile coming soon." Its retroperitoneal
  location fact gets the same second-sentence treatment Lungs' dual blood
  supply got: it's the one anatomically distinct thing about this organ
  relative to every prior one (ovary/breast are intraperitoneal-or-overlying,
  lungs thoracic; kidneys sit behind the peritoneum entirely). **Liver**: wide
  wedge-like ellipsoid, points are Hepatocytes / Portal vein / Bile ducts /
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
  **Brain**: rounded convoluted ellipsoid, points are White matter / Ventricular
  system / Cerebral cortex / Blood-brain barrier — White matter, not Cerebral
  cortex, gets the "arises here" framing (confirmed directly: StatPearls,
  "Glioblastoma," describes GBM as a subcortical white-matter disease first;
  the Cerebral cortex point is deliberately the opposite of every prior
  organ's first point — an explicit non-arises-here contrast, stated as such)
  — only Glioblastoma is wired, Lower-grade astrocytoma, Oligodendroglioma,
  and Meningioma show "profile coming soon."
  **Prostate**: rounded walnut-shaped ellipsoid, points are Peripheral zone /
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
   once.
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
  (title/screenLabel/legendTitle/regions/trunk/privatePool, plus an optional
  `regionWord` — default `'site'`, GBM sets `'region'` since its four
  "sites" are zones of one tumor, not distant organs; see data rule 7)
  drives `enterCancerScreen()`/`initSiteViewer()`. `currentOrganKey`/`currentCancerId`
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
  done. **GBM (organ #6) and Prostate (organ #7) are the two deliberate
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
3. Ovary/HGSOC, Breast/TNBC, Lungs/LUAD, Kidneys/ccRCC, Liver/HCC,
   Brain/GBM, and Prostate/acinar adenocarcinoma are all done. Pick organ/
   cancer pair #8 and repeat the real-data-sourcing process documented
   above — **verify every citation directly at the source before writing it
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

## Source file
The current working prototype is `cancer-atlas.html` — read it in full before
making changes; it's the single source of truth for what's built so far.
