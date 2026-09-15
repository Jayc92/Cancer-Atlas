import * as THREE from 'three';
import { cssVar, applyTissueMottleVertexColors, layerSlab } from '../viewer.js';

// PROCEDURAL cross-section block — the Skin precedent (js/organs/skin.js), reused rather than
// re-derived: marrow, like skin, is a tissue defined by its LAYERED STRUCTURE rather than a
// discrete organ shape, so a schematic "biopsy core" cross-section teaches more than any whole-
// organ silhouette could. Real anatomic basis for the stack, most specific to the posterior
// iliac crest site this organ's own body marker already cites (see markerSpec above): a bone-
// marrow core biopsy is taken by drilling through the outer COMPACT (cortical) bone shell into
// the CANCELLOUS (trabecular) bone lattice beneath it, where the marrow itself fills the spaces
// between bone spicules. Modeled one-directional (compact bone at the top, marrow open at the
// bottom) rather than as a symmetric sandwich through the whole flat bone, matching the real
// biopsy procedure's own geometry and Skin's own one-sided precedent — NOT a claim that the
// ilium has bone on one side only. Layer colors/thicknesses/citations are pending the dedicated
// gross-anatomy research pass this Marrow build commissioned; placeholders below are flagged
// and must be replaced with verified sources before this organ ships, per this project's own
// zero-tolerance discipline for exactly that gap (see the markerSpec citation-fix above).
const SX = 0.026, SZ = 0.018; // block footprint, design units — schematic, not a real measurement
const Y_TOP = 0.008, Y_BOT = -0.008; // 1.6cm total section height, same illustrative scale as Skin
const CORTEX_BASE = 0.0040;   // compact-bone / trabecular-zone boundary, mean height
const TRAB_BASE = 0.0010;     // trabecular-zone / red-marrow boundary, mean height
const YELLOW_BASE = -0.0038;  // red-marrow / yellow-marrow boundary, mean height — PLACEHOLDER
                               // proportion pending the cellularity-research pass; keep the
                               // red zone clearly dominant (axial-skeleton site, per the verified
                               // markerSpec citation) until a real figure justifies otherwise.

// Interface height functions — same discipline as Skin's surfY/dejY/dhY: deterministic, shared
// by the mesh builder AND the hotspot anchors below, so anchors always sit exactly on the
// generated surfaces rather than being independently guessed.
function cortexTopY(x, z){
  return Y_TOP + 0.0004*Math.cos(x/SX*Math.PI*1.1)*Math.cos(z/SZ*Math.PI*1.1);
}
function cortexBaseY(x, z){
  // the cortical/trabecular boundary is real bone, not a smooth membrane — rougher, more
  // irregular undulation than the skin's dermal-epidermal junction
  return CORTEX_BASE + 0.0006*Math.sin(x*1300 + 0.4)*Math.cos(z*1600 + 1.1)
       + 0.00025*Math.sin(x*2400);
}
function trabBaseY(x, z){
  // trabecular lattice thins irregularly into open marrow — the least smooth boundary in the
  // block, since real trabecular bone is a sparse, irregular meshwork rather than a sheet
  return TRAB_BASE + 0.0008*Math.sin(x*1100 + 1.7)*Math.cos(z*900 + 0.6)
       + 0.0004*Math.cos(x*2000 + 2.2)*Math.sin(z*1500);
}
function yellowBaseY(x, z){
  // red/yellow marrow boundary is not a real anatomic membrane either — fat and hematopoietic
  // tissue interdigitate; drawn softer than the bone boundaries above for that reason
  return YELLOW_BASE + 0.0005*Math.sin(x*700 + 0.9)*Math.cos(z*650 + 1.4);
}

// active:true. Alias collision check (grep across every organ's own aliases before use, same
// standing rule as every prior organ): no other organ claims "marrow", "bone marrow", or
// "hematopoietic" as a bare word. This organ covers systemic hematologic malignancy — the
// second and final piece of the blood-cancer navigation answer the Lymph Nodes organ began
// (§9's registry, extended rather than re-plumbed — see the ORIGIN_HOTSPOT_ENTRY comment block
// in js/morphology.js for the running table).
export const organEntry = { key:'marrow', label:'Marrow', system:'Hematologic', active:true, sexes:['female','male'], aliases:['bone marrow','hematopoietic','leukemia','leukaemia'] };

// Body marker: posterior iliac crest — the real, standard clinical site for bone-marrow
// aspiration/biopsy (Rindy & Chambers, StatPearls, "Bone Marrow Aspiration and Biopsy," NCBI
// Bookshelf NBK559232, updated 2023-05-29 — "The posterior superior iliac crest is the
// typically selected sampling site due to patient comfort and safety reasons" — verified
// directly at the source; an earlier draft of this comment cited a wrong NBK number for this
// same real chapter, caught before authoring proceeded further). The same source states why
// this site is reliable rather than arbitrary: "this function of bone marrow becomes restricted
// to the axial skeleton by adolescence" — the posterior iliac crest is axial skeleton, unlike
// the long bones whose own marrow is predominantly fatty (yellow) in adults. Marrow, like Lymph
// Nodes, has no single representative body location in reality (it's distributed through the
// axial and proximal appendicular skeleton), so this anchor follows the same "pick the real,
// most clinically legible landmark" logic every distributed-tissue organ in this app uses
// (matching Lymph Nodes' own cervical-station choice) rather than implying marrow exists only
// at the hip. heightFrac/angle are a placeholder pending the same live height/angle-grid probe
// every prior organ's marker was tuned against — NOT yet verified against the real body mesh.
export const markerSpec = { points:[{heightFrac:0.52, angle:165}] };

export const cancerEntries = [
  { id:'aml',    name:'Acute myeloid leukemia', share:'~4.3 per 100,000 per year, over 20,000 new cases annually in the United States (Vakiti, Reynolds & Mewawalla, StatPearls, "Acute Myeloid Leukemia," NCBI Bookshelf NBK507875, updated 2024-04-27) — this entry models AML as WHO-HAEM5 now defines the general category, "AML, defined by differentiation" (Khoury et al., Leukemia, 2022, PMID 35732831), which superseded the older "AML, NOS" label; acute promyelocytic leukemia, a distinct WHO-defined genetic entity, is modeled separately below, and acute megakaryoblastic leukemia — real, but not clearing this atlas\'s own entry-vs-prose bar for a distinctive renderable morphologic phenotype — is disclosed in this entry\'s own trunk note rather than given a separate entry', active:true, organKey:'marrow' },
  { id:'apl',    name:'Acute promyelocytic leukemia', share:'~7–8% of adult AML cases (Cingam & Koshy, StatPearls, "Acute Promyelocytic Leukemia," NCBI Bookshelf NBK459352, PMID 29083825)', active:true, organKey:'marrow' },
  { id:'cml',    name:'Chronic myeloid leukemia', share:'~2 per 100,000 per year, ~15% of adult leukemias (Jabbour & Kantarjian, Am J Hematol, 2024, PMID 39093014)', active:true, organKey:'marrow' },
  { id:'mds',    name:'Myelodysplastic neoplasm (MDS)', share:'~3.3–4.9 per 100,000 per year depending on the population studied (Rollison et al., Blood, 2008, PMID 18443215; Dotson & Lebowicz, StatPearls, "Myelodysplastic Syndrome," NCBI Bookshelf NBK534126) — WHO-HAEM5 renamed this category from "syndrome" to "neoplasm" in 2022, still abbreviated MDS', active:true, organKey:'marrow' },
  { id:'all',    name:'Acute lymphoblastic leukemia', share:'"the most common childhood cancer" (Iacobucci & Mullighan, J Clin Oncol, 2017, PMID 28297628, verbatim) — a separate figure, "an incidence of over 6500 cases per year in the United States alone" (Terwilliger & Abdul-Hay, Blood Cancer J, 2017, PMID 28665419, verbatim), attributed to its own source rather than merged into one sentence, since neither paper states both clauses together', active:true, organKey:'marrow' },
  { id:'et',     name:'Essential thrombocythemia', share:'~1–2.5 per 100,000 per year (Thapa, Fazal, Parsi & Rogers, StatPearls, "Myeloproliferative Neoplasms," NCBI Bookshelf NBK531464, updated 2023-08-08)', active:true, organKey:'marrow' },
  { id:'pv',     name:'Polycythemia vera', share:'~0.4–2.8 per 100,000 per year (StatPearls, NBK531464)', active:true, organKey:'marrow' },
  { id:'pmf',    name:'Primary myelofibrosis', share:'~0.8–2.1 per 100,000 per year (StatPearls, NBK531464)', active:true, organKey:'marrow' },
  { id:'mm',     name:'Multiple myeloma', share:'~1% of all cancers, ~10% of hematologic malignancies, ~4 per 100,000 per year (Rajkumar, Am J Hematol, 2022, PMID 35560063)', active:true, organKey:'marrow' },
  { id:'cll',    name:'Chronic lymphocytic leukemia / small lymphocytic lymphoma', share:'~4.6 per 100,000 per year — the most common leukemia subtype in SEER-covered populations (Hallek, Am J Hematol, 2025, PMID 39871707); this entry models the dominant, blood/marrow-presenting form (CLL), which accounts for roughly 90% of cases — the nodal-presenting form (SLL, ~10%) is the same disease and is disclosed in this entry\'s own trunk note rather than duplicated on the Lymph Nodes organ (Puckrin, Owen & Peters, Eur J Haematol, 2025, PMID 39726364)', active:true, organKey:'marrow' },
];

// buildMarrowMesh() — four stacked layerSlab calls (compact bone / trabecular bone / red marrow
// / yellow marrow) plus a scattered field of trabecular-bone SPICULES (thin tapered struts
// projecting from the cortical/trabecular boundary down into the marrow zone) — the skin
// follicle precedent applied here: a legibility feature that reads as "porous bone with marrow
// inside" at a glance, not a claim of full trabecular-lattice topology.
// LAYER COLORS, each disclosed at the tier the source actually supports (Skin's own tiered-
// citation precedent): no source fetched in this project's own dedicated gross-anatomy research
// pass states a gross COLOR for any of these four tissues in words — the same honest gap this
// project's own Stomach entry already discloses for gastric serosa (CLAUDE.md data rule 19).
// What the pass DID verify is real tissue COMPOSITION, and these colors are an inference from it,
// disclosed as such rather than presented as a directly-quoted color description: adult red
// marrow is "40% water, 40% fat and 20% protein" while yellow marrow is "80% fat, 15% water and
// 5% protein" (Radiopaedia.org, "Bone Marrow," a peer-reviewed radiology reference, citing
// standard hematopathology texts) — the real basis for drawing red marrow as a deep, saturated
// red and yellow marrow as a pale, fat-dominant yellow. Compact and trabecular bone use the
// standard, unsourced-in-words but essentially uncontested pale ivory/tan mineralized-bone tone
// every other organ's own bone-adjacent surfaces in this app already use.
export function buildMarrowMesh(){
  const group = new THREE.Group();
  group.add(layerSlab(cortexTopY, cortexBaseY, 0xe6ded0, 0.55, SX, SZ));   // compact bone
  group.add(layerSlab(cortexBaseY, trabBaseY,  0xd7cdb0, 0.68, SX, SZ));   // trabecular bone
  group.add(layerSlab(trabBaseY, yellowBaseY,  0x8c2d2d, 0.52, SX, SZ));   // red marrow
  group.add(layerSlab(yellowBaseY, ()=>Y_BOT,  0xe6c65c, 0.50, SX, SZ));   // yellow marrow

  // Trabecular spicules: thin tapered struts from the cortex/trabecular boundary down into the
  // marrow zone, scattered across the footprint — same bone-tint material as the trabecular
  // layer above, since a spicule is a fragment of that same bone.
  const spiculeMat = new THREE.MeshPhysicalMaterial({ color:0xd7cdb0, roughness:0.68, metalness:0.0, specularIntensity:0.15 });
  const spots = [ [-0.008,0.005], [0.006,-0.004], [-0.002,0.006], [0.009,0.003], [-0.009,-0.005], [0.001,-0.006], [0.004,0.006], [-0.006,0.001] ];
  spots.forEach(([sx,sz], i)=>{
    const yTop = cortexBaseY(sx, sz);
    const depth = 0.0028 + (i % 3) * 0.0009; // varied lengths so the field doesn't look uniform
    const yBot = yTop - depth;
    const spic = new THREE.Mesh(new THREE.CylinderGeometry(0.00012, 0.00035, depth, 6), spiculeMat);
    spic.position.set(sx, (yTop+yBot)/2, sz);
    group.add(spic);
  });
  return group;
}

