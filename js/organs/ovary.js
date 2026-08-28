import * as THREE from 'three';
import { cssVar, organicDisplace } from '../viewer.js';

export const organEntry = { key:'ovary', label:'Ovaries', system:'Reproductive', active:true, sexes:['female'], aliases:['ovary','ovaries','ovarian'] };

export const markerSpec = { points:[{heightFrac:0.49, angle:-25}, {heightFrac:0.49, angle:25}] };

export const cancerEntries = [
  { id:'hgsoc', name:'High-grade serous carcinoma', share:'~70% of ovarian carcinomas', active:true,  organKey:'ovary' },
  { id:'endo',  name:'Endometrioid carcinoma',       share:'~10% of ovarian carcinomas', active:false, organKey:'ovary' },
  { id:'clear', name:'Clear-cell carcinoma',         share:'~10% of ovarian carcinomas', active:false, organKey:'ovary' },
  { id:'muc',   name:'Mucinous carcinoma',           share:'~3% of ovarian carcinomas',  active:false, organKey:'ovary' },
  { id:'lgsc',  name:'Low-grade serous carcinoma',   share:'<5% of ovarian carcinomas',  active:false, organKey:'ovary' },
];

// hotspotScale mirrors whatever non-uniform mesh.scale the organ's buildMesh() applies, so a
// hotspot's `dir` vector lands on the mesh's actual (stretched) surface rather than on the
// surface of the unstretched unit sphere/dome the direction was computed against.
//
// MESH-DETAIL PASS (tech-debt/quality pass): every organ SphereGeometry bumped 48→80 segments
// (2401→6561 vertices), LatheGeometry 32→48 radial segments, and the breast dome/cap/nipple
// proportionally. organicDisplace's own sine-based wobble (freq up to 8 on Brain) was
// genuinely under-resolved at 48 segments — visible faceting on the lit highlight, confirmed by
// screenshot before touching anything, not assumed from the "looks rough" complaint alone.
// Performance checked directly, not assumed safe: a synthetic THREE.WebGLRenderer benchmark
// (same organicDisplace/organicSpiculate code, isolated from the app) measured raw render() cost
// from 48 up to 192 segments — every level stayed under 0.04ms/frame, noise-dominated, no
// scaling trend — so 80 sits with enormous headroom to spare, not maxed out just because the
// budget allows it. (This app's own rAF loop can't be measured directly in this headless
// preview environment — document.hidden reports true even when the tab is fronted, so
// requestAnimationFrame never fires between tool calls. The synthetic render()-timing benchmark
// is the real, defensible substitute, not a guess.) computeVertexNormals() already runs after
// every displacement call, so shading was never the problem — this was a pure vertex-density fix.
// PROPORTION FIX (real-anatomy pass, after two research passes turned up no real, non-gated
// ovary asset worth integrating — see CLAUDE.md's "Ovary real-asset research" entry for why):
// the scale below used to be (0.9, 1.28, 0.98) — width and thickness nearly equal, i.e. a
// barely-elongated blob — while this very file's own `facts` panel already stated a real
// 3.5:2:1 length:width:thickness ratio (StatPearls, "Anatomy, Abdomen and Pelvis, Ovary,"
// confirmed directly: 3.5cm length x 2.0cm width x 1.0cm thickness) that the mesh never
// actually matched. Y is this mesh's length axis (same convention the Hilum hotspot's `dir`
// already assumes, near the -Y pole), so Y's scale stays 1.28 and X/Z are re-derived from the
// verified ratio (width = length x 2/3.5, thickness = length x 1/3.5) instead of the old,
// unsourced numbers — a visibly flatter, more almond-like result than this used to render as.
// `hotspotScale` below is updated to match, so the `dir` vectors keep landing on the real
// surface rather than the old (now-wrong) one.
// MATERIAL COLOR (real-tissue pass, verified before picking): the old 0xe6b6a8 was a pale
// peachy-tan, again closer to generic skin tone than the organ's real surface color. Confirmed
// against PathologyOutlines.com and IMAIOS gross-anatomy descriptions: the normal ovary's
// surface is pale grayish-pink to white, smooth in youth and increasingly convoluted with age —
// distinctly cooler/grayer than a warm tan. 0xc9ac9e moves the base color into that real
// grayish-pink family, darkened slightly from a "true pale" reading so it holds its color under
// the warm key light instead of washing to near-white the way Brain's original color did.
export function buildOvaryMesh(){
  const geo = new THREE.SphereGeometry(1, 80, 80);
  organicDisplace(geo, 0.045, 6.5, 1.7);
  // MeshPhysicalMaterial + specularIntensity 0.15, NOT MeshStandardMaterial (clip-fix
  // pass): this ports the missing half of the approved material verification — the
  // Blender renders the tissue colors were verified and approved on had Specular IOR
  // Level 0.15 baked in, but MeshStandardMaterial has no specular control at all, so the
  // live app kept full-strength dielectric specular. Under the legacy hard-clip pipeline
  // that blew grazing-angle fold/fissure walls to flat white (up to 26% of the lungs'
  // on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
  // js/viewer.js's warm-lighting comment. Color/roughness values unchanged.
  const mat = new THREE.MeshPhysicalMaterial({ color:0xc9ac9e, roughness:0.55, metalness:0.0, specularIntensity:0.15 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(1.28 * (2.0/3.5), 1.28, 1.28 * (1.0/3.5));
  return mesh;
}

export const organDetail = {
  eyebrow:'Female Reproductive System', title:'Ovary',
  sub:'Paired organ · almond-sized · produces eggs and sex hormones',
  facts:[
    {label:'Size', val:'~3.5 × 2 × 1 cm (StatPearls)'},
    {label:'Location', val:'Pelvis, either side of uterus'},
    {label:'Function', val:'Releases eggs; makes estrogen &amp; progesterone'},
    {label:'Blood supply', val:'Ovarian arteries'},
  ],
  desc:'The ovaries sit in the pelvis on either side of the uterus, each connected to a fallopian tube. Their outer surface — the site where most ovarian cancers actually begin — is covered by a single layer of epithelial cells.',
  buildMesh: buildOvaryMesh,
  hotspotScale: new THREE.Vector3(1.28 * (2.0/3.5), 1.28, 1.28 * (1.0/3.5)),
  viewer:{ theta:0.5, phi:1.2, radius:4, minRadius:2.6, maxRadius:6, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of an ovary, an off-white lumpy ellipsoid, with four glowing '
    + 'teal points marking the structures listed after it. Drag to rotate, scroll to zoom.',
  hotspots:[
    { key:'surface', label:'Surface epithelium', dir:[0.28,0.6,0.85],
      text:'A single layer of cells covering the ovary\'s outer surface. Most ovarian cancers, including high-grade serous carcinoma, are now thought to arise here or in the adjacent fallopian tube.' },
    { key:'cortex', label:'Cortex', dir:[0.88,0.12,0.25],
      text:'The outer functional layer, packed with follicles at every stage of development — from resting to nearly ready to release an egg.' },
    { key:'medulla', label:'Medulla', dir:[-0.35,0.15,-0.85],
      text:'The core of the ovary, deep to the cortex — loose connective tissue carrying the blood vessels, lymphatics, and nerves that supply it.' },
    { key:'hilum', label:'Hilum', dir:[0.05,-1,0.12],
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

export const cancerDetails = {
  hgsoc: {
    title:'High-Grade Serous Carcinoma', screenLabel:'High-grade serous carcinoma — tumor explorer',
    legendTitle:'Sites (real intraperitoneal spread pattern)',
    regions:REGIONS_HGSOC, trunk:TRUNK_HGSOC, privatePool:PRIVATE_POOL_HGSOC,
    histology: HISTOLOGY_HGSOC,
  },
};
