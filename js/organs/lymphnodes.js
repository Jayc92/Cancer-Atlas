import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

// active:true. Alias collision check (grep across every organ's own aliases before use, same
// standing rule as every prior organ): no other organ claims "lymph node(s)", "nodal", or
// "lymphoma" as a bare word. Colon's own clymph entity ("primary colonic lymphoma") is a
// DIFFERENT, organ-localized disease from every entity modeled here — its own commit record
// states explicitly that authoring it did NOT settle the systemic/nodal question, which is what
// this organ exists to answer. "lymphoma" is deliberately NOT a bare alias here for that reason:
// a bare "lymphoma" query should surface search results across every organ that has one
// (colon's clymph included), not auto-resolve to this organ alone.
export const organEntry = { key:'lymphnodes', label:'Lymph Nodes', system:'Lymphatic', active:true, sexes:['female','male'], aliases:['lymph node','lymph nodes','nodal','lymphatic system'] };

// A lymph node has no single representative body location — it's a distributed tissue, not one
// organ in one place, the same structural fact its own site models (below) are built around.
// Anchored at a cervical station (the real site Hodgkin lymphoma commonly arises in — Kaseb &
// Babiker, StatPearls "Hodgkin Lymphoma," PMID 29763144) rather than an abdominal one, on the
// same "pick the real, most clinically legible landmark"
// logic every other body marker in this app already uses. heightFrac/angle probed the same
// height/angle-grid way every prior organ's marker was (not eyeballed): 0.86/-25 lands
// consistently on the anterior neck, clear of the thyroid marker's own column, on both sexes.
export const markerSpec = { points:[{heightFrac:0.86, angle:-25}] };

export const cancerEntries = [
  { id:'fl',     name:'Follicular lymphoma', share:'~12.4% of mature non-Hodgkin lymphoma in modern US SEER data, 2008–2017 (Su et al., PLoS One, 2022) — an older but still widely-cited 22% figure comes from a 1997 international cohort (Non-Hodgkin’s Lymphoma Classification Project, Blood, 1997); the gap most plausibly reflects registry-era and ascertainment differences, not one source being wrong, and neither is silently preferred here', active:true, organKey:'lymphnodes' },
  { id:'mcl',    name:'Mantle cell lymphoma', share:'~6% of non-Hodgkin lymphoma (Pérez-Galán, Dreyling & Wiestner, Blood, 2011) — this entry models classical, nodal, SOX11-positive MCL specifically; a distinct, indolent, leukemic non-nodal (SOX11-negative) subtype exists and is described in this entry’s own trunk note rather than given a second entry', active:true, organKey:'lymphnodes' },
  { id:'bl',     name:'Burkitt lymphoma', share:'30–40% of pediatric non-Hodgkin lymphoma (Choi & Quintanilla-Martinez, Virchows Arch, 2024) — this entry is scoped to the sporadic (Western, non-EBV-driven-majority) clinical form; the endemic African, EBV-associated form is real, genetically distinct, and disclosed throughout this entry’s notes rather than given its own entry, given how geographically concentrated it is', active:true, organKey:'lymphnodes' },
  { id:'chl',    name:'Classical Hodgkin lymphoma', share:'~10% of all lymphomas in the United States (Ansell, Am J Hematol, 2022)', active:true, organKey:'lymphnodes' },
  { id:'aitl',   name:'Angioimmunoblastic T-cell lymphoma', share:'~18.5% of peripheral T-cell/NK-cell lymphomas — the second most common subtype after PTCL-NOS (Vose, Armitage & Weisenburger; International T-Cell Lymphoma Project, J Clin Oncol, 2008, N=1,314) — roughly 1–2% of all non-Hodgkin lymphoma (Jain et al., Am J Blood Res, 2020; Shah et al., J Clin Pathol, 2009)', active:true, organKey:'lymphnodes' },
  { id:'ndlbcl', name:'Diffuse large B-cell lymphoma', share:'the single most common lymphoma subtype worldwide, ~30% of all non-Hodgkin lymphoma (Sehn & Salles, N Engl J Med, 2021) — roughly half of DLBCL presents primarily nodal, the rest extranodal (Padala & Kallam, StatPearls, “Diffuse Large B-Cell Lymphoma”); this entry models the nodal-presenting majority, with its own mutation landscape rather than the one already modeled at this atlas’s Colon organ for primary gastrointestinal DLBCL — see this entry’s own trunk note for the real, matched-cohort evidence that the two are not interchangeable', active:true, organKey:'lymphnodes' },
  { id:'nmzl',   name:'Nodal marginal zone lymphoma', share:'the rarest and least genetically characterized of the three WHO-recognized marginal zone lymphoma types (nodal, splenic, and extranodal/MALT) — despite a targeted search, no source located gives a specific, citable percentage of non-Hodgkin lymphoma this entity represents on its own; stated honestly rather than filled with an estimate', active:true, organKey:'lymphnodes' },
  { id:'ptcln',  name:'Peripheral T-cell lymphoma, NOS', share:'the most common peripheral T-cell lymphoma subtype, ~25.9% of PTCL/NK-cell lymphomas (Vose, Armitage & Weisenburger; International T-Cell Lymphoma Project, J Clin Oncol, 2008, N=1,314) — its share of all non-Hodgkin lymphoma specifically was not found to a citable figure in the same search and is not asserted here', active:true, organKey:'lymphnodes' },
];

