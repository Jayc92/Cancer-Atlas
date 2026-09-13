import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

// active:true, plus 'renal'/'ccrcc'/'clear cell' aliases. HISTORY: this comment used to argue
// "clear cell" could safely resolve to Kidneys alone because Ovary's Clear-cell carcinoma
// "isn't searchable at all" — true only while that cancer sat inactive. Since the OCCC pass
// activated it, ovary.js carries the same 'clear cell'/'clear cell carcinoma' aliases ON
// PURPOSE: a query that genuinely fits two organs shows both as a disambiguation list, and
// search.js's Enter key now only auto-navigates on a unique match. 'ccrcc', 'renal', and
// 'renal cell carcinoma' still resolve uniquely here; 'occc'/'ovarian clear cell' uniquely
// to Ovaries.
export const organEntry = { key:'kidneys', label:'Kidneys', system:'Urinary', active:true, sexes:['female','male'], aliases:['kidney','kidneys','renal','ccrcc','clear cell','clear cell carcinoma','renal cell carcinoma'] };

export const markerSpec = { points:[{heightFrac:0.53, angle:-50}, {heightFrac:0.53, angle:50}] };

// SHARE FIGURES CORRECTED 2026-09-13 (ordinary-organ batch, prcc/chrcc going active). The old
// "~15%/~5% (Li & Kaelin, 2011)" pair was an unsourced "standard NCI/WHO-style" placeholder —
// tolerable while inactive, not once these figures render on screen. Checked directly against
// four independent, modern, population-based series, all reading BELOW the traditional figures:
// papillary 9.2% (Runarsson et al., BMC Urology, 2024, PMID 38741053 — Iceland, 50-year
// nationwide, n=1,725), 11.3% (Cheville et al., Am J Surg Pathol, 2003, PMID 12717246 — Mayo
// Clinic, n=2,385), 13.3% (Odeh et al., Oncol Lett, 2023, PMID 37033104 — Netherlands, n=457);
// chromophobe 2.1% (Runarsson 2024), 2.8% (Odeh 2023), 4.3% (Cheville 2003). The most likely
// cause: WHO 2016+ has carved several new entities (TFE3/TFEB-rearranged RCC, papillary renal
// neoplasm with reverse polarity, low-grade oncocytic tumor, eosinophilic vacuolated tumor, and
// others) out of what used to be coded as papillary or chromophobe RCC — not a correction to
// either figure's original measurement, a real shift in what the category now contains. Runarsson
// 2024 is used as the anchor (the largest, most recent, purpose-built nationwide series) with the
// other two cited as the corroborating range.
export const cancerEntries = [
  // id 'ccrcc', not 'clear' — 'clear' is already taken by Ovary's Clear-cell carcinoma above.
  // Cancer names/ids are never searched (see the Kidneys ORGANS comment), so this wouldn't be
  // a functional collision either way, but a shared id would break regionCellCache/panel state
  // if a user ever had both cancer screens loaded in the same session's history.
  { id:'ccrcc', name:'Clear cell renal cell carcinoma',  share:'~75% of renal cell carcinomas (Li &amp; Kaelin, Hematol Oncol Clin North Am, 2011)', active:true, organKey:'kidneys' },
  { id:'prcc',  name:'Papillary renal cell carcinoma',   share:'~9-13% of renal cell carcinomas (Runarsson et al., BMC Urology, 2024; Cheville et al., Am J Surg Pathol, 2003; Odeh et al., Oncol Lett, 2023)', active:true, organKey:'kidneys' },
  { id:'chrcc', name:'Chromophobe renal cell carcinoma', share:'~2-4% of renal cell carcinomas (Runarsson et al., BMC Urology, 2024; Odeh et al., Oncol Lett, 2023; Cheville et al., Am J Surg Pathol, 2003)',    active:true, organKey:'kidneys' },
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
// MATERIAL/LIGHTING REALISM PASS — shared recipe (roughness x0.82, specularIntensity 0.15->0.25,
// per-vertex tissue mottle at amplitude 0.28) applied uniformly across all nine real-scan
// organs; full mechanism, clip-safety reasoning, and the transmission investigation's null
// result are in liver.js's own comment (the canonical write-up) and this pass's dated CLAUDE.md
// entry. Color unchanged (0x8c3a30 stays the verified reddish-brown tone). Seed 6.5 (organ #5
// in ORGAN_MODULES' order x1.3). Kidneys was the second-worst organ in the original clip-fix
// pass (8.6% blown-white, all four markers clustered in its medial notch) — checked with that
// history in mind, not assumed safe by analogy. The live transmission investigation this pass's
// comment above refers to was run against THIS organ's own viewer specifically (both a
// transmission:0.15 and a deliberately extreme transmission:0.7 pass, screenshotted and
// reverted before this file's own material line was ever edited for real).
export function buildKidneysMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/kidneys.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity (clip-fix pass, now 0.25 — realism-pass
      // comment above), NOT MeshStandardMaterial: this ports the missing half of the approved
      // material verification — the Blender renders the tissue colors were verified and
      // approved on had Specular IOR Level baked in, but MeshStandardMaterial has no specular
      // control at all, so the live app kept full-strength dielectric specular. Under the legacy
      // hard-clip pipeline that blew grazing-angle fold/fissure walls to flat white (up to 26% of
      // the lungs' on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
      // js/viewer.js's warm-lighting comment. Color unchanged; roughness and specularIntensity
      // both revised by the realism pass above.
      const mat = new THREE.MeshPhysicalMaterial({ color:0x8c3a30, roughness:0.45, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 6.5); } });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Urinary System', title:'Kidneys',
  sub:'Paired organs · retroperitoneal · filter ~180L of blood per day',
  facts:[
    {label:'Location', val:'Retroperitoneal — behind the peritoneum lining the abdominal cavity, not within it'},
    {label:'Function', val:'Filtration via ~1 million nephrons per kidney, ~180L blood/day'},
    {label:'Blood supply', val:'Renal arteries, direct branches of the aorta'},
  ],
  // The retroperitoneal fact is worth a second sentence because it is a real anatomical
  // distinction most readers do not picture: the kidneys sit behind the peritoneal lining
  // entirely, not within the cavity it encloses.
  // THE UNIQUENESS CLAIM THAT USED TO BE HERE WAS TRUE WHEN IT WAS WRITTEN AND IS NOT NOW, which
  // is why it is called out rather than quietly dropped. It read "unlike every prior organ in
  // this atlas" and enumerated ovary, breast and lungs — the organs that existed then. The
  // pancreas is ORGAN_MODULES[8] and the kidneys are [5], so pancreas.js:114 ("behind the
  // peritoneum") arrived three organs later and falsified a sentence in a file its author never
  // opened. Nothing about the claim or its source changed; the corpus grew around it. Any
  // replacement here would age the same way, so the remaining text asserts no comparison at all.
  desc:'The kidneys sit retroperitoneally — behind the peritoneum lining the abdominal cavity, not within it. Each kidney filters blood through roughly 1 million nephrons, processing about 180 liters of blood a day, with the resulting urine draining into the renal pelvis before leaving via the ureter.',
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
    // EXTENDED 2026-09-13 for papillary RCC: Prasad et al., Br J Radiol, 2007, PMID 17621606,
    // directly states "Clear cell and papillary renal cell carcinoma (RCC) recapitulate the
    // epithelium of the proximal tubules" — the SAME lineage ccRCC's own sentence already
    // names, not a distal-tubule story some secondary sources assume. No ORIGIN_HOTSPOT_ENTRY
    // override needed for prcc: it uses this organ's existing default (Cortex, index 0).
    { key:'cortex', label:'Cortex', pos:[-0.0292,-0.0191,-0.0244],
      text:'The outer layer of the kidney, containing the filtering unit (glomerulus) of each nephron. Clear cell renal cell carcinoma, the most common kidney cancer subtype, most commonly arises here — directly paralleling how ovarian cancer begins in the ovary\'s surface epithelium, breast cancer in the breast\'s ducts, and lung adenocarcinoma in the lung\'s alveoli. Papillary renal cell carcinoma is thought to recapitulate the same proximal-tubule epithelium (Prasad et al., Br J Radiol, 2007) — a shared lineage with clear cell RCC, not a separate one.' },
    // EXTENDED 2026-09-13 for chromophobe RCC — a genuinely different origin from Cortex above,
    // hence its own ORIGIN_HOTSPOT_ENTRY override (see morphology.js). Prasad et al. 2007, PMID
    // 17621606: "chromophobe RCC differentiate[s] towards... Type B intercalated cells of the
    // cortical collecting duct" — intercalated cells are a defining cell type of the collecting
    // duct, which this hotspot's own pre-existing text already names as passing through here.
    { key:'medulla', label:'Medulla', pos:[-0.0212,-0.0010,0.0057],
      text:'The inner layer, made up of cone-shaped renal pyramids whose tips (papillae) drain urine toward the renal pelvis — each pyramid fed by a cluster of nephrons\' collecting ducts. Chromophobe renal cell carcinoma is thought to arise from the intercalated cells lining these collecting ducts (Prasad et al., Br J Radiol, 2007) — a distinct lineage from clear cell and papillary RCC\'s own proximal-tubule origin.' },
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
    branch:{ gene:'SETD2 mutation', class:'driver', ccf:'~12% of clear cell RCC (TCGA, Nature, 2013)', note:'Another chromosome-3p chromatin gene co-deleted alongside VHL. Gerlinger et al. (NEJM, 2012) found three distinct SETD2 mutations at this exact gene within a single tumor (a shared missense change in the metastases, a splice-site change in one region, and a shared frameshift deletion in every other region) — "multiple distinct and spatially separated inactivating mutations", which the authors read as "suggesting convergent phenotypic evolution" rather than one shared ancestral hit.' } },
  { id:'KV', name:'Liver', color:cssVar('--amber'), pos3d:{x:1.2,y:-0.3,z:-0.5},
    branch:{ gene:'BAP1 mutation', class:'driver', ccf:'~15% of clear cell RCC (TCGA, Nature, 2013)', note:'A third chromosome-3p tumor-suppressor gene co-deleted alongside VHL, PBRM1, and SETD2 in the same 91%-of-tumors 3p-loss event (TCGA, Nature, 2013) — cooperating with the trunk VHL loss, not competing with it.' } },
  { id:'KC', name:'Brain', color:cssVar('--violet'), pos3d:{x:0.2,y:-1.3,z:0.4},
    branch:{ gene:'KDM5C mutation', class:'driver', ccf:'recurrent (TCGA, Nature, 2013 — among the 8 most significantly mutated ccRCC genes)', note:'Unlike PBRM1/SETD2/BAP1 above, KDM5C sits on the X chromosome (Xp11.22), not chromosome 3p, so it cooperates with VHL loss without being co-deleted alongside it. Gerlinger et al. (NEJM, 2012) found independent disruptive mutations arising in different regions of the same tumor, which the authors read as suggesting convergent phenotypic evolution rather than one shared ancestral hit.' } },
];
// A single dominant trunk, like TP53 for HGSOC/TNBC — the opposite pattern from Lung's KRAS,
// which explicitly is NOT near-universal. Gerlinger et al. (NEJM, 2012) is cited separately from
// the inactivation-frequency figure because it establishes something the frequency alone doesn't:
// "Of these driver genes, only VHL was mutated ubiquitously in all analyzed regions" — i.e. VHL
// sits before the branching point of the tumor's own evolutionary tree, the architectural sense
// of "truncal" this atlas's Trunk/Branch/Private vocabulary is built around, not just "common."
const TRUNK_CCRCC = [
  { gene:'VHL inactivation', class:'driver', ccf:'86.6% of sporadic clear cell renal cell carcinoma, via mutation or promoter methylation (Moore et al., PLOS Genetics, 2011)', note:'Disables the von Hippel-Lindau tumor suppressor — the founding event of this disease. Gerlinger et al. (NEJM, 2012) confirmed VHL was the one driver gene mutated in every single region sampled across the tumors they studied, present before the branching point of each tumor\'s evolutionary tree — architecturally truncal, not just the most common event.' },
];
// DOWNGRADED 2026-09-06, and the downgrade is what RESOLVED a generator defect rather than
// merely softening prose. Both ccf strings below used to read "a PI3K/Akt/mTOR pathway-alteration
// pattern found in ~28% of ccRCC tumors, with alterations across pathway components mutually
// exclusive with each other (TCGA, Nature, 2013)". TCGA's abstract (fetched directly, Europe PMC
// EXT_ID:23792563) says exactly this much and no more: "The PI(3)K/AKT pathway was recurrently
// mutated, suggesting this pathway as a potential therapeutic target." No "mutually exclusive",
// no "~28%", and no component-level breakdown naming MTOR or PTEN at all. So the printed claim
// exceeded its own verified source — a certainty-drift defect standing on its own, independent of
// anything the generator does.
//
// IT WAS ALSO A POOL-MEMBER EXCLUSIVITY CONTRADICTION, AND THE DOWNGRADE DISSOLVED IT. MTOR
// mutation and PTEN loss are both in this pool, and js/panel.js draws two distinct pool members
// into one cell in ~12.6% of cells, so the app could render a tumour carrying both while this
// very ccf told the reader they are mutually exclusive. The alternative repair was to keep the
// claim and add an exclusivePairs entry (the route liver.js's ARID1A/ARID2 pair took, where
// Guichard states the exclusivity in reachable text). Here the claim itself was unverified, so
// constraining the generator would have hard-coded an unsourced assertion into the model.
// Downgrading was available and strictly better: one edit, no unsourced constraint, contradiction
// gone as a side effect. THE ~28% IS REMOVED RATHER THAN HEDGED, per the standing rule that a
// statistic has no illustrative home — re-source or remove, no middle.
//
// RESTORE CONDITION, both halves together or neither: if TCGA 2013's full text is ever reached
// and does state component-level mutual exclusivity, restore the claim AND add the MTOR/PTEN pair
// to an exclusivePairs declaration in the same commit. Restoring the sentence alone would put the
// contradiction straight back. The full text is currently unreachable — PMC3771322 serves a
// reCAPTCHA on www (not attempted, by standing rule) and all three Europe PMC full-text routes
// 404 despite the record's own isOpenAccess:Y.
const PRIVATE_POOL_CCRCC = [
  { gene:'MTOR mutation', class:'driver', ccf:'a component of the PI(3)K/AKT pathway, which TCGA reports as "recurrently mutated" in clear cell RCC — no component-level frequency for MTOR itself is verified here (TCGA, Nature, 2013)', note:'Activates a growth-signaling pathway downstream of, and independent from, the VHL/HIF axis — a parallel route to proliferation that cooperates with the trunk VHL loss rather than substituting for it.' },
  { gene:'PTEN loss', class:'driver', ccf:'a component of the same recurrently-mutated PI(3)K/AKT pathway (TCGA, Nature, 2013)', note:'Removes a brake on the same PI3K/Akt/mTOR pathway MTOR mutations activate directly. Gerlinger et al. (NEJM, 2012) found two independent PTEN mutations (a splice-site change and a missense change) arising separately in different, spatially separated regions of the same tumor, which the authors read as suggesting convergent phenotypic evolution rather than one shared ancestral hit.' },
  { gene:'CDKN2A loss', class:'driver', note:'Removes a cell-cycle checkpoint (the p16 brake on CDK4/6) — recurrent and subtype-associated in ccRCC (TCGA, Nature, 2013), cooperating with the trunk VHL loss rather than competing with it.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly at the source):
// PathologyOutlines' clear cell RCC page confirms "compact nests and sheets of cells with
// clear cytoplasm and distinct membrane," alveolar (nested) among the architectural
// patterns, a "prominent but delicate capillary network" of "arborizing small, thin walled
// vessels" — and uses "chicken wire" for that vasculature repeatedly and diagnostically
// (papillary RCC "lacks prominent delicate chicken wire vasculature"; chromophobe and
// oncocytoma each lack it too), so the nickname below is the field's real usage, not
// embellishment. The WHY of the clearing is from a peer-reviewed source (Pei et al., Appl
// Immunohistochem Mol Morphol, 2020): cytoplasm "filled with glycogen and lipids, which
// demonstrate clear appearance after being dissolved during tissue processing" — the cells
// aren't empty in life; processing empties them.
const HISTOLOGY_CCRCC = {
  intro: 'Clear cell renal cell carcinoma is named for exactly what the microscope shows: compact nests and sheets of cells whose cytoplasm looks optically empty. The cells are not empty in life — they are filled with glycogen and lipid, which dissolve during tissue processing and leave the clear appearance behind. Wrapping the nests is a prominent but delicate network of arborizing, thin-walled capillaries — "chicken wire" vasculature, distinctive enough that its absence points to a different kidney tumor.',
  ariaSummary: 'Stylized microscopic field: eight rounded nests packed with cells whose cytoplasm is white and optically clear, each cell outlined crisply with a small, dark, round nucleus. Thin red capillary lines trace around every nest, forming a delicate interconnecting network between them — the chicken-wire vasculature.',
  citation: 'PathologyOutlines.com, "Clear cell" (kidney); clearing mechanism: Pei et al., Appl Immunohistochem Mol Morphol, 2020.',
  features: [
    { key:'clearcells', label:'Clear cytoplasm',
      text:'Optically clear cells with distinct membranes and small round nuclei. The clearing is an artifact of processing — glycogen and lipid that filled the cytoplasm in life dissolve out, leaving the empty look the tumor is named for.' },
    { key:'nests', label:'Nested architecture',
      text:'Compact nests and sheets (alveolar pattern) — one of several architectures this tumor takes, alongside solid, tubular and microcystic growth.' },
    { key:'vessels', label:'"Chicken wire" vasculature',
      text:'A prominent but delicate network of arborizing, thin-walled capillaries encasing the nests — an important diagnostic feature, and one whose absence argues for papillary or chromophobe carcinoma instead.' },
  ],
};

// ============================================================
// PAPILLARY RENAL CELL CARCINOMA (prcc) — 2026-09-13, ordinary-organ batch. Every citation
// verified directly at the source. Two trunk entries — a fact-statement (no single founder;
// Linehan et al., NEJM, 2016, PMID 26536169, PMCID PMC4775252, TCGA's own papillary RCC paper,
// directly: "Type 1 and Type 2 papillary renal cell carcinoma are distinctly different
// diseases") plus a status entry scoped to the Type 1 majority — the same GBM/Bladder/FTC
// architecture this atlas already uses for an entity whose trunk is itself a genotype/subtype
// split rather than one mutation. Cases historically called "Type 2" are increasingly carved
// out into separate WHO entities (TFE3-rearranged RCC, biphasic hyalinizing psammomatous RCC,
// papillary renal neoplasm with reverse polarity) — one more reason not to model Type 1/Type 2
// as two active cancer entries here.
const TRUNK_PRCC = [
  { gene:'No single founder mutation', class:'driver', note:'Type 1 and Type 2 papillary RCC are, in TCGA\'s own words, "distinctly different diseases" rather than one entity graded two ways — Type 2 itself further classifies into three molecular subgroups with no unifying driver (Linehan et al., NEJM, 2016). What follows below models the Type 1 majority\'s own status-level founding event and the two genes Type 2 tumors most often carry instead.' },
  { gene:'MET pathway alteration / chromosome 7 gain (Type 1 status)', class:'driver', ccf:'81.3% of Type 1 tumors carry MET mutation, splice variant, or fusion, or increased chromosome 7 copy number — a combined figure, not one mutation type (Linehan et al., NEJM, 2016)', note:'MET point mutation alone is 18.6% of Type 1 tumors (13/75 per the source\'s own count — a source-internal rounding, since 13/75 itself computes to 17.3%, quoted here as the paper\'s own stated figure rather than recomputed), mostly in the kinase domain; the rest of the combined figure is chromosome-7 gain or a splice/fusion event. A plurality driver for the Type 1 majority, not a near-universal founder the way VHL is for clear cell RCC.' },
];
// Branch pair — both Type 2-associated and COOPERATING with each other, not competing: Linehan
// et al. (NEJM, 2016), directly: "Type 2 tumors were associated with mutations in the chromatin
// modifying genes, SETD2, BAP1 and PBRM1" — and, verbatim, "Mutations of BAP1 and PBRM1 were
// mutually exclusive but PBRM1 mutations were frequently concurrent with SETD2 mutations" (note
// the subject order in the source: PBRM1, not SETD2, is the sentence's grammatical subject — the
// relationship itself is symmetric, but the rendered note below states it without quote marks for
// that reason, rather than presenting a reordered paraphrase as a verbatim quote). BAP1 and PBRM1
// are themselves reported mutually exclusive WITH EACH OTHER in this
// same paper ("Mutations of BAP1 and PBRM1 were mutually exclusive"), so neither is used here to
// avoid that conflict; CDKN2A and SETD2 are the two used instead, checked directly for no
// documented exclusivity between them. Sites reuse ccRCC's own already-clean pos3d layout for
// this same four-site combination (Lung/Bone/Liver/Brain) — verified live in the browser for
// this entry specifically before commit, not assumed to transfer.
const REGIONS_PRCC = [
  { id:'PN', name:'Lung', color:cssVar('--coral'), pos3d:{x:-0.3,y:1.3,z:0.3},
    branch:{ gene:'CDKN2A alteration', class:'driver', ccf:'25.0% of Type 2 papillary RCC (15/60) — mutation, focal deletion, and promoter hypermethylation combined (Linehan et al., NEJM, 2016)', note:'A Type 2-associated event, not Type 1\'s own MET-pathway story. Tumors carrying it have significantly worse overall survival than papillary RCC generally (p<1E-10) and than other Type 2 tumors specifically (p<0.0001) — the single strongest prognostic marker TCGA\'s papillary RCC paper reports.' } },
  { id:'PB', name:'Bone', color:cssVar('--azure'), pos3d:{x:-1.3,y:-0.5,z:0.2},
    branch:{ gene:'CDKN2A alteration', class:'driver', ccf:'25.0% of Type 2 papillary RCC (15/60) (Linehan et al., NEJM, 2016)', note:'Same event as at Lung — Type 2\'s worst-prognosis marker.' } },
  { id:'PH', name:'Liver', color:cssVar('--amber'), pos3d:{x:1.2,y:-0.3,z:-0.5},
    branch:{ gene:'SETD2 mutation', class:'driver', note:'Also Type 2-associated; Linehan et al. (NEJM, 2016) report PBRM1 mutations frequently concurrent with SETD2 mutations in the same tumors — cooperating with, not competing against, CDKN2A, the other branch gene here.' } },
  { id:'PR', name:'Brain', color:cssVar('--violet'), pos3d:{x:0.2,y:-1.3,z:0.4},
    branch:{ gene:'SETD2 mutation', class:'driver', note:'Same event as at Liver.' } },
];
// Private pool — NRF2-ARE pathway genes (NFE2L2, CUL3, KEAP1), Type 2-associated: Linehan et al.
// (NEJM, 2016) directly: "increased activation of the NRF2-ARE pathway in Type 2 tumors and
// mutations in NRF2-ARE pathway genes (NFE2L2, CUL3, KEAP1 and SIRT1)". CUL3 carries the
// largest reported count of this group and has no documented exclusivity against MET, CDKN2A,
// or SETD2 in this source.
const PRIVATE_POOL_PRCC = [
  { gene:'CUL3 mutation', class:'driver', note:'Part of the NRF2-ARE pathway, whose increased activation Linehan et al. (NEJM, 2016) associate specifically with Type 2 tumors — cooperating with, not competing against, the Type 2 branch genes CDKN2A and SETD2.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — Delahunt & Eble (Mod Pathol, 1997, PMID 9195569, the paper that established the
// Type 1/Type 2 distinction) and Amin & Tickoo (Am J Surg Pathol, 1997, PMID 9199639), both
// verified directly: papillae with a real fibrovascular core; foamy macrophages "frequent" in
// Type 1 papillary cores, "uncommon" in Type 2; psammoma bodies present in both. CITATION-
// VERIFICATION NOTE (2026-09-13): Delahunt & Eble's own list sentence is genuinely ambiguous on
// whether the Type-1-vs-Type-2 differential applies to psammoma bodies specifically or only to
// foamy macrophages — full text was unreachable to confirm either way, so this entry does NOT
// claim a Type 1/Type 2 differential for psammoma bodies, only that they are a real, present
// feature; the Type 1/Type 2 differential IS claimed for foamy macrophages, which the same
// sentence supports unambiguously. Reuses
// drawFrond's existing fibrovascular-core family primitive (zero new drawing code for the
// papillae themselves) and drawPsammomaBody outright (already shared with thyroid's PTC); the
// foamy-macrophage cluster is the one genuinely new visual this entity needed.
const HISTOLOGY_PRCC = {
  intro: 'Papillary renal cell carcinoma is built on true papillae — finger-like fronds, each with a real fibrovascular core, projecting into cystic spaces. Scattered within many of those cores are foamy macrophages, lipid-laden immune cells that gather where papillae have shed debris — a real, diagnostically useful feature rather than an incidental finding. Calcified, concentrically layered psammoma bodies are common enough to be part of the diagnostic picture, the same structure papillary thyroid carcinoma is also known for.',
  ariaSummary: 'Stylized microscopic field: three finger-like papillary fronds, each with a red fibrovascular core running its length and a rim of small nuclei. Pale yellow-tan foamy macrophages cluster within and beside the cores. Two round, concentrically ringed purple-gray psammoma bodies sit near the fronds.',
  citation: 'Delahunt & Eble, Mod Pathol, 1997, PMID 9195569; Amin & Tickoo, Am J Surg Pathol, 1997, PMID 9199639.',
  features: [
    { key:'papillae', label:'Papillary architecture',
      text:'True papillae — fronds with a real fibrovascular core running their length, the defining architecture of this tumor.' },
    { key:'foamy', label:'Foamy macrophages',
      text:'Lipid-laden macrophages clustered within and beside the papillary cores — frequent in the Type 1 form of this cancer, less common in Type 2.' },
    { key:'psammoma', label:'Psammoma bodies',
      text:'Calcified, concentrically layered spherical bodies — the same structure papillary thyroid carcinoma is known for, present here too.' },
  ],
};

// ============================================================
// CHROMOPHOBE RENAL CELL CARCINOMA (chrcc) — 2026-09-13, ordinary-organ batch. Every citation
// verified directly at the source. A COHORT-PREVALENCE-ONLY CHROMOSOMAL TRUNK, caveated
// honestly rather than treated as architecturally equivalent to VHL: Davis et al.,
// Cancer Cell, 2014 (PMID 25155756, PMCID PMC4160352, TCGA's chromophobe RCC paper), directly:
// "loss of one copy of the entire chromosome, for most or all of chromosomes 1, 2, 6, 10, 13,
// and 17, was seen in the majority of cases (86%...)" — a whole-chromosome copy-number event,
// not a point mutation, the same precision VHL's own "inactivation via sequence alteration or
// promoter hypermethylation" framing already carries. UNLIKE VHL, whose truncal status rests on
// Gerlinger et al.'s direct multi-region sequencing (present in every sampled region of a tumor
// at one time), no chromophobe-RCC multi-region-sequencing study or precursor-lesion-timing
// study was found — this trunk's truncal status rests on cohort prevalence alone, stated as such
// rather than assumed spatially or temporally confirmed.
const TRUNK_CHRCC = [
  { gene:'Combined loss of chromosomes 1, 2, 6, 10, 13, and 17', class:'driver', ccf:'86% of chromophobe RCC (Davis et al., Cancer Cell, 2014) — a whole-chromosome copy-number event, not a point mutation', note:'The single most defining genomic feature of this cancer, and unlike this atlas\'s other trunk events, its truncal status here rests on how common the pattern is across a cohort (86%), not on direct evidence it is present everywhere within one tumor at one time or that it is the earliest event — no multi-region-sequencing or precursor-lesion study of this specific pattern was found.' },
];
// Branch pair — TP53 and PTEN are the only two genes Davis et al. (Cancer Cell, 2014) report at
// statistical significance in this cohort: "No other genes were found to be mutated at a
// frequency higher than 5%." Their relationship is a real, checked, GENUINE NEGATIVE FINDING —
// the source states no exclusivity or co-occurrence relationship between them at all, so they
// are modeled at different sites rather than asserted to cooperate or compete; neither claim is
// supported. Sites reuse the same already-clean Lung/Bone/Liver/Brain pos3d layout ccRCC and
// prcc above use, verified live in the browser for this entry specifically before commit.
const REGIONS_CHRCC = [
  { id:'CH', name:'Lung', color:cssVar('--coral'), pos3d:{x:-0.3,y:1.3,z:0.3},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'32% of chromophobe RCC (21/66) (Davis et al., Cancer Cell, 2014)', note:'One of only two genes mutated above 5% in this cancer\'s own defining sequencing study, which reports no relationship, cooperating or competing, between this gene and the PTEN branch gene modeled at a different site here.' } },
  { id:'CI', name:'Bone', color:cssVar('--azure'), pos3d:{x:-1.3,y:-0.5,z:0.2},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'32% of chromophobe RCC (21/66) (Davis et al., Cancer Cell, 2014)', note:'Same event as at Lung.' } },
  { id:'CK', name:'Liver', color:cssVar('--amber'), pos3d:{x:1.2,y:-0.3,z:-0.5},
    branch:{ gene:'PTEN mutation', class:'driver', ccf:'9% of chromophobe RCC — 6/66 nonsilent mutations plus 2 additional homozygous deletions (Davis et al., Cancer Cell, 2014)', note:'The second of the two genes this cancer\'s own defining sequencing study found mutated above 5%.' } },
  { id:'CG', name:'Brain', color:cssVar('--violet'), pos3d:{x:0.2,y:-1.3,z:0.4},
    branch:{ gene:'PTEN mutation', class:'driver', ccf:'9% of chromophobe RCC (Davis et al., Cancer Cell, 2014)', note:'Same event as at Liver.' } },
];
// Private pool — mTOR pathway genes, real and explicitly framed as COOPERATING (not competing)
// by Davis et al. (Cancer Cell, 2014): "genomic targeting of the mTOR pathway occurred overall
// in... ChRCC" via MTOR, NRAS, and TSC1/TSC2 mutations. MTOR itself (2 of 66 tumors) is used
// here rather than the paper's own combined pathway-level count, to avoid restating a total the
// paper's own text does not itself break down arithmetically against PTEN's own count in the
// same bucket.
const PRIVATE_POOL_CHRCC = [
  { gene:'MTOR mutation', class:'driver', ccf:'2 of 66 chromophobe RCC tumors (Davis et al., Cancer Cell, 2014)', note:'Part of the same mTOR-pathway targeting Davis et al. describe alongside NRAS and TSC1/TSC2 mutations in this cancer — cooperating with, not competing against, the PTEN branch gene, which acts on the same pathway from a different node.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — Marko et al. (Radiographics, 2021, PMID 34388049, PMCID PMC8415046) and Davis et
// al. (Cancer Cell, 2014), both verified directly: pale, finely textured ("reticulated")
// cytoplasm; an unusually thick, sharply outlined cell membrane — the single feature separating
// this tumor from clear cell RCC and from a benign oncocytoma at a glance; small, irregular
// ("raisinoid") nuclei, often inside a clear perinuclear halo. The nucleus's wrinkled outline
// reuses blobPath's existing organic-wobble technique at a small radius (no new shared
// primitive); the perinuclear halo reuses the same clear-ring-around-a-nucleus technique
// melanoma's pagetoid-spread cells already use.
const HISTOLOGY_CHRCC = {
  intro: 'Chromophobe renal cell carcinoma is named for how little its cells take up the usual stains: large, pale, finely textured ("reticulated") cytoplasm bounded by an unusually thick, sharply visible cell membrane — the single most distinctive feature separating it from every other kidney cancer under the microscope. The nuclei are small and irregular, wrinkled enough to be called "raisinoid," and often sit inside a clear halo where the cytoplasm pulls away from them.',
  ariaSummary: 'Stylized microscopic field: two solid sheets of large, pale, finely stippled cells, each cell outlined with an unusually thick dark membrane. Small, irregularly wrinkled purple nuclei sit off-center within a pale clear halo inside each cell.',
  citation: 'Marko et al., Radiographics, 2021, PMID 34388049; Davis et al., Cancer Cell, 2014, PMID 25155756.',
  features: [
    { key:'reticulated', label:'Pale, reticulated cytoplasm',
      text:'Cytoplasm that is large in volume but takes up almost none of the usual stain — pale and finely textured rather than clear or eosinophilic.' },
    { key:'membranes', label:'Prominent cell membranes',
      text:'An unusually thick, sharply outlined cell border — the single feature pathologists use to tell this tumor apart from a clear cell carcinoma or a benign oncocytoma at a glance.' },
    { key:'raisinoid', label:'Raisinoid nuclei with perinuclear halos',
      text:'Small, irregularly wrinkled nuclei, often sitting inside a clear halo where the cytoplasm has pulled away from them.' },
  ],
};

export const cancerDetails = {
  ccrcc: {
    title:'Clear Cell Renal Cell Carcinoma', screenLabel:'Clear cell renal cell carcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_CCRCC, trunk:TRUNK_CCRCC, privatePool:PRIVATE_POOL_CCRCC,
    histology: HISTOLOGY_CCRCC,
  },
  prcc: {
    title:'Papillary Renal Cell Carcinoma', screenLabel:'Papillary renal cell carcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern, stage-IV-at-diagnosis cohort)',
    regions:REGIONS_PRCC, trunk:TRUNK_PRCC, privatePool:PRIVATE_POOL_PRCC,
    histology: HISTOLOGY_PRCC,
  },
  chrcc: {
    title:'Chromophobe Renal Cell Carcinoma', screenLabel:'Chromophobe renal cell carcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern, stage-IV-at-diagnosis cohort)',
    regions:REGIONS_CHRCC, trunk:TRUNK_CHRCC, privatePool:PRIVATE_POOL_CHRCC,
    histology: HISTOLOGY_CHRCC,
  },
};
