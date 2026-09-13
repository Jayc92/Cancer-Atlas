import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

// active:true, plus 'triple negative'/'tnbc' aliases — searching either finds Breast, since
// search resolves to an organ (not a cancer directly); the cancer itself is one click further,
// same as searching "ovary" doesn't skip straight to HGSOC.
export const organEntry = { key:'breast', label:'Breast', system:'Reproductive', active:true, sexes:['female','male'], aliases:['breast','breasts','mammary','triple negative','triple-negative','tnbc'] };

export const markerSpec = { points:[{heightFrac:0.70, angle:-35}, {heightFrac:0.70, angle:35}] };

// BREAST RULED HISTOLOGIC-AXIS (2026-09-13, user ruling — phaseC_design.md §17). Luminal A,
// Luminal B, and HER2-enriched carcinoma were staged here as molecular subtypes, colliding with
// every other organ's histologic-axis convention (and with TNBC below, itself molecular) —
// RETIRED, never to be authored as their own top-level rows, on the criterion §17 records: a
// molecular/receptor-defined category earns a top-level entry only when it carries a distinctive,
// drawable morphologic phenotype of its own, and none of the three does (their own literature
// frames the diagnosis as immunohistochemistry, not architecture — §7's own design-question note,
// before the criterion made the conclusion explicit). Invasive breast carcinoma of no special
// type (IDC, the familiar alias — WHO's own current term leads) and invasive lobular carcinoma
// (ILC) — real histologic types, IDC the currently-unrepresented ~70-80% majority — take their
// place. TNBC is grandfathered: its own histology (genTNBC — solid sheets, geographic necrosis,
// tumor-infiltrating lymphocytes) and branch mutations (EGFR amplification/RB1 loss, data rule 1)
// are real drawable/cited facts, not merely an IHC readout restated as a row, which is exactly
// what the criterion requires.
// THIS LIST IS NOT A PARTITION: TNBC and IDC overlap (a real tumor can be both), so the shares
// below do not sum toward one denominator the way a histologic list ordinarily would. Checked
// directly rather than left to a standing declaration: share_sum_check.py's own arithmetic on
// these three ranges lands COHERENT (~101.2) by coincidence, not because they partition, so no
// DECLARED entry is carried for 'breast' there (a stale declaration must be removed, not kept
// "just in case" — see that file's own comment at the site). The structural, non-partition fact
// itself is still stated in two places a reader can find: this comment, and the organ's own
// reader-facing description (see organDetail below).
export const cancerEntries = [
  { id:'tnbc',  name:'Triple-negative (basal-like) carcinoma', share:'~10–20% of breast carcinomas', active:true, organKey:'breast' },
  { id:'idc',   name:'Invasive breast carcinoma of no special type (IDC)', share:'~73–78% of breast carcinomas (73.3%, Probert et al., 2025, N=838,776, England 1988–2016; 78.0%, Giaquinto et al., 2025, US SEER 2017–2021) — this organ\'s predominant histologic pattern', active:true, organKey:'breast' },
  { id:'ilc',   name:'Invasive lobular carcinoma', share:'~10.6–10.7% of breast carcinomas (10.6%, Giaquinto et al., 2025; 10.7%, Probert et al., 2025) — a further ~4% show mixed ductal-lobular features, reported as its own category by Giaquinto and folded into whichever pattern predominates under Probert\'s own classification method (data rule 31)', active:true, organKey:'breast' },
];