// MESH SOURCE: NIH 3D's Human Reference Atlas 3D Reference Object Library, "Lymph Node, Female"
// (3DPX-020975, DOI 10.48539/HBM463.LFHF.874, CC BY 4.0 — license verified directly on the
// entry page and in the submission's own metadata). Used generically for both sexes, the same
// "one real asset stands in for an anatomically non-dimorphic structure" convention Kidneys'
// left-kidney asset already established — lymph nodes have no sex-linked anatomy.
// PROVENANCE, DISCLOSED AS THE SOURCE'S OWN CLAIM, NOT THIS ATLAS'S: unlike every other HRA organ
// in this app (all traced to the Visible Human Dataset, a human cadaver scan), this asset's
// underlying data is Clearing-enhanced 3D (Ce3D) microscopy of MOUSE lymph node tissue (Li,
// Germain & Gerner, PNAS, 2017, DOI 10.1073/pnas.1708981114). The entry's own description states
// directly: "While the size and cellular composition of mouse and human lymph nodes varies
// between species, the overall anatomy is well-conserved" — quoted here as NIH 3D's own claim
// about cross-species conservation, not independently verified by this atlas and not asserted as
// this atlas's own finding. Same disclosure standard as Breast's non-VHD (hand-sculpted) sourcing.
// TOPOLOGY: parsed directly from the downloaded GLB's own glTF JSON chunk, not read off the
// listing page. Seven real, separately-named sub-meshes, each with its own UBERON-tagged
// ontology entry on the source page (capsule, follicles, paracortex, medulla, afferent vessel,
// efferent vessel, blood vasculature) — confirmed as real, distinct GEOMETRY by direct
// vertex-centroid computation on every sub-mesh, not assumed from the ontology tags alone.
// 254,663 triangles, 4.5MB — no decimation performed; comparable to several other organs'
// pre-decimation size and the app's own render-cost benchmark has shown wide headroom at every
// resolution tried on organs this size.
// SCALE: NONE — presented at true real-world size, unlike Skin's own cross-section block. The
// organ's true bounding box (~1.96 x 1.13 x 1.25 cm, bounding RADIUS ~1cm) was checked directly
// against the viewer's OWN camera near plane before assuming Skin's SCALE-multiplier trick was
// needed again: js/viewer.js's makeViewer sets near:0.01 (not 0.1), a fix already made during
// the Thyroid pass specifically to "clears every organ down to ~1 cm bounding radius" (viewer.js's
// own comment, verbatim) — AFTER Skin shipped its own workaround, which is why Skin's own build
// note describes a trap this organ does not actually hit. A real bug was caught live before this
// was corrected: an earlier draft of this file DID scale by 8x and recentered in the wrong
// transform order (position.sub(center) before scale, when position and scale compose
// independently — worldPos = position + scale⊙localPos — so the recentering offset silently got
// multiplied by SCALE too), throwing the mesh ~1.5m off-center; removing the unnecessary SCALE
// entirely removed that whole failure mode rather than just reordering around it.
// Hotspot anchors are real vertex centroids of the four named sub-meshes chosen for this app's
// interaction (capsule/follicles/paracortex/medulla), computed directly from the GLB's own binary
// buffer with the SAME bbox-center subtraction \`gltf.scene.position.sub(center)\` performs at
// load time (Pancreas's own established convention for a still-body-space HRA asset), each then
// nudged outward from the organ's overall centroid (the Bladder centroid-nudge technique) and
// verified to remain within that sub-mesh's own bounding box before being used — not eyeballed.
export function buildLymphNodesMesh(){
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/lymphnodes.glb', (gltf)=>{
      gltf.scene.updateMatrixWorld(true);
      const mat = new THREE.MeshPhysicalMaterial({ color:0xe8d9c8, roughness:0.5, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      const mottleMeshes = [];
      gltf.scene.traverse(o=>{ if(o.isMesh) mottleMeshes.push(o); });
      const unionBox = new THREE.Box3();
      mottleMeshes.forEach(o=>unionBox.expandByObject(o));
      mottleMeshes.forEach(o=>{ o.material = mat;
        applyTissueMottleVertexColors(o.geometry, 12.9, { frame:{ box: unionBox, matrixWorld: o.matrixWorld } }); });
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Lymphatic System', title:'Lymph Nodes',
  sub:'Bean-shaped filters along the lymphatic vessels — shown at true scale (~2cm) — screen lymph for pathogens and stage immune responses',
  facts:[
    {label:'Structure', val:'Encapsulated, with an outer cortex (B-cell follicles, some with germinal centers), a paracortex (T-cell zone), and an inner medulla'},
    {label:'Flow', val:'Lymph enters through several afferent vessels around the capsule and leaves through fewer efferent vessels at the hilum'},
    {label:'Distribution', val:'Hundreds of nodes cluster along the body’s lymphatic vessels — cervical, axillary, inguinal, mediastinal, mesenteric, and retroperitoneal groups among them'},
    {label:'Function', val:'Filters lymph, and is where B and T lymphocytes encounter antigen and mount an adaptive immune response'},
  ],
  desc:'A lymph node is not one organ in one place but hundreds of small, bean-shaped filters strung along the body’s lymphatic vessels, encapsulated and internally zoned: an outer cortex packed with B-cell follicles — some resting, some carrying a germinal center where B cells are actively selected and refined — a paracortex where T cells and dendritic cells meet, and an inner medulla where lymph and cells prepare to leave through efferent vessels at the hilum. Every lymphoma modeled here begins as a normal lymphocyte inside this structure; several are named directly for the zone they arise in.',
  // Hotspot anchors are real vertex centroids of four of the GLB's own seven named sub-meshes
  // (capsule/follicles/paracortex/medulla — the afferent/efferent-vessel and blood-vasculature
  // sub-meshes were left unused, the same "not every named sub-mesh needs its own hotspot"
  // precedent Bladder's own six-sub-mesh asset already set), computed directly from the binary
  // buffer, recentered by the same bbox-center subtraction buildLymphNodesMesh() performs at
  // load time, nudged outward from the organ's own overall centroid (verified to remain within
  // each sub-mesh's own bounding box first — the Bladder centroid-nudge lesson). True scale, no
  // multiplier — see buildLymphNodesMesh's own comment on why no SCALE constant exists here.
  hotspots:[
    { pos:[0.0015375,-0.0013375,-0.0009625], label:'Follicles',
      text:'The cortex’s B-cell-rich zones, some carrying a germinal center where B cells are selected for antibody quality. Follicular lymphoma arises here directly, and its own growth pattern recapitulates this architecture; Burkitt lymphoma arises specifically from the germinal center’s dark-zone centroblasts; mantle cell lymphoma arises from the naive B cells of the surrounding mantle zone. Classical Hodgkin lymphoma’s malignant cells are also germinal-center-B-cell-derived, though the disease itself does not stay confined here — see that cancer’s own trunk note.' },
    { pos:[0.00085,-0.0007375,0.0001125], label:'Paracortex',
      text:'The T-cell zone between the cortex and medulla, where T cells encounter antigen presented by dendritic cells. Angioimmunoblastic T-cell lymphoma arises from the T-follicular-helper cells that normally reside here (de Leval et al., Blood, 2007) — a real, spatially locatable origin, though the disease itself goes on to efface the node’s broader architecture rather than staying confined to this zone.' },
    { pos:[0.0004,0.000775,-0.00055], label:'Medulla',
      text:'The innermost zone, where lymph collects in medullary sinuses en route to the efferent vessels, and where many of the node’s resident plasma cells are found.' },
    { pos:[0.000375,0.0003,0.0001], label:'Capsule',
      text:'The fibrous outer covering. Lymph enters through several afferent vessels piercing the capsule around its circumference and leaves through fewer efferent vessels at the hilum — the opposite flow pattern of a blood vessel, which is why a lymph node can filter lymph from several directions at once.' },
  ],
  // Viewer config hand-tuned to this organ's own true small scale, the same convention Thyroid
  // (a comparably small gland) already established rather than the ~1-2 unit procedural-organ
  // defaults or the half-meter real-mesh defaults larger organs use.
  viewer:{ theta:0.5, phi:1.15, radius:0.03, minRadius:0.008, maxRadius:0.08, autoRotateRadPerFrame:0.0016 },
  buildMesh: buildLymphNodesMesh,
};

// ============================================================================================
// TRUNK_FL / REGIONS_FL / PRIVATE_POOL_FL — Follicular lymphoma
// Origin: germinal-center B cells (centrocytes/centroblasts), confirmed directly and doubly
// corroborated — Salaverria et al., Blood Adv, 2023, PMID 37561599; Xerri et al., Virchows
// Arch, 2016, PMID 26481245; WHO-HAEM5 (Alaggio et al., Leukemia, 2022, PMID 35732829). Unlike
// every other entity on this screen, FL's own GROWTH pattern is itself at least focally
// follicular — the disease doesn't just arise in the germinal center, it visibly recapitulates
// its architecture, which is why ORIGIN_HOTSPOT_ENTRY needs no override for this entity: the
// organ's own default hotspot (Follicles) already says exactly what this disease's own biology
// needs it to say.
// TRUNK (three entries, all early/founding by direct evidence, not by pattern-matching to the
// LUAD/HGSOC one-gene-founder shape): t(14;18)(IGH::BCL2) is the near-universal cytogenetic
// hallmark, 85–90% (Kurz et al., Cancers, 2023, PMID cited below) — but that figure drops
// sharply by histologic grade, from 88% in grade 1/2 down to as little as 0–5% in grade 3B,
// where BCL6/3q27 rearrangements often substitute (Katzenberger et al., Am J Pathol, 2004, PMID
// 15277222). Stated as the real range, not averaged away. CREBBP and KMT2D join it as trunk-level
// SEQUENCE mutations on the strongest available timing evidence — Okosun et al. (Nat Genet,
// 2014, PMID 24362818) found both "predominantly clonal," frequently compound-heterozygous
// (two independent hits within the same gene, a real selection signal), and named as "early
// driver genes" by longitudinal, multi-timepoint sequencing; Vogelsberg et al. (Haematologica,
// 2021, PMID 32855278) independently corroborate by tracing CREBBP/KMT2D/EZH2/TNFRSF14/BCL2 all
// the way back into in-situ follicular neoplasia, FL's own precursor lesion — a third,
// independent line of evidence for early timing. Bodor et al. (Blood, 2013, PMID
// 24052547) corroborate EZH2's own clonal persistence across diagnosis-to-transformation pairs,
// which is why EZH2 sits at branch level below rather than trunk — see that entry's own note.
const TRUNK_FL = [
  { gene:'t(14;18)(IGH::BCL2) translocation', class:'driver', ccf:'85–90% of follicular lymphoma overall (Kurz et al., Cancers, 2023, PMID 36765742); drops sharply by grade — 88% in grade 1/2 (Katzenberger et al., Am J Pathol, 2004, PMID 15277222) versus as low as 0–5% in grade 3B, where BCL6/3q27 rearrangement often substitutes instead', note:'The defining cytogenetic hallmark, juxtaposing BCL2 next to the immunoglobulin heavy-chain enhancer and driving its overexpression — a survival, not proliferation, advantage in the germinal-center B cells it arises in. Real range stated rather than averaged: this atlas’s own driver-verification standard applies to grade-stratified figures the same way it applies to cross-cohort ones elsewhere.' },
  { gene:'CREBBP mutation', class:'driver', ccf:'32.6% in a dedicated FL cohort (Pasqualucci et al., Nature, 2011, PMID 21390126); 52.4% in a later, deeper-sequenced series (Krysiak et al., Blood, 2016, PMID 28064239)', note:'An acetyltransferase gene, inactivated alongside its paralog EP300 in at least 41% of FL cases combined. Confirmed as a predominantly early, founding-clone event by two independent lines of evidence: frequent compound-heterozygous (biallelic) mutation within the same tumor (Okosun et al., 2014), and detection already within in-situ follicular neoplasia, FL’s own precursor lesion, before it becomes overt lymphoma (Vogelsberg et al., 2021).' },
  { gene:'KMT2D (MLL2) mutation', class:'driver', ccf:'range 37–72% across independent cohorts (Ortega-Molina et al., Nat Med, 2015, PMID 26366710, found nearly 40%; Krysiak et al., 2016, found 60.0%; a 2018 review synthesis cites 72%) — reported as the real spread rather than one picked number', note:'A histone methyltransferase named directly by Okosun et al. (2014) as an early driver gene, frequently compound-heterozygous in the same tumor — and, like CREBBP, detected already within FL’s own in-situ precursor lesion (Vogelsberg et al., 2021). Over 70% of FL cases carry mutations in at least two of these chromatin-modifying genes together (Okosun et al.), a real, directly observed co-occurrence — not the chance overlap a naive reading of two large percentages might suggest.' },
];
const REGIONS_FL = [
  { id:'LA', name:'Axillary lymph nodes', color:cssVar('--coral'), pos3d:{x:-1.3,y:1.1,z:0.4},
    branch:{ gene:'EZH2 Y641 mutation', class:'driver', ccf:'7.2% Y641-hotspot-specific (Morin et al., Nat Genet, 2010, PMID 20081860, the discovery paper); pan-EZH2 (any exonic mutation) 17–27.5% in later, deeper-sequenced cohorts (Bódor et al., Blood, 2013, PMID 24052547; a 2018 review cites ~25%) — two different measurements of the same gene, both reported', note:'A GENUINE, UNRESOLVED TIMING QUESTION IN THE PRIMARY LITERATURE, disclosed rather than picked: Okosun et al. (2014) and Bódor et al. (2013) — both larger, multi-timepoint cohorts — found EZH2 predominantly clonal and persistent across diagnosis-to-transformation biopsy pairs, consistent with an early, founding event. Green et al. (PNAS, 2015, PMID 25713363), using an independent phylogenetic-reconstruction method on a different cohort, found EZH2 mutations "never inferred within" the earliest inferable progenitors of their own patients’ tumors — a late, subclonal pattern. No source reconciles the two findings, and none is picked as correct here.' } },
  { id:'LC', name:'Cervical lymph nodes', color:cssVar('--azure'), pos3d:{x:1.4,y:1.3,z:-0.3},
    branch:{ gene:'EZH2 Y641 mutation', class:'driver', ccf:'same gene and figures as this cancer’s own Axillary lymph nodes site', note:'Same gene as this cancer’s own Axillary lymph nodes site — see that site’s note for the disclosed early-versus-late timing dispute.' } },
  { id:'LF', name:'Femoral lymph nodes', color:cssVar('--amber'), pos3d:{x:-0.5,y:-1.4,z:0.5},
    branch:{ gene:'TNFRSF14 mutation', class:'driver', ccf:'18.3% (46/251, Cheung et al., Cancer Res, 2010, PMID 20884631); independently corroborated at 28% (40/141, Boice et al., Cell, 2016, PMID 27693350) — a separate 1p36.32 copy-number deletion affecting the same locus is found in a further 20–34% of cases across these two cohorts', note:'Encodes HVEM, a receptor that normally restrains B-cell activation — its loss removes a brake on the same germinal-center reaction FL’s own trunk mutations exploit. Its own early-versus-late timing is similarly disputed: Okosun et al. (2014) found it "predominantly clonal"; Green et al. (2015) found relapse-specific detection in 9 of 16 paired cases — i.e. frequently absent at diagnosis and arising later. Disclosed, not resolved, the same standard as this cancer’s own EZH2 branch.' } },
  { id:'LI', name:'Inguinal lymph nodes', color:cssVar('--violet'), pos3d:{x:0.3,y:-1.1,z:-0.5},
    branch:{ gene:'TNFRSF14 mutation', class:'driver', ccf:'same gene and figures as this cancer’s own Femoral lymph nodes site', note:'Same gene as this cancer’s own Femoral lymph nodes site — see that site’s note for the disclosed timing dispute.' } },
];
const PRIVATE_POOL_FL = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas’s other lymphoid and solid-tumor entries already model, common simply because TTN is one of the largest genes in the genome.' },
];

// HISTOLOGY_FL: genuinely new architecture (js/histology.js's genFL) — the only entity on this
// screen whose growth pattern is organized into discrete follicles/nodules rather than a diffuse
// sheet, matching the real, doubly-corroborated finding that FL’s own growth recapitulates
// germinal-center architecture (Salaverria et al., 2023: "at least a focal follicular growth
// pattern"). Colonized follicles show a mixed centrocyte (small, cleaved/angulated nucleus) and
// centroblast (larger, round, several nucleoli) population, per the WHO's own defining cytology;
// grading (1/2/3) by centroblast count per high-power field is named in prose, not drawn as a
// numeric feature, matching this atlas's existing IHC-in-prose-only convention.
const HISTOLOGY_FL = {
  intro: 'Follicular lymphoma is architecturally distinctive among the lymphomas modeled on this screen: rather than a diffuse sheet, it grows as expanded, back-to-back follicles that colonize and efface the lymph node’s normal cortex. Each follicle is a mix of small centrocytes, with cleaved or angulated nuclei, and larger centroblasts, with round nuclei and several small nucleoli — the same two cell types that populate a normal germinal center, since this is where the disease arises. Grading (1 through 3) counts centroblasts per high-power field, a distinction described in the cited sources but not drawn here, matching this atlas’s existing convention for immunohistochemical and count-based diagnostic criteria.',
  ariaSummary: 'Stylized microscopic field: several rounded, densely packed follicular nodules of varying size, colonized by a mix of small cleaved-nucleus centrocytes and larger round-nucleus centroblasts with visible nucleoli, replacing the normal lymph node architecture between them.',
  citation: 'Salaverria et al., Blood Adv, 2023 (PMID 37561599); Xerri et al., Virchows Arch, 2016 (PMID 26481245); WHO-HAEM5 (Alaggio et al., Leukemia, 2022, PMID 35732829).',
  features: [
    { key:'follicles', label:'Colonized follicles',
      text:'Expanded, closely packed neoplastic follicles replacing the node’s normal architecture — the real, at-least-focal follicular growth pattern this disease is named for.' },
    { key:'centrocytes', label:'Centrocytes',
      text:'Small-to-medium cells with irregular, cleaved or angulated nuclei — the more numerous of the two normal germinal-center cell types this lymphoma is built from.' },
    { key:'centroblasts', label:'Centroblasts',
      text:'Larger cells with round nuclei and several small, peripherally placed nucleoli. Their density per field is what grades this cancer 1 through 3.' },
  ],
};

// ============================================================================================
// TRUNK_MCL / REGIONS_MCL / PRIVATE_POOL_MCL — Mantle cell lymphoma
// SCOPED TO CLASSICAL, NODAL, SOX11-POSITIVE MCL, deliberately — the WHO classification itself
// (Swerdlow et al., Blood, 2016, PMID 26980727) states directly that classical MCL (SOX11+,
// IGHV-unmutated-or-minimally-mutated, "typically involves lymph nodes") and leukemic non-nodal
// MCL (SOX11−, IGHV-mutated, "usually involving the PB, bone marrow, and often spleen,"
// "frequently clinically indolent") are two distinct clinicobiological subtypes, not a minor
// variant of one disease — independently corroborated by four further Campo-group papers
// (Fernàndez et al., Cancer Res, 2010; Royo et al., Leukemia, 2012; Navarro et al., Cancer Res,
// 2012; Beá & Amador, Curr Oncol Rep, 2017). This entry describes the classical/nodal form
// only; a reader with the leukemic non-nodal form should know this entry does not describe them,
// so that distinction is stated directly in the trunk note below rather than left implicit.
const TRUNK_MCL = [
  { gene:'t(11;14)(CCND1::IGH) translocation / Cyclin D1 overexpression', class:'driver', ccf:'>95% of mantle cell lymphoma (Qiu et al., Hum Pathol, 2022, PMID 34767860)', note:'The near-universal founding event, juxtaposing CCND1 next to the immunoglobulin heavy-chain enhancer and driving cyclin D1 overexpression — a cell-cycle accelerant, not sufficient on its own to transform a cell (Jares, Colomer & Campo, J Clin Invest, 2012, PMID 23023712, state directly that "cyclin D1 dysregulation is not sufficient for cell transformation," requiring the cooperating "second hit" events modeled at branch level below). A small CCND1-negative subset exists, roughly half of which instead carries a CCND2 rearrangement at the same functional locus (Salaverria et al., Blood, 2013, PMID 23255553) — real, but no precise overall percentage was found and none is asserted here. THIS ENTRY DESCRIBES CLASSICAL, NODAL, SOX11-POSITIVE MCL ONLY. A biologically distinct, genuinely indolent leukemic non-nodal subtype is recognized in the WHO classification — SOX11-negative, IGHV-mutated, presenting instead in blood, bone marrow and spleen (WHO-HAEM5, Swerdlow et al., 2016) — and is not described by any figure in this entry.' },
];
const REGIONS_MCL = [
  { id:'MG', name:'Gastrointestinal tract', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'ATM mutation', class:'driver', ccf:'41% (12/29) in a whole-exome discovery cohort, rising to 55% (12/22) within SOX11-positive tumors specifically (Beá et al., PNAS, 2013, PMID 24145436); independently, ATM mutation and/or deletion combined reaches 56% (40/72) in a separate cohort (Greiner et al., PNAS, 2006, PMID 16461462)', note:'ATM mutations were reported "in 12 of the 22 (55%) tumors expressing SOX11, but in none of the SOX11-negative MCL" in the discovery cohort — a real, entity-specific finding that makes this gene a genuinely nodal/classical-MCL-scoped figure, not a borrowed general one. GI-tract involvement itself is real and substantial: systematic endoscopic biopsy of both symptomatic and asymptomatic-appearing tissue found histologic MCL in 88% of lower GI and 43% of upper GI samples (Romaguera et al., Cancer, 2003, PMID 12548600) — though only 26% of that same cohort had GI symptoms at diagnosis, a caveat that must travel with the 88% figure rather than being dropped.' } },
  { id:'MS', name:'Spleen', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'ATM mutation', class:'driver', ccf:'same gene and figures as this cancer’s own Gastrointestinal tract site', note:'Same gene as this cancer’s own Gastrointestinal tract site. Splenomegaly and splenic involvement are named repeatedly across independent case series as part of this disease’s real, disseminated presentation (Lynch et al., StatPearls, "Mantle Cell Lymphoma," PMID 30725670) without a clean, citable overall percentage — disclosed as real but unquantified rather than assigned an invented figure.' } },
  { id:'MM', name:'Bone marrow', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'11% at diagnosis in a dedicated 183-patient younger-MCL trial cohort (Eskelund et al., Blood, 2017, PMID 28819011); independently, 22–28% across two further cohorts using broader sequencing (Beá et al., 2013; Mareckova et al., Leuk Lymphoma, 2019, PMID 30626249) — markedly enriched in blastoid disease specifically (Pérez-Galán, Dreyling & Wiestner, Blood, 2011, PMID 20940415)', note:'Unlike ATM, TP53 mutation is "equally distributed... regardless of SOX11 expression" (Beá et al., 2013) — a real, checked difference between the two genes’ own timing/enrichment patterns, not an assumption. A DEDICATED STUDY TESTING EXACTLY THIS PAIR (Mareckova et al., 2019) found ATM and TP53 mutations "show mutual exclusivity" — only 3 of 72 patients carried both — modeled here as the two alternative "second hit" branch events atop the CCND1 trunk, consistent with Jares, Colomer & Campo’s (2012) framing of MCL needing a cooperating lesion beyond cyclin D1 dysregulation to transform.' } },
  { id:'MP', name:'Peripheral blood', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'same gene and figures as this cancer’s own Bone marrow site', note:'Same gene as this cancer’s own Bone marrow site. A CDKN2A deletion (20–25%, Delfau-Larue et al., Blood, 2015, PMID 26022239; Eskelund et al., 2017) frequently co-occurs with TP53 deletion specifically — not competing with it — and the same source found simultaneous deletion of both carries a markedly worse median survival (1.8 years) than either alone (4.3–5.1 years); disclosed in prose here rather than modeled as a third branch gene, since the app’s branch/site schema has no slot for a two-gene cooperating pair beyond the two already carrying this cancer’s own four sites.' } },
];
const PRIVATE_POOL_MCL = [
  { gene:'NOTCH1 mutation', class:'driver', note:'Truncating mutations clustered in the PEST domain, found in 12% of clinical MCL samples by whole-transcriptome sequencing (Kridel et al., Blood, 2012, PMID 22210878), associated with poor survival. A related gene, NOTCH2, is mutated in a further ~5% of cases but "occurred in different subsets of tumors because only 1 of the 16 patients with mutations in these genes had mutations in both" (Beá et al., 2013, PNAS) — checked directly against this atlas’s own private-pool exclusivity standard and left OUT of this pool for exactly that reason, since a shared pool would otherwise draw both genes into cells regardless of which branch a cell belongs to, contradicting the real exclusivity the source itself reports.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas’s other entries already model.' },
];

