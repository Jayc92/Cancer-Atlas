import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

// active:true. Alias collision check (same convention as every prior organ): no other organ's
// aliases or share text uses "pancreas", "pancreatic", or "pdac" anywhere — and the bare word
// "adenocarcinoma" is deliberately NOT an alias here, same reasoning as Prostate's entry: that
// string is already claimed by Lungs, and search matching is alias.includes(query), so the
// qualified "pancreatic adenocarcinoma"/"pancreatic ductal adenocarcinoma" aliases below can
// never be matched by a query that the Lungs alias doesn't also match character-for-character.
export const organEntry = { key:'pancreas', label:'Pancreas', system:'Digestive', active:true, sexes:['female','male'], aliases:['pancreas','pancreatic','pdac','pancreatic adenocarcinoma','pancreatic ductal adenocarcinoma'] };

// Epigastrium, midline — the gland crosses the L1/L2 vertebral bodies ("The pancreas lies
// transversely in the upper abdomen", StatPearls NBK532912), so angle 0 (straight ahead) is
// anatomically right. heightFrac 0.58 sits between Prostate's 0.46 and Lungs' 0.66 on the
// same angle-0 column — spacing to both was checked when this spec was chosen, then verified
// by screenshot on both sexes like every marker before it.
export const markerSpec = { points:[{heightFrac:0.58, angle:0}] };

export const cancerEntries = [
  // NCI PDQ's cellular-classification list (verbatim: "Malignant Duct cell carcinoma (90% of
  // all cases)") is a list of EXOCRINE pancreatic cancers, so the 90% denominator excludes
  // neuroendocrine tumors — stated in pnet's own share text below rather than silently mixed.
  // StatPearls ("Pancreatic Cancer", NBK518996) concurs: "More than 90% of adenocarcinomas of
  // the pancreas are duct cell adenocarcinomas, with other types being cystadenocarcinoma and
  // acinar cell carcinoma."
  { id:'pdac',  name:'Pancreatic ductal adenocarcinoma', share:'~90% of exocrine pancreatic cancers (NCI PDQ: "duct cell carcinoma (90% of all cases)")', active:true,  organKey:'pancreas' },
  { id:'pacc',  name:'Acinar cell carcinoma',            share:'rare — named by StatPearls among the non-ductal minority; no individual share figure claimed here', active:false, organKey:'pancreas' },
  { id:'pcyst', name:'Cystadenocarcinoma',               share:'rare — named by StatPearls among the non-ductal minority; no individual share figure claimed here', active:false, organKey:'pancreas' },
  { id:'pnet',  name:'Pancreatic neuroendocrine tumor',  share:'a separate endocrine category, excluded from the exocrine 90% denominator above — same treatment as SCLC vs NSCLC on the Lungs list', active:false, organKey:'pancreas' },
];