// Real anatomy, not procedural: NIH 3D, "Human Reference Atlas 3D Reference Object Library"
// (account "HRA"), entry 3DPX-020977 — CC BY 4.0. Unlike the other five real-mesh organs, this
// one is NOT traced from the Visible Human Dataset — it's a custom hand-sculpted model, expert-
// reviewed against two anatomy textbooks (Krstić, "Human Microscopic Anatomy," 1991; Gilroy,
// MacPherson & Ross, "Atlas of Anatomy," 2008) rather than derived from cadaver scan data.
// Attribution (quoted from the entry page, required under CC BY 4.0): "Heidi Schlehlein 2022.
// 3D Reference Organ for Breast (mammary gland), Female left, v1.0,
// https://doi.org/10.48539/HBM378.VWZG.633." Full sourcing/topology history in CLAUDE.md.
// The source mesh is 52 separate connected components, not one surface — confirmed via the
// atlas's own ontology tags (not guessed) to be genuine individually-sculpted sub-structures
// (nipple, areola, areolar tubercles, multiple mammary lobes, lactiferous ducts/sinuses,
// suspensory (Cooper's) ligaments, interlobar fat), all spatially contained within the main
// gland's own bounding volume — the same class of check that isolated Prostate's real duct
// appendages from its gland, here confirming the *opposite* conclusion: nothing to isolate out,
// every component is real anatomy worth keeping.
// MATERIAL COLOR (real-tissue pass, verified before picking): the old 0xe8bdae was a peachy-
// tan, closer to generic skin tone than actual breast parenchyma. Real breast tissue on cut
// surface is a mix of pale yellowish-cream fat and firmer white-to-tan fibroglandular tissue —
// confirmed against MGH Pathology's (learn.mghpathology.org) description of normal breast
// tissue as predominantly adipose (yellow) interspersed with white fibrous/glandular tissue,
// not a uniform peach. 0xe3d3a0 shifts the base color toward that real pale yellow-cream
// direction while staying light enough to read as the fattier tissue that dominates the
// organ's bulk, and richened slightly so it doesn't wash toward white under the warm key light.
// MATERIAL/LIGHTING REALISM PASS — shared recipe (roughness x0.82, specularIntensity 0.15->0.25,
// per-vertex tissue mottle at amplitude 0.28) applied uniformly across all nine real-scan
// organs; full mechanism, clip-safety reasoning, and the transmission investigation's null
// result are in liver.js's own comment (the canonical write-up) and this pass's dated CLAUDE.md
// entry. Color unchanged (0xe3d3a0 stays the verified pale yellow-cream tone) — worth flagging
// that this is the palest verified albedo in the atlas (R 0.89) and therefore the tightest
// clip-headroom case of all nine organs; checked with that in mind, not by analogy alone. Seed
// 3.9 (organ #3 in ORGAN_MODULES' order x1.3). This mesh's 52 separate sub-components (nipple,
// areola, lobes, ducts, ligaments, interlobar fat — see the sourcing comment above) each get
// their own applyTissueMottleVertexColors call via the same traverse loop that assigns the
// shared material, each normalized against its OWN sub-mesh bounding box rather than one global
// box — see that function's own comment in viewer.js for why a per-sub-mesh box is what makes
// the recentering step correct here at all.
export function buildBreastMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/breast.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity (clip-fix pass, now 0.25 — realism-pass
      // comment above), NOT MeshStandardMaterial: this ports the missing half of the approved
      // material verification — the Blender renders the tissue colors were verified and
      // approved on had Specular IOR Level baked in, but MeshStandardMaterial has no specular
      // control at all, so the live app kept full-strength dielectric specular. Under the legacy
      // hard-clip pipeline that blew grazing-angle fold/fissure walls to flat white (up to 26% of
      // the lungs' on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
      // js/viewer.js's warm-lighting comment. Color unchanged; roughness and specularIntensity
      // both revised by the realism pass above.
      const mat = new THREE.MeshPhysicalMaterial({ color:0xe3d3a0, roughness:0.49, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 3.9); } });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Reproductive / Glandular Tissue', title:'Breast',
  sub:'Paired gland · overlies pectoralis major · produces milk via lobules and ducts',
  facts:[
    {label:'Location', val:'Overlying pectoralis major, upper chest wall'},
    {label:'Function', val:'Milk production via lobules and ducts'},
    {label:'Blood supply', val:'Internal thoracic &amp; lateral thoracic arteries'},
  ],
  desc:'The breast sits on the chest wall over pectoralis major, made up of milk-producing lobules connected by a branching network of ducts to the nipple, all embedded in stromal and fatty tissue that gives the organ most of its bulk and shape. The cancers listed below are not alternatives to one another: triple-negative is defined by receptor status, while invasive ductal and invasive lobular carcinoma are defined by histologic architecture, and a real tumor can be both — so their shares overlap rather than add up to one whole.',
  buildMesh: buildBreastMesh,
  // Real-world-meter GLB (bbox ~12.8x11.2x18.2cm, including the real axillary tail — see
  // lungs.js for why minRadius/maxRadius are rescaled here rather than left at the old ~1-unit
  // procedural values.
  viewer:{ theta:0.4, phi:1.05, radius:0.4, minRadius:0.1, maxRadius:0.8, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a breast, a rounded dome with a raised nipple-areola '
    + 'complex at its center, with four glowing teal points marking the structures listed after '
    + 'it. Drag to rotate, scroll to zoom.',
  // pos: literal anchor points (meters, local mesh space) raycast against the real
  // assets/breast.glb surface — see lungs.js for the method. Stromal/fatty tissue is anchored on
  // the real axillary tail (the tail is predominantly fat/stroma, not a random peripheral guess);
  // Ducts sits on the body surface immediately adjacent to the nipple/areola, where the real
  // lactiferous ducts actually converge, distinct from the Nipple-areola point itself.
  hotspots:[
    // Directly parallel to the ovary's surface-epithelium point: this is the "arises here"
    // structure for this organ, framed the same way for the same pedagogical reason.
    { key:'ducts', label:'Ducts', pos:[0.0219,0.0444,0.0631],
      text:'The branching channels that carry milk from the lobules toward the nipple. Most invasive breast cancers — about 73–78% — show this duct-like growth pattern, the organ\'s default histologic type (Probert et al., 2025; Giaquinto et al., 2025). That name describes the tumor\'s architecture, not literally where it started: both this pattern and the lobular one below actually arise from the terminal duct-lobular unit, the junction between duct and lobule — the ductal/lobular naming reflects growth pattern, not literal site of origin, and stays in common use even though it "does not reflect the histogenesis of these tumor types" (Rakha & Tozbikian, PathologyOutlines.com, "Invasive breast cancer of no special type (NST)").' },
    { key:'lobules', label:'Lobules', pos:[0.0216,0.0016,0.0891],
      text:'Clusters of small glands that produce milk during lactation, feeding into the duct network at that same terminal duct-lobular unit. A smaller share of invasive cancers — about 10.6–10.7% ("lobular carcinoma") — arise from this junction but grow as loose, single-file cords rather than solid masses, the architectural signature of losing E-cadherin, the cell-adhesion protein that would otherwise hold these cells together (Giaquinto et al., 2025; Probert et al., 2025).' },
    { key:'stroma', label:'Stromal / fatty tissue', pos:[0.0515,-0.0246,-0.0450],
      text:'The fatty and connective tissue that fills the spaces between lobules and ducts — most of what actually gives the breast its size and shape, and where a lump is often first felt even when the cancer itself originated in nearby glandular tissue.' },
    { key:'nipple', label:'Nipple-areola complex', pos:[0.0289,0.0508,0.0513],
      text:'Where the duct network converges and opens to the surface. A rarer form, Paget disease of the breast, presents as a skin change here and is often associated with an underlying ductal carcinoma.' },
  ],
};

