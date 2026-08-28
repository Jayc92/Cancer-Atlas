import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cssVar } from '../viewer.js';

// active:true, plus 'glioblastoma'/'gbm' aliases — checked for collision first: neither
// string appears anywhere else in this file.
export const organEntry = { key:'brain', label:'Brain', system:'Nervous', active:true, sexes:['female','male'], aliases:['brain','brains','cerebral','neurological','glioblastoma','gbm'] };

export const markerSpec = { points:[{heightFrac:0.95, angle:0}] };

export const cancerEntries = [
  // Shares are all "% of all primary brain and CNS tumors" (Price et al., CBTRUS, 2025) —
  // the report's own framing, not this file's invention. GBM (13.7%) and meningioma (42.6%)
  // are both directly confirmed exact figures. Astrocytoma and oligodendroglioma are real,
  // separately-diagnosed entities, but this report's own abstract only breaks out "gliomas"
  // as a combined 22.2% — leaving ~8.5% for every glioma that isn't glioblastoma, with no
  // individually-verified astrocytoma-vs-oligodendroglioma split found. Stated as a shared
  // range rather than fabricating a precise-looking split neither figure supports. Meningioma
  // arises from the meninges, not brain tissue itself — listed anyway because it's the single
  // most common primary intracranial tumor and every "real primary brain tumor" list (CBTRUS
  // included) reports it alongside the gliomas, same reasoning HCC's list included
  // cholangiocarcinoma despite its different cell of origin within the same organ.
  { id:'gbm',   name:'Glioblastoma',                    share:'13.7% of all primary brain/CNS tumors (52.2% of malignant ones)', active:true,  organKey:'brain' },
  { id:'astro', name:'Lower-grade astrocytoma',          share:'part of the ~8.5% of primary brain/CNS tumors that are gliomas other than glioblastoma', active:false, organKey:'brain' },
  { id:'odg',   name:'Oligodendroglioma',                share:'part of the same ~8.5% non-glioblastoma glioma share as lower-grade astrocytoma', active:false, organKey:'brain' },
  { id:'menin', name:'Meningioma',                       share:'42.6% of all primary brain/CNS tumors — the single most common, though it arises from the meninges, not brain tissue itself', active:false, organKey:'brain' },
];