// Real anatomy, not procedural: NIH 3D, "Human Reference Atlas 3D Reference Object Library"
// (account "HRA"), entry 3DPX-020983 (Pancreas, Female) — CC BY 4.0, verified directly on the
// entry page. Female variant per the collection convention every shared organ before this one
// uses (lungs/kidneys/liver/brain/breast are all female-range entries), and here convention
// and provenance agree: both sex variants are genuinely Visible Human Dataset-derived.
// UNLIKE the five prior HRA organs, this file is the ORIGINAL HRA-authored GLB served by
// api/files/ (not the STL run through the Blender weld/smooth pipeline) — byte-identical to
// the upstream file (sha256 edb41456…, 12,894 triangles, above Prostate's accepted 15,895-ish
// floor for total scene detail given its five separate sub-meshes), which preserves the five
// NAMED sub-meshes the STL route flattens: head, neck, body, tail, uncinate process. Real
// meters, but authored in HRA body-space (bbox centered ~26cm above the body origin), hence
// the recentering below — without it OrbitControls (which always orbits the origin) would
// swing the gland around an empty point in space instead of rotating it in place.
// MATERIAL COLOR (real-tissue rule): see the buildPancreasMesh comment below.
export function buildPancreasMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/pancreas.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity — same clip-fix-pass material recipe as
      // every organ (see liver.js for the full mechanism note), roughness/specularIntensity
      // both revised by the material/lighting realism pass (roughness x0.82, specularIntensity
      // 0.15->0.25, per-vertex tissue mottle amplitude 0.28 — full recipe, clip-safety
      // reasoning, and the transmission investigation's null result are in liver.js's canonical
      // comment and this pass's dated CLAUDE.md entry). Color: the pancreas is the palest organ
      // in this atlas by design, not by accident — gross-anatomy sources describe a pale,
      // lobulated, tan-to-yellowish gland (citation in CLAUDE.md's organ entry; verified before
      // picking, same real-tissue rule as every prior organ), a real visual contrast with the
      // liver's dark red-brown two rows up the sidebar; color itself untouched by this pass.
      // Seed 10.4 (organ #8 in ORGAN_MODULES' order x1.3).
      const mat = new THREE.MeshPhysicalMaterial({ color:0xd8b98e, roughness:0.51, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 10.4); } });
      // Recenter: HRA body-space → origin, so the origin-targeted OrbitControls rotate the
      // gland about its own center. Hotspot pos values below are in this recentered frame
      // (they were derived from the GLB's own vertices with the same bbox-center subtraction).
      // NOTE for the mottle call above: this only recenters the gltf.scene NODE's position, not
      // the underlying BufferGeometry's own vertex data — applyTissueMottleVertexColors
      // recomputes its own per-sub-mesh bounding box for exactly this reason (see its comment in
      // viewer.js), so it stays correct regardless of which happens first.
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Digestive System', title:'Pancreas',
  sub:'Dual-function gland · head, neck, body & tail · enzymes into the gut, hormones into the blood',
  facts:[
    {label:'Location', val:'Retroperitoneal, crossing the L1–L2 vertebrae — head cradled in the duodenum\'s C-loop, tail reaching toward the spleen'},
    {label:'Divisions', val:'Four parts: head (including the uncinate process), neck, body &amp; tail'},
    {label:'Function', val:'Exocrine: acinar cells make digestive enzymes; endocrine: islets of Langerhans release insulin &amp; glucagon into the blood'},
    {label:'Blood supply', val:'Celiac trunk &amp; SMA: pancreaticoduodenal arteries (head), splenic artery branches (body &amp; tail)'},
  ],
  // The dual-function fact gets the second-sentence treatment every organ's one genuinely
  // distinguishing fact gets (lungs' dual circulation, liver's dual blood supply, kidney's
  // retroperitoneal position): this is the atlas's first organ that is literally two glands
  // in one — and the exocrine share of its mass is a real, live source conflict (Pancreapedia
  // ">95%" vs StatPearls "approximately 80%"), stated as such rather than smoothed over, the
  // same discrepancy-honesty treatment HCC's bone-metastasis figures got.
  desc:'The pancreas is an elongated gland lying sideways across the upper abdomen, behind the peritoneum, its head cradled in the C-shaped curve of the duodenum and its tail reaching toward the spleen. It is really two organs in one tissue: the exocrine pancreas — acinar cells making digestive enzymes that drain through the ducts of Wirsung and Santorini into the duodenum — makes up the large majority of its mass (more than 95% per Pancreapedia; StatPearls gives approximately 80%, a genuine source discrepancy), while the endocrine islets of Langerhans, only 1–2% of the gland\'s mass, release insulin and glucagon directly into the bloodstream. Two-thirds of pancreatic ductal adenocarcinomas arise in the head of the gland.',
  buildMesh: buildPancreasMesh,
  // Real-world-meter GLB (bbox ~17.2 x 5.7 x 8.4cm) — minRadius/maxRadius rescaled to real
  // meters, same reasoning as every real-mesh organ (frameContents only widens maxDistance,
  // never minDistance — see lungs.js).
  viewer:{ theta:0.5, phi:1.15, radius:0.35, minRadius:0.10, maxRadius:0.85, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a pancreas, an elongated, tapering gland shown lying '
    + 'horizontally — the broad head at the left, the tail narrowing to the right — with four '
    + 'glowing teal points marking the structures listed after it. Drag to rotate, scroll to zoom.',
  // pos: literal anchor points (meters, recentered mesh space) — derived directly from the
  // GLB's own NAMED sub-mesh vertices (VH_F_head_of_pancreas, VH_F_neck_of_pancreas,
  // VH_F_body_of_pancreas, VH_F_tail_of_pancreas), each the anterior-most vertex near its
  // target region rather than a raycast from a hand-held picker — possible for the first time
  // because this organ's GLB preserves the HRA's own per-structure meshes (see the buildMesh
  // comment above). Verified visible at the default camera angle by screenshot, per the
  // Kidneys lesson.
  hotspots:[
    // The "arises here" point every organ leads with — worded to the verified line between
    // what's safe ("arises from the ductal epithelium, via PanIN precursors" — Wood et al.,
    // Gastroenterology, 2022) and what's explicitly controversial (the CELL of origin:
    // "numerous studies in murine models have shown that acinar cells can give rise to
    // PanINs following pancreatic injury and metaplasia", same source) — the claim below is
    // about the epithelium and the precursor lesion, deliberately not about which cell type
    // the first mutant cell was.
    { key:'pduct', label:'Main pancreatic duct', pos:[-0.0393, 0.0019, 0.0356],
      text:'The duct of Wirsung, running the length of the gland and emptying with the bile duct into the duodenum at the ampulla of Vater. Pancreatic ductal adenocarcinoma arises from the ductal epithelium via microscopic precursor lesions called PanINs (pancreatic intraepithelial neoplasia) — directly paralleling how ovarian cancer begins in the surface epithelium and lung adenocarcinoma in the alveoli — though which cell type the very first mutant cell is remains genuinely debated (injured acinar cells can transform into duct-like cells).' },
    { key:'phead', label:'Head & uncinate process', pos:[-0.0769, 0.0029, 0.0220],
      text:'The gland\'s broadest part, cradled in the C-shaped curve of the duodenum, with the hook-shaped uncinate process extending from its lower portion. Two-thirds of pancreatic ductal adenocarcinomas arise in the head (StatPearls) — which is also why they can block the bile duct passing through it and announce themselves with painless jaundice.' },
    { key:'pbody', label:'Body', pos:[0.0000, 0.0063, 0.0334],
      text:'The middle of the gland, passing over the aorta and the L2 vertebra. This is exocrine territory: pyramidal acinar cells packed with zymogen granules make the digestive enzymes that drain toward the duodenum — the tissue type making up the large majority of the pancreas\'s mass (>95% per Pancreapedia; ~80% per StatPearls — a real source discrepancy, stated rather than smoothed over).' },
    { key:'ptail', label:'Tail', pos:[0.0644, 0.0024, -0.0115],
      text:'The narrowing end of the gland, coursing toward the splenic hilum and supplied by branches of the splenic artery. The endocrine islets of Langerhans — 1–2% of the pancreas\'s mass — release insulin (B cells) and glucagon (A cells) directly into the bloodstream rather than into the ducts.' },
  ],
};

