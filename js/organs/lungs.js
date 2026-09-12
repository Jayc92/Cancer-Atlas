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
  { id:'luad',  name:'Adenocarcinoma',            share:'~40% of all lung cancers (NCI PDQ) — declining relative share as adenocarcinoma has overtaken it in most countries', active:true,  organKey:'lungs' },
  { id:'lusc',  name:'Squamous cell carcinoma',   share:'~25% of all lung cancers, confirmed current (NCI PDQ, 2026; StatPearls\' independent ~30% of NSCLC nets to the same figure) — though a declining share historically, once the most common subtype in many populations before adenocarcinoma overtook it (Cheng et al., J Thorac Oncol, 2016, PMID 27364315)', active:true, organKey:'lungs' },
  // lcc's own share is NOT a stable, citable figure — see data rule 33 for the full verification
  // trail. Kept inactive (no site model, staging, or stable driver profile exists in modern
  // literature to author one), but given the below-floor blurb+trials treatment: the boundary
  // mechanism built for incidence-floor entries (psignet/pmuc) generalizes cleanly to a
  // DIFFERENT real reason an entry doesn't clear full authoring — definitional instability
  // rather than rarity — since the mechanism itself (name/share/one line/citation/trials, nothing
  // else) never depended on which reason applied.
  { id:'lcc',   name:'Large cell carcinoma',      share:'Historically cited as ~10% of lung cancers (NCI PDQ) — but this figure predates routine immunohistochemistry. Modern IHC-based reclassification collapses most cases into adenocarcinoma (~60%) or squamous cell carcinoma (~20%), leaving only a small marker-null remainder (Rekhtman et al., Mod Pathol, 2013, PMID 23196793) — one review calls it becoming "an \'endangered species\'" in current pathology practice.', active:false, organKey:'lungs',
    blurb:'No stable modern population-level share, site model, or driver profile exists for this entity: a SEER-scale study of five defined lung-cancer histotypes (Brainson et al., Clin Lung Cancer, 2021, PMID 33958300) carries no separate "large cell carcinoma" category at all — it falls into a heterogeneous "Other" bucket alongside various complex/ambiguous histologies. Even its genomics are a real, checked-and-honest negative: mutations largely mirror the adenocarcinoma spectrum at reduced frequency rather than forming a distinct driver profile of their own (Rekhtman et al., 2013).' },
  { id:'sclc',  name:'Small Cell Lung Cancer',    share:'~15% of all lung cancers (NCI PDQ) — a separate category from NSCLC entirely; the most recent dedicated epidemiologic-trend analysis puts the current figure closer to ~11% and still declining (Cittolin-Santos et al., Cancer, 2024, PMID 38470453)', active:true, organKey:'lungs' },
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
  // The dual-blood-supply fact is worth a second sentence, not just a facts-grid line: in the
  // adult body this is the only place where "artery" doesn't mean "carries oxygenated blood" —
  // the pulmonary arteries carry deoxygenated blood *to* the lungs to be oxygenated, while the
  // separate bronchial arteries feed the lung tissue itself with already-oxygenated blood.
  // TWO CORRECTIONS HERE, AND ONLY ONE OF THEM IS ABOUT THIS ATLAS. The desc used to open
  // "Uniquely among organs, the lungs have two separate blood supplies", which is wrong about
  // ANATOMY and not merely unscoped: the liver's portal vein plus hepatic artery is the textbook
  // co-example, and liver.js:118 asserted the mirror-image claim, so each record was the other's
  // counterexample. Naming the liver is the repair — a downgrade to "one of few" would have been
  // vaguer AND still uncheckable. Separately, "the one place in the body" is qualified to the
  // ADULT body, because the umbilical artery carries deoxygenated blood in fetal circulation;
  // that qualifier is narrow on purpose, since the claim is true and useful for every reader who
  // is not looking at a fetus.
  desc:'The lungs fill most of the thoracic cavity, each connected to the airway via a bronchus entering at the hilum. Like the liver, the lungs have two separate blood supplies: pulmonary arteries carrying deoxygenated blood to the ~300 million alveoli for gas exchange — the only place in the adult body where "artery" means deoxygenated, not oxygenated — plus separate bronchial arteries that feed the lung tissue itself with oxygenated blood.',
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
      text:'The airway branches that carry air from the trachea into each lung, then subdividing into progressively smaller passages. Squamous cell lung carcinoma tends to arise in the larger, more central airways here — and small cell lung cancer arises from pulmonary neuroendocrine cells within this same bronchial epithelium, also typically in the central airways (StatPearls, NBK482458).' },
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
// EXCLUDED FROM THIS POOL, RECORDED RATHER THAN LEFT AS AN ABSENCE (2026-09-07, on ruling):
// - RB1 loss: SOFT exclusion, MECHANISTIC-FIT class. NOT an exclusivity claim — nothing here says
//   the two cannot co-occur, and the LUAD source read for the CDKN2A entry below is SILENT on the
//   pair, which is recorded as silence and is NOT support. The ground is duplication, and it is
//   THIS FILE'S OWN rather than imported from another organ: both notes said the alteration
//   "Removes a cell-cycle checkpoint" and called it "a common co-occurring event alongside KRAS
//   rather than an alternative driver, adding proliferative pressure", in near-identical words, in
//   this same pool. One of the two had to go, and CDKN2A stays because it is the locus this
//   cancer's own source calls its most significant deletion.
//   THE CIRCUIT IS HAND-CITED UNDER THE CLASSIFICATION-FACT EXCEPTION (mechanism prose, stable, one
//   canonical source): p16 binds CDK4 and inhibits the CDK4/cyclin D enzymes, and "p16 seems to act
//   in a regulatory feedback circuit with CDK4, D-type cyclins and retinoblastoma protein"
//   (Serrano et al., Nature, 1993, PMID 8259215 — verbatim, read at the abstract).
//   CITED FOR THE CIRCUIT, NOT FOR THE INFERENCE, and that gap is exactly why this exclusion is
//   SOFT rather than hard: that paper reports CDK4 and D-type cyclins, NOT CDK4/6, and it does not
//   say that losing either node disables the same checkpoint. That last step is this corpus's own,
//   made in its own voice in the two notes above, and it is not attributed to Serrano.
//   THE REMOVED RECORD WAS VALID, SO ITS REMOVAL IS A LOSS AND NOT A FIX: the ccf it carried was
//   corrected at 37aa47a to name its figure as a mutation frequency rather than a total, and was
//   true when removed. NO RATCHET LOWER WAS NEEDED ANYWAY, WHICH IS NOT THE SAME AS NOTHING HAVING
//   HAPPENED — the Serrano citation above entered as this record left, so the TOTAL held while the
//   SET changed one out and one in. That is the exact case record_count.json's `record_keys` exists
//   for, and the count alone would have shown nothing. js/panel.js carries the full disposition,
//   including what was considered and rejected as unusable here.
const PRIVATE_POOL_LUAD = [
  { gene:'MET amplification', class:'driver', note:'Activates a bypass growth-signaling receptor independent of KRAS\'s own pathway — one of the acquired bypass mechanisms found at resistance to adagrasib monotherapy in KRAS G12C-mutant cancers, and in two patients "the only potential genomic mechanism of adagrasib resistance identified" (Awad et al., NEJM, 2021, n=38), not just a generic resistance gene borrowed from elsewhere in NSCLC.' },
  { gene:'CDKN2A loss', class:'driver', ccf:'the source reports no percentage for this event: "The CDKN2A locus was the most significant deletion" in the cohort, but that deletion\'s frequency is given only in the paper\'s supplementary table, not its text (TCGA, Nature, 2014) — and the paper\'s CDKN2A 4% is its mutation figure alone, with promoter hypermethylation counted in neither', note:'Removes a cell-cycle checkpoint (the p16 brake on CDK4/6) — a common co-occurring event alongside KRAS rather than an alternative driver, adding proliferative pressure without touching RAS signaling itself. Three routes disable this gene in lung adenocarcinoma and the source keeps them apart (TCGA, Nature, 2014): deletion — the cohort\'s single most significant one — mutation, and promoter hypermethylation, the paper describing tumours "with low CDKN2A expression due to methylation (rather than due to mutation or deletion)" as a group with lower ploidy and fewer overall mutations. That separation is why this entry is labeled loss rather than mutation, and why it carries a quotation where its neighbours carry a number.' },
  { gene:'ARID1A mutation', class:'driver', ccf:'~7% of lung adenocarcinoma (TCGA, Nature, 2014)', note:'Disrupts SWI/SNF chromatin remodeling — the same mechanistic category as SMARCA4 above, and independent of KRAS\'s own RAS/MAPK signaling entirely.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
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

// ============================================================
// LUNG SQUAMOUS CELL CARCINOMA (LUSC) — 2026-09-13. Origin verified BEFORE authoring, not
// assumed: the organ's own pre-existing Bronchi hotspot text ("Squamous cell lung carcinoma
// tends to arise in the larger, more central airways here") was checked directly at Sabbula BR,
// Gasalberti DP, Mukkamalla SKR, et al., "Squamous Cell Lung Cancer," StatPearls, NBK564510 —
// confirmed accurate verbatim ("often occur in the central part of the lung or the main airway…
// originates from the transformation of the squamous cells lining the airways"), so the existing
// hotspot text needed no correction. `ORIGIN_HOTSPOT_ENTRY.lusc = 0` overrides the organ default
// (Alveoli, LUAD's own anchor) to point at Bronchi instead — this organ's first real test of the
// per-entry override mechanism outside prostate/ovary, now with THREE active entries genuinely
// arising at two different sites within one organ.
//
// TRUNK — a genuinely different driver landscape from LUAD, confirmed rather than assumed: TCGA
// Research Network, "Comprehensive genomic characterization of squamous cell lung cancers,"
// Nature, 2012, PMID 22960745, PMCID PMC3466113 (178 tumors, whole-exome). TP53 mutation in 81%
// by automated calling, ~90% on manual re-review — near-universal, unlike LUAD's KRAS (33%, "the
// most common of several," never framed as near-universal). The SAME paper directly confirms
// KRAS and EGFR are essentially ABSENT here: "Only one sample had a KRAS codon 61 mutation, and
// there were no exon 19 deletions or L858R mutations in EGFR" — 1/178 and 0/178 respectively —
// so neither gene appears anywhere in this cancer's ledger, the same standing check every organ
// in this atlas runs before adding a driver gene (data rule 1).
const TRUNK_LUSC = [
  { gene:'TP53 mutation', class:'driver', ccf:'81% of squamous cell lung tumors by automated variant calling, rising to ~90% on manual re-review of sequencing reads (TCGA, Nature, 2012, PMID 22960745, PMCID PMC3466113, n=178)', note:'Near-universal here, in the same register as HGSOC/TNBC\'s own TP53 founder — a genuinely different trunk than this organ\'s own adenocarcinoma entry, whose KRAS (33%) is the most common of several possible drivers rather than a near-universal founder. The same paper confirms KRAS and EGFR — LUAD\'s own trunk and its best-known alternative — are essentially absent here (1/178 and 0/178 respectively), so neither belongs anywhere in this cancer\'s own ledger.' },
];
// SITES — real distant-metastasis pattern, but a genuinely split sourcing picture, stated
// honestly rather than smoothed over: Riihimäki et al., Lung Cancer, 2014 (already this organ's
// own site-model source for LUAD) does NOT give squamous-specific site percentages — checked
// directly, twice, at the accessible abstract text, which breaks out only adenocarcinoma
// (bone 39%, respiratory system 22%) and small cell lung cancer (liver 35%, nervous system 47%)
// by histology. A real, modern, squamous-specific alternative exists for exactly one site: Xie
// et al., "Distant metastasis patterns among lung cancer subtypes…," Scientific Reports, 2024,
// PMID 39341901, PMCID PMC11438988 (SEER 17 registries, 2010-2019, 11,923 SCC patients with
// distant metastasis) — bone as the predominant site at 33.26%. That paper's own four studied
// sites are bone/brain/liver/lung, not adrenal, and per-subtype brain/liver percentages sit only
// in a figure this pass could not read numerically — checked and not found in text form, not
// silently assumed. The other three sites below therefore carry Riihimäki's organ-level (not
// squamous-specific) figures with that gap stated plainly, the same honesty precedent this
// organ's own LUAD entry already uses for its unclaimed adrenal-gland percentage.
const REGIONS_LUSC = [
  { id:'QB', name:'Bone', color:cssVar('--coral'), pos3d:{x:-1.3,y:-0.9,z:0.3},
    branch:{ gene:'CDKN2A inactivation', class:'driver', ccf:'72% of squamous cell lung tumors, by the source\'s own combined term "inactivated" — mutation, deletion, and/or promoter methylation together, not separated into a per-mechanism figure the way this organ\'s LUAD entry\'s own CDKN2A note distinguishes (TCGA, Nature, 2012)', note:'This cancer\'s own real, squamous-specific metastatic-site figure: bone was the predominant site of distant spread in a dedicated 11,923-patient SEER cohort (33.26%, Xie et al., Scientific Reports, 2024, PMID 39341901). CDKN2A/p16 loss removes the same cell-cycle checkpoint this organ\'s adenocarcinoma entry already describes, here at near-three-quarters frequency rather than as one of several routes.' } },
  { id:'QN', name:'Brain', color:cssVar('--azure'), pos3d:{x:-0.2,y:1.35,z:0.2},
    branch:{ gene:'PI3K/Akt pathway alteration', class:'driver', ccf:'47% of tumors carry an alteration in at least one of PIK3CA, PTEN, or AKT3 — a pathway-level figure, not each gene individually (TCGA, Nature, 2012)', note:'"Nervous system" is this organ\'s real, organ-level (not squamous-specific) top-5 metastatic site (Riihimäki et al., Lung Cancer, 2014) — no squamous-specific brain percentage was found in accessible text. The same TCGA paper reports these pathway alterations as mutually exclusive with EGFR alterations — a real, citable exclusivity finding, though moot here since EGFR is already excluded from this cancer\'s ledger entirely (see the trunk note). PTEN loss specifically has been found more frequent in squamous than adenocarcinoma tumors, unlike in this organ\'s own LUAD entry, where PTEN carries no independent prognostic value (Houry et al., Medical Sciences, 2026, PMID 42201046).' } },
  { id:'QL', name:'Liver', color:cssVar('--amber'), pos3d:{x:0.9,y:-0.6,z:-0.5},
    branch:{ gene:'NFE2L2/KEAP1/CUL3 pathway alteration', class:'driver', ccf:'34% of tumors carry mutation or copy-number alteration of NFE2L2 and KEAP1 and/or deletion or mutation of CUL3 — a three-gene pathway figure (TCGA, Nature, 2012)', note:'Liver is a real organ-level (not squamous-specific) top-5 metastatic site for this organ (Riihimäki et al., 2014). This pathway activates the NRF2 oxidative-stress response — the same mechanistic category KEAP1 occupies in this organ\'s own LUAD entry, here reported at pathway level with CUL3 as a third real route to the same effect.' } },
  { id:'QA', name:'Adrenal gland', color:cssVar('--violet'), pos3d:{x:1.1,y:0.6,z:-0.3},
    branch:{ gene:'SOX2/FGFR1 amplification', class:'driver', ccf:'real, recurrent 3q26/8p12 amplicon events (SOX2, PDGFRA, FGFR1/WHSC1L1) — no cohort-wide percentage could be extracted from accessible text; checked and not found rather than estimated (TCGA, Nature, 2012)', note:'Adrenal gland is a real organ-level (not squamous-specific) top-5 metastatic site for this organ (Riihimäki et al., 2014). FGFR1/WHSC1L1 amplification is reported as anti-correlated with the "classical" gene-expression subtype — a real, directional finding kept honest by not attaching an invented frequency to it.' } },
];
// PRIVATE POOL — deliberately thin, matching this organ\'s own pneuro-family precedent for the
// same reason: this cancer\'s real, distinctive biology (a near-universal TP53 trunk plus four
// real pathway-level branch alterations) is concentrated at those tiers. No additional gene
// candidate beyond what\'s already used at branch level turned up a citable, non-redundant,
// squamous-specific frequency in this pass\'s own search.
const PRIVATE_POOL_LUSC = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome. This cancer\'s own pool stays this thin deliberately: its real, distinctive genomic story is concentrated in the trunk\'s near-universal TP53 mutation and the four pathway-level branch alterations above, not spread across additional drivers that checked out uncitable when searched for directly.' },
];
// HISTOLOGY — reuses js/histology.js\'s drawPsammomaBody technique (filled/re-colored as
// drawKeratinPearl) plus drawCell for two real WHO 2015 variants with a positive, drawable
// architecture (keratinizing, non-keratinizing); the basaloid variant is named but not drawn,
// the same "name more than is drawn" treatment this organ\'s own LUAD entry already uses for the
// two undrawn WHO growth patterns. Sourced from Sabbula et al., StatPearls, NBK564510 (diagnostic
// threshold, IHC markers) and the WHO classification\'s own variant names as StatPearls
// reports them (the primary WHO paper, Travis et al., J Thorac Oncol, 2015, PMID 26291008, is
// not open access and could not be reached directly in this pass — its language is not quoted
// verbatim for that reason). The predominance note below (adenosquamous carcinoma) is this
// organ\'s own worked example of data rule 31 for the squamous-vs-adenocarcinoma boundary
// specifically, distinct from the ductal/prostate worked example rule 31 already uses.
const HISTOLOGY_LUSC = {
  intro: 'Squamous cell carcinoma is diagnosed when at least 10% of tumor bulk shows keratinization or intercellular bridges (StatPearls, NBK564510) — the two real, drawable architectural signatures shown here as separate zones: keratinizing (left, keratin pearls — concentric whorled lamellae of keratin) and non-keratinizing (right, intercellular bridges — thin connections between tightly packed polygonal cells, visible where cell membranes touch). A third WHO 2015 variant, basaloid, is recognized when a basaloid component exceeds 50% of tissue with minimal squamous differentiation, but is not drawn here. Below the same 10% predominance threshold, a minor squamous component within a mostly-adenocarcinoma tumor is not separately coded at all — the tumor stays classified as adenocarcinoma; only once squamous differentiation itself reaches that same threshold does the tumor cross into the distinct entity "adenosquamous carcinoma" (each component ≥10% of tumor bulk, Tochigi et al., Am J Clin Pathol, 2011 — ~0.4–4% of NSCLC).',
  ariaSummary: 'Stylized microscopic field split into two zones. Left: a solid sheet of angular tumor cells containing three round, onion-layered keratin pearls of varying size, their concentric bands shading from pale to deep orange toward a dense center. Right: a tightly packed field of polygonal cells with thin lines connecting adjacent cell borders — intercellular bridges.',
  citation: 'Sabbula, Gasalberti & Mukkamalla, StatPearls, NBK564510; TCGA, Nature, 2012 (PMID 22960745); Tochigi et al., Am J Clin Pathol, 2011.',
  features: [
    { key:'pearl', label:'Keratin pearl',
      text:'Concentric, whorled lamellae of keratin narrowing to a densely keratinized center — the keratinizing variant\'s own diagnostic signature, one of the two features (with intercellular bridges) that define this cancer at the ≥10%-of-tumor-bulk threshold.' },
    { key:'bridges', label:'Intercellular bridges',
      text:'Thin connections between adjacent tumor cells where their membranes touch — the desmosomal "spiny" appearance of the non-keratinizing variant, the second of this cancer\'s two defining architectural features.' },
  ],
};

