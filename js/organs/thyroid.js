import * as THREE from 'three';
import { cssVar } from '../viewer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Alias-collision check (the standing check from the ovary/kidneys "clear cell" pass): none of
// these terms appears in any other organ's alias list. 'papillary' is claimed here alone and
// deliberately so — papillary carcinoma without a qualifier conventionally means the thyroid
// entity, and no other organ module lists it (kidneys' papillary RCC and bladder's papillary
// urothelial carcinoma exist as cancer NAMES, and multi-match on names is a handled UI state
// anyway). 'endocrine' resolves uniquely — this is the atlas's first endocrine-system organ.
export const organEntry = { key:'thyroid', label:'Thyroid', system:'Endocrine', active:true, sexes:['female','male'], aliases:['thyroid','thyroid gland','papillary','papillary thyroid carcinoma','ptc','follicular','follicular thyroid carcinoma','ftc','endocrine'] };

// Front of the neck, single midline point — the gland is a midline anterior cervical structure
// spanning C5–T1 (StatPearls NBK470452, verified verbatim). heightFrac sits between Brain
// (0.95) and Lungs (0.66), and was measured against both body meshes' width/front-z profiles,
// not eyeballed: 0.850 is the bottom of the throat column on both (female width 15.0 cm,
// male 18.3 cm, both just above the neck→shoulder flare at ~0.845), which is the gland's
// real position — LOW anterior neck, above the sternal notch. The first candidate, 0.862,
// was rejected by the same measurement: at that height the female mesh's frontmost geometry
// is the chin overhang (front-z jumps 6.9 → 10.3 cm between 0.860 and 0.862), so the raycast
// anchored the dot at the jaw — i.e. at Adam's-apple level, the exact larynx-vs-thyroid
// confusion a teaching app must not draw.
export const markerSpec = { points:[{heightFrac:0.850, angle:0}] };

// Shares from ONE denominator (the atlas's share discipline): Lim et al., JAMA, 2017 — SEER-9,
// n=77,276 thyroid cancers 1974–2013. Verified from the paper's own table: papillary 64,625
// (83.6%), follicular 8,359 (10.8%), medullary 1,685 (2.2%), anaplastic 975 (1.3%). The
// anaplastic share string carries the same paper's mortality asymmetry the way skin's nodular
// row and ovary's Japan figure state their honest exceptions where users actually see them:
// anaplastic is 1.3% of cases but 471/2,371 = 19.9% of the cohort's thyroid-cancer deaths.
export const cancerEntries = [
  { id:'ptc', name:'Papillary carcinoma',  share:'~84% of thyroid cancers (SEER-9, 1974–2013 pooled)', active:true,  organKey:'thyroid' },
  { id:'ftc', name:'Follicular carcinoma', share:'~11% of thyroid cancers (SEER-9, 1974–2013 pooled)', active:true,  organKey:'thyroid' },
  { id:'mtc', name:'Medullary carcinoma',  share:'~2% of thyroid cancers (SEER-9, 1974–2013 pooled)',  active:false, organKey:'thyroid' },
  { id:'atc', name:'Anaplastic carcinoma', share:'~1% of cases (SEER-9, 1974–2013 pooled) — ~20% of thyroid-cancer deaths (471/2,371, 1994–2013)', active:false, organKey:'thyroid' },
];

