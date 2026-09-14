import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

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
  { id:'gbm',   name:'Glioblastoma',                    share:'13.7% of all primary brain/CNS tumors (52.2% of malignant ones; CBTRUS, US 2018–2022)', active:true,  organKey:'brain' },
  { id:'astro', name:'Astrocytoma, IDH-mutant',          share:'8.9% of molecularly-defined adult-type diffuse gliomas (6,095/68,172, Gomez et al., Neuro-Oncology, 2026, CBTRUS 2018–2022 registry data) — a real, distinct WHO CNS5 diagnosis, not a lesser-graded version of glioblastoma', active:true, organKey:'brain' },
  { id:'odg',   name:'Oligodendroglioma',                share:'7.0% of the same molecularly-defined adult-type diffuse glioma population (4,748/68,172, Gomez et al., 2026) — requires BOTH an IDH mutation AND whole-arm 1p/19q co-deletion by WHO CNS5 definition', active:true, organKey:'brain' },
  { id:'menin', name:'Meningioma',                       share:'42.6% of all primary brain/CNS tumors — the single most common, though it arises from the meninges, not brain tissue itself (Price et al., CBTRUS, Neuro-Oncology, 2025)', active:true, organKey:'brain' },
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
// MATERIAL/LIGHTING REALISM PASS — shared recipe (roughness x0.82, specularIntensity 0.15->0.25,
// per-vertex tissue mottle at amplitude 0.28) applied uniformly across all nine real-scan
// organs; full mechanism, clip-safety reasoning, and the transmission investigation's null
// result are in liver.js's own comment (the canonical write-up) and this pass's dated CLAUDE.md
// entry. Color unchanged (0xc17055 stays the verified LMU Pressbooks tone). Seed 1.3 (organ #1
// in ORGAN_MODULES' order x1.3 — see liver.js for why this is deterministic-but-arbitrary rather
// than tuned per organ).
export function buildBrainMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/brain.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity (clip-fix pass, now 0.25 — realism-pass
      // comment above), NOT MeshStandardMaterial: this ports the missing half of the approved
      // material verification — the Blender renders the tissue colors were verified and
      // approved on had Specular IOR Level baked in, but MeshStandardMaterial has no specular
      // control at all, so the live app kept full-strength dielectric specular. Under the legacy
      // hard-clip pipeline that blew grazing-angle fold/fissure walls to flat white (up to 26% of
      // the lungs' on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
      // js/viewer.js's warm-lighting comment. Color unchanged; roughness and specularIntensity
      // both revised by the realism pass above.
      const mat = new THREE.MeshPhysicalMaterial({ color:0xc17055, roughness:0.57, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 1.3); } });
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
  // The blood-brain barrier gets the same second-sentence treatment other organs give their least
  // intuitive anatomical fact (Lungs' dual supply, Kidneys' retroperitoneal position, Liver's dual
  // supply) — here it is the fact with the largest treatment-design consequence, not an anatomy
  // trivia point.
  // THE PRECEDENT IS THE TREATMENT, NOT A UNIQUENESS CLAIM, and that distinction is the whole
  // repair: this comment used to call each of those three facts the organ's "one genuinely
  // distinguishing fact", and two of the three were false in exactly that sense — the lungs' and
  // the liver's dual supplies are each other's counterexample, and the kidneys' retroperitoneal
  // position is the pancreas's. The second sentence survives at all three sites; only the
  // exclusivity did not. A house style that rewards finding a distinguishing fact per organ is
  // also a house style that manufactures false universals, which is why the flag tier in
  // absence_claim_check.py exists and why this comment no longer asserts one.
  desc:'The brain is organized into four lobes per hemisphere — frontal, parietal, temporal, and occipital — surrounding a ventricular system of four connected, cerebrospinal-fluid-filled cavities. Most of the brain\'s blood vessels are sealed by the blood-brain barrier, a layer of tightly-joined endothelial cells that blocks the great majority of drugs, including most chemotherapy, from ever reaching brain tissue at a useful concentration — a central reason glioblastoma remains so difficult to treat regardless of which mutations a given tumor carries.',
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
      text:'The thin, deeply folded outer layer of gray matter responsible for higher cognitive function. This is deliberately NOT glioblastoma\'s "arises here" point — the disease is more often a white-matter process that secondarily reaches the cortex, not a cortical one from the start. Meningioma, this organ\'s most common tumor overall, arises here in a different sense: not from the cortex itself but from the meninges — specifically the arachnoid cap cells — immediately covering it (StatPearls, "Meningioma," NBK560538), which is why its own hotspot override anchors to this point rather than to white matter.' },
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
    branch:{ gene:'EGFR amplification', class:'driver', ccf:'part of 57.4% of GBM with an EGFR alteration overall — mutation and/or amplification combined, not amplification alone (Brennan et al., Cell, 2013)', note:'The same EGFR-amplified subclone as the Enhancing core region — real GBMs are known to carry the same dominant receptor-tyrosine-kinase amplification across adjacent, but not all, regions of one mass.' } },
  { id:'IM', name:'Infiltrative margin', color:cssVar('--amber'), pos3d:{x:-0.4,y:0.15,z:-0.25},
    branch:{ gene:'PDGFRA amplification', class:'driver', ccf:'part of 13.1% of GBM with a PDGFRA alteration overall — mutation and/or amplification combined (Brennan et al., Cell, 2013)', note:'A different growth-factor receptor gene, amplified in a spatially distinct subclone from the EGFR-amplified regions above — confirmed directly (Sottoriva et al., PNAS, 2013): in one real tumor, some physical fragments showed no PDGFRA alteration at all while others showed focal amplification, the same mass containing both.' } },
  { id:'ED', name:'Peritumoral edema', color:cssVar('--violet'), pos3d:{x:0.15,y:0.4,z:-0.3},
    branch:{ gene:'PDGFRA amplification', class:'driver', ccf:'part of 13.1% of GBM with a PDGFRA alteration overall — mutation and/or amplification combined (Brennan et al., Cell, 2013)', note:'The same PDGFRA-amplified subclone as the Infiltrative margin region — infiltrating tumor cells are known to extend well past the visible mass into surrounding edematous tissue, carrying whichever region\'s driver alteration they descended from.' } },
];
const TRUNK_GBM = [
  { gene:'IDH-wildtype status', class:'driver', ccf:'the founding classifier of this disease under the 2021 WHO reclassification (Louis et al., Neuro-Oncology, 2021)', note:'"Glioblastoma" now specifically means an IDH-*wildtype* diffuse astrocytic tumor — the 2021 WHO update "eliminates the term \'Glioblastoma, IDH-mutant\'" entirely. A grade-4 astrocytic tumor that instead carries an IDH1/IDH2 mutation is now a wholly different diagnosis, Astrocytoma IDH-mutant, with a substantially better prognosis — not a subtype of glioblastoma. One clinically crucial biomarker deliberately has no entry of its own anywhere in this ledger: MGMT promoter methylation status, the single strongest predictor of temozolomide chemotherapy response in this disease, is an epigenetic silencing mark, not a DNA mutation — this ledger tracks genetic alterations specifically, so MGMT status is described here in prose rather than forced into a driver/passenger slot that would misrepresent what kind of change it actually is.' },
  { gene:'TERT promoter mutation', class:'driver', ccf:'83% of adult glioblastoma (Killela et al., PNAS, 2013)', note:'Reactivates telomerase. One of three molecular criteria — alongside EGFR amplification and chromosome 7 gain/10 loss — that lets pathologists call an IDH-wildtype astrocytic tumor "glioblastoma" even without the classic necrosis or microvascular proliferation seen under the microscope. At 83% prevalence this is genuinely trunk-tier, not an occasional private finding.' },
];
const PRIVATE_POOL_GBM = [
  { gene:'PTEN loss', class:'driver', ccf:'~34% of GBM (computed from Brennan et al., Cell, 2013: PI3K-pathway mutations were mutually exclusive of PTEN alterations, with 59.4% of GBM showing one or the other and PI3K mutations alone at 25.1% — 59.4% − 25.1% = ~34.3% PTEN-specific)', note:'Removes a brake on the PI3K/AKT growth pathway downstream of receptor tyrosine kinase signaling — cooperates with either EGFR- or PDGFRA-amplified regions rather than competing with them, since it acts further downstream in the same signaling cascade both receptors feed into.' },
  { gene:'CDKN2A/B deletion', class:'driver', ccf:'57.8% of GBM (Brennan et al., Cell, 2013)', note:'Removes the p16/p14ARF brake on the cell cycle and p53 pathway — a distinct mechanism from the PI3K/AKT axis PTEN loss affects, so the two cooperate rather than substitute for one another. RB1 loss and CDK4/6 amplification reach a similar end effect on the same checkpoint through alternative, mutually exclusive routes — real GBM findings, but deliberately not included alongside this gene for that reason.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
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
// "multilayered, small caliber vessels with glomeruloid appearance." The "garlandlike
// arrangement of hypercellular tumor nuclei" phrasing is from Wippold et al., AJNR, 2006
// (PMID 17110662) — the pseudopalisade-specific source, checked because "dense rows of
// nuclei" was originally an unverified paraphrase. Two things about that citation, both
// found on re-read. The source spells it "garlandlike", unhyphenated, in all four of its
// uses; this quotation was hyphenated, and a quotation asserts exactness in a way the
// paraphrases below deliberately do not, so only the quoted span was corrected. And
// Wippold is a REVIEW ("the purpose of this report is to review"), not primary
// observation — cited here for descriptive phrasing it states in running text as well as
// a figure legend, so the generalization is the source's own and not ours.
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

// ASTROCYTOMA, IDH-MUTANT — every citation verified directly at the source (2026-09-14), via a
// dedicated research pass whose full record (including several explicitly-disclosed gaps) lives
// in .claude/brain_colon_research.md until this entity's content is finished and reviewed.
//
// TRUNK — a single founding classifier, the direct WHO CNS5 parallel to this organ's own GBM
// entry: IDH-mutant status (IDH1/IDH2 mutation) is the diagnostic requirement itself (Louis et
// al., Neuro-Oncology, 2021, PMID 34185076, already this organ's own GBM citation — "all
// IDH-mutant diffuse astrocytic tumors are considered a single type (Astrocytoma, IDH-mutant)").
// ATRX loss and TP53 mutation are real, well-documented "early lineage-defining alterations"
// alongside IDH1/2 in this lineage specifically (Reuss et al., Acta Neuropathologica, 2015, PMID
// 25427834: "All but 4 of 141 patients with loss of ATRX expression and diffuse glioma carried
// either IDH1 or IDH2 mutations," and ATRX loss is close to mutually exclusive with 1p/19q
// codeletion — the real molecular boundary separating this entity from oligodendroglioma) — but
// disclosed here WITHOUT a specific frequency number for either, because a dedicated research
// pass could not independently verify one for ATRX within this entity specifically, and the one
// TP53 figure found (StatPearls NBK559042's "about 66%") is explicitly scoped to "low-grade
// astrocytomas," not the full WHO CNS5 grade 2-4 entity — an honest gap, not silently papered
// over with an unverified number.
//
// GRADE-4 MOLECULAR CRITERION — real, independent of histologic necrosis/microvascular
// proliferation, and strongly verified via two independent full-text primary sources: "IDH-mutant
// astrocytomas with microvascular proliferation or necrosis or CDKN2A/B homozygous deletion, or
// any combination of these features, correspond to WHO grade 4" (Brat et al., "cIMPACT-NOW
// update 5," Acta Neuropathologica, 2020, PMID 31996992) — independently corroborated by Louis et
// al. 2021 itself ("the presence of CDKN2A/B homozygous deletion results in a CNS WHO grade of
// 4"). Modeled in the PRIVATE POOL below rather than trunk tier, despite being real and
// diagnostically important, because its own real prevalence (13.9% combined across a 1,200+-case
// cohort, Virata et al., Neuro-Oncology, 2026, PMID 41903203) sits far below this atlas's
// established trunk-tier prevalence bar (TP53 ~96%/VHL 86.6%/GBM's own TERT 83%) and it has no
// anatomical-region specificity the way this entity's own branch genes below do.
//
// BRANCH — PDGFRA amplification and PIK3CA/PIK3R1 mutation, both real, cohort-confirmed, and
// genuinely ASTROCYTOMA-SPECIFIC — checked directly rather than borrowed from this organ's own
// GBM entry (whose PDGFRA citation is a different mechanism, Snuderl et al. 2011's spatial
// receptor-amplicon heterogeneity in IDH-WILDTYPE tumors): cIMPACT-NOW Update 12 (Brat, Aldape,
// French, Louis, Nasrallah, Reifenberger, Reuss, Touat, van den Bent, Wesseling, Figarella-
// Branger, Neuro-oncology, 2026, PMID 42152226) states "PDGFRA amplification was associated with
// highly aggressive clinical behavior of IDH-mutant astrocytomas, consistent with CNS WHO grade
// 4," alongside PIK3CA/PIK3R1 mutation as a separately grade-3-associated finding. Virata et
// al. 2026 (same paper as the grade-4-criterion citation above) gives real cohort frequencies:
// PDGFRA alteration 6.5%, PIK3R1 mutation 4.4%, PIK3CA mutation 5.7% — real but, per this atlas's
// own "checked and NOT found" discipline, without independent evidence that either gene shows the
// same SPATIAL heterogeneity GBM's EGFR/PDGFRA split is sourced to (Snuderl/Sottoriva); modeled at
// two regions each, mirroring the split used for MYCN above in skin.js's own BCC entry, not
// asserted as a spatial-heterogeneity finding this entity's own literature doesn't independently
// support.
//
// SITE MODEL — the same real structural departure this organ's own GBM entry uses (intratumor
// regions of one mass, not real distant sites), on evidence that is qualitative but consistent:
// no systematic review or pooled series giving a citable extracranial-metastasis percentage was
// found despite a dedicated search (only individual case reports — Abu Jarir et al., Cureus,
// 2025, PMID 40034891; Ninomiya et al., Surgical Neurology International, 2025, PMID 40469347 —
// both describing this entity's own metastatic behavior as "rare"/"extremely rare"), and this
// entity is more indolent than GBM (lower grades exist within the same WHO type), so real
// extracranial spread should be at least as rare as GBM's own <1-2% figures, if not rarer.
const REGIONS_ASTRO = [
  { id:'AS', name:'Enhancing region', color:cssVar('--coral'), pos3d:{x:0.35,y:0.2,z:0.2},
    branch:{ gene:'PDGFRA amplification', class:'driver', ccf:'6.5% (Virata et al., Neuro-Oncology, 2026, PMID 41903203, combined cohort) — associated with highly aggressive clinical behavior, "consistent with CNS WHO grade 4" (cIMPACT-NOW Update 12, PMID 42152226)', note:'A growth-factor receptor gene, real and cohort-confirmed specifically in this entity — not borrowed from this organ\'s own GBM entry, whose own PDGFRA citation describes a different, IDH-wildtype-specific mechanism (Snuderl et al., 2011).' } },
  { id:'AC', name:'Necrotic region', color:cssVar('--azure'), pos3d:{x:-0.1,y:-0.3,z:0.3},
    branch:{ gene:'PDGFRA amplification', class:'driver', ccf:'6.5% — same cohort-confirmed frequency as the Enhancing region', note:'The same real, grade-4-associated alteration as the Enhancing region, shown at a second region, mirroring the same split used for this gene at that region above.' } },
  { id:'AP', name:'Infiltrative margin', color:cssVar('--amber'), pos3d:{x:-0.4,y:0.15,z:-0.25},
    branch:{ gene:'PIK3CA/PIK3R1 mutation', class:'driver', ccf:'5.7% PIK3CA / 4.4% PIK3R1 (Virata et al., 2026) — grade-3-associated (cIMPACT-NOW Update 12)', note:'Real, cohort-confirmed PI3K-pathway mutations in this entity specifically, at a different region than the PDGFRA-amplified regions above, not as an asserted spatial-heterogeneity finding this entity\'s own literature doesn\'t independently confirm.' } },
  { id:'AB', name:'Peritumoral region', color:cssVar('--violet'), pos3d:{x:0.15,y:0.4,z:-0.3},
    branch:{ gene:'PIK3CA/PIK3R1 mutation', class:'driver', ccf:'5.7% PIK3CA / 4.4% PIK3R1 — same cohort-confirmed frequency as the Infiltrative margin region', note:'The same real PI3K-pathway alterations as the Infiltrative margin region, shown at a second region, mirroring the same split used for this gene at that region above.' } },
];
const TRUNK_ASTRO = [
  { gene:'IDH-mutant status (IDH1/IDH2 mutation)', class:'driver', ccf:'the defining WHO CNS5 classifier for this entity (Louis et al., Neuro-Oncology, 2021, PMID 34185076)', note:'The direct counterpart to this organ\'s own GBM entry\'s IDH-wildtype trunk classifier — the 2021 WHO reclassification made IDH mutation status itself the founding diagnostic split for adult-type diffuse gliomas, not a subtype distinction within one disease. Real, well-documented co-occurring "early lineage-defining alterations" in this same lineage — ATRX loss and TP53 mutation — are not given their own ledger entries: a dedicated research pass could not independently verify a specific frequency for ATRX within this entity, and the one TP53 figure found (StatPearls, "Astrocytoma," NBK559042, "about 66%") is explicitly scoped to low-grade astrocytomas only, not the full WHO CNS5 grade 2-4 entity this ledger models — disclosed as a real, honest gap rather than filled with an unverified number.' },
];
const PRIVATE_POOL_ASTRO = [
  { gene:'CDKN2A/B homozygous deletion', class:'driver', ccf:'13.9% combined across a 1,200+-case cohort (Virata et al., Neuro-Oncology, 2026, PMID 41903203); real cross-cohort range by grade — 0-12% (grade II), 6-20% (grade III), 16-34% (grade IV) — Brat et al., "cIMPACT-NOW update 5," Acta Neuropathologica, 2020, PMID 31996992', note:'A real, independent, and diagnostically important event: its presence alone is sufficient to call an IDH-mutant astrocytoma WHO grade 4, regardless of whether the classic histologic criteria (necrosis, microvascular proliferation) are present — independently confirmed in the WHO CNS5 summary itself (Louis et al., 2021). Modeled here in the private pool rather than trunk tier: real but far below this atlas\'s trunk-tier prevalence bar, and it has no region-specific anatomical association the way this entity\'s own branch genes above do.' },
  { gene:'TTN passenger mutation', class:'passenger', note:'Background noise from one of the genome\'s largest genes — the standard passenger-tier finding this organ\'s own GBM entry already carries.' },
];

// HISTOLOGY — real, WHO/StatPearls-sourced, grade-stratified architecture (Tork, Hall & Atkinson,
// StatPearls, "Astrocytoma," NBK559042, updated 2025-04-03 — verified directly, full text).
// Grade 3 depicted (nuclear atypia + focal anaplasia + mitoses, no necrosis/MVP) as the
// representative middle ground of this entity's real WHO CNS5 grade 2-4 span — grade 2 shows
// atypia alone (too featureless to depict distinctly) and grade 4 reuses this organ's own GBM
// necrosis/microvascular-proliferation architecture (real, shared histologic criteria per
// StatPearls' own grade-4 definition), disclosed in prose rather than duplicated as a second
// slide. Reuses genGBM's own necrosisBlob-family primitives for the grade-4 note's own
// description rather than drawing a duplicate slide.
const HISTOLOGY_ASTRO = {
  intro: 'Astrocytoma, IDH-mutant spans WHO CNS5 grades 2 through 4 within one molecularly-defined diagnosis, and its microscopic picture changes with grade. The representative field shown here is grade 3: increased cellularity with real nuclear atypia and focal-to-dispersed anaplasia, and prominent mitotic activity — but, unlike grade 4, no necrosis and no microvascular proliferation. Grade 2 shows nuclear atypia alone, with essentially no mitotic activity. Grade 4 can be reached either by adding necrosis or microvascular proliferation to the same picture (the same two histologic criteria this organ\'s own glioblastoma entry uses) — or, distinctively for this entity, on molecular grounds alone: CDKN2A/B homozygous deletion is sufficient to call WHO grade 4 even when the slide shows neither.',
  ariaSummary: 'Stylized microscopic field: a moderately hypercellular background of astrocytic tumor cells with visibly irregular, atypical nuclei of varying size — some markedly enlarged and hyperchromatic. Scattered mitotic figures are visible among the atypical cells. No necrosis and no abnormal vessel clusters are present in this field.',
  citation: 'Tork, Hall & Atkinson, StatPearls, "Astrocytoma" (NBK559042); Brat et al., Acta Neuropathologica, 2020, PMID 31996992; Louis et al., Neuro-Oncology, 2021, PMID 34185076.',
  features: [
    { key:'atypia', label:'Nuclear atypia',
      text:'Enlarged, irregular, hyperchromatic tumor-cell nuclei of varying size — present at every WHO grade of this entity, from mild (grade 2) to pronounced (grade 3-4).' },
    { key:'anaplasia', label:'Focal anaplasia',
      text:'Regions of more disorganized, dispersed atypical cells — a real WHO CNS5 grade 3 criterion, distinguishing this grade from grade 2\'s atypia-alone picture.' },
    { key:'mitoses', label:'Mitotic figures',
      text:'"Prominent proliferation activity and mitoses" (StatPearls) — a real, quantified step up from grade 2\'s essentially absent mitotic activity, without yet reaching grade 4\'s added necrosis or microvascular proliferation.' },
  ],
};

// OLIGODENDROGLIOMA, IDH-MUTANT AND 1p/19q-CODELETED — every citation verified directly at the
// source (2026-09-14). Full research record in .claude/brain_colon_research.md.
//
// TRUNK — a genuinely TWO-PART founding event, not a single gene: WHO CNS5 requires BOTH an
// IDH1/IDH2 mutation AND whole-arm 1p/19q co-deletion (Louis et al., 2021, PMID 34185076 — this
// type's own diagnostic-gene table lists "IDH1, IDH2, 1p/19q, TERT promoter, CIC, FUBP1, NOTCH1,"
// versus astrocytoma's "IDH1, IDH2, ATRX, TP53, CDKN2A/B" — the clean molecular dichotomy
// confirmed directly at the source). Real cohort concordance, not just the WHO definition's own
// tautology: TCGA's own lower-grade-glioma cohort found 82% of patients with the full molecular
// profile were histologically called oligodendroglioma (Cancer Genome Atlas Research Network,
// NEJM, 2015, PMID 26061751).
//
// TERT PROMOTER — a second, real trunk-tier entry, and THE SAME GENE this organ's own GBM entry
// already carries as trunk-tier, reaching that status through a genuinely different molecular
// route — the "role reversal" this atlas records explicitly rather than treating as a coincidence:
// "Curiously, mutation in the TERT promoter... is seen in both the most aggressive human glioma
// (grade IV astrocytoma) and the least aggressive diffuse human glioma (grade II
// oligodendroglioma)" (Eckel-Passow et al., NEJM, 2015, PMID 26061753 — the companion paper to the
// TCGA lower-grade-glioma paper above, published in the same NEJM issue). TCGA's own cohort found
// 96% of the IDH-mutant+1p/19q-codeleted molecular class carries TERT promoter mutation (versus
// only 4% of IDH-mutant, non-codeleted [astrocytoma] tumors, and 64-80% of IDH-wildtype [GBM-like]
// tumors) — "ATRX mutations were rare in these tumors, a finding consistent with the mutual
// exclusivity of ATRX and TERT mutations," the real molecular contrast with astrocytoma's own
// ATRX-associated lineage. A real, historical, pre-molecular-era cohort gives a lower figure, 78%
// (Killela et al., PNAS, 2013, PMID 23530248 — already this organ's own GBM citation) — both
// figures kept, tracking the same method-sensitivity/cohort-composition variability this atlas
// already discloses for several other trunk genes.
//
// BRANCH — CIC mutation and FUBP1 mutation, both real, both specific to this molecular class (TCGA
// 2015: "we found CIC mutations in 62% and FUBP1 mutations in 29%... but we did not find these
// mutations in the other molecular subtypes" — independently corroborated for CIC by Yip et al.,
// J Pathol, 2012, PMID 22072542, 69%, and Darabi et al., Med Oncol, 2023, PMID 37291277, 52.1%).
// FUBP1's own frequency is genuinely more variable across cohorts (15-29%) — Yip et al.'s own
// 16-tumor cohort found ZERO non-synonymous coding FUBP1 mutations and states this was
// "unexpected," disclosed here rather than smoothed into one confident number. THE RELATIONSHIP
// BETWEEN CIC AND FUBP1 IS EXPLICITLY UNRESOLVED IN THE PRIMARY LITERATURE, not modeled as either
// cooperating or competing: Yip et al. 2012 raise the question directly and leave it open ("The
// possible relationship between FUBP1 and CIC, however, remains to be elucidated"), hypothesizing
// only that they "may be functionally equivalent" alternative routes — split two regions each
// below, the same architecture used for PDGFRA and PIK3CA/PIK3R1 above in this entity's own
// Astrocytoma sibling, without itself asserting either relationship.
//
// SITE MODEL — the same real structural departure as this organ's own GBM and astrocytoma
// entries, on stronger evidence than either: "Distant spread of oligodendroglioma is exceptional...
// A review of the worldwide literature yielded 32 previously reported examples since 1951"
// (Zustovich et al., Acta Neurochir, 2008, PMID 18548193); a 2026 review explicitly billed as "the
// largest collection of oligodendroglioma extraneural metastasis cases to date" still found only
// 90 cases pooled from the entire world literature (Daher et al., Cancer Sci, 2026, PMID
// 41310947). Two sources, 18 years apart, in near-identical language to this organ's own GBM
// citations.
const REGIONS_ODG = [
  { id:'OD', name:'Enhancing region', color:cssVar('--coral'), pos3d:{x:0.35,y:0.22,z:0.18},
    branch:{ gene:'CIC mutation', class:'driver', ccf:'62% of the IDH-mutant+1p/19q-codeleted molecular class (TCGA/Cancer Genome Atlas Research Network, NEJM, 2015, PMID 26061751) — independently corroborated at 69% (Yip et al., J Pathol, 2012, PMID 22072542) and 52.1% (Darabi et al., Med Oncol, 2023, PMID 37291277)', note:'"CIC mutations are common in oligodendrogliomas but rare in other cancers" (Yip et al., 2012, verbatim) — real, specific, and this entity\'s own single most common branch-tier event.' } },
  { id:'OC', name:'Calcified region', color:cssVar('--azure'), pos3d:{x:-0.12,y:-0.28,z:0.28},
    branch:{ gene:'CIC mutation', class:'driver', ccf:'62% — same molecular-class-confirmed frequency as the Enhancing region', note:'The same real, specific mutation as the Enhancing region, shown at a second region, mirroring the same split used for this gene at that region above.' } },
  { id:'OF', name:'Infiltrative margin', color:cssVar('--amber'), pos3d:{x:-0.38,y:0.14,z:-0.22},
    branch:{ gene:'FUBP1 mutation', class:'driver', ccf:'15-29% depending on cohort (Bettegowda et al., Science, 2011, PMID 21817013: ~15%; TCGA 2015: 29%) — genuinely variable: Yip et al. (2012) found zero coding FUBP1 mutations in their own 16-tumor cohort, calling this "unexpected"', note:'Real, but the relationship between this gene and CIC (above) is explicitly UNRESOLVED in the primary literature — Yip et al. state directly that it "remains to be elucidated," hypothesizing the two may be alternative, "functionally equivalent" routes rather than confirming cooperation or exclusivity. Modeled at a different region than CIC above, without asserting either relationship.' } },
  { id:'OG', name:'Peritumoral region', color:cssVar('--violet'), pos3d:{x:0.14,y:0.38,z:-0.28},
    branch:{ gene:'FUBP1 mutation', class:'driver', ccf:'15-29% — same cohort-dependent range as the Infiltrative margin region', note:'The same real, cohort-variable mutation as the Infiltrative margin region, shown at a second region, mirroring the same split used for this gene at that region above.' } },
];
const TRUNK_ODG = [
  { gene:'IDH-mutant + 1p/19q-codeleted status', class:'driver', ccf:'the two-part defining WHO CNS5 classifier for this entity (Louis et al., Neuro-Oncology, 2021, PMID 34185076); real cohort concordance 82% (69/84 patients with the full molecular profile were histologically called oligodendroglioma, TCGA/Cancer Genome Atlas Research Network, NEJM, 2015, PMID 26061751)', note:'Genuinely two founding events, not one — an IDH1/IDH2 mutation AND a whole-arm 1p/19q co-deletion, together. The real molecular contrast with this organ\'s own Astrocytoma, IDH-mutant entry: that entity\'s own ATRX-loss/TP53-mutant lineage and this entity\'s own 1p/19q-codeleted lineage are close to mutually exclusive (TCGA 2015: "ATRX mutations were rare in these tumors, a finding consistent with the mutual exclusivity of ATRX and TERT mutations").' },
  { gene:'TERT promoter mutation', class:'driver', ccf:'96% of the IDH-mutant+1p/19q-codeleted molecular class (TCGA 2015); 78% in a real, historical, pre-molecular-era cohort of 45 histologically-diagnosed oligodendrogliomas (Killela et al., PNAS, 2013, PMID 23530248 — already this organ\'s own GBM citation)', note:'Reactivates telomerase — the SAME gene this organ\'s own GBM entry carries as trunk-tier, reached through a genuinely different molecular route, a contrast this atlas records explicitly rather than treats as coincidence: "mutation in the TERT promoter... is seen in both the most aggressive human glioma (grade IV astrocytoma) and the least aggressive diffuse human glioma (grade II oligodendroglioma)" (Eckel-Passow et al., NEJM, 2015, PMID 26061753, verbatim).' },
];
const PRIVATE_POOL_ODG = [
  { gene:'TTN passenger mutation', class:'passenger', note:'Background noise from one of the genome\'s largest genes — standard passenger-tier finding. No additional real, independently-confirmed private-pool driver gene beyond this organ\'s own branch genes above was found in what this pass verified; WHO CNS5\'s own diagnostic-gene table for this entity also names NOTCH1, but no frequency figure for it specific to this entity was independently verified in this pass\'s own research, so it is named here rather than modeled with an invented number.' },
];

// HISTOLOGY — real, WHO/StatPearls-sourced architecture, confirmed still emphasized even after
// the 2021 molecular reclassification, not superseded by it (Tork, Hall & Atkinson, StatPearls,
// "Oligodendroglioma," NBK559184, updated 2025-04-03 — full text verified directly): "Definitive
// diagnosis relies on histopathological findings, including 'fried egg' cells, a 'chicken wire'
// vascular pattern, and molecular testing for isocitrate dehydrogenase mutations and 1p/19q
// codeletion" — histology and molecular testing run alongside each other, neither replacing the
// other. Genuinely new drawing code: no existing primitive in this file draws a uniform sheet of
// round cells with a clear perinuclear halo (the "fried egg" artifact) or a network of thin
// capillaries threading between them (the "chicken wire" pattern) — reuses drawPsammomaBody
// verbatim for the real, commonly-identified calcifications this entity also shows.
const HISTOLOGY_ODG = {
  intro: 'Oligodendroglioma\'s classic microscopic picture is sheets of uniform, small-to-medium round cells with spherical nuclei surrounded by a clear perinuclear halo — the "fried egg" appearance, which is explicitly an artifact of routine formalin-and-paraffin tissue processing, not a feature of the living cell. A network of thin-walled capillaries threading between the tumor cells forms the "chicken wire" vascular pattern, another classic and still-cited diagnostic descriptor. Scattered calcifications and psammoma bodies are commonly identified. WHO CNS5 diagnosis relies on this histology together with, not superseded by, molecular testing for IDH mutation and 1p/19q codeletion.',
  ariaSummary: 'Stylized microscopic field: a dense sheet of small, round, uniform cells, each with a round nucleus surrounded by a distinct clear halo, giving a honeycomb-like "fried egg" texture across the whole field. A branching network of thin lines threads between the cells — the chicken-wire vascular pattern. Two small clusters of concentric purple-gray rings mark calcified psammoma bodies.',
  citation: 'Tork, Hall & Atkinson, StatPearls, "Oligodendroglioma" (NBK559184); Louis et al., Neuro-Oncology, 2021, PMID 34185076.',
  features: [
    { key:'friedegg', label:'"Fried egg" cells',
      text:'Round tumor-cell nuclei surrounded by a clear perinuclear halo — a formalin-fixation artifact, not a feature of the living tumor, but this entity\'s single most recognizable and still-diagnostically-cited histologic descriptor.' },
    { key:'chickenwire', label:'"Chicken wire" vasculature',
      text:'A network of thin-walled capillaries branching between the tumor cells — a real, classic architectural feature named directly alongside the fried-egg cells in current pathology teaching.' },
    { key:'calcification', label:'Calcification',
      text:'Scattered calcifications and psammoma bodies, commonly identified in this tumor\'s real gross and microscopic appearance — corroborated directly by a statistically significant enrichment versus astrocytoma and glioblastoma (Jo et al., Neurooncol Pract, 2025, PMID 41458936, P<.001).' },
  ],
};

// MENINGIOMA — every citation verified directly at the source (2026-09-14), including the
// meningioma site-gene citation criterion this atlas ruled in specifically for this entity
// (data rule 2's amendment): a site-gene pairing is CITED, not illustrative, when a source states
// the anatomical association directly and it is independently corroborated. Full research record
// in .claude/brain_colon_research.md.
//
// TRUNK — a two-entry STATUS trunk, the same architecture this atlas already uses for FTC's
// RAS-vs-PAX8 divergence and bladder's pathway-divergence status (data rules 24/27): NF2
// mutation/loss and TRAF7 mutation are two real, whole-tumor, mutually exclusive founding routes
// (Clark et al., Science, 2013, PMID 23348505, PMCID PMC4808587, verbatim: TRAF7 mutations are
// "always exclusive of NF2 mutations") — not intratumor regional heterogeneity the way this
// organ's own GBM entry models EGFR/PDGFRA, so trunk tier (not branch, despite the site
// association) is the correct fit: each route is present from the founding cell, and the
// anatomical-location association is a real, cited fact ABOUT each founding route, not an
// illustrative site assignment. THE CITED SITE ASSOCIATION, independently corroborated three
// ways: Clark et al. 2013 (n=300 meningiomas) — NF2/chr22-loss tumors "predominantly found in the
// hemispheres (P=9.22×10⁻¹⁴, OR=6.74)," non-NF2 tumors "vast majority... medial [skull base]
// (P=4.36×10⁻⁸, medial versus lateral OR=8.80)"; Brastianos et al., Nat Genet, 2013, PMID
// 23334667, PMCID PMC3739288 (independent corroboration for the skull-base/SMO-AKT1 association
// specifically, descriptive — no p-value reported for this specific association, so cited as
// corroborating rather than an equally-powered replication); Naros et al., Brain Commun, 2026,
// PMID 41768792, PMCID PMC12947794 (independent corroboration via voxel-based spatial-concordance
// mapping between histological-subtype location and gene-alteration location, a related but
// different method than Clark's direct statistical test). NF2 mutation overall: 36% (108/300,
// Clark et al. 2013) — do not confuse with the ~1% of meningiomas linked to germline NF2 syndrome
// (StatPearls), a completely different quantity (hereditary disease prevalence, not somatic
// mutation rate). TRAF7 mutation: 24% (72/300, same source).
//
// SITE MODEL — deliberately the ORDINARY real-distant-sites family, not this organ's own GBM-
// style structural departure: unlike astrocytoma/oligodendroglioma, meningioma has real, named,
// primary-sourced metastatic sites, even though the overall rate is low and grade-dependent
// (Dalle Ore et al., J Neurosurg, 2020, PMID 30952122: of 1,193 patients, overall metastasis
// incidence 0.67% [8 cases], rising to 2% at WHO grade II and 8.6% at grade III — genuinely
// non-uniform, unlike GBM's flat <1-2%). The 8 confirmed cases in that same paper: liver 5, lung
// 3, mediastinum 1, bone 1 — a real, disclosed arithmetic tension in the SOURCE's own numbers
// (5+3+1+1=10, not 8), confirmed by an independent citation-verification pass as a genuine,
// repeated feature of the primary literature (the identical 5/3/1/1/n=8 figures also appear in an
// earlier conference abstract by the same authors), most plausibly because some patients had
// metastases at more than one site — not a transcription error on this atlas's part, and not
// presented here as a clean one-site-per-patient partition. LIVER, not lung, is this paper's own
// most common site regardless, disclosed here despite at least one secondary review
// (Perez-Gutierrez et al., Cureus, 2025, PMID 41552249) claiming lung is more frequent — a real
// primary-
// vs-secondary discrepancy, resolved by
// using the primary cohort's own numbers rather than the review's restatement.
const REGIONS_MENIN = [
  { id:'ME', name:'Liver', color:cssVar('--coral'), pos3d:{x:1.9,y:-0.6,z:0.5},
    branch:{ gene:'AKT1 activating mutation (E17K)', class:'driver', ccf:'7.7% (5/65, discovery cohort, Brastianos et al., Nat Genet, 2013, PMID 23334667) — a further 3 AKT1(E17K) mutations were found in an explicitly non-overlapping 95-tumor validation cohort, so the two counts do not share one denominator; the combined rate across both cohorts is 5.0% (8/160)', note:'Real and cohort-confirmed, independent of NF2 status (Brastianos et al.: "None of these had mutations of NF2 or SMO (p=0.03)" for the AKT1-mutant tumors specifically). Liver is this entity\'s own real, most common confirmed distant site (5 of 8 documented cases, Dalle Ore et al., 2020) — site assignment here is illustrative, distinct from this entity\'s own cited hemispheric/skull-base ORIGIN association above, which describes where the primary tumor arises, not where it spreads.' } },
  { id:'MG', name:'Lung', color:cssVar('--azure'), pos3d:{x:-2.0,y:0.7,z:-0.1},
    branch:{ gene:'AKT1 activating mutation (E17K)', class:'driver', ccf:'7.7% (5/65) — same discovery-cohort frequency as the Liver site', note:'The same real alteration as the Liver site, shown at a second site, mirroring the same split used for this gene at that site above. Lung is this entity\'s own second most common confirmed distant site (3 of 8 documented cases, Dalle Ore et al., 2020).' } },
  { id:'MW', name:'Mediastinal lymph nodes', color:cssVar('--amber'), pos3d:{x:0.5,y:1.9,z:-0.4},
    branch:{ gene:'TERT promoter mutation', class:'driver', ccf:'6.4% overall (16/252, Sahm et al., JNCI, 2016, PMID 26668184), rising by grade — 1.7%/5.7%/20.0% for grade I/II/III', note:'A real, worse-prognosis marker genuinely independent of NF2 status — median time to progression 10.1 months (TERT-mutant) versus 179.0 months (wild-type), P<.001 (Sahm et al., 2016). Mediastinal lymph node involvement is one of this entity\'s own real, if rare, confirmed distant-spread sites (1 of 8 documented cases, Dalle Ore et al., 2020).' } },
  { id:'MK', name:'Bone', color:cssVar('--violet'), pos3d:{x:-0.5,y:-1.9,z:0.6},
    branch:{ gene:'TERT promoter mutation', class:'driver', ccf:'6.4% — same cohort-confirmed frequency as the Mediastinal lymph nodes site', note:'The same real, NF2-status-independent marker as the Mediastinal lymph nodes site, shown at a second site, mirroring the same split used for this gene at that site above. Bone is one of this entity\'s own real, if rare, confirmed distant-spread sites (1 of 8 documented cases, Dalle Ore et al., 2020).' } },
];
const TRUNK_MENIN = [
  { gene:'NF2 mutation or loss', class:'driver', ccf:'36% of meningiomas overall (108/300, Clark et al., Science, 2013, PMID 23348505, PMCID PMC4808587) — a completely different quantity from the ~1% of meningiomas linked to germline NF2 syndrome (StatPearls, "Meningioma," NBK560538), which is hereditary-disease prevalence, not this somatic mutation rate', note:'NF2 encodes merlin, a membrane-cytoskeleton scaffolding tumor suppressor that normally restrains Hippo-YAP/TAZ signaling (plus mTOR and RAS/MAPK) — its loss de-represses these growth pathways. NF2-mutant tumors predominate in the cerebral/cerebellar hemispheres, a real, directly-tested anatomical association: P=9.22×10⁻¹⁴, OR=6.74 (Clark et al., 2013) — independently corroborated by voxel-based spatial mapping (Naros et al., Brain Commun, 2026, PMID 41768792). This is a whole-tumor founding route, not intratumor regional heterogeneity — the same reason this entity\'s trunk is two entries rather than a branch-gene split by region.' },
  { gene:'TRAF7 mutation', class:'driver', ccf:'24% of meningiomas overall (72/300, Clark et al., 2013) — "always exclusive of NF2 mutations" (Clark et al., 2013, verbatim)', note:'The real, alternative founding route to NF2 mutation/loss. TRAF7-mutant (and the related KLF4- and AKT1-mutant) tumors predominate at the medial skull base, a real, directly-tested anatomical association: P=4.36×10⁻⁸, medial-versus-lateral OR=8.80 (Clark et al., 2013) — independently corroborated by Brastianos et al. (Nat Genet, 2013, PMID 23334667, descriptive corroboration for the skull-base/SMO-AKT1 association specifically) and by voxel-based spatial mapping (Naros et al., 2026, which independently reports "KLF4/TRAF7 with secretory" histologic-subtype association). AKT1 and KLF4 mutation are real, closely related, skull-base-associated findings not given their own trunk entry here — see this entity\'s own branch-gene notes for AKT1\'s real, independent frequency.' },
];
const PRIVATE_POOL_MENIN = [
  { gene:'SMARCE1 loss-of-function', class:'driver', ccf:'90% (9/10) in a dedicated clear-cell-meningioma cohort (Hou et al., Chinese Journal of Pathology, 2026, PMID 41490640)', note:'Real and defining for the clear-cell meningioma subtype specifically (Smith et al., Nat Genet, 2013, PMID 23377182, the discovery paper) — WHO CNS5 independently confirms this subtype association.' },
  { gene:'PIK3CA/PIK3R1 mutation', class:'driver', ccf:'15.4% combined (19/123: 14 PIK3CA + 5 PIK3R1) in a dedicated skull-base meningioma cohort (Alkhatib et al., J Neurosurg, 2025, PMID 40911921)', note:'Real, from a cohort of olfactory-groove/skull-base meningiomas that is almost entirely NF2-wildtype overall (not a trait distinguishing this gene pair from the same cohort\'s other subgroups) — a real, mechanistically coherent fit on the non-NF2/skull-base side of this entity\'s own trunk-level status split. That same source does NOT report a favorable prognosis for this specific gene pair (its own explicit survival comparisons favor SMO-mutant tumors instead); PIK3CA/PIK3R1-mutant tumors in that cohort were larger and had one of the higher rates of sinus invasion among subgroups, so no prognosis claim is made here.' },
  { gene:'TTN passenger mutation', class:'passenger', note:'Background noise from one of the genome\'s largest genes — standard passenger-tier finding. BAP1 loss/mutation is a real, well-documented, and clinically aggressive meningioma finding (Shankar et al., Neuro-Oncology, 2017, PMID 28170043: BAP1-negative rhabdoid meningioma recurs at a median 26 months versus 116 months for BAP1-retained, P<.001) DELIBERATELY EXCLUDED from this pool: BAP1-altered meningioma forms its own separate, WHO-grade-3-recommended diagnostic category, essentially molecularly exclusive of every other gene modeled in this entry — "No additional relevant alterations, particularly TRAF7, KLF4, SMARCE1, AKT1, SMO, SUFU, PTCH1, YAP1, or POLR2A variants, were observed" in BAP1-altered tumors (Sievers et al., Neuro-Oncology, 2025, PMID 40249111) — the same class of exclusion this organ\'s own GBM entry already applies to ATRX loss: a gene belonging to the other diagnostic entity this cancer\'s own trunk note explicitly distinguishes itself from, not a random passenger a random cell could plausibly carry alongside an NF2- or TRAF7-founded tumor.' },
];

// HISTOLOGY — real WHO/StatPearls-sourced architecture (StatPearls, "Meningioma," NBK560538,
// updated 2026-06-19, verbatim): "growth of meningothelial cells that eventually mineralize,
// forming psammoma bodies." SCOPE CORRECTION, caught by an independent citation-verification
// pass: that same source's only sentence combining the words "whorls and syncytia" is scoped
// specifically to meningioma en plaque (a bone-invasive dural growth pattern, discussed under
// hyperostosis), not to this tumor's general architecture — disclosed rather than presented as a
// general-architecture quote it isn't. Whorled, syncytial growth is nonetheless this tumor's own
// well-established general defining feature in pathology teaching broadly (the drawn slide
// depicts the general case, not the en-plaque-specific one, and no en-plaque-specific claim is
// made anywhere in this entry) — independently corroborated for the psammoma-body half
// specifically: "Psammoma bodies, which are characterized by concentric lamellated calcifications,
// are among the most recognizable histological features" (Fatima, Neuropathology, 2026, PMID
// 42634009).
// Reuses drawPsammomaBody verbatim (the same real, concentric-ring calcification primitive this
// atlas already uses for PTC's own psammoma bodies) for the calcified centers, with a genuinely
// new whorl primitive (drawWhorl) for the concentric meningothelial cell layers themselves — no
// existing primitive in this file draws a SOLID (no central lumen) concentric ring of cells the
// way a gland's open-lumen drawGlandRing does.
const HISTOLOGY_MENIN = {
  intro: 'Meningioma\'s classic microscopic signature is whorls — concentric, onion-skin-like layers of meningothelial cells wound tightly around a central point — and syncytia, sheets of cells with indistinct cell borders that appear to merge into one continuous mass. Within many whorls, the meningothelial cells eventually mineralize, forming psammoma bodies: concentric, lamellated calcifications that are among this tumor\'s single most recognizable histologic features. This is a fundamentally different growth architecture from every glioma modeled in this organ — meningioma is not a diffusely infiltrative tumor of brain tissue itself, but a real, usually well-circumscribed mass arising from the meninges covering it.',
  ariaSummary: 'Stylized microscopic field: several tight, concentric, onion-skin-like whorls of spindle-shaped cells, each winding around a central point. Some whorls have a small cluster of concentric purple-gray rings at their center — calcified psammoma bodies. Between the whorls, sheets of cells with indistinct borders blend into one continuous mass — the syncytial background.',
  citation: 'StatPearls, "Meningioma" (NBK560538); Fatima, Neuropathology, 2026, PMID 42634009.',
  features: [
    { key:'whorls', label:'Meningothelial whorls',
      text:'Concentric, onion-skin-like layers of meningothelial cells wound tightly around a central point — this tumor\'s single most classic architectural feature.' },
    { key:'psammoma', label:'Psammoma bodies',
      text:'Concentric, lamellated calcifications forming within whorls as meningothelial cells mineralize — "among the most recognizable histological features" of this tumor (Fatima, 2026).' },
    { key:'syncytia', label:'Syncytial sheets',
      text:'Sheets of meningothelial cells with indistinct cell borders, appearing to blend into one continuous mass between the more organized whorls.' },
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
  astro: {
    title:'Astrocytoma, IDH-mutant', screenLabel:'Astrocytoma, IDH-mutant — intratumor region explorer',
    legendTitle:'Regions within one tumor (real distant metastasis is exceptionally rare)',
    regionWord:'region',
    regions:REGIONS_ASTRO, trunk:TRUNK_ASTRO, privatePool:PRIVATE_POOL_ASTRO,
    histology: HISTOLOGY_ASTRO,
  },
  odg: {
    title:'Oligodendroglioma', screenLabel:'Oligodendroglioma — intratumor region explorer',
    legendTitle:'Regions within one tumor (real distant metastasis is exceptionally rare — only ~90 cases ever reported worldwide)',
    regionWord:'region',
    regions:REGIONS_ODG, trunk:TRUNK_ODG, privatePool:PRIVATE_POOL_ODG,
    histology: HISTOLOGY_ODG,
  },
  menin: {
    title:'Meningioma', screenLabel:'Meningioma — tumor explorer',
    legendTitle:'Sites (real, rare, grade-dependent metastasis — see this entry\'s own trunk note for its cited origin-location/gene association)',
    regions:REGIONS_MENIN, trunk:TRUNK_MENIN, privatePool:PRIVATE_POOL_MENIN,
    histology: HISTOLOGY_MENIN,
  },
};