// EVERY citation in this organ's data was verified directly at the source before being written
// in (the standard ccRCC/HCC/GBM/Prostate held from the start). Two corrections this pass's own
// verification made to its source brief, recorded per the LUAD-correction precedent:
// - The Hruban progression-model PMID is 10955772, NOT 11106242 (that's a Wilms' tumor paper);
//   and the paper itself is inaccessible (AACR 403, no PubMed abstract), so the classical model
//   is attested here via Notta et al. 2016, which states its ordering verbatim and cites Hruban.
// - The Iacobuzio-Donahue SMAD4/metastasis PMID is 19273710, NOT 19581604 (that's a CMAJ
//   cardiovascular-spending paper). Both wrong PMIDs would have shipped false citations.
//
// TEMPORAL trunk framing — the atlas's third, after HCC's TERT and GBM's IDH-status (data rule
// 5): the classical PDAC progression model IS an ordered sequence in time. But unlike HCC's,
// this organ's temporal story has a documented modern challenge, and both are represented:
// Notta et al. (Nature, 2016) states the classical model verbatim — "KRAS, followed by CDKN2A,
// then TP53 and SMAD4" — and then reports that "pancreatic cancer tumorigenesis is neither
// gradual nor follows the accepted mutation order", with "Two-thirds of tumours harbour complex
// rearrangement patterns associated with mitotic errors, consistent with punctuated equilibrium
// ... the simultaneous, rather than sequential, knockout of canonical preneoplastic genetic
// drivers." So the cascade below is labeled the CLASSICAL model and carries the Notta caveat,
// per the same rule-plus-documented-exception discipline as HCC's TP53/CTNNB1 (data rule 6).
// Three further verification outcomes that shaped the wording:
// - THREE tiers, not four steps: no source separates TP53 from SMAD4 as ordered steps (Notta
//   groups them; Maitra 2003 groups them as "late"; Hosoda 2017: "inactivation of TP53 and
//   SMAD4 are late genetic alterations, predominantly occurring in invasive PDAC").
// - KRAS does NOT rise with grade: ~92-95% flat from the earliest PanIN-1A onward (Kanda 2012:
//   92.0%/92.3%/93.3%/95.4% across grades by pyrosequencing; Hosoda 2017: 94% in low-grade
//   PanIN). The older "rising gradient" (36%→44%→87%, Löhr 2005) was an assay-sensitivity
//   artifact — do not reintroduce it.
// - The tiers OVERLAP: p16 loss is already present in 30% of the earliest (PanIN-1A) lesions
//   (Wilentz 1998), so "early-to-intermediate" is the honest tier label for CDKN2A, not "step 2".
//
// COUNTING-RULE discipline (both branch tumor-suppressor frequencies span wide ranges that are
// method differences, not contradictions — each ccf string states its rule):
// - CDKN2A: 35% (mutations + structural variants only, Waddell 2015, 100 whole genomes) to 98%
//   (Rb/p16 pathway level including promoter hypermethylation, Schutte 1997).
// - SMAD4: 31% (mutations + SVs, Waddell 2015) vs ~50% classical (including homozygous
//   deletion — Hahn 1996 shows deletion is the DOMINANT mechanism, 25/84 tumors).
//
// EXCLUDED from this organ's private pool, not just left out (same class as HCC's AXIN1 and
// GBM's NF1/RB1/PIK3CA exclusions — alternative drivers that compete with a gene already in
// use): BRAF, GNAS, and CTNNB1. TCGA (Raphael et al., 2017) analyzed the 10 KRAS-wild-type
// tumors specifically and found these concentrated there as ALTERNATIVE trunk drivers ("KRAS
// wild-type tumors harbored alterations in other oncogenic drivers, including GNAS, BRAF,
// CTNNB1 and additional RAS pathway genes"; 6 of 10 carried an alternative RAS-MAPK activator,
// including activating in-frame BRAF deletions). Because KRAS is this cancer's trunk and the
// private pool draws onto cells regardless of site, any of these three would put an alternative
// trunk driver inside a KRAS-trunk tumor. GATA6 and MYC amplification are real recurrent PDAC
// events but have NO citable percentage (TCGA names them without one; Waddell's prevalence
// wording is ambiguous) — left out entirely rather than shown numberless, since unlike ccRCC's
// KDM5C there is no architectural reason to need them.
const REGIONS_PDAC = [
  // Site frequencies: Oweira et al. (World J Gastroenterol, 2017, PMID 28348494) — SEER
  // 2010-2013, N=13,233 patients with stage IV disease AT INITIAL DIAGNOSIS: liver 76%, lung
  // 19.9%, distant (non-regional) lymph nodes 9.4% (bone 6.8% and brain 0.6% not modeled).
  // Presentation frequencies, not lifetime/autopsy ones (autopsy series run higher), and they
  // sum past 100% because 33.7% of patients had multi-organ disease. Peritoneum is the one
  // modeled site with NO citable percentage — see its own note.
  { id:'DL', name:'Liver', color:cssVar('--coral'), pos3d:{x:-1.3,y:0.95,z:0.35},
    branch:{ gene:'SMAD4 loss', class:'driver', ccf:'31% of PDAC by mutation + structural variant (Waddell et al., Nature, 2015, 100 whole genomes) — classically ~50% once homozygous deletion, the dominant mechanism (25/84 tumors, Hahn et al., Science, 1996), is counted', note:'The TGF-β pathway\'s central tumor suppressor (DPC4), and the LATE tier of this cancer\'s classical progression model — precursor-lesion studies found it intact in every PanIN-1 and PanIN-2 lesion examined and lost only at the PanIN-3/carcinoma stage (Wilentz et al., Cancer Res, 2000). Its most distinctive real finding is about how patients die: in a 76-patient rapid-autopsy series, SMAD4/Dpc4 status was "highly correlated with the presence of widespread metastasis but not with locally destructive tumors" (P = .007, Iacobuzio-Donahue et al., J Clin Oncol, 2009) — an association with widespread spread, deliberately not worded as "drives" it. Liver is this cancer\'s dominant metastatic site: 76% of stage-IV-at-diagnosis patients (Oweira et al., 2017, SEER, N=13,233).' } },
  { id:'DP', name:'Peritoneum', color:cssVar('--azure'), pos3d:{x:1.45,y:0.8,z:-0.25},
    branch:{ gene:'SMAD4 loss', class:'driver', ccf:'31% of PDAC by mutation + structural variant (Waddell et al., Nature, 2015) — same late-tier event as the Liver site; showing it at two sites mirrors how widespread-metastasis disease was the SMAD4-associated pattern in the autopsy series', note:'Peritoneal deposits are a real, clinically important route of pancreatic cancer spread — but this is the one site here with NO citable percentage, and the honest reason is structural: SEER does not record peritoneal metastases, and the site-frequency source itself says so ("an important site of metastasis from pancreatic cancer — that is peritoneal deposits — is not detailed in the SEER database", Oweira et al., 2017). Same no-number honesty precedent as LUAD\'s adrenal gland and ccRCC\'s liver/brain sites.' } },
  { id:'DU', name:'Lung', color:cssVar('--amber'), pos3d:{x:-0.95,y:-1.35,z:0.25},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'70–74% of PDAC (70%, Redston et al., Cancer Res, 1994; 74% with structural variants counted, Waddell et al., Nature, 2015 — two cohorts 21 years apart converging)', note:'Disables the genome\'s damage-response checkpoint — mostly missense point mutations in the evolutionarily conserved domains (Redston et al., 1994). The late tier of the classical progression model, alongside SMAD4: "Mutations in TP53 ... were limited to one or two HG-PanINs", i.e. essentially absent from low-grade precursors and appearing at high grade and invasion (Hosoda et al., J Pathol, 2017). Lung is the second most common distant site at presentation: 19.9% of stage-IV patients (Oweira et al., 2017).' } },
  { id:'DN', name:'Distant lymph nodes', color:cssVar('--violet'), pos3d:{x:1.15,y:-1.25,z:0.45},
    branch:{ gene:'CDKN2A (p16) loss', class:'driver', ccf:'35% of PDAC by mutation + structural variant (Waddell et al., Nature, 2015) to 98% at Rb/p16 pathway level including promoter hypermethylation (Schutte et al., Cancer Res, 1997) — the counting rule, not the biology, is what changes the number', note:'Removes the p16 brake on the cyclin D/CDK4 cell-cycle engine (Caldas et al., Nat Genet, 1994). The EARLY-TO-INTERMEDIATE tier of the classical model — and the tier that shows why "ordered steps" oversimplifies: 30% of the very earliest PanIN-1A lesions have already lost p16 expression (Wilentz et al., Cancer Res, 1998), so this "second step" begins well inside the first. Distant (non-regional) lymph nodes: 9.4% of stage-IV-at-diagnosis patients (Oweira et al., 2017).' } },
];
const TRUNK_PDAC = [
  { gene:'KRAS mutation', class:'driver', ccf:'93% of PDAC (140/150, TCGA/Raphael et al., Cancer Cell, 2017, with hotspots sequenced at ~30,000x depth; "90% to 95%" across cohorts, Wood et al., Gastroenterology, 2022; "near ubiquitous", Waddell et al., Nature, 2015) — the most near-universal oncogene trunk in this atlas (only HGSOC\'s TP53, a tumor suppressor, reaches higher at ~96%)', note:'Locks the RAS growth switch on — and it is trunk for a TEMPORAL reason, like liver cancer\'s TERT: it is already there at the very beginning. Sensitive assays find KRAS mutated in ~92–95% of even the earliest, lowest-grade PanIN precursor lesions, essentially flat across every grade (Kanda et al., Gastroenterology, 2012; Hosoda et al., J Pathol, 2017) — the older textbook picture of KRAS "accumulating" with grade was an assay-sensitivity artifact. The classical progression model — "KRAS, followed by CDKN2A, then TP53 and SMAD4" — is real and citable, but so is its modern challenge: Notta et al. (Nature, 2016) found tumorigenesis "neither gradual nor follows the accepted mutation order", with two-thirds of tumors showing punctuated, simultaneous knockout of drivers via catastrophic rearrangement. Both the model and the challenge are part of this cancer\'s real story — as is its timescale: a quantitative autopsy analysis estimated an average of 11.7 years from the initiating mutation to the founding of the parental clone, 6.8 more years to metastatic seeding, and 2.7 from then to death (Yachida et al., Nature, 2010 — a 7-patient autopsy series plus a mathematical model, so treat the precision accordingly).' },
];
const PRIVATE_POOL_PDAC = [
  { gene:'KDM6A inactivation', class:'driver', ccf:'18% of PDAC (Waddell et al., Nature, 2015, 100 whole genomes)', note:'A chromatin regulator (histone demethylase) — "in most cases both alleles of KDM6A were affected" in this cohort. Not an alternative trunk driver: safe alongside a KRAS-trunk tumor, unlike BRAF/GNAS/CTNNB1, which were checked and excluded (they concentrate in the rare KRAS-wild-type tumors as substitutes for KRAS, not companions to it — TCGA, 2017).' },
  { gene:'RNF43 inactivation', class:'driver', ccf:'10% of PDAC (Waddell et al., Nature, 2015)', note:'A Wnt-pathway brake, "originally identified in cystic tumours of the pancreas" (Waddell et al., 2015). Inactivating a brake on Wnt signaling cooperates with a KRAS trunk — categorically different from CTNNB1 mutation, which floors the Wnt accelerator and appears in KRAS-wild-type tumors as an alternative driver (excluded from this pool for exactly that reason).' },
  { gene:'PREX2 mutation', class:'driver', ccf:'10% of PDAC (Waddell et al., Nature, 2015)', note:'A RAC1 regulator recurrently mutated at the same rate as RNF43 in the same 100-genome cohort — a real recurrent driver, not an alternative to KRAS.' },
  { gene:'TGFBR2 alteration', class:'driver', ccf:'4.1% of PDAC (4/97, Goggins et al., Cancer Res, 1998)', note:'The TGF-β type II receptor — a second, rarer way of breaking the same growth-inhibitory pathway the SMAD4 branch events disable downstream. The same paper found some component of the TGF-β pathway (DPC4, p15, ALK-5, or TGFBR2) genetically inactivated in 82% of the tumors examined.' },
  { gene:'BRCA2 mutation', class:'driver', ccf:'BRCA1/2 together: 5–10% of PDAC (Wood et al., Gastroenterology, 2022); germline BRCA2 was the most common pathogenic germline variant in TCGA\'s cohort', note:'Breaks homologous-recombination DNA repair — some are inherited (up to 20% in Ashkenazi Jewish patients carry a BRCA1/2 variant, Wood et al., 2022), making this the pool\'s one gene that can precede the tumor entirely. HR-deficiency cooperates with, never substitutes for, the KRAS trunk.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly, and one figure from the
// task brief corrected rather than shipped): the suggested perineural-invasion range "~70-100%"
// overstated the floor — the same review tabulating 87% (778-patient multicenter series) also
// lists cohorts at 57.6%-70.8% and 58% after neoadjuvant therapy, so the honest range is
// ~80-90% (Li, Kang & Tang, Cancer Communications, 2021; PathologyOutlines gives "present in
// 90%"). Stroma: "up to 90% of the tumour volume" (Myo Min et al., Cancers, 2023) — the more
// conservative of two published forms ("typically 90%" also exists) — with Hruban & Klimstra
// (Semin Diagn Pathol, 2014) supplying what it's made of ("dense collagen, fibroblasts,
// delicate vessels, and inflammatory cells") and the fact that neoplastic cells are "actually
// outnumbered by non-neoplastic cells in many of these tumors". The gland-next-to-artery clue
// is one of Hruban & Klimstra's eight enumerated criteria, drawn with its own caveat quoted
// ("not by itself diagnostic ... as it can rarely be seen in chronic pancreatitis"), and
// "incomplete lumina" (lumen touching stroma with no intervening epithelium) is drawn as one
// broken gland ring. The teaching point the intro leads with is their second observation:
// "despite the highly lethal nature of this cancer, the neoplastic glands are often extremely
// well-differentiated" — the lethality is in where the glands are, not how ugly the cells look.
const HISTOLOGY_PDAC = {
  intro: 'Pancreatic ductal adenocarcinoma inverts the usual picture of a cancer: the malignant glands are the minority element, scattered through a dense desmoplastic stroma that can make up to 90% of the tumor\'s volume — and despite this cancer\'s lethality, those glands are often extremely well-differentiated, deceptively normal-looking one at a time. What gives them away is arrangement and address: glands scattered haphazardly with no lobular organization, one sitting immediately against a muscular artery (a real diagnostic clue, though not by itself diagnostic — it can rarely occur in chronic pancreatitis), one with an incomplete lumen open to the stroma, and tumor cells tracking along a nerve — perineural invasion, present in roughly 80–90% of resected cases.',
  ariaSummary: 'Stylized microscopic field dominated by pale pink, swirling fibrous stroma with scattered elongated fibroblast nuclei. A handful of small, well-formed tumor gland rings are scattered at random angles and spacings across the field. Lower left: a thick-walled round artery with a tumor gland pressed directly against its wall. Upper right: one gland ring broken open, its lumen touching the stroma. Lower right: a pale wavy nerve bundle crossing the corner, with a tumor gland wrapped against its curve.',
  citation: 'Hruban & Klimstra, Seminars in Diagnostic Pathology, 2014; Myo Min et al., Cancers, 2023; Li, Kang & Tang, Cancer Communications, 2021; PathologyOutlines.com, "Ductal adenocarcinoma, NOS".',
  features: [
    { key:'stroma', label:'Desmoplastic stroma',
      text:'The tumor\'s dominant tissue by volume — up to 90% — a dense reaction of collagen, fibroblasts, delicate vessels and inflammatory cells that the cancer induces around itself. In many tumors the neoplastic cells are literally outnumbered by the non-neoplastic cells of their own stroma.' },
    { key:'haphazard', label:'Haphazard glands',
      text:'Well-formed, deceptively normal-looking glands scattered at random orientations with no lobular organization — the first of Hruban & Klimstra\'s eight diagnostic features. The normal pancreas keeps its ducts orderly and separated from muscular vessels by acinar tissue; adenocarcinoma violates that architecture, which is why a gland sitting immediately against a muscular artery (lower left) strongly suggests — though does not by itself prove — carcinoma.' },
    { key:'perineural', label:'Perineural invasion',
      text:'Tumor cells wrapping and tracking along nerves — present in roughly 80–90% of resected cases, often best seen at the tumor\'s leading edge, and part of why pancreatic cancer causes deep, boring pain and recurs locally after resection.' },
  ],
};

export const cancerDetails = {
  pdac: {
    title:'Pancreatic Ductal Adenocarcinoma', screenLabel:'Pancreatic ductal adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_PDAC, trunk:TRUNK_PDAC, privatePool:PRIVATE_POOL_PDAC,
    histology: HISTOLOGY_PDAC,
  },
};
