import * as THREE from 'three';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// "clear cell"/"clear cell carcinoma" are DELIBERATELY shared with kidneys.js — both organs
// really do have a clear-cell carcinoma, and a query that genuinely matches two organs should
// show both as a disambiguation list, not silently pick one. search.js's Enter key was fixed
// in the same pass to only auto-navigate on a UNIQUE match (it used to take matches[0], which
// would have silently rerouted "clear cell" from Kidneys to Ovaries because ovary loads first
// in ORGAN_MODULES). 'occc' and 'ovarian clear cell' resolve uniquely here; 'ccrcc' and
// 'renal cell carcinoma' keep resolving uniquely to Kidneys.
export const organEntry = { key:'ovary', label:'Ovaries', system:'Reproductive', active:true, sexes:['female'], aliases:['ovary','ovaries','ovarian','clear cell','clear-cell','clear cell carcinoma','occc','ovarian clear cell'] };

export const markerSpec = { points:[{heightFrac:0.49, angle:-25}, {heightFrac:0.49, angle:25}] };

export const cancerEntries = [
  { id:'hgsoc', name:'High-grade serous carcinoma', share:'~70% of ovarian carcinomas', active:true,  organKey:'ovary' },
  { id:'endo',  name:'Endometrioid carcinoma',       share:'~10% of ovarian carcinomas', active:false, organKey:'ovary' },
  // Share verified: 9.6% (2,695 of 28,118, 2014-WHO histotypes — Peres et al., JNCI, 2019).
  // The Japan figure is the honest asymmetry stated where users see it (skin's nodular-share
  // precedent): 26.9% of Japanese EOC vs 8.4% US in the same four-subtype comparison (Machida
  // et al., Gynecol Oncol, 2019) — caveat, both Machida denominators are restricted to the
  // four major subtypes, which slightly inflates each share; Peres's 9.6% has the complete
  // denominator, hence "~10%" as the headline number.
  { id:'clear', name:'Clear-cell carcinoma',         share:'~10% of ovarian carcinomas — ~27% in Japan', active:true, organKey:'ovary' },
  { id:'muc',   name:'Mucinous carcinoma',           share:'~3% of ovarian carcinomas',  active:false, organKey:'ovary' },
  { id:'lgsc',  name:'Low-grade serous carcinoma',   share:'<5% of ovarian carcinomas',  active:false, organKey:'ovary' },
];

