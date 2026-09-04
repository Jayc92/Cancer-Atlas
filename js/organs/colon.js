import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar } from '../viewer.js';

// active:true. Alias collision check (same convention as every prior organ): no other organ's
// aliases use "colon", "colorectal", "bowel", "rectum", "sigmoid", or "crc". The bare word
// "adenocarcinoma" is deliberately NOT an alias (claimed by Lungs — see prostate.js for the
// same reasoning); "colorectal adenocarcinoma" is safe because search matching is
// alias.includes(query), and no Lungs alias contains that longer string. "rectal" needs no
// alias of its own — any query containing "rectal" is a substring match into "colorectal".
export const organEntry = { key:'colon', label:'Colon', system:'Digestive', active:true, sexes:['female','male'], aliases:['colon','colorectal','large intestine','bowel','rectum','sigmoid','crc','colorectal adenocarcinoma'] };

// Left lower abdomen (descending-to-sigmoid colon) — the colon frames the whole abdomen, so
// any point on it is defensible; the left flank was chosen, matching the app's existing
// marker-side convention (same negative sign as the stomach's marker, opposite the liver's
// +40). The spec was NOT eyeballed: heightFrac values below ~0.46 are a raycast trap at
// these angles — the inward ray slips through the thigh gap and lands on the far buttock
// surface (positive x, negative z), i.e. the wrong side of the body, on one or both sexes —
// found by probing a height/angle grid against both meshes, the same measure-don't-assume
// method the body-marker system was built with. 0.48/-45 hits the front-left flank cleanly
// on BOTH sexes (more laterally still at -50, clearing the Ovaries pair), sitting just below
// the left kidney marker's column and clear of the Ovaries pair and Prostate. Verified by
// screenshot on both sexes.
export const markerSpec = { points:[{heightFrac:0.48, angle:-50}] };

export const cancerEntries = [
  { id:'crc',    name:'Colorectal adenocarcinoma', share:'&gt;90% of colonic malignancies ("Colon adenocarcinoma is the predominant colonic malignancy (&gt;90%)", StatPearls, "Colon Cancer")', active:true,  organKey:'colon' },
  { id:'cnet',   name:'Neuroendocrine tumor',      share:'part of the remaining &lt;10% of colonic malignancies — no individual share figure claimed here', active:false, organKey:'colon' },
  { id:'clymph', name:'Lymphoma',                  share:'part of the remaining &lt;10% of colonic malignancies — no individual share figure claimed here', active:false, organKey:'colon' },
];