// Real distant-metastasis sites (Yates et al., Cancer Cell, 2017), not the intraperitoneal
// spread pattern HGSOC uses — breast cancer's real recurrence geography is systemic, so the
// "sites" concept still applies but means something different per cancer, which is why
// legendTitle is per-CANCER_DETAILS rather than a single hardcoded string.
//
// Every branch gene below was checked for mechanistic fit with THIS tumor — ER-negative,
// TP53-mutant — not just "real gene, real frequency, real cancer somewhere" (see the CLAUDE.md
// data-rule this omission prompted). Two earlier picks, ESR1 activating mutation and MDM4
// amplification, failed that check and were replaced: ESR1's mechanism (locking the estrogen
// receptor into an active shape) requires ER expression a TNBC tumor doesn't have by definition,
// and MDM4's mechanism (degrading wild-type p53) is moot once trunk TP53 has already disabled
// that pathway. Both were real, sourced, and correctly labeled site-illustrative — the defect
// was the gene choice itself, not the site pairing or the citation. FGFR1 and JAK2/STAT-pathway
// inactivation are still from Yates et al. (2017)'s pan-breast-cancer metastasis cohort, since
// both are receptor-status-agnostic and hold up fine. EGFR amplification and RB1 loss (below)
// are basal-like-specific findings from TCGA (Nature, 2012) instead — a different real source,
// used because it actually supports a basal-like-specific claim, not to force everything onto one
// citation. Assigning one gene to each site is still the same illustrative simplification HGSOC's
// omentum/CCNE1 pairing uses (see CLAUDE.md's Architecture notes on why that panel heading says
// so explicitly) — this fix is about which genes appear, not about the site-pairing framing.
//
// SITE-FREQUENCY VERIFICATION PASS (added after initial ship — same "verify at the source, not
// secondhand" standard the LUAD/ccRCC passes used): the task prompt's first suggestion, "Foulkes
// et al., NEJM, 2010" for lung 40%/brain 30%/liver 20%/bone 10%, was checked directly — the real
// paper (Foulkes WD, Smith IE, Reis-Filho JS, "Triple-Negative Breast Cancer," NEJM 2010, PMID
// 21067385) exists, but its abstract is a scope-only review summary with zero percentages, and
// the full text is paywalled with no PMC mirror — the specific site percentages could not be
// confirmed from the source and were dropped rather than kept on a secondhand citation.
// Replaced with two sources actually pulled and confirmed directly:
// - Gao et al. (Precision Medical Sciences, 2023; DOI 10.1002/prm2.12107) — a SEER-based
//   population study, 24,822 TNBC patients (2010–2015), 1,026 with distant metastasis at
//   diagnosis. Confirmed directly from the open-access full text: bone 24.46% (251/1026), lung
//   23.78% (244/1026), brain 3.61% (37/1026) — the exact figures used below. Liver is discussed
//   in the paper's survival analysis (worst prognosis alongside brain) but is never given its
//   own overall percentage anywhere in the text — confirmed by searching specifically for it, not
//   inferred from its absence from a "most common" list — so none is claimed for Liver in-product,
//   same honesty precedent as LUAD's adrenal gland and ccRCC's liver/brain.
// - Kennecke et al. (J Clin Oncol, 2010, PMID 20498394) — confirmed directly from the abstract: a
//   real, distinctive finding worth stating explicitly rather than leaving these four sites
//   looking like an arbitrary list — "basal-like tumors had a higher rate of brain, lung, and
//   distant nodal metastases but a significantly lower rate of liver and bone metastases" versus
//   luminal subtypes, and "bone was the most common metastatic site in all subtypes except
//   basal-like tumors." TNBC's organotropism is genuinely different from ER+ breast cancer, not
//   just a different set of numbers on the same underlying pattern. One real caveat the abstract
//   also states and this note preserves rather than over-generalizing: triple-negative *nonbasal*
//   tumors specifically were "not associated with fewer liver metastases" the way basal-like
//   tumors were — the lower-liver finding is strongest for basal-like, not TNBC as a whole.
// pos3d respaced (tech-debt fix pass) — Lung and Brain originally sat 0.91 apart (vs. 1.6+ for
// every other pair here and every pair in HGSOC's own clean 4-way spread), stacking their labels
// and meshes directly on top of each other at the default site-map rotation. Confirmed visually
// before and after this change, the same screenshot-verification method ccRCC/HCC's own
// from-scratch pos3d passes used. Only the coordinates moved; ids/colors/branch genes/notes are
// untouched.
const REGIONS_TNBC = [
  { id:'BN', name:'Bone', color:cssVar('--coral'), pos3d:{x:-1.3,y:-0.9,z:0.3},
    branch:{ gene:'EGFR amplification', class:'driver', ccf:'~23% of basal-like tumors (TCGA, Nature, 2012)', note:'Extra copies of a growth-factor receptor gene that drives proliferation directly through its own signaling — unlike estrogen-receptor pathway alterations, this doesn\'t require any hormone-receptor expression, which is why it actually fits a receptor-negative tumor like this one.' } },
  { id:'LV', name:'Liver', color:cssVar('--azure'), pos3d:{x:0.9,y:-0.6,z:-0.5},
    branch:{ gene:'RB1 loss', class:'driver', ccf:'a basal-like driving event TCGA (Nature, 2012) reports as shared with high-grade serous ovarian carcinoma', note:'Removes a cell-cycle checkpoint, cooperating directly with this tumor\'s trunk TP53 mutation rather than depending on hormone signaling — TCGA identifies the same TP53-plus-RB1-loss pairing as a shared driving event between basal-like breast cancer and HGSOC, the other cancer modeled in this atlas.' } },
  { id:'LU', name:'Lung', color:cssVar('--amber'), pos3d:{x:1.6,y:1.4,z:0.6},
    branch:{ gene:'FGFR1 amplification', class:'driver', ccf:'recurrent focal amplification acquired at metastasis across breast cancer cohorts (Yates et al., Cancer Cell, 2017)', note:'Extra copies of a growth-factor receptor gene that can drive proliferation directly and, in other breast cancer subtypes, contribute to endocrine-therapy resistance.' } },
  { id:'BR', name:'Brain', color:cssVar('--violet'), pos3d:{x:-1.0,y:1.3,z:-0.3},
    branch:{ gene:'JAK2/STAT pathway inactivation', class:'driver', ccf:'recurrent pathway-inactivating alteration acquired at metastasis across breast cancer cohorts (Yates et al., Cancer Cell, 2017)', note:'Blunts interferon/JAK–STAT signaling, one route tumor cells use to reduce their visibility to the immune system at the metastatic site — a mechanism with particular clinical relevance in TNBC, where checkpoint immunotherapy already has an established role.' } },
];
const TRUNK_TNBC = [
  { gene:'TP53 mutation', class:'driver', ccf:'~80% of basal-like tumors (TCGA, Nature, 2012)', note:'Disables the tumor-suppressor gene lost in the large majority of basal-like/triple-negative breast cancers — consistent enough across cases to be considered a founding event of this subtype, similar to its role in HGSOC.' },
];
const PRIVATE_POOL_TNBC = [
  { gene:'BRCA1/2 alteration (germline or somatic)', class:'driver', ccf:'~20% of basal-like tumors (TCGA, Nature, 2012)', note:'Loss of homologous-recombination repair capacity — found in a meaningful minority of basal-like tumors specifically, and a determinant of PARP-inhibitor and platinum-chemotherapy sensitivity here too.' },
  { gene:'PIK3CA mutation', class:'driver', ccf:'~9% of basal-like tumors, against 39% in HER2-enriched (TCGA, Nature, 2012) — PIK3CA mutations cluster heavily in ER-positive/luminal disease', note:'Activates the PI3K growth pathway; the frequency gap here is itself informative about how differently this subtype is wired.' },
  { gene:'CCND1 amplification', class:'driver', note:'Extra copies of a cell-cycle gene (cyclin D1) that pushes cells through division — a recurrent focal amplification in breast cancer broadly.' },
  { gene:'MYC amplification', class:'driver', note:'Extra copies of a master growth-signaling gene — one of the more common focal amplifications in basal-like breast cancer genomes specifically.' },
  { gene:'PTEN loss', class:'driver', note:'Removes a brake on the PI3K growth pathway — a route to the same growth advantage PIK3CA mutations reach by a different door, and more frequent in basal-like tumors than PIK3CA mutation itself.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly at the source): the
// morphology-defining study for the basal-like subtype (Livasy et al., Mod Pathol, 2006,
// PMID 16341146) reports "markedly elevated mitotic count," "geographic tumor necrosis"
// (17/23 tumors), "pushing margin of invasion" (14/23) and "stromal lymphocytic response"
// as the features significantly associated with this subtype; PathologyOutlines' invasive-
// NST page confirms "large and solid nests or syncytial infiltrative growth pattern with
// little associated stroma" for basal-like tumors and names the "prominent tumor associated
// lymphocytic (TIL) infiltrate" directly; Salgado et al. (Ann Oncol, 2015 — the
// International TILs Working Group consensus) is the real source for TILs carrying
// prognostic/predictive weight in triple-negative disease specifically. "Geographic" (not
// just "central") is the verified word for the necrosis.
const HISTOLOGY_TNBC = {
  intro: 'Basal-like / triple-negative tumors grow as solid nests and sheets with little gland formation and little intervening stroma, markedly elevated mitotic counts, and map-like zones of geographic necrosis. Distinctively, small dark tumor-infiltrating lymphocytes (TILs) thread between the tumor cells — an immune infiltrate whose density carries real prognostic weight in this subtype. Margins are often pushing and circumscribed rather than infiltrative.',
  ariaSummary: 'Stylized microscopic field: dense solid sheets of pink tumor cells with large, variably sized purple nuclei and no gland formation. A pale, map-like necrotic zone occupies the upper right, containing faint ghost outlines of dead cells. Three clusters of much smaller, dark round lymphocytes sit threaded between the tumor cells.',
  citation: 'Livasy et al., Mod Pathol, 2006; PathologyOutlines.com, "Invasive breast carcinoma of no special type"; TILs: Salgado et al., Ann Oncol, 2015.',
  features: [
    { key:'sheets', label:'Solid sheets',
      text:'Large solid nests with syncytial growth and little associated stroma — minimal to no gland formation, the opposite of the duct-forming architecture that gives lower-grade breast cancers their name.' },
    { key:'necrosis', label:'Geographic necrosis',
      text:'Map-like zones of dead tumor tissue with ghost outlines of the cells that died — present in 17 of 23 basal-like tumors in the study that defined this subtype’s morphology.' },
    { key:'tils', label:'Tumor-infiltrating lymphocytes',
      text:'Small, dark immune cells threaded between the far larger tumor cells. Their density carries prognostic — and potentially treatment-predictive — significance specifically in triple-negative disease (International TILs Working Group, 2015).' },
  ],
};

// IDC-NST and ILC (2026-09-13, phaseC_design.md §17) — every citation below verified directly at
// the source by two parallel research passes before being written in, cross-checked against each
// other where both covered the same paper (Ciriello et al. 2015 is the single source behind most
// of both entries' mutation contrasts, read directly by both passes independently and agreeing).
//
// SITES, ONE SOURCE, ONE REAL CONTRAST — Mathew et al., Geburtshilfe Frauenheilkd, 2017,
// PMID 28757653, PMCID PMC5489406 (Magee-Womens Hospital/UPMC, N=761 metastatic breast cancer
// patients, 88 ILC/673 IDC, "over the entire course of metastatic disease"). IDC's own four sites
// below are this paper's raw IDC-arm figures, needing no adjustment. ILC's are NOT the raw ILC-arm
// figures — the paper's own bone finding (77.3% raw) did NOT survive restricting to HR+/HER2-
// tumors only (the composition both arms are mostly made of): "controlling for tumor subtype
// eliminated the association between ILC and bone metastases... the increased tendency... may be
// a factor of their hormone status and less a characteristic of the histologic type" (verbatim).
// Liver/lung/ovary/GI-tract differences DID survive that same adjustment, so ILC's site model
// below uses the adjusted (HR+/HER2- only, n=414) figures specifically — the genuinely
// lobular-specific pattern, not a hormone-receptor artifact riding along as if it were one.
const REGIONS_IDC = [
  { id:'ZB', name:'Bone', color:cssVar('--coral'), pos3d:{x:-1.3,y:-0.9,z:0.3},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'~33% of IDC-NST (164/490, Ciriello et al., Cell, 2015, PMID 26451490) — against 48% in ILC', note:'Activates the PI3K growth pathway; real in both this organ\'s histologic types, but genuinely less frequent here than in the lobular entry modeled alongside it.' } },
  { id:'ZL', name:'Lung', color:cssVar('--amber'), pos3d:{x:1.6,y:1.4,z:0.6},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'~33% of IDC-NST (164/490, Ciriello et al., Cell, 2015, PMID 26451490) — against 48% in ILC', note:'Activates the PI3K growth pathway; real in both this organ\'s histologic types, but genuinely less frequent here than in the lobular entry modeled alongside it.' } },
  { id:'ZV', name:'Liver', color:cssVar('--azure'), pos3d:{x:0.9,y:-0.6,z:-0.5},
    branch:{ gene:'GATA3 mutation', class:'driver', ccf:'~13% of IDC-NST (66/490) against 5% in ILC (Ciriello et al., Cell, 2015, PMID 26451490)', note:'A transcription factor supporting luminal differentiation — real and more common in this organ\'s ductal entry than in its lobular one, the mirror image of how PIK3CA and FOXA1 skew the other way.' } },
  { id:'ZR', name:'Brain', color:cssVar('--violet'), pos3d:{x:-1.0,y:1.3,z:-0.3},
    branch:{ gene:'GATA3 mutation', class:'driver', ccf:'~13% of IDC-NST (66/490) against 5% in ILC (Ciriello et al., Cell, 2015, PMID 26451490)', note:'A transcription factor supporting luminal differentiation — real and more common in this organ\'s ductal entry than in its lobular one, the mirror image of how PIK3CA and FOXA1 skew the other way.' } },
];
const TRUNK_IDC = [
  { gene:'TP53 mutation', class:'driver', ccf:'~44% of IDC-NST (215/490, Ciriello et al., Cell, 2015, PMID 26451490) — the single most commonly mutated gene here, not a near-universal founder', note:'The most common of several recurrent drivers in this histologic type, similar in shape to this atlas\'s own LUAD entry (KRAS, 33%) rather than to a near-universal founder like HGSOC\'s TP53 (~96%) — this cancer\'s own genomic behavior is reported as driven mainly by which of breast cancer\'s four intrinsic molecular subtypes — Luminal A, Luminal B, HER2-enriched, and Basal-like (the group this organ\'s own triple-negative entry above overwhelmingly falls into) — a given tumor belongs to, not by histology itself (Thennavan et al., Cell Genomics, 2021, PMID 35465400; TCGA, Nature, 2012). Luminal A, Luminal B, and HER2-enriched are real, clinically load-bearing categories, but none carries a distinctive H&E architecture the way this entry\'s own irregular-glands-and-cords pattern or triple-negative\'s own solid-sheets-and-necrosis pattern does — so they live here, as molecular context on the histologic entries that do have one, rather than as drawn entries of their own (phaseC_design.md §17).' },
];
const PRIVATE_POOL_IDC = [
  { gene:'HER2/ERBB2 amplification', class:'driver', ccf:'~15% clinically HER2-positive (population data, Giaquinto et al., Cancer, 2025, PMID 41055508) — against ~5% in ILC', note:'Extra copies of a growth-factor receptor gene — this organ\'s own "usual" HER2 mechanism, gene-dosage amplification, in real contrast to the lobular entry modeled alongside it, where HER2 involvement is instead a point mutation in the same gene, not extra copies of it (see that entry\'s own branch note).' },
  { gene:'TTN mutation', class:'passenger', note:'One of the largest genes in the human genome — mutated often simply because of its size, not because it drives this cancer. Included as this ledger\'s standard passenger, the same role it plays across this atlas\'s other pools.' },
];