// ============================================================
// SMALL CELL LUNG CANCER (SCLC) — 2026-09-13. Origin verified directly, not assumed: StatPearls,
// "Small Cell Lung Cancer," Pincott & Kanchustambham, NBK482458, confirms both the real cell of
// origin ("pulmonary neuroendocrine cells within the bronchial epithelium") and the real anatomic
// location ("typically occurs in the central airways… most often in the central bronchus") —
// matching lusc's own central-airway origin, not luad's peripheral/alveolar one.
// `ORIGIN_HOTSPOT_ENTRY.sclc = 0` overrides the organ default (Alveoli) to Bronchi, same as lusc.
//
// TRUNK — even more extreme than prostate's own pneuro entry, which borrowed this same
// mechanism cross-organ: George et al., "Comprehensive genomic profiles of small cell lung
// cancer," Nature, 2015, PMID 26168399, PMCID PMC4861069. In the 108 tumors without
// chromothripsis, TP53 carried bi-allelic loss in 100% and RB1 in 93% — since TP53 loss is
// universal in this subset, the RB1-loss tumors are necessarily also TP53-loss tumors, so 93% is
// this subset's own concurrent-loss rate, exceeding even prostate pneuro's own 53.3% (Beltran et
// al., Nat Med, 2016). Cross-checked against Rudin et al., Nature Reviews Disease Primers, 2021,
// PMID 33446664, PMCID PMC8177722 (Table 1: TP53 89%, RB1 64%) — the same real cross-cohort
// variability this atlas already notes for HCC's TERT and LUAD's KRAS, with Rudin\'s own footnote
// stating RB1 loss is likely underestimated by targeted exon sequencing relative to George\'s
// copy-number/structural-loss-sensitive method, i.e. the lower figure is a floor, not a ceiling.
// The 2 chromothripsis-carrying tumors in George\'s own cohort reach the same functional Rb-pathway
// effect through an alternative route (CCND1 overexpression) rather than true RB1-independence —
// a documented exception, not a hole in "near-universal."
const TRUNK_SCLC = [
  { gene:'Concurrent TP53 + RB1 loss', class:'driver', ccf:'100% bi-allelic TP53 loss and 93% RB1 loss among 108 tumors without chromothripsis — since TP53 loss is universal in this subset, RB1-loss tumors are necessarily also TP53-loss tumors, making 93% this subset\'s own concurrent-loss rate (George et al., Nature, 2015, PMID 26168399, PMCID PMC4861069); cross-checked against a lower, likely-underestimated 89%/64% via targeted exon sequencing (Rudin et al., Nat Rev Dis Primers, 2021, PMID 33446664, PMCID PMC8177722)', note:'The same double-hit this atlas already models for prostate\'s treatment-emergent neuroendocrine entry (data rule 5\'s "transformation-defining" trunk class) — but here at even higher, near-universal frequency, in the disease this mechanism was first and most thoroughly characterized in. The two chromothripsis-carrying tumors in George\'s own cohort reach the same functional effect (Rb-pathway inactivation) through CCND1 overexpression instead — a documented alternative route, not an exception to the trunk fact itself.' },
];
// SITES — Cittolin-Santos et al., "The changing landscape of small cell lung cancer," Cancer,
// 2024, PMID 38470453, corroborated directly against StatPearls (NBK482458), which cites the
// same liver/bone/brain figures. This organ\'s first cancer entry whose single most common real
// site is neither bone nor a distant organ at all, but mediastinal lymph nodes — a real,
// citable, distinctive fact about how this disease spreads, stated rather than defaulted to a
// bone/brain/liver/adrenal set for visual parity with luad/lusc. Adrenal gland is not one of this
// paper\'s own four studied sites; a second, single-institution (not population-based) Japanese
// series (Nakazawa et al., Oncology Letters, 2012, PMID 23205072, N=251/152 metastatic) gives a
// full four-site set including adrenal (6.0%) but genuinely disagrees with Cittolin-Santos on the
// other three (different cohort, era, and country) — the same class of honest cross-cohort
// discrepancy this atlas already records for HCC\'s own Katyal-vs-Zhuang bone-metastasis figures,
// not resolved by picking a side.
const REGIONS_SCLC = [
  { id:'XM', name:'Mediastinal lymph nodes', color:cssVar('--coral'), pos3d:{x:-1.3,y:-0.9,z:0.3},
    branch:{ gene:'MYCL amplification', class:'driver', ccf:'real, recurrent amplification event in SCLC — no cohort-wide percentage extractable from accessible text (George et al., Nature, 2015)', note:'This cancer\'s own single most common real metastatic site — mediastinal lymph nodes, 75.3% (Cittolin-Santos et al., Cancer, 2024, PMID 38470453) — ahead of every distant-organ site below. MYCL (historically "MYCL1" — the "L" originally named for lung) is the MYC-family member most associated with the classic, ASCL1-high molecular subtype of SCLC (Rudin et al., 2021), the subtype this disease is most often described by.' } },
  { id:'XL', name:'Liver', color:cssVar('--amber'), pos3d:{x:0.9,y:-0.6,z:-0.5},
    branch:{ gene:'MYC amplification', class:'driver', ccf:'real, recurrent amplification event, distinct from MYCL (George et al., Nature, 2015)', note:'Liver is this cancer\'s second most common real metastatic site (31.6%, Cittolin-Santos et al., 2024). MYC amplification — as opposed to its MYCL relative at the mediastinal-nodes site — is specifically associated with a "variant," non-neuroendocrine-low SCLC subtype with distinct morphology (Mollaoglu et al., Cancer Cell, 2017, PMID 28089889), a real molecular-subtype distinction rather than an interchangeable family member.' } },
  { id:'XB', name:'Bone', color:cssVar('--azure'), pos3d:{x:-0.2,y:1.35,z:0.2},
    branch:{ gene:'NOTCH family inactivating mutation', class:'driver', ccf:'25% of human SCLC (George et al., Nature, 2015, own abstract)', note:'Bone is this cancer\'s third most common real metastatic site (23.7%, Cittolin-Santos et al., 2024). The same source paper reports NOTCH family mutations as "largely mutually exclusive" with CREBBP, EP300, TP73, RBL1, and RBL2 — a real, checked constraint against this cancer\'s own private pool below.' } },
  { id:'XN', name:'Brain', color:cssVar('--violet'), pos3d:{x:1.1,y:0.6,z:-0.3},
    branch:{ gene:'PTEN loss', class:'driver', ccf:'7% of SCLC (Rudin et al., Nat Rev Dis Primers, 2021, Table 1)', note:'Brain is this cancer\'s fourth real metastatic site (16.4%, Cittolin-Santos et al., 2024) — still substantial, consistent with this disease\'s well-known propensity for early, aggressive, widespread spread (roughly two-thirds of patients present with metastatic disease already, per the same source).' } },
];
// PRIVATE POOL — TP73, checked against the trunk and all four branch genes: George et al.\'s own
// text names TP73 as part of a set (with CREBBP/EP300/RBL1/RBL2/NOTCH) reported "largely mutually
// exclusive" WITH EACH OTHER — since only TP73 itself is drawn into this pool (not a second member
// of that same set), no exclusivity conflict exists to manage.
const PRIVATE_POOL_SCLC = [
  { gene:'TP73 mutation', class:'driver', note:'A TP53-family member — thematically apt for a cancer already defined by TP53/RB1 co-loss. George et al. (2015) report this gene as part of a set "largely mutually exclusive" with CREBBP, EP300, RBL1, RBL2, and the NOTCH family — checked against this cancer\'s own NOTCH branch gene (Bone site) before inclusion: only TP73 itself is drawn into this shared pool, not a second member of that same mutually-exclusive set, so no conflict exists for a cell drawing both.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — the neuroendocrine histology family\'s HOME-ORGAN consumer, zero new drawing code:
// see genLungsSCLC in js/histology.js for the full reasoning. Ng & Li, Ann Diagn Pathol, 2024,
// PMID 39342665\'s own 37-case SCLC cohort — not a cross-organ application this time, since this
// is the disease the cohort itself studied. "Marked nuclear irregularity" (86%, the cohort\'s
// third-most-common feature) is named here in the intro rather than given its own drawn feature,
// since it is already visually present in the molded cells\' own elongated, irregular shape — no
// new geometry needed to show it. Crush artifact — a real, classically-taught bronchoscopic-
// sampling artifact this same cohort found significantly more common in bronchial/aspirate
// specimens than effusion fluid (p<0.001) — is likewise named rather than drawn, since the source
// gives only that qualitative specimen-type contrast, no overall rate to anchor a labeled claim on.
const HISTOLOGY_SCLC = {
  intro: 'Sheets of small tumor cells with scant to absent cytoplasm — "naked nuclei," reported in 89% of cases in this cancer\'s own dedicated cytomorphology cohort — packed densely enough that neighboring nuclei deform against each other rather than staying independently round: nuclear molding, present in 95% of cases and this tumor\'s single most recognizable feature. "Marked nuclear irregularity" (86%) is the cohort\'s third-most-common feature, already visible in the molded cells\' own irregular shape above. The one feature that specifically distinguishes small cell carcinoma from other neuroendocrine tumors is an absence of prominent nucleoli. Necrosis is common and often extensive; crush artifact — cells distorted by bronchoscopic forceps sampling — is a real, classically-described finding significantly more common in bronchial biopsies than in effusion fluid specimens.',
  ariaSummary: 'Stylized microscopic field: a dense sheet of small, dark, closely packed nuclei with essentially no visible cytoplasm around them. Many adjacent nuclei are stretched and angled toward their nearest neighbor, deforming against each other rather than staying round — nuclear molding. An irregular pale region of necrotic debris sits within the sheet.',
  citation: 'Ng & Li, Ann Diagn Pathol, 2024, PMID 39342665 (this cancer\'s own dedicated small-cell-carcinoma cytomorphology cohort, n=37).',
  features: [
    { key:'molding', label:'Nuclear molding',
      text:'Adjacent nuclei deform against each other where they\'re pressed close — present in 95% of cases (35/37 in the source cohort) and the single most consistent architectural feature across the literature.' },
    { key:'naked', label:'Naked nuclei, no cytoplasm ring',
      text:'Nuclei with scant to absent visible cytoplasm — "naked nuclei" — in 89% of cases (33/37), a bare-nucleus look distinct from this organ\'s own adenocarcinoma and squamous entries, whose cells keep a visible cytoplasm ring.' },
    { key:'necrosis', label:'Necrosis',
      text:'Areas of necrotic debris within the tumor sheet — common and often extensive in this fast-growing, high-grade carcinoma.' },
  ],
};

export const cancerDetails = {
  luad: {
    title:'Lung Adenocarcinoma', screenLabel:'Lung adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_LUAD, trunk:TRUNK_LUAD, privatePool:PRIVATE_POOL_LUAD,
    histology: HISTOLOGY_LUAD,
  },
  lusc: {
    title:'Lung Squamous Cell Carcinoma', screenLabel:'Lung squamous cell carcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern, partly organ-level)',
    regions:REGIONS_LUSC, trunk:TRUNK_LUSC, privatePool:PRIVATE_POOL_LUSC,
    histology: HISTOLOGY_LUSC,
  },
  sclc: {
    title:'Small Cell Lung Cancer', screenLabel:'Small cell lung cancer — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_SCLC, trunk:TRUNK_SCLC, privatePool:PRIVATE_POOL_SCLC,
    histology: HISTOLOGY_SCLC,
  },
};
