import * as THREE from 'three';
import { cssVar } from '../viewer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// active:true. Alias collision check (same convention as every prior organ): no other organ's
// aliases use "stomach", "gastric", "signet", "linitis", or "diffuse". "gastric adenocarcinoma"
// is safe for the same alias.includes(query) reason as "colorectal adenocarcinoma" — no Lungs
// alias contains it. "signet ring" and "linitis plastica" are included because they are the
// terms a person who has just heard them from a pathologist would actually type.
export const organEntry = { key:'stomach', label:'Stomach', system:'Digestive', active:true, sexes:['female','male'], aliases:['stomach','gastric','gastric adenocarcinoma','signet ring','linitis plastica','diffuse gastric'] };

// Left upper quadrant — the stomach sits "on the left of the midline and centrally in the
// upper abdominal area" (StatPearls NBK482334), fundus under the left hemidiaphragm. Negative
// angle = the patient's left, opposite sign from the liver's +40 across the midline — the two
// organs' real anatomical relationship. Spacing checked against the nearest same-side markers
// (Breast -35 at 0.70, Kidneys -50 at 0.53), then verified by screenshot on both sexes.
export const markerSpec = { points:[{heightFrac:0.585, angle:-32}] };

// The cancer list IS the Lauren classification — the user-facing subtype split for this organ
// (Lauren, Acta Pathol Microbiol Scand, 1965: the two histological main types, diffuse and
// so-called intestinal, plus the later indeterminate/mixed category). Frequencies: the widely
// circulated "intestinal 54% / diffuse 32% / mixed 15%" set was checked and REJECTED — it is a
// mis-citation chain (Hu et al., J Gastrointest Oncol, 2012 cites a 41-patient ESOPHAGEAL/GEJ
// study, Polkowski et al. 1999, whose real figures are 54% intestinal / 32% MIXED / 15%
// DIFFUSE — the diffuse and mixed values were transposed en route AND applied to the wrong
// organ). The figures used instead are the largest real gastric series typing all three
// categories: the Korean Gastric Cancer Association 2009 nationwide survey (N=14,658,
// J Gastric Cancer, 2011): intestinal 50.0%, diffuse 39.0%, mixed 10.9% — a surgically-treated
// cohort, stated as such; Dutch population-based data (van der Kaaij et al., Eur J Cancer,
// 2020, N=32,312) put intestinal at 55% and diffuse at 44% (mixed handling unknown — full text
// paywalled). Real cross-series ranges: intestinal 46-57%, diffuse 22.5-44%, mixed 11-21%.
//
// WHY THE DIFFUSE TYPE IS THE ONE WIRED UP (a deliberate choice the task required explaining):
// (1) its driving lesion — loss of the cell-adhesion molecule E-cadherin — is a mechanism
// class no other cancer in this atlas has (every other trunk is a growth/genome-integrity
// pathway); (2) the molecule-to-bedside chain is complete and verified end to end (CDH1 loss →
// discohesion → signet-ring cells → linitis plastica); (3) its microscopic appearance is
// genuinely distinct from the two gland-forming panels this same pass adds (intestinal-type is
// BY DEFINITION "similar to intestinal adenocarcinoma" — drawing it would repeat the colon
// slide); (4) the intestinal type is falling in incidence while diffuse holds or rises. The
// more common intestinal type stays listed with its real share, per the app's usual pattern.
export const cancerEntries = [
  { id:'gint',  name:'Gastric adenocarcinoma — intestinal type (Lauren)', share:'50.0% of gastric cancers in the largest series typing all three Lauren categories (Korean nationwide surgical survey, N=14,658, KGCA, 2011); 55% in Dutch population data — gland-forming, TP53/chromosomal-instability-associated', active:false, organKey:'stomach' },
  { id:'gdiff', name:'Gastric adenocarcinoma — diffuse type (Lauren)',    share:'39.0% of gastric cancers (KGCA, 2011, N=14,658); 44% in Dutch population data — the WHO now calls this poorly cohesive carcinoma', active:true,  organKey:'stomach' },
  { id:'gmix',  name:'Gastric adenocarcinoma — mixed/indeterminate type', share:'10.9% of gastric cancers (KGCA, 2011); 10.9–21.1% across real series — whether it behaves like intestinal or diffuse type is genuinely disputed', active:false, organKey:'stomach' },
];