// HISTOLOGY — see js/histology.js's genIDC for the drawing itself and its own header comment for
// the full reasoning (deliberately the opposite grading-spectrum end from this organ's own TNBC
// slide). WHO 6th ed. (Quinn et al., Histopathology, 2026, PMID 42011085, PMCID PMC13341065):
// "an invasive carcinoma of no special type (NST) comprising irregular neoplastic glands and
// trabeculae that infiltrate the breast parenchyma." Grading axis: Elston & Ellis, Histopathology,
// 1991, PMID 1757079 (tubule/gland formation, nuclear pleomorphism, mitotic count) — restated for
// NST directly by Rakha, Tse & Quinn, Histopathology, 2023, PMID 36482272, PMCID PMC10108289.
const HISTOLOGY_IDC = {
  intro: 'Invasive breast carcinoma of no special type (IDC) is this organ\'s residual, majority category — everything left once the WHO\'s named special types are excluded — so its own architecture is deliberately heterogeneous rather than one fixed pattern. What is drawn here sits at moderate grade: irregular, variably formed glands and solid trabecular cords infiltrating the stroma, with real nucleus-to-nucleus variation in size and shape (nuclear pleomorphism) — the Nottingham grading system\'s own three-part axis (tubule formation, pleomorphism, mitotic count) made visible. No necrosis, no dense lymphocyte band: this is the honest visual contrast with this organ\'s own basal-like/triple-negative entry, drawn separately, which sits at the opposite, high-grade end of the same real spectrum.',
  ariaSummary: 'Stylized microscopic field: irregular pink gland-like structures of varying size and shape, some forming clean rings around a central lumen and others distorted or incomplete, connected by solid multi-cell-wide cords of tumor cells infiltrating between them. Nuclei vary noticeably in size and shape from cell to cell. No necrotic zones and no dense lymphocyte clusters are present.',
  citation: 'WHO Classification of Tumours of the Breast, 6th ed. (Quinn et al., Histopathology, 2026, PMID 42011085); Elston & Ellis, Histopathology, 1991 (PMID 1757079); Rakha, Tse & Quinn, Histopathology, 2023 (PMID 36482272).',
  features: [
    { key:'glands', label:'Irregular glands',
      text:'Variably formed tubules and lumens — some rounded, some distorted or incomplete — reflecting the real, graded "tubule/gland formation" axis of the Nottingham system rather than the uniform rings of a purely well-differentiated pattern.' },
    { key:'trabeculae', label:'Trabecular cords',
      text:'Solid, multi-cell-wide strands of tumor cells infiltrating the stroma between glands — a real, named architectural pattern the WHO\'s own description of this entity states directly, distinct from the single-file cords this organ\'s lobular entry shows instead.' },
    { key:'pleomorphism', label:'Nuclear pleomorphism',
      text:'Real, visible cell-to-cell variation in nucleus size and shape — the second of the Nottingham grading system\'s three scored features, alongside gland formation and mitotic count.' },
  ],
};

