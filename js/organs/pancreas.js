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
  { id:'pacc',  name:'Acinar cell carcinoma',            share:'~1–2% of adult pancreatic exocrine neoplasms — well-converged across independent cohorts (Wisnoski et al., Surgery, 2008; Al-Hader et al., World J Gastroenterol, 2017; Farhoud et al., Cancers, 2026)', active:true, organKey:'pancreas' },
  { id:'pcyst', name:'Invasive carcinoma arising in IPMN', share:'a genuine, disclosed registry discrepancy: 0.35% of a combined PDAC+invasive-IPMN cohort (356/101,190, Ziogas et al., Cancers, 2023, US NCDB 2004–2016) vs 3.6% in a resected, non-metastatic German registry cohort (217/6,011, Abdalla et al., Cancers, 2024) — not resolved by picking one, the same class of cross-cohort disagreement this atlas already discloses for HCC\'s own bone-metastasis figures', active:true, organKey:'pancreas' },
  { id:'pnet',  name:'Pancreatic neuroendocrine tumor',  share:'a separate endocrine category, excluded from the exocrine denominator above — same treatment as SCLC vs NSCLC on the Lungs list. ~3% of pancreatic neoplasms in an older cohort (Halfdanarson et al., 2008) rising to ~8.2% in a modern SEER cohort (Lei et al., Gastroenterol Rep, 2025) — a real, disclosed rise from increased incidental detection (a 4.3-fold increase, Dasari et al., JAMA Netw Open, 2025), not a discrepancy', active:true, organKey:'pancreas' },
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
      // lobulated, tan-to-yellowish gland — DOWNGRADED to illustrative (citation-durability
      // pass, 2026-09-04; manifest col-pancreas): the original comment claimed "citation in
      // CLAUDE.md's organ entry", but no such entry ever existed (dangling since first commit
      // 3c78c88) and the describing source was never named. The words remain a fair gross
      // description; the ATTRIBUTION is what failed. A real visual contrast with the
      // liver's dark red-brown two rows up the sidebar; color itself untouched by this pass.
      // Seed 10.4 (organ #8 in ORGAN_MODULES' order x1.3).
      const mat = new THREE.MeshPhysicalMaterial({ color:0xd8b98e, roughness:0.51, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      // Shared mottle frame across the five named sub-meshes (Tier 2): per-mesh frames made the
      // pattern jump at the body/head boundary — the audit's "seam", which survived the normals
      // weld because it was never a normals problem (AO-only renders the same boundary
      // seamlessly). One union box in world space; each part samples the same field.
      gltf.scene.updateMatrixWorld(true);
      const mottleMeshes = [];
      gltf.scene.traverse(o=>{ if(o.isMesh) mottleMeshes.push(o); });
      const unionBox = new THREE.Box3();
      mottleMeshes.forEach(o=>unionBox.expandByObject(o));
      mottleMeshes.forEach(o=>{ o.material = mat;
        applyTissueMottleVertexColors(o.geometry, 10.4, { frame:{ box: unionBox, matrixWorld: o.matrixWorld } }); });
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
      text:'The middle of the gland, passing over the aorta and the L2 vertebra. This is exocrine territory: pyramidal acinar cells packed with zymogen granules make the digestive enzymes that drain toward the duodenum — the tissue type making up the large majority of the pancreas\'s mass (>95% per Pancreapedia; ~80% per StatPearls — a real source discrepancy, stated rather than smoothed over). Acinar cell carcinoma arises directly from these cells, keeping much of their real granular, enzyme-packed character even after malignant transformation.' },
    { key:'ptail', label:'Tail', pos:[0.0644, 0.0024, -0.0115],
      text:'The narrowing end of the gland, coursing toward the splenic hilum and supplied by branches of the splenic artery. The endocrine islets of Langerhans — 1–2% of the pancreas\'s mass — release insulin (B cells) and glucagon (A cells) directly into the bloodstream rather than into the ducts. Pancreatic neuroendocrine tumor arises from these same islet cells.' },
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
  { gene:'RNF43 inactivation', class:'driver', ccf:'10% of PDAC (Waddell et al., Nature, 2015)', note:'A Wnt-pathway brake, "originally identified in cystic tumours of the pancreas" (Waddell et al., 2015). Inactivating a brake on Wnt signaling cooperates with a KRAS trunk — the contrast with CTNNB1 mutation (which floors the Wnt accelerator and appears in KRAS-wild-type tumors as an alternative driver, excluded from this pool for exactly that reason) is this atlas’s framing of the two cited alteration patterns, not a distinction the source paper draws.' },
  { gene:'PREX2 mutation', class:'driver', ccf:'10% of PDAC (Waddell et al., Nature, 2015)', note:'A RAC1 regulator recurrently mutated at the same rate as RNF43 in the same 100-genome cohort — named a candidate driver by that paper (Waddell et al., 2015), not an alternative to KRAS.' },
  { gene:'TGFBR2 alteration', class:'driver', ccf:'4.1% of PDAC (4/97, Goggins et al., Cancer Res, 1998)', note:'The TGF-β type II receptor — a second, rarer way of breaking the same growth-inhibitory pathway the SMAD4 branch events disable downstream. The same paper found some component of the TGF-β pathway (DPC4, p15, ALK-5, or TGFBR2) genetically inactivated in 82% of the tumors examined.' },
  { gene:'BRCA2 mutation', class:'driver', ccf:'BRCA1/2 together: 5–10% of PDAC (Wood et al., Gastroenterology, 2022); germline BRCA2 was the most common pathogenic germline variant in TCGA\'s cohort', note:'Breaks homologous-recombination DNA repair — some are inherited (up to 20% in Ashkenazi Jewish patients carry a BRCA1/2 variant, Wood et al., 2022), making this the pool\'s one gene that can precede the tumor entirely. HR-deficiency cooperates with, never substitutes for, the KRAS trunk.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
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

// ============================================================
// PANCREATIC NEUROENDOCRINE TUMOR (pnet) — 2026-09-13, ordinary-organ batch. Every citation
// verified directly at the source. Modeled on somatic, sporadic PanNET specifically (not
// germline-syndrome disease — see the growth-axis note below, an honest scope caveat this pass's
// own research surfaced rather than silently importing).
//
// TRUNK — MEN1 mutation, but on FREQUENCY grounds only, disclosed as such: Jiao et al. (Science,
// 2011, PMID 21252315, PMCID PMC3144496, N=68 exome-sequenced + screened) found "somatic
// mutations in MEN1, DAXX, ATRX, PTEN, TSC2, and PIK3CA... in 44.1%, 25%, 17.6%, 7.3%, 8.8%, and
// 1.4% PanNETs, respectively" — MEN1 is the single most frequent recurrent alteration by a wide
// margin over the next-most-frequent individual gene (DAXX, 25%), directly stated in that same
// source (Jiao et al.'s own abstract instead groups MEN1 with DAXX/ATRX together as one 43-44%
// chromatin-remodeling class — an independent-corroboration citation, Tirosh & Kebebew, J
// Gastrointest Oncol, 2020, PMID 32655936, was checked in this pass's own citation-verification
// round and found NOT to state the specific "most frequently mutated gene" framing anywhere in
// its full text, despite an earlier draft quoting it as if it did — removed rather than kept on
// an unverifiable quote). But unlike VHL's
// spatial truncal proof (Gerlinger et al.'s multi-region sequencing) or TERT's temporal proof
// (found in premalignant lesions), no multi-region-sequencing or precursor-lesion study was found
// in this pass's own search establishing MEN1 as spatially or temporally truncal for sporadic
// PanNET — the trunk claim here rests on frequency alone, stated as such rather than borrowing
// the stronger language this atlas reserves for directly-demonstrated cases.
const TRUNK_PNET = [
  { gene:'MEN1 mutation', class:'driver', ccf:'44.1% (30/68, Jiao et al., Science, 2011) — the single most frequent recurrent somatic alteration, by a wide margin over the next-most-frequent gene (DAXX, 25%)', note:'Trunk here on FREQUENCY grounds specifically — the single most common recurring alteration found — not on directly-demonstrated spatial (multi-region) or temporal (precursor-lesion) truncal architecture, which this pass\'s own search did not find for this gene in sporadic PanNET. MEN1 encodes menin, a tumor suppressor whose germline loss also causes Multiple Endocrine Neoplasia type 1 syndrome; this entry models the far more common sporadic, somatic-mutation form.' },
];
// Branch pair — DAXX and ATRX, a real, explicitly-stated mutually-exclusive pair (Jiao et al.,
// 2011, verbatim: "No tumor with a mutation in DAXX had a mutation in ATRX, consistent with their
// presumptive function within the same pathway") — both genes maintain telomeres via the ALT
// (alternative lengthening of telomeres) pathway when lost, confirmed to "correlate[] perfectly"
// with ALT activation (Heaphy & Singhi, Human Pathology, 2023, PMID 36702689, PMCID PMC10259096).
// A REAL, DISCLOSED PROGNOSIS CONFLICT, not resolved by picking a side (the HCC Katyal-vs-Zhuang
// precedent): Jiao et al. 2011's own small discovery cohort (N=68) found DAXX/ATRX mutation
// "associated with better prognosis" — but the larger, dedicated, more recent cohort (Singhi et
// al., Clin Cancer Res, 2017, PMID 27407094, PMCID PMC6560642, N=321, two institutions) found the
// opposite: DAXX/ATRX loss and ALT-positivity independently predicted WORSE disease-free and
// disease-specific survival, and were detected in 52% and 67% respectively among tumors with
// distant metastasis specifically — the larger cohort's finding is what the branch notes below
// use, since it is both larger and specifically about metastasis, but Jiao's conflicting result is
// disclosed rather than dropped.
const REGIONS_PNET = [
  // Site frequencies: Wang, Zhang, Liu & Zhang, 2019, journal Medicine (Baltimore), PMID 31689842, PMCID PMC6946365 —
  // SEER, N=3,909 PanNET patients; 1,187 (30.4% of the total cohort) had single-organ metastasis.
  // Percentages below are computed from the paper's own isolated-metastasis counts as a share of
  // that 1,187-patient single-organ-metastasis subset (liver 1133, lung 28, bone 21, brain 5) —
  // liver is overwhelmingly dominant, confirmed directly rather than assumed from a "most common
  // site" headline alone. The paper states directly why no fifth site (peritoneum, lymph nodes)
  // can be modeled: "SEER does not provide organ metastases information except brain, bone, liver
  // and lung" — same no-number honesty precedent as PDAC's own peritoneum entry above.
  { id:'EA', name:'Liver', color:cssVar('--coral'), pos3d:{x:-1.3,y:0.95,z:0.35},
    branch:{ gene:'DAXX mutation/loss', class:'driver', ccf:'25% of PanNET (17/68, Jiao et al., 2011); DAXX/ATRX loss detected in 52% of PanNETs with distant metastasis specifically (Singhi et al., 2017, N=321)', note:'Loss correlates perfectly with activation of ALT (alternative lengthening of telomeres), a telomerase-independent, cancer-specific mechanism (Heaphy & Singhi, 2023). Liver is this cancer\'s overwhelmingly dominant metastatic site: 95.4% of patients with single-organ metastasis (1,133/1,187, Wang et al., 2019).' } },
  { id:'EB', name:'Lung', color:cssVar('--azure'), pos3d:{x:-0.95,y:-1.35,z:0.25},
    branch:{ gene:'DAXX mutation/loss', class:'driver', ccf:'25% of PanNET (17/68, Jiao et al., 2011)', note:'Same finding as at Liver. Lung is a distant second real site: 2.4% of single-organ-metastasis patients (28/1,187, Wang et al., 2019) — a real, striking departure from PDAC\'s own lung rate (19.9% of stage-IV patients), consistent with this organ\'s two cancers having genuinely different spread biology.' } },
  { id:'EF', name:'Bone', color:cssVar('--amber'), pos3d:{x:1.15,y:-1.25,z:0.45},
    branch:{ gene:'ATRX mutation/loss', class:'driver', ccf:'17.6% of PanNET (12/68, Jiao et al., 2011); DAXX/ATRX loss detected in 52% of PanNETs with distant metastasis specifically (Singhi et al., 2017)', note:'Mutually exclusive with DAXX loss, modeled at a different site here — the same real, checked exclusivity Jiao et al. state directly ("No tumor with a mutation in DAXX had a mutation in ATRX"). Bone is a real minor site: 1.8% of single-organ-metastasis patients (21/1,187, Wang et al., 2019).' } },
  { id:'EH', name:'Brain', color:cssVar('--violet'), pos3d:{x:1.45,y:0.8,z:-0.25},
    branch:{ gene:'ATRX mutation/loss', class:'driver', ccf:'17.6% of PanNET (12/68, Jiao et al., 2011)', note:'Same finding as at Bone. Brain is this cancer\'s least common of the four real, citable sites: 0.4% of single-organ-metastasis patients (5/1,187, Wang et al., 2019).' } },
];
// Private pool — the mTOR-pathway genes from the same Jiao et al. 2011 cohort: PTEN, TSC2, and
// PIK3CA. A real COUNTING-RULE note, the same class as PDAC's own CDKN2A/SMAD4 discrepancies
// above: the three individual frequencies (7.3% + 8.8% + 1.4% = 17.5%) sum to MORE than the
// paper's own combined "mTOR pathway" figure (14%, stated in its abstract/title) — meaning some
// tumors carry more than one of the three simultaneously; the paper does not spell out the exact
// overlap, so both the individual and combined figures are stated rather than only one picked.
// Checked for a same-tumor conflict against MEN1/DAXX/ATRX: no exclusivity or requirement was
// found stated in either direction in this pass's own search (an honest "checked, not found").
const PRIVATE_POOL_PNET = [
  { gene:'TSC2 mutation', class:'driver', ccf:'8.8% of PanNET (6/68, Jiao et al., 2011) — part of a combined mTOR-pathway alteration rate of 14% across PTEN/TSC2/PIK3CA, lower than the three genes\' own individual sum (17.5%) because some tumors carry more than one', note:'A tumor-suppressor brake on mTOR signaling — real and recurrent in this atlas\'s own third mTOR-pathway-implicated cancer (after Kidney/ccRCC\'s MTOR-pathway entry and Skin/melanoma\'s PTEN-cooperation branch), here via a different upstream node.' },
  { gene:'PTEN loss', class:'driver', ccf:'7.3% of PanNET (5/68, Jiao et al., 2011)', note:'Same mTOR-pathway axis as TSC2, a different gene in it — real and independently recurrent in this cohort, not assumed to co-occur or exclude.' },
  { gene:'PIK3CA mutation', class:'driver', ccf:'1.4% of PanNET (1/68, Jiao et al., 2011)', note:'The rarest of the three mTOR-pathway genes in this cohort — included for completeness of the real, cited pathway rather than left numberless.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];

// HISTOLOGY — organoid architecture (trabecular, nested, solid, or tubuloacinar — all four real
// and confirmed directly for PanNET itself in this pass's own search, not extrapolated from
// another neuroendocrine tumor's own literature) and coarse
// "salt and pepper"/stippled chromatin, both verified directly for PanNET itself (Monroe & El
// Naili, Academic Pathology, 2025, PMID 40034114, PMCID PMC11875812) — the same descriptive term
// this atlas's own medullary thyroid carcinoma entry uses, independently sourced for each of the
// two different neuroendocrine tumors rather than one borrowed from the other. Reuses genMTC's
// own nest/chromatin drawing technique (blobPath cell clusters + the coarse two-tone nucleus
// loop) but recomposes it into ELONGATED TRABECULAR ribbons rather than round nests — a real,
// PanNET-specific architectural distinction (trabecular is the pattern named first in the
// source), and deliberately WITHOUT the amyloid septae MTC's own generator draws, since amyloid
// is a calcitonin-secretion feature specific to that cancer with no PanNET counterpart found in
// this pass's own search. Thin fibrovascular septae between ribbons are real and drawn instead.
const HISTOLOGY_PNET = {
  intro: 'Pancreatic neuroendocrine tumor shows the organoid architecture typical of well-differentiated neuroendocrine neoplasms everywhere they arise: cells arranged in ribbon-like trabecular cords (or, less often here, solid nests), separated by thin, delicate fibrovascular septae. The nuclei carry a coarse, evenly stippled "salt and pepper" chromatin pattern — clumped rather than smooth, giving the field a speckled look at higher power.',
  ariaSummary: 'Stylized microscopic field: elongated, ribbon-like cords of tumor cells with abundant cytoplasm, winding across the field and separated by thin pale septae carrying small blood vessels. Nuclei throughout show a coarse, speckled, salt-and-pepper chromatin pattern rather than smooth or vesicular chromatin.',
  citation: 'Monroe & El Naili, Academic Pathology, 2025, PMID 40034114.',
  features: [
    { key:'trabecular', label:'Trabecular cords',
      text:'Ribbon-like cords of tumor cells, one of four real organoid patterns this tumor can show (trabecular, nested, solid, or tubuloacinar) — the architecture this whole family of neuroendocrine tumors shares, wherever in the body they arise.' },
    { key:'septae', label:'Fibrovascular septae',
      text:'Thin, delicate strands of vascularized connective tissue separating the trabecular cords — real supporting stroma, distinct from the amorphous amyloid deposits this atlas\'s own medullary thyroid carcinoma entry draws in the same architectural role.' },
    { key:'chromatin', label:'Salt-and-pepper chromatin',
      text:'A coarse, evenly stippled chromatin pattern in every nucleus — the same descriptive term pathologists use for medullary thyroid carcinoma\'s own nuclei, independently true of this unrelated neuroendocrine tumor as well.' },
  ],
};

// ============================================================
// ACINAR CELL CARCINOMA (pacc) — 2026-09-13, ordinary-organ batch. Every citation verified
// directly at the source.
//
// TRUNK — a fact-statement trunk, the same honest architecture Bladder squamous cell carcinoma
// and Prostate ductal adenocarcinoma already use for "no single founder": the one thing genuinely
// near-universal here is an ABSENCE, not a mutation. KRAS mutation — this organ's own PDAC trunk
// at 93% — is essentially absent from PACC, independently confirmed across five cohorts (not six —
// corrected 2026-09-13 by an independent citation-verification pass, which found two real
// problems in the original count): "None of the acinar cell carcinomas in this series had a KRAS
// mutation" (Jiao et al., J Pathol, 2014, PMID 24293293, PMCID PMC4048021, N=23); 3.5% (2/57,
// Bergmann et al., Virchows Arch, 2014, PMID 25298229); only 1 of 62 in a modern MSK-IMPACT
// cohort, a mixed acinar-ductal tumor (Liu et al., J Transl Med, 2025, PMID 41444605, PMCID
// PMC12729626); 94% wild-type (15/16, Balachandran Pillai et al., Cancers, 2024, PMID 39410042,
// PMCID PMC11475689); and, via Al-Hader et al.'s own pooled count (World J Gastroenterol, 2017,
// PMID 29259370, PMCID PMC5725289: "only one... out of the total 78 PACC cases sequenced in the
// three studies"), a further ~11 cases from Furukawa et al., 2015 not independently re-cited here
// — Al-Hader's other two pooled studies (Jiao and Chmielecki, the latter already cited below for
// this entity's own branch pair) are NOT counted twice in this tally. Abraham et al. (Am J Surg
// Pathol, 2002, PMID 11891193, PMCID PMC1867188, N=21) was checked and REMOVED from this list: its
// own Methods never tests KRAS at all, and its KRAS-wild-type sentence cites prior literature
// rather than its own 21 tumors — a real attribution error this pass's own verification caught
// and corrected. No single alternative driver reaches majority status either — the three real,
// independently-cited candidates below are each a minority.
const TRUNK_PACC = [
  { gene:'No single confirmed founder mutation', class:'driver', note:'The one truly defining genomic fact here is an ABSENCE: KRAS mutation — near-universal in this organ\'s own ductal adenocarcinoma at 93% — is essentially absent from acinar cell carcinoma, confirmed across five independent cohorts totaling over 200 tumors (0–4%). No single alternative driver fills the gap at majority frequency. Three real, minority candidates recur across independent cohorts: Wnt-pathway alteration (APC or CTNNB1, roughly 10–25% depending on cohort and counting method — mutation, allelic loss, and promoter hypermethylation are each counted differently across studies); BRAF/RAF1 structural fusion (23%, modeled as a branch gene below); and DNA-repair-gene inactivation (modeled as a branch gene below). This atlas\'s own PDAC entry explicitly excludes BRAF and CTNNB1 from its private pool because they concentrate as ALTERNATIVE trunk drivers specifically in KRAS-wild-type PDAC (TCGA/Raphael et al., 2017) — a rule that does not transfer here unmodified, since PACC has no KRAS trunk for these genes to compete against; they are PACC\'s own real, primary players, not passengers.' },
];
// Branch pair — BRAF/RAF1 fusion and BRCA1/2-mediated HRR (homologous-recombination-repair)
// deficiency, a real pair with a documented ANTI-CORRELATION, not asserted as stronger than the
// source states (the same disclosed-not-resolved discipline as Colon's own KRAS×TP53 pair, data
// rule 23): Chmielecki et al. (Cancer Discovery, 2014, PMID 25266736, N=44, comprehensive genomic
// profiling) found BRAF/RAF1 rearrangements in "approximately 23% of tumors" and, in the SAME
// cohort, that "PACCs lacking RAF rearrangements were significantly enriched for genomic
// alterations, causing inactivation of DNA repair genes (45%)" — a real, quantified enrichment
// specifically within the RAF-fusion-negative subgroup (i.e., roughly a third of the whole
// cohort by that subgroup's own share), not a claim that the two are strictly mutually exclusive
// across every tumor. BRCA1/2 specifically: "about one fifth (22%) of all pancreatic ACCs exhibit
// BRCA1/2 deficiency" (Kryklyva et al., Cancer Biol Ther, 2019, PMID 31002019, PMCID PMC6606020),
// a whole-cohort review figure used here as the cleaner single-gene-family statistic.
const REGIONS_PACC = [
  // No dedicated multi-site percentage-distribution study analogous to PDAC's own Oweira et al.
  // was found despite an extensive search — disclosed honestly rather than forced. Liver is the
  // one site with a real, citable cohort percentage; the other three are real, independently
  // named distant sites with no citable percentage found, the same no-number honesty precedent
  // PDAC's own Peritoneum entry and ccRCC's Liver/Brain entries already use.
  { id:'EJ', name:'Liver', color:cssVar('--coral'), pos3d:{x:-1.3,y:0.95,z:0.35},
    branch:{ gene:'BRAF/RAF1 fusion', class:'driver', ccf:'23% of PACC (Chmielecki et al., Cancer Discovery, 2014, N=44 — comprehensive genomic profiling)', note:'A real structural rearrangement, not a point mutation — this atlas\'s own second RTK/RAF-fusion branch gene after Prostate\'s TMPRSS2-ERG. Liver is this cancer\'s most commonly named metastatic site: the foundational primary study found metastatic disease "usually restricted to the regional lymph nodes and liver" (Klimstra et al., Am J Surg Pathol, 1992, PMID 1384374), and a modern SEER cohort (N=488) found liver metastasis in 31.3% of patients overall (Yasinzai et al., J Gastrointest Cancer, 2025, PMID 40266404 — abstract-verified; the exact denominator for this figure could not be independently confirmed beyond the abstract in this pass\'s own search).' } },
  { id:'EK', name:'Lung', color:cssVar('--azure'), pos3d:{x:-0.95,y:-1.35,z:0.25},
    branch:{ gene:'BRAF/RAF1 fusion', class:'driver', ccf:'23% of PACC (Chmielecki et al., 2014)', note:'Same finding as at Liver. Lung is a real, named minor metastatic site (Calimano-Ramirez et al., World J Gastroenterol, 2022, PMID 36353206, PMCID PMC9639656; Farhoud et al., Cancers, 2026, PMID 42512378, PMCID PMC13406766) with no citable percentage found in this pass\'s own search.' } },
  { id:'EM', name:'Peritoneum', color:cssVar('--amber'), pos3d:{x:1.45,y:0.8,z:-0.25},
    branch:{ gene:'BRCA1/2-mediated HRR deficiency', class:'driver', ccf:'~22% of PACC (Kryklyva et al., Cancer Biol Ther, 2019); real DNA-repair-gene inactivation broadly is significantly enriched specifically among tumors lacking a BRAF/RAF1 fusion (45% of that subgroup, Chmielecki et al., 2014)', note:'Homologous-recombination-repair deficiency — some inherited, making this one of the pool\'s events that can precede the tumor entirely, the same real property PDAC\'s own BRCA2 entry carries. Peritoneum is a real, named minor metastatic site (Farhoud et al., 2026: "Less common metastatic sites include lung, peritoneum, bone, skin, and brain" — Calimano-Ramirez et al., 2022, checked directly by an independent citation-verification pass and found NOT to mention peritoneal metastasis anywhere, removed from this specific citation) with no citable percentage found in this pass\'s own search.' } },
  { id:'EN', name:'Bone', color:cssVar('--violet'), pos3d:{x:1.15,y:-1.25,z:0.45},
    branch:{ gene:'BRCA1/2-mediated HRR deficiency', class:'driver', ccf:'~22% of PACC (Kryklyva et al., 2019)', note:'Same finding as at Peritoneum. Bone is a real, named minor metastatic site (Farhoud et al., 2026: "Less common metastatic sites include lung, peritoneum, bone, skin, and brain") with no citable percentage found in this pass\'s own search.' } },
];
// Private pool — checked against BRAF/RAF1 and BRCA1/2 for a same-tumor conflict: none reported
// in either direction in this pass's own search. GNAS and NF1, both real candidates the task
// brief's own research flagged, are deliberately EXCLUDED, checked-not-included rather than
// silently omitted: GNAS (5–9%, Jiao/Chmielecki) sits in the same alternative-KRAS-wild-type-
// driver space this atlas's own PDAC entry excludes BRAF/GNAS/CTNNB1 from for a related but not
// identical reason, and no source found in this pass states how it relates to the BRAF/RAF1 or
// BRCA1/2 events already modeled; NF1 was reported only in one source, bucketed together with
// RB1 as "NF1 and RB1: 28%" with no individual figure resolvable (Balachandran Pillai et al.,
// 2024) — real, but not independently resolved.
const PRIVATE_POOL_PACC = [
  { gene:'MYC amplification', class:'driver', ccf:'17% of PACC (Bergmann et al., Virchows Arch, 2014, N=57)', note:'A real, independently citable frequency for this gene in PACC specifically — unlike this organ\'s own PDAC entry, which excludes MYC amplification entirely for lacking any citable percentage (TCGA names it without one). The same gene, a genuinely different sourcing outcome in a different entity.' },
  { gene:'RB1 loss', class:'driver', ccf:'13% of PACC (3/23, Jiao et al., 2014)', note:'A cell-cycle checkpoint gene, independently confirmed in a second cohort (Chmielecki et al., 2014) — real and recurrent; this pass\'s own search found no conflict against the branch genes above.' },
  { gene:'ARID1A mutation', class:'driver', ccf:'9% of PACC (2/23, Jiao et al., 2014)', note:'A SWI/SNF chromatin-remodeling gene, the same broad chromatin-remodeling vulnerability this atlas has already found in several other cancers (Liver, Ovary, Skin, Bladder), here in its own acinar-cell-carcinoma-specific cohort.' },
  { gene:'MSI-H / mismatch-repair deficiency', class:'driver', ccf:'5–14% of PACC across independent cohorts (Bergmann et al., 2014: 5%; Liu et al., Pancreas, 2014, PMID 25058881; Calimano-Ramirez et al., 2022: "7% to 14%")', note:'A distinct DNA-repair mechanism from the BRCA1/2-mediated homologous-recombination deficiency modeled as a branch gene above — mismatch-repair loss, not homologous-recombination loss — and clinically actionable (immunotherapy-eligible) on its own separate basis.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];

// HISTOLOGY — real, well-converged, primary-source-confirmed architecture: acinar and solid
// growth patterns (each the predominant pattern in 30–50% of cases), abundant granular
// eosinophilic cytoplasm packed with zymogen granules, and round-to-oval, often basally-oriented
// nuclei with a single prominent nucleolus (Farhoud et al., Cancers, 2026, PMID 42512378, PMCID
// PMC13406766; La Rosa et al., Front Med, 2015, PMID 26137463, PMCID PMC4469112). Trypsin
// positivity (~95–100%) is the real, most-cited IHC confirmation; chymotrypsin is also frequently
// positive but at a genuinely lower, separately-measured rate (38%, Klimstra et al., Am J Surg
// Pathol, 1992, PMID 1384374 — corrected 2026-09-13: an earlier draft bundled both markers into
// one "~95%" figure, which an independent citation-verification pass found overstates
// chymotrypsin specifically by a wide margin against the one source that actually quantifies it).
// The WHO diagnostic
// threshold for mixed acinar-neuroendocrine carcinoma (>30% neuroendocrine component) is
// confirmed directly here via La Rosa et al.'s own citation of the WHO source (Rindi et al., WHO
// Classification of Tumours of the Digestive System, IARC, 2010) — NOT via a "Toll, Holen &
// Klimstra, Korean J Pathol, 2013" citation this pass's own research initially surfaced, which
// this authoring pass independently checked and could not resolve to any real paper in either
// PubMed or Europe PMC (zero hits both ways) and therefore does not use. Reuses drawCell as its
// base primitive (the same cell-drawing vocabulary every generator in this file uses), with a
// small granule-dot overlay added for the zymogen granules — the one genuinely new visual touch,
// since no existing primitive in this file depicts granular cytoplasm.
const HISTOLOGY_PACC = {
  intro: 'Acinar cell carcinoma is built from cells trying to look like the normal acinar cells that make the pancreas\'s digestive enzymes: abundant granular, eosinophilic cytoplasm — packed with zymogen granules, the same secretory granules normal acinar cells use — surrounding a round-to-oval nucleus that sits, just as it does normally, toward the base of the cell, with a single prominent nucleolus. The cells arrange into solid sheets or acinar (gland-like) clusters, the two predominant real architectural patterns, each accounting for roughly a third to half of cases.',
  ariaSummary: 'Stylized microscopic field: sheets and small rounded clusters of polygonal cells with abundant granular pink cytoplasm, dotted with small darker granules. Each cell\'s nucleus sits toward one edge, round to oval, with a single small dark nucleolus visible inside it.',
  citation: 'Farhoud et al., Cancers, 2026, PMID 42512378; La Rosa et al., Front Med, 2015, PMID 26137463.',
  features: [
    { key:'granules', label:'Zymogen granules',
      text:'Abundant, coarsely granular eosinophilic cytoplasm — the secretory granules normal acinar cells use to store digestive enzymes before release, carried over into this cancer\'s own cells and confirmed by trypsin immunostaining in about 95–100% of cases (chymotrypsin is also frequently positive, though at a lower, separately-measured 38% in the one source that quantifies it).' },
    { key:'nuclei', label:'Basally-oriented nuclei',
      text:'Round-to-oval nuclei with mild to moderate atypia and a single prominent nucleolus, typically sitting toward the base of the cell — the same polarized arrangement normal acinar cells show, retained here despite malignant transformation.' },
    { key:'acinar', label:'Acinar/solid architecture',
      text:'Cells arranged into solid sheets or small rounded, gland-like acinar clusters — the two predominant real patterns, each the dominant architecture in roughly 30–50% of cases; less often, glandular, trabecular, or cystic patterns appear instead.' },
  ],
};

// ============================================================
// INVASIVE CARCINOMA ARISING IN IPMN (pcyst) — 2026-09-13, ordinary-organ batch. Every citation
// verified directly at the source. Modeled specifically as invasive carcinoma clonally arising
// from IPMN (intraductal papillary mucinous neoplasm) — the Baltimore Consensus's own
// "associated" invasive carcinoma, distinct from an independently-arising ("concomitant") PDAC
// that merely sits near an unrelated IPMN (Basturk et al., Am J Surg Pathol, 2015, PMID
// 26559377, PMCID PMC4646710) — not mucinous cystic neoplasm (MCN) or serous cystadenocarcinoma,
// a deliberate entity choice made before this pass began.
//
// TRUNK — a real CO-TRUNK, the same two-entry architecture this atlas's Brain/GBM (IDH-wildtype
// status + TERT) and Bladder/urothelial carcinoma (TERT + pathway-divergence status) entries
// already use: GNAS mutation and KRAS mutation, both temporally truncal (neither rises with
// grade — Tan et al., J Am Coll Surg, 2015, PMID 25840541, PMCID PMC4409519: mutation prevalence
// across low-grade/high-grade/invasive tiers "suggest[s] that mutations in these genes occur
// early in IPMN carcinogenesis"), and explicitly NOT mutually exclusive: "51% harbored both GNAS
// and KRAS mutations, whereas at least one of the two genes was mutated in 96.2%" (Wu et al.,
// Sci Transl Med, 2011, PMID 21775669, PMCID PMC3160649, N=132). GNAS carries real diagnostic-
// classifier weight the way GBM's IDH-wildtype status does: it is genuinely near-absent from
// conventional PDAC (confined to just 2% of the whole PDAC cohort, 3/150, entirely within the
// rare KRAS-wild-type minority — TCGA/Raphael et al., Cancer Cell, 2017, already cited in this
// organ's own PDAC entry) and from every other pancreatic cystic-neoplasm type tested (absent in
// 44 serous cystadenomas, 21 MCNs, and 5 IOPNs, all P<0.001–0.005 vs. IPMN — same Wu et al. 2011
// source), independently confirmed by the Baltimore Consensus itself: "GNAS mutations typically
// occur in IPMNs... whereas they are very rarely encountered in PanIN lesions" (the precursor to
// conventional PDAC).
const TRUNK_PCYST = [
  { gene:'GNAS mutation', class:'driver', ccf:'66% of IPMN overall (Wu et al., Sci Transl Med, 2011, N=132) — independently corroborated at 48–79% across further cohorts (48%, Kuboki et al., Pancreas, 2015, N=172; 79%, Amato et al., J Pathol, 2014, N=48)', note:'A real diagnostic-classifier gene, the same role this atlas\'s own GBM entry gives IDH-wildtype status: GNAS mutation is genuinely near-specific to IPMN, confined to just 2% of conventional PDAC (3/150, entirely within the rare KRAS-wild-type minority). Wu et al. (2011) also tested it directly in 44 serous cystadenomas, 21 MCNs, and 5 IOPNs and found it in none of them (all P<0.001–0.005 vs. IPMN). Not mutually exclusive with KRAS — the two co-occur in about half of IPMNs. This cancer is also found at a genuinely earlier extent than this organ\'s own PDAC: only 5.9% present with distant (M1) disease at diagnosis, against PDAC\'s own 41.2%, and clinical nodal involvement (N1) is 15.7% (Ziogas et al., Cancers, 2023, PMID 36831527, PMCID PMC9953895, N=101,190 combined US NCDB cohort) — a real, favorable extent difference not modeled on this atlas\'s formal extent axis, since the source reports these as separate clinical M/N-stage marginals rather than a joint SEER Combined Summary Stage breakdown that axis otherwise uses (an earlier draft additionally claimed "more than 90% are diagnosed at a localized stage" from this same source — a fabricated quote that also failed its own arithmetic, caught by an independent citation-verification pass and removed).' },
  { gene:'KRAS mutation', class:'driver', ccf:'81% of IPMN overall (Wu et al., 2011) — corroborated at 50–56% across further cohorts (56%, Kuboki et al., 2015; 50%, Amato et al., 2014)', note:'The same gene truncal in this organ\'s own PDAC entry, but here co-truncal alongside GNAS rather than alone — together the two genes account for at least one mutation in 96.2% of IPMNs. Neither gene\'s mutation frequency rises with histologic grade, the signature of an early, truncal event rather than a late, invasion-driving one.' },
];
// Branch pair — TP53 and SMAD4, both real invasion-associated markers verified directly from a
// grade-stratified IHC/sequencing cohort (Amato et al., J Pathol, 2014, PMID 24604757, PMCID
// PMC4057302, N=53 lesions including 17 invasive carcinomas): TP53 mutation "only observed in
// high-grade IPMNs" (0/20 low+intermediate grade vs a real minority of high-grade+invasive
// lesions); SMAD4/Dpc4 loss in "5/17 (29%) invasive carcinomas" against essentially none of the
// 34 non-invasive lesions examined (one intestinal-type IPMN only, ~3%). Independently
// corroborated: Kuboki et al. (Pancreas, 2015, N=172) found "significant associations... between
// invasive phenotypes and... SMAD4 loss." Both genes are also this organ's own PDAC branch
// genes — the same real, disclosed mechanism (late-tier tumor-suppressor loss driving invasion)
// recurring in a genetically distinct precursor pathway, not a coincidence papered over.
const REGIONS_PCYST = [
  // Site model — a genuine, disclosed cross-study finding: invasive-IPMN-derived carcinoma has
  // REAL, ELEVATED LUNG TROPISM relative to this organ's own conventional PDAC, confirmed
  // independently by two dedicated recurrence-pattern studies, both measuring POST-RESECTION
  // recurrence in a non-metastatic-at-resection cohort — a genuinely different population/timing
  // than PDAC's own Oweira et al. source (stage-IV-at-diagnosis presentation), disclosed rather
  // than blended: Abdalla et al. (Cancers, 2024, PMID 38893136, PMCID PMC11171342, N=217 invasive
  // IPMN, German ADT registries) and Capretti et al. (Pancreatology, 2022, PMID 35701318, N=43,
  // single-institution Italy) — both figures given per site below rather than averaged, since
  // they are two real, differently-sized, independently-collected cohorts.
  { id:'FE', name:'Liver', color:cssVar('--coral'), pos3d:{x:-1.3,y:0.95,z:0.35},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'a real minority of high-grade and invasive IPMN lesions (Amato et al., 2014); independently, invasive-phenotype/SMAD4-loss/nuclear-β-catenin associations were found in a larger cohort (Kuboki et al., Pancreas, 2015, N=172)', note:'Liver is this cancer\'s most commonly reported metastatic site in both dedicated recurrence studies: 42% of metachronous single-site recurrences (Abdalla et al., 2024) and 28.6% of first recurrences (Capretti et al., 2022) — roughly comparable to this organ\'s own PDAC liver rate in both studies, unlike Lung below.' } },
  { id:'FG', name:'Lung', color:cssVar('--azure'), pos3d:{x:-0.95,y:-1.35,z:0.25},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'same finding as at Liver (Amato et al., 2014)', note:'Lung shows a real, striking, cross-study-confirmed ELEVATED rate relative to this organ\'s own conventional PDAC: 26% of metachronous recurrences here vs. 14% in PDAC in the same registry (Abdalla et al., 2024), and 38.5% vs. 13.1% in a second, independent cohort (Capretti et al., 2022, p=0.027) — a real, distinctive site-tropism difference between the two entities this organ hosts.' } },
  { id:'FH', name:'Peritoneum', color:cssVar('--amber'), pos3d:{x:1.45,y:0.8,z:-0.25},
    branch:{ gene:'SMAD4 loss', class:'driver', ccf:'29% of invasive IPMN carcinomas (5/17, Amato et al., 2014) vs. ~3% of non-invasive IPMN lesions (1/34, same source)', note:'The same TGF-β pathway tumor suppressor this organ\'s own PDAC entry carries at two sites, here specifically associated with the transition to invasion rather than modeled as an early event. Peritoneum: 12% of metachronous recurrences here vs. 18% in PDAC in the same registry (Abdalla et al., 2024) — a real, lower rate than this organ\'s own conventional PDAC.' } },
  { id:'FI', name:'Distant lymph nodes', color:cssVar('--violet'), pos3d:{x:1.15,y:-1.25,z:0.45},
    branch:{ gene:'SMAD4 loss', class:'driver', ccf:'same finding as at Peritoneum (Amato et al., 2014)', note:'A different population/timing than the three sites above, disclosed rather than blended: 34% nodal involvement AT RESECTION (not a distant-metastasis-at-diagnosis rate) vs. 64% for this organ\'s own conventional PDAC in the same single-institution cohort (Mino-Kenudson et al., Gut, 2011, PMID 21508421, PMCID PMC3806085, N=61 invasive IPMN vs. 570 PDAC) — real and lower, consistent with this cancer\'s genuinely more indolent behavior.' } },
];
// Private pool — checked against GNAS/KRAS/TP53/SMAD4 for a same-tumor conflict: none reported.
// A real, disclosed cross-entity mechanistic CONTRAST, not smoothed over: BRAF is explicitly
// EXCLUDED from this organ's own PDAC private pool as an alternative driver COMPETING with a
// KRAS-only trunk in the rare KRAS-wild-type minority (TCGA/Raphael et al., 2017) — but here,
// alongside a GNAS+KRAS co-trunk, BRAF instead COOPERATES: Amato et al. (2014) found their own
// three BRAF-mutant cases (3/52, 6%) cooperating with GNAS and/or KRAS mutation with ZERO
// exceptions, confined to high-grade lesions specifically — CORRECTED 2026-09-13: an earlier
// draft attached Amato's own "with the exception of two IPMNs" clause to BRAF specifically, but
// an independent citation-verification pass traced that clause to a DIFFERENT, broader sentence
// covering all of the paper's low-frequency mutated genes collectively, whose two actual named
// exceptions are an FGFR3-only case and a TP53-only case — neither a BRAF case. BRAF's own real
// cooperation rate is perfect (3/3), not "all but two." Same gene, opposite real mechanistic role
// in two sibling
// entities of one organ — checked individually rather than assumed to transfer, the same
// discipline data rule 4 already establishes for this atlas's kidney/ccRCC entry. CTNNB1 was
// checked and EXCLUDED: it is the defining, near-universal driver of a DIFFERENT pancreatic
// cystic neoplasm entirely — solid pseudopapillary neoplasm (SPN) "always contained mutations of
// CTNNB1", Wu et al., PNAS, 2011, PMID 22158988, PMCID PMC3248495 — the same borrowing-another-
// entity's-defining-marker risk this atlas's own GBM/ATRX exclusion already establishes, even
// though a real, independent IPMN-specific nuclear-β-catenin/invasion association was also found
// (Kuboki et al., 2015); not used here given the real available alternatives below.
const PRIVATE_POOL_PCYST = [
  { gene:'RNF43 inactivation', class:'driver', ccf:'14% of IPMN (Amato et al., 2014); the ORIGINAL discovery cohort found it in 6 of 8 IPMNs tested (Wu et al., PNAS, 2011, PMID 22158988, PMCID PMC3248495 — the paper that first established RNF43 as a real pancreatic-cystic-neoplasm suppressor gene)', note:'The same Wnt-pathway brake this organ\'s own PDAC entry carries in its private pool (10%, Waddell et al., 2015) — a real, independently-sourced, differently-frequent finding in a genetically distinct precursor pathway, not a duplicated claim.' },
  { gene:'BRAF mutation', class:'driver', ccf:'6% of IPMN (3/52, Amato et al., 2014), confined to high-grade lesions and found cooperating with, not competing against, GNAS/KRAS mutation in all 3 cases — zero exceptions', note:'A real, disclosed mechanistic contrast with this same organ\'s PDAC entry, which explicitly excludes BRAF as a competing alternative-trunk driver: here, alongside a GNAS+KRAS co-trunk rather than a KRAS-only one, BRAF cooperates instead of competing — checked directly for this entity rather than assumed to inherit PDAC\'s own exclusion.' },
  { gene:'CDKN2A (p16) loss', class:'driver', ccf:'53% of invasive IPMN carcinomas (9/17, Amato et al., 2014) — rising with grade from 0% (low-grade) through 23% (intermediate-grade) and 31% (high-grade)', note:'The same cell-cycle checkpoint gene this organ\'s own PDAC entry carries as an early-to-intermediate-tier event — here instead rising steadily with grade and reaching its highest rate specifically in the invasive component, a real, differently-timed pattern in this genetically distinct precursor pathway.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];

// HISTOLOGY — colloid carcinoma, the invasive pattern arising from intestinal-type IPMN and
// carrying real, quoted diagnostic criteria (Tan et al., 2015, verbatim: "classified as colloid
// if more than 80% of the invasive component consisted of extensive stromal pools of acellular
// mucin either lined by neoplastic epithelial cells or containing floating neoplastic epithelial
// cells") and a genuinely better real prognosis ("five-year survival rates of almost 75%",
// same source) — drawn in preference to the more common tubular pattern (62% of invasive IPMN
// carcinomas, Mino-Kenudson et al., 2011) because tubular's own defining architecture — Tan et
// al.'s own words, not Mino-Kenudson's, disambiguated here after an independent citation-
// verification pass found the original placement let a reader assume the wrong source: "neoplastic
// cells arranged in small tubular glands with an infiltrative desmoplastic stroma" — would
// visually duplicate this organ's own PDAC slide; tubular and a third, rarer, most-
// indolent oncocytic pattern (12%, same source) are named in text rather than drawn, the "name
// more than is drawn" treatment this atlas already gives LUAD's own undrawn growth patterns.
// Reuses drawGlandRing and blobPath, the same primitive vocabulary Bladder/adenocarcinoma's own
// mucin-pool technique already uses, but recomposed at a genuinely different scale and role:
// there, small mucin pools sit beside glands as a secondary feature; here, LARGE mucin pools
// dominate the field and carry small floating epithelial cell clusters INSIDE them — colloid
// carcinoma's own defining architecture, not a duplicate of that entity's minor finding.
const HISTOLOGY_PCYST = {
  intro: 'Colloid carcinoma — the most favorable of the three real invasive patterns that can arise from IPMN — is dominated by extensive pools of pale, acellular mucin, more than 80% of the tumor by definition. Within those mucin pools, clusters of malignant epithelial cells either line the pool\'s edge or float free inside it. The more common tubular pattern (about 62% of cases) looks instead like ordinary ductal adenocarcinoma, with small infiltrative glands in a desmoplastic stroma — this organ\'s own PDAC slide, arising here from a genetically distinct precursor; a third, rarer oncocytic pattern (about 12%) is the most indolent of the three.',
  ariaSummary: 'Stylized microscopic field dominated by large, pale blue-gray pools of acellular mucin filling most of the frame. Small clusters of malignant epithelial cells are visible floating freely inside the mucin pools, and a thin rim of similar cells lines part of one pool\'s edge.',
  citation: 'Tan et al., J Am Coll Surg, 2015, PMID 25840541; Mino-Kenudson et al., Gut, 2011, PMID 21508421.',
  features: [
    { key:'mucinpools', label:'Extensive mucin pools',
      text:'Pale, acellular mucin filling more than 80% of the invasive tumor by definition — the feature that gives this pattern its name and its real, favorable prognosis (roughly 75% five-year survival, well above the tubular pattern\'s 20–40%).' },
    { key:'floating', label:'Floating epithelial clusters',
      text:'Small clusters of malignant epithelial cells suspended freely within the mucin pools, rather than forming the continuous glandular sheets ordinary ductal adenocarcinoma shows — a real, distinctive architecture, not a processing artifact.' },
    { key:'lining', label:'Pool-lining epithelium',
      text:'Elsewhere, a thin rim of the same malignant cells lines the mucin pool\'s own edge instead of floating within it — the other real configuration this pattern\'s own diagnostic definition allows.' },
  ],
};

export const cancerDetails = {
  pdac: {
    title:'Pancreatic Ductal Adenocarcinoma', screenLabel:'Pancreatic ductal adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_PDAC, trunk:TRUNK_PDAC, privatePool:PRIVATE_POOL_PDAC,
    histology: HISTOLOGY_PDAC,
  },
  pnet: {
    title:'Pancreatic Neuroendocrine Tumor', screenLabel:'Pancreatic neuroendocrine tumor — tumor explorer',
    legendTitle:'Sites (real metastatic pattern, liver-dominant)',
    regions:REGIONS_PNET, trunk:TRUNK_PNET, privatePool:PRIVATE_POOL_PNET,
    histology: HISTOLOGY_PNET,
  },
  pacc: {
    title:'Acinar Cell Carcinoma', screenLabel:'Acinar cell carcinoma — tumor explorer',
    legendTitle:'Sites (real metastatic pattern)',
    regions:REGIONS_PACC, trunk:TRUNK_PACC, privatePool:PRIVATE_POOL_PACC,
    histology: HISTOLOGY_PACC,
  },
  pcyst: {
    title:'Invasive Carcinoma Arising in IPMN', screenLabel:'Invasive carcinoma arising in IPMN — tumor explorer',
    legendTitle:'Sites (real metastatic pattern, liver-dominant)',
    regions:REGIONS_PCYST, trunk:TRUNK_PCYST, privatePool:PRIVATE_POOL_PCYST,
    histology: HISTOLOGY_PCYST,
  },
};
