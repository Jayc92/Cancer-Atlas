import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

// active:true. "uterine"/"endometrial" both included since the four histologic entities below
// are diagnosed and described almost entirely under the "endometrial carcinoma" name in the
// literature, even though the organ itself is the uterus (uterine corpus) — same
// organ-name-vs-disease-name gap this atlas's Bladder entry already carries in reverse
// (urothelial carcinoma vs. "bladder cancer"). sexes:['female'] — no prior organ collision to
// check against, since no other organ in this atlas is uterine.
export const organEntry = { key:'uterus', label:'Uterus', system:'Reproductive', active:true, sexes:['female'], aliases:['uterus','uterine','endometrium','endometrial'] };

// Height-fraction/angle grid — REAL BUG CAUGHT AND FIXED by regress.js's own body-marker-
// placement check (CLAUDE.md, "BODY MARKERS RESOLVED, BUT NOT CORRECTLY"): the first value tried
// here, heightFrac 0.455, sits BELOW the measured female crotch (perineum) at 0.464 — the inward
// raycast landed on a leg, not the pelvis. Moved to 0.475, matching Bladder's own markerSpec
// exactly (js/organs/bladder.js) — anatomically apt, since the uterus sits directly adjacent to
// the bladder — and re-verified clean against the same placement check (BELOW-CROTCH cleared).
export const markerSpec = { points:[{heightFrac:0.475, angle:-15}] };

export const cancerEntries = [
  // Real subtype shares (predominance, per data rule 31 — SEER-style coding assigns a histologic
  // subtype only when it accounts for the majority of a tumor's own composition, so each share
  // below means "predominantly this histology," not "this histology present anywhere in the
  // tumor"). Endometrioid: Taiwan National Cancer Registry 1998-2017 (Sci Rep, 2023, PMC9852563,
  // n=28,769: 78.1%, 22,463/28,769), independently corroborated by McConechy et al. (J Pathol,
  // 2012, PMID 22653804, PMCID PMC3939694, n=392: 78.1%, 306/392) — two independent cohorts
  // converging on the same figure. Serous: Hamilton et al. (Br J Cancer, 2006, PMID 16495918,
  // PMCID PMC2361201, SEER 1988-2001, N=4,180): "represented only 10... percent of endometrial
  // cancers... but accounted for 39... percent of cancer deaths" — the mortality-disproportion
  // framing this atlas's own Skin/melanoma entry already uses (share text carries both numbers,
  // matching that entry's own "second, more important fact riding alongside a share percentage"
  // convention). Clear cell: Abdulfatah et al. (Int J Gynecol Cancer, 2017, PMID 28945214, PMCID
  // PMC6152831, n=165): "accounting for less than 5% of all uterine carcinomas," independently
  // corroborated by Bell & Ellenson (Annu Rev Pathol, 2019, PMID 30332563). Carcinosarcoma:
  // Matsuo et al. (J Gynecol Oncol, 2018, PMID 29400015, PMCID PMC5823983, SEER 1973-2013,
  // N=235,849): "4.7%... accounting for more than 5% in recent years" (rising from 1.7% in 1973
  // to 5.6% in 2013) — independently corroborated by Lee et al. (J Clin Med, 2023, PMID
  // 36769835, PMCID PMC9917500) and Garg et al. (Transl Oncol, 2025, PMID 40850250: "~4.5%").
  { id:'uendo', name:'Endometrioid Carcinoma', share:'78.1% of endometrial cancers (22,463/28,769, Taiwan National Cancer Registry 1998–2017, Sci Rep, 2023) — independently corroborated at the identical figure by McConechy et al., J Pathol, 2012 (306/392)', active:true, organKey:'uterus' },
  { id:'usero', name:'Serous Carcinoma', share:'~10% of endometrial cancers but ~39% of endometrial-cancer deaths — a real, disproportionate mortality share (Hamilton et al., Br J Cancer, 2006, SEER N=4,180)', active:true, organKey:'uterus' },
  { id:'uclear', name:'Clear Cell Carcinoma', share:'<5% of all uterine carcinomas (Abdulfatah et al., Int J Gynecol Cancer, 2017, n=165), corroborated by Bell & Ellenson, Annu Rev Pathol, 2019', active:true, organKey:'uterus' },
  { id:'ucs', name:'Carcinosarcoma', share:'4.7% of endometrial cancers (11,000/235,849, Matsuo et al., J Gynecol Oncol, 2018, SEER 1973–2013) and rising — 1.7% in 1973 to 5.6% by 2013', active:true, organKey:'uterus' },
];