// TRUNK_ILC's own counting-rule split (data rule 11's own discipline, applied here): E-cadherin
// (CDH1) LOSS BY ANY MECHANISM — DNA mutation, copy-number loss, or mRNA/protein loss together —
// is measured at 95% (120/127 by DNA+RNA; 100% of the 79 cases with DNA+RNA+protein all three,
// Ciriello et al., Cell, 2015, PMID 26451490) and independently corroborated at ~90% by protein
// loss alone across four citations this atlas's own research pass traced to Moll et al., Am J
// Pathol, 1993 (PMID 8256857) as the founding source. CDH1 MUTATION SPECIFICALLY (DNA sequencing
// only) is a separate, lower, real number: 63% (80/127, Ciriello 2015) and 65% (an independent
// 413-tumor cohort, Desmedt et al., J Clin Oncol, 2016, PMID 26926684) — two different real
// counts of two different things, not one figure restated. A real, direct contradiction in the
// literature is disclosed rather than smoothed over: Ciriello 2015 directly tested for CDH1
// promoter hypermethylation as a "second hit" (the mechanism this atlas's own gastric diffuse-
// type entry already documents for its own CDH1 trunk) and found none — "we did not detect
// significant DNA hyper-methylation... our results... do not support the reported occurrence of
// CDH1 epigenetic silencing in invasive breast cancer" — directly contradicting older, smaller
// studies PathologyOutlines still cites. Not resolved here; stated as the real, open disagreement
// it is, the same honesty standard this atlas's other cross-cohort discrepancies already hold to.
const TRUNK_ILC = [
  { gene:'CDH1 (E-cadherin) loss', class:'driver', ccf:'~90–95% by protein loss or any mechanism combined (Ciriello et al., Cell, 2015, PMID 26451490; corroborated to Moll et al., 1993) — near-universal, comparable to this atlas\'s own HGSOC entry (TP53, ~96%); ~63–65% by DNA mutation specifically (Ciriello 2015, 80/127; Desmedt et al., J Clin Oncol, 2016, PMID 26926684, independent 413-tumor cohort)', note:'Loss of the cell-adhesion protein E-cadherin is the mechanistic basis of this cancer\'s own defining architecture: without it, tumor cells cannot form the cohesive sheets or glands this organ\'s own ductal and triple-negative entries both show instead, and infiltrate singly or in single-file cords in their place — this atlas\'s gastric diffuse-type adenocarcinoma entry documents the identical mechanism independently, in a different organ.' },
];
// BRANCH PAIR, MUTUALLY EXCLUSIVE (Ciriello et al., 2015, PMID 26451490's own MEMo pathway
// analysis: "multiple mutually exclusive alterations in ILC converging on Akt signaling" across
// PIK3CA/PTEN/ERBB2) — split two sites each, the same architectural pattern this atlas already
// uses for GBM's EGFR/PDGFRA and prostate's TMPRSS2-ERG/SPOP pairs, not a new mutation-framing
// model. ERBB2 here is a POINT MUTATION in the kinase domain, not the amplification this organ's
// OWN ductal entry uses for the same gene — a real, striking, opposite-direction contrast
// confirmed across four independent sources spanning 2012–2025 (TCGA, Nature, 2012, PMID
// 23000897, the paper this atlas's own TNBC entry already cites, itself reporting 4/8 somatic
// ERBB2 variants in the lobular subtype, most kinase-domain; Desmedt et al., 2016; Davis et al.,
// EBioMedicine, 2022, PMID 36332363, OR 3.6 for ERBB2 mutation even in HR+/HER2-negative ILC;
// Davis et al., Clin Cancer Res, 2025, PMID 40810627).
const REGIONS_ILC = [
  { id:'YV', name:'Liver', color:cssVar('--azure'), pos3d:{x:0.9,y:-0.6,z:-0.5},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'~48% of ILC (61/127, Ciriello et al., Cell, 2015, PMID 26451490) — against 33% in IDC-NST', note:'Activates the PI3K growth pathway — real in both this organ\'s histologic types, genuinely more frequent here than in the ductal entry modeled alongside it, and largely mutually exclusive with the ERBB2 mutation modeled at this cancer\'s other two sites (both converge on the same Akt-signaling pathway).' } },
  { id:'YL', name:'Lung', color:cssVar('--amber'), pos3d:{x:1.6,y:1.4,z:0.6},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'~48% of ILC (61/127, Ciriello et al., Cell, 2015, PMID 26451490) — against 33% in IDC-NST', note:'Activates the PI3K growth pathway — real in both this organ\'s histologic types, genuinely more frequent here than in the ductal entry modeled alongside it, and largely mutually exclusive with the ERBB2 mutation modeled at this cancer\'s other two sites (both converge on the same Akt-signaling pathway).' } },
  { id:'YO', name:'Ovary', color:cssVar('--coral'), pos3d:{x:-1.3,y:-0.9,z:0.3},
    branch:{ gene:'ERBB2 (HER2) kinase-domain mutation', class:'driver', ccf:'a real, recurrent point mutation (not amplification) confirmed across four cohorts spanning 2012–2025, more frequent in ILC than IDC-NST', note:'A point mutation in the same growth-factor receptor gene this organ\'s own ductal entry amplifies instead — the opposite mechanism for the same gene, and largely mutually exclusive with the PIK3CA mutation modeled at this cancer\'s other two sites.' } },
  { id:'YG', name:'GI tract', color:cssVar('--violet'), pos3d:{x:-1.0,y:1.3,z:-0.3},
    branch:{ gene:'ERBB2 (HER2) kinase-domain mutation', class:'driver', ccf:'a real, recurrent point mutation (not amplification) confirmed across four cohorts spanning 2012–2025, more frequent in ILC than IDC-NST', note:'A point mutation in the same growth-factor receptor gene this organ\'s own ductal entry amplifies instead — the opposite mechanism for the same gene, and largely mutually exclusive with the PIK3CA mutation modeled at this cancer\'s other two sites.' } },
];
const PRIVATE_POOL_ILC = [
  { gene:'TBX3 mutation', class:'driver', ccf:'~9% of ILC (12/127) against 2% in IDC-NST (Ciriello et al., Cell, 2015, PMID 26451490)', note:'A transcription factor recurrently mutated across breast cancer broadly (TCGA, Nature, 2012) and, specifically, enriched in this organ\'s lobular entry, at a real, cited frequency distinct from its own rate in this organ\'s ductal entry.' },
  { gene:'FOXA1 mutation', class:'driver', ccf:'~7% of ILC (9/127) against 2% in IDC-NST (Ciriello et al., Cell, 2015, PMID 26451490)', note:'A transcription factor supporting estrogen-receptor signaling, with mutations clustering in its DNA-binding domain here — mutually exclusive with GATA3 (this organ\'s own ductal entry uses GATA3 instead, at the opposite frequency), so the two never compete for the same cell in this atlas\'s model.' },
  { gene:'TTN mutation', class:'passenger', note:'One of the largest genes in the human genome — mutated often simply because of its size, not because it drives this cancer. Included as this ledger\'s standard passenger, the same role it plays across this atlas\'s other pools.' },
];
// CHECKED AND HONESTLY NOT INCLUDED, per this atlas\'s own "declare a negative, don\'t just omit
// it" discipline: ESR1 point mutation (the classic acquired-endocrine-resistance mechanism) has
// no clean, ILC-specific mutation-rate primary source this pass could locate — a co-mutation
// signal exists (Davis et al., EBioMedicine, 2022) but that analysis stratifies by CDH1-mutation
// status across ALL metastatic breast cancer, not by an ILC-restricted population, so it supports
// cooperation in principle without supplying an ILC-specific figure to cite. GATA3 was checked and
// excluded for the opposite reason a below-floor entry would be — not absent, but WRONG DIRECTION:
// it is real and recurrent, but LOWER in ILC (5%) than in IDC-NST (13%, Ciriello 2015), so it is
// modeled at this organ's ductal entry instead, not here.