// REPLACED (2026-09-02, colon-swap pass): assets/colon.glb is no longer the HRA large-intestine
// model. The HRA asset — colonoscopy-derived, byte-identical to upstream, with ten named
// sub-meshes — modeled the colon's PATH and caliber but not its two most identifying external
// features: a landmark-fidelity audit found haustra only FAINT (soft bulges, not crisp pouches)
// and taeniae coli fully ABSENT, while this file's own Teniae hotspot text and viewerAria were
// describing a "segmented, haustrated" silhouette the mesh barely showed. The source was
// confirmed exhausted before replacing it: no decimation ever occurred (the shipped file WAS
// upstream), and HRA's newer v1.3 hash-matches v1.2's vertex data exactly (position-data md5
// 8b4d2481..., both) — a source gap, not a processing loss. Full diagnostic in the
// landmark-audit packet and CLAUDE.md's colon-swap entry.
// CURRENT SOURCE: "Small and large intestine" by Sketchfab artist antonia.sundberg — license
// verified TWICE (the file's own embedded asset.extras: "CC-BY-4.0"; the live model page:
// "CC Attribution / Creative Commons Attribution"), made for a scientific-illustration course
// at Malardalen University. Only the two Tjocktarm (large intestine) meshes are used — the
// Tunntarm (small intestine) mesh is dropped entirely, same out-of-scope reasoning as the lungs
// swap dropping larynx/thyroid. The two Tjocktarm meshes join+weld into exactly ONE connected
// component (109,400 raw -> 102,178 welded verts; 7,222 UV-seam duplicates — the same false-
// split pattern as the lungs' 16/7), i.e. one continuous cecum-to-rectum tube with REAL
// geometric haustra, a taenia band, the appendix, and the rectum. Build: Blender headless —
// isolate, join, weld, STRIP the source's FBX empty hierarchy (its ancestor nodes carry 0.1 and
// 0.037 scales that transform_apply does NOT bake; leaving them made the mesh render at ~1.7mm,
// caught by an in-app probe showing the camera inside the mesh's bounding sphere), center to
// origin, scale 0.000968 calibrating the frame to the old real-scale asset's 0.45m height —
// resulting real-world dims 0.396 x 0.45 x 0.195m, verified by walking the EXPORTED file's own
// node hierarchy (accessor min/max alone validated vertex space while world space was
// microscopic — the second real bug this build caught). Orientation verified by x-sign
// color-coded flat renders, not assumed from camera algebra: cecum+appendix at x<0 (patient's
// right, viewer-left at the default camera), descending at x>0, transverse top, rectum
// bottom-center reaching lowest — matching the viewerAria below exactly.
export function buildColonMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/colon.glb', (gltf)=>{
      // NATIVE BAKED MATERIALS, not the shared organ recipe — decided by live A/B, not by lungs
      // analogy (both paths were rendered and compared per the swap spec): the source carries a
      // real 2048px NORMAL MAP on a second UV set — per-texel surface detail of the same class
      // that justified native materials for Lungs — and the recipe path would discard it. The
      // recipe variant rendered acceptably (haustra/taeniae are geometry and survive either
      // way) but visibly flatter in the haustral creases. Costs, disclosed: the base-color tone
      // is artist-authored, NOT the previously verified 0xc99f92 serosal pink — recorded as its
      // own dated CLAUDE.md data rule (the lungs rule-25 pattern), see there.
      // COLORSPACE: GLTFLoader's default sRGB tag gamma-crushes under this app's no-reencode
      // pipeline (mesh mean RGB (101,36,25) vs (143,83,63) with the tag removed — the identical
      // failure mode, numbers, and fix as the lungs swap; see lungs.js's fuller comment). The
      // normal map is untouched (loaders leave non-color maps linear already).
      gltf.scene.traverse(o=>{
        if(o.isMesh && o.material && o.material.map){
          // PIPELINE CORRECTION 2026-09-03: was NoColorSpace (the legacy double-decode fix, see this
          // file's history + CLAUDE.md); corrected pipeline needs the glTF-default sRGB decode.
          o.material.map.colorSpace = THREE.SRGBColorSpace;
          o.material.map.needsUpdate = true;
        }
      });
      // Centering is BAKED into the exported asset (origin-centered, single root node, no
      // transforms — verified by walking the exported file's own hierarchy), so the old HRA
      // node-recenter is no longer needed; kept as a guard (it computes ~zero and subtracts it)
      // so a future asset that ISN'T pre-centered still behaves.
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Digestive System', title:'Colon',
  sub:'The large intestine · about 5 feet (~1.5 m) long · absorbs water & electrolytes, forms stool',
  facts:[
    {label:'Length', val:'About 5 feet / ~1.5 m (sources range 3–5 ft) — roughly one fifth of the GI tract'},
    {label:'Regions', val:'Cecum → ascending → transverse → descending → sigmoid colon → rectum'},
    {label:'Function', val:'Absorbs water &amp; electrolytes, produces &amp; absorbs vitamins, forms &amp; propels feces'},
    {label:'Blood supply', val:'Superior mesenteric artery (cecum through transverse colon) &amp; inferior mesenteric artery (descending colon through upper rectum)'},
  ],
  // The blood-supply fact gets the second-sentence treatment every organ's one genuinely
  // distinguishing fact gets: the SMA/IMA watershed is the embryological midgut/hindgut
  // boundary. Kept deliberately soft on WHERE the transition falls — StatPearls places the
  // watershed at the left colic (splenic) flexure while an embryological source draws it at
  // the distal third of the transverse colon, and colonic segment boundaries are genuinely
  // unstandardized in the literature (a 2025 Int J Colorectal Dis paper exists specifically
  // to complain about this) — so the app says "near the splenic flexure" and never draws a
  // hard pixel boundary. Length is stated in feet-first form because that is how the real
  // sources state it: StatPearls gives "approximately 5 feet"; the ~1.5 m metric form is
  // confirmed by Skok et al. (World J Gastroenterol, 2025); Santucci &amp; Velez (Aliment
  // Pharmacol Ther, 2024) give the wider "3-5 feet" — the range is stated rather than
  // presenting one cohort's number as a constant. The water figures deliberately use the one
  // self-contained sentence (1-2 L chyme → 200-250 mL feces, Santucci &amp; Velez) rather than
  // pairing it with the "up to 5 L/day" absorptive-capacity figure from the same source —
  // the two measure different things and read as a contradiction side by side.
  desc:'The large intestine frames the abdomen like a question mark: from the cecum in the lower right — where the ileocecal valve admits digested material from the small intestine and the vermiform appendix hangs below — it ascends the right side, crosses under the liver and stomach as the transverse colon, descends the left side, and curls through the sigmoid colon into the rectum. About 5 feet (~1.5 m) long, it converts the 1–2 liters of liquid chyme it receives each day into 200–250 mL of semisolid feces, absorbing water and electrolytes as colonic bacteria produce vitamins. Its arterial supply changes hands near the splenic flexure — the superior mesenteric artery feeds everything proximal, the inferior mesenteric artery everything distal — marking the embryological boundary between midgut and hindgut.',
  buildMesh: buildColonMesh,
  // Real-world-meter GLB (bbox ~40 x 45 x 20cm, calibrated to the prior asset's 0.45m frame height) —
  // minRadius/maxRadius rescaled to real meters, same reasoning as every real-mesh organ.
  viewer:{ theta:0.5, phi:1.15, radius:0.9, minRadius:0.22, maxRadius:2.2, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of the large intestine, a segmented, haustrated tube '
    + 'framing the abdomen — ascending colon at the viewer\'s left, transverse colon across the '
    + 'top, descending colon at the right, sigmoid colon and rectum at the bottom center — with '
    + 'four glowing teal points marking the structures listed after it. Drag to rotate, scroll '
    + 'to zoom.',
  // pos: literal anchor points (meters, origin-centered mesh space) — the new asset has no
  // named sub-meshes (one welded tube), so each anchor is the anterior-most REAL VERTEX of a
  // geometrically-selected band of its target segment (sigmoid / ascending / transverse /
  // descending), segment identity verified by the x-sign color-coded orientation renders
  // rather than assumed. One point per quadrant of the colonic frame so all four are visible
  // at the default camera angle — verified live, per the Kidneys lesson.
  hotspots:[
    // The "arises here" point every organ leads with — anchored on the sigmoid colon.
    { key:'mucosa', label:'Mucosa & glandular epithelium', pos:[0.0469,-0.1202,0.0353],
      text:'The colon\'s inner lining: a single layer of columnar absorptive cells and mucus-secreting goblet cells, with no villi. Colorectal adenocarcinoma — the predominant colonic malignancy — originates from the glandular epithelium of this mucosa, directly paralleling how ovarian cancer begins in the surface epithelium, lung adenocarcinoma in the alveoli, and pancreatic cancer in the ductal epithelium. The vast majority (~85%) follow the chromosomal-instability pathway, initiated by truncating APC mutations.' },
    { key:'crypts', label:'Crypts of Lieberkühn', pos:[-0.1313,-0.0497,0.0501],
      text:'The adult colon contains approximately 15 million of these straight tubular glands, each an involution of the epithelium about 2,000 cells strong, sheltering the stem-cell compartment at its base. That protected niche is exactly where the adenoma story begins: an APC-mutant stem cell at a crypt base can found the clone that becomes a polyp — and, over years, a cancer.' },
    { key:'teniae', label:'Teniae coli & haustra', pos:[0.0275,0.1621,0.0971],
      text:'The teniae coli are three longitudinal bands of smooth muscle running along the colon\'s outer wall; their contraction, together with the circular muscle layer, draws the colon into the pouch-like sacculations called haustra — the segmented, caterpillar-like silhouette visible on this model, and the feature that most distinguishes the large intestine\'s outside from the small intestine\'s smooth surface.' },
    { key:'muscularis', label:'Muscularis propria', pos:[0.1308,-0.0498,0.0304],
      text:'The colon wall\'s muscular engine — an inner circular and an outer longitudinal smooth-muscle layer. In cancer staging this layer is the yardstick of invasion depth: a tumor invading into it is T2, and one breaking through it into the surrounding pericolorectal tissue is T3 — the difference between a cancer still contained by the bowel wall and one that has escaped it.' },
  ],
};