// Real anatomy, not procedural: NIH 3D's Human Reference Atlas 3D Reference Object Library
// (account "HRA"), a Visible-Human-Dataset-derived female-organ entry, CC BY 4.0 — same sourcing
// discipline as every other real-mesh organ in this atlas. Ten real, individually-named
// anatomical sub-meshes survive the pipeline (uterus/abdominal-ostium-of-uterine-tube/body/
// fundus/cornua/lower-uterine-segment/posterior-wall/anterior-wall/cervix/internal-cervical-os/
// external-cervical-os), confirmed directly by parsing the GLB's own JSON chunk before and after
// compression — not merely assumed to survive `-kn`. The raw HRA scan's anterior/posterior wall
// sub-meshes carry a distinct flat SEGMENTATION-LABEL material (0.8/0.8/0.8 grey) from every
// other sub-mesh's own label material (0.62/0.194/0.194) — confirmed directly by inspecting each
// sub-mesh's own imported material, the same labeling-convention finding this atlas's Ovary GLB
// entry already documents ("a labeling convention, not a tissue color — nothing to preserve").
// Processed with this atlas's established Blender pipeline (import → per-sub-mesh topology check
// → weld → shade-smooth-by-angle → whole-assembly recenter → export): the recenter step hit a
// real, distinct bug from this pipeline's prior documented "bound_box doesn't refresh" trap — the
// glTF import parents sub-meshes to each other in a hierarchy, so naively subtracting the bbox
// center from every object's own LOCAL .location double-shifted children relative to their
// already-shifted parents, silently changing the union bbox's SIZE (not just its position).
// Fixed by unparenting every sub-mesh (CLEAR_KEEP_TRANSFORM) before recentering, verified by the
// post-fix bbox size matching the pre-recenter size to floating-point precision. Compressed via
// gltfpack -kn -cc (4A pipeline convention): 864KB → 158KB, all ten names verified present in the
// compressed file's own JSON chunk.
// MATERIAL COLOR — illustrative, disclosed as such rather than falsely cited: no gross-anatomy
// source describing the uterus/myometrium's own cut-surface color was independently verified in
// this pass (the downgrade-over-substitution precedent this atlas already applies elsewhere —
// Bladder, Pancreas — rather than shopping in a lookalike citation). A muted pink-tan value,
// consistent with smooth muscle's commonly-described gross tone, stands as illustrative.
// MATERIAL/LIGHTING REALISM PASS recipe applied uniformly (roughness x0.82 baseline → 0.55,
// specularIntensity 0.25, per-vertex tissue mottle amplitude 0.28); full mechanism in liver.js's
// own comment. Seed 20.8 (organ #16 in ORGAN_MODULES' order x1.3).
export function buildUterusMesh(){
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/uterus.glb', (gltf)=>{
      const mat = new THREE.MeshPhysicalMaterial({ color:0xc48a86, roughness:0.55, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 20.8); } });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Female Reproductive System', title:'Uterus',
  sub:'Pear-shaped, hollow muscular organ · pelvis, between bladder and rectum · site of implantation and fetal development',
  facts:[
    {label:'Location', val:'Pelvis, posterior to the bladder and anterior to the rectum'},
    {label:'Size', val:'~8cm long × 5cm wide × 4cm thick in the reproductive years (StatPearls); cavity volume 80–200mL'},
    {label:'Wall', val:'Three layers — endometrium (inner lining), myometrium (muscular wall), serosa (outer covering)'},
  ],
  // Second-sentence treatment for the one genuinely distinguishing structural fact, same pattern
  // every prior organ's own distinguishing fact gets (Lungs' dual blood supply, Kidneys'
  // retroperitoneal location): the uterus's four cancer entities below all arise from ONE of
  // these three wall layers (the endometrium), which is exactly why every one of them shares the
  // same origin hotspot rather than needing a per-entry override.
  desc:'The uterus sits in the pelvis between the bladder (anterior) and the rectum (posterior), receiving the fallopian tubes at its upper, rounded fundus and narrowing below into the cervix, which projects into the vagina. Its wall has three layers: the endometrium, an inner lining that thickens and sheds each menstrual cycle and is the site of embryo implantation; the myometrium, a thick muscular wall that contracts during labor; and the serosa, a thin outer covering. Nearly all of the cancers described on this page arise from the endometrium — the reason it is this organ’s single most consequential layer for disease, not just its most consequential layer for pregnancy.',
  buildMesh: buildUterusMesh,
  viewer:{ theta:0.4, phi:1.1, radius:0.09, minRadius:0.02, maxRadius:0.22, autoRotateRadPerFrame:0.0018 },
  viewerAria:'Three-dimensional model of a uterus, a pear-shaped organic form with two small '
    + 'horn-like projections near its upper corners, narrowing below into a rounded cervix, with '
    + 'four glowing teal points marking the structures listed after it. Drag to rotate, scroll to zoom.',
  // pos: literal anchor points (meters, local mesh space), picked from real named sub-mesh
  // vertices on the compressed assets/uterus.glb — verified by rendering marker spheres at these
  // exact coordinates against the real mesh before shipping, same discipline as every real-scan
  // organ in this atlas. Endometrium and Myometrium both anchor to the body_of_uterus sub-mesh's
  // own real surface (an outer-surface point standing in for the inner lining/wall it
  // represents, same convention this atlas's Liver/Hepatocytes hotspot already uses) at two
  // clearly separated real vertices; Cervix anchors to the cervix sub-mesh's own anterior bulb;
  // Cornua anchors to the right-side cornua sub-mesh, where the fallopian tube attaches.
  hotspots:[
    // "Arises here" point, directly paralleling every prior organ's own first point — see the
    // ORIGIN_HOTSPOT entry in js/morphology.js, which points at this hotspot (index 0) for every
    // one of this organ's four active cancers, including carcinosarcoma (whose carcinomatous
    // component is itself endometrial in origin — Zhao et al., PNAS, 2016, PMID 27791010: "CS
    // likely begins as carcinoma, followed by sarcomatous transformation").
    { key:'endometrium', label:'Endometrium', pos:[0.00268,-0.00729,0.02181],
      text:'The inner lining of the uterus, which thickens each menstrual cycle in response to hormonal signaling and sheds if implantation does not occur. All four of the cancers described here arise from this layer — directly paralleling how ovarian cancer begins in the ovary’s surface epithelium, breast cancer in the breast’s ducts, and prostate cancer in the prostate’s peripheral zone.' },
    { key:'myometrium', label:'Myometrium', pos:[0.02058,-0.00996,0.00979],
      text:'The thick, muscular middle layer of the uterine wall, responsible for the coordinated contractions of labor. How deeply a cancer originating in the endometrium invades into this muscular layer is one of the most important factors in staging endometrial carcinoma.' },
    { key:'cervix', label:'Cervix', pos:[-0.00241,0.02436,0.00137],
      text:'The narrow, muscular lower portion of the uterus that projects into the vagina. A tumor extending down into the cervical stroma from the uterine body — rather than a cancer that began in the cervix itself — signals more advanced disease under the FIGO staging system used for endometrial carcinoma.' },
    { key:'cornua', label:'Fallopian tube ostium / cornua', pos:[0.02358,-0.01641,0.01537],
      text:'The paired upper corners of the uterus (cornua), where each fallopian tube opens into the uterine cavity. This isn’t a common site of origin for the cancers on this page, but it is the uterus’s own anatomical link to the fallopian tube and ovary — the structure that, if it existed as its own modeled organ here, would let the high-grade serous ovarian entry’s own tubal-origin note point at a real tube rather than defaulting to the ovary’s surface.' },
  ],
};

