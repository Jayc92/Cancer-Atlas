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
// with the metastatic-site figures cited later in this file (Park, Curr Oncol, 2023,
// doi:10.3390/curroncol30100656, PMC10605465, SEER 2010+: 48,789 conventional urothelial
// carcinoma + 1,683 neuroendocrine — CITATION METADATA CORRECTED at the durability pass,
// 2026-09-04: this was recorded as "Wang et al., Front Oncol", BOTH author and journal wrong —
// "Wang J." is an entry in the paper's own reference list, a transcription slip at entry. The
// PMCID was correct all along and is what recovered it after six metadata-based searches
// failed; every figure below re-verified VERBATIM at the permanent address ("A total of 48,789
// patients with conventional UC, 1683 with NEC, 1667 with SCC, and 1003 with ADC were
// identified"; the paper is a SEER 17-registry extraction, 2010+, i.e. registry data, and
// 53,142 is this atlas's computed sum of the four counts, not a figure the paper prints).
// carcinoma + 1,667 squamous cell carcinoma + 1,003 adenocarcinoma, all confirmed BLADDER-
// PRIMARY in that paper's own methods, not pooled with renal-pelvis/ureteral tumors). Ordered by
// the real counts rather than by textbook convention — the source's own numbers put
// neuroendocrine carcinoma very slightly ahead of squamous cell carcinoma in this specific
// cohort, the opposite of the usual "SCC then ADC then small-cell" teaching order, so the real
// order is what's shown rather than the assumed one.
// blnec's SHARE FIGURE CARRIES A REAL, DISCLOSED DENOMINATOR GAP (2026-09-13, ordinary-organ
// batch): Park et al. 2023's own "NEC" bucket pools THREE ICD-O-3 codes together (8013/3 large
// cell neuroendocrine carcinoma, 8041/3 small cell carcinoma NOS, 8246/3 neuroendocrine
// carcinoma NOS), confirmed directly from the paper's own Methods. Independent, dedicated
// sources checking a narrower "pure small cell carcinoma" definition read well below 1% (Koay
// et al., SEER 1991-2005, PMID 21567387: 0.7%; WHO's own figure as cited by two 2025-2026
// reviews: "under 1%"). Kept at Park's 3.2% for internal consistency with this organ's own
// uc/blscc/bladc share figures (same cohort, same denominator), with the gap disclosed rather
// than silently resolved in either direction — the two figures are answering slightly different
// questions (a three-code registry bucket vs. a strict single-entity definition), not
// contradicting each other.
export const cancerEntries = [
  { id:'uc',      name:'Urothelial carcinoma',        share:'~92% of the four commonest bladder-primary carcinoma types (48,789/53,142, Park, Curr Oncol, 2023, SEER)', active:true,  organKey:'bladder' },
  { id:'blnec',   name:'Neuroendocrine carcinoma',     share:'~3.2% of the four commonest bladder-primary carcinoma types (1,683/53,142, Park, Curr Oncol, 2023) — a pooled 3-code registry bucket; dedicated series restricted to pure small cell carcinoma read well under 1% (Koay et al., 2011)', active:true, organKey:'bladder' },
  { id:'blscc',   name:'Squamous cell carcinoma',      share:'~3.1% of the four commonest bladder-primary carcinoma types (1,667/53,142, Park, Curr Oncol, 2023) — a US figure; up to ~75% of bladder cancers in schistosomiasis-endemic regions', active:true, organKey:'bladder' },
  { id:'bladc',   name:'Adenocarcinoma',               share:'~1.9% of the four commonest bladder-primary carcinoma types (1,003/53,142, Park, Curr Oncol, 2023) — non-urachal (vesical) adenocarcinoma specifically; urachal adenocarcinoma is a separate, rarer entity (well under 1% of all bladder cancers)', active:true, organKey:'bladder' },
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
// MATERIAL COLOR — FORMALLY DOWNGRADED to illustrative (citation-durability pass, 2026-09-04;
// manifest entry col-bladder in .claude/citations.json). This comment always said it: no
// fetched source gave a gross color for bladder mucosa or wall specifically (same gap Testis
// hit). 0xd9a8a0 is a plain pale pink-tan, the commonly-illustrated tone, chosen the same
// honest way as Testis's color and Skin's hypodermis. The downgrade is now also disclosed in
// the user-facing #disclaimer (tissue colours illustrative except where cited), not only here.
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
  sub:'Pelvic reservoir · lined by urothelium · stores & expels urine',
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
  // origin-subsite breakdown — more than double the trigone's 2,977, Park, Curr Oncol, 2023) — a
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
      text:'A smooth, fixed triangular patch of wall, bounded above by the two ureteral openings and below by the internal urethral opening — the one part of the bladder that does not stretch as the organ fills. Developmentally distinct from the rest of the bladder: the ureteric buds and mesonephric ducts contribute directly to it during formation. Non-urachal bladder adenocarcinoma most often arises here, in glandular metaplasia (cystitis glandularis) at the bladder neck and trigone, a genuinely different route from urothelial carcinoma\'s own lateral-wall predominance.' },
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
// promoter mutation (below) — Rachakonda et al. (PNAS, 2013, PMC3808633, n=327): 65.4%,
// "with even distribution across different stages and grades," VERBATIM. RULING: one entry,
// "Urothelial carcinoma," with a two-entry trunk (TERT promoter + a pathway-divergence status
// entry) and FGFR3/TP53 assigned as branch genes at different sites — the same architectural
// move this atlas already used for GBM's IDH-status entry and OCCC's TP53-status entry, not a
// new pattern.
// SITES — four real, well-quantified metastatic destinations, all from the SAME bladder-primary
// cohort as the subtype shares above (Park, Curr Oncol, 2023, among the 8.8% of 48,789 conventional-
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
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'~48&ndash;49% of urothelial carcinoma (TCGA, 2017; 49.3% in an independent 410-tumor cohort computed directly for this atlas)', note:'The genome\'s damage-response checkpoint, disabled — the founding event on this cancer\'s aggressive, MIBC-associated road (see the Trunk panel\'s pathway-divergence entry). In a real 103-patient muscle-invasive urothelial cancer cohort followed by serial imaging, TP53 mutation was specifically associated with osseous metastases (relative risk 1.9, P=.02) and with lymphadenopathy (relative risk 1.7, P=.002) (Alessandrino et al., 2020) — and bone is this cancer\'s single most common metastatic site (38.3% of metastatic patients), a genuine echo of this atlas\'s own Prostate cancer, whose spread is likewise overwhelmingly bone-dominant. Co-occurs with RB1 loss (q&lt;0.2, TCGA) more often than chance, consistent with both sitting on the same cell-cycle-checkpoint side of this cancer\'s pathway split.' } },
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
// Urol, 2014): 70% (78/111) in a first series the paper describes as UBCs "of different
// stages" — NOT an NMIBC cohort, which is what this comment said until the batch-3 read; that
// mis-scoping contradicted the very argument it supports, since the stage-independence below
// IS the source's own framing ("high frequency across stages" is in its title) — and 79%
// (283/357) in an independent set (184 non-muscle-invasive + 173 muscle-invasive). The
// numerator was 282 here for the same span of time: 282/357 = 78.99% and 283/357 = 79.27%
// both print as "79%", so no percentage could betray it and fraction_check cannot see it
// (see that tool's header). C228T alone 83%, "not associated with clinical or pathologic
// parameters," and MORE
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
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
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