const HISTOLOGY_MCL = {
  intro: 'Mantle cell lymphoma is a monotonous population of small-to-medium lymphocytes with irregular, angulated or cleaved nuclear contours and scant cytoplasm — distinct from follicular lymphoma’s own mixed centrocyte/centroblast population and from the large, discrete cells of diffuse large B-cell lymphoma. Growth can be diffuse, vaguely nodular, or confined to a widened mantle zone around a residual, uncolonized germinal center — the earliest and most subtle of the three real growth patterns this disease shows. Scattered “pink histiocytes” (epithelioid histiocytes with pale, hyaline-appearing cytoplasm) are a real, recognized associated finding, described in the cited sources but not drawn here as their own feature.',
  ariaSummary: 'Stylized microscopic field: a dense, monotonous sheet of small-to-medium lymphoid cells with irregular, angulated nuclear outlines and scant cytoplasm, arranged in a vaguely nodular pattern with a paler residual zone — a spared germinal center — near one edge, surrounded by an expanded cuff of the same monotonous cells.',
  citation: 'Jares, Colomer & Campo, J Clin Invest, 2012 (PMID 23023712); Swerdlow et al. (WHO), Blood, 2016 (PMID 26980727).',
  features: [
    { key:'monotonous', label:'Monotonous small-medium cells',
      text:'A uniform population of small-to-medium lymphocytes with irregular, angulated nuclear contours — the defining low-power impression of this cancer, distinct from every other lymphoma modeled on this screen.' },
    { key:'mantlezone', label:'Expanded mantle zone',
      text:'The earliest, most subtle real growth pattern: neoplastic cells widen the mantle zone around a still-intact germinal center, rather than replacing it outright — the pattern this cancer is named for.' },
    { key:'residualgc', label:'Residual germinal center',
      text:'A paler, spared zone where a normal germinal center persists, not yet colonized — visible only in the mantle-zone growth pattern, and absent once the disease becomes fully diffuse.' },
  ],
};

