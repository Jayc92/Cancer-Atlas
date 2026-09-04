import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

// active:true. Alias collision check against every existing organ's aliases, including this
// same pass's new Testis entries: "bladder"/"urinary bladder"/"urothelial"/"urothelial
// carcinoma"/"transitional cell"/"vesical" — none collide. Deliberately NOT aliased:
// "adenocarcinoma" (already fans out to Lungs/Colon/Pancreas/Stomach; bladder adenocarcinoma is
// real but rare — see cancerEntries — and adding the bare word here would silently add a fifth
// organ to that existing fan-out for a subtype this organ doesn't even activate) and "squamous"
// (real elsewhere and not this organ's dominant subtype either).
export const organEntry = { key:'bladder', label:'Bladder', system:'Urinary', active:true, sexes:['female','male'], aliases:['bladder','urinary bladder','urothelial','urothelial carcinoma','transitional cell','vesical'] };

// Both sexes have a bladder in materially the same pelvic position (directly above the
// prostate in men; below/anterior to the uterus in women) — no sex-specific geometry problem
// like Skin's thigh-gap raycast or leg/chest split, so one point with no `sexes` filter applies
// to both bodies (the omit-filter default skin.js's own markerSpec comment documents). Height
// set just above Prostate's own marker (heightFrac 0.46): the bladder sits directly superior
// to the prostate in the male pelvis, so a slightly higher fraction is the anatomically honest
// choice, not an arbitrary offset — checked by live screenshot, adjusted if the first render
// missed the mesh.
export const markerSpec = { points:[{heightFrac:0.475, angle:0}] };

// Real bladder-primary denominators, ALL FOUR from the same source and the same cohort
// definition — chosen specifically so the shares are internally consistent with each other and
// with the metastatic-site figures cited later in this file (Wang et al., Front Oncol, 2023,
// PMC10605465, SEER 2010+: 48,789 conventional urothelial carcinoma + 1,683 neuroendocrine
// carcinoma + 1,667 squamous cell carcinoma + 1,003 adenocarcinoma, all confirmed BLADDER-
// PRIMARY in that paper's own methods, not pooled with renal-pelvis/ureteral tumors). Ordered by
// the real counts rather than by textbook convention — the source's own numbers put
// neuroendocrine carcinoma very slightly ahead of squamous cell carcinoma in this specific
// cohort, the opposite of the usual "SCC then ADC then small-cell" teaching order, so the real
// order is what's shown rather than the assumed one.
export const cancerEntries = [
  { id:'uc',      name:'Urothelial carcinoma',        share:'~92% of bladder-primary carcinomas (48,789/53,142, Wang et al., 2023)', active:true,  organKey:'bladder' },
  { id:'blnec',   name:'Neuroendocrine carcinoma',     share:'~3.2% of bladder-primary carcinomas (1,683/53,142) — rare and aggressive', active:false, organKey:'bladder' },
  { id:'blscc',   name:'Squamous cell carcinoma',      share:'~3.1% of bladder-primary carcinomas (1,667/53,142)', active:false, organKey:'bladder' },
  { id:'bladc',   name:'Adenocarcinoma',               share:'~1.9% of bladder-primary carcinomas (1,003/53,142)', active:false, organKey:'bladder' },
];

