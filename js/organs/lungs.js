import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
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
  { id:'luad',  name:'Adenocarcinoma',            share:'~40% of all lung cancers (NCI PDQ)',                 active:true,  organKey:'lungs' },
  { id:'lusc',  name:'Squamous cell carcinoma',   share:'~25% of all lung cancers (NCI PDQ)',              active:false, organKey:'lungs' },
  { id:'lcc',   name:'Large cell carcinoma',      share:'~10% of all lung cancers (NCI PDQ)',                 active:false, organKey:'lungs' },
  { id:'sclc',  name:'Small Cell Lung Cancer',    share:'~15% of all lung cancers (NCI PDQ) — a separate category from NSCLC entirely', active:false, organKey:'lungs' },
];

// Real anatomy, not procedural — and, unlike every other real-scan organ in this app, NOT from
// the NIH 3D "Human Reference Atlas" library: "Realistic Human Lungs" by neshallads
// (Sketchfab), license verified verbatim on its model page ("CC Attribution / Creative Commons
// Attribution" — i.e. CC BY 4.0, attribution legally required and carried in #disclaimer),
// https://sketchfab.com/3d-models/realistic-human-lungs-ce09f4099a68467880f46e61eb9a3531.
// WHY THE SWAP (2026-09-01, replacing the HRA/VHD-derived mesh this file used since the
// real-mesh pass): the HRA lung mesh has NO interlobar fissures at all — the single anatomical
// feature a lungs model is most obviously missing — and the HRA library offers no alternative
// (source exhausted, not under-searched). This model has them SCULPTED INTO THE GEOMETRY,
// verified by flat-shaded component renders, not read off the thumbnail: a deep oblique fissure
// plus a subtler mid-height horizontal fissure on the right lung (two fissures = anatomically
// correct) and one oblique groove on the left — each lung still one watertight piece, grooves,
// not disconnected lobes. Full provenance/analysis in CLAUDE.md's organ-mesh-source history.
//
// assets/lungs.glb: source GLB -> Blender 5.2 headless -> weld each mesh object
// (remove_doubles, threshold = bbox_diagonal x 1e-5), separate by loose parts, then identify
// the TRUE components BY WELDED VERTEX COUNT (object names after separation are unreliable):
// KEPT trachea+main bronchi (13,215v), left lung (4,461v, bbox-center x>0), right lung
// (4,412v, x<0 — and the larger of the two in every bbox dimension, matching real right-lung
// anatomy); DROPPED larynx (5,396v) and thyroid gland (4,513v) — real anatomy, wrong organ for
// this viewer. Original materials/textures preserved untouched. Centering BAKED into the GLB
// (world-bbox center -> origin, verified by re-import), matching this file's own convention —
// the old lungs.glb was origin-centered too, and buildLungsMesh has never done the
// gltf.scene.position.sub(center) node-recenter colon.js/pancreas.js need. Real-world meters:
// assembly 0.223 x 0.369 x 0.142m (the 0.369 is trachea-top to lung-base). 14.9MB on disk vs
// the old mesh's 3.5MB — textures dominate (13.6MB, over half of it the two 2048px normal
// maps); size flagged as an open decision in the review packet, deliberately not recompressed
// here. Loaded async, unlike the procedural buildMesh functions — GLTFLoader has no synchronous
// path — so this returns a Promise<THREE.Object3D>; initOrganViewer() in main.js wraps every
// organ's buildMesh() result in Promise.resolve() so both kinds share one code path.
//
// MATERIALS — the asset's own baked textures, kept; the shared organ recipe deliberately NOT
// applied (owner decision made before integration, not an omission): every other real-scan
// organ replaces its imported material with a flat verified-tissue-color MeshPhysicalMaterial
// plus applyTissueMottleVertexColors — a recipe that exists to fake surface variation on
// untextured scan geometry. This asset ships real baked color/normal/AO/specular maps, so the
// authored textures ARE the material. Honest caveat, stated not smoothed over: the artist's
// baked tone is a mottled pink-RED, visibly redder than the "pinkish-gray" gross-pathology
// tone the old flat 0xb08d90 was verified against — the swap trades that one verified average
// color for real per-texel variation the flat hex never had (that hex now lives on only in the
// sidebar thumbnail, which renders every organ as its flat tissue color by design). Painting a
// procedural gray-multiplier mottle over a real texture would fight it, so neither
// the material override nor the mottle call is made for this organ. The GLB carries
// KHR_materials_specular, so GLTFLoader builds MeshPhysicalMaterial with a real
// specularIntensity map — the imported material already has the specular control the clip-fix
// pass had to add by hand elsewhere; measured blown-white stayed 0.0% at every sampled angle.
//
// COLOR SPACE — tested live, not assumed, because this app's pipeline is the unusual one
// (viewer.js: ColorManagement.enabled=false + LinearSRGBColorSpace out, no tone mapping —
// i.e. no output re-encode). GLTFLoader tags baseColor maps SRGBColorSpace, which uploads
// them as sRGB internal format: the GPU DECODES them to linear on sampling — that half still
// happens with ColorManagement off — but nothing re-encodes on the way out, so the texture
// gets gamma-crushed exactly once with no round trip. Measured on the live default view:
// loader-default sRGB gave mesh mean RGB (118,35,34) — a dark, oversaturated blood-red,
// R/G 3.4 — vs (153,80,73), R/G 1.9, with the decode disabled; the source model's authored
// look (its own textures under neutral light in the build pass's Cycles renders) is the soft
// mottled pink-red the second one shows. So the decode is disabled below: NoColorSpace ==
// "leave the authored sRGB bytes alone", the same already-encoded-in/unencoded-out treatment
// every hand-picked hex color in this app gets under this pipeline (LinearSRGBColorSpace on
// the map would behave identically here; NoColorSpace is used as the explicit opt-out).
// Rejected alternative — loader default sRGB — kept as a side-by-side capture in the
// integration review packet. Non-color maps (normal/AO/roughness/specular) are already
// NoColorSpace-equivalent from the loader and are untouched.
export function buildLungsMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/lungs.glb', (gltf)=>{
      gltf.scene.traverse(o=>{
        if(o.isMesh && o.material && o.material.map){
          // PIPELINE CORRECTION 2026-09-03: was NoColorSpace (the legacy double-decode fix, see this
          // file's history + CLAUDE.md); corrected pipeline needs the glTF-default sRGB decode.
          o.material.map.colorSpace = THREE.SRGBColorSpace;
          o.material.map.needsUpdate = true;
        }
      });
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
  // Real-world-meter GLB — theta/phi still set the initial viewing angle, but radius is
  // replaced by initOrganViewer's frameContents() call once the model loads. minRadius/
  // maxRadius still matter (OrbitControls' zoom floor/ceiling, which frameContents never
  // widens except upward). Rescaled for the new asset by the Bladder-precedent derivation —
  // old values x the ratio of bbox largest dimensions, not fresh guesses: old mesh 0.2511m
  // largest dim with 0.15/1.2, new assembly 0.3687m -> x1.468 -> 0.22/1.76 (radius 0.73 by
  // the same ratio, moot once frameContents runs).
  viewer:{ theta:0.5, phi:1.15, radius:0.73, minRadius:0.22, maxRadius:1.76, autoRotateRadPerFrame:0.0016 },
  // Rewritten with the asset swap: the old text described the previous mesh ("an elongated
  // organic form tapering at top and bottom" — and before that, the procedural single-lung
  // ellipsoid). This is a visual description of the model, not sourced medical content, so it
  // has to track what is actually on screen now: both lungs plus the airway.
  viewerAria:'Three-dimensional model of the paired lungs joined by the trachea and main '
    + 'bronchi, mottled pinkish-red with visible interlobar fissure grooves, with four glowing '
    + 'teal points marking the structures listed after it. Drag to rotate, scroll to zoom.',
  // pos: literal anchor points (meters, local mesh space of the origin-centered GLB) — derived
  // GEOMETRICALLY from the welded components in the Blender build script (Bladder precedent:
  // verify each anchor against its own geometry numerically, don't eyeball one and assume the
  // rest), then confirmed in the live app both numerically (nearest-vertex distance per anchor
  // against the loaded GLB, all <=1mm) and visually (all four dots at the default camera).
  // Labels/text unchanged — all source-verified; only the anchor coordinates moved:
  //   bronchi = the airway component's own vertex centroid (sits inside the trachea just above
  //             the bifurcation, where the main bronchi begin);
  //   alveoli = most-lateral left-lung vertex in the lower-middle height band (the periphery,
  //             which is exactly where the text places the alveoli);
  //   pleura  = a vertex ON the right lung's oblique fissure groove, found as a concave-crease
  //             cluster (signed dihedral angle) and confirmed by marked renders — the visceral
  //             pleura really does line the interlobar fissures, so the marker showcasing the
  //             new mesh's defining feature is also anatomically honest;
  //   hilum   = the right-lung vertex nearest the airway component (0.5mm gap — literally
  //             where the bronchus meets the lung).
  hotspots:[
    { key:'bronchi', label:'Bronchi', pos:[-0.0042,0.0394,0.0179],
      text:'The airway branches that carry air from the trachea into each lung, then subdividing into progressively smaller passages. Squamous cell lung carcinoma tends to arise in the larger, more central airways here.' },
    // Directly parallel to the ovary's surface-epithelium point and breast's ducts: this is
    // the "arises here" structure for this organ, framed the same way for the same reason.
    { key:'alveoli', label:'Alveoli', pos:[0.1114,-0.1309,0.0158],
      text:'The ~300 million tiny air sacs where gas exchange actually happens, out at the lung\'s periphery. Adenocarcinoma, the most common lung cancer subtype, most commonly arises here — directly paralleling how ovarian cancer begins in the ovary\'s surface epithelium and breast cancer in the breast\'s ducts.' },
    { key:'pleura', label:'Pleura', pos:[-0.0890,-0.0634,0.0453],
      text:'The thin double membrane covering the lung\'s outer surface and lining the chest cavity, letting the lung expand and contract smoothly against the chest wall with each breath.' },
    { key:'hilum', label:'Hilum', pos:[-0.0362,-0.0215,0.0134],
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