// MESH (real, third Sketchfab asset after Lungs and Colon): "TIROIDES ANDREA  DACS UJAT" by
// andycopo55 (Universidad Juárez Autónoma de Tabasco), CC BY 4.0 — license verified both on
// the model page and in the GLB's own embedded asset.extras. The source file is a full neck
// assembly (thyroid + trachea/larynx cartilage + vessels, one welded shell, one shared
// texture atlas); the gland was isolated by texture-colour classification (red-brown gland
// class vs pale cartilage class), welded, trimmed at measured cluster-structure planes
// (superior +0.65 / inferior −0.45 in source units), and re-exported alone. Uniform scale
// anchored to a VERIFIED volume, not a linear dimension: ellipsoid-formula lobe volume
// (V = 0.479·W·D·L per lobe) set equal to the adult median total 8.26 mL — both the formula
// constant and the median from Lin et al., Biol Trace Elem Res, 2023 (PMC10620313, adult
// reference-interval study). Result: 3.15 cm total width × 2.77 cm lobe length × 2.39 cm AP
// depth. PROPORTION DISCLOSURE (flagged, not silently "fixed"): at that verified volume the
// per-lobe width is essentially exact (1.34 cm vs 1.31 reference) but lobe length runs short
// (2.77 cm vs the ~4–5 cm textbook range) and AP depth correspondingly deep — a squat,
// stylized gland at correct volume, correct width, correct landmark anatomy. An anisotropic
// correction was considered and rejected: it would need a target length this build could not
// verify (StatPearls' own size sentence — 25 g yet 6.6 mL — is internally inconsistent 3.6×,
// and the common "each lobe 5×3×2 cm" paraphrase implies 28.7 mL, above the 19.06 mL upper
// reference limit of the study above, i.e. it describes a goitre). Isthmus landmark verified
// as real geometry by pure-coordinate measurement, not texture: midline-bridging vertices
// exist ONLY in a ~1 cm band (final-frame Y −0.26..+0.72 cm), where the gland is thin
// front-to-back (0.7–1.2 cm vs ~2 cm in the lobes) with a 0.96 cm posterior concavity — the
// crescent that wraps the trachea. No pyramidal lobe exists in this mesh (zero midline
// bridging above that band), so the fourth hotspot is Superior pole. File ships with the
// artist's color texture resampled 2048→1024px (3.99 → 1.67 MB), the lungs-precedent
// downscale protocol re-run for this asset: same-camera live renders differ by mean
// |Δ| 0.15–0.34/255 (p99 ≤ 2), inside the lungs pass's own 0.19–0.59 band. Geometry
// byte-identical; verified post-swap by the standing hierarchy-walk check (single
// identity-transform node, 1 component, all four anchors 0.01 mm from surface).
//
// MATERIAL — A/B decided on evidence (same protocol as Lungs and Colon): A = the artist's own
// baked texture with colorSpace = NoColorSpace (the legacy-pipeline double-decode fix those
// two organs established); B = the app recipe (MeshPhysicalMaterial + tissue-mottle vertex
// colors). A ships: the baked texture carries painted follicular mottling and vessel tinting
// that recipe B flattens to a uniform tone, and under the then-shipping NoColorSpace fix its
// warm red-brown read correctly under the warm key light. See the review packet's side-by-side.
// [PIPELINE CORRECTION 2026-09-03: NoColorSpace was the LEGACY pipeline's double-decode
// fix; under the corrected colour-managed pipeline (see js/viewer.js top comment) it would
// itself cause the wrong render, so the map now ships SRGBColorSpace — the glTF default.]
export function buildThyroidMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/thyroid.glb', (gltf)=>{
      gltf.scene.traverse(o=>{
        if(o.isMesh && o.material && o.material.map){
          o.material.map.colorSpace = THREE.SRGBColorSpace;
          o.material.map.needsUpdate = true;
        }
      });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