// ============================================================================================
// TRUNK_BL / REGIONS_BL / PRIVATE_POOL_BL — Burkitt lymphoma
// A GENUINE, DIRECTLY-STATED STRUCTURAL SPLIT, disclosed rather than smoothed over: this
// disease's ORIGIN is nodal — the germinal-center dark zone — while its real, dominant
// PRESENTATION is extranodal. Origin: Schmitz et al. (Nature, 2012, PMID 22885699) describe the
// cell of origin as "the normal germinal centre B cell" — a rapidly-dividing germinal-center
// B cell (centroblast) in this atlas's own more specific gloss, not a Schmitz quote, consistent
// with WHO-HAEM5's own immunophenotype (CD10+, BCL6+, high Ki-67). That is why this entity needs no
// ORIGIN_HOTSPOT_ENTRY override: its founding cell lineage sits at this organ's own default
// hotspot (Follicles, which spans the germinal center). But Naing, Kaur & Lynch's dedicated
// StatPearls chapter ("Burkitt Lymphoma," PMID 30844175) states directly that sporadic Burkitt's
// "primary site... is typically the abdomen," with jaw involvement characterized as
// "infrequently" seen and mediastinal/CNS/other named sites explicitly "rare" — the real reason
// this cancer's own REGIONS below are organ/mass sites, the SAME kind of site model most solid
// tumors on this atlas already use, not a nodal-station list.
const TRUNK_BL = [
  { gene:'MYC translocation — t(8;14)(IGH::MYC) or a variant t(2;8)/t(8;22)', class:'driver', ccf:'t(8;14) in ~80% of cases; the variant t(2;8)(IGK::MYC) or t(8;22)(IGL::MYC) translocations together in a further 15–20% (Anagnostopoulos et al., Cancers, 2026, PMID 41749833)', note:'The defining genetic event, juxtaposing MYC next to an immunoglobulin enhancer and driving its constitutive overexpression. A real “MYC-negative” phenomenon exists and is disclosed rather than glossed over: WHO-HAEM5’s own diagnostic criteria (per Anagnostopoulos et al., 2026) list strong MYC protein expression "and/or" a demonstrated rearrangement as sufficient — a genetic translocation is not an absolute requirement — because cryptic insertions of MYC into an immunoglobulin locus can occur that conventional cytogenetic tests miss, while the tumor otherwise looks and behaves identically. THIS ENTRY IS SCOPED TO THE SPORADIC CLINICAL SUBTYPE. The endemic (African, EBV-associated, ~95% EBV-positive) and immunodeficiency-associated forms are real, WHO-recognized, genetically distinct subtypes, disclosed throughout this entity’s branch notes rather than given separate entries.' },
];
const REGIONS_BL = [
  { id:'BA', name:'Abdomen & ileocecal region', color:cssVar('--coral'), pos3d:{x:-1.1,y:-0.6,z:0.5},
    branch:{ gene:'ID3 mutation', class:'driver', ccf:'range 34–68% across three independent 2012 genomic-landscape papers depending on cohort and subtype (58% in sporadic BL specifically — Schmitz et al., Nature, 2012; 68% in a German pediatric cohort not stratified by clinical subtype — Richter et al., Nat Genet, 2012, PMID 23143595; 34% — Love et al., Nat Genet, 2012, PMID 23143597) — reported as a real spread, not averaged to one number', note:'ID3 normally restrains TCF3 (E2A); its loss frees TCF3 to sustain B-cell-receptor signaling the tumor depends on — Richter et al. state directly that "cooperation between ID3 inactivation and IG-MYC translocation is a hallmark of Burkitt lymphomagenesis." The real, primary site of sporadic Burkitt lymphoma: abdominal pain from ileocecal disease, distention, and GI bleeding are the classic presentation (StatPearls, "Burkitt Lymphoma," PMID 30844175).' } },
  { id:'BJ', name:'Jaw & facial bones', color:cssVar('--azure'), pos3d:{x:1.2,y:0.9,z:-0.3},
    branch:{ gene:'ID3 mutation', class:'driver', ccf:'same gene and figures as this cancer’s own Abdomen & ileocecal region site', note:'Same gene as this cancer’s own Abdomen & ileocecal region site. The classic, textbook jaw presentation belongs to the ENDEMIC subtype specifically, and even there current literature disclaims it as the dominant modern pattern: the same StatPearls source states plainly that "jaw involvement is seen predominantly in children" within endemic disease, while a 2026 pediatric cohort from an endemic region found abdominal presentation the single most common site (39%, 48/123) even in that population — a real, worth-stating drift from the older teaching point, not a static fact.' } },
  { id:'BM', name:'Bone marrow', color:cssVar('--amber'), pos3d:{x:0.3,y:-1.3,z:0.6},
    branch:{ gene:'CCND3 mutation', class:'driver', ccf:'38% in sporadic Burkitt lymphoma, versus only 1.8% in the endemic subtype (Schmitz et al., Nature, 2012, PMID 22885699) — a real, striking, disclosed subtype divergence, not a rounding difference', note:'Produces a highly stable cyclin D3 protein that drives cell-cycle progression — recurrent mutations cluster around a threonine at position 283, affecting its own phosphorylation-dependent degradation (Schmitz et al. describe the mechanism directly; no source located uses the term "PEST domain" for this specific finding, so that phrase is not used here). Bone marrow involvement in the SPORADIC subtype this entry models has no single clean citable percentage, since only the endemic-subtype figure below was located for this pass; in the endemic subtype specifically, marrow involvement is "present in fewer than 10% of patients at initial diagnosis" (StatPearls, PMID 30844175) — stated with that scope rather than generalized to sporadic disease.' } },
  { id:'BC', name:'Central nervous system', color:cssVar('--violet'), pos3d:{x:-0.4,y:-0.9,z:-0.6},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'34.1% (Schmitz et al., Nature, 2012, Table 1, N=41) — a separate review synthesis rounds this to "50%" (Anagnostopoulos et al., 2026), citing a different source; both figures are reported here rather than merged into one', note:'CNS involvement is real and clinically significant across all three clinical subtypes of this disease, and is specifically named as a feature of the immunodeficiency-associated form (StatPearls, PMID 30844175) — a subtype this entry’s trunk note discloses but does not model in its own branch ledger.' } },
];
const PRIVATE_POOL_BL = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas’s other entries already model.' },
];

const HISTOLOGY_BL = {
  intro: 'Burkitt lymphoma is a monotonous sheet of medium-sized lymphoid cells with round nuclei, multiple small nucleoli, and scant basophilic cytoplasm — smaller and more uniform than the large cells of diffuse large B-cell lymphoma. Its single most recognizable feature at low power is the “starry sky” pattern: numerous pale, benign tingible-body macrophages, each having engulfed apoptotic debris from the tumor’s own near-total (>95%) proliferation rate, scattered evenly through the dark, densely packed tumor cells like stars against a night sky.',
  ariaSummary: 'Stylized microscopic field: a densely packed, monotonous sheet of medium-sized round cells with multiple small nucleoli, interrupted at regular intervals by larger, paler, irregularly shaped macrophages that have engulfed dark apoptotic debris — the starry-sky pattern — with several mitotic figures scattered throughout.',
  citation: 'Anagnostopoulos et al., Cancers, 2026 (PMID 41749833); Schmitz et al., Nature, 2012 (PMID 22885699).',
  features: [
    { key:'monotonous', label:'Monotonous medium cells',
      text:'A uniform sheet of medium-sized cells with round nuclei and several small nucleoli — smaller and more uniform than DLBCL’s own large, variably-shaped cells.' },
    { key:'starrysky', label:'Starry-sky pattern',
      text:'Pale tingible-body macrophages, each having engulfed apoptotic debris, scattered evenly through the dark tumor-cell sheet — the single most recognizable feature of this cancer, a direct visual consequence of its near-total (>95%) proliferation rate.' },
    { key:'mitoses', label:'High mitotic rate',
      text:'Numerous mitotic figures throughout the field, consistent with a Ki-67 proliferation index routinely reported above 95% — among the highest of any human cancer.' },
  ],
};