// REAL ANATOMY, not procedural — Human Reference Atlas 3D Reference Object Library, entry
// "urinary-bladder-male" v1.2, CC BY 4.0 (assets/bladder.glb — 199,044 bytes AS-SOURCED; the
// shipped file is meshopt-compressed since the 4A pass, 47,556 bytes, raw master at
// `git show a131649:assets/bladder.glb` — see CLAUDE.md's 4A entry). A female-body
// counterpart also exists at the same license (urinary-bladder-female v1.2) but was not used:
// with no anatomical reason to prefer one sex's mesh for a single representative "Explore"
// viewer — every other dual-sex internal organ in this app (Kidneys, Liver, Lungs, Breast)
// already shows ONE mesh regardless of which body the user toggled on the body screen — the
// smaller, faster-loading asset was chosen, the same size-conscious bias this app already shows
// (Prostate's own comment calls out being "the smallest of the five" GLBs as a plus, and Skin's
// whole-body asset was partly rejected for being large).
// SEGMENTATION IS REAL AND NAMED, not guessed: the source GLB ships six separately-named
// anatomical sub-meshes (urinary_bladder_neck_smooth_muscle, fundus_of_urinary_bladder_dome,
// ureteral_orifice_L/R, fundus_of_urinary_bladder_base1, trigone_of_urinary_bladder), each
// carrying its own UBERON/FMA ontology id in the file's extras. Every hotspot anchor below is
// the ACTUAL vertex centroid of its named sub-mesh, computed directly from the binary buffer
// (glTF's accessor-level byteOffset is additive to its bufferView's own byteOffset — a real
// parsing bug caught mid-computation when the trigone sub-mesh's naive centroid landed far
// outside its own accessor-declared bounding box; every centroid was recomputed after the fix),
// nudged outward from the mesh's overall centroid by a fixed 35% — the same "real landmark, not
// a guess" discipline as Prostate's central-zone point, one step more precise since these
// centroids come from named ontology-tagged geometry rather than a manually-located seam.
// Overall bounding box: 6.38 x 3.99 x 7.23 cm — a plausible partially-filled adult bladder.
// MATERIAL COLOR: the weakest-sourced parameter in this file, flagged rather than dressed up —
// no fetched source gave a gross color for bladder mucosa or wall specifically (same gap Testis
// hit for testicular parenchyma). 0xd9a8a0 is a plain pale pink-tan, the commonly-illustrated
// tone for bladder mucosa, chosen the same honest way as Testis's color and Skin's hypodermis.
// MATERIAL/LIGHTING REALISM PASS — shared recipe (roughness x0.82, specularIntensity 0.15->0.25,
// per-vertex tissue mottle at amplitude 0.28) applied uniformly across all nine real-scan
// organs; full mechanism, clip-safety reasoning, and the transmission investigation's null
// result are in liver.js's own comment (the canonical write-up) and this pass's dated CLAUDE.md
// entry. Color unchanged (0xd9a8a0 stays the plain pale pink-tan placeholder this file's own
// MATERIAL COLOR comment above already flags as its weakest-sourced parameter — the realism
// pass doesn't touch that gap either way). Seed 11.7 (organ #9 in ORGAN_MODULES' order x1.3).
export function buildBladderMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/bladder.glb', (gltf)=>{
      const mat = new THREE.MeshPhysicalMaterial({ color:0xd9a8a0, roughness:0.48, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 11.7, {freq:4}); } });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Urinary System', title:'Bladder',
  sub:'Pelvic reservoir · lined by urothelium · stores &amp; expels urine',
  facts:[
    {label:'Location', val:'Lesser pelvis when empty; rises into the abdomen as it fills'},
    {label:'Parts', val:'Apex (dome), body, fundus (base), and neck (StatPearls)'},
    {label:'Capacity', val:'Up to ~500 mL of urine'},
    {label:'Lining', val:'Urothelium (transitional epithelium) — cells flatten as the bladder fills to accommodate volume'},
    {label:'Blood supply', val:'Superior &amp; inferior vesical arteries, indirect branches of the internal iliac arteries'},
  ],
  // The "arises here" fact needs care: the trigone is the most anatomically DISTINCTIVE part of
  // the bladder wall (fixed, non-distensible, developmentally different — verified directly:
  // "The mesonephric ducts and ureteric buds connect to the posterior bladder wall and form a
  // part of the trigone," StatPearls), but it is NOT where most urothelial carcinoma actually
  // starts. That honor belongs to the lateral walls (8,056 of a real ~19,000-tumor
  // origin-subsite breakdown — more than double the trigone's 2,977, Wang et al., 2023) — a
  // real finding stated plainly rather than let the trigone's anatomical distinctiveness imply
  // false primacy.
  desc:'The bladder is a muscular reservoir in the lesser pelvis, distending upward into the abdomen as it fills with up to about 500 mL of urine before the urge to void becomes hard to ignore. Its entire inner surface is lined by urothelium — transitional epithelium whose cells flatten out to accommodate a filling bladder and round back up once it empties — and urothelial carcinoma can arise anywhere along that lining. Real registry data shows the lateral walls are actually its single most common site of origin, ahead of the trigone, the smooth triangular patch of fixed, non-distensible wall bounded by the two ureteral openings above and the internal urethral opening below — developmentally distinct from the rest of the bladder, formed in part from the same embryonic ducts that become the ureters. This cancer does not have one dominant founding mutation the way most cancers in this atlas do: it splits early into two molecularly distinct roads, one running through FGFR3 and staying largely non-invasive, the other through TP53 and turning aggressive — a split covered where the mutation panel can show it properly.',
  buildMesh: buildBladderMesh,
  // Real-world-meter GLB — viewer distances scaled from Prostate's own real-GLB numbers by the
  // ratio of bounding-box largest dimension (Prostate ~5.2cm -> radius 0.13; Bladder ~7.23cm ->
  // radius ~0.18), same derivation, not a fresh guess.
  viewer:{ theta:0.5, phi:1.15, radius:0.18, minRadius:0.04, maxRadius:0.42, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a bladder, a rounded pale pink-tan organic form, with '
    + 'four glowing teal points marking the structures listed after it. Drag to rotate, scroll '
    + 'to zoom.',
  // pos: literal anchor points (meters, local mesh space) — the real, named sub-mesh centroids
  // described in the buildMesh comment above, nudged outward from the mesh's overall centroid
  // so each marker clears the surface rather than sitting buried in it.
  // NUDGE FACTOR — caught and fixed in review, not assumed safe from one screenshot: the first
  // shipped factor (1.35, chosen by eye against the two large sub-meshes, dome/base1) pushed the
  // two SMALL, tight sub-meshes past their own real geometry — Neck (114 vertices, an 8mm-tall
  // taper) landed at y=0.00677, below its own sub-mesh's bounding-box minimum of y=0.01044, and
  // Ureteral orifices similarly exceeded its own bbox — both computed and confirmed directly
  // against each sub-mesh's real bounding box, not eyeballed. A live rotated screenshot showing
  // Neck floating visibly off the mesh silhouette (see the Testis+Bladder review packet) is what
  // prompted the check. Re-swept 1.35 down to 1.15, the largest factor at which EVERY point
  // (Wall, Trigone, Ureteral orifices, Neck) stays within its own sub-mesh's real bounding box —
  // confirmed numerically before shipping, not just re-eyeballed.
  hotspots:[
    { key:'wall', label:'Bladder wall (dome)', pos:[-0.0048,0.04357,0.01832],
      text:'The dome, the bladder\'s uppermost, most distensible surface — lined, like the rest of the organ, by urothelium. Urothelial carcinoma can start anywhere along this lining, and real registry data shows the single most common site of origin is actually the lateral walls (8,056 of a ~19,000-tumor breakdown), ahead of the trigone shown alongside this point.' },
    { key:'trigone', label:'Trigone', pos:[-0.00156,0.0279,-0.01205],
      text:'A smooth, fixed triangular patch of wall, bounded above by the two ureteral openings and below by the internal urethral opening — the one part of the bladder that does not stretch as the organ fills. Developmentally distinct from the rest of the bladder: the ureteric buds and mesonephric ducts contribute directly to it during formation.' },
    { key:'ureteric', label:'Ureteral orifices', pos:[-0.00266,0.04598,-0.01456],
      text:'The paired slit-like openings where the left and right ureters deliver urine from the kidneys — the bladder\'s entry points, sitting at the trigone\'s upper corners.' },
    { key:'neck', label:'Bladder neck', pos:[0.00021,0.01072,-0.0053],
      text:'The bladder\'s lowest point, where it narrows into the urethra — encircled by the internal urethral sphincter that keeps urine in until voiding begins.' },
  ],
};

