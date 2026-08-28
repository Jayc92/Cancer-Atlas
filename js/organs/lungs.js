import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cssVar } from '../viewer.js';

// active:true, plus 'nsclc'/'adenocarcinoma'/'luad' aliases — searching any of those finds
// Lungs, same pattern as Breast below. Checked for collision first: no other organ or cancer
// in this file uses "adenocarcinoma," "nsclc," or "luad" anywhere (breast's subtypes are named
// Luminal A/B, HER2-enriched, and TNBC — never "adenocarcinoma" as a literal string), so no
// disambiguation was needed.
export const organEntry = { key:'lungs', label:'Lungs', system:'Respiratory', active:true, sexes:['female','male'], aliases:['lung','lungs','pulmonary','respiratory','nsclc','adenocarcinoma','luad','lung cancer'] };

export const markerSpec = { points:[{heightFrac:0.66, angle:0}] };

export const cancerEntries = [
  // NCI PDQ subtype breakdown. SCLC is deliberately listed even though it's not a subtype of
  // NSCLC at all — a wholly separate category — same reasoning as HGSOC's list including the
  // non-serous ovarian subtypes: completeness matters more than only showing what's active.
  { id:'luad',  name:'Adenocarcinoma',            share:'~40% of NSCLC',                 active:true,  organKey:'lungs' },
  { id:'lusc',  name:'Squamous cell carcinoma',   share:'~25–30% of NSCLC',              active:false, organKey:'lungs' },
  { id:'lcc',   name:'Large cell carcinoma',      share:'~10% of NSCLC',                 active:false, organKey:'lungs' },
  { id:'sclc',  name:'Small Cell Lung Cancer',    share:'~15% of all lung cancers — a separate category from NSCLC entirely', active:false, organKey:'lungs' },
];

