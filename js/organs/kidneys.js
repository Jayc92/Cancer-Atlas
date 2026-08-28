import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cssVar } from '../viewer.js';

// active:true, plus 'renal'/'ccrcc'/'clear cell' aliases — checked for collision first: no
// other organ's aliases contain any of these strings, and organMatchesQuery only ever reads
// organ.label/organ.aliases, never CANCERS[].name — so "clear cell" resolving to Kidneys
// can't collide with Ovary's "Clear-cell carcinoma" cancer, which isn't searchable at all.
export const organEntry = { key:'kidneys', label:'Kidneys', system:'Urinary', active:true, sexes:['female','male'], aliases:['kidney','kidneys','renal','ccrcc','clear cell','clear cell carcinoma','renal cell carcinoma'] };

export const markerSpec = { points:[{heightFrac:0.53, angle:-50}, {heightFrac:0.53, angle:50}] };

export const cancerEntries = [
  // id 'ccrcc', not 'clear' — 'clear' is already taken by Ovary's Clear-cell carcinoma above.
  // Cancer names/ids are never searched (see the Kidneys ORGANS comment), so this wouldn't be
  // a functional collision either way, but a shared id would break regionCellCache/panel state
  // if a user ever had both cancer screens loaded in the same session's history.
  { id:'ccrcc', name:'Clear cell renal cell carcinoma',  share:'~75–80% of renal cell carcinomas', active:true,  organKey:'kidneys' },
  { id:'prcc',  name:'Papillary renal cell carcinoma',   share:'~15% of renal cell carcinomas',    active:false, organKey:'kidneys' },
  { id:'chrcc', name:'Chromophobe renal cell carcinoma', share:'~5% of renal cell carcinomas',      active:false, organKey:'kidneys' },
];