// ============================================================================================
// TRUNK_CHL / REGIONS_CHL / PRIVATE_POOL_CHL — Classical Hodgkin lymphoma
// A GENUINE, DIRECTLY-STATED PATHWAY-LEVEL TRUNK, not a gene name — the same fact-statement
// shape this atlas's own TRUNK_CLYMPH (Colon organ) already uses, chosen for the identical
// reason: the literature states directly that no such gene exists to name. Weniger & Küppers
// (Leukemia, 2021, PMID 33686198), the field's own cornerstone review: "The analysis of the
// landscape of genetic lesions in HRS cells so far did not reveal any highly recurrent HRS
// cell-specific lesions, but major roles of genetic lesions in members of the NF-κB and JAK/STAT
// pathways and of factors of immune evasion." Reed-Sternberg (HRS) cells themselves are the
// reason: they make up only 0.1–10% of the tumor mass (three independent sources converge on
// this range — Küppers, Hematology Am Soc Hematol Educ Program, 2009, PMID 20008234; de
// Kanter et al., HemaSphere, 2024, PMID 39233904; Juskevicius et al., Lab Invest, 2018, PMID
// 30087457 — a range wider than the ~1–2% sometimes quoted informally elsewhere).
// Origin: HRS cells are germinal-center-B-cell-derived (Kanzler et al., J Exp Med, 1996, PMID
// 8879220; Küppers, Engert & Hansmann, J Clin Invest, 2012, PMID 23023715) — but the disease
// itself does NOT stay confined to the germinal-center zone; it effaces broad nodal architecture
// with its own mixed inflammatory background, and its four real histologic subtypes are defined
// at the WHOLE-NODE level, not the zone level. No ORIGIN_HOTSPOT_ENTRY override is added for this
// reason — the organ default (Follicles) already carries the founding-lineage fact correctly;
// this entity's own trunk note states the disease-architecture distinction directly rather than
// letting the shared anchor imply confined growth it does not have.
const TRUNK_CHL = [
  { gene:'No single dominant founding mutation — pathway-level convergence instead', class:'driver', ccf:'Weniger & Küppers (Leukemia, 2021, PMID 33686198): direct sequencing of Reed-Sternberg cells "did not reveal any highly recurrent HRS cell-specific lesions"', note:'Reed-Sternberg cells make up only 0.1–10% of the tumor mass (Küppers, 2009; de Kanter et al., 2024; Juskevicius et al., 2018) — too rare and too hard to isolate for the kind of single-gene founder this atlas models for most other cancers. The real, well-documented molecular story is pathway-level: constitutive NF-κB activation, shown directly to be required for HRS cell survival by genetic depletion experiments (Bargou et al., J Clin Invest, 1997, PMID 9399941), and near-universal 9p24.1 genetic alteration driving PD-L1/PD-L2 overexpression — 97% of 108 evaluated cases in a dedicated FISH study (Roemer et al., J Clin Oncol, 2016, PMID 27069084). HRS cells are germinal-center-B-cell-derived (Kanzler et al., 1996; Küppers, Engert & Hansmann, 2012) — but the disease itself effaces broad nodal architecture rather than staying confined to that zone, and its four real histologic subtypes (below) are defined at the whole-node level.' },
];
const REGIONS_CHL = [
  { id:'HC', name:'Cervical lymph nodes', color:cssVar('--coral'), pos3d:{x:1.3,y:1.2,z:-0.4},
    branch:{ gene:'9p24.1 alteration (PD-L1/PD-L2)', class:'driver', ccf:'97% of 108 evaluated classical Hodgkin lymphoma cases carried some 9p24.1/PD-L1/PD-L2 alteration — polysomy 5%, copy gain 56%, amplification 36% (Roemer et al., J Clin Oncol, 2016, PMID 27069084)', note:'Cervical involvement, alone (without mediastinal disease), is real and quantified as genuinely subtype-linked — the largest modern cohort (German Hodgkin Study Group trials, N=3,715; Tharmaseelan et al., Cancer, 2026, PMID 42464601) found the mixed-cellularity histologic subtype enriched more than 2-fold in this exact presentation pattern: 52.3% (608/1,162) versus 24.2% in every other pattern combined.' } },
  { id:'HM', name:'Mediastinal lymph nodes', color:cssVar('--azure'), pos3d:{x:-1.4,y:1.0,z:0.3},
    branch:{ gene:'9p24.1 alteration (PD-L1/PD-L2)', class:'driver', ccf:'same finding as this cancer’s own Cervical lymph nodes site', note:'Same molecular finding as this cancer’s own Cervical lymph nodes site — but here the SUBTYPE association runs the opposite direction, real and quantified in the same source: nodular sclerosis, not mixed cellularity, is enriched more than 3-fold when cervical and mediastinal involvement occur together (65.2%, 741/1,136, versus 19.0% in every other pattern; Tharmaseelan et al., 2026), and enriched in isolated mediastinal-only disease too (47.4% versus 32.7%).' } },
  { id:'HR', name:'Retroperitoneal / infradiaphragmatic nodes', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.4,z:0.5},
    branch:{ gene:'TNFAIP3 (A20) inactivation', class:'driver', ccf:'44% (16/36) by direct mutation screening (Schmitz et al., J Exp Med, 2009, PMID 19380639), independently corroborated at 43% by combined deletion analysis (Nomoto et al., BMC Cancer, 2012, PMID 23039325); a further, lower-frequency cohort found 20.4% by FISH deletion alone (Shi et al., 2016, PMID 28088970)', note:'A20 is a direct negative regulator of NF-κB — its loss is a real, gene-level contributor to this cancer’s own pathway-level trunk story. Infradiaphragmatic Hodgkin lymphoma is real and distinct: a dedicated 2,903-patient German Hodgkin Study Group analysis found it presents with the nodular-sclerosis subtype LESS often than supradiaphragmatic disease (Sasse et al., J Clin Oncol, 2018, PMID 29989855) — the inverse of the cervical+mediastinal pattern’s own nodular-sclerosis enrichment above, disclosed as a real, checked, subtype-linked contrast rather than assumed symmetric.' } },
  { id:'HS', name:'Spleen', color:cssVar('--violet'), pos3d:{x:-0.3,y:-1.0,z:-0.6},
    branch:{ gene:'TNFAIP3 (A20) inactivation', class:'driver', ccf:'same finding as this cancer’s own Retroperitoneal / infradiaphragmatic nodes site', note:'Same gene as this cancer’s own Retroperitoneal / infradiaphragmatic nodes site. Splenic involvement is a formally defined criterion within the Ann Arbor staging system this disease is staged by (stage III disease specifically requires nodal involvement on both sides of the diaphragm, with splenic involvement counted alongside it) — a real, structurally load-bearing site for this cancer’s own staging, not merely an anatomically adjacent afterthought. A genuine inverse EBV-status association for TNFAIP3 was found in one dedicated cohort (EBV-negative cases showing HIGHER mutation frequency — Schmitz et al., 2009) but was not reproduced in a separate, smaller cohort (Shi et al., 2016) — stated as a real, unresolved cross-cohort disagreement.' } },
];
const PRIVATE_POOL_CHL = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas’s other entries already model. This cancer’s own genuinely gene-poor genomic landscape (a direct consequence of Reed-Sternberg cell rarity — see this entity’s own trunk note) means no further real, checked private-pool driver candidate was found beyond the two pathway-level genes already modeled at branch level above.' },
];

const HISTOLOGY_CHL = {
  intro: 'Classical Hodgkin lymphoma looks nothing like the other lymphomas on this screen at low power, because the malignant cells themselves — Reed-Sternberg cells and their mononuclear variants, Hodgkin cells — make up only a small minority of what is actually a mixed inflammatory background: small lymphocytes, eosinophils, plasma cells, and histiocytes, in proportions that vary by histologic subtype. A classic Reed-Sternberg cell is large, with two mirror-image nuclei (or one bilobed nucleus), each carrying a single, huge, inclusion-like nucleolus — the “owl-eyed” appearance this cancer is best known for.',
  ariaSummary: 'Stylized microscopic field: a loose, mixed background of small lymphocytes, scattered eosinophils, and plasma cells, with two widely separated, very large binucleate cells — each nucleus carrying one enormous, dark, round nucleolus — rare relative to the abundant background cells surrounding them.',
  citation: 'Küppers, Engert & Hansmann, J Clin Invest, 2012 (PMID 23023715); Weniger & Küppers, Leukemia, 2021 (PMID 33686198).',
  features: [
    { key:'rscells', label:'Reed-Sternberg cells',
      text:'Large, binucleate (or bilobed-nucleus) cells, each nucleus carrying one huge, inclusion-like nucleolus — the “owl-eyed” malignant cell this disease is defined by, making up only 0.1–10% of the tumor mass.' },
    { key:'mixedbackground', label:'Mixed inflammatory background',
      text:'Small lymphocytes, eosinophils, plasma cells, and histiocytes — the reactive majority of the tumor, in proportions that define this cancer’s four real histologic subtypes.' },
    { key:'rarity', label:'Malignant-cell rarity',
      text:'The defining low-power impression: scattered, rare, unmistakably atypical cells embedded in an otherwise ordinary-looking reactive infiltrate — the opposite density of every other lymphoma on this screen.' },
  ],
};