// PROCEDURAL, deliberately — the one new organ of this pass without a real scan, following the
// Ovary precedent (real proportions on a procedural mesh) after the sourcing search came up
// genuinely empty rather than lazily unsearched:
// - The HRA 3D reference library contains NO stomach at all — confirmed four independent ways
//   (all 80 NIH 3D entries enumerated; HRA reference-organs API; HRA linked-open-data catalog;
//   live NIH 3D search). The stomach is outside HRA/HuBMAP scope entirely (no ASCT+B table).
// - NIH 3D's only stomach (3DPX-021124, third-party) has four mutually contradictory
//   attribution statements and GLB metadata revealing a Sketchfab artist sculpt — unusable
//   under CC BY. BodyParts3D's stomach is 1,810 triangles (placeholder tier) with a
//   self-contradictory license (site says CC BY 4.0; the OBJ header still says CC BY-SA 2.1
//   Japan). Z-Anatomy's stomach is real but CC BY-SA (copyleft this cleanly-CC-BY project
//   deliberately avoids). Open Anatomy's SPL Liver Atlas has a real CT-derived stomach
//   (35,088 points) — the strongest candidate found — but under the 3D Slicer BSD-style
//   license, whose distribution terms require reproducing the entire license text: a second
//   license regime, flagged for review rather than silently adopted (swapping it in later is a
//   contained change if wanted).
// RESOLVED (Sketchfab-era hunt, 2026-09-02): the procedural mesh below this comment's history
// is GONE — assets/stomach.glb is now REAL: "Realistic Stomach" by Brain Diagno (Sketchfab,
// CC BY 4.0, verified three ways: live page, public API requirements text, and the GLB's own
// embedded asset.extras — the label is the AUTHOR'S OWN). Provenance is the weakest of any
// adopted asset (a medical-visualization artist, no institutional supervision), so adoption
// rests on MEASURED landmark fidelity, not author authority: flat-shaded texture-free renders
// prove as GEOMETRY the convex greater curvature, concave lesser curvature with incisura
// notch, fundus mass, antral taper, and open-lumen esophageal + duodenal stubs (mouths are
// modeled rims on a surface that stays closed). The Sketchfab-visible stippling and vessel
// tracery are TEXTURE-ONLY (dihedral mean 2.63°) — disclosed; nothing load-bearing rides on
// them. Topology as shipped: ONE connected component, ZERO boundary edges, ZERO non-manifold
// edges, watertight, outward-wound. 35,226 verts (32,480 welded) / 64,960 tris.
// HUNT NOTE recorded for the next pass: the highest-viewed "Realistic Human Stomach"
// (neshallads — the same artist as our Lungs asset) is CC BY-NC and was rejected on license;
// a second candidate ("Digestive System | Human Anatomy" by adimed) carried a CC BY label but
// its own description admits it is a REUPLOAD of that NC model — a reupload cannot relicense
// someone else's NC work, so its embedded CC-BY-4.0 extras tag is meaningless. Rejection
// class: license-laundered reupload. Check reupload provenance, not just the label.
// SCALE — length-class anchor (volume-anchor REJECTED for this organ, opposite of Ovary's
// reasoning: gastric volume is state-dependent by two orders of magnitude, 25±18 mL empty to
// 2–4 L full, so no single volume is "the" stomach): the greatest inscribed J-plane diameter
// is anchored to 10.4 cm — Cunningham's 1905 mid-range ("not more than 4 to 4.5 inches
// (10 to 11.2 cm.)"), the same figure the retired procedural mesh used. At that one anchor,
// everything else lands inside cited bands unforced: overall extent 25.4 × 17.6 × 7.8 cm
// (Cunningham's 25–27.5 cm length headline, including both stubs), antero-posteriorly
// flattened 0.75:1 (real stomachs are; a symmetric tube would be 1:1), and enclosed volume
// 216 mL — a coherent moderately-distended state. NOT claimed: Gray's "greater curvature
// four or five times as long as the lesser" — the measurable mouth-to-mouth arc ratio (1.45)
// includes both tube stubs and is not comparable; the qualitative asymmetry is proven in the
// flat renders instead. The duodenal segment is LONG (a stylized C-loop): kept with
// disclosure (Lungs kept its trachea, Colon its rectum stub; trimming would re-open a
// watertight mesh), and it gives the Pyloric sphincter hotspot its anatomical context.
// Export frame: J-plane → XY with the esophagus upper-LEFT and duodenum exiting RIGHT —
// matching the app's mirror-view body-marker convention (patient-right renders image-right).
//
// MATERIAL COLOR — the old procedural's honest gap stays RECORDED because it still applies to
// recipe-material variants: no fetchable source states a color for the normal gastric SEROSA
// in words (Gray's 1918 colors the INSIDE mucosa only); 0xc08a7c was a flagged INFERENCE from
// continuous GI serosa descriptions (pink-tan colon serosa, Cureus 2022; red-tan glistening
// jejunal serosa, CRSLS 2022). The shipped material is decided by live A/B/B-prime evidence —
// see the review packet — with the same disclosure discipline either way: the artist's baked
// texture tone is artist-authored, NOT independently color-verified (Lungs/Colon rule-25/26
// class), and the recipe tone is the inference above.
export function buildStomachMesh(){
  const loader = new GLTFLoader();
  return new Promise((resolve, reject)=>{
    loader.load('assets/stomach.glb', (gltf)=>{
      gltf.scene.traverse(o=>{
        if(o.isMesh && o.material && o.material.map){
          o.material.map.colorSpace = THREE.NoColorSpace;
          o.material.map.needsUpdate = true;
        }
      });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Digestive System', title:'Stomach',
  sub:'J-shaped reservoir · cardia, fundus, body, antrum & pylorus · stores food and begins protein digestion',
  facts:[
    {label:'Regions', val:'Five named regions — cardia, fundus, body, antrum &amp; pylorus (some references fold the antrum into a four-part scheme)'},
    {label:'Capacity', val:'A few tens of mL when empty (25 ± 18 mL by MRI) — stretching to hold 2–3 L, up to ~4 L'},
    {label:'Function', val:'Temporary storage plus mechanical &amp; chemical digestion — parietal cells secrete acid &amp; intrinsic factor, chief cells pepsinogen'},
    {label:'Blood supply', val:'Celiac trunk &amp; its branches: left &amp; right gastric (lesser curvature), gastro-omental arteries (greater curvature), 3–5 short gastrics (fundus)'},
  ],
  // The muscle-wall fact gets the second-sentence treatment every organ's one genuinely
  // distinguishing fact gets: the stomach is the only part of the GI tract with THREE muscle
  // layers — "The inner oblique layer is unique to the stomach and is primarily responsible
  // for food churning and mechanical digestion" (StatPearls NBK482334) — which is also why
  // its wall is the natural home of one of the four investigate points below. Capacity
  // figures: the folkloric "~50 mL empty" was checked and NOT found citable; the measured MRI
  // values (25 ± 18 mL, Grimm et al., 2018; 35 ± 7 mL, Mudie et al., 2014) are used instead,
  // with StatPearls' 2-3 L and OpenStax's ~4 L for the distended end.
  desc:'The stomach hangs below the diaphragm as a J-shaped pouch — in the classic erect, empty posture at least; Gray\'s Anatomy itself cautions that "no one form can be described as typical." Food enters at the cardia (level of the tenth thoracic vertebra, left of the midline), the dome-shaped fundus rises above and to the left under the diaphragm, and the body sweeps down the long convex greater curvature — four to five times the length of the short, concave lesser curvature — before the antrum narrows to the pylorus, right of the midline, where a muscular sphincter meters food into the duodenum. Uniquely in the digestive tract, its wall carries three muscle layers; the extra inner oblique layer churns food against gastric juice acidified to pH 1.5–3.5. Gastric adenocarcinoma arises from the glandular epithelium of its mucosal lining. One note about this 3D model itself: it is an artist-authored anatomical model (not a scan), adopted after its J-shape, fundus, and antral landmarks were verified as real geometry against the classic published descriptions — and its surface tone comes from the artist\'s own painted texture, which is not independently color-verified, because no anatomical source states the stomach\'s serosal color in words.',
  buildMesh: buildStomachMesh,
  // Procedural mesh in real meters (~18 x 20 x 10cm envelope) — pos-anchored hotspots put it
  // through the same frameContents/scaled-marker path as the real-scan organs (that branch
  // keys on pos-vs-dir anchoring, not on how the mesh was made), which also means no marker
  // glow lights — correct here for the same reason as the real organs: these anchors sit ON
  // the surface, where a point light degenerates to distance zero (see main.js's clip-fix
  // comment). minRadius/maxRadius are real-meter values.
  viewer:{ theta:0.5, phi:1.15, radius:0.42, minRadius:0.12, maxRadius:1.0, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a real stomach — the esophagus entering at the upper '
    + 'left, the body sweeping down its long convex greater curvature, and the antrum narrowing '
    + 'to the pylorus before the duodenum curls away to the right — with four teal points '
    + 'marking the structures listed after it. Drag to rotate, scroll to zoom.',
  // pos: measured anchor points (meters) on the real mesh's surface — direction-scored argmax
  // picks on the final exported frame (the Bladder/Thyroid/Ovary real-anchor standard), placed
  // against the organ's actual regions: pits mid-body anterior face; rugae low over the greater
  // curvature; muscularis on the fundus shoulder (wall-layer hotspots are representative
  // surface points — their texts already say the layer is within the wall); pylorus snapped to
  // the visible ANTRAL NECK where the body constricts into the duodenal loop (verified against
  // the flat-shade render — a first pick 2.8 cm from the duodenal mouth landed mid-duodenum
  // because the C-loop is long; the neck is the anatomy, not a fixed offset). All four
  // front-visible at the default camera, verified by screenshot.
  hotspots:[
    // The "arises here" point every organ leads with.
    { key:'pits', label:'Gastric pits & glands', pos:[-0.09125, -0.01464, 0.03707],
      text:'The mucosal surface is dotted with millions of gastric pits, each the mouth of a gland: parietal cells secreting hydrochloric acid and intrinsic factor, chief cells secreting pepsinogen — activated to pepsin by that same acid. Gastric adenocarcinoma arises from the glandular epithelium of this mucosa, directly paralleling how colorectal cancer begins in the colon\'s glandular lining and pancreatic cancer in the ductal epithelium.' },
    { key:'rugae', label:'Rugae', pos:[-0.02190, -0.07736, 0.02393],
      text:'The large accordion folds the mucosa and submucosa collapse into when the stomach is empty — flattening out as it fills, part of how a resting volume of a few tens of milliliters stretches to hold liters. In the diffuse type of gastric cancer, extensive infiltration of the wall can efface these folds entirely: the rigid, non-distensible "leather bottle" stomach (linitis plastica).' },
    { key:'muscle', label:'Muscularis externa', pos:[-0.12282, 0.00013, 0.00390],
      text:'Three smooth-muscle layers — longitudinal, circular, and an inner oblique layer found nowhere else in the GI tract — churn food against gastric juice. In cancer staging this wall is the yardstick: a tumor invading the muscularis propria is T2, and the diffuse type characteristically spreads within these wall layers rather than growing as a mass into the lumen.' },
    { key:'pylorus', label:'Pyloric sphincter', pos:[0.04043, 0.02988, 0.01036],
      text:'The circular muscle layer thickens here into the sphincter that meters chyme into the duodenum — holding each ~30 mL portion of the antrum\'s contents until it is liquid enough to pass. G cells in this region secrete gastrin, the hormone that drives the parietal cells\' acid production upstream.' },
  ],
};

// EVERY citation in this organ's data was verified directly at the source before being written
// in. The single most consequential verification outcome is recorded on the cancerEntries
// comment above (the Lauren 54/32/15 mis-citation chain). Others that shaped this block:
// - "Diffuse type is more common in women" — checked and NOT CONFIRMED; it is sex-EQUAL
//   (incidence M/F 1.07 vs intestinal's 2.65, Derakhshan et al., Gut, 2009; "diffuse-type
//   cancers occur equally in both sexes", StatPearls) — the claim is not used anywhere here.
// - H. pylori is "equally associated with the intestinal or diffuse type" (Huang et al.,
//   Gastroenterology, 1998) — the CORREA CASCADE (atrophic gastritis → intestinal metaplasia)
//   is intestinal-specific, H. pylori itself is not; worded accordingly in gint's share line
//   territory and kept out of gdiff's story.
// - StatPearls' gastric chapter contains a self-contradictory sentence ("Intestinal-type
//   cancers may be associated with signet-ring cells") that its own later text and every
//   other source contradict — flagged as a source error, not used.
//
// MUTATION-FRAMING MODEL: the two branch events below are COMPETING in the strict, TCGA-stated
// sense — "The CLDN18–ARHGAP fusions were mutually exclusive with RHOA mutations and were
// enriched in genomically stable tumours" (TCGA, Nature, 2014) — so they are split two sites
// each, the same architecture as GBM's EGFR/PDGFRA and Prostate's ERG/SPOP, never shown in one
// cell. Within the genomically-stable subtype, 30% of cases carry one or the other.
//
// EXCLUDED from this cancer's ledger, each for a verified subtype reason (the same class of
// check as LUAD's EGFR rule, applied along the molecular-subtype axis):
// - ARID1A: mutation is concentrated in the MSI (83%) and EBV (73%) subtypes vs 11% in
//   non-EBV/MSS disease (Wang K et al., Nat Genet, 2011) — the wrong subtypes for a
//   genomically-stable/diffuse tumor — AND it is "negatively associated with mutations in
//   TP53" (same paper), which is in this private pool.
// - PIK3CA: EBV-defining (80% of EBV-positive tumors vs 3-42% elsewhere, TCGA 2014).
// - RNF43: MSI-associated (TCGA 2014 hypermutated analysis).
// - ERBB2/HER2 and the CCNE1/CCND1/CDK6 amplifications: CIN-subtype events (TCGA 2014) — the
//   intestinal-side biology, not this tumor's.
const REGIONS_GDIFF = [
  // Site frequencies: Riihimäki et al. (Oncotarget, 2016, PMID 27447571) — Swedish national
  // cohort, N=7,559 gastric cancers, site shares among metastatic patients (~39% of the
  // cohort; ≈2,925 patients): liver 48%, peritoneum 32%, lung 15%, bone 12%. The same paper's
  // Table 3 carries the diffuse-relevant twist stated in the Liver and Peritoneum notes:
  // signet-ring histology flips the pattern (peritoneum 58% vs 28%, OR 2.3; liver 16% vs 53%,
  // OR 0.3). Lymph nodes are real but deliberately NOT a site here: the source explicitly
  // excluded nodal metastases from its distribution ("Metastases to lymph nodes (C77) ...
  // were not included in this analysis"), so no citable percentage exists — same class of
  // honesty as PDAC's peritoneum, resolved the opposite way (drop the site) because four
  // better-quantified sites exist.
  { id:'GL', name:'Liver', color:cssVar('--coral'), pos3d:{x:1.45,y:1.0,z:0.3},
    branch:{ gene:'RHOA mutation', class:'driver', ccf:'15% of genomically-stable gastric cancers — the molecular subtype 73% of diffuse-type tumors belong to; "identified ... almost exclusively in genomically stable tumours" (TCGA, Nature, 2014)', note:'RHOA is a small GTPase governing cell movement and cohesion — mutating it is the second route (after CDH1 loss itself) by which this subtype breaks the rules that keep epithelial cells attached and organized. Mutually exclusive with the CLDN18–ARHGAP fusion shown at the Peritoneum and Bone sites: a real either/or, stated by TCGA directly, modeled here the same way as GBM\'s EGFR/PDGFRA split. Liver is gastric cancer\'s most common metastatic site overall — 48% of metastatic patients (Riihimäki et al., Oncotarget, 2016, N=7,559) — but the diffuse/signet-ring form specifically UNDER-uses it: 16% vs 53% for other adenocarcinomas (OR 0.3, same study), trading blood-borne liver spread for the peritoneal route.' } },
  { id:'GP', name:'Peritoneum', color:cssVar('--azure'), pos3d:{x:-1.5,y:0.8,z:0.35},
    branch:{ gene:'CLDN18–ARHGAP fusion', class:'driver', ccf:'15% of genomically-stable gastric cancers (CLDN18–ARHGAP6 or ARHGAP26 fusions, TCGA, Nature, 2014); fusions plus RHOA mutations together cover 30% of that subtype', note:'A fusion joining the tight-junction protein claudin-18 to a Rho-GTPase-activating protein — like RHOA mutation (its mutually exclusive counterpart at the Liver and Lung sites), it strikes at cell adhesion and motility, this subtype\'s defining theme. The peritoneum is the diffuse type\'s signature territory: 32% of metastatic gastric-cancer patients overall, rising to 58% for signet-ring histology vs 28% for other adenocarcinomas (OR 2.3, Riihimäki et al., 2016) — and in a resected series, peritoneal spread ran 10.0% in diffuse-type vs 3.4% in intestinal-type tumors (Zheng et al., Virchows Arch, 2008, N=814). Peritoneal carcinomatosis develops in 14% of ALL gastric-cancer patients (Thomassen et al., Int J Cancer, 2014, N=5,220).' } },
  { id:'GU', name:'Lung', color:cssVar('--amber'), pos3d:{x:0.9,y:-1.5,z:-0.25},
    branch:{ gene:'RHOA mutation', class:'driver', ccf:'15% of genomically-stable gastric cancers (TCGA, Nature, 2014) — same subtype-defining event as the Liver site', note:'The same genomically-stable-subtype driver as the Liver site — shown at two sites, as its mutually exclusive counterpart fusion also is, because a branch event can seed more than one subclone. Lung involvement: 15% of metastatic gastric-cancer patients (Riihimäki et al., 2016) — and like the liver, the lungs are LESS favored by signet-ring histology than by other adenocarcinomas (OR 0.4, same study).' } },
  { id:'GB', name:'Bone', color:cssVar('--violet'), pos3d:{x:-0.95,y:-1.15,z:0.55},
    branch:{ gene:'CLDN18–ARHGAP fusion', class:'driver', ccf:'15% of genomically-stable gastric cancers (TCGA, Nature, 2014) — same subtype-defining event as the Peritoneum site', note:'Bone involvement: 12% of metastatic gastric-cancer patients — and one of the three territories signet-ring histology favors ("more frequently metastasized within the peritoneum, bone and ovaries", Riihimäki et al., 2016). The ovary deserves its own mention even without a site of its own: a Krukenberg tumor — ovarian metastasis classically full of signet-ring cells — traces to a stomach primary in two-thirds of cases (Kiyokawa et al., Am J Surg Pathol, 2006, N=120), and non-intestinal Lauren type and signet-ring components are independent risk factors for it (odds ratios 3.4 and 3.3, Li et al., World J Clin Cases, 2020, N=1,696 women). No percentage is claimed for the ovary as a metastatic site because none is citable — the population registry grouped it into "other" for small numbers — the same honesty precedent as PDAC\'s peritoneum.' } },
];
const TRUNK_GDIFF = [
  { gene:'CDH1 (E-cadherin) inactivation', class:'driver', ccf:'37% of genomically-stable gastric cancers carry somatic CDH1 mutation (TCGA, Nature, 2014); 56.3% of sporadic diffuse-type tumors in a dedicated series (9/16 — and 0/7 intestinal-type, Machado et al., Oncogene, 2001), with promoter hypermethylation as a second, non-mutational route in another 56.3% — not a near-universal founder like pancreatic cancer\'s KRAS; trunk here means the subtype-defining lesion, the same sense as lung adenocarcinoma\'s KRAS at 33%', note:'E-cadherin is the calcium-dependent adhesion molecule that holds epithelial cells to each other — lose it, and cells let go. That single loss is this cancer\'s whole story in miniature: discohesion produces the scattered single cells and signet rings of the microscope slide, and their diffuse infiltration through the wall produces the rigid "leather bottle" stomach (linitis plastica) at the bedside. The gene can fall to mutation or to promoter hypermethylation — methylation acts as the "second hit" in more than half of mutation-carrying sporadic tumors (Machado et al., 2001; the two-hit framing is Grady et al., Nat Genet, 2000) — and, rarely, the first hit is inherited: germline CDH1 mutation causes hereditary diffuse gastric cancer, an autosomal dominant syndrome that also carries lobular breast cancer risk (Guilford et al., Nature, 1998 — discovered in a New Zealand Māori kindred; Blair et al., Lancet Oncol, 2020 guidelines).' },
];
const PRIVATE_POOL_GDIFF = [
  { gene:'TP53 mutation', class:'driver', ccf:'~50% of gastric cancers overall (the most frequently mutated gene at 50% of 119 patients, van Beek et al., Ann Surg Oncol, 2018)', note:'The genome\'s damage-response checkpoint — but placed carefully here: TP53 mutation concentrates in the chromosomal-instability molecular subtype (71%, TCGA, 2014), which is the INTESTINAL side of gastric cancer\'s molecular split, not this tumor\'s. Sequencing studies found no significant association with Lauren type either way (van Beek et al., 2018), so it appears in this diffuse-type tumor as a private-tier event — present, real, but not what defines this cancer.' },
  { gene:'APC mutation', class:'driver', ccf:'among TCGA\'s 25 significantly mutated gastric-cancer genes (β-catenin pathway; TCGA, Nature, 2014) — no clean subtype-specific percentage exists to cite, so none is shown', note:'The colon\'s famous gatekeeper is a real, recurrently mutated gastric gene too — a reminder that the same genes recur across the GI tract at different ranks. No documented conflict with CDH1, RHOA, or the CLDN18–ARHGAP fusion.' },
  { gene:'SMAD4 mutation', class:'driver', ccf:'among TCGA\'s 25 significantly mutated gastric-cancer genes (TGF-β pathway; TCGA, Nature, 2014) — no clean subtype-specific percentage exists to cite, so none is shown', note:'The TGF-β pathway\'s central mediator, of pancreatic-cancer fame, recurrently lost here as well — breaking growth-inhibitory signaling in a tumor whose defining lesion is adhesive, not proliferative: cooperation, not redundancy.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly; the PathologyOutlines
// quotes were read off the live pages via the browser pane after direct fetches hit HTTP 429).
// This is the atlas's first NON-gland-forming adenocarcinoma slide — the diffuse type is
// defined by the ABSENCE of the architecture every other adenocarcinoma panel here draws
// ("little or no gland formation"; "does not typically have gland formation") — and its
// signature object, the signet-ring cell, exists in no other generator: "a central, optically
// clear, globoid droplet of cytoplasmic mucin with an eccentrically placed nucleus" (Kaur &
// Vyas, PathologyOutlines, "Diffuse type"). Terminology: "Official WHO term is poorly cohesive
// carcinoma" (same source); the ≥50%-signet-ring threshold for calling a tumor signet-ring
// cell carcinoma is confirmed in peer-reviewed papers ATTRIBUTING it to WHO (Kim et al., World
// J Gastroenterol, 2025; Machlowska et al., Int J Mol Sci, 2020) but was not found in a WHO
// document itself — cited accordingly. Diffuse tumors also show "marked desmoplasia" (Kaur &
// Vyas) — drawn as background but deliberately NOT a labeled feature, which would read as a
// repeat of the pancreas panel's signature; the discohesion carries this slide.
const HISTOLOGY_GDIFF = {
  intro: 'Diffuse-type (WHO: poorly cohesive) gastric adenocarcinoma is defined by what is missing: glands. Where every other adenocarcinoma in this atlas builds rings and lumens, this cancer infiltrates as scattered single cells and small loose clusters — the direct microscopic consequence of losing E-cadherin, the molecule that holds epithelial cells together. Its signature cell is the signet ring: a large, optically clear droplet of cytoplasmic mucin filling the cell and crushing the nucleus into a crescent against the membrane. When signet-ring cells make up at least half the tumor, it is called signet-ring cell carcinoma. Spreading cell by cell through the wall\'s layers rather than as a mass, this type can stiffen the whole stomach into the non-distensible "leather bottle" of linitis plastica.',
  ariaSummary: 'Stylized microscopic field: pale pink stroma crossed by loose fibrous bands, with no glands anywhere. Scattered across the whole field are single tumor cells — many are signet-ring cells: large round cells filled by a clear vacuole, each with a dark crescent-shaped nucleus flattened against one edge. Between them, smaller discohesive tumor cells drift alone or in short single-file rows.',
  citation: 'Kaur & Vyas, PathologyOutlines.com, "Diffuse type"; Martinez Ciarpaglini, PathologyOutlines.com, "Carcinoma-general"; Mariette et al., Gastric Cancer, 2019; Kim et al., World J Gastroenterol, 2025.',
  features: [
    { key:'signet', label:'Signet-ring cell',
      text:'A tumor cell whose cytoplasm is one huge, optically clear droplet of mucin, shoving the nucleus into an eccentric crescent — the profile of a signet ring. When these make up at least 50% of a tumor it is diagnosed as signet-ring cell carcinoma; below that, poorly cohesive carcinoma NOS.' },
    { key:'discohesion', label:'Discohesive single cells',
      text:'Cells alone, in pairs, or in short files — never rings, never shared gland walls. This is E-cadherin loss made visible: without the adhesion molecule the CDH1 trunk mutation removes, the cells simply do not hold together, which is also what lets them slip through tissue one at a time.' },
    { key:'infiltration', label:'Diffuse infiltration',
      text:'The cells percolate through the stroma and wall layers instead of forming a discrete mass — often sparing the surface and thickening the submucosa, which is why these tumors can be endoscopically subtle while turning the stomach wall rigid: the gross-level "leather bottle" stomach, linitis plastica.' },
  ],
};

export const cancerDetails = {
  gdiff: {
    title:'Diffuse-Type Gastric Adenocarcinoma', screenLabel:'Diffuse-type gastric adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_GDIFF, trunk:TRUNK_GDIFF, privatePool:PRIVATE_POOL_GDIFF,
    histology: HISTOLOGY_GDIFF,
  },
};