// Real anatomy, not procedural: NIH 3D Print Exchange, "Human Reference Atlas 3D Reference
// Object Library" (account "HRA"), entry 3DPX-020974 — traced from the Visible Human Dataset
// (Spitzer & Whitlock, 2002). CC BY 4.0, quoted and confirmed directly on the entry page, same
// standard applied to the body meshes above. Full sourcing, license text, decimation reasoning,
// and the Ovary/Breast-still-procedural note are recorded in CLAUDE.md rather than repeated in
// every one of these five organ files.
//
// assets/lungs.glb: STL -> Blender headless (remove_doubles weld, shade_smooth_by_angle,
// Decimate COLLAPSE 0.4, origin_set to bounds-center) -> GLB, real-world meters. Loaded async,
// unlike every buildMesh above — GLTFLoader has no synchronous path — so this returns a
// Promise<THREE.Object3D> instead of an Object3D directly. initOrganViewer() in main.js wraps
// every organ's buildMesh() result in Promise.resolve() specifically so this and the procedural
// organs above share one code path.
//
// MATERIAL COLOR (real-tissue pass, verified before picking): the old 0xdba9a0 was a pale
// peachy-tan, closer to skin tone than lung tissue. Real fresh adult lung is pinkish-gray, not
// tan — confirmed across gross-pathology sources (a normal adult lung is "pinkish-gray" with
// mottled grayish patches from anthracosis, harmless carbon-pigment deposition present in
// nearly all adults from lifelong particulate exposure — corroborated by Monash Pathology's
// anthracosis notes and PathologyOutlines.com's description of the same pigment pattern).
// 0xb08d90 is a real, more-saturated dusty pink-gray, not tan — picked to survive lighting
// without washing toward white, same fix as Brain's material.
export function buildLungsMesh(){
  const loader = new GLTFLoader();
  return new Promise((resolve, reject)=>{
    loader.load('assets/lungs.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity 0.15, NOT MeshStandardMaterial (clip-fix
      // pass): this ports the missing half of the approved material verification — the
      // Blender renders the tissue colors were verified and approved on had Specular IOR
      // Level 0.15 baked in, but MeshStandardMaterial has no specular control at all, so the
      // live app kept full-strength dielectric specular. Under the legacy hard-clip pipeline
      // that blew grazing-angle fold/fissure walls to flat white (up to 26% of the lungs'
      // on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
      // js/viewer.js's warm-lighting comment. Color/roughness values unchanged.
      const mat = new THREE.MeshPhysicalMaterial({ color:0xb08d90, roughness:0.65, metalness:0.0, specularIntensity:0.15 });
      gltf.scene.traverse(o=>{ if(o.isMesh) o.material = mat; });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Respiratory System', title:'Lungs',
  sub:'Paired organs · thoracic cavity · gas exchange via ~300 million alveoli',
  facts:[
    {label:'Location', val:'Paired, filling most of the thoracic cavity'},
    {label:'Function', val:'Gas exchange across ~300 million alveoli'},
    {label:'Blood supply', val:'Dual: pulmonary arteries (deoxygenated) &amp; bronchial arteries'},
  ],
  // The dual-blood-supply fact is worth a second sentence, not just a facts-grid line: it's
  // the one place in the body where "artery" doesn't mean "carries oxygenated blood" — the
  // pulmonary arteries carry deoxygenated blood *to* the lungs to be oxygenated, while the
  // separate bronchial arteries feed the lung tissue itself with already-oxygenated blood.
  desc:'The lungs fill most of the thoracic cavity, each connected to the airway via a bronchus entering at the hilum. Uniquely among organs, the lungs have two separate blood supplies: pulmonary arteries carrying deoxygenated blood to the ~300 million alveoli for gas exchange — the one place in the body where "artery" means deoxygenated, not oxygenated — plus separate bronchial arteries that feed the lung tissue itself with oxygenated blood.',
  buildMesh: buildLungsMesh,
  // Real-world-meter GLB (bbox ~25x15x22cm) — theta/phi still set the initial viewing angle,
  // but radius/minRadius/maxRadius (tuned for the old ~1-2 unit procedural mesh) are replaced
  // by initOrganViewer's frameContents() call once the model loads. minRadius/maxRadius here
  // still matter, though: they set OrbitControls' actual zoom floor/ceiling, which frameContents
  // never widens except upward, so they're re-scaled to this mesh's real size rather than left
  // at the old unit-scale numbers, which would have locked the camera out of ever zooming in.
  viewer:{ theta:0.5, phi:1.15, radius:0.5, minRadius:0.15, maxRadius:1.2, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a lung, an elongated organic form tapering at top and '
    + 'bottom, with four glowing teal points marking the structures listed after it. Drag to '
    + 'rotate, scroll to zoom.',
  // pos: a literal anchor point (meters, local mesh space) found by raycasting against the real
  // assets/lungs.glb surface in a one-off picker tool, then eyeballed against render_preview.py
  // screenshots for anatomical sense — not the old dir-vector-times-ellipsoid-scale trick, which
  // only ever worked because the procedural lung was itself a scaled ellipsoid. Labels/text are
  // unchanged from the procedural version; only the anchor coordinates moved.
  hotspots:[
    { key:'bronchi', label:'Bronchi', pos:[-0.0436,-0.0124,-0.0201],
      text:'The airway branches that carry air from the trachea into each lung, then subdividing into progressively smaller passages. Squamous cell lung carcinoma tends to arise in the larger, more central airways here.' },
    // Directly parallel to the ovary's surface-epithelium point and breast's ducts: this is
    // the "arises here" structure for this organ, framed the same way for the same reason.
    { key:'alveoli', label:'Alveoli', pos:[0.0819,-0.0603,0.0819],
      text:'The ~300 million tiny air sacs where gas exchange actually happens, out at the lung\'s periphery. Adenocarcinoma, the most common lung cancer subtype, most commonly arises here — directly paralleling how ovarian cancer begins in the ovary\'s surface epithelium and breast cancer in the breast\'s ducts.' },
    { key:'pleura', label:'Pleura', pos:[-0.1059,0.0480,0.0824],
      text:'The thin double membrane covering the lung\'s outer surface and lining the chest cavity, letting the lung expand and contract smoothly against the chest wall with each breath.' },
    { key:'hilum', label:'Hilum', pos:[-0.0229,-0.0002,-0.0668],
      text:'The root of the lung, on its medial surface — where the bronchus, pulmonary vessels, bronchial vessels, and nerves all enter and exit.' },
  ],
};

// Real distant-metastasis sites for NSCLC generally (Riihimäki et al., Lung Cancer, 2014 —
// a dedicated population-based metastatic-pattern study, 17,431 Swedish patients): bone and
// the nervous system (overwhelmingly brain, clinically) are among the most frequent sites
// across lung cancer, with bone the single most common site specifically for adenocarcinoma
// (~39% of adenocarcinoma patients who develop metastases). Liver and adrenal gland are the
// paper's other two top-five sites. Site→gene assignment is illustrative from the start here,
// same as HGSOC and TNBC — none of the branch genes below are reported by their source studies
// as specific to the site they're shown at.
//
// STANDING RULE FOR THIS ORGAN, checked before every gene below was added, not after shipping:
// KRAS, EGFR, ALK, and ROS1 (among other NSCLC driver oncogenes) are clinically
// mutually exclusive within one tumor (TCGA, Nature, 2014, "Comprehensive molecular profiling
// of lung adenocarcinoma"; reconfirmed by TRACERx — Jamal-Hanjani et al., NEJM, 2017). This
// tumor's trunk is KRAS. That means EGFR, ALK, ROS1, or any other alternative driver oncogene
// must never appear anywhere in this cancer's branch or private pools — a real KRAS-driven
// tumor does not also carry one of those. That would repeat the exact mistake TNBC's
// ESR1/MDM4 branch mutations made (real gene, real frequency, wrong tumor) — see the CLAUDE.md
// data rule that mistake produced. Every gene below is instead chosen specifically because it
// co-occurs with or acts downstream of KRAS, not because it's merely "real and common in NSCLC
// somewhere": STK11 and KEAP1 are both named by TRACERx (Frankell et al., Nature, 2023)
// alongside KRAS itself as subject to *subclonal* (not just truncal) selection in LUAD, and are
// extensively documented as KRAS-co-occurring in the clinical literature (Skoulidis et al.,
// Cancer Discovery, 2018 — STK11/KEAP1-mutant, KRAS-mutant tumors show primary resistance to
// PD-1 blockade). PIK3CA and SMARCA4 (a SWI–SNF chromatin remodeler) are also both named
// explicitly by that same TRACERx paper as under significant subclonal selection in LUAD.
const REGIONS_LUAD = [
  { id:'SB', name:'Bone', color:cssVar('--coral'), pos3d:{x:-1.3,y:-0.9,z:0.3},
    branch:{ gene:'STK11 loss-of-function mutation', class:'driver', ccf:'recurrent, KRAS-co-occurring subclonal event (Frankell et al., Nature, 2023 — TRACERx)', note:'Removes a tumor-suppressor brake on cell metabolism and growth signaling downstream of KRAS rather than competing with it — and, separately, a well-documented driver of resistance to PD-1/PD-L1 checkpoint immunotherapy specifically in KRAS-mutant tumors.' } },
  { id:'CB', name:'Brain', color:cssVar('--azure'), pos3d:{x:-0.2,y:1.35,z:0.2},
    branch:{ gene:'KEAP1 mutation', class:'driver', ccf:'recurrent, frequently co-occurs with KRAS and STK11 (Frankell et al., Nature, 2023 — TRACERx)', note:'Activates the NRF2 oxidative-stress-response pathway — a metabolic advantage layered on top of KRAS signaling, not an alternative to it, and another established contributor to immunotherapy resistance alongside STK11.' } },
  { id:'HL', name:'Liver', color:cssVar('--amber'), pos3d:{x:0.9,y:-0.6,z:-0.5},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'recurrent subclonal event in LUAD (Frankell et al., Nature, 2023 — TRACERx)', note:'Activates the PI3K growth pathway independently of KRAS\'s own RAS/MAPK signaling — a parallel route to proliferation, not a substitute for KRAS.' } },
  { id:'AD', name:'Adrenal gland', color:cssVar('--violet'), pos3d:{x:1.1,y:0.6,z:-0.3},
    branch:{ gene:'SMARCA4 alteration', class:'driver', ccf:'SWI–SNF chromatin-remodeling gene under significant subclonal, but not truncal, selection in LUAD (Frankell et al., Nature, 2023 — TRACERx)', note:'Disrupts chromatin remodeling rather than any growth-factor or RAS-pathway signaling — a mechanistically separate hit that adds to tumor evolution without needing to compete with the trunk KRAS mutation for the same pathway.' } },
];
// Deliberately not a single dominant trunk the way TP53 is for HGSOC/TNBC — that's the real
// biological difference this cancer is included to show. KRAS is simply the single most common
// driver, not a near-universal founding event, and TRACERx found that even KRAS (and TP53) are
// frequently subject to *subclonal* selection rather than purely truncal — i.e. not even KRAS
// itself is safe to treat as "always present in every cell," let alone universal the way TP53
// is in HGSOC. Stated explicitly in the note rather than left for the panel heading alone to imply.
const TRUNK_LUAD = [
  { gene:'KRAS mutation', class:'driver', ccf:'33% of lung adenocarcinoma — the single most common driver, not a near-universal founder (TCGA, Nature, 2014)', note:'Unlike HGSOC\'s TP53 (~96%) or TNBC\'s TP53 (~80%), lung adenocarcinoma has no single founding mutation at that frequency. KRAS is just the most common of several possible initiating drivers — TCGA (Nature, 2014) reports it as mutually exclusive with EGFR (14%) — and TRACERx (Frankell et al., Nature, 2023) found that even KRAS itself is frequently subject to additional subclonal selection later in a tumor\'s evolution, not purely a fixed founding event the way TP53 is modeled elsewhere in this atlas.' },
];
const PRIVATE_POOL_LUAD = [
  { gene:'MET amplification', class:'driver', note:'Activates a bypass growth-signaling receptor independent of KRAS\'s own pathway — documented as a recurrent mechanism of acquired resistance specifically in KRAS-mutant tumors treated with KRAS G12C inhibitors (Awad et al., NEJM, 2021), not just a generic resistance gene borrowed from elsewhere in NSCLC.' },
  { gene:'CDKN2A loss', class:'driver', note:'Removes a cell-cycle checkpoint (the p16 brake on CDK4/6) — a common co-occurring event alongside KRAS rather than an alternative driver, adding proliferative pressure without touching RAS signaling itself.' },
  { gene:'ARID1A mutation', class:'driver', ccf:'~7% of lung adenocarcinoma (TCGA, Nature, 2014)', note:'Disrupts SWI/SNF chromatin remodeling — the same mechanistic category as SMARCA4 above, and independent of KRAS\'s own RAS/MAPK signaling entirely.' },
  { gene:'RB1 loss', class:'driver', ccf:'~4% of lung adenocarcinoma (TCGA, Nature, 2014)', note:'Removes a cell-cycle checkpoint — a common co-occurring event alongside KRAS rather than an alternative driver, adding proliferative pressure without touching RAS/MAPK or PI3K signaling at all.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly at the source): the five
// growth patterns and predominant-pattern rule come from the classification itself — Travis
// et al., J Thorac Oncol, 2015 (the 2015 WHO paper, PMID 26291008) and the IASLC/ATS/ERS
// classification it adopted (Travis et al., J Thorac Oncol, 2011: invasive adenocarcinomas
// "classified by predominant pattern" across lepidic/acinar/papillary/micropapillary/solid).
// The multi-pattern visual field is not a compromise but the honest rendering: the WHO paper
// itself says these tumors "frequently are composed of complex heterogeneous mixtures of
// patterns," and Travis 2011 notes >90% were "mixed subtype" under the old 2004 system.
// Acinar as the most common predominant pattern is from Yoshizawa et al., Mod Pathol, 2011
// (232/514 = 45% of a landmark stage I cohort — the largest single group). Pattern
// one-liners confirmed at PathologyOutlines' "Adenocarcinoma overview."
const HISTOLOGY_LUAD = {
  intro: 'Invasive lung adenocarcinoma is classified into five WHO growth patterns — lepidic, acinar, papillary, micropapillary and solid — by whichever pattern predominates, because real tumors are frequently complex heterogeneous mixtures. Three of the five are drawn side by side here: acinar (round glands invading fibrous stroma — the most common predominant pattern, 45% in the landmark stage I cohort), lepidic (tumor cells lining intact alveolar walls — the low-grade end), and solid (sheets with no gland formation — the high-grade end, alongside micropapillary, neither of which is drawn).',
  ariaSummary: 'Stylized microscopic field showing three lung adenocarcinoma growth patterns side by side. Left: half a dozen discrete round glands with open lumens invading pale fibrous stroma — the acinar pattern. Middle: thin branching alveolar walls studded with small tumor nuclei, the airspaces between them preserved — the lepidic pattern. Right: a dense sheet of tumor cells with no gland formation — the solid pattern.',
  citation: 'Travis et al., J Thorac Oncol, 2015 (WHO) & 2011 (IASLC/ATS/ERS); Yoshizawa et al., Mod Pathol, 2011; PathologyOutlines.com, "Adenocarcinoma overview."',
  features: [
    { key:'acinar', label:'Acinar pattern',
      text:'Gland-forming: round to oval glands invading fibrous stroma. The most common predominant pattern — 232 of 514 tumors (45%) in the landmark stage I cohort — and intermediate-grade, along with papillary.' },
    { key:'lepidic', label:'Lepidic pattern',
      text:'Tumor cells proliferating along intact alveolar walls, lacking architectural complexity — growth that preserves the lung’s own scaffolding. The low-grade end of the five patterns.' },
    { key:'solid', label:'Solid pattern',
      text:'Sheets of neoplastic cells with no recognizable gland formation — the high-grade end of the spectrum, together with the micropapillary pattern (not drawn here).' },
  ],
};

export const cancerDetails = {
  luad: {
    title:'Lung Adenocarcinoma', screenLabel:'Lung adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_LUAD, trunk:TRUNK_LUAD, privatePool:PRIVATE_POOL_LUAD,
    histology: HISTOLOGY_LUAD,
  },
};