// ============================================================================================
// TRUNK_AITL / REGIONS_AITL / PRIVATE_POOL_AITL — Angioimmunoblastic T-cell lymphoma
// Origin: T-follicular-helper (TFH) cells — confirmed by gene-expression profiling (de Leval et
// al., Blood, 2007, PMID 17284527; independently corroborated by Timmins et al., Br J Haematol,
// 2020, PMID 32064593) — whose normal habitat is the perifollicular/paracortical zone
// (Breitfeld et al., J Exp Med, 2000). ORIGIN_HOTSPOT_ENTRY.aitl overrides to this organ's
// Paracortex hotspot for exactly that reason — a real, spatially locatable cell of origin,
// unlike this organ's own DLBCL/NMZL/PTCL-NOS entries below. But the disease itself effaces the
// node: Federico et al. (2013, PMID 22869878, already cited above for this entity's own
// clinical-presentation figures) state plainly that "typically, the architecture of the lymph
// node is effaced, with only a few benign follicles retained," alongside a diffuse infiltrate and
// arborizing post-capillary vessels — disclosed directly in the Paracortex hotspot text itself,
// the same "cell-of-origin yes, confined growth
// no" distinction this atlas already draws for classical Hodgkin lymphoma above.
const TRUNK_AITL = [
  { gene:'TET2 mutation', class:'driver', ccf:'range 47–76% across two independent cohorts (47%, 40/86, Lemonnier et al., Blood, 2012, PMID 22760778; 76%, 65/85, Odejide et al., Blood, 2014, PMID 24345752) — reported as the real spread, not one picked number', note:'TET2 is truncal for a TEMPORAL reason, not a spatial one — the same justification class this atlas already uses for HCC’s TERT and PDAC’s KRAS (data rule 5). Direct evidence: RHOA G17V (below) was found only in tumor cells, while TET2 mutations were found in BOTH tumor cells and non-tumor hematopoietic cells in the same patients (Sakata-Yanagimoto et al., Nat Genet, 2014, PMID 24413737) — meaning TET2 mutation arises in a shared blood-forming progenitor before the tumor clone itself exists. Independently corroborated: identical TET2 mutations were found shared between the lymphoma and myeloid-lineage blood/marrow cells — evidence of a common clonal-hematopoiesis origin — in 14 of 15 patients showing compartmental mutation sharing, out of a 22-patient cohort (a separate, smaller subset of 4 patients in that same cohort went on to develop a diagnosed myeloid neoplasm — Lewis et al., Blood Adv, 2020, PMID 32442302), and a clonal-hematopoiesis-associated mutation was found shared with the tumor in 70.4% of a dedicated AITL/PTCL cohort (Cheng et al., eLife, 2021, PMID 34581268).' },
];
const REGIONS_AITL = [
  { id:'AS', name:'Skin', color:cssVar('--coral'), pos3d:{x:1.2,y:1.1,z:0.4},
    branch:{ gene:'RHOA G17V mutation', class:'driver', ccf:'68% of AITL samples in the founding discovery paper (Sakata-Yanagimoto et al., Nat Genet, 2014, PMID 24413737)', note:'Found specifically in tumor cells (not the shared hematopoietic background TET2 occupies), and — the same source states directly — "all cases with the mutation encoding p.Gly17Val also had TET2 mutations," i.e. this branch event arises on top of the trunk, never independently of it. Skin involvement (rash) is real and quantified: 21% in the largest dedicated series (Federico et al.; International Peripheral T-Cell Lymphoma Project, J Clin Oncol, 2013, PMID 22869878, N=243), with a wider 20–50% range across older, smaller pooled series (StatPearls, "Peripheral T-Cell Lymphoma," PMID 32965972).' } },
  { id:'AM', name:'Bone marrow', color:cssVar('--azure'), pos3d:{x:-1.3,y:0.8,z:-0.3},
    branch:{ gene:'RHOA G17V mutation', class:'driver', ccf:'same gene and figure as this cancer’s own Skin site', note:'Same gene as this cancer’s own Skin site. Bone marrow involvement, 29% (67/228 evaluable, Federico et al., 2013) — quantified directly from the same large dedicated cohort as the skin figure above, not a separate, less-comparable source.' } },
  { id:'AL', name:'Liver', color:cssVar('--amber'), pos3d:{x:0.5,y:-1.2,z:0.5},
    branch:{ gene:'IDH2 R172 mutation', class:'driver', ccf:'~20% (17/85, Odejide et al., 2014); an independent validation cohort in the founding paper found roughly 45% (Cairns et al., Blood, 2012, PMID 22215888)', note:'A real, AITL-SPECIFIC classifier fact, not just a frequency: Cairns et al. state directly that IDH2 mutations "were identified in approximately 20% of angioimmunoblastic T-cell lymphomas (AITLs), but not in other peripheral T-cell lymphoma entities" — "the second common genetic lesion identified in AITL after TET2." Hepatomegaly (a real proxy for hepatic involvement, not a biopsy-confirmed infiltration rate) is reported at 26% in the same large dedicated cohort as this cancer’s own Skin/Bone marrow figures (Federico et al., 2013) — disclosed as that specific, weaker kind of evidence rather than presented as a confirmed infiltration percentage.' } },
  { id:'AB', name:'Spleen', color:cssVar('--violet'), pos3d:{x:-0.4,y:-0.9,z:-0.6},
    branch:{ gene:'IDH2 R172 mutation', class:'driver', ccf:'same gene and figures as this cancer’s own Liver site', note:'Same gene as this cancer’s own Liver site. Splenomegaly, 35% (Federico et al., 2013) — same organomegaly-proxy caveat as this cancer’s own Liver site.' } },
];
const PRIVATE_POOL_AITL = [
  { gene:'DNMT3A mutation', class:'driver', note:'33% (28/85, Odejide et al., 2014) — "100% of these also harbored TET2 mutations," a real, checked co-occurrence with this cancer’s own trunk gene rather than an independent or competing event, safe for a shared pool that draws into cells regardless of branch.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas’s other entries already model.' },
];

const HISTOLOGY_AITL = {
  intro: 'Angioimmunoblastic T-cell lymphoma effaces the lymph node’s normal architecture with a diffuse, polymorphous infiltrate: small-to-medium T cells with clear or pale cytoplasm — the actual neoplastic population, arising from the T-follicular-helper cells that normally live around this organ’s germinal centers — admixed with reactive eosinophils, plasma cells, and a distinctive B-cell population. Its single most recognizable architectural feature is a proliferation of branching (“arborizing”) high-endothelial venules threading through the infiltrate, a real vascular signature this disease is known for.',
  ariaSummary: 'Stylized microscopic field: a diffuse infiltrate of small-to-medium cells with pale, clear cytoplasm, mixed with scattered eosinophils and plasma cells, threaded throughout by several branching, thick-walled small vessels — the arborizing high-endothelial venules — replacing the node’s normal follicular architecture entirely.',
  citation: 'de Leval et al., Blood, 2007 (PMID 17284527); Federico et al., J Clin Oncol, 2013 (PMID 22869878).',
  features: [
    { key:'clearcells', label:'Clear-cell T-cell population',
      text:'Small-to-medium neoplastic T cells with pale or clear cytoplasm — descendants of the T-follicular-helper cells this disease arises from.' },
    { key:'arborizing', label:'Arborizing vessels',
      text:'A proliferation of branching, high-endothelial venules threading through the infiltrate — the single most recognizable architectural feature of this cancer.' },
    { key:'polymorphous', label:'Polymorphous background',
      text:'Reactive eosinophils and plasma cells admixed with the neoplastic population, part of the diffuse infiltrate that effaces this node’s normal architecture.' },
  ],
};

// ============================================================================================
// TRUNK_NDLBCL / REGIONS_NDLBCL / PRIVATE_POOL_NDLBCL — Diffuse large B-cell lymphoma (nodal)
// NOT THE SAME LEDGER AS THIS ATLAS'S OWN COLON/CLYMPH ENTITY, checked directly rather than
// assumed to transfer: a real, matched head-to-head cohort study (Kou et al., Chin J Exp
// Hematol, 2026, PMID 42544655, 31 primary-GI vs. 81 nodal DLBCL patients, same institution,
// same sequencing panel) found "the mutation rates of GNA13, EZH2, and FBXO11 genes in PGI-DLBCL
// patients were significantly higher than those in nodal DLBCL patients," concluding directly
// that PGI-DLBCL "has a characteristic gene mutation spectrum, which is different from the
// molecular mechanism of nodal DLBCL development." This entity's own trunk/branch genes below are drawn from
// nodal/general (not primary-GI) DLBCL literature for that reason.
// A STATUS-TYPE TRUNK, the same architecture GBM's IDH-wildtype status, Bladder's pathway-
// divergence status, and Follicular Thyroid Carcinoma's RAS-vs-PAX8 status already use —
// chosen because this disease's real, defining split (Sehn & Salles, N Engl J Med, 2021, PMID
// 33657296) is itself a molecular classification, not a single founder gene.
const TRUNK_NDLBCL = [
  { gene:'Germinal-center-B-cell (GCB) vs. activated-B-cell (ABC) cell-of-origin status', class:'driver', ccf:'GCB ≈ 60%, ABC ≈ 25–30%, unclassifiable ≈ 10–15% (Sehn & Salles, N Engl J Med, 2021, PMID 33657296)', note:'STATED PLAINLY: "cell of origin" here is a gene-expression-profiling classification — a transcriptional, molecular term of art — and carries NO spatial claim about where within this organ the disease physically arises. This is not this atlas’s usual site-gene teaching device; it is the real, primary axis this disease is clinically classified by. Confirmed directly against a matched, same-institution cohort study that GI-tract and nodal DLBCL genuinely differ in mutation spectrum (Kou et al., 2026) — the mutation ledger below is drawn from nodal/general-population DLBCL sources, not from this atlas’s own Colon-organ primary-GI-lymphoma entry, which remains scoped to its own dedicated cohort.' },
];
const REGIONS_NDLBCL = [
  { id:'DC', name:'Cervical lymph nodes', color:cssVar('--coral'), pos3d:{x:1.3,y:1.2,z:0.4},
    branch:{ gene:'BCL2 rearrangement', class:'driver', ccf:'occurs "exclusively" within the GCB subtype (Sehn & Salles, 2021), defining the "EZB" genetic subtype together with EZH2 mutation — 69 of 574 DLBCL cases in the founding cohort (Schmitz et al., N Engl J Med, 2018, PMID 29641966)', note:'A REAL, DIRECTLY SOURCED CONNECTION to this atlas’s own Follicular lymphoma entry on this same screen: EZB-subtype DLBCL "can arise by transformation from clinically apparent or, potentially, occult follicular lymphoma, which shares many genetic features with EZB" (Phelan et al., Annu Rev Cancer Biol, 2026, PMID 42487683) — independently confirmed by clonal-evolution sequencing showing CREBBP/KMT2D/EZH2/TNFRSF14/BCL2 already present together in FL’s own precursor lesion (Vogelsberg et al., Haematologica, 2021, PMID 32855278).' } },
  { id:'DX', name:'Axillary lymph nodes', color:cssVar('--azure'), pos3d:{x:-1.4,y:0.9,z:-0.3},
    branch:{ gene:'BCL2 rearrangement', class:'driver', ccf:'same finding as this cancer’s own Cervical lymph nodes site', note:'Same gene as this cancer’s own Cervical lymph nodes site.' } },
  { id:'DM', name:'Mesenteric lymph nodes', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'MYD88 L265P mutation', class:'driver', ccf:'29% of ABC-DLBCL specifically — "rare or absent in other DLBCL subtypes and Burkitt’s lymphoma" (Ngo et al., Nature, 2011, PMID 21179087)', note:'Defines, together with CD79B (below), the "MCD" genetic subtype — 82% of MCD cases carry one or the other, 42% carry both, a real cooperating (not competing) pair (Schmitz et al., N Engl J Med, 2018).' } },
  { id:'DI', name:'Inguinal lymph nodes', color:cssVar('--violet'), pos3d:{x:-0.3,y:-1.0,z:-0.5},
    branch:{ gene:'MYD88 L265P mutation', class:'driver', ccf:'same figure as this cancer’s own Mesenteric lymph nodes site', note:'Same gene as this cancer’s own Mesenteric lymph nodes site.' } },
];
const PRIVATE_POOL_NDLBCL = [
  { gene:'CD79B ITAM mutation', class:'driver', note:'18% of ABC-DLBCL, "detected frequently in ABC DLBCL... but rarely in other DLBCLs and never in Burkitt’s lymphoma" (Davis et al., Nature, 2010, PMID 20054396). Co-occurs with MYD88 in 42% of MCD-subtype cases (Schmitz et al., 2018) — a real, checked cooperating pair, safe for a shared pool.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas’s other entries already model, including this atlas’s own Colon-organ primary colonic lymphoma entity.' },
];