// ============================================================
// ENDOMETRIOID CARCINOMA (uendo) — the organ's dominant subtype, ~78% of endometrial cancers.
// TRUNK: PTEN loss, cooperating with ARID1A and PIK3CA (checked directly, not assumed — data
// rule 4's cooperating-vs-competing discipline). McConechy et al. (J Pathol, 2012, PMID
// 22653804, PMCID PMC3939694, n=306 endometrioid, 276 low-grade + 30 high-grade): PTEN 67.0%
// (185/276) low-grade, 90.0% (27/30) high-grade — real, grade-dependent, worded as a range
// rather than one number (this atlas's own "note real variability" standard). Cooperates
// directly with PIK3CA (co-mutant in 28.6%, 79/276 — McConechy 2012) and with ARID1A — both genes
// are common within the same MSS/copy-number-low molecular subgroup in TCGA's own data (Nature,
// 2013, PMID 23636398, PMCID PMC3704730), and the statistical co-occurrence itself is directly
// tested and confirmed in a separate, independent 151-patient NSMP-only Chinese cohort (J Cancer
// Res Clin Oncol, 2026, PMID 41826754, PMCID PMC12988068: "PTEN and ARID1A were co-occurrent...
// p=0.001") — a real, corroborating finding, checked directly rather than attributed to a table
// TCGA's own paper does not contain (an earlier draft cited a nonexistent "TCGA Table 3
// co-occurrence"; TCGA 2013 has only one table, Table 1, and reports no dedicated ARID1A/PTEN
// statistical test — caught by an independent citation-verification pass and corrected here).
//
// MOLECULAR-GROUP TRUNK-NOTE PROSE (the TCGA/ProMisE four-group classification, embedded here
// per the user's explicit design decision rather than as a separate cancer entry — matching this
// atlas's own GBM/IDH-wildtype-status precedent for representing a CLASSIFIER, not a single
// gene, in prose within an existing trunk note). Talhouk et al. (Br J Cancer, 2015, PMID
// 26172027, PMCID PMC4506381, Vancouver cohort, n=119 endometrioid of 143 evaluable): POLE
// ultramutated 9.2% (11/119), MMR-deficient 29.4% (35/119), NSMP (p53 wild-type) 51.3% (61/119,
// the PREDOMINANT group within this histology), p53-abnormal 8.4% (10/119) — this is a
// single-institution discovery cohort, disclosed as such rather than treated as definitive.
//
// BRANCH: CTNNB1 vs. KRAS — COMPETING, not the "no constraint" relationship this atlas's own
// Ovary/endometrioid entry (js/organs/ovary.js) currently records for the same two genes. Checked
// directly rather than assumed to carry over between the two organs sharing this histology name
// (data rule 1's "same name, check don't assume" discipline) — TCGA (2013) states, verbatim, of
// the module found in the MSS/copy-number-low endometrioid group specifically: "The most
// significant module... contained CTNNB1, KRAS and SOX17... The very strong mutual exclusivity
// between mutations in these three genes suggests that alternative mechanisms activate WNT
// signalling in endometrioid endometrial cancer." A real, uterine-specific finding this atlas's
// ovarian sibling entry does not share and must not be assumed to inherit.
const REGIONS_UENDO = [
  { id:'EA', name:'Endometrium A', color:cssVar('--coral'), pos3d:{x:0.32,y:0.2,z:0.18},
    branch:{ gene:'CTNNB1 mutation', class:'driver', ccf:'23.8% (66/276) low-grade, 20.0% (6/30) high-grade (McConechy et al., 2012) — unusually high specifically within the MSS/copy-number-low endometrioid subgroup, where TCGA (2013) reports 52%', note:'Activates WNT/β-catenin signaling. Confirmed directly (TCGA, Nature, 2013) as part of a module under "very strong mutual exclusivity" with KRAS and SOX17 specifically in endometrioid endometrial carcinoma — two alternative, non-overlapping routes into the same growth pathway, which is why this gene and KRAS sit at different sites here rather than co-occurring.' } },
  { id:'EB', name:'Endometrium B', color:cssVar('--coral'), pos3d:{x:-0.2,y:0.3,z:-0.12},
    branch:{ gene:'CTNNB1 mutation', class:'driver', ccf:'23.8–52% depending on molecular subgroup (McConechy et al., 2012; TCGA, 2013)', note:'The same mutation as Endometrium A — real endometrioid tumors this heavily CTNNB1-driven cluster within the NSMP/copy-number-low molecular group described in the trunk note below, not evenly across all four TCGA groups.' } },
  { id:'EC', name:'Endometrium C', color:cssVar('--azure'), pos3d:{x:0.15,y:-0.28,z:-0.2},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'16.6% (46/276) low-grade, 26.7% (8/30) high-grade (McConechy et al., 2012)', note:'A RAS-pathway activating mutation. Confirmed directly mutually exclusive with CTNNB1 in this cancer specifically (TCGA, 2013, "very strong mutual exclusivity") — checked directly rather than assumed to carry over from this atlas’s own Ovary/endometrioid entry, whose source (Hollis et al., Nat Commun, 2020) tests CTNNB1 against TP53 but is simply silent on a CTNNB1/KRAS relationship — an absence of evidence, not a reported absence of exclusivity, and a real difference worth stating precisely rather than overclaiming what that source found.' } },
  { id:'ED', name:'Endometrium D', color:cssVar('--azure'), pos3d:{x:-0.3,y:-0.1,z:0.22},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'16.6–26.7% (McConechy et al., 2012)', note:'The same mutation as Endometrium C — mutually exclusive with the CTNNB1-driven sites above.' } },
];
const TRUNK_UENDO = [
  { gene:'PTEN loss', class:'driver', ccf:'67.0% (185/276) low-grade, 90.0% (27/30) high-grade endometrioid carcinoma (McConechy et al., J Pathol, 2012) — TCGA (2013) reports 84% pooled across the POLE-ultramutated, MSI-hypermutated, and MSS/copy-number-low groups TOGETHER (contrasted against the copy-number-high/serous-like cluster\'s own 11%), not a figure specific to the MSS/copy-number-low group alone', note:'Removes a brake on the PI3K/AKT growth pathway — this cancer’s single most frequent alteration, real across a wide grade-dependent range rather than one flat number. Cooperates directly with ARID1A — both genes are common within the same molecular subgroup in TCGA’s own data, and the statistical co-occurrence itself is independently confirmed in a 151-patient NSMP-only cohort, J Cancer Res Clin Oncol, 2026 (p=0.001) — and with PIK3CA (co-mutant in 28.6% of low-grade tumors, McConechy et al., 2012) — three genes working together rather than three independent findings. MOLECULAR-GROUP NOTE: this histology spans all four TCGA/ProMisE molecular groups rather than falling cleanly into one, and its own predominant group is worth naming precisely — of 119 endometrioid tumors in the original ProMisE discovery cohort (Talhouk et al., Br J Cancer, 2015), 51.3% (61/119) were no-specific-molecular-profile (NSMP, p53 wild-type), 29.4% (35/119) were MMR-deficient, 9.2% (11/119) were POLE-ultramutated, and 8.4% (10/119) were p53-abnormal. So while NSMP is this histology’s single most common molecular group, a real minority falls into each of the other three — a single-institution discovery cohort, not yet independently reconfirmed at this exact breakdown in a larger series.' },
];
const PRIVATE_POOL_UENDO = [
  { gene:'PIK3CA mutation', class:'driver', ccf:'38.0% (105/276) low-grade, 56.7% (17/30) high-grade (McConechy et al., 2012)', note:'A second PI3K-pathway hit, cooperating with PTEN loss (co-mutant in 28.6% of low-grade tumors) rather than substituting for it — two alterations converging on the same growth pathway.' },
  { gene:'ARID1A mutation', class:'driver', ccf:'46.7% (129/276) low-grade, 60.0% (18/30) high-grade (McConechy et al., 2012)', note:'A chromatin-remodeling gene, confirmed to cooperate with PTEN loss directly in this atlas’s own review of TCGA’s data and independently in a 151-patient NSMP-only cohort (J Cancer Res Clin Oncol, 2026) — checked against both branch genes and the trunk before inclusion, with no conflicting exclusivity finding located.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — full reuse, zero new drawing code: this is the SAME architecture genEndometrioid
// (js/histology.js) was originally built to depict for this atlas's Ovary/endometrioid entry —
// confluent glands packed with minimal intervening stroma, a solid-sheet region making the
// grade-3 criterion visible, moderate scattered mitoses. Uterine endometrioid carcinoma is the
// disease this histologic pattern is literally named after; reusing the same generator for the
// organ where this architecture is the textbook case is a stronger, more direct fit than the
// ovarian entity's own (metastatic/ectopic) use of it. Citations: Diagnostics 2021 (PMC8070731,
// WHO-2020-based review), already this atlas's own source for the same generator.
const HISTOLOGY_UENDO = {
  intro: 'Confluent glands, packed back-to-back with almost no intervening stroma — the "expansile" invasion pattern. One region shows total loss of gland formation, a solid sheet of cells: FIGO grading is based on the proportion of non-glandular (solid) growth (Grade 1 ≤5%, Grade 2 6–50%, Grade 3 >50%). Mitotic activity is moderate.',
  ariaSummary: 'Stylized microscopic field: rows of small, round gland openings packed tightly together with almost no gap between them, filling most of the field. In the lower right, the glands give way entirely to a solid sheet of tumor cells with no lumens at all. A few scattered mitotic figures (dividing cells) are visible among the glands.',
  citation: 'Diagnostics, 2021, PMC8070731 (WHO 2020-based review) — the same source and generator already used for this atlas’s Ovary/endometrioid entry.',
  features: [
    { key:'glands', label:'Confluent glands', text:'Round to oval glands packed back-to-back with minimal intervening stroma — the expansile pattern of invasion characteristic of this histology.' },
    { key:'grade', label:'Solid (non-glandular) region', text:'A region with total loss of gland formation. The proportion of a tumor occupied by solid growth like this is the basis of FIGO architectural grading.' },
    { key:'mitoses', label:'Mitotic figures', text:'Dividing cells, scattered through the glandular field at a moderate rate — fewer than this atlas’s high-grade serous entries, more than its clear-cell entries.' },
  ],
};

// ============================================================
// SEROUS CARCINOMA (usero) — ~10% of cases, ~39% of deaths (the mortality-disproportion share
// text above). TRUNK: TP53 mutation/status, overwhelmingly the founding event. Real cross-cohort
// range, worded as such rather than rounded to one number (this atlas's own HCC-TERT/melanoma-
// BRAF standard): 91%/">90%" (Kandoth et al., Nature, 2013, PMID 23636398, Discussion, "uterine
// serous carcinomas" specifically), 71% (Le Gallo et al., Nat Genet, 2012, PMID 23104009, PMCID
// PMC3515204, n=52), 76% (Mahdi et al., J Surg Oncol, 2015, PMID 26250968, n=628 — the largest
// single cohort).
//
// MOLECULAR-GROUP TRUNK-NOTE PROSE: León-Castillo et al. (J Clin Oncol, 2020, PMID 32749941,
// PMCID PMC7527156, PORTEC-3 trial), verbatim: "71% of serous cancers in the current study were
// classified as p53abn EC" — VERIFIED-DERIVED, arithmetic shown per this atlas's own established
// practice: 46 of 65 serous cases in that cohort were p53-abnormal (46/65 = 70.8%, rounding to
// the quoted 71%), with a real POLE-ultramutated minority of 9% (6/65) and MMR-deficient 11%
// (7/65) and NSMP 9% (6/65) making up the rest. A real diagnostic-ambiguity caveat on the
// POLE-mutant minority, disclosed rather than smoothed over: Hussein et al. (Mod Pathol, 2015,
// PMID 25394778) found 24/25 (96%) of POLE-mutant endometrial tumors across two cohorts showed
// defining features of ENDOMETRIOID differentiation, with severe nuclear atypia that "led to
// concern for serous carcinoma" in 28% of cases — some tumors classified as "POLE-mutant serous" in the
// literature may be POLE-mutant endometrioid tumors with serous-mimicking atypia rather than
// unambiguous true serous histology.
//
// BRANCH: ERBB2 (HER2) amplification and PPP2R1A mutation — placed at different sites as this
// atlas's standing site→gene teaching device (data rule 2's illustrative-site-pairing
// disclosure), NOT as a claimed mutual exclusivity between the two genes: the research pass for
// this organ found Kandoth's own "mutually exclusive module" language ambiguous as to whether it
// describes the copy-number-high/serous group specifically or the broader copy-number-low group,
// so no exclusivity claim is made here between ERBB2 and PPP2R1A. ERBB2: a real, direct,
// statistically significant divergence from OVARIAN serous carcinoma — Mahdi et al. (2015) found
// HER2 amplification in 17% of uterine serous carcinoma vs. only 4% of ovarian serous carcinoma
// (P<0.001), and protein overexpression 10% vs. 2% (P<0.001) — two "serous" carcinomas that are
// molecularly less alike than their shared name suggests (the same same-name-check-don't-assume
// discipline as this entity's own CTNNB1/KRAS finding above, applied to a different organ pair).
const REGIONS_USERO = [
  { id:'SA', name:'Endometrium A', color:cssVar('--coral'), pos3d:{x:0.3,y:0.22,z:0.15},
    branch:{ gene:'ERBB2 (HER2) amplification', class:'driver', ccf:'17–27% of uterine serous carcinoma (Kandoth et al., 2013: 25–27%; Mahdi et al., 2015, n=628: 17% amplification / 10% protein overexpression)', note:'A real, direct molecular divergence from ovarian serous carcinoma — the same amplification is found in only 4% of ovarian serous tumors (Mahdi et al., 2015, P<0.001) — despite the two diseases sharing a name and, per this entity’s own histology note below, a routinely-confused microscopic appearance.' } },
  { id:'SB', name:'Endometrium B', color:cssVar('--coral'), pos3d:{x:-0.22,y:0.28,z:-0.1},
    branch:{ gene:'ERBB2 (HER2) amplification', class:'driver', ccf:'17–27% (Kandoth et al., 2013; Mahdi et al., 2015)', note:'The same amplification as Endometrium A — a real, clinically actionable alteration (HER2-directed therapy) in a meaningful minority of this cancer.' } },
  { id:'SC', name:'Endometrium C', color:cssVar('--azure'), pos3d:{x:0.12,y:-0.3,z:-0.18},
    branch:{ gene:'PPP2R1A mutation', class:'driver', ccf:'22–39% of uterine serous carcinoma (Kandoth et al., 2013: 22%, in the broader copy-number-high molecular cluster; Le Gallo et al., 2012, n=52: 25%; PathologyOutlines range 25–39%)', note:'Encodes a structural subunit of the PP2A phosphatase, a tumor suppressor complex — disrupting it removes a brake on several growth-signaling pathways at once. Site assignment here is illustrative, per this atlas’s standing disclosure — no exclusivity against ERBB2 is claimed.' } },
  { id:'SD', name:'Endometrium D', color:cssVar('--violet'), pos3d:{x:-0.28,y:-0.12,z:0.2},
    branch:{ gene:'CHD4 mutation', class:'driver', ccf:'16–17% (Le Gallo et al., 2012, the paper this gene is drawn from, n=52; corroborated by PathologyOutlines, 16%)', note:'A chromatin-remodeling gene — the serous-specific finding in this gene family, distinct from ARID1A. TCGA (2013) reports ARID1A and PTEN mutations, common in this atlas’s own Endometrioid entry above, at far lower rates in the serous/copy-number-high group specifically (e.g. PTEN 11% there vs. 84% pooled across the other three molecular groups) — a real, quantified mechanistic-fit check this entry’s gene list was built against, not a verbatim "uncommon" from the source.' } },
];
const TRUNK_USERO = [
  { gene:'TP53 mutation', class:'driver', ccf:'a real cross-cohort range, 71–91% — Kandoth et al. (2013): ">90%" for "uterine serous carcinomas" specifically; Le Gallo et al. (2012, n=52): 71%; Mahdi et al. (2015, n=628, the largest single cohort): 76%', note:'The near-universal founding event of this cancer, on the same order as this atlas’s HGSOC entry (TP53 ~96%). MOLECULAR-GROUP NOTE: this histology is overwhelmingly p53-abnormal by molecular classification — 71% (46/65) in the PORTEC-3 trial cohort (León-Castillo et al., J Clin Oncol, 2020) — with a real, minority POLE-ultramutated group (9%, 6/65) that carries a genuine diagnostic-ambiguity caveat: a dedicated study (Hussein et al., Mod Pathol, 2015) found 96% of POLE-mutant endometrial tumors across two cohorts showed defining ENDOMETRIOID features, with severe atypia raising serous concern in 28% of cases — some literature-reported "POLE-mutant serous" cases may in fact be POLE-mutant endometrioid tumors with serous-mimicking atypia. MMR-deficient (11%, 7/65) and NSMP (9%, 6/65) make up the remainder.' },
];
const PRIVATE_POOL_USERO = [
  { gene:'PIK3CA mutation', class:'driver', ccf:'29–42% (Kandoth et al., 2013: 42%; Le Gallo et al., 2012: 31%; Mahdi et al., 2015, n=628: 29% vs. only 2% in ovarian serous carcinoma, P<0.001)', note:'A second real, direct molecular divergence from ovarian serous carcinoma alongside ERBB2 above — a much higher PIK3CA mutation rate in the uterine disease specifically.' },
  { gene:'FBXW7 mutation', class:'driver', ccf:'12–29% (Kandoth et al., 2013: 22%; Le Gallo et al., 2012: 29%; Mahdi et al., 2015, n=628, the largest cohort: 12%)', note:'A ubiquitin-ligase-complex gene — Le Gallo et al. (2012) found 35% of serous tumors carried a mutation in at least one gene of this complex, part of the real, serous-specific chromatin-remodeling/ubiquitin-ligase signature that distinguishes this entity’s genomics from the Endometrioid entry above.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — full reuse of genHGSOC, zero new drawing code. Real, sourced justification, not a
// convenience: PathologyOutlines' own uterine-serous-carcinoma page states this entity's
// architecture is "similar to tubo-ovarian high grade serous carcinoma," and separately lists
// "secondary involvement (drop metastasis) by tubo-ovarian high grade serous carcinoma" as a
// genuine differential diagnosis pathologists must actively rule out with WT1 immunohistochemistry
// and clinical context — real, routine diagnostic overlap, not a coincidental resemblance. This
// pass's own research could not re-confirm "fibrovascular cores" as a distinguishing feature at
// the source (absent from the current PathologyOutlines page on a direct search), so genHGSOC's
// own deliberate omission of that feature is not a mismatch for this entity either.
const HISTOLOGY_USERO = {
  intro: 'Complex papillary architecture with slit-like spaces between fused papillae, lined by markedly pleomorphic cells — nuclear size varying more than three-fold along the same papilla — with occasional psammoma bodies (concentric calcified spherules). Architecturally similar enough to tubo-ovarian high-grade serous carcinoma that distinguishing the two on a metastatic specimen is a real, routine diagnostic problem, resolved with immunohistochemistry and clinical context rather than morphology alone.',
  ariaSummary: 'Stylized microscopic field: three branching papillary fronds with pale stromal cores, separated by narrow slit-like spaces, lined by cells with dramatically uneven nucleus sizes — some small, some strikingly enlarged. Two small concentric calcified spherules (psammoma bodies) sit among the fronds.',
  citation: 'PathologyOutlines.com, "Serous carcinoma" (Uterus); Kandoth et al., Nature, 2013, PMID 23636398 — the same generator (genHGSOC) already used for this atlas’s Ovary/HGSOC entry, reused here on a direct, sourced architectural-similarity finding.',
  features: [
    { key:'papillae', label:'Complex papillary architecture', text:'Branching papillary fronds separated by slit-like spaces where papillae fuse together — architecturally similar enough to ovarian high-grade serous carcinoma that the two are a real, routine differential diagnosis.' },
    { key:'pleomorphism', label:'Marked nuclear pleomorphism', text:'Nucleus size varies more than three-fold along the same papilla — high-grade atypia, one of this entity’s defining features.' },
    { key:'psammoma', label:'Psammoma bodies', text:'Concentric, lamellated calcified spherules — a real feature of this histology, though not a universal one; PathologyOutlines describes them as something that "may be seen," not a defining feature present in every case.' },
  ],
};

// ============================================================
// CLEAR CELL CARCINOMA (uclear) — <5% of cases. Same-name-check-don't-assume discipline applied
// against this atlas's own Ovary/OCCC entry (data rule 1): the ARID1A+PIK3CA cooperating
// architecture DOES appear genuinely shared at the level of human sequencing data (Ackroyd et
// al., Gynecol Oncol, 2023, PMID 36333181 — a direct head-to-head comparison of 75 endometrial
// and 164 ovarian clear cell carcinomas on one platform, finding "no significant difference...
// except in TP53"), but the mouse-model-confirmed functional synergy this atlas's OCCC entry
// cites (Chandler et al., Nat Commun, 2015 — an ovarian/Müllerian-surface-epithelium-driven
// model) has NOT been independently demonstrated in an endometrial-specific model — disclosed as
// a real limit on how far the shared mechanism claim can be pushed, not silently assumed to
// transfer. TP53 is the one gene that DOES differ significantly and directly: 34.8% (Ackroyd et
// al., 2023, n=75 ECCC) vs. 11.1% in the same paper's own OCCC cohort (n=164, P<0.05) — a real,
// direct divergence between the two "clear cell" entities, the opposite direction from this
// atlas's own Ovary/OCCC entry, where TP53 is described as "usually wild-type."
//
// TRUNK: ARID1A loss, cooperating with PIK3CA — same architecture as OCCC (data rule 4), with the
// mouse-model caveat above disclosed in the note. Real methodological spread across cohorts,
// worded as a range: 15.9% (Le Gallo et al., Cancer, 2017, PMID 28485815, PMCID PMC5587124,
// n=63, sequencing) to 75.0% (Ackroyd et al., 2023, n=75, comprehensive NGS panel) — IHC-based
// complete-loss studies land lower still (20%, Fadare et al., Mod Pathol, 2013, PMID 23524907,
// PMCID PMC3886836, n=50), consistent with a real IHC-detects-complete-loss-only vs.
// NGS-detects-any-mutation counting-rule difference rather than a contradiction.
//
// MOLECULAR-GROUP TRUNK-NOTE PROSE: Kim et al. (Gynecol Oncol, 2020, PMID 32331700, n=52):
// POLEmut 2% (1/52), MMRd 10% (5/52), NSMP/p53wt 54% (28/52, the PREDOMINANT group), p53abn 35%
// (18/52) — but the paper states directly that this predominant group is NOT the ordinary,
// favorable-prognosis kind of NSMP: "p53wt CCC of endometrium appear to be a distinct
// clinicopathological entity" within the larger p53wt group, with markedly worse outcomes than
// ordinary NSMP endometrioid carcinoma — a genuinely different molecular-group story from the
// Endometrioid entry above, where NSMP predominance IS the ordinarily-favorable case.
const REGIONS_UCLEAR = [
  { id:'CA', name:'Endometrium A', color:cssVar('--coral'), pos3d:{x:0.28,y:0.24,z:0.16},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'34.8% of n=75 endometrial clear cell carcinomas (Ackroyd et al., Gynecol Oncol, 2023 — the source states the percentage only, no raw numerator) — a real, direct, statistically significant divergence from this atlas’s own Ovary/clear cell entry, where the same gene is 11.1% in the identical head-to-head cohort (P<0.05)', note:'The single clearest molecular difference between the uterine and ovarian versions of this same-named histology, checked directly rather than assumed identical (data rule 1). Other independent cohorts corroborate a similarly elevated rate in the uterine entity: 39.7% (Le Gallo et al., 2017), 46% (DeLair et al., 2017).' } },
  { id:'CB', name:'Endometrium B', color:cssVar('--coral'), pos3d:{x:-0.2,y:0.3,z:-0.12},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'34.8–46% across independent cohorts (Ackroyd et al., 2023; Le Gallo et al., 2017; DeLair et al., 2017)', note:'The same mutation as Endometrium A.' } },
  { id:'CC', name:'Endometrium C', color:cssVar('--azure'), pos3d:{x:0.14,y:-0.26,z:-0.2},
    branch:{ gene:'PPP2R1A mutation', class:'driver', ccf:'8.7–36% across cohorts (Ackroyd et al., 2023: 8.7%; Le Gallo et al., 2017: 15.9%; DeLair et al., 2017: 36%)', note:'Disrupts the PP2A phosphatase complex, the same gene this atlas’s Serous entry carries — real in both entities, at different rates, placed here illustratively without a claimed exclusivity against TP53.' } },
  { id:'CD', name:'Endometrium D', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.1,z:0.22},
    branch:{ gene:'PPP2R1A mutation', class:'driver', ccf:'8.7–36% (Ackroyd et al., 2023; Le Gallo et al., 2017; DeLair et al., 2017)', note:'The same mutation as Endometrium C.' } },
];
const TRUNK_UCLEAR = [
  { gene:'ARID1A loss', class:'driver', ccf:'a real, wide methodological range — 15.9% (Le Gallo et al., Cancer, 2017, sequencing) to 75.0% (Ackroyd et al., Gynecol Oncol, 2023, comprehensive NGS panel); IHC-based complete-protein-loss studies land lower still, 20% (Fadare et al., Mod Pathol, 2013) — a counting-rule difference (any mutation vs. complete protein loss), not a contradiction', note:'Cooperates directly with PIK3CA — confirmed shared at the level of human sequencing data with this atlas’s own Ovary/clear cell entry (Ackroyd et al., 2023 found "no significant difference between OCCC and ECCC mutation prevalence except in TP53"). A real limit, disclosed rather than assumed away: the mouse-model-confirmed functional synergy this atlas’s OCCC entry cites (Chandler et al., Nat Commun, 2015) used an ovarian/Müllerian-surface-epithelium-driven model and has not been independently demonstrated in an endometrial-specific model — the sequencing evidence for a shared mechanism is real and direct, the functional proof has not been shown to transfer. MOLECULAR-GROUP NOTE: this histology is predominantly NSMP/p53-wild-type by molecular classification (54%, 28/52, Kim et al., Gynecol Oncol, 2020) — but the source states directly that this is NOT the ordinarily-favorable kind of NSMP: "p53wt CCC of endometrium appear to be a distinct clinicopathological entity" with markedly worse outcomes than typical NSMP endometrioid carcinoma. The remainder splits p53-abnormal (35%, 18/52), MMR-deficient (10%, 5/52), and POLE-ultramutated (2%, 1/52).' },
];
const PRIVATE_POOL_UCLEAR = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome. This entity’s own private pool stays thin deliberately: this organ’s own research pass searched directly for a PTEN figure and found only vaguer "less frequently" mentions, with no clean percentage located in that search to cite here — checked and not found within this pass’s own search, the same honesty precedent this atlas’s other unclaimed figures already use, rather than silently omitted or estimated.' },
];
// HISTOLOGY — full reuse of genOCCC, matching this atlas's existing Ovary/clear cell → genOCCC
// dispatch precedent. Real, sourced justification: hobnail cells (Fadare et al., 2013, n=50:
// 86%), hyaline bodies (52%), and clear+eosinophilic cytoplasm admixture (82%) are all confirmed
// directly for the UTERINE entity in the same primary source this generator was designed around,
// not merely assumed to transfer from the ovarian one. One feature checked and NOT found for the
// uterine entity, disclosed rather than silently carried over: a "tigroid" cytoplasmic pattern —
// a direct, explicit search returned zero results for this feature in uterine clear cell
// carcinoma specifically; it is a classical descriptor for the ovarian/renal entities and is not
// asserted here.
const HISTOLOGY_UCLEAR = {
  intro: 'Glandular, papillary, and solid architectural patterns, usually admixed within one tumor. Hobnail cells — nuclei bulging into the lumen on a thin stalk of cytoplasm — are the most consistent single feature, present in most cases, mixed with clear (glycogen-rich) and eosinophilic cells rather than uniformly clear. Round, eosinophilic hyaline bodies sit free within about half of these tumors, often near papillary cores. Nuclei are high-grade but strikingly uniform, with a real clear-cell precursor lesion (clear-cell intraepithelial carcinoma) identifiable in a real minority of cases.',
  ariaSummary: 'Stylized microscopic field: small round papillae with pale hyaline-thickened cores; gland-like structures lined by cells whose nuclei bulge outward into the lumen on a narrow stalk of cytoplasm — hobnail cells, cytoplasm color varying cell to cell between pale/clear and pink/eosinophilic; several small, round, deeply pink hyaline bodies sitting free among the structures.',
  citation: 'Fadare et al., Am J Cancer Res, 2013, PMID 23359866, PMCID PMC3555196 (n=50, multi-institution, morphologically-unambiguous cases) — the same generator (genOCCC) already used for this atlas’s Ovary/clear cell entry, reused here on directly-confirmed shared morphology; feature keys match what that generator actually draws (hyalinized papillae + free hyaline bodies; hobnail + clear/eosinophilic admixture; uniform high-grade nuclei), not a re-invented three-way split.',
  features: [
    { key:'hyalpap', label:'Hyalinized papillae + hyaline bodies', text:'Small, round papillary cores expanded by dense hyaline material, plus round, free-standing eosinophilic hyaline bodies elsewhere in the field — present in about half of cases (52%, Fadare et al., 2013).' },
    { key:'hobnail', label:'Hobnail cells, clear + eosinophilic admixture', text:'Nuclei bulging into the lumen on a thin stalk of cytoplasm — identifiable in 86% of cases (Fadare et al., 2013), this histology’s single most consistent feature — mixed with clear, glycogen-rich cells and eosinophilic cells within the same tumor (82% admixed; pure clear-cell populations are actually uncommon, 4%).' },
    { key:'uniform', label:'Uniform high-grade nuclei', text:'Nuclei that look high-grade — large, with prominent nucleoli — yet stay strikingly uniform from cell to cell, the same real architectural contrast this atlas’s Ovary/clear cell entry draws against high-grade serous carcinoma’s field-wide pleomorphism.' },
  ],
};

