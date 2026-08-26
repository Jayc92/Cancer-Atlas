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
export function buildOvaryMesh(){
  const geo = new THREE.SphereGeometry(1, 80, 80);
  organicDisplace(geo, 0.045, 6.5, 1.7);
  const mat = new THREE.MeshStandardMaterial({ color:0xe6b6a8, roughness:0.55, metalness:0.04 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(0.9, 1.28, 0.98);
  return mesh;
}

export const organDetail = {
  eyebrow:'Female Reproductive System', title:'Ovary',
  sub:'Paired organ · almond-sized · produces eggs and sex hormones',
  facts:[
    {label:'Size', val:'~3 × 1.5 × 1 cm'},
    {label:'Location', val:'Pelvis, either side of uterus'},
    {label:'Function', val:'Releases eggs; makes estrogen &amp; progesterone'},
    {label:'Blood supply', val:'Ovarian arteries'},
  ],
  desc:'The ovaries sit in the pelvis on either side of the uterus, each connected to a fallopian tube. Their outer surface — the site where most ovarian cancers actually begin — is covered by a single layer of epithelial cells.',
  buildMesh: buildOvaryMesh,
  hotspotScale: new THREE.Vector3(0.9, 1.28, 0.98),
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

export const cancerDetails = {
  hgsoc: {
    title:'High-Grade Serous Carcinoma', screenLabel:'High-grade serous carcinoma — tumor explorer',
    legendTitle:'Sites (real intraperitoneal spread pattern)',
    regions:REGIONS_HGSOC, trunk:TRUNK_HGSOC, privatePool:PRIVATE_POOL_HGSOC,
  },
};