export const organDetail = {
  eyebrow:'Hematologic System', title:'Marrow',
  sub:'The body\'s blood factory · compact bone, trabecular bone, red & yellow marrow · site of every white cell, red cell & platelet',
  facts:[
    {label:'Structure', val:'A dense compact (cortical) bone shell surrounds a cancellous (trabecular) bone lattice, whose spaces "provide balance to the dense and heavy compact bone" and are filled by marrow itself (OpenStax Anatomy &amp; Physiology 2e, "Bone Structure")'},
    {label:'Red vs. yellow marrow', val:'Red marrow is hematopoietically active (~40% fat by composition); yellow marrow is fat-dominant (~80% fat) and largely inactive (Radiopaedia.org, "Bone Marrow"). Hematopoiesis "becomes restricted to the axial skeleton by adolescence" (Rindy &amp; Chambers, StatPearls, NCBI Bookshelf NBK559232) — red marrow "retreats" from the limbs inward, essentially confined to the axial skeleton by around age 25 (Radiopaedia.org)'},
    {label:'Niches', val:'Hematopoietic stem cells live in specific marrow microenvironments — most current evidence frames the niche as fundamentally perivascular, alongside bone-adjacent (endosteal) regions whose own independent role remains an active research question (Morrison &amp; Scadden, Nature, 2014, PMID 24429631)'},
    {label:'Function', val:'The origin of every myeloid, lymphoid, erythroid and megakaryocytic blood cell — this organ is where each of this screen\'s cancers begins, at a different point along that same branching developmental tree'},
  ],
  desc:'Marrow is the soft tissue filling the spaces of bone — not one shape in one place, but a distributed tissue running through the axial skeleton and the proximal ends of the limb bones, which is why its own body-screen marker sits at the posterior iliac crest, the real clinical site clinicians sample it from, rather than implying it is confined to the hip. A core biopsy through that site samples exactly what this cross-section shows: a dense outer shell of compact bone, then a lattice of trabecular (cancellous) bone spicules, and finally the marrow itself — red marrow, hematopoietically active tissue, and yellow marrow, fat-dominant and largely inactive. Every blood cancer on this screen begins somewhere along the same branching developmental tree marrow builds from a shared stem-cell pool: myeloid malignancies (acute and chronic myeloid leukemia, myelodysplastic neoplasm, the three classic myeloproliferative neoplasms) arise at different points along the myeloid lineage; acute lymphoblastic leukemia and chronic lymphocytic leukemia arise along the lymphoid lineage; multiple myeloma arises at that lineage\'s own terminal, antibody-secreting endpoint. Where a specific malignancy sits on that tree is a real, developmental fact about lineage and differentiation stage — not a spatial one — and each entry states its own version of that fact directly rather than forcing it onto this model\'s geometry. Layer colors here are the one place this model is disclosed as an inference rather than a directly-sourced description: no source found in this project\'s own research states a gross color for compact bone, trabecular bone, red marrow or yellow marrow in words, so the red/yellow marrow colors follow real, cited tissue composition (roughly 40% fat for red marrow, 80% fat for yellow) rather than an observed color statement.',
  buildMesh: buildMarrowMesh,
  viewer:{ theta:0.5, phi:1.15, radius:0.5, minRadius:0.12, maxRadius:1.2, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional schematic cross-section block of bone marrow, cut like a core biopsy specimen: a thin pale ivory shell of compact bone on top, a porous tan band of trabecular bone beneath it with thin bone spicules projecting downward, a thick deep-red zone of red marrow below that, and a pale yellow band of yellow marrow at the bottom, with four glowing teal points marking the structures listed after it. Drag to rotate, scroll to zoom.',
  // pos anchors computed from the same boundary functions the mesh is built from, same
  // discipline as Skin/Colon/Pancreas. Perivascular/sinusoidal niche carries this organ's
  // ORIGIN_HOTSPOT default (js/morphology.js) — hematopoietic stem cells reside there and give
  // rise to every blood lineage, the real developmental fact every entry's own trunk note states
  // its own more specific version of, per this file's own §9-driven design (phaseC_design.md §9).
  hotspots:[
    { key:'trabecular', label:'Trabecular bone', pos:[-0.008, cortexBaseY(-0.008,0.005)-0.0006, 0.005],
      text:'A lattice-like network of bone spicules — "matrix spikes called trabeculae" (OpenStax Anatomy & Physiology 2e, "Bone Structure") — whose open spaces are filled by marrow itself. This porous structure is what makes the marrow cavity a real, three-dimensional space rather than a solid mass, and it is where the endosteal niche (below) is anchored.' },
    { key:'endosteal', label:'Endosteal niche', pos:[0.006, trabBaseY(0.006,-0.004)+0.0005, -0.004],
      text:'The bone-adjacent microenvironment lining the surface of trabecular bone, historically described as a distinct hematopoietic-stem-cell niche. Current understanding treats this region\'s own independent role as a genuinely open question rather than a settled, spatially separate compartment — "the niche is perivascular... often, but not always, located near trabecular bone. Outstanding questions concern... the role of the endosteum" (Morrison & Scadden, Nature, 2014, PMID 24429631). In chronic myeloid leukemia specifically, this region is a real site of disease-driven remodeling, disclosed in that entry\'s own trunk note rather than asserted here as a settled location for leukemic stem cells.' },
    { key:'sinusoid', label:'Perivascular / sinusoidal niche', pos:[-0.002, (trabBaseY(-0.002,0.006)+yellowBaseY(-0.002,0.006))/2, 0.006],
      text:'The microenvironment surrounding marrow blood vessels and sinusoids — by current evidence, the dominant framing of where hematopoietic stem and progenitor cells actually reside: "the niche is perivascular, created partly by mesenchymal stromal cells and endothelial cells" (Morrison & Scadden, Nature, 2014, PMID 24429631). This is where every myeloid, lymphoid, erythroid and megakaryocytic blood cell traces its origin to a shared stem-cell pool — a real, developmental fact, not a spatial claim about any one cancer on this screen; each entry\'s own trunk note states its own more specific developmental position along that same branching tree.' },
    { key:'megakaryocyte', label:'Megakaryocytes', pos:[0.009, (trabBaseY(0.009,0.003)+yellowBaseY(0.009,0.003))/2, 0.003],
      text:'Large marrow cells that manufacture platelets by an unusual, specific mechanism: "they extend long branching processes, designated proplatelets, into sinusoidal blood vessels where they undergo fission to release platelets" directly into the bloodstream (Machlus & Italiano, J Cell Biol, 2013, PMID 23751492). Essential thrombocythemia and primary myelofibrosis both arise from this same lineage, each with its own real, distinctive megakaryocyte abnormality disclosed in its own histology.' },
  ],
};

// ============================================================================================
// TRUNK_AML / REGIONS_AML / PRIVATE_POOL_AML / HISTOLOGY_AML — Acute myeloid leukemia
// WHO-HAEM5 (Khoury et al., Leukemia, 2022, PMID 35732831) eliminated the term "AML, NOS",
// replacing it with "AML, defined by differentiation" — the residual, morphology-based bucket
// used only when none of the genetically-defining lesions below is present. This entry models
// that broad general category. TWO founder-class trunk entries, not one — verified directly as
// a real, mutually-exclusive split, not assumed: Papaemmanuil et al. (N Engl J Med, 2016, PMID
// 27276561, N=1540) states the TP53/aneuploidy class and every other class-defining lesion "are
// mutually exclusive," while the NPM1 class cooperates with FLT3-ITD/DNMT3A. Same two-founder-
// class shape this atlas already uses for GBM's IDH-wildtype status and OCCC's TP53 status, not
// a single-gene trunk.
const TRUNK_AML = [
  { gene:'NPM1 mutation', class:'driver', ccf:'27% as the primary classifying lesion of 1540 patients (Papaemmanuil et al., N Engl J Med, 2016, PMID 27276561); 27% (54/200) independently in TCGA (Ley et al., N Engl J Med, 2013, PMID 23634996)', note:'The single largest recurrent founder lesion in this category, and a COOPERATING one: within the NPM1-defined class, Papaemmanuil et al. report co-occurring DNMT3A in 54% and FLT3-ITD in 39% — not competing partners but real, quantified cooperation. Ley et al. independently confirm the NPM1+DNMT3A pairing occurs far more often than chance (P<6.3×10⁻⁷) and call the resulting triple-mutant pattern "a novel subtype of AML." Modeled at branch level below as two 2-site pairs rather than folded into this trunk note, since FLT3-ITD/DNMT3A each carry their own real site-relevant biology. THIS ENTRY ALSO DISCLOSES a related but structurally distinct case rather than giving it a separate entry: acute megakaryoblastic leukemia (AMKL), a real, WHO-recognized differentiation subtype (part of "AML, defined by differentiation" when RBM15::MRTFA-negative) that does not clear this atlas\'s own entry-vs-prose bar for a distinctive renderable morphologic phenotype. Non-Down-syndrome AMKL is 5.5% of pediatric AML in a large central-pathology-reviewed cohort (Chisholm et al., Pediatr Blood Cancer, 2023, PMID 36789545); within it, the RBM15::MRTFA fusion (t(1;22)) accounts for 10–20% across two independent cohorts (Hama et al., Pediatr Blood Cancer, 2026, PMID 42183585; Chisholm et al., 2023) and carries a strong infant predominance (median age 4 months) with a real, worse-than-previously-reported prognosis (5-year overall survival 52% overall, falling to 25% in infants under 6 months with severe hepatosplenomegaly — Hama et al., 2026, which states directly that earlier reports "may have overestimated the prognosis of AMKL with t(1;22)"). A second, molecularly distinct route to AMKL exists in Down syndrome specifically, driven by acquired GATA1 mutations rather than the RBM15::MRTFA fusion — the two are real, non-overlapping molecular routes to the same morphologic entity (Wechsler et al., Nat Genet, 2002, PMID 12172547).' },
  { gene:'TP53 mutation / complex karyotype', class:'driver', ccf:'13% as the primary classifying lesion of 1540 patients, or 8% (16/200) by raw mutation count independently in TCGA (Papaemmanuil et al., 2016; Ley et al., 2013) — the gap between the two figures is a real counting-rule difference (genomic-class assignment vs. raw mutation carriage), stated rather than merged into one number', note:'A second, biologically distinct, COMPETING founder class — mutually exclusive with NPM1 and with every other class-defining lesion (Papaemmanuil et al., 2016, verbatim: these lesions "are closely correlated with one another... but both are mutually exclusive with other class-defining lesions"). The exclusivity is essentially obligate with complex karyotype specifically: a dedicated AML/MDS cohort found 84% of TP53-mutant cases have complex karyotype, rising to 97% for biallelic TP53 mutation, with the authors proposing "mutant TP53 at diagnosis defines a separate CK [complex karyotype] entity" (Grob et al., Blood, 2022, PMID 35108372). Note this category is NOT the same as a WHO-defining AML entity in the 2022 WHO classification specifically — WHO-HAEM5 instead assigns biallelic TP53 inactivation with <20% blasts to a distinct MDS category ("MDS-biTP53"); the competing International Consensus Classification (Arber et al., Blood, 2022, PMID 35767897) does carry a standalone "AML with mutated TP53" category. This WHO-vs-ICC divergence is real and disclosed here rather than smoothed into one classification\'s language.' },
];
const REGIONS_AML = [
  { id:'AS', name:'Skin', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'RUNX1-RUNX1T1 fusion (t(8;21))', class:'driver', ccf:'4% as the primary classifying lesion (Papaemmanuil et al., 2016); myeloid sarcoma (a solid, extramedullary mass of myeloid blasts, also called granulocytic sarcoma or chloroma) occurs in 9–35% of this specific genetic subtype across studies (Avni & Koren-Michowitz, Ther Adv Hematol, 2011, PMID 23556098)', note:'A real, WHO-defining AML fusion with a distinctive, disclosed extramedullary association: myeloid sarcoma is reported in 2–8% of AML overall, with skin, bone and lymph nodes the most common adult sites (Avni & Koren-Michowitz, 2011) — leukemia cutis specifically was documented at 14.8% clinically / 9.2% histologically in a pediatric AML cohort (Godínez-Chaparro et al., Bol Med Hosp Infant Mex, 2021, PMID 34571521); that figure is pediatric-scoped and disclosed as such rather than generalized to adults.' } },
  { id:'AL', name:'Lymph nodes', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'RUNX1-RUNX1T1 fusion (t(8;21))', class:'driver', ccf:'same gene and figures as this cancer’s own Skin site', note:'Same gene as this cancer’s own Skin site. Lymph nodes are named directly, alongside skin and bone, among the most common adult myeloid-sarcoma sites (Avni & Koren-Michowitz, 2011) — real, but with no site-specific percentage breakdown found in this pass, disclosed as real-but-unquantified rather than assigned an invented figure.' } },
  { id:'AB', name:'Bone (myeloid sarcoma mass)', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'NPM1 mutation', class:'driver', ccf:'NPM1 mutations were found in 15% of a 181-patient myeloid-sarcoma cohort (Avni & Koren-Michowitz, 2011, citing the underlying myeloid-sarcoma literature), often with monocytic differentiation', note:'A discrete bony or soft-tissue myeloid-sarcoma mass — distinct from the diffuse marrow infiltration this whole organ otherwise represents — is a real, if uncommon, presentation of this cancer (2–8% overall). NPM1-mutated cases make up a real minority of documented myeloid-sarcoma cases, disclosed at the 15% figure above rather than the trunk-level 27% (that figure describes NPM1\'s share of AML overall, not of myeloid sarcoma specifically — two different denominators, kept separate).' } },
  { id:'AC', name:'Central nervous system', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'NPM1 mutation', class:'driver', ccf:'same gene as this cancer’s own Bone site; no site-specific percentage located for this pass', note:'Same gene as this cancer’s own Bone site. CNS involvement is a real, clinically recognized, adverse-prognosis extramedullary site in AML (StatPearls, "Acute Myeloid Leukemia," NCBI Bookshelf NBK507875), disclosed here as real but unquantified — no clean, citable population-level percentage for CNS involvement in general AML at diagnosis was found in this pass, and none is invented to fill the gap.' } },
];
const PRIVATE_POOL_AML = [
  { gene:'TET2 mutation', class:'driver', ccf:'8% (17/200), TCGA (Ley et al., N Engl J Med, 2013, PMID 23634996)', note:'A broadly distributed, clonal-hematopoiesis-associated epigenetic-modifier mutation not tied to a single genomic class the way NPM1/TP53 are in this cancer\'s own trunk — a real, recurrent finding across this disease\'s genomic landscape, drawn into the shared pool for that reason.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];

const HISTOLOGY_AML = {
  intro: 'A bone marrow biopsy or aspirate shows a sheet of myeloblasts — medium-to-large cells with a high nuclear-to-cytoplasmic ratio, finely dispersed ("open") chromatin, and often one or more prominent nucleoli — replacing normal marrow elements. Diagnosis classically requires 20% or more blasts (StatPearls, "Acute Myeloid Leukemia," NCBI Bookshelf NBK507875), though WHO-HAEM5 dropped this threshold for most genetically-defined categories, and NPM1-mutated AML specifically can be diagnosed irrespective of blast count (Khoury et al., Leukemia, 2022, PMID 35732831). A minority of blasts carry Auer rods — thin, needle-like, azurophilic (reddish-purple) cytoplasmic inclusions formed from fused primary granules — a real, recognized, but not universal morphologic feature.',
  ariaSummary: 'Stylized microscopic field: a dense sheet of medium-to-large blast cells with open, pale-purple chromatin and prominent dark nucleoli, most with a thin rim of cytoplasm; scattered among them, a few cells contain a single thin pink-red needle-like rod crossing the cytoplasm.',
  citation: 'Vakiti, Reynolds & Mewawalla, StatPearls, "Acute Myeloid Leukemia," NCBI Bookshelf NBK507875; Khoury et al., Leukemia, 2022 (PMID 35732831).',
  features: [
    { key:'myeloblasts', label:'Myeloblast sheet',
      text:'A dense, replacing population of medium-to-large blasts with a high nuclear-to-cytoplasmic ratio, open chromatin, and prominent nucleoli — the defining low-power impression of this cancer.' },
    { key:'auerrods', label:'Auer rods',
      text:'Thin, needle-like azurophilic cytoplasmic inclusions, formed from fused primary granules — a real, recognized diagnostic feature when present, though not seen in every case or every subtype.' },
  ],
};

// ============================================================================================
// TRUNK_APL / REGIONS_APL / PRIVATE_POOL_APL / HISTOLOGY_APL — Acute promyelocytic leukemia
const TRUNK_APL = [
  { gene:'PML-RARA fusion (t(15;17))', class:'driver', ccf:'90–95% of cases via the classic t(15;17)(q24;q21) translocation (Cingam & Koshy, StatPearls, "Acute Promyelocytic Leukemia," NCBI Bookshelf NBK459352, PMID 29083825); the WHO-HAEM5 diagnostic entity is defined by a RARA fusion generally, so the small remainder carries a rarer variant RARA fusion partner rather than PML specifically', note:'The defining, essentially universal genetic event for this WHO-recognized entity — not modeled as ~100%, since the classic t(15;17)/PML-RARA-specific figure verified at the source is 90–95%, with variant RARA-fusion-partner cases accounting for the remainder. Bundles of Auer rods form the characteristic "faggot cells" this cancer is known for (StatPearls, NBK459352, verbatim: "Auer rods may be present singly or in bundles and may form characteristic faggot cells") — modeled at histology level below.' },
];
const REGIONS_APL = [
  { id:'PC', name:'Central nervous system', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'FLT3-ITD mutation', class:'driver', ccf:'~35–38% of APL cases carry FLT3-ITD (Callens et al., Leukemia, 2005, PMID 15889156)', note:'FLT3-ITD did not affect complete-remission or relapse rates in a dedicated European APL Group cohort, but was independently associated with markedly worse POST-RELAPSE survival (Callens et al., 2005) — the real, disclosed reason it is paired with this cancer\'s own two documented relapse sites rather than a diagnosis-time distribution. Among documented extramedullary relapses in a dedicated APL cohort, CNS accounted for 9 of 10 cases (de Botton et al., Leukemia, 2006, PMID 16307026) — CNS, not skin, is the dominant real extramedullary relapse site for this cancer, a genuine contrast with general AML\'s own skin-first pattern.' } },
  { id:'PK', name:'Skin', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'FLT3-ITD mutation', class:'driver', ccf:'same gene and figures as this cancer’s own Central nervous system site', note:'Same gene as this cancer’s own Central nervous system site. Skin accounted for 1 of 10 documented extramedullary relapses in the same dedicated APL cohort (de Botton et al., 2006) — a real but minority site relative to CNS in this specific cancer, disclosed rather than assumed to mirror general AML\'s skin-predominant pattern.' } },
  { id:'PB', name:'Bone (myeloid sarcoma mass)', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'FLT3-ITD mutation', class:'driver', ccf:'same gene as this cancer’s own Central nervous system site; no APL-specific site percentage located for this pass', note:'Same gene as this cancer’s own Central nervous system site. This cancer\'s own extramedullary presentation is genuinely rare overall — a 3-year cumulative incidence of extramedullary relapse of just 5.0% in the same dedicated cohort (de Botton et al., 2006) — so this site is disclosed using general AML myeloid-sarcoma site data (bone among the most common adult sites — Avni & Koren-Michowitz, Ther Adv Hematol, 2011, PMID 23556098) rather than an APL-specific figure, and that scope difference is stated directly rather than blurred.' } },
  { id:'PL', name:'Lymph nodes', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'FLT3-ITD mutation', class:'driver', ccf:'same gene as this cancer’s own Central nervous system site; no APL-specific site percentage located for this pass', note:'Same gene as this cancer’s own Central nervous system site. Same general-AML-sourced disclosure as this cancer\'s own Bone site: lymph nodes are named among the most common adult myeloid-sarcoma sites overall (Avni & Koren-Michowitz, 2011), not independently verified as an APL-specific figure.' } },
];
const PRIVATE_POOL_APL = [
  { gene:'FLT3-TKD mutation (D835)', class:'driver', ccf:'20% (Callens et al., Leukemia, 2005, PMID 15889156)', note:'A second, distinct FLT3 lesion (the tyrosine-kinase-domain point mutation, mechanistically different from the branch-level FLT3-ITD internal tandem duplication above) recurrent in this cancer at a real, independently-documented rate, not tied to a specific site in the literature located for this pass.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];

const HISTOLOGY_APL = {
  intro: 'The classic (hypergranular) form shows abnormal promyelocytes with numerous violet-staining cytoplasmic granules — irregular, sometimes bilobed or kidney-shaped (StatPearls, verbatim: "The cytoplasm contains numerous violet granules"). Bundles of Auer rods form the characteristic "faggot cells" this cancer is best known for morphologically (StatPearls, "Acute Promyelocytic Leukemia," NCBI Bookshelf NBK459352, verbatim: "Auer rods may be present singly or in bundles and may form characteristic faggot cells"). A microgranular variant, with sparse or barely visible granules and less prominent Auer rods, accounts for roughly 15–25% of adult cases (same source) and is disclosed in text rather than drawn as a second morphology.',
  ariaSummary: 'Stylized microscopic field: a dense sheet of irregular, often bilobed cells whose cytoplasm carries numerous violet-red granules; several cells contain a tight bundle of multiple thin pink-red rods crossing the cytoplasm together.',
  citation: 'Cingam & Koshy, StatPearls, "Acute Promyelocytic Leukemia," NCBI Bookshelf NBK459352 (PMID 29083825).',
  features: [
    { key:'hypergranular', label:'Hypergranular promyelocytes',
      text:'Abnormal promyelocytes densely packed with coarse cytoplasmic granules, often partly obscuring an irregular, sometimes bilobed nucleus — the classic (hypergranular) morphology this cancer is diagnosed by in most cases.' },
    { key:'faggotcells', label:'Faggot cells',
      text:'Bundles of multiple Auer rods clustered together within one cell\'s cytoplasm — a real, distinctive, named feature of this cancer specifically, and the morphologic finding its own microscopic diagnosis most often turns on.' },
  ],
};

// ============================================================================================
// TRUNK_ET / REGIONS_ET / PRIVATE_POOL_ET / HISTOLOGY_ET — Essential thrombocythemia
// TRUNK_PV / REGIONS_PV / PRIVATE_POOL_PV / HISTOLOGY_PV — Polycythemia vera
// TRUNK_PMF / REGIONS_PMF / PRIVATE_POOL_PMF / HISTOLOGY_PMF — Primary myelofibrosis
// The shared JAK2/CALR/MPL driver family is MECHANISTICALLY differential across these three
// diseases, not merely a frequency pattern: JAK2 V617F (and JAK2 exon 12 mutations) activate all
// three major myeloid cytokine receptors, including the erythropoietin receptor, while CALR and
// MPL mutants activate only the thrombopoietin receptor — they cannot mechanistically drive the
// erythrocytosis PV requires (Vainchenker & Kralovics, Blood, 2017, PMID 28028029). That is why
// PV models as ONE trunk entry (JAK2 is essentially the only mechanistically possible driver
// there) while ET and PMF each model THREE competing, mutually-exclusive trunk entries (JAK2/
// CALR/MPL) — the same shape this atlas already uses for AML's two competing founder classes,
// extended to three because that is what the real diagnostic biology of these two diseases is.
// Real, quantified mutual exclusivity within one tumor: 146 of 151 MPN patients (97%) carried a
// JAK2, MPL, or CALR mutation "in a mutually exclusive manner" (Nangalia et al., N Engl J Med,
// 2013, PMID 24325359) — the 5 exceptions were triple-negative, not double-mutant; true
// double-mutant cases are documented but rare (one case, Al Assaf et al., Haematologica, 2015,
// PMID 25934766).
const TRUNK_ET = [
  { gene:'JAK2 V617F mutation', class:'driver', ccf:'~50–70% across sources, with most modern series clustering around 55–62% (StatPearls, "Myeloproliferative Neoplasms," NCBI Bookshelf NBK531464; 62% [466/745] in a large consecutive clinical cohort — Rumi et al., Blood, 2014, PMID 24366362)', note:'Real cross-study variation is reported as a range rather than one averaged figure. Mutually exclusive with CALR and MPL mutation within one tumor — 97% of a 151-patient MPN cohort carried exactly one of the three (Nangalia et al., 2013). JAK2-mutated ET carries a real risk of transforming to polycythemia vera (28.6% cumulative incidence at 15 years, Rumi et al., 2014) that CALR-mutated ET does not (0% in the same cohort) — a real, mechanistically consistent finding, since CALR mutants cannot drive the erythrocytosis PV requires.' },
  { gene:'CALR mutation (exon 9 insertion/deletion)', class:'driver', ccf:'~20–25% (24% [176/745], Rumi et al., 2014); type 1 and type 2 variants are unevenly distributed in this cancer specifically, 46% vs 38% of CALR-mutated cases, with the remainder rarer variants (Rumi et al., 2014)', note:'Mutually exclusive with JAK2 and MPL mutation (see this cancer\'s own JAK2 note). Mechanistically restricted to activating the thrombopoietin receptor only — real, verified, essentially absent from polycythemia vera (0 of 217 screened PV patients, Nangalia et al., 2013), unlike JAK2 which can activate the erythropoietin receptor too. CALR-mutated ET carries a lower real risk of transformation to acute leukemia than JAK2-mutated ET or PV (2.5% vs. 4.3% vs. 14.6% cumulative incidence at 15 years, Rumi et al., 2014), though this difference did not remain significant after age adjustment.' },
  { gene:'MPL mutation (W515L/K and others)', class:'driver', ccf:'~3–6% (4% [28/745], Rumi et al., 2014; StatPearls gives a wider up-to-6% range)', note:'Mutually exclusive with JAK2 and CALR mutation (see this cancer\'s own JAK2 note). A real minority of cases (~10%, 75/745 in the same cohort) carry none of the three driver mutations ("triple-negative") — real, disclosed, and genuinely distinct in outcome rather than simply unclassified.' },
];
const REGIONS_ET = [
  { id:'ES', name:'Spleen', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'JAK2 V617F mutation', class:'driver', ccf:'same gene and figures as this cancer’s own trunk note', note:'This entry\'s own uncomplicated form has no established, dedicated extramedullary-hematopoiesis pattern in the literature located for this pass — splenomegaly is a real, common clinical finding, but that is organ enlargement, not verified extramedullary hematopoietic tissue. The figures and mechanism disclosed here describe secondary (post-ET) myelofibrosis specifically — a real, documented progression endpoint of this cancer in which the marrow\'s own somatic driver mutation is directly confirmed present in splenic hematopoietic tissue by matched sequencing (Guy et al., Virchows Arch, 2021, PMID 33934231) — not a feature of ET itself, and that scope difference is stated directly rather than blurred.' } },
  { id:'EL', name:'Liver', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'JAK2 V617F mutation', class:'driver', ccf:'same gene as this cancer’s own Spleen site; no ET-specific figure located for this pass', note:'Same gene and same progression-endpoint scope disclosure as this cancer\'s own Spleen site. Hepatic extramedullary hematopoiesis is real and documented in the myelofibrosis literature (Amanam et al., Blood Rev, 2026, PMID 41344966 — a review centered on primary myelofibrosis specifically, applied here as the closest available literature for this cancer\'s own post-transformation endpoint) but with no single clean population-prevalence figure located with the same rigor as the splenic finding — disclosed as real but comparatively unquantified.' } },
  { id:'EN', name:'Lung', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'CALR mutation (exon 9 insertion/deletion)', class:'driver', ccf:'same gene as this cancer’s own trunk note; no ET-specific pulmonary figure located for this pass', note:'Pulmonary extramedullary hematopoiesis is a real, named complication of myelofibrosis (Amanam et al., 2026, whose own title names "hepatic, pulmonary, and thrombotic complications" directly, though the review itself centers on primary myelofibrosis specifically) — again disclosed here as a real, documented feature via the closest available literature for this cancer\'s progression endpoint, not a dedicated post-ET study.' } },
  { id:'EY', name:'Lymph nodes', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'CALR mutation (exon 9 insertion/deletion)', class:'driver', ccf:'same gene as this cancer’s own Lung site', note:'Same gene as this cancer\'s own Lung site. Extramedullary hematopoiesis at additional sites, including lymph nodes, is named in the broader myeloproliferative-neoplasm literature without a clean, ET-specific citable percentage located for this pass — disclosed as real but unquantified, following this atlas\'s own established honesty precedent for exactly this situation (e.g., Mantle Cell Lymphoma\'s Spleen site, js/organs/lymphnodes.js).' } },
];
const PRIVATE_POOL_ET = [
  { gene:'TET2 mutation', class:'driver', note:'A broadly distributed, clonal-hematopoiesis-associated epigenetic-modifier mutation recurrent across myeloproliferative neoplasms generally, not tied to a specific JAK2/CALR/MPL branch — drawn into the shared pool for that reason, the same role it plays in this organ\'s AML entry.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];
const HISTOLOGY_ET = {
  intro: 'The bone marrow shows a proliferation of the megakaryocyte lineage with increased numbers of large, mature megakaryocytes, without the accompanying increase in granulopoiesis or erythropoiesis seen in polycythemia vera (StatPearls, "Myeloproliferative Neoplasms," NCBI Bookshelf NBK531464, citing the WHO diagnostic criteria). Megakaryocytes carrying the MPL mutation specifically cluster with hyperlobulated "stag-horn"-like nuclei in an otherwise normocellular marrow (Michiels et al., Acta Haematol, 2015, PMID 25116092); CALR-mutated cases may instead show large, immature, dysmorphic megakaryocytes with bulky, "cloud-like" nuclei — a real, disclosed difference in nuclear morphology by driver gene, not one uniform picture.',
  ariaSummary: 'Stylized microscopic field: scattered large, mature megakaryocytes with deeply lobulated, antler-like nuclei among normal-appearing granulocyte and red-cell precursors, without the dense trilineage crowding seen in polycythemia vera.',
  citation: 'StatPearls, "Myeloproliferative Neoplasms," NCBI Bookshelf NBK531464; Michiels et al., Acta Haematol, 2015 (PMID 25116092).',
  features: [
    { key:'stagshorn', label:'Stag-horn megakaryocytes',
      text:'Large, mature megakaryocytes with deeply lobulated, antler-like nuclei, often clustered — the defining low-power finding in this cancer\'s marrow, in an otherwise close-to-normal background.' },
    { key:'normocellular', label:'Normocellular background',
      text:'Unlike polycythemia vera\'s trilineage hypercellularity, this cancer\'s own granulocyte and erythroid lineages are not increased — the megakaryocyte proliferation stands out precisely because the rest of the marrow looks ordinary.' },
  ],
};

const TRUNK_PV = [
  { gene:'JAK2 V617F mutation (or, in a real minority, a JAK2 exon 12 mutation)', class:'driver', ccf:'~95–97% carry JAK2 V617F (StatPearls, NCBI Bookshelf NBK531464; 96% [468/490], Rumi et al., Blood, 2014, PMID 24366362); of the 22 V617F-negative cases in that same 490-patient cohort, 22/22 (100%) carried a JAK2 exon 12 mutation instead; a smaller discovery cohort found the same in ~91% of its own V617F-negative cases (Scott et al., N Engl J Med, 2007, PMID 17267906)', note:'The near-universal founding event, and the one this atlas models with essentially no real competing alternative: CALR and MPL mutants activate only the thrombopoietin receptor and mechanistically cannot drive this cancer\'s defining erythrocytosis (Vainchenker & Kralovics, 2017). CALR mutations were found in 0 of 217 screened PV patients in one large cohort (Nangalia et al., N Engl J Med, 2013, PMID 24325359) — essentially absent, though exceptional case reports of unclear significance exist. JAK2 exon 12 mutations are themselves essentially restricted to this cancer: 0 of 115 V617F-negative essential thrombocythemia patients and 0 of 12 V617F-negative primary myelofibrosis patients carried one in the same dedicated discovery study (Scott et al., 2007).' },
];
const REGIONS_PV = [
  { id:'VS', name:'Spleen', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'JAK2 V617F mutation', class:'driver', ccf:'same gene as this cancer’s own trunk note', note:'As with this organ\'s Essential thrombocythemia entry, this cancer\'s own uncomplicated form has no established distant/extramedullary pattern in the literature located for this pass. The figures disclosed here describe secondary (post-PV) myelofibrosis specifically — a real, documented, molecularly-confirmed progression endpoint of this cancer (splenic hematopoietic tissue sharing the marrow\'s own driver mutation — Guy et al., Virchows Arch, 2021, PMID 33934231), not a feature of PV itself.' } },
  { id:'VL', name:'Liver', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'JAK2 V617F mutation', class:'driver', ccf:'same gene as this cancer’s own Spleen site; no PV-specific figure located for this pass', note:'Same gene and same progression-endpoint scope disclosure as this cancer\'s own Spleen site. Hepatic extramedullary hematopoiesis is real and documented in the post-transformation myelofibrosis literature (Amanam et al., Blood Rev, 2026, PMID 41344966), without a clean PV-specific population-prevalence figure.' } },
  { id:'VN', name:'Lung', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'JAK2 V617F mutation', class:'driver', ccf:'same gene as this cancer’s own trunk note; no PV-specific pulmonary figure located for this pass', note:'Pulmonary extramedullary hematopoiesis is a real, named complication of secondary myelofibrosis (Amanam et al., 2026) — again a documented feature of this cancer\'s progression endpoint, not of uncomplicated PV.' } },
  { id:'VY', name:'Lymph nodes', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'JAK2 V617F mutation', class:'driver', ccf:'same gene as this cancer’s own trunk note', note:'Extramedullary hematopoiesis at additional sites, including lymph nodes, is named in the broader myeloproliferative-neoplasm literature without a clean, PV-specific citable percentage located for this pass — disclosed as real but unquantified.' } },
];
const PRIVATE_POOL_PV = [
  { gene:'TET2 mutation', class:'driver', note:'A broadly distributed, clonal-hematopoiesis-associated epigenetic-modifier mutation recurrent across myeloproliferative neoplasms generally, not tied to this cancer\'s single trunk gene — the same role it plays in this organ\'s AML and Essential thrombocythemia entries.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];
const HISTOLOGY_PV = {
  intro: 'The bone marrow shows panmyelosis — hypercellularity with proliferation across all three lineages (granulocytic, erythroid, and megakaryocytic), not megakaryocytes alone (StatPearls, "Myeloproliferative Neoplasms," NCBI Bookshelf NBK531464, verbatim: "hypercellularity and panmyelosis, with a variable proliferation of granulocyte precursors, erythroid cells, and megakaryocytes"). This trilineage crowding, present even before overt erythrocytosis develops, is the real feature that distinguishes this cancer\'s marrow from essential thrombocythemia\'s comparatively normal non-megakaryocytic background.',
  ariaSummary: 'Stylized microscopic field: a densely packed marrow with crowded islands of red-cell precursors, granulocyte precursors at every stage of maturation, and scattered large megakaryocytes, leaving little visible fat space — a hypercellular, all-lineage picture.',
  citation: 'StatPearls, "Myeloproliferative Neoplasms," NCBI Bookshelf NBK531464.',
  features: [
    { key:'panmyelosis', label:'Panmyelosis',
      text:'Hypercellular marrow with proliferation across all three blood-cell lineages at once — the defining low-power finding, and the real feature that separates this cancer from essential thrombocythemia\'s more isolated megakaryocyte proliferation.' },
    { key:'hypercellular', label:'Marrow hypercellularity',
      text:'Little visible fat space remains — cellularity is markedly increased for the patient\'s age, a formal WHO diagnostic criterion for this cancer.' },
  ],
};

const TRUNK_PMF = [
  { gene:'JAK2 V617F mutation', class:'driver', ccf:'real range ~40–69% across sources (StatPearls gives 40–50%; a discovery cohort found 69% [27/39] — Nangalia et al., 2013; most reviews cluster around 50–60%, Vainchenker & Kralovics, 2017) — reported as a genuine spread rather than one averaged figure, since this cancer is explicitly noted to be more cohort-heterogeneous than ET/PV', note:'Mutually exclusive with CALR and MPL mutation within one tumor (see this organ\'s Essential thrombocythemia entry for the same three-way exclusivity, quantified at 97% of 151 MPN patients — Nangalia et al., N Engl J Med, 2013, PMID 24325359). This cancer\'s own defining feature — marrow fibrosis — is graded on a real, four-tier European consensus scale (MF-0 through MF-3, disclosed at histology level below) independent of which of the three driver genes is present.' },
  { gene:'CALR mutation (exon 9 insertion/deletion)', class:'driver', ccf:'~25–30% population-level (Vainchenker & Kralovics, 2017, citing Klampfl/Nangalia); type 1 is strongly predominant over type 2 in this cancer specifically, ~75% vs ~15% (same source) — a real, disclosed contrast with essential thrombocythemia\'s own less lopsided 46%/38% split (Rumi et al., 2014)', note:'Mutually exclusive with JAK2 and MPL mutation. The type-1-vs-type-2 distinction is directly, formally prognostic here, not merely descriptive: CALR type-1 mutation specifically (not CALR mutation status generally) is a favorable-risk marker in the MIPSS70 prognostic model (Guglielmelli et al., J Clin Oncol, 2018, PMID 29226763), and CALR-unmutated status is an independent adverse marker in the dedicated secondary-myelofibrosis prognostic model MYSEC-PM (Passamonti et al., Leukemia, 2017, PMID 28561069) — two independent, cross-validating prognostic groups reaching the same conclusion.' },
  { gene:'MPL mutation (W515L/K and others)', class:'driver', ccf:'~5–10% (StatPearls gives up to 10%; Vainchenker & Kralovics, 2017, give ~5%)', note:'Mutually exclusive with JAK2 and CALR mutation. A real minority of cases (under 10–15%) carry none of the three driver mutations ("triple-negative") — and this category is disclosed as more than simply lower-priority: "the rare triple-negative PMF appears more likely to be MDSs with secondary fibrosis" (Vainchenker & Kralovics, 2017) — a real, sourced statement about distinct underlying biology, not only a worse-prognosis label.' },
];
const REGIONS_PMF = [
  { id:'FS', name:'Spleen', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'CALR mutation (exon 9 insertion/deletion)', class:'driver', ccf:'a dedicated 24-spleen study (14 primary myelofibrosis, 7 polycythemia vera, 3 unclassifiable) confirmed splenic extramedullary hematopoiesis as "a key feature of advanced-stage" disease (Prakash et al., Mod Pathol, 2012, PMID 22388763)', note:'This is real, clonal hematopoietic tissue, not simple organ enlargement or passive congestion: matched spleen/marrow sequencing found identical somatic driver-mutation status between the two organs in half of the patients tested (Guy et al., Virchows Arch, 2021, PMID 33934231) — direct, mechanistic confirmation that the same malignant clone is growing in the spleen. Three distinct histologic growth patterns were identified (diffuse, nodular, mixed), each with a different dominant lineage (granulocytic, trilineage, and erythroid respectively — Prakash et al., 2012).' } },
  { id:'FL', name:'Liver', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'CALR mutation (exon 9 insertion/deletion)', class:'driver', ccf:'same gene as this cancer’s own Spleen site; hepatomegaly on ultrasound was found in 25% at diagnosis, rising to 39% at later stages in an older imaging series (Siniluoto et al., Acta Radiol, 1992, PMID 1633045) — organ-enlargement figures, not biopsy-confirmed hematopoietic tissue', note:'Same gene as this cancer\'s own Spleen site. Real, biopsy/imaging-confirmed hepatic extramedullary hematopoiesis is documented in case reports and reviews (Amanam et al., Blood Rev, 2026, PMID 41344966), including a real, quantified downstream complication — portal hypertension in 3–18% of myeloproliferative-neoplasm patients overall, "driven by intrahepatic sinusoidal infiltration, splenic hyperdynamic circulation, and splanchnic thrombosis" (same source) — but no single clean population-prevalence figure for true hepatic hematopoietic tissue itself was located with the same rigor as the splenic finding.' } },
  { id:'FN', name:'Lung', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'ASXL1 mutation', class:'driver', ccf:'one of four genes in the formally-defined "high-molecular-risk" (HMR) category — ASXL1, EZH2, SRSF2, IDH1/2 — an independent adverse prognostic factor in the MIPSS70 model (Guglielmelli et al., J Clin Oncol, 2018, PMID 29226763, N=805)', note:'Pulmonary extramedullary hematopoiesis is a real, named complication of this cancer specifically — Amanam et al. (2026) title their own dedicated review around exactly "hepatic, pulmonary, and thrombotic complications" of this disease — without a clean site-specific percentage located for this pass. TP53 mutation, despite superficial resemblance to an HMR gene, plays a real but DIFFERENT role: uncommon in chronic-phase disease (under 5%) but present in roughly 20% of cases that transform to secondary acute myeloid leukemia (Vainchenker & Kralovics, 2017) — a leukemic-transformation marker, not a chronic-phase HMR gene in the MIPSS70 sense, and deliberately not modeled as interchangeable with ASXL1/EZH2/SRSF2/IDH1/2 here.' } },
  { id:'FY', name:'Lymph nodes', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'ASXL1 mutation', class:'driver', ccf:'same gene as this cancer’s own Lung site', note:'Same gene as this cancer\'s own Lung site. Extramedullary hematopoiesis at additional sites, including lymph nodes, is named in the broader myeloproliferative-neoplasm literature without a clean, PMF-specific citable percentage located for this pass — disclosed as real but unquantified.' } },
];
const PRIVATE_POOL_PMF = [
  { gene:'EZH2 mutation', class:'driver', note:'A second member of the formally-defined MIPSS70 high-molecular-risk gene set (alongside this cancer\'s own ASXL1 branch gene, plus SRSF2 and IDH1/2) — real, recurrent, and independently adverse-prognostic, but not tied to a specific site the way ASXL1 is modeled here; drawn into the shared pool for that reason (Guglielmelli et al., J Clin Oncol, 2018, PMID 29226763).' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];
const HISTOLOGY_PMF = {
  intro: 'The peripheral blood shows a leukoerythroblastic picture — immature granulocytes and nucleated red blood cells circulating together, cells that normally stay in the marrow. A marrow aspirate is often a "dry tap" ("punctio sicca") because the fibrotic marrow cannot be aspirated at all; biopsy instead shows a variable degree of reticulin or collagen fibrosis, graded on a real, four-tier European consensus scale (MF-0 through MF-3 — Thiele et al., Haematologica, 2005, PMID 16079113), alongside megakaryocytes with atypical, abnormal nuclear morphology (StatPearls, "Myeloproliferative Neoplasms," NCBI Bookshelf NBK531464).',
  ariaSummary: 'Stylized microscopic field: a marrow crossed by dense, wavy pink-purple fibrous strands, with clustered, atypical megakaryocytes trapped among them and comparatively little normal blood-forming tissue visible.',
  citation: 'StatPearls, "Myeloproliferative Neoplasms," NCBI Bookshelf NBK531464; Thiele et al., Haematologica, 2005 (PMID 16079113).',
  features: [
    { key:'reticulin', label:'Reticulin/collagen fibrosis',
      text:'Dense, wavy fibrous strands replacing the marrow\'s normal architecture — this cancer\'s own defining feature, graded MF-0 (scattered, no intersections) through MF-3 (dense, coarse collagen bundles with osteosclerosis) on a real, standardized scale.' },
    { key:'atypicalmega', label:'Atypical megakaryocyte clusters',
      text:'Clustered megakaryocytes with abnormal, irregular nuclear morphology, trapped within the fibrous strands — a formal WHO diagnostic criterion for this cancer, distinct from essential thrombocythemia\'s own large-but-otherwise-unremarkable megakaryocytes.' },
  ],
};

// ============================================================================================
// TRUNK_CML / REGIONS_CML / PRIVATE_POOL_CML / HISTOLOGY_CML — Chronic myeloid leukemia
const TRUNK_CML = [
  { gene:'BCR-ABL1 fusion (t(9;22), the Philadelphia chromosome)', class:'driver', ccf:'~90–95% by classic karyotype; essentially all of the remainder is BCR-ABL1-positive too, detectable only by FISH/PCR as a variant or cryptic translocation rather than absent (StatPearls, "Chronic Myelogenous Leukemia," NCBI Bookshelf NBK531459; Johansson, Fioretos & Mitelman, Acta Haematol, 2002, PMID 11919388, give variant rearrangements at 2–10%)', note:'The defining, essentially universal founding event — t(9;22)(q34;q11.2) fuses ABL1 (chromosome 9) with BCR (chromosome 22), producing the p210 BCR-ABL1 oncoprotein, a constitutively active tyrosine kinase (mechanism per Ren, Nat Rev Cancer, 2005, PMID 15719031) whose normal auto-inhibitory control is lost. This cancer\'s own real leukemic-stem-cell niche question is genuinely richer than a simple two-sided debate, and is disclosed that way rather than forced into a binary: real, independently reproduced evidence supports osteoblastic/endosteal regulation (a 15-fold LSC reduction from osteoblast-specific parathyroid-hormone-receptor activation — Krause et al., Nat Med, 2013, PMID 24162813), vascular/endothelial regulation via an E-selectin–CD44 axis (Godavarthy et al., Haematologica, 2020, PMID 31018977, which itself states plainly that "the endosteal bone marrow niche and vascular endothelial cells provide sanctuaries for leukemic cells" — both, not one), and mesenchymal/perivascular CXCL12- and N-cadherin-dependent protection (Agarwal et al., Cell Stem Cell, 2019, PMID 30905620; Zhang et al., Blood, 2013, PMID 23299311). More recent work adds a genuinely distinct, extramedullary splenic niche with both leukemia-supporting (Bührer et al., Leukemia, 2022, PMID 36163264) and leukemia-restraining (Wang et al., Nat Cancer, 2025, PMID 40097655) components. The literature has moved toward recognizing multiple, anatomically distinct niches acting at once rather than settling a single endosteal-versus-perivascular question.' },
];
const REGIONS_CML = [
  { id:'CS', name:'Skin', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'ASXL1 mutation', class:'driver', ccf:'a deep-sequencing study of blast-crisis CML found mutations in 76.9% of cases overall (Grossmann et al., Leukemia, 2011, PMID 21274004); ASXL1 is independently named, alongside IKZF1 and RUNX1, among the genes most frequently mutated at diagnosis (Branford et al., Blood, 2018, PMID 29967129)', note:'This cancer\'s own true extramedullary disease (myeloid sarcoma at blast crisis) is genuinely rare and documented mainly through individual case reports — skin, CNS/epidural space, bone/soft tissue and spine are all real, individually-documented sites (Arzoun et al., Cureus, 2022, PMID 35036234, characterizes it as occurring "primarily in single-case studies" and states its prognostic significance "has not been well investigated") — disclosed honestly as case-report-level evidence rather than a population percentage, since none was found in this pass.' } },
  { id:'CC', name:'Central nervous system', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'ASXL1 mutation', class:'driver', ccf:'same gene as this cancer’s own Skin site', note:'Same gene and same case-report-level disclosure as this cancer\'s own Skin site.' } },
  { id:'CB', name:'Bone (myeloid sarcoma mass)', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'RUNX1 mutation', class:'driver', ccf:'by blast crisis, "all patients had cancer gene variants" in a dedicated diagnosis-to-blast-crisis cohort (Branford et al., 2018), with ABL1 kinase-domain resistance mutations frequently co-occurring with these secondary drivers', note:'A case report with an accompanying literature review found a bone/soft-tissue myeloid-sarcoma presentation documented in 33 similar case reports (Wang et al., Front Oncol, 2026, PMID 41836234) — a real, if small-numbers, indicator of this presentation\'s rarity rather than a population-based rate, and reported here as such.' } },
  { id:'CP', name:'Spleen', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'RUNX1 mutation', class:'driver', ccf:'same gene as this cancer’s own Bone site', note:'Same gene as this cancer\'s own Bone site. Splenomegaly is the most common physical examination finding in this cancer, extending more than 5cm below the left costal margin in over half of patients at diagnosis (StatPearls, NCBI Bookshelf NBK531459) — a clinical finding distinct from confirmed malignant extramedullary tissue, disclosed as such rather than conflated with the myeloid-sarcoma sites above.' } },
];
const PRIVATE_POOL_CML = [
  { gene:'IKZF1 mutation', class:'driver', note:'Named alongside ASXL1 and RUNX1 among the genes most frequently mutated at diagnosis in a dedicated genomic-evolution study (Branford et al., Blood, 2018, PMID 29967129) — real, recurrent, cooperating with the BCR-ABL1-positive background rather than competing with it, and not tied to a specific site the way ASXL1/RUNX1 are modeled here.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];
const HISTOLOGY_CML = {
  intro: 'The bone marrow shows marked granulocytic proliferation with a full spectrum of maturing precursors — a real "left-shifted" pattern, not a maturation block: immature granulocytes occupy a thickened band 5 to 10 cells deep along the bone trabeculae, versus a normal 2 to 3 cells (StatPearls, "Chronic Myelogenous Leukemia," NCBI Bookshelf NBK531459). Blasts themselves usually stay under 5% in the chronic phase. Megakaryocytes show a distinctive, real, correctly-named feature of this cancer specifically: small, hypolobated "dwarf" morphology, verbatim from the same source: "The megakaryocytes in CML show a small, hypolobate dwarf morphology."',
  ariaSummary: 'Stylized microscopic field: a densely packed marrow crowded with granulocyte precursors at every stage of maturation along a thickened band near the bone trabeculae, with scattered small, underdeveloped megakaryocytes bearing simplified, non-lobulated nuclei.',
  citation: 'StatPearls, "Chronic Myelogenous Leukemia," NCBI Bookshelf NBK531459.',
  features: [
    { key:'leftshift', label:'Left-shifted granulocytic maturation',
      text:'A full spectrum of maturing granulocyte precursors expands outward in a thickened band along the bone trabeculae — real granulocytic hyperplasia, not a block partway through maturation.' },
    { key:'dwarfmega', label:'Dwarf megakaryocytes',
      text:'Small, hypolobated megakaryocytes with simplified nuclei — a real, distinctively-named feature of this cancer\'s own marrow, unlike the large, hyperlobulated megakaryocytes of essential thrombocythemia or polycythemia vera.' },
  ],
};

// ============================================================================================
// TRUNK_MDS / REGIONS_MDS / PRIVATE_POOL_MDS / HISTOLOGY_MDS — Myelodysplastic neoplasm
const TRUNK_MDS = [
  { gene:'TP53 mutation (multi-hit / biallelic)', class:'driver', ccf:'pathogenic TP53 alterations detected in ~11% of MDS overall (378/3,324), about two-thirds of which are multi-hit (biallelic-equivalent) — 91% (231/253) of multi-hit cases carry a complex karyotype, versus 13% (16/125) of monoallelic cases (Bernard et al., Nat Med, 2020, PMID 32747829, N=3,324)', note:'A real, WHO-HAEM5-defining category ("MDS-biTP53," Khoury et al., Leukemia, 2022, PMID 35732831) that supersedes the SF3B1 category below when both would otherwise apply. THE EXCLUSIVITY IS SCOPED TO MULTI-HIT STATUS SPECIFICALLY, not to TP53 mutation broadly — a real, easily-missed nuance directly confirmed at the source: multi-hit TP53 clones carry "few other mutations, reflecting early truncal events," while monoallelic TP53 mutations are frequently subclonal and "co-occurred with mutations from a broad range of genes," including this cancer\'s own SF3B1 (a favorable-prognosis pairing) as well as ASXL1/RUNX1/CBL (poor-prognosis pairings) (Bernard et al., 2020). A blanket "TP53 excludes SF3B1" claim would misrepresent this — only the multi-hit subset shows exclusivity-like behavior.' },
  { gene:'SF3B1 mutation', class:'driver', ccf:'~20–28% of unselected MDS (150/533, 28.1% — Malcovati et al., Blood, 2011, PMID 21998214; 72/354, 20% — Papaemmanuil et al., NEJM, 2011, PMID 21995386), rising to 65–81% within ring-sideroblast-defined or -enriched subgroups (129/159, 81% — Malcovati et al., Blood, 2015, PMID 25957392; 53/82, 65% — Papaemmanuil et al., 2011)', note:'A second real, WHO-HAEM5-defining category ("MDS-SF3B1," Khoury et al., 2022) — roughly 80% of MDS with 5% or more ring sideroblasts falls into this molecularly-defined type (~20% of MDS-RS cases lack the SF3B1 mutation — Malcovati et al., Blood, 2020, PMID 32347921), which explicitly excludes cases meeting the TP53 category\'s own criteria above. Mechanistically part of a larger, real, mutually-exclusive splicing-gene family: SF3B1, SRSF2, U2AF1 and ZRSR2 mutations "occurred in a mutually exclusive manner," all affecting the same step of pre-mRNA 3′-splice-site recognition (Yoshida et al., Nature, 2011, PMID 21909114) — the mechanistic rationale this atlas\'s own data rule 1 asks for, directly stated by the source rather than inferred.' },
];
const REGIONS_MDS = [
  { id:'DY', name:'Lymph nodes', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'TP53 mutation (multi-hit / biallelic)', class:'driver', ccf:'a documented case of nodal myeloid sarcoma arising in TP53-mutant MDS specifically (case-report level — Mao & Deng, Oncol Lett, 2024, PMID 38807682)', note:'This cancer\'s own true extramedullary disease is genuinely and thoroughly absent from the population-level literature — extramedullary hematopoiesis in MDS is a compensatory response to marrow failure, mechanistically distinct from neoplastic spread, and myeloid sarcoma (the AML-lineage phenomenon this organ\'s other entries model at real sites) is documented in MDS only as isolated case reports, disclosed here as such rather than assigned an invented population percentage. Where reported, it clusters in the AML-adjacent, TP53-mutant end of this cancer\'s spectrum — WHO-HAEM5 itself notes multi-hit TP53 disease "may be regarded as AML-equivalent for therapeutic considerations" (Khoury et al., 2022).' } },
  { id:'DB', name:'Bladder', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'TP53 mutation (multi-hit / biallelic)', class:'driver', ccf:'same gene as this cancer’s own Lymph nodes site; case-report level', note:'Same gene and same case-report-only disclosure as this cancer\'s own Lymph nodes site.' } },
  { id:'DP', name:'Pelvic soft tissue', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'TP53 mutation (multi-hit / biallelic)', class:'driver', ccf:'same gene as this cancer’s own Lymph nodes site; case-report level', note:'Same gene and same case-report-only disclosure as this cancer\'s own Lymph nodes site.' } },
  { id:'DK', name:'Skin & soft tissue', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'TP53 mutation (multi-hit / biallelic)', class:'driver', ccf:'same gene as this cancer’s own Lymph nodes site; case-report level', note:'Same gene and same case-report-only disclosure as this cancer\'s own Lymph nodes site.' } },
];
const PRIVATE_POOL_MDS = [
  { gene:'TET2 mutation', class:'driver', ccf:'named among the genes recurrently mutated at over 10% frequency in a 944-patient cohort (Haferlach et al., Leukemia, 2014, PMID 24220272)', note:'A broadly distributed, clonal-hematopoiesis-associated epigenetic-modifier mutation recurrent across this disease\'s genomic landscape generally, positively associated with SRSF2/ZRSR2 co-mutation rather than tied to one specific founder class — drawn into the shared pool for that reason, the same role it plays in this organ\'s AML entry.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];
const HISTOLOGY_MDS = {
  intro: 'Dysplasia crosses all three blood-cell lineages, and this cancer\'s own diagnosis rests on recognizing it: dysgranulopoiesis (nuclear hyposegmentation — "pseudo-Pelger-Huët" cells — and hypogranular, agranular cytoplasm), dyserythropoiesis (nuclear budding, multinuclearity, and ring sideroblasts — iron deposits ringing the nucleus), and dysmegakaryopoiesis (micromegakaryocytes — small, underdeveloped megakaryocytes with too few nuclear lobes). This is the WHO\'s own morphology table for this cancer (NCBI Bookshelf NBK586202, reproducing the WHO Classification of Tumours of Haematopoietic and Lymphoid Tissues, Revised 4th Edition, p.102), which states directly that "nuclear hyposegmentation..., ring sideroblasts..., micromegakaryocytes... correlate most strongly with" this diagnosis.',
  ariaSummary: 'Stylized microscopic field: scattered abnormal cells across three lineages — neutrophils with simplified, barely-segmented nuclei and sparse granules; red-cell precursors with irregular, budding or multiple nuclei, one ringed by small dark iron deposits; and a small, underdeveloped megakaryocyte with only one or two nuclear lobes instead of many.',
  citation: 'Li (ed.), NCBI Bookshelf NBK586202, 2022, reproducing the WHO Classification of Tumours of Haematopoietic and Lymphoid Tissues, Revised 4th Edition (2017), p.102.',
  features: [
    { key:'ringsideroblast', label:'Ring sideroblasts',
      text:'Red-cell precursors ringed by small, dark iron deposits circling at least a third of the nucleus — closely linked to this cancer\'s own SF3B1-mutant molecular category, present in roughly 80% of cases with 5% or more ring sideroblasts.' },
    { key:'micromega', label:'Micromegakaryocytes',
      text:'Small, underdeveloped megakaryocytes with too few nuclear lobes — one of the three WHO-recognized dysplastic features this cancer\'s own diagnosis is built on, alongside dysplastic change in the granulocyte and red-cell lineages.' },
    { key:'pelgerhuet', label:'Pseudo-Pelger-Huët neutrophils',
      text:'Neutrophils with simplified, bilobed or unsegmented nuclei and sparse cytoplasmic granules — dysgranulopoiesis, the granulocyte lineage\'s own contribution to this cancer\'s cross-lineage dysplastic picture.' },
  ],
};

// ============================================================================================
// TRUNK_CLL / REGIONS_CLL / PRIVATE_POOL_CLL / HISTOLOGY_CLL — CLL/SLL (dominant CLL form)
const TRUNK_CLL = [
  { gene:'TP53 deletion (del17p13) and/or mutation', class:'driver', ccf:'del(17p13) 7% by FISH (Döhner et al., N Engl J Med, 2000, PMID 11136261; Kipps et al., Nat Rev Dis Primers, 2017, PMID 28102226); TP53 mutation separately ranges 4–37% of cases depending on treatment line, since mutation frequency rises sharply at relapse (Hallek, Am J Hematol, 2025, PMID 39871707)', note:'The single worst-prognosis lesion in this cancer\'s real, hierarchical FISH classification — median survival 32 months with del(17p) versus 133 months for isolated del(13q) in the same 325-patient cohort (Döhner et al., 2000). Deletion of the 17p13 locus and mutation within the TP53 gene are two SEPARABLE lesions that can occur together or independently, not one event under two names — "TP53 gene defects, due to deletion of the 17p13 locus and/or mutation(s) within the TP53 gene" (Malcikova et al., Leukemia, 2018, PMID 29467486, the ERIC TP53 Network\'s own guideline, verbatim).' },
  { gene:'ATM deletion (del11q22-23)', class:'driver', ccf:'18% by FISH (Döhner et al., 2000; Kipps et al., 2017); stage-dependent — approximately 25% of chemotherapy-naive advanced-stage patients versus 10% of early-stage patients (Hallek, 2025)', note:'The second-worst prognostic category in the same hierarchy, median survival 79 months (Döhner et al., 2000). This cancer\'s own real, hierarchical FISH classification in full, disclosed here rather than only for its two worst tiers: trisomy 12 occurs in 16% (median survival 114 months) and del(13q) — the single most common individual finding, detected in 55% of cases overall — carries the most favorable outcome (median survival 133 months) when it is the sole abnormality present; 82% of patients carry at least one of these four findings by FISH (Döhner et al., 2000). SEPARATELY, and NOT modeled as a driver mutation in this ledger: IGHV mutation status is a real, extremely well-documented prognostic dichotomy that reflects LINEAGE, not an oncogenic event — "CLL cells that express an unmutated IGHV originate from a B cell that has not undergone differentiation in germinal centres... CLL cells with mutated IGHV arise from a post-germinal centre B cell that expresses immunoglobulin that has undergone somatic hypermutation" (Kipps et al., 2017, verbatim) — the same non-spatial, cell-of-origin kind of claim this organ\'s own §9 procedure requires stating directly rather than folding into the mutation ledger (see this atlas\'s own nodal DLBCL entry, js/organs/lymphnodes.js, for the identical treatment of its GCB/ABC classification).' },
];
const REGIONS_CLL = [
  { id:'LY', name:'Lymph nodes', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'ATM mutation', class:'driver', ccf:'11–15% across two independent cohorts (Kipps et al., 2017, citing large sequencing studies)', note:'Lymphadenopathy is a real, central, formally staging-relevant finding in this cancer — the Rai and Binet staging systems are built directly around it, alongside splenomegaly and hepatomegaly (Hallek, 2025) — disclosed here without a specific population percentage, since none was located in this pass beyond its role as a staging criterion. This is the same real disease this organ\'s own entry represents when it presents nodally rather than in blood/marrow — small lymphocytic lymphoma (SLL), disclosed in this entry\'s own trunk note rather than duplicated on the Lymph Nodes organ.' } },
  { id:'LS', name:'Spleen', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'ATM mutation', class:'driver', ccf:'same gene and figures as this cancer’s own Lymph nodes site', note:'Same gene as this cancer\'s own Lymph nodes site. Splenomegaly is likewise a real, formally staging-relevant clinical finding (Hallek, 2025), disclosed without an independently-located population percentage.' } },
  { id:'LV', name:'Liver', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'NOTCH1 mutation', class:'driver', ccf:'6–12.6% across two independent cohorts (Kipps et al., 2017); NOTCH1 3\' region non-coding mutations independently found to increase NOTCH1 activity and drive more aggressive disease (Puente et al., Nature, 2015, PMID 26200345)', note:'Hepatomegaly completes this cancer\'s own three classic staging-relevant physical findings alongside lymphadenopathy and splenomegaly (Hallek, 2025), again disclosed without an independently-located population percentage.' } },
  { id:'LP', name:'Peripheral blood', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'NOTCH1 mutation', class:'driver', ccf:'same gene as this cancer’s own Liver site', note:'Same gene as this cancer\'s own Liver site. The leukemic (blood-circulating) presentation this organ\'s entry is named for — the site where this cancer\'s own most distinctive histologic feature, smudge cells, is seen (disclosed at histology level below).' } },
];
const PRIVATE_POOL_CLL = [
  { gene:'SF3B1 mutation', class:'driver', ccf:'8.6–21% across two independent cohorts (Kipps et al., Nat Rev Dis Primers, 2017, PMID 28102226)', note:'A splicing-factor mutation recurrent across this cancer\'s genomic landscape generally, not tied to a single branch site here — the same gene family this organ\'s own MDS entry\'s trunk note discusses in its mutually-exclusive splicing-gene context, drawn into the shared pool for that reason.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];
const HISTOLOGY_CLL = {
  intro: 'Blood and marrow show characteristically small, mature lymphocytes with a narrow rim of cytoplasm and a dense nucleus lacking discernible nucleoli (Hallek, Am J Hematol, 2025, PMID 39871707). This cancer\'s single most distinctive finding is seen on the blood smear itself: Gumprecht nuclear shadows, or "smudge cells" — fragile leukemic cells ruptured during smear preparation, leaving behind a smeared, nucleus-shaped debris trail rather than an intact cell. When this same disease presents nodally (small lymphocytic lymphoma), the node shows diffuse infiltration by the same small lymphocytes with small proliferation centers — a real, classic nodal pattern for this disease, also documented directly in a recent case report (Zhou & Medeiros, Ann Diagn Pathol, 2025), disclosed here since this entry represents both presentations.',
  ariaSummary: 'Stylized microscopic field: a monotonous population of small, round lymphocytes with dense, featureless nuclei and barely-visible cytoplasm, with several disrupted, smeared-out cell remnants scattered among the intact cells.',
  citation: 'Hallek, Am J Hematol, 2025 (PMID 39871707); Zhou & Medeiros, Ann Diagn Pathol, 2025.',
  features: [
    { key:'smudgecells', label:'Smudge cells (Gumprecht shadows)',
      text:'Fragile leukemic lymphocytes ruptured during blood-smear preparation, leaving a smeared trail of nuclear debris rather than an intact cell — this cancer\'s single most characteristic and well-known morphologic finding.' },
    { key:'smalllymph', label:'Monotonous small lymphocytes',
      text:'A uniform population of small, mature-appearing lymphocytes with a narrow rim of cytoplasm and a dense nucleus lacking visible nucleoli — the defining low-power impression wherever this cancer is seen, in blood, marrow, or node.' },
  ],
};

// ============================================================================================
// TRUNK_MM / REGIONS_MM / PRIVATE_POOL_MM / HISTOLOGY_MM — Multiple myeloma
// Trunk models the real, top-level cytogenetic split the IMWG itself uses — "Overall MM is
// broadly divided at the top level into two major categories, hyperdiploid MM... and
// non-hyperdiploid MM" (Fonseca et al., IMWG spotlight review, Leukemia, 2009, PMID 19798094) —
// the same status-entry shape this atlas already uses for GBM's IDH-wildtype status and
// bladder's pathway-divergence status, not a single founder gene.
const TRUNK_MM = [
  { gene:'Hyperdiploid status (trisomies of chromosomes 3, 5, 7, 9, 11, 15, 19, 21) vs. non-hyperdiploid status (IGH translocations at 14q32)', class:'driver', ccf:'~45–58% hyperdiploid across independent sources (a real range, not one averaged figure — Fonseca et al., 2009; Bergsagel & Kuehl, J Clin Oncol, 2005, PMID 16155016; Sonneveld et al., IMWG, Blood, 2016, PMID 27002115); the remainder is non-hyperdiploid, "highly enriched for IgH translocations" (Fonseca et al., 2009)', note:'A real, top-level, largely-but-not-perfectly mutually exclusive split — a real, quantified minority of tumors carry BOTH a trisomy and an IGH translocation (74/484, 15.3%, Kumar et al., Blood, 2012, PMID 22234687), disclosed honestly rather than forced into a clean either/or. Real secondary/progression events accumulate on top of either founding route rather than defining a third: 1q21 gain/amplification (~35–40%, gain and amplification carrying different real prognostic weight — Schmidt et al., Blood Cancer J, 2021, PMID 33927196), del(17p)/TP53 loss, and MYC dysregulation are all named directly as progression events by the same IMWG source, disclosed at private-pool level below rather than folded into this trunk note. MYC dysregulation here is mechanistically DIFFERENT from this organ\'s own family relationship to Burkitt lymphoma\'s MYC-IGH translocation (js/organs/lymphnodes.js) — myeloma\'s MYC rearrangements "usually do not have IGH breakpoints consistent with errors in the three B cell specific DNA modification processes" that produce Burkitt\'s clean, early, founding translocation (Affer et al., Leukemia, 2014, PMID 24518206); myeloma\'s is a later, secondary event by a different mechanism, not a shared founding lesion.' },
];
const REGIONS_MM = [
  { id:'MV', name:'Paravertebral', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'t(11;14)(CCND1::IGH) translocation', class:'driver', ccf:'15–20%, the single most common recurrent IGH translocation (Bergsagel & Kuehl, 2005; Fonseca et al., 2009; Kumar et al., 2012); paravertebral involvement accounts for 39.1% of paraskeletal plasmacytomas — masses arising by direct growth from a skeletal lesion after cortical bone disruption, mechanistically distinct from true extramedullary disease (Jiménez-Segura et al., Blood Cancer J, 2022, PMID 36114167)', note:'No site-specific gene association was located for this pass; disclosed as the real, most common branch translocation at a real, well-quantified paraskeletal site rather than an asserted mechanistic pairing.' } },
  { id:'MK', name:'Skull', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'t(11;14)(CCND1::IGH) translocation', class:'driver', ccf:'same gene as this cancer’s own Paravertebral site; skull involvement accounts for 13% of paraskeletal plasmacytomas (Jiménez-Segura et al., 2022)', note:'Same gene and same paraskeletal (cortical-disruption) mechanism disclosure as this cancer\'s own Paravertebral site.' } },
  { id:'MP', name:'Pleura', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'t(4;14)(FGFR3/NSD2::IGH) translocation', class:'driver', ccf:'~10–15% (Bergsagel & Kuehl, 2005; Sonneveld et al., 2016; a 2025 IMWG consensus gives 10% ± 1.2% — Avet-Loiseau et al., PMID 40489728); pleural involvement is the single most common true-extramedullary site, 23% of extramedullary plasmacytomas (Jiménez-Segura et al., 2022)', note:'True extramedullary disease here means hematogenous spread with no contact with bony structures — mechanistically distinct from the paraskeletal sites above (Bladé et al., Blood Cancer J, 2022, PMID 35314675). This translocation was long treated as automatically high-risk; a 2025 IMWG consensus REFINES that view directly: "only 30%-40% of t(4;14)-positive patients are clinically high-risk..." The consensus recommends treating t(4;14) — together with t(14;16) and t(14;20), the other two translocations it groups with — as a high-risk feature only when it co-occurs with 1q+ or del(1p32), not on its own — a real, current update disclosed rather than the older, flatter framing.' } },
  { id:'MS', name:'Skin', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'t(4;14)(FGFR3/NSD2::IGH) translocation', class:'driver', ccf:'same gene as this cancer’s own Pleura site; skin involvement accounts for 19.2% of extramedullary plasmacytomas (Jiménez-Segura et al., 2022)', note:'Same gene and same true-extramedullary mechanism disclosure as this cancer\'s own Pleura site. True extramedullary disease overall is real but genuinely uncommon at diagnosis (1.9% in this same 1,304-patient cohort, rising to 5.1% at relapse) — the higher combined "7–20%" figures sometimes quoted merge this true-EMD category with the mechanistically distinct paraskeletal one, and the two are kept separate here rather than blended.' } },
];
const PRIVATE_POOL_MM = [
  { gene:'TP53 deletion (del17p13)', class:'driver', ccf:'8–14% across independent cohorts (Boyd et al., Leukemia, 2012, PMID 21836613: 8.4%; Avet-Loiseau et al., Leukemia, 2013, PMID 23032723: 13.6%)', note:'A real, independently-adverse secondary/progression event named directly by the IMWG\'s own primary/secondary framework (Fonseca et al., 2009) — not tied to either branch translocation above, and drawn into the shared pool for that reason. Four-year progression-free survival with this deletion was 18% versus 36% without it in the same cohort (Avet-Loiseau et al., 2013).' },
  { gene:'RAS mutation (NRAS or KRAS)', class:'driver', ccf:'a real, staged escalation across disease progression: 7% in MGUS, 25% in newly diagnosed myeloma, 45% in relapsed myeloma in one dedicated cohort (Chng et al., Leukemia, 2008, PMID 18528420); a larger newly-diagnosed cohort found NRAS 19.4% and KRAS 21.2% separately (Walker et al., J Clin Oncol, 2015, PMID 26282654)', note:'"One of the recurrent differences between MGUS and MM is the presence of RAS mutations in the latter" (Chng et al., 2008, verbatim) — a real, disclosed progression driver, not tied to either branch translocation, drawn into the shared pool for that reason.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model.' },
];
const HISTOLOGY_MM = {
  intro: 'Diagnosis requires 10% or more clonal plasma cells in the marrow, or a biopsy-proven plasmacytoma, plus at least one myeloma-defining event (Rajkumar et al., IMWG, Lancet Oncol, 2014, reproduced in Rajkumar, Am J Hematol, 2022, PMID 35560063). This cancer\'s cell of origin sits at the terminal, antibody-secreting endpoint of the B-cell differentiation pathway — "a post-germinal center plasma cell" (StatPearls, "Multiple Myeloma," NCBI Bookshelf NBK534764) — a developmental, not spatial, fact. Sheets of plasma cells replace normal marrow: round-to-oval cells 14 to 20 micrometers across, with abundant deep blue cytoplasm, an eccentric nucleus, and coarse chromatin arranged in a "clock face" pattern (StatPearls, "Histology, Plasma Cells," NCBI Bookshelf NBK556082).',
  ariaSummary: 'Stylized microscopic field: sheets of round, medium-sized cells with deep blue-purple cytoplasm, an eccentrically placed nucleus with coarse, radially-arranged chromatin resembling clock-face numerals, and a pale, clear zone beside the nucleus.',
  citation: 'StatPearls, "Multiple Myeloma," NCBI Bookshelf NBK534764; StatPearls, "Histology, Plasma Cells," NCBI Bookshelf NBK556082.',
  features: [
    { key:'clockface', label:'Clock-face nucleus',
      text:'An eccentrically placed, round nucleus with coarse chromatin arranged radially, like numerals on a clock face — the single most distinctive nuclear feature of this cancer\'s own cell type.' },
    { key:'perinuclearhof', label:'Perinuclear pale zone',
      text:'A pale, clear zone beside the nucleus corresponding to a well-developed Golgi apparatus — the machinery a plasma cell needs to manufacture and export large quantities of antibody, visible as a real, distinctive structural feature.' },
  ],
};