// ============================================================
// CARCINOSARCOMA (ucs) — 4.7% of cases, real biphasic architecture: an epithelial (carcinoma)
// component and a mesenchymal (sarcoma) component within one tumor. TRUNK: TP53 alteration, and
// the genuinely novel finding this entry is built around — the SAME TP53 alterations recur in
// BOTH components of one tumor, real, direct evidence of a shared clonal origin rather than two
// independent tumors that happened to collide. McConechy et al. (J Pathol Clin Res, 2015, PMID
// 27499902, PMCID PMC4939881, n=30, 13 with components separately sequenced): "most of the
// mutations identified were present in both components, indicating a common origin"; "the same
// TP53 alterations... seen in the primary tumours were also identified in the metastatic
// sites." Zhao et al. (PNAS, 2016, PMID 27791010, PMCID PMC5087050, multiregion whole-exome
// sequencing of 6 tumors): 29 of 34 driver events (85%) were shared/root mutations across both
// components; concludes directly, "CS likely begins as carcinoma, followed by sarcomatous
// transformation." TP53 was a root (shared) mutation in 4 of 6 tumors. Garg et al. (Transl
// Oncol, 2025, PMID 40850250, whole-genome sequencing): "no significant differences in mutation
// frequency" between the carcinoma and sarcoma regions of the same tumors, across the whole
// cohort. Real range across the two most comprehensive sequencing methods: 90% (27/30,
// McConechy et al., 2015) to 94% (Garg et al., 2025) — far higher than an earlier recurrent-
// mutation-only count (Zhao et al., 2016, Table 1) that used a stricter Sanger-validated-hotspot
// counting rule, the same counting-rule distinction this atlas's own LUAD/CDKN2A entry already
// flags for a different gene.
//
// MOLECULAR-GROUP TRUNK-NOTE PROSE: Travaglino et al. (Int J Gynaecol Obstet, 2022, PMID
// 34536971, PMCID PMC9292561, systematic review, pooled n=263 across five real studies). Two
// DIFFERENT, correctly-separated claims, not one — caught and fixed after an independent
// citation-verification pass found an earlier draft conflating them: the verbatim quote, "Among
// UCS, the vast majority (>70%) fall into the TP53mut/p53abn group, which is consistent with its
// aggressive behavior," sits in the paper's own Introduction as established background, not as a
// finding from this review's own 5-study synthesis; that synthesis's own pooled figure, computed
// directly from its Table 1 (McConechy 76.7%, Cherniack 87.7%, Jones 44.4%, Gotoh 53.3%, Saijo
// 59.6%, over n=263), is ~63.5% — real, lower than the background quote, and now presented as its
// own separate number rather than folded into the >70% quote as if the two were one statement.
// MMRd ~17.1%, NSMP ~14.8%, POLEmut ~6.7% (of the subset assessed for POLE) round out the same
// pooled synthesis. A real, worth-stating outcome contrast: the POLE-ultramutated minority showed excellent prognosis in
// the pooled data (no recurrences or deaths), despite this cancer's overall aggressive behavior.
//
// BRANCH: PIK3CA and PPP2R1A, placed illustratively at different sites (data rule 2's standing
// disclosure) — no exclusivity claimed between them.
const REGIONS_UCS = [
  { id:'MA', name:'Tumor A', color:cssVar('--coral'), pos3d:{x:0.3,y:0.2,z:0.16},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'33% (Garg et al., Transl Oncol, 2025, whole-genome sequencing)', note:'Garg et al. (2025) found "no significant differences in mutation frequency" between the carcinoma and sarcoma components ACROSS ALL coding mutations in their cohort, a general finding this gene falls under rather than one the source singles out by name — consistent with this cancer’s own trunk-level finding that most mutations, not just TP53, are shared between the two components rather than exclusive to one.' } },
  { id:'MB', name:'Tumor B', color:cssVar('--coral'), pos3d:{x:-0.22,y:0.28,z:-0.1},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'33% (Garg et al., 2025)', note:'The same mutation as Tumor A.' } },
  { id:'MC', name:'Tumor C', color:cssVar('--azure'), pos3d:{x:0.12,y:-0.3,z:-0.18},
    branch:{ gene:'PPP2R1A mutation', class:'driver', ccf:'22% (Garg et al., 2025)', note:'Disrupts the PP2A phosphatase complex — the same gene this atlas’s Serous and Clear cell entries carry, real here too at a comparable rate. Site assignment is illustrative, per this atlas’s standing disclosure.' } },
  { id:'MD', name:'Tumor D', color:cssVar('--violet'), pos3d:{x:-0.28,y:-0.12,z:0.2},
    branch:{ gene:'PPP2R1A mutation', class:'driver', ccf:'22% (Garg et al., 2025)', note:'The same mutation as Tumor C.' } },
];
const TRUNK_UCS = [
  { gene:'TP53 alteration', class:'driver', ccf:'90% (27/30, McConechy et al., J Pathol Clin Res, 2015) to 94% (Garg et al., Transl Oncol, 2025, whole-genome sequencing) — far higher than an earlier recurrent-mutation-only count (Zhao et al., PNAS, 2016) that used a stricter Sanger-validated-hotspot counting rule rather than a lower true prevalence', note:'The real, distinctive finding this entry is built around: multiregion sequencing directly confirms the SAME TP53 alterations recur in BOTH the epithelial (carcinoma) and mesenchymal (sarcoma) components of one tumor (McConechy et al., 2015) — real, direct evidence of a shared clonal origin, not two independent tumors that happened to collide. Zhao et al. (PNAS, 2016) found 85% of driver mutations (29 of 34) were shared/root events across both components in multiregion-sequenced tumors, and concluded directly: "CS likely begins as carcinoma, followed by sarcomatous transformation" — the sarcoma component is thought to arise SECONDARILY from the carcinoma, via epithelial-mesenchymal transition, rather than the two arising independently. A real minority of true "collision tumors" (independently-arising carcinoma and sarcoma) is also documented and should not be discounted (McCluggage, J Clin Pathol, 2002, PMID 11986333, PMCID PMC1769650). MOLECULAR-GROUP NOTE: this histology is overwhelmingly p53-abnormal by molecular classification. A systematic review (Travaglino et al., Int J Gynaecol Obstet, 2022, n=263) opens by citing established background that "the vast majority (>70%) fall into the TP53mut/p53abn group" — and that review’s own 5-study pooled synthesis, computed directly from its own data (ranging 41–88% across the five individual cohorts), lands at a real, somewhat lower ~63.5% — with real minorities MMR-deficient (~17.1%), NSMP (~14.8%), and POLE-ultramutated (~6.7%, the group showing an unusually favorable prognosis — no recurrences or deaths in the pooled data, a real contrast with this cancer’s otherwise aggressive behavior).' },
];
const PRIVATE_POOL_UCS = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — genuinely new drawing code, dispatched from js/histology.js's own genCarcinosarcoma
// (checked directly against every existing generator before writing that one, same discipline
// this atlas's genATC entry already documents for itself): no prior generator combines a
// glandular/papillary epithelial component with a true spindle-cell sarcomatous component
// juxtaposed in one field, which is the single most diagnostic visual feature of this tumor
// type. Reuses TWO existing primitives rather than inventing new geometry from scratch:
// drawGlandRing (the epithelial/carcinomatous component, same primitive genEndometrioid
// dispatches) and genATC's own spindle-fascicle technique (the sarcomatous component) — a
// "partial reuse" tier composition, the same tier genProstateDuctal's frond+cribriform+gland
// combination already established. Homologous (leiomyosarcoma-like, ~60–66% across sources) vs.
// heterologous (rhabdomyosarcoma/chondrosarcoma-containing, ~34–40%) sarcoma types are named in
// prose rather than drawn as two different sarcoma textures — Rosati et al. (J Cancer Res Clin
// Oncol, 2023, PMID 36773091, PMCID PMC10356890, n=95 early-stage FIGO IA-II UCS specifically):
// 63.2% homologous / 36.8% heterologous,
// with the heterologous type an independent negative prognostic factor.
const HISTOLOGY_UCS = {
  intro: 'A sharply biphasic tumor — a genuine epithelial (carcinomatous) population of confluent glands sits directly adjacent to a distinct mesenchymal (sarcomatous) population of spindle-shaped cells arranged in fascicles, with a real, sharp boundary between them. Most cases (~60–66%) show a homologous sarcoma component (resembling tissue native to the uterus, such as smooth muscle); a real minority (~34–40%) show heterologous differentiation — sarcoma resembling tissue foreign to the uterus, most often cartilage (chondrosarcoma) or skeletal muscle (rhabdomyosarcoma), shown here as a small cartilage-like nodule. Multiregion sequencing shows the same driver mutations, including TP53, recurring in both components of one tumor — real evidence the two arise from one shared clonal origin rather than colliding as two independent tumors.',
  ariaSummary: 'Stylized microscopic field split by a diagonal seam: on the left, packed round gland openings (the carcinomatous component); on the right, bundles of elongated spindle-shaped cells running at different angles (the sarcomatous component), with a small pale nodule containing faint ring-like structures near the bottom right (a heterologous cartilage-like focus).',
  citation: 'McConechy et al., J Pathol Clin Res, 2015, PMID 27499902; Zhao et al., PNAS, 2016, PMID 27791010; Rosati et al., J Cancer Res Clin Oncol, 2023, PMID 36773091.',
  features: [
    { key:'epithelial', label:'Carcinomatous component', text:'A genuine epithelial population, here of confluent-gland (endometrioid-type) architecture — the same drawing technique as this organ’s own Endometrioid entry, since carcinosarcoma’s epithelial component is itself a real carcinoma type.' },
    { key:'sarcomatous', label:'Sarcomatous component', text:'A distinct mesenchymal population of spindle-shaped cells in fascicles, directly adjacent to the carcinomatous component with a sharp boundary between the two — the single most diagnostic visual feature of this tumor type.' },
    { key:'heterologous', label:'Heterologous differentiation (a real minority)', text:'A cartilage-like nodule, representing the real ~34–40% of cases where the sarcoma component resembles tissue foreign to the uterus (most often cartilage or skeletal muscle) rather than the more common homologous (smooth-muscle-like) pattern — an independent negative prognostic factor when present (Rosati et al., 2023).' },
  ],
};