// MESH (real, the atlas's first MRI-derived organ; fourth real artist/scan Sketchfab-era
// asset after Lungs, Colon, Thyroid): the LEFT ovary isolated from "Pelvic Organs from MRI"
// by audreybyrd, CC BY 4.0 — license verified three ways (live page, public API requirements
// text, and the GLB's own embedded asset.extras). Source provenance, page verbatim: "derived
// from a high-resolution MRI of a 25-year-old cis-female woman using Avizo and Blender
// processing... produced at the Oklahoma State University Biomedical Imaging Laboratory in
// conjunction with the OSU Center for Health Sciences Center Neuroanatomy Laboratory in
// Spring of 2022." Isolation facts (all measured, not assumed): the source's named
// `ovaries_2` node is three ARBITRARY ~65,532-vertex index-buffer chunks, not organ meshes —
// welding (131,880 → 22,132 verts) resolves FIVE components: both ovary outer shells plus
// three smaller closed surfaces proven INTERIOR by ray-parity containment (internal
// follicles / corpus luteum captured by the segmentation; dropped — invisible in opaque
// rendering, documented here rather than silently discarded). The left shell ships (22,038
// tris, one component — more surface character: a deep mesovarian crease field; it also held
// the largest internal structure, plausibly that cycle's active side). PCA-oriented (long
// axis vertical, crease field fronting +Z, proper rotation det +1), bbox-centered, uniformly
// rescaled so its closed-mesh volume is EXACTLY 7.7 mL — Kelsey et al., PLoS ONE, 2013
// (n=59,994): peak ovarian volume 7.7 mL (95% CI 6.5–9.2) at age 20. Precision note, stated
// rather than smoothed: 7.7 mL is the model's PEAK at age 20, the nearest well-established
// landmark — not a literal age-25 value (Kelsey's curve declines gently after 20, so the
// 25-year-old specimen's true model value sits slightly below). Length-anchoring to the
// textbook 3.5 cm was computed and REJECTED: it implies 15.5 mL, double the reference.
// PROPORTION DISCLOSURE (stronger footing than Thyroid's stylization trade): at 7.7 mL this
// mesh is 2.71 × 2.77 × 2.05 cm — plump and near-round (1 : 0.98 : 0.74) vs the StatPearls
// excised-almond reference 3.5 × 2 × 1 (1 : 0.57 : 0.29) the old procedural mesh was built
// to. This is real anatomical variation between in-situ imaging and an idealized reference
// shape — a live ovary compressed by neighboring pelvic structures, imaged in place — not an
// asset falling short of a citation. Disclosed in the HTML disclaimer in those terms.
//
// MATERIAL — A/B decided on evidence (Lungs/Colon/Thyroid protocol): A = the asset's own
// material, which is a flat MRI-segmentation red (baseColorFactor 0.93/0.23/0.23, no
// texture; the source declares ONLY baseColorFactor, so glTF's metallic=1 default applies —
// shipped in the GLB de-metaled as the usable faithful reading, disclosed). B = the app
// recipe: the previously verified grayish-pink 0xc9ac9e (PathologyOutlines + IMAIOS
// gross-anatomy verification, done in the real-tissue pass and still valid — the color
// describes the ORGAN, not the old mesh) + tissue mottle + specularIntensity 0.25 (the
// material-pass standard for real meshes; the old 0.15 predates that pass). B ships: flat
// segmentation red is a labeling convention, not a tissue color, and carries no texture
// detail worth preserving — the opposite trade from Lungs/Colon/Thyroid, where artist-baked
// texture beat the recipe. See the review packet's side-by-side.
export function buildOvaryMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/ovary.glb', (gltf)=>{
      const mat = new THREE.MeshPhysicalMaterial({ color:0xc9ac9e, roughness:0.55, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 2.6); } });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Female Reproductive System', title:'Ovary',
  sub:'Paired organ · almond-sized · produces eggs and sex hormones',
  facts:[
    {label:'Size', val:'~7.7 mL peak reproductive-age volume (Kelsey 2013)'},
    {label:'Location', val:'Pelvis, either side of uterus'},
    {label:'Function', val:'Releases eggs; makes estrogen &amp; progesterone'},
    {label:'Blood supply', val:'Ovarian arteries'},
  ],
  // "most ovarian cancers" stays accurate (HGSOC alone is ~70%), but with clear-cell carcinoma
  // now wired under this organ the exception has to be stated where the rule is: clear-cell
  // (and endometrioid) carcinomas arise from endometriosis — uterine-lining tissue growing on
  // the ovary — not from the surface epithelium (Wiegand et al., NEJM, 2010; Pearce et al.,
  // Lancet Oncol, 2012: endometriosis OR 3.05 for clear-cell, the strongest of any subtype,
  // vs NO association with high-grade serous, OR 1.13 p=0.13, same pooled 13-study analysis).
  desc:'The ovaries sit in the pelvis on either side of the uterus, each connected to a fallopian tube. Their outer surface — the site where most ovarian cancers begin — is covered by a single layer of epithelial cells. Not every ovarian cancer starts there, though: clear-cell and endometrioid carcinomas instead arise from endometriosis, patches of uterine-lining tissue growing where they shouldn\'t.',
  buildMesh: buildOvaryMesh,
  viewer:{ theta:0.5, phi:1.2, radius:0.12, minRadius:0.03, maxRadius:0.3, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a real left ovary reconstructed from an MRI scan — a '
    + 'grayish-pink rounded organ with an uneven, gently folded surface — with four teal points '
    + 'marking the structures listed after it. Drag to rotate, scroll to zoom.',
  // Anchors are measured mesh coordinates (metres, exported-GLB frame: long axis +Y, the
  // mesovarian crease field fronting +Z) — each the argmax of a direction score over the
  // final geometry, the Bladder/Thyroid real-anchor standard, replacing the old
  // dir-times-ellipsoid approximation (hotspotScale is gone with it; nothing else read it).
  // The HILUM anchor is derived from the source assembly itself: the direction from this
  // ovary's centroid toward the uterus (its real medial attachment side) — which lands ON
  // the crease field, because that relief IS the mesovarian border in the segmentation.
  // Cortex and Medulla are depth layers with no single surface point; their anchors are
  // representative surface positions (cortex on the free surface it underlies; medulla at
  // the near-silhouette limb) and each hotspot's text already says the layer is beneath.
  hotspots:[
    { key:'surface', label:'Surface epithelium', pos:[-0.00807,0.00805,0.00786],
      text:'A single layer of cells covering the ovary\'s outer surface. Most ovarian cancers, including high-grade serous carcinoma, are now thought to arise here or in the adjacent fallopian tube. Clear-cell and endometrioid carcinomas are the exception — they begin in endometriosis, displaced uterine-lining tissue, rather than in this layer.' },
    { key:'cortex', label:'Cortex', pos:[0.01224,-0.00292,0.00352],
      text:'The outer functional layer, packed with follicles at every stage of development — from resting to nearly ready to release an egg.' },
    { key:'medulla', label:'Medulla', pos:[-0.01266,-0.00122,0.00448],
      text:'The core of the ovary, deep to the cortex — loose connective tissue carrying the blood vessels, lymphatics, and nerves that supply it.' },
    { key:'hilum', label:'Hilum', pos:[-0.00249,0.01130,0.00757],
      text:'Where the ovary attaches to its supporting ligament — the entry and exit point for its blood supply and nerves.' },
  ],
};