// Hotspot anchors are measured mesh coordinates (metres, exported-GLB frame: +X patient left,
// +Y superior, +Z anterior), each the argmax of a direction score over a named vertex region
// of the final geometry — same real-anchor standard as Bladder's sub-mesh centroids, derived
// with /tmp-pipeline measurements rather than hand placement. All four sit on anterior-facing
// surface (z > 0), so all four dots are visible from the default front view. The isthmus
// anchor sits ON the measured bridging band; the superior-pole anchor is the +Y extreme of
// the right lobe's anterior face.
export const organDetail = {
  eyebrow:'Endocrine System', title:'Thyroid',
  sub:'Butterfly-shaped gland · two lobes joined by an isthmus · sets the body\'s metabolic pace',
  facts:[
    {label:'Size', val:'~8 mL median volume (adult ultrasound reference)'},
    {label:'Location', val:'Front of the neck, spanning C5–T1'},
    {label:'Function', val:'Follicular cells make T4 &amp; T3; C cells make calcitonin'},
    {label:'Blood supply', val:'Superior &amp; inferior thyroid arteries'},
  ],
  // Anatomy verified verbatim from StatPearls "Anatomy, Head and Neck, Thyroid" (NBK470452)
  // and "Histology, Thyroid Gland" (NBK551659): midline anterior cervical structure spanning
  // C5–T1; two symmetrical lobes joined by the isthmus crossing at the 2nd–3rd tracheal
  // rings; follicles as the structural/functional unit, colloid = thyroglobulin; C cells from
  // the ultimobranchial body / neural crest, secreting calcitonin. The lineage split in the
  // last sentence is the WHO 2022 classification's own organizing structure (Baloch et al.,
  // Endocr Pathol, 2022): papillary and follicular carcinoma are follicular-cell-derived;
  // medullary carcinoma is the C-cell disease.
  desc:'The thyroid sits low in the front of the neck — two lobes hugging the sides of the trachea, joined by a narrow band called the isthmus. It is built of microscopic spheres called follicles: each stores colloid, a reserve of thyroglobulin protein, from which the follicular cells lining the sphere make thyroid hormone (T4 and T3) — the signal that sets how fast every tissue in the body burns energy. Scattered between the follicles are C cells, a separate lineage that makes calcitonin. Both wired cancers here — papillary and follicular carcinoma — arise from the follicular cells; medullary carcinoma, in the unwired list, is the C cells\' disease.',
  buildMesh: buildThyroidMesh,
  viewer:{ theta:0.5, phi:1.15, radius:0.12, minRadius:0.03, maxRadius:0.3, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of the thyroid gland, a butterfly-shaped red-brown organ: two '
    + 'bulging lateral lobes joined across the midline by a narrow isthmus, with four glowing teal '
    + 'points marking the structures listed after it. Drag to rotate, scroll to zoom.',
  hotspots:[
    { key:'leftlobe', label:'Left lobe', pos:[0.01286,0.00284,0.00581],
      text:'One of the gland\'s two lateral lobes, wrapped around the side of the trachea. Its wall-to-wall follicles — colloid-filled spheres lined by hormone-making cells — are where both of this organ\'s wired cancers begin.' },
    { key:'rightlobe', label:'Right lobe', pos:[-0.01290,0.00223,0.00581],
      text:'The mirror-image lobe. Between its follicles sit the parafollicular C cells — a separate, neural-crest-derived lineage that secretes calcitonin. They matter here as a contrast: medullary carcinoma arises from C cells, which is why it behaves nothing like the follicular-cell cancers this atlas maps.' },
    { key:'isthmus', label:'Isthmus', pos:[0.00099,0.00095,0.01196],
      text:'The narrow band joining the two lobes, crossing the trachea at the level of the 2nd and 3rd tracheal rings. In 28–55% of people a pyramidal lobe — a vestige of the duct the embryonic gland descended along — points upward from here; this model, like many glands, doesn\'t have one.' },
    { key:'superior', label:'Superior pole', pos:[-0.00911,0.01314,0.00365],
      text:'The upper tip of each lobe, reaching up alongside the thyroid cartilage. The superior thyroid artery — the first branch of the external carotid — descends to enter the gland here.' },
  ],
};

// ============================================================
// PAPILLARY CARCINOMA (PTC) — BRAF-like entry
// ============================================================
// SITE MODEL — lymphatic-first, the verified mirror of follicular carcinoma's hematogenous
// pattern (both routes from one same-source table: Luvhengo et al., Biomedicines, 2023,
// PMC10135557 — lymph-node metastasis "Common (20–90%)" in PTC vs "Rare (<10%)" in FTC;
// hematogenous "Rare (9%)" vs "Frequent (29%)"). Lateral-neck nodal disease at presentation:
// 27% (StatPearls NBK536943, verbatim "Nodal metastases in the lateral neck are reported in
// 27% of patients at presentation"); ~10% present with metastatic disease initially (same
// chapter). Distant organs for well-differentiated thyroid cancer as a group: "the lungs,
// bones, brain, skin, and liver" (PMC10135557) — lung shown as the fourth region, bone
// stated in its note rather than given a fifth region (four-region layout is the app-wide
// structure).
// Region ids TH/CC/LC/PL verified globally unique across all organs (regionCellCache keys on
// region.id regardless of organ; 56 ids in use before this module).
//
// BRANCH SLOTTING — a disclosed adaptation of the approved Phase-2 plan: that plan named two
// branch genes (TERT promoter, 1q gain) and pooled PPM1D + CHEK2, but the app's structure
// needs four region branches. PPM1D and CHEK2 are promoted to branches because they are the
// only remaining alterations with VERIFIED co-occurrence next to the BRAF trunk (TCGA's own
// sentence: the two SMGs "occurred concomitant with MAPK-pathway driver mutations"). Nothing
// mutually exclusive with BRAF is drawn anywhere in this tumor: EIF1AX was rejected outright
// (1.5%, exclusive with RAS/BRAF — the LUAD-EGFR rejection class), RET fusions stay in the
// trunk note as the alternative founding driver, RAS likewise (52/402, 12.9%, codons 12/61).
const REGIONS_PTC = [
  { id:'TH', name:'Thyroid (primary)', color:cssVar('--coral'), pos3d:{x:-1.25,y:-0.55,z:0.3},
    branch:{ gene:'1q gain', class:'driver', ccf:'14.8% of tumors form TCGA\'s "SCNA-low-1q-amp" copy-number class', note:'An extra copy of chromosome arm 1q, in a genome that otherwise stays remarkably tidy — 72.9% of papillary carcinomas have no significant arm-level changes at all. The 1q-gain class is enriched for BRAF mutation and for the aggressive tall-cell look under the microscope, and carries significantly higher recurrence-risk scores and tumor stage (TCGA, 2014).' } },
  { id:'CC', name:'Central neck nodes', color:cssVar('--azure'), pos3d:{x:-0.15,y:0.95,z:-0.2},
    branch:{ gene:'PPM1D mutation', class:'driver', ccf:'recurrent, low individual frequency — one of TCGA\'s seven significantly mutated genes', note:'A phosphatase that dampens the DNA-damage response, including p53 signaling. TCGA found PPM1D mutations "concomitant with MAPK-pathway driver mutations" — riding alongside the BRAF trunk rather than replacing it, which is exactly how a branch mutation in this atlas is defined. The nodes drawn here are the compartment immediately around the gland and trachea, the first stop on this cancer\'s lymphatic route.' } },
  { id:'LC', name:'Lateral neck nodes', color:cssVar('--violet'), pos3d:{x:1.0,y:0.7,z:0.25},
    branch:{ gene:'CHEK2 mutation', class:'driver', ccf:'recurrent, low individual frequency — an SMG occurring "concomitant with MAPK-pathway driver mutations" (TCGA, 2014)', note:'A DNA-damage checkpoint kinase that physically partners with PPM1D\'s pathway. TCGA adds a two-hit detail: 70 tumors had lost chromosome 22q (which contains CHEK2), 5 tumors carried CHEK2 mutations, and 4 tumors had both — more overlap than chance (p=0.0035). About this site: nodal spread along the jugular chain is reported in 27% of patients at presentation, and nodal involvement overall spans 20–90% of cases depending on how hard pathologists look.' } },
  { id:'PL', name:'Lungs', color:cssVar('--amber'), pos3d:{x:1.15,y:-0.85,z:-0.3},
    branch:{ gene:'TERT promoter mutation', class:'driver', ccf:'9.4% of informative tumors (36/384, TCGA, 2014)', note:'Reactivates telomerase, removing the cell\'s division counter. TCGA found it in all histological types but NOT associated with BRAF or fusion drivers — and strongly associated with older age, higher recurrence risk (p=7×10⁻⁸, holding within the BRAF-mutant tumors), and less-differentiated cancers. It marks the aggressive tail of this usually indolent disease. Distant spread is the exception here — about 10% of patients present with metastatic disease — and when it happens, lungs and bones lead the site list.' } },
];
// TRUNK — BRAF V600E, with the exclusivity finding stated in the trunk itself and the
// alternative founding drivers as a second STATUS entry (the OCCC "TP53 usually wild-type"
// precedent: a trunk row about what this tumor does NOT carry). All numbers verbatim from
// TCGA (Cell, 2014, PMC4243044): "SMGs included the MAPK-related genes, BRAF, NRAS, HRAS and
// KRAS, which were virtually mutually exclusive (Fisher's exact test p=1.1×10⁻⁵, MEMo
// corrected p<0.01) in 300/402 (74.6%) patients. The 248 (61.7%) BRAF mutations were mostly
// V600E substitution." RET fusions 6.8%; RAS SSNVs 52/402 (12.9%), codons 12 and 61.
const TRUNK_PTC = [
  { gene:'BRAF V600E', class:'driver', ccf:'61.7% of papillary carcinomas (248/402, TCGA, 2014)', note:'Locks the MAPK growth pathway on — the single founding event in three of every five papillary carcinomas, and the reason WHO\'s 2022 classification calls this whole entity family "the BRAF-like malignancies." TCGA\'s cohort settles how founding events work here: BRAF, NRAS, HRAS and KRAS were virtually mutually exclusive (p=1.1×10⁻⁵), and the paper\'s own conclusion is that "having more than one mutation confers no clonal advantage." One driver is enough.' },
  { gene:'RET fusion / RAS — the roads not taken', class:'driver', ccf:'RET fusions 6.8%; RAS 12.9% (52/402, codons 12 and 61) — essentially never together with BRAF', note:'What founds the tumors BRAF doesn\'t. RET fusions weld a growth receptor permanently on; RAS point mutations push the same MAPK pathway from a step below. Each is an alternative trunk, not an add-on — this modeled tumor is BRAF-driven, so neither appears anywhere in it. Together these discoveries left only 3.5% of TCGA\'s papillary carcinomas without a known driver, down from 25% before the study.' },
];
// PRIVATE POOL — the atlas's THIRD quiet genome (after ovarian clear-cell and seminoma), the
// standing pattern the Testis pass anticipated, now named in CLAUDE.md. Verbatim anchor:
// whole-exome sequencing of 402 pairs "showed a low somatic mutation density (0.41
// non-synonymous mutations per Mb, on average)" relative to other cancers, and that density
// "correlated with age (Pearson correlation p=5.2×10⁻¹⁸)" — the clock-like signature of
// ordinary aging tissue. Second entry: thyroglobulin, the gland's own enormous storage
// protein — mutated in 11/402 (2.7%) and NOT among the cohort's seven significantly mutated
// genes, i.e. a big target collecting background hits (the TTN logic, played on the organ's
// home turf). Both entries TCGA, 2014. Pool sizing: two entries, the OCCC precedent —
// panel.js draws up to two privates per cell, so two is the structural minimum.
const PRIVATE_POOL_PTC = [
  { gene:'Clock-like background variants', class:'passenger', note:'Most cells in this tumor carry almost nothing beyond the trunk. Papillary thyroid carcinoma averages just 0.41 protein-changing mutations per megabase — among the quietest genomes in cancer — and mutation count tracks patient age (p=5.2×10⁻¹⁸), the signature of ordinary wear accumulating in ordinary tissue rather than of a mutation-spewing tumor process.' },
  { gene:'Thyroglobulin (TG) variant', class:'passenger', note:'The gland\'s own storage protein — an enormous gene the thyroid transcribes constantly to fill its follicles with colloid. Mutated in 2.7% of tumors (11/402) yet absent from TCGA\'s list of significantly mutated genes: a big target collecting background hits, not a driver. The same logic that makes TTN the textbook passenger elsewhere in this atlas.' },
];
// HISTOLOGY — verified verbatim from StatPearls "Papillary Thyroid Carcinoma" (NBK536943):
// papillae with "a central fibrovascular stalk covered by a neoplastic epithelial lining,"
// "long, straight, or arborizing, arranged in a parallel, regimented fashion"; nuclear
// features quoted as "Enlarged and elongated nuclei with crowding and overlap," "Chromatin
// clearing with peripheral margination of chromatin, giving rise to what has been described
// as Orphan Annie Eye nuclei," "Nuclear grooves resulting from an irregularity of nuclear
// contour," "Intranuclear cytoplasmic pseudo-inclusions," and psammoma bodies listed among
// the diagnostic features. NOTE the deliberate contrast with HGSOC's slide: there,
// "fibrovascular cores" was checked and NOT claimed (it belongs to low-grade serous); here it
// IS the verbatim source language. And where HGSOC's psammoma bodies are hedged as
// "variable," here they sit on the diagnostic-feature list — so this slide draws them
// without apology.
const HISTOLOGY_PTC = {
  intro: 'Papillary carcinoma is diagnosed on its nuclei, not its outline. The tumor grows as branching papillae — each a central fibrovascular stalk wrapped in a neoplastic cell lining — but what clinches the diagnosis is the look of the nuclei themselves: enlarged, elongated, crowded and overlapping, their chromatin cleared to the rim ("Orphan Annie eye" nuclei), with grooves folded into the nuclear outline and occasional punched-out pseudo-inclusions where cytoplasm pockets into the nucleus. Concentric calcified spherules — psammoma bodies — sit among the papillae as a further diagnostic feature.',
  ariaSummary: 'Stylized microscopic field: several long branching papillary fronds, each with a visible red central blood-vessel stalk, lined by cells whose nuclei look pale and empty with a dark rim. Some nuclei carry a thin fold-like groove; two contain a round pink inclusion. Two concentric lamellated calcified spherules sit between the fronds.',
  citation: 'StatPearls, "Papillary Thyroid Carcinoma" (NBK536943) — nuclear features, papillary architecture, and psammoma bodies quoted from its diagnostic-feature list.',
  features: [
    { key:'papillae', label:'Fibrovascular papillae',
      text:'Long, arborizing fronds in a parallel, regimented arrangement, each built around a central fibrovascular stalk — a real vessel core, which is why the stalks here are drawn red. The lining is the neoplastic epithelium.' },
    { key:'nuclei', label:'"Orphan Annie" nuclei',
      text:'The diagnosis lives here: enlarged, elongated, crowded nuclei whose chromatin clears from the center and margins to the nuclear rim — the "Orphan Annie eye." Grooves fold the nuclear contour, and intranuclear cytoplasmic pseudo-inclusions punch round pink holes in a few.' },
    { key:'psammoma', label:'Psammoma body',
      text:'A concentrically lamellated calcified spherule — thought to be the tombstone of a dead papilla tip. Listed among this tumor\'s diagnostic features, where high-grade serous ovarian carcinoma (this atlas\'s other psammoma slide) only carries them "variably."' },
  ],
};

// ============================================================
// FOLLICULAR CARCINOMA (FTC) — RAS-like entry
// ============================================================
// SITE MODEL — hematogenous, the verified inverse of papillary's nodal route (same
// PMC10135557 table: hematogenous metastasis "Frequent (29%)" vs PTC's "Rare (9%)"; lymph
// nodes "Rare (<10%)" vs PTC's "20–90%"). Distant sites verbatim: "The common sites of
// distant metastases from FTC include bone, lung, and brain." The same source carries the
// teaching detail in the FO note: nodal metastases in supposed FTC "should necessitate a
// review of the histopathology slides to rule out a missed FVPTC."
// Region ids FO/BM/LF/CE verified globally unique (as above).
//
// STRUCTURAL TREATMENT — the Prostate pattern, forced by Nikiforova et al., J Clin
// Endocrinol Metab, 2003 (PMID 12727991, verified verbatim): 49% of conventional follicular
// carcinomas had RAS mutations, 36% had PAX8-PPARγ rearrangement, and only one (3%) had both
// — "two distinct and virtually nonoverlapping molecular pathways." So the trunk is a STATUS
// entry (two founding roads), and RAS and PAX8-PPARγ appear as branch genes at different
// sites — each note stating plainly that a real tumor takes one road, never both; the map
// shows the DISEASE's two roads, not one tumor carrying two trunks (the same license the
// prostate map uses for its independently-founded foci).
// BRANCH SLOTTING — second disclosed adaptation: the approved plan pooled TERT + PTEN and
// named no third/fourth branch. The pool keeps TERT + PTEN exactly as approved; the two
// remaining branch slots take the GENIE cohort's next verified recurrent genes, ATM (13/168,
// 7.7%) and KMT2D (12/168, 7.1%), with their unadjudicated driver status stated in the notes
// rather than smoothed over. DICER1 (15.5%) is deliberately EXCLUDED from the modeled tumor
// entirely — a build-time discovery, not in the approved plan: the GENIE paper found NRAS and
// DICER1 mutually exclusive (p=0.02, zero co-occurring samples), so drawing it as a branch or
// private of this NRAS-founded tumor would depict an impossible genotype. Its story (the
// pediatric third road) lives in the trunk note instead. All GENIE figures: Hsia et al.,
// J Pers Med, 2025 (PMC12843263) — AACR Project GENIE, n=168 FTC samples.
const REGIONS_FTC = [
  { id:'FO', name:'Thyroid — within the capsule (primary)', color:cssVar('--coral'), pos3d:{x:-1.2,y:-0.5,z:0.35},
    branch:{ gene:'NRAS codon 61 mutation', class:'driver', ccf:'~34% of follicular carcinomas (57/168, GENIE); RAS overall 49% (Nikiforova, 2003)', note:'The founding road this modeled tumor took: a single amino-acid swap that locks RAS-family growth signaling on. Q61R alone accounts for 63% of NRAS hits, with Q61K most of the rest. And the mutation matters beyond the capsule: in the GENIE cohort it was more frequent in metastatic samples (42.4%) than primaries (29.2%). About this site: a follicular carcinoma that shows up with LYMPH-NODE disease is suspicious enough that pathologists re-review the slides for a missed follicular-variant papillary carcinoma — nodes are that unusual here.' } },
  { id:'BM', name:'Bone', color:cssVar('--violet'), pos3d:{x:1.2,y:0.6,z:-0.2},
    branch:{ gene:'PAX8–PPARγ fusion — the other road', class:'driver', ccf:'36% of follicular carcinomas; only 3% carry both this and a RAS mutation (Nikiforova, 2003)', note:'The disease\'s second founding route, shown at this site to display it — NOT a second event in the modeled tumor, which founded on NRAS and therefore almost certainly lacks this fusion ("two distinct and virtually nonoverlapping molecular pathways"). PAX8–PPARγ tumors run younger and smaller and are almost always overtly invasive. About this site: bone is a classic destination of this cancer\'s blood-borne spread — follicular carcinoma metastasizes through vessels in 29% of cases, versus 9% for papillary.' } },
  { id:'LF', name:'Lungs', color:cssVar('--amber'), pos3d:{x:0.2,y:1.0,z:0.25},
    branch:{ gene:'ATM mutation', class:'driver', ccf:'7.7% of follicular carcinomas (13/168, GENIE)', note:'A recurrent hit in the genome\'s master DNA-damage alarm kinase. Honesty note: the GENIE registry establishes that ATM mutations recur in this cancer, not that they drive it — no functional study has adjudicated their role in FTC specifically. About this site: among this cancer\'s distant homes, lung metastases carry the least-bad outlook — patients with pulmonary spread generally do better than those with bone, brain, or liver disease.' } },
  { id:'CE', name:'Brain', color:cssVar('--azure'), pos3d:{x:0.95,y:-0.9,z:-0.3},
    branch:{ gene:'KMT2D mutation', class:'driver', ccf:'7.1% of follicular carcinomas (12/168, GENIE)', note:'A recurrent hit in a large histone-methyltransferase — a chromatin regulator that shapes which genes a cell can express. Same honesty note as ATM: recurrent in the registry, driver role in this cancer unadjudicated. About this site: the brain completes the verified trio of this cancer\'s common distant destinations — "bone, lung, and brain" — all reached through the bloodstream, the route that defines follicular carcinoma\'s spread.' } },
];
// TRUNK — one STATUS entry (the prostate precedent: a trunk row describing how founding
// works in this disease, because no single shared mutation exists to print). The FVPTC
// straddle the gate flagged is stated here too, quantified from Zhu et al., 2003 (PMID
// 12866375): the follicular VARIANT of papillary carcinoma shows RAS 43% / RET-PTC 3% —
// the inverse of classic PTC (RET-PTC 28%, RAS 0%) — which is exactly why WHO 2022 files
// invasive encapsulated FVPTC with the RAS-like malignancies alongside FTC.
const TRUNK_FTC = [
  { gene:'One of two founding roads — RAS or PAX8–PPARγ, almost never both', class:'driver', ccf:'RAS 49% · PAX8–PPARγ 36% · both 3% (Nikiforova, 2003, n=88)', note:'Follicular carcinoma has no universal trunk mutation. It founds on one of two virtually nonoverlapping routes — a RAS point mutation or a PAX8–PPARγ fusion — and this modeled tumor took the RAS road (NRAS Q61R, at the primary site). Two honest wrinkles. First, genotype alone cannot call this cancer: benign follicular adenomas carry RAS mutations at nearly the same rate (48%), so the diagnosis is made by invasion through the capsule, not by sequencing. Second, in children the roads change entirely — DICER1 mutations found 44.4% of pediatric follicular carcinomas versus 4.6% of adult ones, and DICER1 never co-occurs with NRAS (zero samples in the GENIE cohort), a third road this adult-modeled tumor cannot carry.' },
];
// PRIVATE POOL — TERT + PTEN, exactly as the approved Phase-2 plan pooled them. TERT-promoter
// placement as a per-cell PRIVATE (late, subclonal) also matches this gene's verified thyroid
// biology: in the GENIE cohort all 38 TERT mutations were 5'-flank promoter hits, found
// exclusively in adults, and the multi-omics review lists TERT among the "aggressive"-course
// markers — the progression tail of the disease, not its founding.
const PRIVATE_POOL_FTC = [
  { gene:'TERT promoter mutation', class:'driver', note:'Reactivates telomerase — the division-counter reset. Found in 22.6% of follicular carcinomas (38/168, GENIE), every one a promoter mutation and every one in an adult; its co-occurrence with RAS-road tumors is directly documented, with no exclusivity, and it flags the aggressive, recurrence-prone end of the disease. Thyroid is this atlas\'s fourth organ where TERT sits at or near the tumor\'s founding architecture (after liver, melanoma, and bladder).' },
  { gene:'PTEN loss', class:'driver', note:'Removes a brake on the PI3K growth pathway — 10.7% of follicular carcinomas (18/168, GENIE). The same recurring route to a growth advantage this atlas shows in ovarian and prostate tumors, here as a later, cell-private event layered over the RAS road.' },
];
// HISTOLOGY — a genuinely new slide concept for the atlas: DIAGNOSIS BY RELATIONSHIP TO THE
// CAPSULE. Verified verbatim (Luvhengo et al., Biomedicines, 2023, PMC10135557): "Follicular
// carcinoma is differentiated from FA by evidence of vascular and/or capsular invasion, which
// cannot be shown on FNAC, and FNAC is therefore not able to distinguish FTC from FA";
// "Follicular adenoma and FTC cannot be distinguished even after immunohistochemistry and
// mutational analysis"; the capsule row of the same paper's PTC/FTC contrast table ("Tumour
// capsule: Yes"); and the mi-FTC vs wi-FTC subtype split defined by extent of invasion.
// Deliberately NOT claimed: any percentage split of growth patterns, "microfollicular" as a
// sourced term, or nuclear atypia claims — this tumor's cells famously look benign, and the
// intro says exactly that instead.
const HISTOLOGY_FTC = {
  intro: 'Follicular carcinoma is the atlas\'s one diagnosis made at a boundary. The tumor itself — small crowded follicles in a fibrous capsule — can look identical to a benign adenoma cell-by-cell: needle cytology cannot make this diagnosis, and neither can immunohistochemistry or even sequencing (benign adenomas carry RAS mutations too). The carcinoma declares itself only where tumor breaches the capsule — a full-thickness mushroom of cells punching through — or where it plugs a vessel in or beyond the capsule. Minimal invasion (a capsule breach alone) and wide invasion mark the entity\'s indolent and aggressive ends.',
  ariaSummary: 'Stylized microscopic field: a large round nodule of small, uniform, crowded follicles enclosed by a thick pink fibrous capsule, surrounded by larger placid normal follicles filled with colloid. At one point the tumor bulges clean through the capsule in a mushroom shape; nearby, a red blood vessel at the capsule edge contains a plug of tumor cells.',
  citation: 'Luvhengo et al., Biomedicines, 2023 (PMC10135557) — invasion criteria, FNA limitation, and the adenoma/carcinoma indistinguishability all quoted from its text and PTC/FTC contrast table; two-road genetics: Nikiforova et al., J Clin Endocrinol Metab, 2003.',
  features: [
    { key:'follicles', label:'Follicles that look benign',
      text:'Small, crowded, back-to-back follicles — a pattern a benign adenoma reproduces exactly. Nothing about these cells, their immunostains, or their mutations distinguishes carcinoma from adenoma; a needle aspirate of this area returns "follicular neoplasm," a question, not an answer.' },
    { key:'capsule', label:'Capsular invasion',
      text:'The diagnosis. A full-thickness tongue of tumor punching through the fibrous capsule — the single criterion that separates carcinoma from adenoma. A breach like this and nothing more defines minimally invasive FTC, the entity\'s indolent end.' },
    { key:'vessel', label:'Vascular invasion',
      text:'Tumor plugging a vessel within or beyond the capsule — the second qualifying form of invasion, and the more ominous one: vessels are this cancer\'s highway, the reason its metastases surface in bone, lung, and brain rather than the neighboring lymph nodes.' },
  ],
};

export const cancerDetails = {
  ptc: {
    title:'Papillary Carcinoma', screenLabel:'Papillary thyroid carcinoma — tumor explorer',
    legendTitle:'Sites (lymphatic-first spread pattern)',
    regions:REGIONS_PTC, trunk:TRUNK_PTC, privatePool:PRIVATE_POOL_PTC,
    histology: HISTOLOGY_PTC,
  },
  ftc: {
    title:'Follicular Carcinoma', screenLabel:'Follicular thyroid carcinoma — tumor explorer',
    // The one-line site-model honesty statement, in the legend where the sites are (the OCCC
    // precedent): blood-borne routes, and one founding road per real tumor.
    legendTitle:'Sites (hematogenous spread — one founding road per tumor)',
    regions:REGIONS_FTC, trunk:TRUNK_FTC, privatePool:PRIVATE_POOL_FTC,
    histology: HISTOLOGY_FTC,
  },
};