const HISTOLOGY_NDLBCL = {
  intro: 'Diffuse large B-cell lymphoma is a sheet of medium-to-large atypical lymphoid cells with centroblastic or immunoblastic cytology, frequent mitoses, and scattered apoptotic debris — the same real architecture this atlas’s own Colon-organ primary colonic lymphoma entity models, since it is the identical disease, just presenting nodally rather than in the gut. Unlike follicular lymphoma’s organized nodular growth, this is a monotonous, architecture-effacing infiltrate with no discrete follicles remaining.',
  ariaSummary: 'Stylized microscopic field: a dense, monotonous sheet of medium-to-large lymphoid cells with round-to-oval nuclei, several bearing a small but distinct nucleolus, packed closely together without forming follicles or any organized structure. Small dark fragments of apoptotic debris are scattered throughout, and several cells are caught mid-division.',
  citation: 'Sehn & Salles, N Engl J Med, 2021 (PMID 33657296); Schmitz et al., N Engl J Med, 2018 (PMID 29641966).',
  features: [
    { key:'largecells', label:'Medium-to-large lymphoid cells',
      text:'Discrete cells of centroblastic or immunoblastic cytology, larger and more variably shaped than follicular lymphoma’s own centrocyte/centroblast mix, and lacking any follicular organization.' },
    { key:'mitoses', label:'Frequent mitoses',
      text:'A high proliferation rate, consistent with the aggressive clinical course this cancer is known for.' },
    { key:'effaced', label:'Effaced architecture',
      text:'No discrete follicles or zones remain — a monotonous sheet replacing the node’s normal structure entirely, the architectural opposite of this screen’s own follicular lymphoma entry.' },
  ],
};

// ============================================================================================
// TRUNK_NMZL / REGIONS_NMZL / PRIVATE_POOL_NMZL — Nodal marginal zone lymphoma
// Origin: GENUINELY NOT SPATIAL, confirmed directly rather than assumed — Spina et al. (Blood,
// 2016, PMID 27335277), the largest dedicated NMZL genomics cohort, state plainly that this is
// "one of the few disease entities still remaining orphan of specific genetic lesions," and a
// separate systematic review (van den Brand & van Krieken, Haematologica, 2013, PMID 23813646)
// states that "the precise B-cell of origin of NMZL remains poorly defined... not necessarily
// being marginal zone B cells" — AND that "the marginal zone... is usually not recognized
// morphologically in lymph nodes" at all. This entity is named for a structure ordinary lymph
// nodes often lack. Per this atlas's own §9 procedure (do not force a spatial override; state
// the real kind of claim in prose; keep the running registry) — no ORIGIN_HOTSPOT_ENTRY is
// added; this entry's own trunk note carries both disclosures directly.
const TRUNK_NMZL = [
  { gene:'No single dominant founding mutation — genuinely unresolved, not merely unstudied', class:'driver', ccf:'Spina et al. (Blood, 2016, PMID 27335277), the largest dedicated whole-exome/targeted-sequencing study of this disease (N=35): "NMZL still lacks distinct markers and remains orphan of specific cancer gene lesions"', note:'A GENUINE NON-SPATIAL ORIGIN, disclosed directly rather than assigned a location this atlas cannot verify: van den Brand & van Krieken (Haematologica, 2013, PMID 23813646) state that "the precise B-cell of origin of NMZL remains poorly defined... not necessarily being marginal zone B cells," and — the reason this entity is named for a structure it may not even arise from — that "the marginal zone... is usually not recognized morphologically in lymph nodes" at all; only the spleen and some mesenteric lymph nodes show one in normal, non-diseased tissue. This is a real, load-bearing gap in the primary literature, not an artifact of this atlas’s own search.' },
];
const REGIONS_NMZL = [
  { id:'ZM', name:'Bone marrow', color:cssVar('--coral'), pos3d:{x:1.2,y:-1.2,z:0.5},
    branch:{ gene:'KMT2D mutation', class:'driver', ccf:'34% (12/35, Spina et al., 2016) — the single most frequent lesion in the dedicated cohort, and significantly higher than the 7.7% found in splenic marginal zone lymphoma in the same study (P&lt;.001)', note:'A real, checked, NMZL-DISTINGUISHING finding, not a gene shared indistinguishably across every marginal zone lymphoma subtype. Bone marrow involvement itself carries a real, disclosed cross-cohort disagreement: 46% (53/116 evaluable, Stuver et al., Blood Adv, 2023, PMID 37307213, one of the largest modern series) versus 62% in an older, smaller cohort (Traverse-Glehen et al., Histopathology, 2006, PMID 16405665) — reported as a genuine spread across the two most detailed available series, not resolved to one figure.' } },
  { id:'ZP', name:'Peripheral lymph nodes', color:cssVar('--azure'), pos3d:{x:-1.3,y:1.0,z:-0.3},
    branch:{ gene:'PTPRD mutation / deletion', class:'driver', ccf:'20% (7/35; 5 mutations plus 2 deletions, Spina et al., 2016) — "otherwise absent in" splenic marginal zone lymphoma in the same cohort', note:'A second real, NMZL-distinguishing finding from the same dedicated cohort — present here and genuinely absent in the closely related splenic subtype, unlike NOTCH2/KLF2 below, which this same source found genuinely shared between the two. This organ’s own disseminated presentation pattern is real: "the clinical data were characteristic of a disseminated disease at presentation: presence of peripheral and abdominal lymph nodes" together (Traverse-Glehen et al., 2006).' } },
  { id:'ZD', name:'Deep abdominal lymph nodes', color:cssVar('--amber'), pos3d:{x:0.5,y:-0.8,z:0.6},
    branch:{ gene:'PTPRD mutation / deletion', class:'driver', ccf:'same figure as this cancer’s own Peripheral lymph nodes site', note:'Same gene as this cancer’s own Peripheral lymph nodes site — involved simultaneously with peripheral nodal groups in this disease’s own real, disseminated presentation pattern (Traverse-Glehen et al., 2006).' } },
  { id:'ZS', name:'Spleen', color:cssVar('--violet'), pos3d:{x:-0.4,y:0.9,z:-0.6},
    branch:{ gene:'KMT2D mutation', class:'driver', ccf:'same figure as this cancer’s own Bone marrow site', note:'Same gene as this cancer’s own Bone marrow site. Splenic involvement is anatomically and biologically plausible given this disease’s close relationship to splenic marginal zone lymphoma, but no clean, citable NMZL-specific splenic-infiltration percentage was found in this pass’s search — disclosed as real but unquantified rather than assigned an invented figure.' } },
];
const PRIVATE_POOL_NMZL = [
  { gene:'NOTCH2 mutation', class:'driver', note:'20% (7/35, Spina et al., 2016) — real and confirmed in this dedicated nodal cohort, though the same source found it genuinely shared with splenic marginal zone lymphoma rather than nodal-distinguishing, unlike KMT2D and PTPRD above. TNFAIP3 (A20), despite being real and well-documented in marginal zone lymphoma generally, was CHECKED AND EXCLUDED from this entity’s ledger: the best-quantified evidence located ties it to the extranodal/MALT subtype specifically (39–45%, Vela et al., Virchows Arch, 2022, PMID 34494161) and to cross-subtype transformation genetics, not to de novo nodal disease — it does not appear among Spina et al.’s own 41 recurrently-mutated NMZL genes at all.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas’s other entries already model.' },
];

const HISTOLOGY_NMZL = {
  intro: 'Nodal marginal zone lymphoma is composed of small-to-medium B cells, often with abundant pale or faintly basophilic (“monocytoid”) cytoplasm, that expand around and eventually replace a node’s residual reactive follicles — a biphasic pattern in which pale marginal-zone-type cells surround darker, more crowded follicular remnants. Growth is most often diffuse rather than confined to one named zone, consistent with this cancer’s own genuinely uncertain relationship to the marginal zone it is named for (see this entry’s own trunk note).',
  ariaSummary: 'Stylized microscopic field: pale, monocytoid cells with abundant faintly basophilic cytoplasm surrounding several darker, more crowded residual follicular remnants, creating a biphasic pattern, with no single dominant confined zone of growth.',
  citation: 'Spina et al., Blood, 2016 (PMID 27335277); van den Brand & van Krieken, Haematologica, 2013 (PMID 23813646).',
  features: [
    { key:'monocytoid', label:'Monocytoid cells',
      text:'Small-to-medium cells with abundant pale, faintly basophilic cytoplasm — the characteristic cell type this disease is built from, most reminiscent of marginal-zone B cells even though this entry’s own trunk note discloses that its true cell of origin remains genuinely unresolved.' },
    { key:'residualfollicles', label:'Residual follicular remnants',
      text:'Darker, more crowded follicle fragments persisting within the pale marginal-zone-type infiltrate — the biphasic pattern that gives this cancer its most distinctive low-power appearance.' },
    { key:'diffusegrowth', label:'Diffuse growth pattern',
      text:'Most commonly diffuse rather than confined to a single zone — consistent with the genuinely disputed relationship between this cancer and the anatomic marginal zone it is named for.' },
  ],
};