const REGIONS_HGSOC = [
  { id:'OV', name:'Ovary (primary)', color:cssVar('--coral'), pos3d:{x:-1.3,y:-0.35,z:0.35},
    branch:{ gene:'BRCA1/2 pathway loss', class:'driver', ccf:'~50% of HGSOC tumors are HR-deficient overall', note:'Loss of homologous-recombination repair — the single biggest known determinant of PARP-inhibitor sensitivity in this disease.' } },
  { id:'OM', name:'Omentum', color:cssVar('--azure'), pos3d:{x:0.4,y:1.05,z:-0.3},
    branch:{ gene:'CCNE1 amplification', class:'driver', ccf:'~15–20% of HGSOC tumors', note:'Extra copies of a cell-cycle gene that push cells through division. These tumors are usually HR-proficient and tend to resist platinum chemo and PARP inhibitors.' } },
  { id:'PE', name:'Peritoneum', color:cssVar('--amber'), pos3d:{x:1.35,y:-0.15,z:0.4},
    branch:{ gene:'NF1 mutation', class:'driver', ccf:'recurrent, low individual frequency (TCGA cohort)', note:'Removes a brake on RAS signaling — one of several independent routes HGSOC tumors take to the same growth advantage.' } },
  { id:'BO', name:'Bowel serosa', color:cssVar('--violet'), pos3d:{x:0.05,y:-1.25,z:0.15},
    branch:{ gene:'RB1 loss', class:'driver', ccf:'recurrent, low individual frequency (TCGA cohort)', note:'Removes a cell-cycle checkpoint, often found alongside cyclin-pathway changes like CCNE1 amplification.' } },
];
const TRUNK_HGSOC = [
  { gene:'TP53 mutation', class:'driver', ccf:'~96% of HGSOC tumors (TCGA, 2011)', note:'Disables the tumor-suppressor gene lost in nearly every high-grade serous ovarian cancer — so consistent across cases that it\'s considered the founding event of this disease.' },
];
const PRIVATE_POOL_HGSOC = [
  { gene:'CDK12 alteration', class:'driver', note:'A recurrent DNA-repair gene hit in a minority of tumors, adding to the genomic instability already caused by TP53 loss.' },
  { gene:'BRCA reversion mutation', class:'driver', note:'A second mutation that restores the BRCA reading frame — a well-documented way tumor cells regain repair capacity and become resistant to PARP inhibitors after treatment.' },
  { gene:'MYC amplification', class:'driver', note:'Extra copies of a master growth-signaling gene; one of the more common focal amplifications found across HGSOC genomes.' },
  { gene:'PTEN loss', class:'driver', note:'Removes a brake on the PI3K growth pathway — another recurring route to the same advantage seen elsewhere in this tumor.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly at the source, same
// standard as every citation above): PathologyOutlines' HGSOC page confirms "hierarchical
// papillary branching, glandular and cribriform patterns," solid masses "with slit-like
// spaces (fusion of papillae)," pleomorphism worded exactly as "> 3x variation in size,"
// "necrosis is frequent," and psammoma bodies as "variable" — versus "frequent" on its
// LOW-grade page, so the psammoma text below keeps that honest contrast. The mitotic
// threshold comes from the two-tier system's own primary source (Malpica et al., Am J Surg
// Pathol, 2004: ">12 mitoses per 10 HPFs," explicitly SECONDARY to nuclear atypia — worded
// that way below rather than as a freestanding cutoff). "Fibrovascular cores" was checked
// and deliberately NOT claimed: sources attach that phrase to low-grade serous and
// endometrial serous, not to HGSOC's own microscopic description.
const HISTOLOGY_HGSOC = {
  intro: 'High-grade serous carcinoma grows as hierarchical branching papillae with glandular and solid areas, separated by narrow slit-like spaces that form where papillae fuse. Nuclei are markedly pleomorphic — more than 3-fold size variation, with bizarre and multinucleated forms — mitoses exceed 12 per 10 high-power fields (the grading system’s secondary criterion, after nuclear atypia), and necrosis is frequent.',
  ariaSummary: 'Stylized microscopic field: three large branching papillary fronds in pale pink stroma, each rimmed by purple tumor nuclei of visibly unequal sizes — some three times larger than their neighbors. Narrow white slit-like spaces separate the fronds. Two small concentric, lamellated calcified spherules (psammoma bodies) sit between them.',
  citation: 'PathologyOutlines.com, "High grade serous carcinoma" (ovary); grading criteria: Malpica et al., Am J Surg Pathol, 2004.',
  features: [
    { key:'papillae', label:'Papillary architecture',
      text:'Hierarchical branching papillae with glandular and solid growth. Where papillae fuse, the narrow slit-like spaces characteristic of this tumor open up between them.' },
    { key:'pleomorphism', label:'Pleomorphic nuclei',
      text:'Nuclear size varies more than 3-fold within one tumor, with large, bizarre and multinucleated forms — the primary criterion separating high-grade from low-grade serous carcinoma. The mitotic rate (>12 per 10 high-power fields) is the secondary criterion.' },
    { key:'psammoma', label:'Psammoma body',
      text:'A concentrically lamellated, calcified spherule. Variable in high-grade serous carcinoma — classically frequent in its low-grade counterpart — which is why only a couple appear here rather than dominating the field.' },
  ],
};

// ============================================================
// CLEAR-CELL CARCINOMA (OCCC) — second wired cancer under this organ
// ============================================================
// SITE MODEL — verified before building, not assumed (the gating question of this pass):
// OCCC spreads by the SAME anatomic routes as HGSOC. The largest purpose-built OCCC dataset
// (Kondo et al., J Gynecol Oncol, 2020 — 166 recurrences from the 619-patient JGOG3017
// randomized trial) concludes verbatim "No CCC-specific recurrence site was identified," and
// Rose et al.'s 428-case autopsy series (Cancer, 1989) found metastatic sites "nearly
// identical" across histotypes. So this is the ordinary real-spread site-model family — NOT a
// fourth family. What IS verified different is extent and timing, stated in the legend title
// and CLAUDE.md rather than invented into new anatomy: 72.4% of clear-cell is localized or
// regional at diagnosis vs 22.1% of HGSOC (Peres et al., JNCI, 2019, n=28,118 — counts, not
// the paper's printed 78.9% distant figure, which fails its own arithmetic; 13,898/17,837 =
// 77.9%), and ~90–93% is confined to ONE ovary (Tanaka 2016 48/53; an independent 2026
// Chinese cohort 95/102) where serous is 70.5% bilateral.
// The four sites are OCCC-specific but all real and shared-route (evidence per site, %s kept
// out of the UI per the standing site-frequency rule from the kidneys pass):
//   CY ovary/endometriotic cyst — 74% of OCCC arises with pathology-confirmed endometriosis
//      (Parra-Herran 2019, 67/90); endometriosis OR 3.05 (2.43–3.84), the strongest of any
//      subtype, vs NO association with HGSOC (Pearce, Lancet Oncol, 2012, self-reported);
//      34.5% of OCCC never leaves the localized stage (Peres).
//   PV pelvis — 37.9% regional at diagnosis (Peres); when recurrence is single-site it is
//      pelvic (13/13, Hemman 2022).
//   PT peritoneum — the most frequent recurrence site, 54.2% (90/166, Kondo 2020); NOT
//      dropped in favor of a distant organ precisely because it is the top site.
//   RP retroperitoneal nodes — 33.1% of recurrences (Kondo); node-ONLY relapse is a
//      recognized pattern (18%, Hogen 2019); para-aortic > pelvic in four independent series
//      (Rose 1989; Kondo 2020; JGOG3017-A4; Watanabe 2026). Honesty constraint: OCCC nodal
//      involvement is NOT higher than serous (7.9% vs 13.6%, Chan 2008 SEER) — the region
//      note says so qualitatively.
// Region ids CY/PV/PT/RP verified globally unique across all organs (regionCellCache keys on
// region.id regardless of organ; 44 ids were in use before this block).
const REGIONS_OCCC = [
  { id:'CY', name:'Ovary — endometriotic cyst (primary)', color:cssVar('--coral'), pos3d:{x:-0.75,y:-0.92,z:0.82},
    branch:{ gene:'PIK3CA activating mutation', class:'driver', ccf:'~45% of OCCC tumors (188/421, Bolton 2022); co-occurs with ARID1A loss in about a third of cases', note:'The trunk\'s documented partner — cooperating, not competing. In mice, ARID1A loss alone formed no tumor over a year, and PIK3CA activation alone caused only surface overgrowth that never progressed; together they produced ovarian tumors in 77% of animals at a median of 7.5 weeks, driven in part by sustained IL-6 inflammatory signaling (Chandler et al., Nat Commun, 2015). This modeled tumor carries both — the pair that built it.' } },
  { id:'PV', name:'Pelvis', color:cssVar('--azure'), pos3d:{x:1.05,y:-0.98,z:-0.2},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'~17% of OCCC tumors (17/102, Chao 2024); ~5–21% across cohorts', note:'An activating growth-signal mutation that coexists with ARID1A and PIK3CA in sequenced cohorts — no interaction analysis has flagged it against either. The contrast with lung adenocarcinoma, where KRAS and EGFR are famously either/or, is the point: the same gene plays by different rules in different cancers.' } },
  { id:'PT', name:'Peritoneum', color:cssVar('--amber'), pos3d:{x:-1.05,y:0.99,z:0.22},
    branch:{ gene:'ZNF217 amplification', class:'driver', ccf:'~31–36% of OCCC tumors (Kuo 2010; Huang 2014)', note:'Extra copies of a chromosome-20 oncogene — the most striking copy-number change in this disease, common in clear-cell yet rare in serous carcinoma of any grade, and statistically associated WITH ARID1A loss rather than competing against it (P=0.028).' } },
  { id:'RP', name:'Retroperitoneal lymph nodes', color:cssVar('--violet'), pos3d:{x:0.68,y:0.9,z:-0.88},
    branch:{ gene:'PPP2R1A hotspot mutation (R183W)', class:'driver', ccf:'~7–19% of OCCC tumors; R183W is the recurrent hotspot (11 of 16 mutations, Chao 2024)', note:'A recurrent change in a phosphatase-scaffold gene that normally restrains growth signaling, documented co-occurring with ARID1A mutation. About this site: clear-cell does not involve lymph nodes more often than serous carcinoma — if anything less often — but node-only relapse is a recognized pattern here, and the para-aortic nodes above the pelvis are involved more often than the pelvic ones.' } },
];

// TRUNK — the atlas's fifth temporal trunk (HCC TERT, PDAC KRAS, GBM's classifier, melanoma
// BRAF/TERT), and the first documented in a benign PRECURSOR lesion: ARID1A protein is
// already absent from the endometriotic cyst lining in direct continuity with the carcinoma
// while the same patient's distant endometriosis retains it — 31/31 informative cases (Ayhan
// et al., Int J Gynecol Cancer, 2012, IHC), plus clone-level mutation data in the discovery
// cohort (Wiegand et al., NEJM, 2010: the tumor's exact ARID1A mutation in 17/42 clones from
// contiguous atypical endometriosis, 0/52 from a distant lesion). Deliberately NOT claimed,
// per verification: (a) that ARID1A loss is a general feature of endometriosis in women
// without cancer — Anglesio 2017 found it in only 2/39 deep-infiltrating lesions (one at 8%
// allele fraction, lesion type "virtually no risk of malignant transformation"), and Yamamoto
// 2012 found ALL 22 cancer-free endometriotic lesions ARID1A-intact; (b) that ARID1A is THE
// single first event — Chao 2024 puts ARID1A/PIK3CA/TERT/KRAS in the same early-clonal tier,
// and Gan 2023 (n=34) argues KRAS is earlier. The claim shipped is the lesion-level one that
// is actually verified. Frequency anchor 49% (205/421, Bolton 2022, the largest sequenced
// cohort); honest range ~40–65% across cohorts/methods — NOT "43–78%" as the task brief had
// it (78% traces to nothing; it's Bennett 2021's precursor-lesion frequency, not an ARID1A
// figure), and NOT "IHC reads higher than sequencing" (backwards: in Wiegand itself IHC 42%
// vs sequencing 46%; the IHC cohort range 15–69% brackets the sequencing range).
// Second trunk entry = TP53 STATUS (GBM's classifier-entry precedent): the requirement is to
// state TP53's rarity here explicitly, and the trunk ledger — where HGSOC shows its 96% —
// is where that contrast is actually visible. Platinum contrast placed here too, with the
// verified nuance: the response deficit is in the platinum-SENSITIVE setting (ORR 51.3% vs
// 76.0%, Watanabe 2026, JSOG multicenter); in platinum-resistant relapse the two are
// statistically indistinguishable (18.2% vs 15.6%) — so the note does NOT say "platinum-
// resistant" as a blanket property.
const TRUNK_OCCC = [
  { gene:'ARID1A loss', class:'driver', ccf:'~49% of OCCC tumors (205/421, Bolton 2022); ~40–65% across cohorts', note:'Knocks out a chromatin-remodeling tumor suppressor — and it happens before the cancer exists. In 31 of 31 informative cases, ARID1A protein was already missing from the endometriotic cyst lining directly continuous with the carcinoma, while the same patient\'s distant endometriosis kept it; in the discovery cohort, the tumor\'s exact mutation was traced into the adjacent endometriosis clones. Both copies are hit in ~45% of tumors. And it essentially never occurs in high-grade serous carcinoma: 0 of 76 in the same series that found it in nearly half of clear-cell cases.' },
  { gene:'TP53 — usually wild-type here', class:'driver', ccf:'mutated in only ~15% of OCCC (Kuo 2009; 16% of 421, Bolton 2022)', note:'The near-opposite of high-grade serous carcinoma, where TP53 mutation is the ~96% founding event. Here the gene is usually intact — and tumors carrying multiple ARID1A hits are the least likely of all to mutate TP53 (odds ratio 0.21), a mutual exclusivity consistent with two genuinely different roads into ovarian cancer. The clinic sees the difference too: in platinum-sensitive relapse, clear-cell responds to platinum chemotherapy far less often than serous does (51% vs 76% in a 2026 multicenter series).' },
];

// PRIVATE POOL — a deliberate structural departure, flagged rather than papered over: after
// mechanistic fit-checking, NO additional recurrent driver survives for this slot. PTEN out
// (same-pathway redundancy with PIK3CA — the melanoma-MAP2K1 class — plus the decisive mouse
// result that ARID1A+PTEN builds ENDOMETRIOID/undifferentiated tumors, not clear-cell:
// Guan 2014 / Mabuchi 2016 Table 3); CTNNB1 out (wrong entity — 53% in low-grade ovarian
// ENDOMETRIOID vs 3% here, the GBM-ATRX error class); TERT promoter out (mutually exclusive
// with BOTH trunk and branch partner: p=4.4x10^-9 vs ARID1A and p=0.0019 vs PIK3CA, Wu 2014,
// replicated twice — the strongest exclusion in the atlas); ARID1B out on a NEW rejection
// class, synthetic-lethal dependency: an ARID1A-deficient cell REQUIRES a working ARID1B to
// survive (Helming, Nat Med, 2014), so drawing its loss into these cells would depict cells
// that cannot live. SMARCA4/MET/dMMR: insufficient (unsettled driver status / true
// amplification only 6% / 3–6% per-tumor subset, prose-only). The verified drivers that DO
// fit (KRAS, ZNF217, PPP2R1A) all serve as region branches above. What remains for the
// per-cell private slot is the honest story: OCCC's genome is comparatively QUIET — median
// 46 non-silent mutations (Chao 2024), chromosomal instability far below HGSOC (Kuo 2010) —
// so the pool ships two verified passenger entries and zero drivers, a first for the atlas.
// TTN deliberately absent: zero TTN mentions across four OCCC cohorts totalling 634 tumors —
// the atlas does not carry a passenger over from other cancers and relabel it.
const PRIVATE_POOL_OCCC = [
  { gene:'Clock-like background variants (signatures SBS1/SBS5)', class:'passenger', note:'Most of this tumor\'s mutations are doing nothing. Whole-exome sequencing of 102 clear-cell carcinomas found a median of just 46 protein-altering mutations per tumor, dominated by the two "clock-like" mutational signatures that accumulate with age in ordinary tissue — and far less chromosome-level chaos than high-grade serous carcinoma carries.' },
  { gene:'OBSCN R3140Q (single-tumor observation)', class:'passenger', note:'A one-off change in one of the genome\'s largest genes, reported in exactly one tumor of a 42-case series — shown as the concrete face of background noise. Huge genes collect hits simply because they offer so much DNA to mutate. No clear-cell study reports a recurrent TTN variant, the passenger this atlas uses elsewhere, so none is invented here.' },
];

// HISTOLOGY — verified with PathologyOutlines UNREACHABLE (HTTP 429 across four attempts on
// two days), so the morphologic load rests on: Diagnostics (Basel) 2021;11(4):697 (WHO-2020-
// based review, PMC8070731, open access — chosen because it describes OCCC and HGSOC in the
// SAME paper, making the mitotic contrast below same-source), DeLair et al., Am J Surg
// Pathol 2011;35(1):36-44 (155 cases, abstract-verified), and Uekuri et al., Oncol Lett 2013
// (glycogen, hedged as "includes" in the source — so the text says "attributed to," never a
// flat "is"). Deliberately NOT drawn/claimed, per verification: psammoma bodies (a serous
// feature — no source attributes them to OCCC); any papillary/tubulocystic/solid percentage
// split (none exists — only the rank "papillary and tubulocystic most frequent" is citable);
// a uniformly clear field (sources warn clear cytoplasm is NOT the diagnostic criterion and
// rare OCCCs are entirely eosinophilic — so pink cells are mixed in); "the same substance
// that clears ccRCC" (kidney clearing is glycogen AND lipid, tied to VHL/HIF — overlapping,
// not identical, so kidneys.js's slide text is not echoed verbatim); "eosinophilic hyaline
// globules" (sources say "hyaline bodies"); any sourced-sounding mechanistic definition of
// hobnailing (the citable phrase is "eccentric, rounded, and bulbous nuclei", J Cancer 2021).
const HISTOLOGY_OCCC = {
  intro: 'Clear-cell carcinoma is the microscope\'s opposite of high-grade serous. Its papillae are small and round — no hierarchical branching — covered by no more than about three cell layers, with cores visibly swollen by dense hyaline material. The cells are cuboidal, most with cytoplasm so pale it looks empty (a clearing attributed to stored glycogen), mixed with pink and flattened forms; where they line a cyst or tubule, rounded "hobnail" nuclei bulge into the space. The nuclei look high-grade — large, with prominent nucleoli — yet stay strikingly uniform from cell to cell, and division is slow: usually fewer than 5 mitoses per 10 high-power fields, against more than 12 in high-grade serous carcinoma.',
  ariaSummary: 'Stylized microscopic field: several small round papillae whose cores are thick pale-pink bands of dense hyaline material rimmed by a single layer of pale cells; two cystic spaces lined by cells whose rounded nuclei bulge into the cavity; a solid sheet of optically clear cells with occasional pink ones mixed in. Nuclei are uniform in size throughout and only a single dividing cell appears. A few small dense pink spheres — hyaline bodies — sit between structures.',
  citation: 'Diagnostics (Basel), 2021 (WHO-2020-based review; same source as the serous mitotic contrast); DeLair et al., Am J Surg Pathol, 2011 (155 cases); glycogen attribution: Uekuri et al., Oncol Lett, 2013.',
  features: [
    { key:'hyalpap', label:'Hyalinized papillae',
      text:'Small, round papillae without hierarchical branching, covered by no more than about three cell layers — the explicit opposite of high-grade serous architecture. Their cores are expanded by dense hyaline basement-membrane material; together with hyaline bodies and complex papillae this forms a three-feature triad pathologists use to recognize the diagnosis.' },
    { key:'hobnail', label:'Hobnail & clear cells',
      text:'Cuboidal cells whose cytoplasm looks optically empty — a clearing attributed to stored glycogen — mixed with pink (eosinophilic) and flattened forms, because clear cytoplasm alone does not make the diagnosis. Along cyst and tubule linings, hobnail cells push eccentric, rounded, bulbous nuclei into the open space.' },
    { key:'uniform', label:'Uniform nuclei, scarce mitoses',
      text:'Large nuclei with prominent nucleoli that nonetheless vary little from cell to cell — atypia at most focal, never field-wide. Fewer than 5 mitoses per 10 high-power fields is usual, versus more than 12 in high-grade serous carcinoma; that slow division is one hedged hypothesis for this tumor\'s poor response to platinum chemotherapy.' },
  ],
};

export const cancerDetails = {
  hgsoc: {
    title:'High-Grade Serous Carcinoma', screenLabel:'High-grade serous carcinoma — tumor explorer',
    legendTitle:'Sites (real intraperitoneal spread pattern)',
    regions:REGIONS_HGSOC, trunk:TRUNK_HGSOC, privatePool:PRIVATE_POOL_HGSOC,
    histology: HISTOLOGY_HGSOC,
  },
  clear: {
    title:'Clear-Cell Carcinoma', screenLabel:'Clear-cell carcinoma — tumor explorer',
    // The one-line site-model honesty statement, in the legend where the sites are: routes
    // shared with serous (Kondo 2020: "No CCC-specific recurrence site"), difference = timing.
    legendTitle:'Sites (same routes as serous — usually caught earlier)',
    regions:REGIONS_OCCC, trunk:TRUNK_OCCC, privatePool:PRIVATE_POOL_OCCC,
    histology: HISTOLOGY_OCCC,
  },
};