// HISTOLOGY — see js/histology.js's genILC and drawSingleFileCord for the drawing itself and its
// own header comment for the honest family-reuse accounting (partial, not zero-new-code: the
// single-file cord is a direct reuse of gastric diffuse-type's own primitive, extracted into a
// shared function the moment this became its second real consumer; the targetoid arrangement
// around a residual duct is genuinely new). StatPearls (Handelsman & Tomlinson-Hansen, 2026,
// PMID 32119465, NBK554578): "characteristic histologic pattern of small, noncohesive cells
// arranged in single-file strands... The infiltrating cords often present a concentric pattern
// around normal ducts." PathologyOutlines.com, "Invasive lobular carcinoma classic" (Li & Tse,
// last update 2026-04): "Can be arranged concentrically around normal ducts, giving a targetoid
// appearance... Desmoplastic reaction and necrosis uncommon." Classic variant confirmed dominant
// (55.8% of 981 ILC, Iorfida et al., Breast Cancer Res Treat, 2012, PMID 22399188) — the one
// drawn; solid/pleomorphic/alveolar/tubulolobular variants are real WHO-recognized forms, named
// but not drawn, this atlas's standard treatment for a minority variant landscape.
const HISTOLOGY_ILC = {
  intro: 'Invasive lobular carcinoma\'s defining feature is what it lacks: without E-cadherin, tumor cells cannot adhere to each other or form glands, so they infiltrate instead as small, discohesive cells — singly, or in single-file cords just one cell wide. Around a residual normal duct, these cords often wrap in a distinctive concentric ring, a "targetoid" pattern that is itself a recognized diagnostic feature. The cells themselves are small and strikingly uniform, with little nuclear atypia and low mitotic activity, and — in real contrast to this organ\'s own ductal entry — provoke almost no surrounding stromal reaction and essentially no necrosis.',
  ariaSummary: 'Stylized microscopic field: a central duct-like ring structure with short single-file cords of small, dark, evenly-spaced nuclei radiating outward from it in a wheel-like, concentric pattern. Additional short single-file cords and loosely scattered individual small cells are dispersed elsewhere in the field, all with minimal surrounding tissue reaction.',
  citation: 'StatPearls, "Invasive Lobular Carcinoma" (Handelsman & Tomlinson-Hansen, 2026, PMID 32119465, NBK554578); PathologyOutlines.com, "Invasive lobular carcinoma classic" (Li & Tse, 2026); Iorfida et al., Breast Cancer Res Treat, 2012 (PMID 22399188).',
  features: [
    { key:'targetoid', label:'Targetoid pattern',
      text:'Single-file cords of tumor cells wrapping concentrically around a residual normal duct — a real, named diagnostic feature, distinct from any random infiltration.' },
    { key:'singlefile', label:'Single-file cords',
      text:'Small, discohesive tumor cells arranged in thin, linear strands just one cell wide — the direct architectural consequence of losing E-cadherin, the cell-adhesion protein that would otherwise let them form glands or sheets.' },
    { key:'discohesion', label:'Discohesive cells',
      text:'Individual tumor cells dispersed loosely through the stroma rather than clustered — small, uniform, with little nuclear atypia and minimal surrounding tissue reaction, unlike the pleomorphism and infiltrative cords this organ\'s ductal entry shows instead.' },
  ],
};

export const cancerDetails = {
  tnbc: {
    title:'Triple-Negative Breast Cancer', screenLabel:'Triple-negative breast cancer — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_TNBC, trunk:TRUNK_TNBC, privatePool:PRIVATE_POOL_TNBC,
    histology: HISTOLOGY_TNBC,
  },
  idc: {
    title:'Invasive Breast Carcinoma of No Special Type (IDC)', screenLabel:'Invasive breast carcinoma, no special type — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_IDC, trunk:TRUNK_IDC, privatePool:PRIVATE_POOL_IDC,
    histology: HISTOLOGY_IDC,
  },
  ilc: {
    title:'Invasive Lobular Carcinoma', screenLabel:'Invasive lobular carcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern, hormone-receptor-adjusted)',
    regions:REGIONS_ILC, trunk:TRUNK_ILC, privatePool:PRIVATE_POOL_ILC,
    histology: HISTOLOGY_ILC,
  },
};