// ============================================================
// UROTHELIAL CARCINOMA
// ============================================================
// DESIGN GATE — resolved before writing a single line of region data, per the standing rule that
// a genuine two-vs-one-entry question gets settled first. The candidate was two cancer entries
// (an "FGFR3-pathway" NMIBC entry and a "TP53-pathway" MIBC entry), modeled on Ovary's two
// active cancers. REJECTED, for a reason worth recording precisely: the pooled FGFR3/TP53
// mutation anti-correlation that would have justified two entries is a STAGE CONFOUND, not a
// real biological exclusivity. Neuzillet et al. (PLoS ONE, 2012, PMC3521761, 535+382 tumours):
// significant pooled (OR 0.25) and within pT1 (OR 0.47) — but "no dependence was detected in the
// five tumour groups considered" and, verbatim, the correlation is ABSENT within pTa alone (OR
// 0.56, p=0.12) and ABSENT within MIBC alone (OR 0.99, p=0.35). A correlation that vanishes once
// you stratify by stage is exactly the trap this atlas's CLAUDE.md now names as a standing check
// (see the stratification-trap entry added there in this same pass): pooled significance that
// looks like biology can be a cohort-composition artifact instead. Two structural reasons this
// mattered here specifically: NMIBC/MIBC is a STAGE, not a histologic entity, and this atlas's
// `share` field reads as a histologic percentage — building two entries on a stage split would
// have silently relabeled a stage as if it were a different cancer. And a real,
// stage-INDEPENDENT trunk event exists and was sitting right there once looked for: TERT
// promoter mutation (below) — Rachakonda et al. (PLoS ONE, 2013, PMC3808633, n=327): 65.4%,
// "with even distribution across different stages and grades," VERBATIM. RULING: one entry,
// "Urothelial carcinoma," with a two-entry trunk (TERT promoter + a pathway-divergence status
// entry) and FGFR3/TP53 assigned as branch genes at different sites — the same architectural
// move this atlas already used for GBM's IDH-status entry and OCCC's TP53-status entry, not a
// new pattern.
// SITES — four real, well-quantified metastatic destinations, all from the SAME bladder-primary
// cohort as the subtype shares above (Wang et al., 2023, among the 8.8% of 48,789 conventional-
// UC patients with any metastasis, n=4,317 with a recorded site; no significant difference by
// histology): bone 38.3% (1,608/4,194), lymph nodes 36.8% (792/2,153), lung 33.5% (1,399/4,181),
// liver 22.6% (948/4,190) — denominators differ per site because not every metastatic record
// reports every site. Bone leading is a real, direct echo of this atlas's own Prostate cancer,
// whose metastatic spread is overwhelmingly bone-dominant (90% of hematogenous metastases,
// Bubendorf et al., 2000) — a genuine cross-organ pattern, not a forced comparison, so it gets
// one line in the Bone site's branch note rather than a bigger claim.
// GENE-TO-SITE MAP — evidence-driven, not assigned for narrative convenience. The full
// exclusivity/co-occurrence picture comes from TCGA's bladder paper (Robertson et al., Cell,
// 2017, PMC5687509) and one metastatic-cohort paper, checked against every pairing before
// anything was placed:
//  - CDKN2A is mutually exclusive with TP53 (q&lt;0.2) — placed at a DIFFERENT site than TP53.
//  - CDKN2A CO-OCCURS with FGFR3 (7% of tumors, "which may be MIBCs that have progressed from
//    non-invasive tumors") — real and positive, but the branch schema is one gene per site, so
//    the co-occurrence is carried in each gene's own note rather than invented as a shared site.
//  - ERBB2 is anti-correlated with FGFR3 specifically in metastatic urothelial carcinoma (OR
//    0.47, p=0.010, n=1,014, "complementary distribution") — placed at a different site than
//    FGFR3, the same real-finding-drives-placement discipline as Bladder's own trunk decision.
//  - RB1 co-occurs with TP53 (q&lt;0.2) — real, but not given its own site; it rides along in
//    TP53's own note instead of claiming a fifth site this schema doesn't have room for.
// POS3D — optimized against the site viewer's default camera (theta 0.6, phi 1.15) using the
// standing projected-separation method (raw 3D distance is insufficient). A first pass with
// Bone isolated and Lymph nodes/Lung/Liver stacked mainly along Y produced a real but tight
// 80px minimum (Lymph nodes~Lung) once projected — passing the no-overlap check but tighter
// than this atlas's post-CRC standard — so X/Z were widened and Y de-clustered for those three,
// live-probed up to a 114px minimum (Bone~Lung), comfortably inside this atlas's normal shipped
// range (luad 112 / tnbc 96 / melanoma 99 sit at a similar level; crc/pdac/gdiff/hcc/ccrcc run
// higher at 123-165).
const REGIONS_UC = [
  { id:'BE', name:'Bone', color:cssVar('--coral'), pos3d:{x:0.3,y:-1.85,z:0.4},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'~48&ndash;49% of urothelial carcinoma (TCGA, 2017; 49.3% in an independent 410-tumor cohort computed directly for this atlas)', note:'The genome\'s damage-response checkpoint, disabled — the founding event on this cancer\'s aggressive, MIBC-associated road (see the Trunk panel\'s pathway-divergence entry). In a real metastatic cohort, TP53 mutation was specifically associated with osseous metastases (relative risk 1.9, P=.02) and with lymphadenopathy (relative risk 1.7, P=.002) (Alessandrino et al., 2020) — and bone is this cancer\'s single most common metastatic site (38.3% of metastatic patients), a genuine echo of this atlas\'s own Prostate cancer, whose spread is likewise overwhelmingly bone-dominant. Co-occurs with RB1 loss (q&lt;0.2, TCGA) more often than chance, consistent with both sitting on the same cell-cycle-checkpoint side of this cancer\'s pathway split.' } },
  { id:'LM', name:'Lymph nodes', color:cssVar('--azure'), pos3d:{x:-2.05,y:-0.05,z:-0.55},
    branch:{ gene:'CDKN2A loss', class:'driver', ccf:'~22% by strict focal-deletion criteria (copy number &lt;1; TCGA, 2017), ~32&ndash;33% by the broader GISTIC deep-deletion call used in most re-analyses (computed directly for this atlas, both major TCGA cohort versions) &mdash; the same event measured two ways, not a real disagreement', note:'A cell-cycle brake, lost — most often by focal deletion rather than point mutation. Its own paper states the two figures precisely: "the most common recurrent (22%) focal deletion (copy number &lt;1) contained CDKN2A" &mdash; a strict absolute threshold &mdash; while the more commonly cited ~32&ndash;33% uses GISTIC\'s relative "deep deletion" call on the same underlying data. Mutually exclusive with TP53 and RB1 (q&lt;0.2, TCGA) &mdash; kept at a different site than either &mdash; but positively CO-OCCURS with FGFR3 in about 7% of tumors, flagged in TCGA\'s own data as tumors "which may be MIBCs that have progressed from non-invasive" FGFR3-driven disease. Lymph-node involvement is this cancer\'s second most common metastatic site (36.8% of metastatic patients), with no significant difference by histologic subtype.' } },
  { id:'LP', name:'Lung', color:cssVar('--amber'), pos3d:{x:2.1,y:0.35,z:0.65},
    branch:{ gene:'FGFR3 mutation', class:'driver', ccf:'~14&ndash;26% depending on cohort (14.4% in a 410-tumor computed cohort; 26% of biopsies in a metastatic-disease series, Loriot et al., 2024)', note:'An activating growth-factor-receptor mutation and the founding event of this cancer\'s OTHER road: the low-grade, largely non-invasive pathway. Billerey et al. (2001, PMC1891972, 132 tumours) is the sharpest demonstration of how strongly stage-linked this gene is on its own: 74% of pTa tumours (37/50) carried it versus 0% of carcinoma in situ (0/20) and only 16% of pT2-4 &mdash; and by grade, 84% of G1 falling to 7% of G3. Anti-correlated with ERBB2 specifically in metastatic disease (odds ratio 0.47, p=0.010, "complementary distribution," n=1,014) &mdash; kept at a different site than ERBB2 for that reason. This cancer metastasizes to lung in 33.5% of metastatic patients, its third most common site.' } },
  { id:'LI', name:'Liver', color:cssVar('--violet'), pos3d:{x:0.15,y:2.15,z:-0.65},
    branch:{ gene:'ERBB2 (HER2) alteration', class:'driver', ccf:'~12&ndash;15% (12.2% mutation in a 410-tumor computed cohort, matching TCGA\'s own reported 12% almost exactly; amplification separately 5.4&ndash;7.4% across cohorts; 14.5% oncogenic-altered overall in a 2,035-tumor cohort)', note:'A growth-factor receptor gene, activated by mutation or amplification &mdash; real, actionable, and the target of HER2-directed therapy already established in other cancers. Anti-correlated with FGFR3 in metastatic disease (see the Lung site\'s note) &mdash; kept at a different site for that reason. Liver is this cancer\'s fourth real metastatic site, at 22.6% of metastatic patients.' } },
];