// EVERY citation in this organ's data was verified directly at the source before being written
// in. Verification outcomes that materially changed the content, recorded per the standing
// correction-record precedent:
// - THE LIVER-METASTASIS FIGURES IN THE TASK BRIEF WERE WRONG, AND EFFECTIVELY SWAPPED. The
//   brief suggested "~25% at presentation, rising toward ~50% over the disease course." Five
//   independent population registries put synchronous liver metastasis at 14.0–17.7% (Denmark
//   N=72,722 Johannsen 2025; France N=26,813 Reboux 2022 [17.0%, whose Discussion explicitly
//   rebuts higher figures]; Sweden Engstrand 2018 [16.2%]; Germany Hackl 2014 [17.7%]; Burgundy
//   Manfredi 2006 [14.5%]) — and the ~50% lifetime figure is rejected IN PRINT ("the incidence
//   of CRCLM was lower than the 50% often cited in the literature", Engstrand 2018); verified
//   5-year cumulative incidence runs ~20–27% (19.8% Denmark; 26.5% Sweden). The Liver site note
//   below carries the corrected numbers with their denominators.
// - Fearon &amp; Vogelstein (Cell, 1990) NEVER NAMES APC — the gene wasn't cloned until 1991; the
//   paper says "the familial adenomatous polyposis gene on chromosome 5q," and its own section
//   heading is "Accumulation, Rather Than Order, Is Most Important." The trunk note therefore
//   cites Powell et al. (Nature, 1992) for APC-comes-first, and quotes the 1990 model for what
//   it actually claims (4-5 genes, preferred but non-invariant order).
// - PathologyOutlines' colon pages returned HTTP 429 to direct fetches during this pass; the
//   histology block's PathologyOutlines quotes were read off the live pages via the browser
//   pane instead, and the mucosa/crypt facts above rest on a pathologist-authored peer-reviewed
//   review (Drage &amp; Mino-Kenudson, Cells, 2026) plus StatPearls.
//
// THE KRAS×TP53 ANTI-CORRELATION — this organ's distinctive mutation-framing finding, and a
// FOURTH pattern for the atlas (data rule/standing note in CLAUDE.md): a real but MODEST
// negative association, strictly between "competing" (LUAD's KRAS/EGFR, OR≈0) and independent.
// Verified numbers: pooled OR 0.69 (95% CI 0.51–0.95, p=0.02, n=638 across nine studies —
// Domingo et al., J Pathol, 2013, Supplementary Table S4, read from the actual xlsx);
// multivariate OR 0.55–0.56 in the VICTOR cohort (Table S3); ~17% of tumors carry both. It is
// NOT exclusivity — in metastatic surgical cohorts RAS/TP53 co-mutation is a recognized adverse
// subgroup at ~28–31% (Chun 2019 N=401; Lillemoe 2022), and 8 of the 9 pooled studies were
// individually non-significant. The design consequence: KRAS and TP53 are modeled as branch
// genes of DIFFERENT sites (subclones), neither ever appears in the shared private pool (which
// sprinkles onto cells of every site), and both notes state the association with its size. The
// same Domingo tables also give the two contrasts wired into the notes: KRAS×BRAF is near-total
// exclusion (OR 0.02, P=8.9e-5; 1 of 303 KRAS-mutant tumors BRAF-mutant, p=2e-16) — which is
// why BRAF (9.6% of CRC, Safaee Ardekani 2012 meta-analysis, 11,773 patients) appears NOWHERE
// in this cancer's ledger, same reasoning as EGFR's permanent exclusion from LUAD — and
// KRAS×PIK3CA is strong CO-occurrence (multivariate OR 4.0, P=4.4e-11), which is why PIK3CA
// as a branch gene coexisting with a KRAS branch in the same tumor is mechanistically sound.
// PIK3CA is also NEGATIVELY associated with TP53 (OR 0.36, P=0.004, same tables) — a second
// reason both it and TP53 live at their own separate sites rather than in the shared pool.
const REGIONS_CRC = [
  // Site frequencies: Riihimäki et al. (Sci Rep, 2016, PMID 27416752) — Swedish national
  // cohort, N=49,096 colon-cancer patients, site shares among the ~30% with recorded
  // metastases: liver 70%, thorax 32%, peritoneum 21% (colon's third most common site),
  // nervous system 5%. One source, one denominator, colon-specific — the denominator is
  // stated in every note because mixing it with all-patient rates is exactly how the
  // debunked "half of patients get liver metastases" claim propagates.
  { id:'CL', name:'Liver', color:cssVar('--coral'), pos3d:{x:-0.54,y:1.48,z:0.5},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'~35–45% of CRC (34% stage II/III, Domingo et al., J Pathol, 2013, n=898; 44% metastatic MSS, Yaeger et al., Cancer Cell, 2018, n=1,134) — the spread is cohort stage, not disagreement', note:'Locks the RAS growth switch on — the middle event of the classical adenoma-carcinoma sequence. KRAS and TP53, though individually two of this cancer\'s commonest mutations, co-occur LESS often than chance predicts: pooled odds ratio 0.69 (95% CI 0.51–0.95, p=0.02, 638 tumors across nine studies, Domingo et al., 2013) — a real but modest bias, not a prohibition; roughly one in six CRCs carries both. Contrast BRAF, which is near-mutually exclusive with KRAS (OR 0.02; 1 of 303 KRAS-mutant tumors) and therefore appears nowhere in this tumor\'s ledger. The liver is colorectal cancer\'s dominant metastatic site because the colon\'s venous blood drains there first, through the portal vein: ~15% of all patients have liver metastases at diagnosis (14.0–17.7% across five national registries) and ~20–27% develop them within five years — the often-quoted "half of patients" is explicitly rejected by population data (Engstrand et al., BMC Cancer, 2018). Among patients whose cancer has metastasized, 70% have liver involvement (Riihimäki et al., Sci Rep, 2016, N=49,096).' } },
  { id:'CT', name:'Lungs', color:cssVar('--azure'), pos3d:{x:-1.37,y:-0.59,z:0.35},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'60% of non-hypermutated CRC vs 20% of hypermutated (TCGA, Nature, 2012); 78% in metastatic MSS disease (Yaeger et al., 2018) — the figure depends on which patients you count', note:'Disables the genome\'s damage-response checkpoint — classically the LATE event of the adenoma-carcinoma sequence: chromosome 17p, where TP53 sits, is "usually lost only in carcinomas" (75% of carcinomas vs. rare in adenomas, Vogelstein et al., NEJM, 1988). Anti-correlated with KRAS at modest strength (OR 0.69 — see the Liver site\'s note for the full statistics; the two are shown at different sites here, as different subclones, for exactly that reason). The thorax is the second most common metastatic territory: 32% of metastatic colon-cancer patients (Riihimäki et al., 2016 — their registry codes "thorax", which is predominantly lung disease).' } },
  { id:'CP', name:'Peritoneum', color:cssVar('--amber'), pos3d:{x:1.31,y:0.39,z:-0.13},
    branch:{ gene:'SMAD4 loss', class:'driver', ccf:'~10–15% of CRC — no canonical figure exists: 8.6% by full sequencing (64/744, Fleming et al., Cancer Res, 2013) to 12% by hotspot panel (90/734, Mehrvarz Sarshekeh et al., PLoS One, 2017) to 16.2% in metastatic cohorts (70/433, Wang et al., Cancers, 2022) — the assay and the cohort pick the number', note:'Knocks out the central mediator of TGF-β signaling, the pathway that normally delivers growth-inhibitory signals to intestinal epithelium (Fleming et al., 2013). Whether SMAD4 loss is enriched alongside RAS mutation is genuinely disputed — a 4,394-patient meta-analysis says yes (OR 2.13, p=0.001, Fang et al., BMC Gastroenterol, 2021) while a 433-patient genomic study found no enrichment (Wang et al., 2022) — but no study reports exclusion, so it can safely share a tumor with any branch here. Peritoneal spread is colon cancer\'s third most common metastatic territory: 21% of metastatic colon-cancer patients (Riihimäki et al., 2016), and 8.3% of all patients develop peritoneal carcinomatosis (924/11,124, Segelman et al., Br J Surg, 2012).' } },
  { id:'CN', name:'Nervous system', color:cssVar('--violet'), pos3d:{x:0.51,y:-1.51,z:0.36},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'14–15% of CRC (91/590 population-based, Nosho et al., Neoplasia, 2008; 105/757, Rosty et al., PLoS One, 2013)', note:'Activates the p110α catalytic subunit of PI3-kinase via hotspot mutations in two spots — the exon 9 helical domain (E542K, E545K) and the exon 20 kinase domain (H1047R) — all shown experimentally to carry high enzymatic and transforming activity with strong AKT activation in colorectal cancer cells (Ikenoue et al., Cancer Res, 2005). Unlike BRAF, PIK3CA rides WITH KRAS rather than replacing it (co-occurrence OR 4.0, P=4.4×10⁻¹¹, Domingo et al., 2013) — and it is negatively associated with TP53 (OR 0.36), one more reason each of these genes is shown at its own site rather than sprinkled everywhere. Nervous-system metastasis is real but the rarest territory modeled here: 5% of metastatic colon-cancer patients (Riihimäki et al., 2016); across all patients, brain metastases pool to 1.55% (100,825 patients, Christensen et al., BMC Cancer, 2016) and just 0.2% at diagnosis (SEER, Qiu et al., 2015).' } },
];
const TRUNK_CRC = [
  { gene:'APC inactivation', class:'driver', ccf:'81% of non-hypermutated CRC vs 51% of hypermutated (TCGA, Nature, 2012 — 16% of colorectal cancers are hypermutated, so the near-universal framing belongs to the non-hypermutated majority); WNT-pathway alteration overall: 93%', note:'The gatekeeper: truncating APC mutations stabilize β-catenin and lock WNT signaling on, founding the adenoma. APC comes first in this cancer\'s famous multistep story — but the citation trail matters: Fearon &amp; Vogelstein\'s 1990 model paper never names APC (the gene wasn\'t cloned until 1991; it says only "the familial adenomatous polyposis gene on chromosome 5q"), and its own section heading insists "Accumulation, Rather Than Order, Is Most Important" — mutations in "at least four to five genes" with a preferred but non-invariant sequence. The APC-comes-first evidence is Powell et al. (Nature, 1992): APC mutations were already present "in the earliest tumours that could be analysed, including adenomas as small as 0.5 cm," and their frequency stayed constant from benign to malignant — the signature of a founding event, the same reasoning that made TERT the liver\'s trunk.' },
];
// PRIVATE-POOL verification record (a dedicated pass checked every candidate's frequency AND
// its pairwise relationship with each of APC/KRAS/TP53/SMAD4/PIK3CA before inclusion):
// - FBXW7, TCF7L2, AMER1: included. No published exclusivity or significant anti-correlation
//   with any of the five genes in use; FBXW7×KRAS is documented CO-occurrence (pooled OR 2.01,
//   p=0.0001 — the only pairwise signal that survived Bonferroni besides AMER1×APC's own
//   co-occurrence; independently, Li et al., Cancer Science, 2025, n=6,530, statistically
//   identified APC–KRAS–FBXW7–AMER1 as an MSS co-occurrence set, and a dedicated FBXW7
//   exclusivity/co-occurrence analysis found it "occurred independently from mutations in
//   other genes", Li D et al., Front Oncol, 2021); FBXW7×TP53 computed at OR exactly 1.00.
//   A TCGA claim that looked disqualifying — "Mutations in FBXW7 (38 cases) and distant
//   metastasis (32 cases) never co-occurred (P = 0.0019)" — was investigated rather than
//   obeyed, with a two-part outcome stated precisely: the ABSOLUTE never-co-occur reading is
//   refuted (5.7% of 476 patients undergoing colorectal liver-metastasis resection carried
//   FBXW7 alterations, Kawaguchi et al., J Gastrointest Surg, 2021 — every one of whom had
//   distant metastasis; FBXW7 there predicted WORSE survival, HR 1.99), while a RELATIVE
//   depletion in metastases does directionally replicate ("FBXW7 alterations were enriched in
//   early stage tumors compared to mCRC", Yaeger 2018; ~7% of metastasis specimens vs ~18% of
//   primaries in that cohort's deposited data). A 38-case early-stage-cohort "never" became a
//   modest depletion — kept out of the in-product note entirely, since neither framing
//   affects pool safety.
// - SOX9: checked and EXCLUDED. No published constraint exists, but direct computation on
//   three cohorts' deposited data (TCGA nHM, DFCI MSS, MSK MSS) found a TP53 anti-correlation
//   that replicates in all three and survives Bonferroni (pooled OR 0.32, p<0.0001) — TP53 is
//   a branch gene here and the private pool sprinkles onto every site's cells, so this is the
//   same class of conflict as HCC's AXIN1, just caught by computation instead of citation.
// - ARID1A: checked and EXCLUDED as weakest-credentialed — ~5% in MSS but ~34% in MSI (any
//   mixed-cohort figure is contaminated), and it is not among the 96 dNdScv-designated driver
//   genes in the largest CRC WGS cohort (Nunes et al., Nature, 2024; only ARID2 appears).
// - TIMING HONESTY (a real tension, decided consciously rather than papered over): Nunes et
//   al. (Nature, 2024) timed driver events in 801 non-hypermutated CRCs and classifies
//   TCF7L2, FBXW7 and SOX9 as EARLY/clonal events — the genes with citable frequencies are
//   not the late/subclonal class the "private" tier connotes. The documented late/subclonal
//   mutations there (TRPS1, GNAS, CEP170) have thin, figure-only frequencies and unchecked
//   pairwise constraints (GNAS in particular is an alternative-driver risk by analogy with
//   PDAC). Decision: keep the well-cited genes and say what the private tier means here —
//   per-cell heterogeneity illustration, not a timing claim — in the FBXW7 note, consistent
//   with how every prior organ's private pool already uses cohort-level recurrent drivers.
// - A second, independent literature sweep corroborated all three inclusions with PUBLISHED
//   tests: Cornish et al. (Nature, 2024, 2,023 CRC whole genomes) pairwise-tested the WNT
//   genes in 1,521 MSS primaries and found POSITIVE APC co-occurrence for AMER1 (+0.086,
//   P<0.01), SOX9 (+0.081, P<0.01) and TCF7L2 (+0.066, P<0.05) — zero reports anywhere of
//   exclusivity between APC and any of the three; Li et al. (Cancer Science, 2025, n=6,530)
//   state the APC-AMER1 co-occurrence in prose and name APC-KRAS-FBXW7-AMER1 as an MSS
//   co-occurrence set. The same sweep corrected a premise: TCGA 2012 never reports APC/CTNNB1
//   mutual exclusivity (its sentence is an "or", not a test — the real exclusivity statistic
//   is Cornish 2024's APC x CTNNB1 -0.139, P<0.001), and Nunes's "APC-TCF7L2/SOX9 mutually
//   exclusive" line is about TCF7L2-vs-SOX9 as APC partners, not about APC — and even that
//   pair is null when tested directly (Cornish: -0.018, ns). SOX9 stays excluded on the TP53
//   computation above regardless.
// - Frequencies below are DERIVED from each study's own deposited mutation data (cBioPortal,
//   TCGA's own non-hypermutated sample list), validated by reproducing the paper's stated APC
//   81%/TP53 60% — the papers' body text carries no per-gene percentages for these genes, so
//   they are cited as derived, not quoted. TCGA's one in-text figure ("deleted or mutated in
//   12% of non-hypermutated tumours") sits in a grammatically ambiguous sentence — the
//   underlying data resolve it to TCF7L2 (11.1% mutated-or-deleted; TCF7L1 is 0.5%).
const PRIVATE_POOL_CRC = [
  { gene:'FBXW7 mutation', class:'driver', ccf:'11% of non-hypermutated CRC (TCGA, Nature, 2012, Figure 1b; 10.5–11.1% recomputed across three cohorts\' deposited data; among TCGA\'s eight most frequently mutated non-hypermutated genes)', note:'A recurrently inactivated tumor suppressor that rides with this cancer\'s other drivers rather than replacing any of them — its one documented pairwise signal is CO-occurrence with KRAS (pooled OR 2.0). A note on what "private" means here: in real tumors this gene is usually an early, clonal event (Nunes et al., Nature, 2024, timed it early in 801 tumors) — its private-tier placement illustrates cell-to-cell variation in this simulation, not a claim that FBXW7 arrives late.' },
  { gene:'TCF7L2 alteration', class:'driver', ccf:'9% of non-hypermutated CRC by mutation (TCGA, Nature, 2012, Figure 1b), "deleted or mutated in 12%"; 5.9–10.4% across later cohorts', note:'A WNT-pathway transcription factor — the same pathway this cancer\'s APC trunk mutation already unlocks, altered again in a different place, and TCGA\'s own reading of exactly this pattern: "many of these alterations were found in tumours that harbour APC mutations, suggesting that multiple lesions affecting the WNT signalling pathway confer selective advantage." Its APC co-occurrence has since been tested directly and confirmed (+0.066, P<0.05 in 1,521 MSS genomes, Cornish et al., Nature, 2024; APC–TCF7L2 co-mutated tumors form a real prognostic subgroup, Nunes et al., Molecular Cancer, 2024) — it coexists with the trunk rather than substituting for it.' },
  { gene:'AMER1 (FAM123B/WTX) mutation', class:'driver', ccf:'7% of non-hypermutated CRC (TCGA, Nature, 2012, Figure 1b); 4.3–6.9% across later cohorts', note:'"An X-linked negative regulator of WNT signalling, and virtually all of its mutations were loss of function" (TCGA, 2012). Co-occurs with APC — stated in prose ("although APC and AMER1 both belong to the WNT pathway, they showed a co-occurrence pattern", Li et al., Cancer Science, 2025, n=6,530) and confirmed by direct pairwise test (+0.086, P<0.01 in 1,521 MSS genomes, Cornish et al., Nature, 2024) — and with KRAS and PIK3CA. One honest caveat: the KRAS/APC/AMER1 co-mutation module shows mutual exclusivity with TP53 at module level (Nunes et al., Nature, 2024) — a bias, reported here rather than hidden, though pairwise AMER1×TP53 anti-correlation did not survive multiple-testing correction.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly; PathologyOutlines' colon
// pages were read via the browser pane after direct fetches hit HTTP 429). Two verification
// outcomes shape the wording:
// - The WHO 6th edition (2026) SUPERSEDED the familiar ≥50%-gland-formation two-tier grading
//   rule: high grade now means "at least one focus lacking gland formation in one high-power
//   field," cribriform architecture "is considered a pattern of glandular differentiation and
//   does not indicate high-grade morphology," and tumour budding is excluded from grading and
//   reported separately (Arends et al., Histopathology, 2026). The cribriform gland drawn here
//   therefore must NOT read as "high grade" — the opposite of what prostate's pattern-4
//   cribriform means two organs up, and the intro says so.
// - "Dirty necrosis" is real, defined, and in active diagnostic use ("intraluminal necrotic
//   debris consisting of apoptotic tumor cells, inflammatory cells, and nuclear fragments
//   within malignant glandular structures" — Memari et al., Cureus, 2026), and characteristic
//   enough to help recognize colorectal origin at a metastatic site — but explicitly "not
//   specific for a cancer type" (PLoS Comput Biol, 2025), so it is framed as characteristic,
//   never diagnostic.
const HISTOLOGY_CRC = {
  intro: 'Colorectal adenocarcinoma is usually a gland-forming cancer with marked desmoplasia at the tumor\'s edge. Its glands are complex and often cribriform — a sieve-like sheet punched through with multiple lumens, which the current WHO classification counts as a pattern of glandular differentiation, not high grade — and their lumens characteristically fill with "dirty necrosis": granular debris of dead tumor cells, inflammatory cells and nuclear dust. That luminal debris is characteristic enough to suggest colorectal origin when found at a metastatic site, though it is not by itself specific to this cancer.',
  ariaSummary: 'Stylized microscopic field: two large rounded tumor glands, upper left and center right, each rimmed by tall columnar cells with elongated purple nuclei and each filled with tan granular necrotic debris and dark dust-like fragments. Upper right: a cribriform gland — one epithelial mass pierced by several small round lumens. A few smaller angulated glands sit mid-field. Across the bottom, a dense band of pink desmoplastic stroma with elongated fibroblast nuclei, one small tumor gland advancing into it.',
  citation: 'Gonzalez, PathologyOutlines.com, "Adenocarcinoma" (colon); Arends et al., Histopathology, 2026 (WHO 6th ed.); Memari et al., Cureus, 2026; Menon & Cagir, StatPearls, "Colon Cancer".',
  features: [
    { key:'dirtynecrosis', label:'Dirty necrosis',
      text:'Gland lumens filled with necrotic debris — apoptotic tumor cells, inflammatory cells and nuclear fragments. A characteristic hallmark of colorectal adenocarcinoma in both primary and metastatic sites, useful for suggesting colorectal origin — but explicitly not specific to it.' },
    { key:'glands', label:'Complex & cribriform glands',
      text:'Irregular, crowded, sometimes sieve-like (cribriform) tumor glands — the architecture of a still-glandular cancer. Under the current WHO classification, cribriform growth counts as glandular differentiation and does not itself indicate high grade; a tumor is high-grade when even one microscope field contains a focus forming no glands at all.' },
    { key:'desmoplasia', label:'Desmoplastic stroma',
      text:'The dense, fibrous stromal reaction the tumor provokes, most marked at its invading edge. Tumor budding — single cells or tiny clusters breaking off into this stroma — is a real prognostic feature here, reported separately from grade under the current WHO scheme.' },
  ],
};

export const cancerDetails = {
  crc: {
    title:'Colorectal Adenocarcinoma', screenLabel:'Colorectal adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_CRC, trunk:TRUNK_CRC, privatePool:PRIVATE_POOL_CRC,
    histology: HISTOLOGY_CRC,
  },
};
