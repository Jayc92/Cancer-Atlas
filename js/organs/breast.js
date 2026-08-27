import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cssVar } from '../viewer.js';

// active:true, plus 'triple negative'/'tnbc' aliases — searching either finds Breast, since
// search resolves to an organ (not a cancer directly); the cancer itself is one click further,
// same as searching "ovary" doesn't skip straight to HGSOC.
export const organEntry = { key:'breast', label:'Breast', system:'Reproductive', active:true, sexes:['female','male'], aliases:['breast','breasts','mammary','triple negative','triple-negative','tnbc'] };

export const markerSpec = { points:[{heightFrac:0.70, angle:-35}, {heightFrac:0.70, angle:35}] };

export const cancerEntries = [
  { id:'lumA',  name:'Luminal A carcinoma',          share:'~50–60% of breast carcinomas', active:false, organKey:'breast' },
  { id:'lumB',  name:'Luminal B carcinoma',          share:'~15–20% of breast carcinomas', active:false, organKey:'breast' },
  { id:'her2',  name:'HER2-enriched carcinoma',      share:'~10–15% of breast carcinomas', active:false, organKey:'breast' },
  { id:'tnbc',  name:'Triple-negative (basal-like) carcinoma', share:'~10–20% of breast carcinomas', active:true, organKey:'breast' },
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
export function buildBreastMesh(){
  const loader = new GLTFLoader();
  return new Promise((resolve, reject)=>{
    loader.load('assets/breast.glb', (gltf)=>{
      const mat = new THREE.MeshStandardMaterial({ color:0xe8bdae, roughness:0.58, metalness:0.03 });
      gltf.scene.traverse(o=>{ if(o.isMesh) o.material = mat; });
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
  desc:'The breast sits on the chest wall over pectoralis major, made up of milk-producing lobules connected by a branching network of ducts to the nipple, all embedded in stromal and fatty tissue that gives the organ most of its bulk and shape.',
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
      text:'The branching channels that carry milk from the lobules toward the nipple. About 85% of invasive breast cancers arise from duct cells (hence "ductal carcinoma") — directly paralleling how most ovarian cancers begin in the ovary\'s own surface epithelium rather than deeper inside the organ.' },
    { key:'lobules', label:'Lobules', pos:[0.0216,0.0016,0.0891],
      text:'Clusters of small glands that produce milk during lactation, feeding into the duct network. A smaller share of invasive cancers ("lobular carcinoma") arise here instead of in the ducts.' },
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
  { gene:'BRCA1 alteration (germline or somatic)', class:'driver', ccf:'~15–20% of TNBC', note:'Loss of homologous-recombination repair capacity — found in a meaningful minority of TNBC specifically, and a determinant of PARP-inhibitor and platinum-chemotherapy sensitivity here too.' },
  { gene:'PIK3CA mutation', class:'driver', ccf:'~9% of basal-like tumors — well below the ~39% mutation rate across breast cancer overall, since PIK3CA mutations cluster heavily in ER-positive/luminal disease', note:'Activates the PI3K growth pathway; the frequency gap here is itself informative about how differently this subtype is wired.' },
  { gene:'CCND1 amplification', class:'driver', note:'Extra copies of a cell-cycle gene (cyclin D1) that pushes cells through division — a recurrent focal amplification in breast cancer broadly.' },
  { gene:'MYC amplification', class:'driver', note:'Extra copies of a master growth-signaling gene — one of the more common focal amplifications in basal-like breast cancer genomes specifically.' },
  { gene:'PTEN loss', class:'driver', note:'Removes a brake on the PI3K growth pathway — a route to the same growth advantage PIK3CA mutations reach by a different door, and more frequent in basal-like tumors than PIK3CA mutation itself.' },
];

export const cancerDetails = {
  tnbc: {
    title:'Triple-Negative Breast Cancer', screenLabel:'Triple-negative breast cancer — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_TNBC, trunk:TRUNK_TNBC, privatePool:PRIVATE_POOL_TNBC,
  },
};