// ============================================================
// BLADDER NEUROENDOCRINE CARCINOMA (blnec) — 2026-09-13, ordinary-organ batch. Every citation
// verified directly at the source. Modeled as small cell carcinoma specifically (the dominant
// real form — Akbulut et al., Adv Anat Pathol, 2024, PMID 38523484, PMCID PMC11006587,
// verbatim: "The most common neuroendocrine tumor in the urinary bladder is small cell
// carcinoma"), not carcinoid or paraganglioma. Two trunk entries, the same GBM-classifier/UC-
// TERT architecture this organ already uses: TP53+RB1 concurrent loss (transformation-defining
// — the event demonstrated to drive lineage switching, not merely correlated with it) plus
// TERT promoter mutation, the SAME event this organ's own UC trunk already carries, real and
// near-universal here too — Chang et al., Clin Cancer Res, 2018, PMID 29180607, directly
// concludes bladder small cell carcinoma shares "a cell of origin" with urothelial carcinoma,
// which is exactly why one trunk event (TERT) is inherited from that shared lineage while a
// second, distinct event (TP53+RB1) marks the divergence into neuroendocrine differentiation.
const TRUNK_BLNEC = [
  { gene:'TP53 mutation with concurrent RB1 loss', class:'driver', ccf:'TP53 87%, RB1 70%, with RB1 co-mutation in 77% of TP53-mutant tumors (Jaime-Casas et al., JCO Precis Oncol, 2025 — n=149, the largest bladder small cell carcinoma cohort among the sources checked in this pass)', note:'Shen et al. (Oncogene, 2018) reported experimental evidence that combined TP53+RB1 depletion "favored lineage switching from oncogene-addicted urothelial cancer cells to neuroendocrine-like tumor cells" — the paper\'s own words, presented there as preliminary rather than settled, but still a functional demonstration rather than a purely statistical association, the same fourth kind of truncal justification this atlas\'s Prostate neuroendocrine carcinoma entry already uses. Cheng et al. (Am J Pathol, 2005) found 90% concordant allelic-loss patterns between the neuroendocrine and urothelial components of tumors containing both, direct molecular proof this cancer arises from a shared urothelial-lineage precursor rather than independently.' },
  { gene:'TERT promoter mutation (C228T / C250T)', class:'driver', ccf:'~75% (Jaime-Casas et al., 2025); 100% (11/11) in a smaller series specifically comparing bladder-origin small cell carcinoma against other organs\' own small cell carcinomas (Zheng et al., J Hematol Oncol, 2014)', note:'The same trunk event this organ\'s own urothelial carcinoma entry carries — real evidence this cancer inherits it from the shared urothelial precursor lineage rather than acquiring it independently. Zheng et al. found this exact mutation in 0 of 20 lung, 2 prostate, 5 Merkel cell, and 6 other-site small cell carcinomas tested, suggesting it could distinguish bladder-origin small cell carcinoma from small cell carcinoma arising elsewhere.' },
];
// Branch pair — a real, directly documented mutually-exclusive molecular subtyping system
// (Akbulut et al., Mod Pathol, 2024, PMID 38964503, PMCID PMC11490389, verbatim: "POU2F3+ tumors
// were mutually exclusive with those expressing ASCL1 and NEUROD1"), the same lineage-
// transcription-factor architecture lung SCLC's own ASCL1/NEUROD1/POU2F3/YAP1 subtyping uses.
// AN INDEPENDENT CITATION-VERIFICATION PASS (2026-09-13) CORRECTED THE DENOMINATOR: the paper's
// full cohort is 103 small cell carcinoma (SMC) + 19 large cell neuroendocrine carcinoma (LCNEC)
// = 122 total, but the specific co-expression percentages below are computed on a pooled
// 116-tumor subset with data for all three markers (both SMC and LCNEC cases), not on the
// 103-tumor SMC-only cohort this file previously said — the paper's own stated reason for pooling
// is "we did not observe a significant difference in the expression of ASCL1, NEUROD1 and POU2F3
// between SMC and LCNEC groups," disclosed here rather than smoothed into an SMC-only framing.
// THREE HONEST FRAMING CAVEATS, disclosed rather than smoothed over: (1) these are IHC
// PROTEIN-EXPRESSION markers, not DNA mutations — a different measurement type than most branch
// pairs in this atlas, closer to this organ's own ERBB2 "mutation or amplification" precision
// than to a point-mutation branch gene; (2) the sources checked in this pass classify status at
// the WHOLE-TUMOR level (one label per patient), not as two spatially-distinct regions within one
// tumor — this atlas's usual branch-gene model of literal intratumoral heterogeneity is not
// directly demonstrated here, only a real, checked, population-level mutual exclusivity; (3) the
// cohort mixes SMC with LCNEC, a related but distinct entity this atlas does not otherwise model
// here, on the paper's own no-significant-difference finding above.
const REGIONS_BLNEC = [
  { id:'VL', name:'Liver', color:cssVar('--coral'), pos3d:{x:-0.3,y:1.3,z:0.3},
    branch:{ gene:'ASCL1/NEUROD1 expression', class:'driver', ccf:'ASCL1+/NEUROD1- 34%, ASCL1+/NEUROD1+ 16%, ASCL1-/NEUROD1+ 23% (73% combined, 85/116) of a pooled 116-tumor IHC cohort (Akbulut et al., Mod Pathol, 2024)', note:'A lineage-transcription-factor status, not a DNA mutation — directly, statistically mutually exclusive with the POU2F3+ status modeled at a different site here. Liver is this cancer\'s single most common metastatic site (52.1% of metastatic patients) — more than double urothelial carcinoma\'s own rate (22.6%) in the same cohort (p<0.001, Park et al., Curr Oncol, 2023), a real, striking departure from this organ\'s own bone-dominant urothelial-carcinoma pattern.' } },
  { id:'VB', name:'Bone', color:cssVar('--azure'), pos3d:{x:-1.3,y:-0.5,z:0.2},
    branch:{ gene:'ASCL1/NEUROD1 expression', class:'driver', ccf:'73% combined (85/116) of the same pooled 116-tumor IHC cohort (Akbulut et al., Mod Pathol, 2024)', note:'Same status as at Liver. Bone is this cancer\'s second most common metastatic site (42.3% of metastatic patients, Park et al., 2023).' } },
  { id:'VM', name:'Lymph nodes', color:cssVar('--amber'), pos3d:{x:1.2,y:-0.3,z:-0.5},
    branch:{ gene:'POU2F3 expression', class:'driver', ccf:'21% (24/116) of the same pooled IHC cohort (Akbulut et al., Mod Pathol, 2024)', note:'A tuft-cell-lineage transcription-factor status, mutually exclusive with the ASCL1/NEUROD1 status modeled at a different site here — the same real, checked exclusivity Akbulut et al. state directly. Lymph nodes are this cancer\'s third most common metastatic site (35.5% of metastatic patients, Park et al., 2023).' } },
  { id:'VU', name:'Lung', color:cssVar('--violet'), pos3d:{x:0.2,y:-1.3,z:0.4},
    branch:{ gene:'POU2F3 expression', class:'driver', ccf:'21% (24/116) of the same pooled IHC cohort (Akbulut et al., Mod Pathol, 2024)', note:'Same status as at Lymph nodes; POU2F3+ tumors also carry a significantly shorter recurrence-free and overall survival (p<0.05, same source). Lung is this cancer\'s fourth real metastatic site (25.7% of metastatic patients, Park et al., 2023) — notably its LOWEST-ranked site, the opposite of urothelial carcinoma\'s own pattern, where lung sits third.' } },
];
// Private pool — ARID1A, cross-validated in two independent cohorts: significantly enriched
// versus lung small cell carcinoma at P<.05 in the same n=149 cohort TRUNK_BLNEC's own TERT
// entry already cites above, and independently measured at 48% (Urologic Oncology, 2022, PMID
// 35662501, n=31). Checked against both trunk
// genes and both branch statuses for a same-tumor conflict: none reported in either source.
const PRIVATE_POOL_BLNEC = [
  { gene:'ARID1A mutation', class:'driver', ccf:'48% (Urologic Oncology, 2022, n=31); independently confirmed significantly enriched vs. lung small cell carcinoma (Jaime-Casas et al., 2025)', note:'A SWI/SNF chromatin-remodeling gene, recurrently disrupted — the same broad chromatin-remodeling vulnerability this atlas has already found in several other cancers (Liver, Ovary, Skin, Bladder\'s own urothelial carcinoma entry\'s KMT2C), here in its own bladder-neuroendocrine-specific cohort.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — reuses this atlas's own neuroendocrine histology family verbatim (zero new
// drawing code, the family's THIRD real consumer after Prostate's pneuro and Lungs' sclc):
// small round blue cells, nuclear molding, naked nuclei, necrosis — all real, cited, bladder-
// specific features (Akbulut et al., Adv Anat Pathol, 2024; a dedicated bladder small cell
// carcinoma cytology series, Cancer, 1997, PMID 9010109).
const HISTOLOGY_BLNEC = {
  intro: 'Bladder neuroendocrine carcinoma looks the way small cell carcinoma looks everywhere it arises: sheets of small, round, "blue" cells — named for how densely their crowded, dark nuclei stain — with almost no visible cytoplasm around them. Where two of these naked nuclei press against each other, they mold and deform against one another rather than staying independently round, a real diagnostic feature rather than a processing artifact. Geographic necrosis and a high mitotic rate round out the picture.',
  ariaSummary: 'Stylized microscopic field: a dense sheet of small, dark, crowded nuclei with almost no visible cytoplasm around them, many pressed against their neighbors and deformed by the contact (nuclear molding). An irregular pale necrotic zone with scattered debris sits at one edge of the field.',
  citation: 'Akbulut et al., Adv Anat Pathol, 2024, PMID 38523484; cytology cohort, Cancer, 1997, PMID 9010109.',
  features: [
    { key:'molding', label:'Nuclear molding',
      text:'Adjacent nuclei deform against each other rather than staying independently round — real crowding, not a fixed stylistic squash, since cells with no close neighbor stay rounder.' },
    { key:'naked', label:'Naked nuclei',
      text:'Almost no visible cytoplasm surrounds each nucleus — a real, high nuclear-to-cytoplasmic-ratio feature of this cancer, not an artifact of thin sectioning.' },
    { key:'necrosis', label:'Geographic necrosis',
      text:'Irregular zones of dead tissue and karyorrhectic debris — common in this fast-growing, high-mitotic-rate cancer.' },
  ],
};

// ============================================================
// BLADDER SQUAMOUS CELL CARCINOMA (blscc) — 2026-09-13, ordinary-organ batch. Every citation
// verified directly at the source. Modeled as PURE squamous cell carcinoma specifically — the
// same inclusion criterion Ehdaie et al. (J Urol, 2011, PMID 22088332) use for their own study
// cohort, verbatim: "no urothelial component in the radical cystectomy specimen" — that paper's
// own Methods text, not a direct WHO quotation (an independent citation-verification pass,
// 2026-09-13, found the paper's Discussion separately paraphrases WHO's actual recommendation to
// "classify SqD as a urothelial carcinoma and reserv[e] the diagnosis of SCC for tumors composed
// of pure squamous cell carcinoma" — the general principle this specific inclusion criterion
// implements, not the same sentence) — not urothelial carcinoma with squamous differentiation, a
// different, more common entity this organ's own uc entry already covers.
// Modeled on the NON-BILHARZIAL (Western) form specifically, since Park et al. 2023 is a US
// SEER cohort; the bilharzial (schistosomiasis-associated) form is a real, globally important,
// genuinely different disease (different gross growth pattern, different age of onset,
// different grade distribution) noted in prose rather than folded in silently.
// TRUNK — a genuine, disclosed three-way ambiguity, not resolved by picking one: no single gene
// cleanly fits this atlas's usual trunk-justification types for THIS specific entity. Modeled as
// a fact-statement trunk naming the three real candidates, the same honest architecture this
// atlas already uses for Prostate ductal adenocarcinoma's own "no single founder" entry.
const TRUNK_BLSCC = [
  { gene:'No single confirmed founder mutation', class:'driver', note:'Three real candidates were found, and none was definitively established as truncal for this specific entity in this pass\'s own reading: TP53 mutation (64%, 7/11, the most-replicated candidate — Hurst et al., J Pathol Clin Res, 2022, PMID 35289095 — but far short of squamous carcinomas\' usual near-universal TP53 rate elsewhere in this atlas); FAT1 mutation or deletion (>90% combined in the same small cohort, a single-study finding); TERT promoter mutation (80%, 12/15, "comparable to the rate previously demonstrated in conventional urothelial carcinoma" — Cowan, Springer et al., Mod Pathol, 2016, PMID 26965579 — raising the real possibility this is the same organ-wide trunk event this organ\'s own urothelial carcinoma entry already carries, though this rests on one small study). No multi-region-sequencing or precursor-lesion study was found to confirm any of the three as spatially or temporally truncal.' },
];
// Branch pair — EGFR (real, but a PROTEIN/mRNA-EXPRESSION finding with a real minority
// copy-number contribution, not primarily a mutation — Ramchurren et al., 1995, PMID 7628866:
// 67% IHC-positive, though an independent citation-verification pass (2026-09-13) found this
// entire 21-tumor cohort is bilharzial (Schistosoma-associated) SCC specifically, not the
// non-bilharzial (Western) form modeled here — disclosed rather than imported silently, the same
// treatment this file's own Benjamin/PIK3CA finding already gets for a urachal-cohort figure;
// Hurst et al., 2022 (a genuinely Western cohort): mRNA upregulated, ~10% focal amplicon;
// explicitly ZERO activating mutations found (0/71, Rose et al., Oncogene, 2020, PMID 32978523 —
// corrected from a mistyped PMID that pointed at an unrelated ecology paper; that same pass also
// found the paper does not specify how many of the 71 EGFR-screened samples were pure SCC versus
// urothelial carcinoma with squamous differentiation, so the 0/71 figure's applicability
// specifically to pure SCC, while plausible, is not independently confirmable from the source)
// and FAT1 (mutated by point mutation alone in 45% of the same cohort — Hurst et al., 2022 — the
// cleaner single-mechanism figure, used here in preference to the combined >90% figure the trunk
// note already carries, to avoid double-counting one number two ways). Checked for a same-tumor
// conflict: neither source reports EGFR and FAT1 as exclusive or competing.
const REGIONS_BLSCC = [
  { id:'WU', name:'Lung', color:cssVar('--coral'), pos3d:{x:-0.3,y:1.3,z:0.3},
    branch:{ gene:'EGFR overexpression', class:'driver', ccf:'67% IHC-positive in a bilharzial-associated cohort (Ramchurren et al., 1995); mRNA upregulated in a genuinely Western cohort, with a real minority copy-number contribution — focal amplification in ~10%, broader 7p gain in 38% (Hurst et al., J Pathol Clin Res, 2022) — but ZERO activating mutations found (0/71, Rose et al., Oncogene, 2020)', note:'A real, protein/mRNA-level finding, precisely NOT a mutation — the same "mutation or amplification" precision this organ\'s own urothelial carcinoma entry already applies to ERBB2. The 67% IHC figure comes from a bilharzial-associated cohort specifically, not the non-bilharzial (Western) form this entity models — disclosed rather than imported silently. Lung is this cancer\'s single most common metastatic site (37.2% of metastatic patients, Park et al., Curr Oncol, 2023).' } },
  { id:'WM', name:'Lymph nodes', color:cssVar('--azure'), pos3d:{x:-1.3,y:-0.5,z:0.2},
    branch:{ gene:'EGFR overexpression', class:'driver', ccf:'67% IHC-positive in a bilharzial-associated cohort (Ramchurren et al., 1995)', note:'Same finding as at Lung, with the same bilharzial-cohort caveat. Lymph nodes are this cancer\'s second most common metastatic site (31.8% of metastatic patients, Park et al., 2023).' } },
  { id:'WB', name:'Bone', color:cssVar('--amber'), pos3d:{x:1.2,y:-0.3,z:-0.5},
    branch:{ gene:'FAT1 mutation', class:'driver', ccf:'45% (5/11) by point mutation alone (Hurst et al., J Pathol Clin Res, 2022) — higher than FAT1\'s own rate in urothelial carcinoma with or without squamous differentiation in the same paper\'s TCGA comparison', note:'The paper\'s own authors argue FAT1 loss "may be a prerequisite for the development of pure squamous tumours." Bone is this cancer\'s third most common metastatic site (27.2% of metastatic patients, Park et al., 2023).' } },
  { id:'WL', name:'Liver', color:cssVar('--violet'), pos3d:{x:0.2,y:-1.3,z:0.4},
    branch:{ gene:'FAT1 mutation', class:'driver', ccf:'45% (5/11) by point mutation alone (Hurst et al., 2022)', note:'Same finding as at Bone. Liver is this cancer\'s fourth real metastatic site (18.4% of metastatic patients, Park et al., 2023) — and this cancer shows a real, notable ZERO-brain-metastasis finding in the same cohort (0/251), stated in prose rather than modeled as a fifth site this schema has no room for.' } },
];
// Private pool — CDKN2A loss, real and recurrent, mostly by focal 9p deletion (a copy-number
// event, not primarily point mutation — the same precision this atlas already applies to LUAD's
// own CDKN2A entry). Checked against both branch genes: no exclusivity reported.
const PRIVATE_POOL_BLSCC = [
  { gene:'CDKN2A loss', class:'driver', ccf:'33% (7/21) by copy-number loss, mostly focal 9p deletion, in the paper\'s separate copy-number cohort (n=21, distinct from its own n=11 whole-exome cohort — Hurst et al., J Pathol Clin Res, 2022)', note:'A cell-cycle checkpoint gene, most often lost by deletion rather than point mutation. Recurrent and real in this entity\'s own dedicated sequencing cohort; the same source reports no conflict against EGFR or FAT1.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — reuses this atlas's own squamous-carcinoma histology family verbatim (zero new
// drawing code, the family's SECOND real consumer after Lungs' own lusc entry): keratin pearls
// and intercellular bridges, the field's own defining diagnostic features for genuine squamous
// differentiation in bladder tumors (Guo et al., Front Oncol, 2026, PMID 42482763, verbatim:
// "definitive morphological features, including keratin pearl formation and/or intercellular
// bridges").
const HISTOLOGY_BLSCC = {
  intro: 'Bladder squamous cell carcinoma is diagnosed by the same two features squamous carcinomas anywhere in the body show: keratin pearls — whorled, concentrically layered nests of keratinizing cells — and intercellular bridges, the fine strands connecting neighboring cells that give the tissue a cobblestone look. This entity is diagnosed only when squamous differentiation is complete, with no residual urothelial component anywhere in the specimen.',
  ariaSummary: 'Stylized microscopic field: several whorled, concentrically layered keratin pearls in warm orange-pink tones, surrounded by a tightly packed field of polygonal cells with fine connecting bridges visible between close neighbors.',
  citation: 'Guo et al., Front Oncol, 2026, PMID 42482763.',
  features: [
    { key:'pearls', label:'Keratin pearls',
      text:'Whorled, concentrically layered nests of keratinizing cells — one of the two features that define genuine squamous differentiation here, the same structure this atlas\'s own lung squamous cell carcinoma entry draws.' },
    { key:'bridges', label:'Intercellular bridges',
      text:'Fine strands connecting neighboring polygonal cells, giving the tissue a cobblestone look — the second defining feature, present alongside or independent of keratin pearls.' },
  ],
};

// ============================================================
// BLADDER ADENOCARCINOMA (bladc) — 2026-09-13, ordinary-organ batch. Every citation verified
// directly at the source. Modeled as NON-URACHAL (vesical) adenocarcinoma specifically — a real,
// deliberate entity choice, not an oversight of urachal adenocarcinoma. Park et al. 2023's own
// 1,003-count "adenocarcinoma" bucket uses a single ICD-O-3 code (8140/3, "adenocarcinoma,
// NOS") and SEER's own site-recode scheme (seer.cancer.gov/siterecode: "Urinary Bladder" recode
// 29010 = C67.0-C67.9; "Other Urinary Organs" recode 29040 = C68.0 Urachus — a SEER-taxonomy fact,
// not one Park et al.'s own Methods text states) excludes urachus (C68.0) from "Urinary Bladder"
// (C67.0-C67.9) — and 8140/3 would separately exclude any tumor
// specifically coded mucinous (8480/3) or signet ring (8490/3), which comprise the MAJORITY
// pattern of urachal adenocarcinoma specifically (mucinous alone = 78% of a 46-case urachal
// series, Dhillon et al., Hum Pathol, 2015, PMID 26364859). Independently corroborated: the
// dedicated urachal literature reports a PERITONEAL-dominant metastatic pattern (54% of
// metastatic cases, Guerin et al., Front Oncol, 2023, PMID 36741023) while Park\'s own site data
// for this bucket (below) shows a UC-like HEMATOGENOUS pattern with no peritoneum category at
// all — real, converging evidence this bucket is predominantly non-urachal disease.
const TRUNK_BLADC = [
  { gene:'TP53 mutation', class:'driver', ccf:'81.1% of non-urachal bladder adenocarcinoma (Cigliola et al., JCO Precis Oncol, 2024, PMID 39151108, n=328 — the largest dedicated cohort, independently corroborated at 56–100% across four smaller cohorts spanning both urachal and non-urachal disease)', note:'The single most consistent, near-dominant event across every cohort checked. A real caveat, stated rather than overclaimed: TP53 is a generic tumor-suppressor gene mutated across most solid tumors broadly, so it is truncal here on frequency grounds, not on the same kind of diagnostic-specificity grounds this organ\'s own urothelial carcinoma entry\'s TERT trunk carries.' },
];
// Branch pair — KRAS and PIK3CA, both non-urachal-specific figures from the same Cigliola et al.
// 2024 cohort above, checked for a same-tumor conflict against TP53 and each other: Benjamin et
// al. (NPJ Precis Oncol, 2025, PMID 39799194, n=42) found PIK3CA non-significantly enriched in
// (not competing against) MAPK-pathway-altered (KRAS-driven) tumors — real, directional, stated
// as a trend rather than a proven cooperation, and measured in a urachal cohort, so the
// direction is noted without importing the exact statistic onto this non-urachal entity.
const REGIONS_BLADC = [
  { id:'UU', name:'Lung', color:cssVar('--coral'), pos3d:{x:-0.3,y:1.3,z:0.3},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'27.7% of non-urachal bladder adenocarcinoma (Cigliola et al., 2024)', note:'Lung is this cancer\'s single most common metastatic site (38.3% of metastatic patients, Park et al., Curr Oncol, 2023).' } },
  { id:'UB', name:'Bone', color:cssVar('--azure'), pos3d:{x:-1.3,y:-0.5,z:0.2},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'27.7% of non-urachal bladder adenocarcinoma (Cigliola et al., 2024)', note:'Same finding as at Lung. Bone is this cancer\'s second most common metastatic site (36.1% of metastatic patients, Park et al., 2023).' } },
  { id:'UM', name:'Lymph nodes', color:cssVar('--amber'), pos3d:{x:1.2,y:-0.3,z:-0.5},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'7.9% of non-urachal bladder adenocarcinoma — nearly identical to the urachal rate (7.5%) in the same cohort, a real, non-discriminating pattern (Cigliola et al., 2024)', note:'A lower-frequency finding than KRAS, checked against it for a same-tumor conflict: Benjamin et al. (2025) found PIK3CA trending toward, not away from, co-occurrence with MAPK/KRAS-pathway alteration — cooperating rather than competing, though that specific statistic was measured in a urachal cohort. Lymph nodes are this cancer\'s third most common metastatic site (30.6% of metastatic patients, Park et al., 2023).' } },
  { id:'UL', name:'Liver', color:cssVar('--violet'), pos3d:{x:0.2,y:-1.3,z:0.4},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'7.9% of non-urachal bladder adenocarcinoma (Cigliola et al., 2024)', note:'Same finding as at Lymph nodes. Liver is this cancer\'s fourth real metastatic site (20.9% of metastatic patients, Park et al., 2023).' } },
];
// Private pool — deliberately thin, the same "driverless except for a passenger" shape OCCC's
// own private pool already uses in this same codebase, for the same reason: a candidate beyond
// TP53/KRAS/PIK3CA (SMAD4, reported at 24% in urachal disease by a secondary review citing an
// inaccessible primary source) was not independently verified for THIS entity in this pass's
// own search — checked and not found, a real negative recorded as such rather than filled with
// an unverifiable figure.
const PRIVATE_POOL_BLADC = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — an independent citation-verification pass (2026-09-13) found Gopalan et al.'s own
// cohort is entirely urachal (title: "Urachal Carcinoma: A Clinicopathologic Analysis of 24
// Cases" — not the non-urachal disease this entity models), so its NOS/enteric/signet-ring
// percentages are that paper's own measured urachal rates, not a non-urachal finding, and are
// used here on that corrected basis. Grignon et al. (Cancer, 1991, PMID 1706216) independently
// confirms the real, load-bearing fact this section actually needs: a dedicated 72-case series
// analyzing 24 urachal AND 48 nonurachal bladder adenocarcinomas "according to their... histologic
// type" for both groups, i.e. WHO's enteric/mucinous/NOS/signet-ring subtype framework is real and
// applied to non-urachal disease too, not a urachal-only classification scheme — but that paper is
// paywalled with no accessible full text, so its own non-urachal-specific percentages could not be
// confirmed in this pass's own search (checked and not found, rather than assumed). The specific
// proportions drawn here are therefore Gopalan's real, correctly-attributed urachal figures,
// illustrating the shared subtype architecture rather than claimed as a non-urachal measurement.
// Reuses drawGlandRing verbatim (zero new drawing code — the same primitive this atlas's own
// colorectal adenocarcinoma entry already uses for its own gland-forming architecture), plus mucin
// production named in text as a real, cited feature without a dedicated drawn structure (the "name
// more than is drawn" treatment this atlas already gives LUAD's own undrawn growth patterns).
const HISTOLOGY_BLADC = {
  intro: 'Primary bladder adenocarcinoma — urachal and non-urachal alike — is subtyped under one shared WHO framework: an enteric pattern, gland-forming architecture that looks, under the microscope, much like ordinary colorectal adenocarcinoma; a mucin-producing pattern; and, less often, a signet-ring pattern, where the cytoplasm is entirely filled with a single mucin droplet, crushing the nucleus to one edge. The specific proportions shown here — roughly half NOS, over a third enteric, and a small minority signet-ring — are a dedicated case series\' own measured rates for the urachal form of this cancer; a clean, independently-verifiable breakdown specific to the non-urachal disease modeled here was checked for and not found in this pass\'s own search, so these figures illustrate the shared subtype spectrum rather than this entity\'s own measured rate.',
  ariaSummary: 'Stylized microscopic field: several rounded glands with clear central lumens, each rimmed by a ring of columnar epithelial cell nuclei — the same gland-forming architecture as ordinary colorectal adenocarcinoma. Pale blue-gray mucin pools sit near some of the glands, and two round, clear signet-ring cells with an eccentric crescent nucleus appear off to one side.',
  citation: 'Gopalan et al., Am J Surg Pathol, 2009, PMID 19252435 (urachal cohort; shared subtype framework independently confirmed for non-urachal disease by Grignon et al., Cancer, 1991, PMID 1706216).',
  features: [
    { key:'glands', label:'Enteric gland formation',
      text:'Rounded glands with clear central lumens, rimmed by columnar epithelium — the same gland-forming architecture that gives this shared subtype spectrum its real molecular resemblance to colorectal adenocarcinoma.' },
    { key:'mucin', label:'Mucin production',
      text:'Pools of extracellular mucin within and around the glands — a real, recurrent feature across this shared subtype spectrum, present at varying degrees in both the urachal and non-urachal forms of this cancer.' },
    { key:'signet', label:'Focal signet-ring cells',
      text:'A minority finding — present focally in about 8% of a dedicated urachal case series — where the cytoplasm is entirely filled with a single mucin droplet, crushing the nucleus into a thin crescent against the cell membrane. Occasional here, not the defining feature it is in gastric diffuse-type adenocarcinoma.' },
  ],
};

export const cancerDetails = {
  uc: {
    title:'Urothelial Carcinoma', screenLabel:'Urothelial carcinoma — tumor explorer',
    legendTitle:'Sites (real metastatic pattern, bone-dominant)',
    regions:REGIONS_UC, trunk:TRUNK_UC, privatePool:PRIVATE_POOL_UC,
    histology: HISTOLOGY_UC,
  },
  blnec: {
    title:'Bladder Neuroendocrine Carcinoma', screenLabel:'Bladder neuroendocrine carcinoma — tumor explorer',
    legendTitle:'Sites (real metastatic pattern, liver-dominant)',
    regions:REGIONS_BLNEC, trunk:TRUNK_BLNEC, privatePool:PRIVATE_POOL_BLNEC,
    histology: HISTOLOGY_BLNEC,
  },
  blscc: {
    title:'Bladder Squamous Cell Carcinoma', screenLabel:'Bladder squamous cell carcinoma — tumor explorer',
    legendTitle:'Sites (real metastatic pattern, lung-dominant)',
    regions:REGIONS_BLSCC, trunk:TRUNK_BLSCC, privatePool:PRIVATE_POOL_BLSCC,
    histology: HISTOLOGY_BLSCC,
  },
  bladc: {
    title:'Bladder Adenocarcinoma', screenLabel:'Bladder adenocarcinoma (non-urachal) — tumor explorer',
    legendTitle:'Sites (real metastatic pattern, lung-dominant)',
    regions:REGIONS_BLADC, trunk:TRUNK_BLADC, privatePool:PRIVATE_POOL_BLADC,
    histology: HISTOLOGY_BLADC,
  },
};