export const cancerDetails = {
  uendo: {
    title:'Endometrioid Carcinoma', screenLabel:'Uterine endometrioid carcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases)',
    regions:REGIONS_UENDO, trunk:TRUNK_UENDO, privatePool:PRIVATE_POOL_UENDO,
    histology: HISTOLOGY_UENDO,
  },
  usero: {
    title:'Serous Carcinoma', screenLabel:'Uterine serous carcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases)',
    regions:REGIONS_USERO, trunk:TRUNK_USERO, privatePool:PRIVATE_POOL_USERO,
    histology: HISTOLOGY_USERO,
  },
  uclear: {
    title:'Clear Cell Carcinoma', screenLabel:'Uterine clear cell carcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases)',
    regions:REGIONS_UCLEAR, trunk:TRUNK_UCLEAR, privatePool:PRIVATE_POOL_UCLEAR,
    histology: HISTOLOGY_UCLEAR,
  },
  ucs: {
    title:'Carcinosarcoma', screenLabel:'Uterine carcinosarcoma — tumor explorer',
    legendTitle:'Sites (real distant metastases)',
    regions:REGIONS_UCS, trunk:TRUNK_UCS, privatePool:PRIVATE_POOL_UCS,
    histology: HISTOLOGY_UCS,
  },
};