// Real anatomy, not procedural: NIH 3D, "Human Reference Atlas 3D Reference Object Library"
// (account "HRA"), entry 3DPX-020967 — CC BY 4.0, same sourcing/decimation discipline as Lungs
// above. Full details in CLAUDE.md. This replaces the old flattened-sphere approximation, which
// had no literal concave medial notch (SphereGeometry + non-uniform scale can't produce one) —
// the real GLB does, confirmed visually (render_preview2.py) before the Hilum/Renal pelvis
// points below were anchored to it. The source scan is specifically the left kidney (the
// collection doesn't include a separate right-kidney model); used here to represent "a kidney"
// generically, same as the procedural version's single unlabeled-side ellipsoid did.
// MATERIAL COLOR (real-tissue pass, verified before picking): the old 0x9c4a42 was already a
// reasonable reddish-brown direction, but checked and richened rather than assumed correct.
// Source: Monash University's online pathology atlas (epath.med.monash.edu.au) and a BCcampus
// open-textbook description, both confirmed directly — a normal kidney's cut surface is
// "reddish-brown... reflecting the rich capillary network of the nephrons and the high blood
// flow through the glomerular capillaries," with the cortex a lighter red-brown than the
// darker medulla. 0x8c3a30 keeps the same real hue family, pushed slightly more saturated so
// it holds up under the organ viewer's lighting rather than washing paler.
export function buildKidneysMesh(){
  const loader = new GLTFLoader();
  return new Promise((resolve, reject)=>{
    loader.load('assets/kidneys.glb', (gltf)=>{
      const mat = new THREE.MeshStandardMaterial({ color:0x8c3a30, roughness:0.55, metalness:0.0 });
      gltf.scene.traverse(o=>{ if(o.isMesh) o.material = mat; });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Urinary System', title:'Kidneys',
  sub:'Paired organs · retroperitoneal · filter ~180L of blood per day',
  facts:[
    {label:'Location', val:'Retroperitoneal — behind the peritoneum, unlike every other organ in this atlas'},
    {label:'Function', val:'Filtration via ~1 million nephrons per kidney, ~180L blood/day'},
    {label:'Blood supply', val:'Renal arteries, direct branches of the aorta'},
  ],
  // The retroperitoneal fact is worth a second sentence for the same reason lungs' dual blood
  // supply got one: it's the one anatomically distinct thing about this organ relative to
  // every prior organ in this atlas — ovary and breast tissue are both intraperitoneal/overlying
  // structures, lungs are thoracic, but the kidneys sit behind the peritoneal lining entirely.
  desc:'The kidneys sit retroperitoneally — behind the peritoneum lining the abdominal cavity, not within it, unlike every other organ modeled in this atlas so far. Each kidney filters blood through roughly 1 million nephrons, processing about 180 liters of blood a day, with the resulting urine draining into the renal pelvis before leaving via the ureter.',
  buildMesh: buildKidneysMesh,
  // Real-world-meter GLB (bbox ~7x8x12cm) — see lungs.js for why minRadius/maxRadius are
  // rescaled here rather than left at the old ~1-unit procedural values. theta/phi are NOT the
  // same inherited default every other organ kept (0.5/1.15) — that angle put all four hotspots
  // (clustered together on the medial/hilum side of this mesh, unlike the other four organs'
  // more spread-out anchors) on the far side of the model, invisible without rotating first.
  // Re-aimed at the hotspot cluster's own average direction so at least one, usually all four,
  // are visible on load — found empirically via direct camera placement against the live mesh
  // and confirmed by screenshot, the same standard Lungs' default view was held to.
  viewer:{ theta:-1.278, phi:1.375, radius:0.3, minRadius:0.06, maxRadius:0.6, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a kidney, a flattened bean-shaped organic form, with '
    + 'four glowing teal points marking the structures listed after it. Drag to rotate, scroll '
    + 'to zoom.',
  // pos: literal anchor points (meters, local mesh space) raycast against the real
  // assets/kidneys.glb surface — see lungs.js for the method. Hilum/Renal pelvis both land in
  // the real concave medial notch (distinct points within it); Cortex/Medulla are the outer and
  // more-central surface respectively.
  hotspots:[
    // Directly parallel to the ovary's surface-epithelium point, breast's ducts, and lungs'
    // alveoli: this is the "arises here" structure for this organ, framed the same way.
    { key:'cortex', label:'Cortex', pos:[-0.0292,-0.0191,-0.0244],
      text:'The outer layer of the kidney, containing the filtering unit (glomerulus) of each nephron. Clear cell renal cell carcinoma, the most common kidney cancer subtype, most commonly arises here — directly paralleling how ovarian cancer begins in the ovary\'s surface epithelium, breast cancer in the breast\'s ducts, and lung adenocarcinoma in the lung\'s alveoli.' },
    { key:'medulla', label:'Medulla', pos:[-0.0212,-0.0010,0.0057],
      text:'The inner layer, made up of cone-shaped renal pyramids whose tips (papillae) drain urine toward the renal pelvis — each pyramid fed by a cluster of nephrons\' collecting ducts.' },
    { key:'pelvis', label:'Renal pelvis', pos:[-0.0213,0.0157,0.0243],
      text:'The funnel-shaped chamber where urine collects from the renal pyramids before draining into the ureter and on to the bladder.' },
    { key:'hilum', label:'Hilum', pos:[-0.0193,0.0233,0.0213],
      text:'The concave medial notch where the renal artery enters and the renal vein and ureter exit — the kidney\'s only point of entry and exit.' },
  ],
};

// Framing note — the OPPOSITE relationship from Lung's KRAS/EGFR/ALK/ROS1 rule (data rule 3):
// PBRM1/SETD2/BAP1 are NOT alternative/competing drivers to VHL. TCGA (Nature, 2013) reports
// chromosome 3p loss in 91% of ccRCC tumors "encompassing all of the four most commonly mutated
// genes (VHL, PBRM1, BAP1 and SETD2)" — these genes' most common alteration IS the same single
// 3p-deletion event that removes VHL, not four independent choices a tumor makes instead of one
// another. Checked KDM5C individually rather than assuming it shares this mechanism just because
// it's another branch gene in the same "cooperating" cancer: KDM5C sits on Xp11.22 (NCBI Gene ID
// 8242), not chromosome 3p, so it cooperates with VHL loss without being co-deleted alongside it
// — still real and TCGA-confirmed (one of the 8 most significantly mutated ccRCC genes at
// q<0.00001), just a mechanistically distinct flavor of "cooperating, not competing" than the
// other three. Don't assume every branch gene in a "cooperating" cancer shares one mechanism any
// more than every branch gene in a "competing" cancer (Lung) does — check each one.
const REGIONS_CCRCC = [
  { id:'KL', name:'Lung', color:cssVar('--coral'), pos3d:{x:-0.3,y:1.3,z:0.3},
    branch:{ gene:'PBRM1 mutation', class:'driver', ccf:'~41% of clear cell RCC (TCGA, Nature, 2013)', note:'A SWI/SNF chromatin-remodeling gene on chromosome 3p, alongside VHL — its most common alteration is co-deletion in the same 3p-loss event that removes VHL, not an independent or competing driver choice.' } },
  { id:'KB', name:'Bone', color:cssVar('--azure'), pos3d:{x:-1.3,y:-0.5,z:0.2},
    branch:{ gene:'SETD2 mutation', class:'driver', ccf:'~12% of clear cell RCC (TCGA, Nature, 2013)', note:'Another chromosome-3p chromatin gene co-deleted alongside VHL. Gerlinger et al. (NEJM, 2012) found convergent evolution at this exact gene within a single tumor — three distinct SETD2 mutations (a shared missense change in the metastases, a splice-site change in one region, and a shared frameshift deletion in every other region) arising independently rather than from one shared ancestral hit.' } },
  { id:'KV', name:'Liver', color:cssVar('--amber'), pos3d:{x:1.2,y:-0.3,z:-0.5},
    branch:{ gene:'BAP1 mutation', class:'driver', ccf:'~15% of clear cell RCC (TCGA, Nature, 2013)', note:'A third chromosome-3p tumor-suppressor gene co-deleted alongside VHL, PBRM1, and SETD2 in the same 91%-of-tumors 3p-loss event (TCGA, Nature, 2013) — cooperating with the trunk VHL loss, not competing with it.' } },
  { id:'KC', name:'Brain', color:cssVar('--violet'), pos3d:{x:0.2,y:-1.3,z:0.4},
    branch:{ gene:'KDM5C mutation', class:'driver', ccf:'recurrent (TCGA, Nature, 2013 — among the 8 most significantly mutated ccRCC genes)', note:'Unlike PBRM1/SETD2/BAP1 above, KDM5C sits on the X chromosome (Xp11.22), not chromosome 3p, so it cooperates with VHL loss without being co-deleted alongside it. Gerlinger et al. (NEJM, 2012) found convergent evolution here too — independent disruptive mutations arising in different regions of the same tumor.' } },
];
// A single dominant trunk, like TP53 for HGSOC/TNBC — the opposite pattern from Lung's KRAS,
// which explicitly is NOT near-universal. Gerlinger et al. (NEJM, 2012) is cited separately from
// the inactivation-frequency figure because it establishes something the frequency alone doesn't:
// "Of these driver genes, only VHL was mutated ubiquitously in all analyzed regions" — i.e. VHL
// sits before the branching point of the tumor's own evolutionary tree, the architectural sense
// of "truncal" this atlas's Trunk/Branch/Private vocabulary is built around, not just "common."
const TRUNK_CCRCC = [
  { gene:'VHL inactivation', class:'driver', ccf:'86.6% of clear cell renal cell carcinoma, via mutation or promoter methylation (Moore et al., PLOS Genetics, 2011)', note:'Disables the von Hippel-Lindau tumor suppressor — the founding event of this disease. Gerlinger et al. (NEJM, 2012) confirmed VHL was the one driver gene mutated in every single region sampled across the tumors they studied, present before the branching point of each tumor\'s evolutionary tree — architecturally truncal, not just the most common event.' },
];
const PRIVATE_POOL_CCRCC = [
  { gene:'MTOR mutation', class:'driver', ccf:'part of a PI3K/Akt/mTOR pathway-alteration pattern found in ~28% of ccRCC tumors, with alterations across pathway components mutually exclusive with each other (TCGA, Nature, 2013)', note:'Activates a growth-signaling pathway downstream of, and independent from, the VHL/HIF axis — a parallel route to proliferation that cooperates with the trunk VHL loss rather than substituting for it.' },
  { gene:'PTEN loss', class:'driver', ccf:'part of the same ~28% PI3K/Akt/mTOR pathway-alteration pattern (TCGA, Nature, 2013)', note:'Removes a brake on the same PI3K/Akt/mTOR pathway MTOR mutations activate directly. Gerlinger et al. (NEJM, 2012) found convergent evolution here too — two independent PTEN mutations (a splice-site change and a missense change) arising separately in different, spatially separated regions of the same tumor.' },
  { gene:'CDKN2A loss', class:'driver', note:'Removes a cell-cycle checkpoint (the p16 brake on CDK4/6) — recurrent and subtype-associated in ccRCC (TCGA, Nature, 2013), cooperating with the trunk VHL loss rather than competing with it, the same cell-cycle-checkpoint role this gene plays in every other cancer modeled in this atlas.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

export const cancerDetails = {
  ccrcc: {
    title:'Clear Cell Renal Cell Carcinoma', screenLabel:'Clear cell renal cell carcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_CCRCC, trunk:TRUNK_CCRCC, privatePool:PRIVATE_POOL_CCRCC,
  },
};