// ============================================================================================
// TRUNK_PTCLN / REGIONS_PTCLN / PRIVATE_POOL_PTCLN — Peripheral T-cell lymphoma, NOS
// A FACT-STATEMENT TRUNK, matching this atlas's own TRUNK_CLYMPH (Colon) and TRUNK_PROSTATE
// (Prostate) precedent exactly — chosen because this disease is, by definition, a diagnosis of
// exclusion with no single reproducible founding lesion reported anywhere in the checked
// literature. Origin: genuinely non-spatial, confirmed directly — Broccoli & Zinzani's own
// dedicated review (Blood, 2017, PMID 28115372) was searched in full for every named nodal
// station and matched none; "nodal involvement is prevalent... although any organ can be
// affected." Per §9's procedure, no ORIGIN_HOTSPOT_ENTRY is added; this entity's own trunk note
// carries the disclosure.
const TRUNK_PTCLN = [
  { gene:'No defining driver mutation — diagnosis of exclusion', class:'driver', ccf:'Iqbal et al. (Blood, 2014, PMID 24632715, N=372): before molecular reclassification, "currently 50% of PTCL cases are not classifiable: PTCL-not otherwise specified"', note:'A genuinely heterogeneous catch-all category, not a single disease with an undiscovered founder — 37% of morphologically diagnosed cases were reclassified into other specific subtypes once molecular signatures were applied, in the same study. Among the remaining, molecularly-confirmed cases, a real minority signature is present (below) but carries prognostic, not mutation-level, significance. Nodal involvement itself has no single named predominant station: a dedicated review (Broccoli & Zinzani, Blood, 2017, PMID 28115372) was checked directly for every major nodal-region term and matched none — "nodal involvement is prevalent at diagnosis, although any organ can be affected."' },
];
const REGIONS_PTCLN = [
  { id:'TM', name:'Bone marrow', color:cssVar('--coral'), pos3d:{x:1.1,y:-1.2,z:0.5},
    branch:{ gene:'GATA3 high expression (molecular subgroup)', class:'driver', ccf:'33% (40/121) of molecularly-confirmed PTCL-NOS in the founding cohort (Iqbal et al., 2014); a later, refined cohort that separately excluded PTCL-TFH cases first found 35% (22/63, Amador et al., Mod Pathol, 2025, PMID 39491745) — a real, methodology-explained convergence, not a coincidence', note:'A gene-expression-profiling-based molecular subgroup, not a mutation — the transcription-factor analog of this cancer’s trunk-level "no defining driver" finding. Associated with significantly poorer overall survival (P=.01, Iqbal et al., 2014) and, in the refined 2025 cohort, with higher LEF1/MYC/CD30 expression. Bone marrow involvement, 22% — the one figure with a clean citable percentage among this cancer’s real extranodal sites (Vose et al., J Clin Oncol, 2008, PMID 18626005, cited directly by Broccoli & Zinzani, 2017).' } },
  { id:'TV', name:'Liver', color:cssVar('--azure'), pos3d:{x:-1.3,y:0.9,z:-0.3},
    branch:{ gene:'TBX21 high expression (molecular subgroup)', class:'driver', ccf:'49% (59/121) in the founding cohort (Iqbal et al., 2014); 65% (41/63) in the refined 2025 cohort that separately excluded PTCL-TFH cases (Amador et al., 2025) — the two studies’ own different exclusion rules explain the different percentages, not a contradiction', note:'The complementary molecular subgroup to this cancer’s own GATA3 subgroup — associated with a cytotoxic gene signature and, within it, its own poor-outcome subset (P=.05, Iqbal et al., 2014). Liver involvement is named as real (“can be affected”) across the checked literature but no clean, citable percentage was found — disclosed as real but unquantified.' } },
  { id:'TS', name:'Spleen', color:cssVar('--amber'), pos3d:{x:0.4,y:-0.9,z:0.6},
    branch:{ gene:'GATA3 high expression (molecular subgroup)', class:'driver', ccf:'same figures as this cancer’s own Bone marrow site', note:'Same molecular subgroup as this cancer’s own Bone marrow site. Splenic involvement is named as real across the checked literature; no clean, citable percentage specific to this entity was found — disclosed as real but unquantified rather than assigned an invented figure.' } },
  { id:'TK', name:'Skin', color:cssVar('--violet'), pos3d:{x:-0.3,y:0.8,z:-0.5},
    branch:{ gene:'TBX21 high expression (molecular subgroup)', class:'driver', ccf:'same figures as this cancer’s own Liver site', note:'Same molecular subgroup as this cancer’s own Liver site. Skin involvement is named as real across the checked literature, alongside liver and spleen, without a clean citable percentage — disclosed as real but unquantified.' } },
];
const PRIVATE_POOL_PTCLN = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas’s other entries already model. This cancer’s own genuinely heterogeneous, driver-poor definition — a diagnosis of exclusion by design — means no further real, checked private-pool driver candidate was found beyond the two molecular subgroups already modeled at branch level above.' },
];

const HISTOLOGY_PTCLN = {
  intro: 'Peripheral T-cell lymphoma, NOS is defined by exclusion — it is diagnosed only once every other, more specific T-cell lymphoma has been ruled out — and its histology reflects that: a pleomorphic infiltrate of small, medium, and large atypical T cells effacing the node’s normal architecture, with no single defining cytologic feature the way this screen’s other lymphomas have. Reactive eosinophils, plasma cells, and high endothelial venules are frequently admixed, though without AITL’s own distinctive arborizing vascular proliferation.',
  ariaSummary: 'Stylized microscopic field: a pleomorphic, architecture-effacing infiltrate of small, medium, and large atypical lymphoid cells of varying size and nuclear shape, with scattered reactive eosinophils and plasma cells, lacking any single dominant cell type or organized structure.',
  citation: 'Broccoli & Zinzani, Blood, 2017 (PMID 28115372); Iqbal et al., Blood, 2014 (PMID 24632715).',
  features: [
    { key:'pleomorphic', label:'Pleomorphic cell population',
      text:'Small, medium, and large atypical T cells of varying nuclear size and shape — the defining low-power impression of a diagnosis reached by excluding every more specific entity, not by matching one.' },
    { key:'effaced', label:'Effaced nodal architecture',
      text:'No discrete zones or follicles remain — a diffuse, disorganized infiltrate replacing the node’s normal structure.' },
    { key:'reactive', label:'Reactive admixture',
      text:'Scattered eosinophils and plasma cells admixed with the neoplastic population, without the distinctive arborizing vessels this screen’s AITL entry shows.' },
  ],
};

export const cancerDetails = {
  fl: {
    title:'Follicular Lymphoma', screenLabel:'Follicular lymphoma — tumor explorer',
    legendTitle:'Sites (nodal-station involvement pattern)',
    regions:REGIONS_FL, trunk:TRUNK_FL, privatePool:PRIVATE_POOL_FL,
    histology: HISTOLOGY_FL,
  },
  mcl: {
    title:'Mantle Cell Lymphoma', screenLabel:'Mantle cell lymphoma (classical, nodal) — tumor explorer',
    legendTitle:'Sites (extranodal/systemic involvement — this disease is disseminated at diagnosis in most cases, not station-predominant)',
    regions:REGIONS_MCL, trunk:TRUNK_MCL, privatePool:PRIVATE_POOL_MCL,
    histology: HISTOLOGY_MCL,
  },
  bl: {
    title:'Burkitt Lymphoma', screenLabel:'Burkitt lymphoma (sporadic) — tumor explorer',
    legendTitle:'Sites (extranodal/organ involvement — origin is nodal, presentation is not; see this cancer’s own trunk note)',
    regions:REGIONS_BL, trunk:TRUNK_BL, privatePool:PRIVATE_POOL_BL,
    histology: HISTOLOGY_BL,
  },
  chl: {
    title:'Classical Hodgkin Lymphoma', screenLabel:'Classical Hodgkin lymphoma — tumor explorer',
    legendTitle:'Sites (nodal-station involvement pattern, quantified and subtype-linked)',
    regions:REGIONS_CHL, trunk:TRUNK_CHL, privatePool:PRIVATE_POOL_CHL,
    histology: HISTOLOGY_CHL,
  },
  aitl: {
    title:'Angioimmunoblastic T-Cell Lymphoma', screenLabel:'Angioimmunoblastic T-cell lymphoma — tumor explorer',
    legendTitle:'Sites (extranodal/systemic involvement — generalized lymphadenopathy at presentation, not station-predominant)',
    regions:REGIONS_AITL, trunk:TRUNK_AITL, privatePool:PRIVATE_POOL_AITL,
    histology: HISTOLOGY_AITL,
  },
  ndlbcl: {
    title:'Diffuse Large B-Cell Lymphoma', screenLabel:'Diffuse large B-cell lymphoma (nodal) — tumor explorer',
    legendTitle:'Sites (nodal-station involvement pattern)',
    regions:REGIONS_NDLBCL, trunk:TRUNK_NDLBCL, privatePool:PRIVATE_POOL_NDLBCL,
    histology: HISTOLOGY_NDLBCL,
  },
  nmzl: {
    title:'Nodal Marginal Zone Lymphoma', screenLabel:'Nodal marginal zone lymphoma — tumor explorer',
    legendTitle:'Sites (extranodal/systemic involvement — disseminated at diagnosis, not station-predominant)',
    regions:REGIONS_NMZL, trunk:TRUNK_NMZL, privatePool:PRIVATE_POOL_NMZL,
    histology: HISTOLOGY_NMZL,
  },
  ptcln: {
    title:'Peripheral T-Cell Lymphoma, NOS', screenLabel:'Peripheral T-cell lymphoma, NOS — tumor explorer',
    legendTitle:'Sites (extranodal/systemic involvement — generalized at presentation, not station-predominant)',
    regions:REGIONS_PTCLN, trunk:TRUNK_PTCLN, privatePool:PRIVATE_POOL_PTCLN,
    histology: HISTOLOGY_PTCLN,
  },
};