// ============================================================================================
// TRUNK_ALL / REGIONS_ALL / PRIVATE_POOL_ALL / HISTOLOGY_ALL — Acute lymphoblastic leukemia
// This entry stays ONE, not split by lineage or genetic subtype: none of B-ALL's many real
// WHO-defined genetic subtypes carries a distinguishing MORPHOLOGY (they are indistinguishable
// blasts by light microscopy) — the same entry-vs-prose bar this atlas already applies (data
// rule 17), applied here to conclude the opposite of APL's own split. B-lymphoblastic vs.
// T-lymphoblastic lineage is a real, developmental, non-oncogenic fact (§9), disclosed directly
// rather than modeled as a driver mutation.
const TRUNK_ALL = [
  { gene:'B-lymphoblastic vs. T-lymphoblastic lineage', class:'driver', ccf:'B-ALL ~85% / T-ALL ~15% in children; B-ALL ~75% / T-ALL ~25% in adults — a real, meaningfully age-dependent split, not one flat ratio (Iacobucci & Mullighan, J Clin Oncol, 2017, PMID 28297628; corroborated for adults by Terwilliger & Abdul-Hay, Blood Cancer J, 2017, PMID 28665419)', note:'A developmental, not oncogenic, fact — which lymphoid lineage the leukemic transformation arrested within, per this organ\'s own §9 procedure for non-spatial origin claims. T-lymphoblastic leukemia carries its own distinct driver landscape: NOTCH1 activating mutation and CDKN2A/B deletion are essentially tied as its most common single lesions (69% and 71% respectively in the largest modern cohort, N=1,309 — Pölönen et al., Nature, 2024, PMID 39143224, which states both jointly as "most common" rather than naming NOTCH1 alone) — disclosed here rather than folded into the schema\'s branch/private-pool slots, which this entry uses for its real, quantified, definitionally-exclusive B-ALL ploidy split (below) instead.' },
  { gene:'ETV6-RUNX1 fusion (t(12;21))', class:'driver', ccf:'the single most common individual lesion in pediatric B-ALL, 25–30% (Iacobucci & Mullighan, 2017); a real, disclosed age-inverted pattern — under 3% in adults (2.3% in one age-restricted German cohort, PMID 19713226)', note:'A favorable-prognosis, WHO-HAEM5-recognized genetic entity (Alaggio et al., Leukemia, 2022, PMID 35732829) — real, well-characterized, but not paired into this entry\'s branch/private-pool slots for the same reason BCR-ABL1 below is not: no primary source located in this pass directly quantifies mutual exclusivity between the two, which this atlas\'s own discipline (data rules 3/4) asks be checked before pairing two genes as competing branch drivers, not assumed from their both being real, alternative, WHO-recognized categories.' },
  { gene:'BCR-ABL1 fusion (Philadelphia chromosome)', class:'driver', ccf:'2–5% of pediatric B-ALL, rising to 25% of adult B-ALL — a real age gradient in the OPPOSITE direction from ETV6-RUNX1 above (Iacobucci & Mullighan, 2017)', note:'Historically the poorest-prognosis common B-ALL genotype (under 25% long-term cure pre-tyrosine-kinase-inhibitor era) — now over 75% long-term survival with TKI therapy added to chemotherapy, a real, disclosed treatment-era shift rather than a static fact. KMT2A gene rearrangement is a third real, age-concentrated genotype disclosed here rather than modeled at branch level: it accounts for roughly 70–75% of infant (under 1 year) ALL specifically but only 2–5% of ALL in older children, with a real fusion-partner prognostic effect (MLLT3/AF9 superior to AFF1/AF4) documented ONLY in infants, not older children.' },
];
const REGIONS_ALL = [
  { id:'LC', name:'Central nervous system', color:cssVar('--coral'), pos3d:{x:-1.2,y:0.3,z:0.7},
    branch:{ gene:'Hyperdiploid status (>50 chromosomes)', class:'driver', ccf:'25–35% of pediatric B-ALL (definitions vary by chromosome-count cutoff used), under 5% of adult B-ALL (3% in the UKALL14 trial cohort, PMID 34657128); CNS involvement is 5% (77/1,508) in one large adult cohort, rising to 9–9.6% in T-lineage disease specifically (PMID 16556888, PMID 19828704)', note:'This branch pair is DEFINITIONALLY mutually exclusive — a karyotype cannot simultaneously carry more than 50 and fewer than 44 chromosomes, a stronger exclusivity than any gene-pair elsewhere in this atlas. Hyperdiploidy\'s favorable prognosis is mechanistically explained by SLC19A1 gene-dosage effects on folate/methotrexate transport (chromosome 21q22.3, PMID 36266323). No site-specific hyperdiploidy-to-CNS association was located for this pass; the CNS figures above describe this cancer\'s own real rate generally, disclosed alongside this branch gene rather than asserted as mechanistically linked to it.' } },
  { id:'LT', name:'Testis', color:cssVar('--azure'), pos3d:{x:1.3,y:0.6,z:-0.4},
    branch:{ gene:'Hyperdiploid status (>50 chromosomes)', class:'driver', ccf:'same status as this cancer’s own Central nervous system site; testicular involvement occurs in 1.1–2.4% of boys at diagnosis, "very rare in adults," with relapse risk 2% or less on modern chemotherapy regimens (Nguyen et al., Cancer, 2021, PMID 34031876)', note:'Same branch status as this cancer\'s own Central nervous system site. The testis was "long considered a pharmacologic sanctuary site... presumably because of the blood–testis barrier" (Nguyen et al., 2021, verbatim, adapted from plural) — the same real sanctuary-site mechanism CNS-directed prophylactic therapy in this cancer addresses.' } },
  { id:'LM', name:'Mediastinum', color:cssVar('--amber'), pos3d:{x:0.4,y:-1.3,z:0.6},
    branch:{ gene:'Low-hypodiploid status (32–39 chromosomes)', class:'driver', ccf:'91.2% of pediatric low-hypodiploid B-ALL carries a TP53 alteration, with 43.3% of those cases carrying it in non-tumor cells too — a real, disclosed germline (Li-Fraumeni-associated) signal not observed in this study\'s own small adult sample (Holmfeldt et al., Nat Genet, 2013, PMID 23334668); mediastinal involvement occurs in 35.8% (29/81) of adult T-lineage disease in one South Korean multicenter cohort (PMID 41388921)', note:'This is a T-lineage-predominant site (a real bulky mediastinal/thymic mass is classically a T-ALL presentation), while low-hypodiploid status is a B-ALL ploidy category — the two are disclosed together as this branch\'s own real facts, not asserted as mechanistically linked. The mediastinal figure comes from one modest-sized (n=81), single-region cohort — a real, disclosed limitation, not a settled universal rate. A DEFINITIONAL COMPLICATION disclosed rather than smoothed over: "masked hypodiploidy" — a hypodiploid clone can duplicate its whole genome, presenting in the hyperdiploid chromosome-count RANGE on standard karyotyping while remaining biologically and prognostically hypodiploid; WHO-HAEM5 classification in ambiguous cases relies on SNP-array/loss-of-heterozygosity analysis, not chromosome counting alone.' } },
  { id:'LS', name:'Spleen', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.9,z:-0.6},
    branch:{ gene:'Low-hypodiploid status (32–39 chromosomes)', class:'driver', ccf:'same status as this cancer’s own Mediastinum site; splenomegaly occurs in 28.4% (23/81) of the same adult T-lineage cohort (PMID 41388921)', note:'Same branch status and same single-cohort disclosure as this cancer\'s own Mediastinum site. Near-haploid ALL (24–31 chromosomes) is mechanistically distinct from low-hypodiploid — 70.6% carry RAS/receptor-tyrosine-kinase pathway activation (NF1 loss in 44.1%) rather than TP53 alteration (only 8.8% carry a RAS-pathway alteration in low-hypodiploid disease) — disclosed here rather than modeled as a third ploidy category, since this schema\'s branch slots hold two.' } },
];
const PRIVATE_POOL_ALL = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, the same passenger this atlas\'s other entries already model. This cancer\'s real genomic landscape is concentrated at the trunk and branch level — a taxonomy of largely mutually-exclusive, whole-clone founding lesions (ETV6-RUNX1, BCR-ABL1, KMT2A rearrangement, and the hyperdiploid/hypodiploid ploidy split) rather than a set of independent, site-restricted cooperating mutations — so no further driver gene is drawn into a shared pool here.' },
];
const HISTOLOGY_ALL = {
  intro: 'Lymphoblasts show a high nuclear-to-cytoplasmic ratio with scant cytoplasm (StatPearls, "Acute Lymphoblastic Leukemia," NCBI Bookshelf NBK611988; Chiaretti, Zini & Bassan, Mediterr J Hematol Infect Dis, 2014, PMID 25408859) and CONDENSED chromatin — a real, deliberate contrast with acute myeloid leukemia\'s own open, "fine" chromatin, drawn distinctly rather than reused from that entry\'s own morphology. Diagnosis requires 20% or more lymphoblasts in the bone marrow or peripheral blood (StatPearls, citing the WHO 2016 classification revision). B-lineage blasts typically express CD10, CD19 and TdT; T-lineage blasts express CD2, CD3 and CD7 (StatPearls, verbatim) — immunophenotype, not something a stylized illustration can show, but the real basis for how the two lineages are actually distinguished in practice.',
  ariaSummary: 'Stylized microscopic field: a dense, uniform sheet of small, round cells with a very high nuclear-to-cytoplasmic ratio — almost no visible cytoplasm — and densely packed, dark, condensed chromatin, molded tightly against neighboring cells.',
  citation: 'StatPearls, "Acute Lymphoblastic Leukemia," NCBI Bookshelf NBK611988; Chiaretti, Zini & Bassan, Mediterr J Hematol Infect Dis, 2014 (PMID 25408859).',
  features: [
    { key:'lymphoblasts', label:'Lymphoblast sheet',
      text:'A dense, uniform population of small, round blasts with scant, barely-visible cytoplasm — the defining low-power impression of this cancer, and the real basis of its own high nuclear-to-cytoplasmic ratio.' },
    { key:'condensedchromatin', label:'Condensed chromatin',
      text:'Densely packed, dark nuclear chromatin — a real, deliberate contrast with acute myeloid leukemia\'s own open, finely dispersed chromatin, and one of the few morphologic clues separating the two at a glance, though definitive diagnosis rests on immunophenotyping, not morphology alone.' },
  ],
};