// TRUNK — two entries, the same GBM-classifier/OCCC-status architecture this atlas already
// uses when a cancer's defining fact is better represented as a status than a single mutation.
// TERT is genuinely trunk-level and, critically, STAGE-INDEPENDENT — the property that let this
// organ avoid the two-cancer-entries trap above. Rachakonda et al. (2013): 65.4% (214/327),
// "with even distribution across different stages and grades" (verbatim); Allory et al. (Eur
// Urol, 2014): 70% (78/111) in a primary NMIBC cohort and 79% (282/357) in an independent
// cohort, C228T alone 83%, "not associated with clinical or pathologic parameters," and MORE
// frequent in FGFR3-mutant tumours specifically (p=0.0002) &mdash; a real, positive association
// with one of the two branch genes below, stated as cooperation rather than conflict because
// that is what the source shows.
const TRUNK_UC = [
  { gene:'TERT promoter mutation (C228T / C250T)', class:'driver', ccf:'~65&ndash;79% across independent cohorts (65.4%, 214/327, Rachakonda et al., 2013; 70&ndash;79% in two cohorts, Allory et al., 2014) &mdash; evenly distributed across stage and grade', note:'Two possible single-letter changes in the gene\'s ON switch, not the gene itself &mdash; the same class of lesion as this atlas\'s Melanoma and HCC trunks, both of which also carry a TERT promoter mutation, making this the atlas\'s third TERT-trunk cancer. Unlike the pathway-divergence status below, this event is explicitly STAGE-INDEPENDENT: "even distribution across different stages and grades" (Rachakonda et al., 2013) and "not associated with clinical or pathologic parameters" (Allory et al., 2014) &mdash; which is exactly why it, and not the FGFR3/TP53 split, is this cancer\'s true trunk-level event. It is also more frequent specifically in FGFR3-mutant tumours (p=0.0002, Allory et al.) &mdash; a real, positive association with one of the two branch genes below.' },
  { gene:'Pathway-divergence status (FGFR3-driven vs. TP53-driven)', class:'driver', ccf:'a real, verified STAGE CONFOUND when checked, not a hard biological exclusivity &mdash; Neuzillet et al. (2012): significant pooled (OR 0.25) but absent within pTa alone (OR 0.56, p=0.12) and absent within MIBC alone (OR 0.99, p=0.35)', note:'This cancer does not have one dominant founding mutation &mdash; it splits early into two molecularly distinct roads, one running through FGFR3 and staying largely non-invasive and low-grade, the other through TP53 and turning invasive and high-grade. The temptation this atlas deliberately avoided: treating the pooled FGFR3/TP53 anti-correlation as proof the two are biologically exclusive and building two separate cancer entries on it. Checked directly, that correlation dissolves once tumours are stratified by stage &mdash; "no dependence was detected in the five tumour groups considered" &mdash; meaning the pooled signal is largely a stage-composition artifact, not a hard either/or rule at the tumor-biology level. FGFR3 and TP53 are shown as branch genes at different sites for that reason, a real but softer distinction than true mutual exclusivity.' },
];

