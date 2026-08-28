import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cssVar } from '../viewer.js';

// active:true, plus 'hcc' alias — checked for collision first: no other organ's aliases or
// cancer share text uses "hcc" or "hepatocellular" anywhere else in this file.
export const organEntry = { key:'liver', label:'Liver', system:'Digestive', active:true, sexes:['female','male'], aliases:['liver','hepatic','hepatocellular','hcc'] };

export const markerSpec = { points:[{heightFrac:0.60, angle:40}] };

export const cancerEntries = [
  { id:'hcc',   name:'Hepatocellular carcinoma',         share:'~75–85% of primary liver cancers', active:true,  organKey:'liver' },
  { id:'ichol', name:'Intrahepatic cholangiocarcinoma',  share:'~10–15% of primary liver cancers', active:false, organKey:'liver' },
];

// Real anatomy, not procedural: NIH 3D, "Human Reference Atlas 3D Reference Object Library"
// (account "HRA"), entry 3DPX-020973 — CC BY 4.0, same sourcing/decimation discipline as Lungs
// above. Full details in CLAUDE.md. This replaces the old unlobed sphere-blob approximation —
// the real GLB's right/left lobe division and the fissure between them (the porta hepatis
// region the Portal vein/Bile ducts points below are anchored near) are now real geometry, not
// just a stated fact in the text below.
// MATERIAL COLOR (real-tissue pass, verified before picking): the old 0x7c3f30 was already
// in the right family, checked and darkened slightly rather than assumed correct. Source:
// Johns Hopkins Medicine's liver overview and a BCcampus open-textbook description, both
// confirmed directly — the liver is "dark reddish-brown," a hue attributed specifically to its
// dual, dense blood supply (hepatic artery plus portal vein) rather than to bile or hepatocyte
// pigment itself. Liver reads darker than kidney in real gross specimens despite a similar hue
// family, so 0x6b2e22 sits darker than kidney's 0x8c3a30 above, not just a copy with a
// different label.
export function buildLiverMesh(){
  const loader = new GLTFLoader();
  return new Promise((resolve, reject)=>{
    loader.load('assets/liver.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity 0.15, NOT MeshStandardMaterial (clip-fix
      // pass): this ports the missing half of the approved material verification — the
      // Blender renders the tissue colors were verified and approved on had Specular IOR
      // Level 0.15 baked in, but MeshStandardMaterial has no specular control at all, so the
      // live app kept full-strength dielectric specular. Under the legacy hard-clip pipeline
      // that blew grazing-angle fold/fissure walls to flat white (up to 26% of the lungs'
      // on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
      // js/viewer.js's warm-lighting comment. Color/roughness values unchanged.
      const mat = new THREE.MeshPhysicalMaterial({ color:0x6b2e22, roughness:0.5, metalness:0.0, specularIntensity:0.15 });
      gltf.scene.traverse(o=>{ if(o.isMesh) o.material = mat; });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Digestive System', title:'Liver',
  sub:'Largest internal organ · four lobes · hepatocytes make up most of its mass',
  facts:[
    {label:'Location', val:'Four lobes, upper right abdomen, largely intraperitoneal'},
    {label:'Function', val:'Hepatocytes carry out most liver function and make up roughly 80% of its mass'},
    {label:'Blood supply', val:'Dual: portal vein (~75% of flow) &amp; hepatic artery (~25%)'},
  ],
  // The dual-blood-supply fact gets the same second-sentence treatment lungs' and kidneys'
  // distinguishing facts got — here the split itself is the interesting part (confirmed
  // directly: StatPearls, "Physiology, Liver," ~75% portal vein / ~25% hepatic artery), and
  // it's a genuinely different kind of "dual supply" than the lungs' — one vessel delivers
  // nutrient-rich but low-oxygen blood from the gut, the other delivers oxygen-rich blood,
  // rather than the lungs' oxygenated/deoxygenated split by direction of flow.
  desc:'The liver is the body\'s largest internal organ, divided into four lobes in the upper right abdomen. Unlike every other organ in this atlas, it receives blood from two entirely different sources at once: the portal vein, carrying nutrient-rich but oxygen-poor blood straight from the intestines (~75% of total liver blood flow), and the hepatic artery, supplying oxygen-rich blood (~25%) the way arteries do everywhere else in the body. Hepatocytes, the liver\'s main working cell type, make up roughly 80% of its total mass.',
  buildMesh: buildLiverMesh,
  // Real-world-meter GLB (bbox ~25x17x17cm) — see lungs.js for why minRadius/maxRadius are
  // rescaled here rather than left at the old ~1-unit procedural values.
  viewer:{ theta:0.5, phi:1.15, radius:0.5, minRadius:0.14, maxRadius:1.2, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a liver, a large wedge-shaped organic form, with four '
    + 'glowing teal points marking the structures listed after it. Drag to rotate, scroll to '
    + 'zoom.',
  // pos: literal anchor points (meters, local mesh space) raycast against the real
  // assets/liver.glb surface — see lungs.js for the method. Portal vein and Bile ducts are
  // anchored on opposite sides of the same real fissure (the porta hepatis, where both
  // structures genuinely enter/exit together) rather than sharing one point, so they read as
  // two distinct investigate targets.
  hotspots:[
    // Directly parallel to the ovary's surface-epithelium point, breast's ducts, lungs'
    // alveoli, and kidney's cortex: this is the "arises here" structure for this organ.
    { key:'hepatocytes', label:'Hepatocytes', pos:[-0.0628,0.0181,0.0610],
      text:'The liver\'s main working cell, making up roughly 80% of its mass and carrying out most of its metabolic, synthetic, and detoxifying functions. Hepatocellular carcinoma, the most common primary liver cancer, arises directly from these cells — directly paralleling how ovarian cancer begins in the ovary\'s surface epithelium, breast cancer in the breast\'s ducts, lung adenocarcinoma in the lung\'s alveoli, and clear cell renal cell carcinoma in the kidney\'s cortex.' },
    { key:'portal', label:'Portal vein', pos:[-0.0228,-0.0386,-0.0061],
      text:'The large vessel carrying nutrient-rich blood from the intestines into the liver, supplying roughly three-quarters of its total blood flow. HCC has a well-documented tendency to invade directly into this vessel (portal vein tumor thrombosis) — a route of local spread distinct from the spiculated distant-metastasis sites modeled in the tumor explorer below.' },
    // Deliberate contrast point, not another "arises here" — the other primary liver cancer
    // modeled in this atlas (intrahepatic cholangiocarcinoma, currently "profile coming
    // soon") starts here instead of in hepatocytes, the same way this atlas already contrasts
    // ductal vs lobular breast cancer origin at the breast's own hotspots.
    { key:'bileducts', label:'Bile ducts', pos:[0.0393,0.0144,0.0174],
      text:'The channels carrying bile, made by hepatocytes, out of the liver toward the gallbladder and intestine. Intrahepatic cholangiocarcinoma — the other real primary liver cancer this atlas lists, not yet wired up — arises from the cells lining these ducts instead of from hepatocytes.' },
    { key:'capsule', label:'Hepatic capsule', pos:[-0.0009,0.0768,0.0276],
      text:'Glisson\'s capsule — the thin fibrous membrane covering the liver\'s outer surface, richly supplied with pain-sensing nerves that a healthy liver\'s own tissue lacks, which is why liver disease is often painless until the capsule itself is stretched or irritated.' },
  ],
};

// CROSS-CHECK PASS (post-hoc, before committing this organ): two figures below were each
// anchoring multiple data points, so each was checked against independent cohorts rather than
// taken as a single universal constant, the same "verify, don't assume representative" standard
// as every prior correction in this file.
// - TERT 59% (Nault et al., 2013) is a real, precise figure — but from one cohort: N=305,
//   surgically resected at two FRENCH hospitals, etiology mix skewed toward alcohol (39%) over
//   HBV (22%) or HCV (26%), detected by direct Sanger sequencing. Checked it against four other
//   real, independently-confirmed cohorts rather than assuming it generalizes: Schulze et al.
//   (Nature Genetics, 2015, also French) found ~60%; TCGA (Nature, 2017, mixed US cohort, N=196)
//   found 44% (87/196); an HBV-dominant Asian cohort (Aizimuaji et al., World Journal of
//   Gastrointestinal Oncology, 2025, N=66) found only 39.4% (Sanger) to 45.5% (digital PCR). This
//   spread (~39–61%) is consistent with Nault's *own* etiology finding — HCV-related HCC in their
//   cohort had far higher TERT-mutation rates than HBV-related (72% vs 39%, computed from their
//   raw counts) — so a France-specific, alcohol/HCV-skewed cohort running high, and an
//   HBV-dominant cohort running low, is exactly what the biology predicts, not an unexplained
//   discrepancy. Kept Nault's 59% as the headline figure (it's real, precise, and the same paper
//   that supplies the temporal/preneoplastic-nodule finding this trunk note depends on) but the
//   ccf string and note now both state the real range explicitly, the same "note real
//   variability, don't present one number as universal" treatment LUAD's KRAS (~30–37%) and
//   ccRCC's VHL figures already use, rather than silently keeping one cohort's number unqualified.
//   A separately-suggested ~49% pooled meta-analysis figure (from a >4,000-case multi-source
//   review) could not be located after eight distinct searches across Europe PMC, Crossref, and
//   Semantic Scholar (rate-limited) — noted honestly rather than fabricating a citation for it;
//   the four independently-confirmed cohorts above already establish the real variability that
//   figure would have illustrated, even without pinning its exact source.
// - Site frequencies (Katyal et al., 2000: lung 55%, lymph nodes 41%, bone 28%) are from a
//   single-institution (Pittsburgh), CT-imaging-based, ~1990s retrospective cohort (N=403, 148
//   with extrahepatic disease) — over two decades old, checked against a larger, more recent,
//   population-based study before treating it as current best evidence. Found one: Zhuang et al.
//   (Translational Cancer Research, 2025, SEER, N=2,197, 2010–2015) restricts to patients with a
//   *single* metastatic site (a different denominator than Katyal's "any site among all
//   extrahepatic-met patients") and found lung 51% — closely corroborating Katyal's 55% across 25
//   years and two different methodologies — but bone 43%, notably higher than Katyal's 28%. Kept
//   Katyal as the primary source (still the only dedicated all-sites distribution study with real
//   lymph-node data, which Zhuang's study doesn't cover at all), but the Lung/Bone branch notes
//   below now state the corroboration and the discrepancy explicitly rather than presenting
//   Katyal's 25-year-old single-institution numbers as uncontested.
//
// TEMPORAL trunk justification — genuinely different from every prior organ's SPATIAL one.
// HGSOC/TNBC/ccRCC's trunk genes are truncal because they're present in every region sampled
// at one point in time (spatial ubiquity — Gerlinger et al. found VHL "mutated ubiquitously in
// all analyzed regions," the model every trunk note before this one has used). TERT promoter
// mutation is truncal for a different reason entirely: Nault et al. (Nature Communications,
// 2013) found it in 5/20 (25%) of cirrhotic macronodules — premalignant lesions that have not
// become HCC yet — calling it "the earliest recurrent genetic event identified in cirrhotic
// preneoplastic lesions so far." Schulze et al. (Nature Genetics, 2015) directly confirmed the
// temporal ordering against the two branch genes below: "Although TERT promoter mutations were
// already frequent at early stages, CTNNB1 and TP53 mutation frequencies increased
// significantly with progression." TERT is trunk because it comes FIRST in time, not because
// it's everywhere in space at any one time — don't reuse the "present in every region" language
// from prior trunk notes here, since that's not actually what makes TERT this cancer's trunk.
//
// TWO PHENOTYPE-DEFINING BRANCH GENES, not four independent ones — a third mutation-framing
// model, distinct from both Lung's *competing* drivers (data rule 3) and Kidney's *cooperating*
// ones (data rule 4). TP53 and CTNNB1 are described as "largely considered to occur in a
// mutually exclusive manner" (Friemel et al., BMC Clinical Pathology, 2016, citing the
// foundational two-pathway paper, Laurent-Puig et al., Gastroenterology, 2001: HCC divides into
// a chromosomally-stable, CTNNB1/Wnt-driven group and a chromosomally-unstable, TP53-driven
// group) — Meng et al. (European Journal of Cancer Prevention, 2025) found the same "trend of
// mutually exclusive mutation" directly (TP53 33.0%, CTNNB1 34.0%, N=291). But Friemel et al.
// (2016) is itself a case report of the documented exception, confirmed directly rather than
// taken on trust: a mixed hepatocellular/cholangiocellular carcinoma where "a p.D32V mutation in
// exon 3 of the CTNNB1 gene occurred concomitantly with a TP53 intron 7/exon 8 splice site
// mutation" in the same tumor's hepatocellular component, with the authors stating outright that
// "Intratumor heterogeneity challenges the concept of CTNNB1 and TP53 gene mutations being
// mutually exclusive molecular classifiers in HCC." Both the rule and the exception are wired
// into the TP53/CTNNB1 branch notes below, not left in this comment alone — the task asked for
// the "why intratumor heterogeneity matters" theme to be explicit in-product, the same way
// ccRCC's convergent-evolution finding was wired into SETD2/KDM5C/PTEN's notes rather than
// staying a dev-only comment.
//
// AXIN1 was checked and deliberately EXCLUDED from this organ's private pool, not just left
// out by omission — the task's own suggested gene list included it, but Guichard et al. (Nature
// Genetics, 2012) states directly that "CTNNB1, AXIN1 and APC gene alterations were mutually
// exclusive (only one HCC was mutated for both CTNNB1 and AXIN1)": AXIN1 is an *alternative*
// route to the same Wnt/β-catenin activation CTNNB1 mutation already provides, not a cooperating
// event. Because CTNNB1 mutation is already one of this cancer's two branch genes below, and the
// private pool draws onto cells regardless of which site/branch they belong to, adding AXIN1 to
// that shared pool would let it appear alongside a CTNNB1-branch cell — misrepresenting the same
// real biology the ESR1/MDM4 (data rule 1) and SMAD4/PTEN (data rule 3) corrections exist to
// prevent, just caught before shipping instead of after. ARID1A, ARID2, and NFE2L2 were each
// checked individually rather than assumed safe as a group: Guichard et al. (2012) found ARID1A
// "significantly more frequent in HCC related to alcohol intake" with "a significant association
// with CTNNB1 mutations" (cooperating), and "6 out of 8 NFE2L2 mutated HCC were also mutated for
// CTNNB1 (P=0.015)" (cooperating); independent, more recent work (multiomics analyses of
// CTNNB1-ARID2 co-mutation patterns) confirms ARID2 cooperates with CTNNB1 the same way. None of
// the three compete with CTNNB1, TP53, or TERT — safe to include in a pool shared across every
// site regardless of that site's branch gene.
const REGIONS_HCC = [
  { id:'PU', name:'Lung', color:cssVar('--coral'), pos3d:{x:-0.2,y:1.3,z:0.25},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'20.8% of HCC (Guichard et al., Nature Genetics, 2012)', note:'Disables the genome-stability tumor suppressor — the chromosomally-unstable, HBV-associated branch of HCC\'s two-pathway split, "largely considered to occur in a mutually exclusive manner" with CTNNB1 mutation (Friemel et al., BMC Clinical Pathology, 2016, citing Laurent-Puig et al., Gastroenterology, 2001). That "largely" is doing real work: Friemel et al. (2016) is itself a case report finding both a CTNNB1 mutation and a TP53 mutation together in one heterogeneous tumor, stating plainly that "intratumor heterogeneity challenges the concept of CTNNB1 and TP53 gene mutations being mutually exclusive molecular classifiers in HCC." The general rule and its documented exception are both real. Lung is HCC\'s single most common metastatic site — 55% of extrahepatic-met patients (Katyal et al., Radiology, 2000), closely corroborated 25 years later by a larger SEER cohort (51%, Zhuang et al., Translational Cancer Research, 2025).' } },
  { id:'OS', name:'Bone', color:cssVar('--azure'), pos3d:{x:-1.3,y:-0.6,z:0.3},
    branch:{ gene:'CTNNB1 mutation', class:'driver', ccf:'32.8% of HCC (Guichard et al., Nature Genetics, 2012)', note:'Activates Wnt/β-catenin signaling directly — the chromosomally-stable, alcohol-associated branch of HCC\'s two-pathway split (Laurent-Puig et al., Gastroenterology, 2001), "largely considered" mutually exclusive with TP53 mutation, though not absolutely: see the Lung site\'s note for the documented single-tumor exception (Friemel et al., BMC Clinical Pathology, 2016) that keeps this from being an unqualified rule. Bone metastasis frequency varies by study: 28% of extrahepatic-met patients (Katyal et al., Radiology, 2000) versus 43% in a larger, more recent SEER cohort restricted to single-site metastases (Zhuang et al., Translational Cancer Research, 2025) — a real discrepancy, not a rounding difference, likely reflecting the two studies\' different denominators rather than one being simply wrong.' } },
  { id:'LN', name:'Lymph nodes', color:cssVar('--amber'), pos3d:{x:1.2,y:0.5,z:-0.4},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'20.8% of HCC (Guichard et al., Nature Genetics, 2012)', note:'The same chromosomally-unstable branch gene as the Lung site above — real lymph node involvement is one of the three most common sites of extrahepatic HCC spread (41%, Katyal et al., Radiology, 2000), though unlike Lung and Bone this figure has no independent, more recent population-based study to corroborate or revise it — the most recent large SEER analysis found for this organ (Zhuang et al., 2025) did not include lymph nodes as a studied site at all.' } },
  { id:'AG', name:'Adrenal gland', color:cssVar('--violet'), pos3d:{x:0.3,y:-1.3,z:0.3},
    branch:{ gene:'CTNNB1 mutation', class:'driver', ccf:'32.8% of HCC (Guichard et al., Nature Genetics, 2012)', note:'The same chromosomally-stable, Wnt-driven branch gene as the Bone site above. Adrenal metastasis from HCC is a real, clinically-recognized event — treated in dedicated case series (adrenalectomy and radiotherapy cohorts) — though no clean population-level frequency was found to cite here, the same honesty precedent LUAD\'s adrenal gland and ccRCC\'s liver/brain sites already use.' } },
];
const TRUNK_HCC = [
  { gene:'TERT promoter mutation', class:'driver', ccf:'59% of HCC in a French surgical cohort (179/305, Nault et al., Nature Communications, 2013) — real cohorts range roughly 39–61% depending on population, not a single universal figure — truncal here for a temporal reason, not a spatial one like every other trunk mutation in this atlas: it comes first in time, not everywhere at once in space', note:'Reactivates telomerase, letting cells bypass the normal limit on how many times they can divide. Detected in 25% of cirrhotic macronodules — premalignant lesions that have not become cancer yet — making it the earliest known genetic event in this disease\'s progression, before TP53 or CTNNB1 mutation rates rise. More common in HCV-related HCC (72% of HCV-positive patients in this cohort had it) than HBV-related HCC (39% of HBV-positive patients), computed directly from Nault et al.\'s own published patient counts rather than taken from a secondhand percentage — and that same etiology split shows up across cohorts: an HBV-dominant Asian cohort (Aizimuaji et al., World Journal of Gastrointestinal Oncology, 2025) found only 39–45% overall, while other French cohorts (Schulze et al., Nature Genetics, 2015) and a mixed TCGA cohort (Nature, 2017, 44%) span the range in between. 59% is a real, precise figure from one well-described cohort, not a global constant.' },
];
const PRIVATE_POOL_HCC = [
  { gene:'ARID1A mutation', class:'driver', ccf:'16.8% of HCC (Guichard et al., Nature Genetics, 2012)', note:'Disrupts SWI/SNF chromatin remodeling — significantly associated with CTNNB1 mutation and alcohol-related HCC specifically (Guichard et al., 2012), cooperating with this cancer\'s Wnt-driven branch rather than competing with it.' },
  { gene:'ARID2 mutation', class:'driver', ccf:'5.6% of HCC (Guichard et al., Nature Genetics, 2012)', note:'Another SWI/SNF chromatin-remodeling gene, independently confirmed to co-occur with CTNNB1 mutation in HCC rather than substitute for it — the same "cooperating, not competing" relationship ARID1A has with this cancer\'s Wnt-driven branch.' },
  { gene:'NFE2L2 mutation', class:'driver', ccf:'6.4% of HCC (Guichard et al., Nature Genetics, 2012)', note:'Activates the oxidative-stress-response pathway. 6 of 8 NFE2L2-mutated HCC in this same cohort were also CTNNB1-mutated (P=0.015, Guichard et al., 2012) — real co-occurrence, not a coincidence of two common genes, and another route that cooperates with the Wnt-driven branch rather than replacing it.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly at the source, and this
// one REJECTED the task prompt's own numbers rather than trusting them): the suggested
// "trabecular ~70% / solid ~20% / pseudoglandular ~10% / macrotrabecular ~1%" frequencies
// could not be confirmed anywhere real, and the ordering is actively contradicted —
// PathologyOutlines lists the "4 principal growth patterns (in decreasing order of
// frequency)" as trabecular, PSEUDOGLANDULAR, solid, macrotrabecular, i.e. pseudoglandular
// above solid, with no percentages at all. The citable frequency facts are: trabecular is
// the most common pattern (PathologyOutlines; Acad Pathol, 2024, PMID 38433777), "50% of
// cases have mixed patterns" (PathologyOutlines — the same heterogeneity honesty LUAD's
// block carries), and the macrotrabecular-massive subtype was 12% of Ziol et al.'s cohort
// (Hepatology, 2018: "16% of surgically resected samples, 8.5% of liver biopsy samples,"
// defined by >50% macrotrabecular architecture "more than six cells thick," and "an
// independent predictor of early and overall recurrence") — NOT the ~1% suggested.
// Trabecular morphology: plates >3 cells thick (PathologyOutlines' reticulin note)
// separated by "sinusoid-like blood spaces lined by a single layer of endothelial cells"
// (World J Clin Cases, 2022, PMID 35127901); "resembling normal liver tissue" per
// Schlageter et al., World J Gastroenterol, 2014.
const HISTOLOGY_HCC = {
  intro: 'Hepatocellular carcinoma grows in four principal patterns — in decreasing order of frequency: trabecular, pseudoglandular, solid and macrotrabecular — and half of all cases mix more than one. Drawn here is the most common, the trabecular pattern: a caricature of normal liver architecture, with tumor cells stacked in plates more than three cells thick, separated by sinusoid-like blood spaces lined by a single layer of flattened endothelial cells. The rare macrotrabecular-massive variant (plates more than six cells thick, ~12% of one landmark cohort) independently predicts early recurrence.',
  ariaSummary: 'Stylized microscopic field: four thick, gently curving cords of pink polygonal tumor cells run roughly horizontally across the field, each plate several cells thick with round central purple nuclei. Pale sinusoid-like spaces separate the cords, dotted with occasional small red blood cells and lined sparsely by thin, flattened, dark endothelial nuclei along the plate edges.',
  citation: 'PathologyOutlines.com, "Hepatocellular carcinoma overview"; Ziol et al., Hepatology, 2018; Acad Pathol, 2024 (PMID 38433777); World J Clin Cases, 2022.',
  features: [
    { key:'trabeculae', label:'Trabecular plates',
      text:'Tumor cells stacked in plates more than three cells thick — a thickened caricature of normal liver plates, and the most common of this cancer’s four growth patterns. When plates exceed six cells thick across most of a tumor, that is the macrotrabecular-massive variant: ~12% of a landmark cohort and an independent predictor of early recurrence.' },
    { key:'sinusoids', label:'Sinusoid-like spaces',
      text:'The blood spaces separating the plates, lined by a single layer of flattened endothelial cells — the tumor’s echo of the liver’s own sinusoidal circulation.' },
    { key:'hepatocytes', label:'Tumor hepatocytes',
      text:'Polygonal cells with round central nuclei, still recognizably hepatocyte-like — this pattern is literally described as resembling normal liver tissue, which is part of what can make well-differentiated cases diagnostically subtle.' },
  ],
};

export const cancerDetails = {
  hcc: {
    title:'Hepatocellular Carcinoma', screenLabel:'Hepatocellular carcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_HCC, trunk:TRUNK_HCC, privatePool:PRIVATE_POOL_HCC,
    histology: HISTOLOGY_HCC,
  },
};