export const cancerDetails = {
  aml: {
    title:'Acute Myeloid Leukemia', screenLabel:'Acute myeloid leukemia — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — systemic marrow disease, not a nodal-station pattern)',
    regions:REGIONS_AML, trunk:TRUNK_AML, privatePool:PRIVATE_POOL_AML,
    histology: HISTOLOGY_AML,
  },
  apl: {
    title:'Acute Promyelocytic Leukemia', screenLabel:'Acute promyelocytic leukemia — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — genuinely rare in this cancer; see this cancer’s own trunk note)',
    regions:REGIONS_APL, trunk:TRUNK_APL, privatePool:PRIVATE_POOL_APL,
    histology: HISTOLOGY_APL,
  },
  cml: {
    title:'Chronic Myeloid Leukemia', screenLabel:'Chronic myeloid leukemia — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — genuinely rare, documented mainly through case reports; see this cancer’s own site notes)',
    regions:REGIONS_CML, trunk:TRUNK_CML, privatePool:PRIVATE_POOL_CML,
    histology: HISTOLOGY_CML,
  },
  mds: {
    title:'Myelodysplastic Neoplasm', screenLabel:'Myelodysplastic neoplasm — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — thoroughly absent from the population-level literature; see this cancer’s own site notes)',
    regions:REGIONS_MDS, trunk:TRUNK_MDS, privatePool:PRIVATE_POOL_MDS,
    histology: HISTOLOGY_MDS,
  },
  et: {
    title:'Essential Thrombocythemia', screenLabel:'Essential thrombocythemia — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — a real feature of this cancer\'s own progression endpoint, not of uncomplicated disease; see this cancer\'s own site notes)',
    regions:REGIONS_ET, trunk:TRUNK_ET, privatePool:PRIVATE_POOL_ET,
    histology: HISTOLOGY_ET,
  },
  pv: {
    title:'Polycythemia Vera', screenLabel:'Polycythemia vera — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — a real feature of this cancer\'s own progression endpoint, not of uncomplicated disease; see this cancer\'s own site notes)',
    regions:REGIONS_PV, trunk:TRUNK_PV, privatePool:PRIVATE_POOL_PV,
    histology: HISTOLOGY_PV,
  },
  pmf: {
    title:'Primary Myelofibrosis', screenLabel:'Primary myelofibrosis — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — a real, molecularly-confirmed feature of this cancer specifically)',
    regions:REGIONS_PMF, trunk:TRUNK_PMF, privatePool:PRIVATE_POOL_PMF,
    histology: HISTOLOGY_PMF,
  },
  mm: {
    title:'Multiple Myeloma', screenLabel:'Multiple myeloma — tumor explorer',
    legendTitle:'Sites (extramedullary and paraskeletal involvement — two mechanistically distinct patterns, disclosed separately)',
    regions:REGIONS_MM, trunk:TRUNK_MM, privatePool:PRIVATE_POOL_MM,
    histology: HISTOLOGY_MM,
  },
  cll: {
    title:'Chronic Lymphocytic Leukemia', screenLabel:'Chronic lymphocytic leukemia / small lymphocytic lymphoma — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — the same staging-relevant findings this cancer shares with its nodal-presenting form, SLL)',
    regions:REGIONS_CLL, trunk:TRUNK_CLL, privatePool:PRIVATE_POOL_CLL,
    histology: HISTOLOGY_CLL,
  },
  all: {
    title:'Acute Lymphoblastic Leukemia', screenLabel:'Acute lymphoblastic leukemia — tumor explorer',
    legendTitle:'Sites (extramedullary involvement — real, disclosed sanctuary and T-lineage-associated sites)',
    regions:REGIONS_ALL, trunk:TRUNK_ALL, privatePool:PRIVATE_POOL_ALL,
    histology: HISTOLOGY_ALL,
  },
};