// Real anatomy, not procedural: NIH 3D, "Human Reference Atlas 3D Reference Object Library"
// (account "HRA"), entry 3DPX-020959 — CC BY 4.0, sourced from the Visible Human Dataset base
// body plus the Allen Human Brain Atlas (Ding et al., 2016, J Comp Neurol 524(16):3127-3481)
// for the brain's own internal structure, mirrored/resized to fit. Full details in CLAUDE.md.
// This replaces the old displaced-sphere approximation, which had no real gyral/sulcal folding
// at all — that mesh's bumpy surface was a fake noise texture, not real anatomy. The Cerebral
// cortex hotspot below is now anchored to an actual gyrus on the real GLB.
// MATERIAL COLOR (real-tissue pass, verified before picking, not guessed): the old 0xd9b3ab
// was already directionally "pinkish-tan" on paper but too pale/desaturated to survive any
// real lighting — confirmed by sampling actual rendered pixels, not by eye, which is exactly
// the bug this pass exists to fix. Source: LMU Pressbooks, "Human Physiology," ch. 6.3 Brain
// Structure — "Gray matter is not necessarily gray. It can be pinkish because of blood
// content, or even slightly tan..." — quoted directly, not paraphrased from memory. This
// mesh's entire visible surface is cortex (gray matter), so that's the tone that applies here,
// not a generic "brain-colored" guess. 0xc17055 is a real, saturated pinkish-tan that samples
// correctly (confirmed numerically) instead of washing toward neutral gray-white.
export function buildBrainMesh(){
  const loader = new GLTFLoader();
  return new Promise((resolve, reject)=>{
    loader.load('assets/brain.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity 0.15, NOT MeshStandardMaterial (clip-fix
      // pass): this ports the missing half of the approved material verification — the
      // Blender renders the tissue colors were verified and approved on had Specular IOR
      // Level 0.15 baked in, but MeshStandardMaterial has no specular control at all, so the
      // live app kept full-strength dielectric specular. Under the legacy hard-clip pipeline
      // that blew grazing-angle fold/fissure walls to flat white (up to 26% of the lungs'
      // on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
      // js/viewer.js's warm-lighting comment. Color/roughness values unchanged.
      const mat = new THREE.MeshPhysicalMaterial({ color:0xc17055, roughness:0.7, metalness:0.0, specularIntensity:0.15 });
      gltf.scene.traverse(o=>{ if(o.isMesh) o.material = mat; });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Central Nervous System', title:'Brain',
  sub:'Four lobes · ventricular system · protected by the blood-brain barrier',
  facts:[
    {label:'Structure', val:'Four lobes per hemisphere — frontal, parietal, temporal, occipital'},
    {label:'Ventricles', val:'Four CSF-filled cavities — two lateral, third, fourth — linked by the cerebral aqueduct'},
    {label:'Blood supply', val:'Protected by the blood-brain barrier, a selective filter most drugs cannot cross'},
  ],
  // The blood-brain barrier gets the same second-sentence treatment every prior organ's one
  // genuinely distinguishing fact has gotten (Lungs' dual supply, Kidneys' retroperitoneal
  // position, Liver's dual supply) — here it's the one fact with the biggest treatment-design
  // consequence of any organ in this atlas, not just an anatomy trivia point.
  desc:'The brain is organized into four lobes per hemisphere — frontal, parietal, temporal, and occipital — surrounding a ventricular system of four connected, cerebrospinal-fluid-filled cavities. Unlike every other organ in this atlas, most of the brain\'s blood vessels are sealed by the blood-brain barrier, a layer of tightly-joined endothelial cells that blocks the great majority of drugs, including most chemotherapy, from ever reaching brain tissue at a useful concentration — a central reason glioblastoma remains so difficult to treat regardless of which mutations a given tumor carries.',
  buildMesh: buildBrainMesh,
  // Real-world-meter GLB (bbox ~14x17x15cm) — see lungs.js for why minRadius/maxRadius are
  // rescaled here rather than left at the old ~1-unit procedural values.
  viewer:{ theta:0.5, phi:1.15, radius:0.35, minRadius:0.09, maxRadius:0.8, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a brain, a rounded organic form with a loosely '
    + 'convoluted surface, with four glowing teal points marking the structures listed after '
    + 'it. Drag to rotate, scroll to zoom.',
  // pos: literal anchor points (meters, local mesh space) raycast against the real
  // assets/brain.glb surface — see lungs.js for the method. White matter/Ventricular
  // system/Blood-brain barrier have no distinct surface landmark of their own (they're
  // internal/diffuse structures), so their anchors sit on real cerebral-hemisphere surface
  // near the medial region closest to where each is anatomically found, rather than on the
  // separate cerebellum mass — confirmed distinct from a cerebellum-surface test point before
  // finalizing, same "don't just take whatever the raycast hits" check applied to every organ.
  hotspots:[
    // Directly parallel to every prior organ's first point — but the structure itself is
    // white matter, not the cortex a layperson might guess: confirmed directly (StatPearls,
    // "Glioblastoma") that GBM is a subcortical white matter disease first, with the cortex
    // more often secondarily involved than primarily where it starts.
    { key:'whitematter', label:'White matter', pos:[0.0583,0.0195,-0.0194],
      text:'The brain\'s inner bulk, made of the long nerve-fiber bundles connecting different regions — not the thin gray outer layer most people picture first. Glioblastoma, the most common primary brain cancer, most commonly arises here, in the subcortical white matter — directly paralleling how every other organ in this atlas has its own "arises here" structure, just one layer deeper than intuition suggests.' },
    { key:'ventricles', label:'Ventricular system', pos:[0.0062,0.0087,0.0449],
      text:'Four connected cavities deep in the brain that produce and circulate cerebrospinal fluid. The tissue immediately lining them, the subventricular zone, is a candidate source of the neural stem and progenitor cells some research points to as glioblastoma\'s cell of origin — genuine open debate, not a settled fact, in current neuro-oncology.' },
    { key:'cortex', label:'Cerebral cortex', pos:[0.0533,0.0540,-0.0010],
      text:'The thin, deeply folded outer layer of gray matter responsible for higher cognitive function. Unlike this atlas\'s other organs, this is deliberately NOT glioblastoma\'s "arises here" point — the disease is more often a white-matter process that secondarily reaches the cortex, not a cortical one from the start.' },
    { key:'bbb', label:'Blood-brain barrier', pos:[0.0200,-0.0038,0.0394],
      text:'A selective filter formed by tightly-joined blood-vessel cells that keeps most of the bloodstream\'s contents — including most drugs — out of healthy brain tissue. Glioblastoma partially disrupts this barrier within the tumor itself (which is why the tumor core "enhances" on contrast MRI), but the barrier stays largely intact at the tumor\'s infiltrating edges, a major reason chemotherapy struggles to reach the disease\'s full extent.' },
  ],
};

// STRUCTURAL DEPARTURE — verified before building anything, not assumed. Every prior cancer's
// four "sites" are real distant-metastasis locations (or, for HGSOC, a real intraperitoneal
// spread pattern) — different organs a tumor has actually spread to. GBM does not fit that
// model at all: extracranial metastasis occurs in under 1-2% of cases (Majd et al., The
// Oncologist, 2024, PMID 38837109, "Extraneural metastases occur in less than 1% of all
// patients with glioblastoma"; independently confirmed by Conejero Merchán et al., Open
// Respiratory Archives, 2026, "extracranial metastasis...occurs in less than 2% of cases") —
// modeling four distant organs here the way every prior cancer does would misrepresent the
// single most basic fact about how this disease actually behaves. What GBM genuinely has
// instead is well-documented intratumor *regional* heterogeneity within one infiltrative mass:
// the Ivy Glioblastoma Atlas Project's own histological zonation (leading edge/infiltrating
// tumor, cellular tumor, pseudopalisading cells around necrosis, microvascular proliferation)
// and the standard MRI-defined zones clinicians and radiogenomics studies already use
// (enhancing core, necrotic core, non-enhancing infiltrative margin, peritumoral edema) are
// the real structure this organ has. So the four "regions" below are zones of ONE tumor mass,
// not four separate organs — `pos3d` values are deliberately clustered tightly (unlike every
// prior cancer's widely-spaced sites) so the four spiculated blobs visually merge into one
// lumpy mass rather than reading as scattered distant metastases, and `legendTitle` says so
// explicitly rather than leaving a user to assume this cancer just has an unusually small
// spread radius. This reuses the exact same region/branch/raycast/keyboard machinery every
// prior cancer's site map uses — the departure is in the data (positions, framing, legend
// text) and the visual read, not a new rendering system, so every accessibility guarantee
// (`makeActivatable` labels, click-vs-drag guard, projected DOM proxies) carries over for free.
//
// BRANCH GENES ARE SPATIALLY, NOT POPULATION-ALLY, HETEROGENEOUS — a real, specific finding
// checked directly before using it to justify region-specific gene assignment (the task asked
// for exactly this verification). Snuderl et al. (Cancer Cell, 2011, PMID 22137795) confirmed
// directly: "up to three different receptor tyrosine kinases (EGFR, MET, PDGFRA) amplified in
// single tumors in different cells in a mutually exclusive fashion" — i.e. one tumor can
// contain both an EGFR-amplified subclone and a PDGFRA-amplified subclone side by side, each
// confined to its own region, never mixed within the same cell. Sottoriva et al. (PNAS, 2013,
// PMID 23412337) independently confirmed PDGFRA specifically: in one patient's tumor,
// "fragments T and T2 show no alterations, [while] focal gain and amplification are evident in
// fragments T3 and T4" — different amplification states in different physical samples of the
// same mass. This is exactly why EGFR and PDGFRA are each assigned to two of the four regions
// below rather than pooled together or treated as population-level alternatives the way Lung's
// KRAS/EGFR/ALK/ROS1 are (data rule 3) — the mutual exclusivity here operates within one tumor,
// at the level of "which fragment/region," not "which patient."
//
// TRUNK IS TWO ENTRIES, NOT ONE — the shared rendering code (`txMutGroup`) already `.forEach`s
// over `trunk`, so this needed no new code, just two real entries: (1) IDH-wildtype status
// itself, since the 2021 WHO reclassification made this the actual founding classifier for
// this disease (confirmed directly: Louis et al., Neuro-Oncology, 2021, PMID 34185076,
// "eliminates the term 'Glioblastoma, IDH-mutant'" — "glioblastoma" now *means* IDH-wildtype by
// definition, not a subtype split within it), and (2) TERT promoter mutation (83% of adult
// GBM, Killela et al., PNAS, 2013, PMID 23530248) — one of the three molecular criteria (with
// EGFR amplification and chr7 gain/chr10 loss) that lets an IDH-wildtype astrocytic tumor be
// called glioblastoma even without classic necrosis/microvascular-proliferation histology.
// 83% sits squarely in this atlas's own established trunk-prevalence range (TP53 ~96%/~80% for
// HGSOC/TNBC, VHL 86.6% for ccRCC) — genuinely trunk-tier by this project's own precedent, not
// a "private, one-cell-only" event the way its original suggested placement implied.
//
// GENES CHECKED AND EXCLUDED — the same "don't just trust the gene name" standard that caught
// ESR1/MDM4, LUAD's SMAD4/PTEN, and HCC's AXIN1, applied up front this time:
// - ATRX loss: real, common in glioma generally — but a defining marker of IDH-*mutant*
//   astrocytoma specifically, not IDH-wildtype glioblastoma (confirmed directly: multiple
//   sources describe ATRX loss as part of the "early lineage-defining alterations (IDH1/2,
//   ATRX, TP53)" in the IDH-mutant lineage, with IDH-wildtype GBM typically retaining ATRX
//   function). Including it here would misrepresent the exact molecular boundary this organ's
//   trunk-level classifier exists to draw. Excluded.
// - NF1 loss: real, ~10% of GBM (Brennan et al., Cell, 2013, PMID 24120142) — but confirmed
//   directly to be mutually exclusive with EGFR alterations specifically ("NF1 alterations were
//   mutually exclusive with EGFR and MDM2 alterations"), and named alongside EGFR and PDGFRA as
//   three *alternative* subtype-defining drivers, not a cooperating fourth. The same class of
//   problem AXIN1 was for HCC's CTNNB1 branch gene — a private-pool gene competing with a
//   branch gene already in use. Excluded.
// - RB1 loss: real, 7.6% of GBM (Brennan et al., 2013) — but confirmed directly as an
//   *alternative* route to disabling the Rb checkpoint, mutually exclusive with CDKN2A/B
//   deletion and CDK4/6 amplification ("78.9% of tumors had one or more alteration affecting
//   Rb function," achieved via one mechanism, not several stacked). Since CDKN2A/B deletion is
//   already this organ's private-pool cell-cycle gene, adding RB1 loss too would repeat the
//   AXIN1 problem a second time within one organ. Excluded.
// - PIK3CA/PIK3R1 mutation: real, 25.1% of GBM (Brennan et al., 2013) — but confirmed directly
//   as mutually exclusive with PTEN mutation/deletion specifically ("PI3K mutations were
//   mutually exclusive of PTEN mutations/deletions"), and PTEN loss is already this organ's
//   PI3K-pathway private-pool gene. Excluded for the same reason as RB1 loss.
const REGIONS_GBM = [
  { id:'EC', name:'Enhancing core', color:cssVar('--coral'), pos3d:{x:0.35,y:0.2,z:0.2},
    branch:{ gene:'EGFR amplification', class:'driver', ccf:'part of 57.4% of GBM with an EGFR alteration overall — mutation and/or amplification combined, not amplification alone (Brennan et al., Cell, 2013)', note:'A growth-factor receptor gene, amplified independently in its own tumor region — confirmed directly (Snuderl et al., Cancer Cell, 2011) as spatially, not just population-level, heterogeneous: different regions of one GBM can each be dominated by a different amplified receptor tyrosine kinase, never mixed within the same cell.' } },
  { id:'NC', name:'Necrotic core', color:cssVar('--azure'), pos3d:{x:-0.1,y:-0.3,z:0.3},
    branch:{ gene:'EGFR amplification', class:'driver', ccf:'part of 57.4% of GBM with an EGFR alteration overall (Brennan et al., Cell, 2013)', note:'The same EGFR-amplified subclone as the Enhancing core region — real GBMs are known to carry the same dominant receptor-tyrosine-kinase amplification across adjacent, but not all, regions of one mass.' } },
  { id:'IM', name:'Infiltrative margin', color:cssVar('--amber'), pos3d:{x:-0.4,y:0.15,z:-0.25},
    branch:{ gene:'PDGFRA amplification', class:'driver', ccf:'part of 13.1% of GBM with a PDGFRA alteration overall — mutation and/or amplification combined (Brennan et al., Cell, 2013)', note:'A different growth-factor receptor gene, amplified in a spatially distinct subclone from the EGFR-amplified regions above — confirmed directly (Sottoriva et al., PNAS, 2013): in one real tumor, some physical fragments showed no PDGFRA alteration at all while others showed focal amplification, the same mass containing both.' } },
  { id:'ED', name:'Peritumoral edema', color:cssVar('--violet'), pos3d:{x:0.15,y:0.4,z:-0.3},
    branch:{ gene:'PDGFRA amplification', class:'driver', ccf:'part of 13.1% of GBM with a PDGFRA alteration overall (Brennan et al., Cell, 2013)', note:'The same PDGFRA-amplified subclone as the Infiltrative margin region — infiltrating tumor cells are known to extend well past the visible mass into surrounding edematous tissue, carrying whichever region\'s driver alteration they descended from.' } },
];
const TRUNK_GBM = [
  { gene:'IDH-wildtype status', class:'driver', ccf:'the founding classifier of this disease under the 2021 WHO reclassification (Louis et al., Neuro-Oncology, 2021)', note:'"Glioblastoma" now specifically means an IDH-*wildtype* diffuse astrocytic tumor — the 2021 WHO update "eliminates the term \'Glioblastoma, IDH-mutant\'" entirely. A grade-4 astrocytic tumor that instead carries an IDH1/IDH2 mutation is now a wholly different diagnosis, Astrocytoma IDH-mutant, with a substantially better prognosis — not a subtype of glioblastoma. One clinically crucial biomarker deliberately has no entry of its own anywhere in this ledger: MGMT promoter methylation status, the single strongest predictor of temozolomide chemotherapy response in this disease, is an epigenetic silencing mark, not a DNA mutation — this ledger tracks genetic alterations specifically, so MGMT status is described here in prose rather than forced into a driver/passenger slot that would misrepresent what kind of change it actually is.' },
  { gene:'TERT promoter mutation', class:'driver', ccf:'83% of adult glioblastoma (Killela et al., PNAS, 2013)', note:'Reactivates telomerase. One of three molecular criteria — alongside EGFR amplification and chromosome 7 gain/10 loss — that lets pathologists call an IDH-wildtype astrocytic tumor "glioblastoma" even without the classic necrosis or microvascular proliferation seen under the microscope. At 83% prevalence this is genuinely trunk-tier, not an occasional private finding.' },
];
const PRIVATE_POOL_GBM = [
  { gene:'PTEN loss', class:'driver', ccf:'~34% of GBM (computed from Brennan et al., Cell, 2013: PI3K-pathway mutations were mutually exclusive of PTEN alterations, with 59.4% of GBM showing one or the other and PI3K mutations alone at 25.1% — 59.4% − 25.1% = ~34.3% PTEN-specific)', note:'Removes a brake on the PI3K/AKT growth pathway downstream of receptor tyrosine kinase signaling — cooperates with either EGFR- or PDGFRA-amplified regions rather than competing with them, since it acts further downstream in the same signaling cascade both receptors feed into.' },
  { gene:'CDKN2A/B deletion', class:'driver', ccf:'57.8% of GBM (Brennan et al., Cell, 2013)', note:'Removes the p16/p14ARF brake on the cell cycle and p53 pathway — a distinct mechanism from the PI3K/AKT axis PTEN loss affects, so the two cooperate rather than substitute for one another. RB1 loss and CDK4/6 amplification reach a similar end effect on the same checkpoint through alternative, mutually exclusive routes — real GBM findings, but deliberately not included alongside this gene for that reason.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly at the source): the WHO
// CNS5 summary this organ already cites (Louis et al., Neuro-Oncology, 2021) states the
// diagnostic rule verbatim as five OR-joined criteria — glioblastoma, IDH-wildtype "should
// be diagnosed... if there is microvascular proliferation or necrosis or TERT promoter
// mutation or EGFR gene amplification or +7/−10 chromosome copy number changes" — so
// necrosis and MVP are literally diagnostic criteria here, not just descriptions, and the
// intro says so. PathologyOutlines' GBM page confirms both features' morphology directly:
// pseudopalisading as "neoplastic cells surrounding central necrosis" (with "microvascular
// proliferation or necrosis is required for a histologic diagnosis of GBM"), and MVP as
// "multilayered, small caliber vessels with glomeruloid appearance." The "garland-like
// arrangement of hypercellular tumor nuclei" phrasing is from Wippold et al., AJNR, 2006
// (PMID 17110662) — the pseudopalisade-specific source, checked because "dense rows of
// nuclei" was originally an unverified paraphrase.
const HISTOLOGY_GBM = {
  intro: 'Glioblastoma’s two defining microscopic features are pseudopalisading necrosis — garland-like, hypercellular rims of tumor nuclei lining up around irregular necrotic zones — and microvascular proliferation: multilayered, small-caliber vessels piled into glomeruloid tufts. Under the WHO 2021 classification these are diagnostic criteria, not just descriptions: in an IDH-wildtype diffuse astrocytic glioma, either one is sufficient on its own to make the diagnosis.',
  ariaSummary: 'Stylized microscopic field: a pale, irregular serpentine band of necrosis crosses the middle, its borders rimmed on both sides by densely packed, elongated dark nuclei standing perpendicular to the edge — the pseudopalisades. Away from the band, the field is diffusely hypercellular with small irregular tumor nuclei. Two rounded tufts of piled-up small red vessels — glomeruloid microvascular proliferation — sit in opposite corners.',
  citation: 'Louis et al., Neuro-Oncology, 2021 (WHO CNS5); PathologyOutlines.com, "Glioblastoma, IDH wild type"; Wippold et al., AJNR, 2006.',
  features: [
    { key:'palisading', label:'Pseudopalisading necrosis',
      text:'Neoplastic cells surrounding central necrosis in garland-like, hypercellular rims. This is one of the WHO 2021 diagnostic criteria: an IDH-wildtype diffuse astrocytic glioma with necrosis is glioblastoma, full stop.' },
    { key:'mvp', label:'Microvascular proliferation',
      text:'Multilayered, small-caliber vessels with a glomeruloid appearance — the other histologic criterion. Either this or necrosis suffices for the diagnosis, alongside the three molecular routes (TERT promoter mutation, EGFR amplification, +7/−10 chromosome changes).' },
    { key:'hypercell', label:'Hypercellular tumor',
      text:'Densely packed, irregularly oriented tumor nuclei fill the field between the landmark features — the diffusely infiltrative background this tumor grows as.' },
  ],
};

export const cancerDetails = {
  gbm: {
    title:'Glioblastoma', screenLabel:'Glioblastoma — intratumor region explorer',
    legendTitle:'Regions within one tumor (GBM rarely metastasizes)',
    regionWord:'region',
    regions:REGIONS_GBM, trunk:TRUNK_GBM, privatePool:PRIVATE_POOL_GBM,
    histology: HISTOLOGY_GBM,
  },
};