// PRIVATE POOL — checked against every branch gene above (FGFR3, TP53, CDKN2A, ERBB2) and the
// TERT trunk before inclusion; neither candidate appears in TCGA's own stated exclusivity list
// (CDKN2A&perp;TP53, CDKN2A&perp;RB1, CDKN2A&perp;E2F3, TP53&perp;MDM2, FGFR3&perp;RB1,
// FGFR3&perp;E2F3), so both are safe to draw into cells at every site regardless of that site's
// branch gene &mdash; the same cross-site safety check this atlas has applied to every private
// pool since OCCC.
const PRIVATE_POOL_UC = [
  { gene:'KMT2C mutation', class:'driver', ccf:'~18% (TCGA, 2017) &mdash; the single most frequently mutated chromatin-modifying gene in this cancer outside the branch/trunk genes above', note:'A histone-methyltransferase gene, recurrently disrupted &mdash; part of the same broad chromatin-remodeling vulnerability this atlas has already found in several other cancers (ARID1A in Liver and Ovary, ARID2 in Liver and Skin), here showing up as a different gene in the same functional family.' },
  { gene:'ATM mutation', class:'driver', ccf:'~14% (TCGA, 2017)', note:'A DNA-damage-response gene, recurrently mutated &mdash; a different route to genomic instability than TP53 loss, on an independent axis from either branch of this cancer\'s pathway split.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY — PathologyOutlines was unreachable for this pass (HTTP 429, the same block the
// OCCC and Seminoma passes hit), so the morphologic load rests on a 2026 open-access grading
// review (Grading of bladder cancer: updates, controversies and practical solutions, PMC12700064)
// that quotes the WHO 1973/2004 grading criteria directly. High-grade invasive disease is drawn
// (not low-grade) because it is the histologic picture that actually matches this organ's own
// trunk framing: "almost all MIBC cases are high grade," verbatim, in the same review. Verbatim
// high-grade cytology, straight from that source's own grading table: "Enlarged pleomorphic
// nuclei, hyperchromasia, prominent nucleoli, frequent mitoses, umbrella cells often -" (contrast:
// low grade reads "...umbrella cells +") &mdash; the umbrella-cell loss is drawn as a real,
// concrete, visually distinctive feature rather than left as a caveat in prose. Architecture:
// "a prominent fibrovascular core is present denoting a 'true' papillary structure," with
// high-grade disease additionally showing "predominantly disordered, loss of polarity."
// Deliberately NOT drawn: any specific squamous or glandular differentiation pattern (real in a
// minority of urothelial carcinomas but this slide depicts the ordinary/conventional
// histology, not a divergent-differentiation variant, the same restraint HGSOC's slide showed
// by depicting the ordinary appearance rather than every documented variant pattern).
const HISTOLOGY_UC = {
  intro: 'Depicted here is high-grade invasive urothelial carcinoma — the histologic picture behind almost all muscle-invasive disease. Where the tumor still shows papillary structure, true papillae carry a prominent fibrovascular core; but the defining high-grade features are cytologic and architectural at once: complete loss of the normal cell-layering and polarity, enlarged and markedly pleomorphic nuclei, coarse hyperchromatic chromatin, prominent nucleoli, and frequent mitoses. The umbrella cells that cap normal urothelium and most low-grade tumors are, in the review\'s own wording, "often absent" here — one more thing high-grade disease has lost along with its architecture. Invasive tongues and nests infiltrate the underlying stroma and muscle rather than staying confined to a papillary surface.',
  ariaSummary: 'Stylized microscopic field: an irregular papillary frond with a fibrovascular core at upper left, covered by disordered, piled-up dark cells with no visible surface umbrella cells. Below and to the right, invasive nests and tongues of the same markedly pleomorphic cells infiltrate a pale pink stroma; several nuclei show coarse dark chromatin and prominent nucleoli, and two cells are caught mid-division.',
  citation: 'Grading of bladder cancer: updates, controversies and practical solutions (PMC12700064, 2026) — WHO 1973/2004 grading criteria quoted directly.',
  features: [
    { key:'papillary', label:'Papillary core, disordered surface',
      text:'Where papillary architecture survives, a true papillary frond carries a prominent fibrovascular core — but the covering cells show "predominantly disordered, loss of polarity, any thickness, dyscohesive cells," the high-grade end of the same architectural spectrum a low-grade tumor\'s ordered, uniform layering sits at the other end of.' },
    { key:'nuclei', label:'Pleomorphic, hyperchromatic nuclei',
      text:'Verbatim from the grading criteria this slide follows: "enlarged pleomorphic nuclei, hyperchromasia, prominent nucleoli, frequent mitoses" — and, in the same source\'s own contrast, umbrella cells are "often absent" here, versus present in low-grade disease.' },
    { key:'invasion', label:'Invasive nests',
      text:'Nests and tongues of the same high-grade cells infiltrating the stroma and muscularis, rather than staying confined to the surface — the architectural step that turns non-muscle-invasive disease into muscle-invasive disease, and the reason the WHO recommends grading essentially all invasive carcinoma as high grade regardless of any papillary component that remains.' },
  ],
};

export const cancerDetails = {
  uc: {
    title:'Urothelial Carcinoma', screenLabel:'Urothelial carcinoma — tumor explorer',
    legendTitle:'Sites (real metastatic pattern, bone-dominant)',
    regions:REGIONS_UC, trunk:TRUNK_UC, privatePool:PRIVATE_POOL_UC,
    histology: HISTOLOGY_UC,
  },
};
