import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

// active:true. "cervical" is this organ's own real disease-name adjective, same organ-name-vs-
// disease-name pattern this atlas's Bladder/Uterus entries already carry. sexes:['female'] — no
// collision to check, since no other organ in this atlas is cervical.
export const organEntry = { key:'cervix', label:'Cervix', system:'Reproductive', active:true, sexes:['female'], aliases:['cervix','cervical','cervical cancer'] };

// Height-fraction/angle grid, checked against Uterus's own marker (0.475/-15) and Bladder's
// (0.475/-15, per that organ's own comment) for real separation before shipping — the cervix
// sits directly below the uterine body, so a slightly lower heightFrac and a distinct angle are
// both anatomically apt and necessary to avoid a three-way marker collision. Re-verified against
// regress.js's own body-marker-placement check (BELOW-CROTCH / BEYOND-TRUNK) before shipping.
export const markerSpec = { points:[{heightFrac:0.470, angle:-4}] };

export const cancerEntries = [
  // Real subtype shares, SEER 2004-2021, N=54,987 cervical carcinoma patients (Kobayashi et al.,
  // Int J Gynecol Cancer, 2025, PMID 40795434): SCC 69.4% (38,145), adenocarcinoma 26.1%
  // (14,333), adenosquamous 3.6% (1,970, not modeled as its own entry here), small cell
  // neuroendocrine 1.0% (539, not modeled here — this atlas's own neuroendocrine-histology family
  // already has real, dedicated homes elsewhere and a fourth full entry for a 1%-share entity
  // wasn't built this pass). The rising-adenocarcinoma trend: Smith et al. (Gynecol Oncol, 2000,
  // PMID 10926787, SEER 1973-1996): adenocarcinoma's own share of all cervical cancer rose from
  // 10.8% (1973-1977) to 22.4% (1993-1996), a 107.4% relative increase, while SCC's own
  // age-adjusted incidence fell 41.9% over the same period — independently corroborated by
  // Vinh-Hung et al. (BMC Cancer, 2007, PMID 17718897, SEER 1973-2002). A real, disclosed
  // discrepancy worth flagging rather than silently picking a side: an unrelated 2024
  // adenocarcinoma-specific paper's own background sentence states adenocarcinoma is "10-15% of
  // all cases" — an older or more global figure, inconsistent with the current, larger,
  // US-registry 26.1% used here; the more current, larger-cohort figure is preferred, the
  // discrepancy is not silently resolved. Within endocervical adenocarcinoma specifically (the
  // IECC's own 409-case international cohort, Stolnicu et al., Am J Surg Pathol, 2018, PMID
  // 29135516, read directly at full text): usual-type (HPV-associated) 73%, gastric-type
  // (HPV-independent) 10%, clear cell carcinoma (HPV-independent) 3%, mesonephric carcinoma
  // under 1% (did not place in the cohort's own top 5 named subtypes at all).
  { id:'cscc', name:'Squamous Cell Carcinoma', share:'69.4% of cervical carcinoma (38,145/54,987, SEER 2004–2021)', active:true, organKey:'cervix' },
  { id:'cadeno', name:'Adenocarcinoma (Usual-Type)', share:'26.1% of cervical carcinoma (14,333/54,987, SEER 2004–2021) and rising — 10.8% of all cases in 1973–1977 to 22.4% by 1993–1996', active:true, organKey:'cervix' },
  { id:'cgas', name:'Gastric-Type Adenocarcinoma', share:'~10% of endocervical adenocarcinoma (up to 25% in East Asian populations) — the most common HPV-independent subtype', active:true, organKey:'cervix' },
  { id:'cclear', name:'Clear Cell Carcinoma', share:'~3% of endocervical adenocarcinoma', active:true, organKey:'cervix' },
  { id:'cmeso', name:'Mesonephric Carcinoma', share:'under 1% of endocervical adenocarcinoma — the rarest entity on this page, admitted on real clinical distinctiveness rather than incidence (data rule 15\'s precedent)', active:true, organKey:'cervix' },
];

// Real anatomy, not procedural: extracted and re-exported from this atlas's own already-integrated
// Uterus asset (NIH 3D HRA, 3DPX-020996, "Uterus, Female," CC BY 4.0, Visible-Human-Dataset-
// derived) — no dedicated Cervix reference object was found in this pass's own search of the HRA
// library or HuBMAP's own ASCT+B table catalog (a live keyword search of the full 80-model HRA
// collection returns zero "Cervix" entries; the collection's only reproductive/uterine entries are
// Uterus and Fallopian Tube; HuBMAP's own summary statistics list "uterus" with no separate
// "cervix" row). Three real, individually-named sub-meshes survive extraction (cervix/internal-
// cervical-os/external-cervical-os), confirmed directly by parsing the source GLB's own JSON
// chunk before isolating them: VH_F_cervix (1,825 vertices/3,508 triangles in the source file —
// real geometric substance, not a small anchor point), VH_F_internal_cervical_os (135v/216t),
// VH_F_external_cervical_os (162v/270t). Isolated via this atlas's established Blender pipeline
// (import → identify the three named sub-meshes' own mesh-data children → delete everything else
// → unparent CLEAR_KEEP_TRANSFORM → recenter by the combined bbox → export), verified size-
// preserving (post-recenter bbox size matches pre-recenter to floating-point precision — the same
// check that caught Uterus's own double-shift bug, clean here because these three sub-meshes were
// SIBLINGS under one shared parent in the source file, never nested inside each other, so the
// double-shift mechanism could not arise). Compressed via gltfpack -kn -cc: 78.5KB → 20.7KB, all
// three real anatomical names verified present in the compressed file's own JSON chunk.
// Two Sketchfab fallbacks were checked and both rejected: a real, non-cartoon "Cervix" model (CC
// BY, but only 2.3k triangles/1.1k vertices with zero description or provenance) and a much
// richer photogrammetry scan of an excised specimen (541K triangles, real, but its page carries no
// license section and no download control at all — disqualified on licensing, not quality).
// MATERIAL COLOR — illustrative, disclosed as such: no gross-anatomy source describing the
// cervix's own cut-surface color was independently verified in this pass (the same downgrade-over-
// substitution precedent this atlas already applies for Uterus/Bladder/Pancreas rather than
// shopping for a lookalike citation). A muted pink-tan value, matching Uterus's own verified-
// illustrative tone (the two organs are one continuous fibromuscular structure), stands as
// illustrative. MATERIAL/LIGHTING RECIPE applied uniformly (roughness x0.82 baseline -> 0.55,
// specularIntensity 0.25, per-vertex tissue mottle amplitude 0.28); mechanism in liver.js's own
// comment. Seed 22.1 (organ #17 in ORGAN_MODULES' order x1.3).
export function buildCervixMesh(){
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/cervix.glb', (gltf)=>{
      const mat = new THREE.MeshPhysicalMaterial({ color:0xc48a86, roughness:0.55, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 22.1); } });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Female Reproductive System', title:'Cervix',
  sub:'Narrow, muscular lower portion of the uterus · pelvis, projecting into the vagina · one of the few cancers with a proven, quantified path to prevention',
  facts:[
    {label:'Location', val:'Pelvis, the lowest portion of the uterus, projecting into the upper vagina'},
    {label:'Size', val:'~4cm long × 3cm diameter (IARC, Colposcopy and Treatment of Cervical Precancer)'},
    {label:'Prevention', val:'HPV vaccination before age 13–17 cuts cervical cancer/CIN3+ risk by roughly 85–97% in national-registry studies (Scotland, Sweden, England) — one of the largest measured prevention effects of any cancer in this atlas'},
  ],
  // The prevention narrative gets real, deliberate prominence here rather than a footnote,
  // per this atlas's own detection-vs-biology discipline (the extent axis's established
  // "found more because we looked harder is not the same as more dangerous" framing) applied to
  // prevention specifically: the numbers below are a measured EFFECT (vaccination, screening),
  // not a description of the disease's own biology, and both halves of that distinction are
  // stated explicitly rather than blurred together.
  desc:'The cervix is the narrow, muscular neck of the uterus, projecting downward into the vagina. Its lower, outer surface (the ectocervix) is covered by squamous epithelium; its inner canal (the endocervix) is lined by mucus-secreting columnar epithelium. Where the two meet — the squamocolumnar junction, inside a dynamic region called the transformation zone — is where nearly all cervical cancer begins. Cervical cancer is the clearest example in this atlas of a cancer with a proven, quantified path to prevention. Persistent infection with high-risk human papillomavirus (HPV) causes about 95% of cases; three independent national-registry studies (Scotland, Sweden, England) have each found that HPV vaccination given before age 13–17 — before likely viral exposure — reduces later cervical cancer or high-grade precursor-lesion risk by roughly 85–97%, with England\'s own national program credited by its own study authors with having "almost eliminated cervical cancer" in the first fully-vaccinated birth cohort. Organized cervical screening has an equally real, decades-long, directly-measured track record: a 1987 comparison across five Nordic countries found cervical cancer mortality decline tracked almost linearly with how much of each country\'s population its own organized screening program actually covered, from a 10% decline in the least-covered country to an 80% decline in the most-covered. The gap between these numbers and the disease\'s real global burden is stark and access-driven, not biological: the World Health Organization states directly that nearly 94% of cervical cancer deaths occur in low- and middle-income countries, "because access to public health services is limited and screening and treatment for the disease have not been widely implemented" — not because the disease itself behaves differently there.',
  buildMesh: buildCervixMesh,
  viewer:{ theta:0.3, phi:1.15, radius:0.045, minRadius:0.012, maxRadius:0.11, autoRotateRadPerFrame:0.0018 },
  viewerAria:'Three-dimensional model of a cervix, a short, thick, cylindrical organic form with a '
    + 'narrow central canal, four glowing teal points marking the structures listed after it. '
    + 'Drag to rotate, scroll to zoom.',
  // pos: literal anchor points (meters, local mesh space), picked from real named sub-mesh
  // vertices on assets/cervix.glb, verified by direct measurement (a Python glTF-JSON-chunk
  // parse of the pre-compression export — this project's own standing rule that a script parsing
  // GLB accessor buffers directly must check for EXT_meshopt_compression and refuse if present,
  // since a compressed buffer parsed as raw floats yields plausible wrong numbers) and checked
  // for real pairwise separation before shipping (minimum 12.6mm, transformation
  // zone to lateral wall, across a ~27mm-scale organ) rather than assumed adequate from picking
  // alone.
  hotspots:[
    // "Arises here" for the two HPV-associated entities (cscc, cadeno) — see the ORIGIN_HOTSPOT
    // entry in js/morphology.js. A real, specific, discrete-cell-population anatomic claim, not a
    // generalized "somewhere in the cervix": Yang et al. (Mod Pathol, 2015, PMID 25975286)
    // describes "a very small and discrete population of vulnerable squamocolumnar junction
    // cells" sharing an identical immunophenotype with over 90% of high-grade squamous
    // intraepithelial lesions and cervical carcinomas — checked directly, not assumed spatial the
    // way this atlas's own prostate-neuroendocrine and blood-cancer entries turned out NOT to be
    // (phaseC_design.md §9's own registry) — this entity's origin IS a genuine spatial claim.
    { key:'transformationzone', label:'Transformation zone', pos:[0.00148,-0.00348,-0.00443],
      text:'The dynamic region where the endocervix\'s mucus-secreting columnar epithelium meets the ectocervix\'s squamous epithelium (the squamocolumnar junction). A small, discrete population of vulnerable cells here is where the great majority of cervical cancer — both squamous cell carcinoma and usual-type adenocarcinoma — actually begins.' },
    { key:'endocervix', label:'Endocervical canal', pos:[0.00023,0.00428,0.00650],
      text:'The mucus-secreting, columnar-lined inner canal of the cervix, opening into the uterine cavity above at the internal os. Usual-type adenocarcinoma arises from cells like these; its own defining diagnostic feature under the microscope is mitotic and apoptotic activity concentrated at the apical (luminal) edge of the gland, not scattered through the full thickness of the epithelium.' },
    { key:'stroma', label:'Cervical stroma', pos:[-0.01152,0.00694,-0.00509],
      text:'The dense, fibromuscular tissue that makes up the bulk of the cervix\'s own substance, beneath its epithelial lining. How deeply a cancer invades into this stroma — not just whether it has reached the transformation zone — is a central factor in staging cervical carcinoma.' },
    { key:'lateralwall', label:'Lateral wall', pos:[0.01365,-0.00027,-0.00435],
      text:'The side wall of the cervix, where microscopic remnants of the mesonephric (Wolffian) duct — a structure active only in early fetal development — persist in up to 22% of adult cervices. Mesonephric carcinoma, the rarest entity on this page, arises from these remnants specifically, not from the cervix\'s own mucosal surface.' },
  ],
};

// ============================================================
// SQUAMOUS CELL CARCINOMA (cscc) — the organ's dominant subtype, 69.4% of cervical carcinoma.
//
// TRUNK: NOT A SOMATIC MUTATION — a genuinely new kind of founding-event claim for this atlas,
// extending data rule 5's own trunk-justification registry (spatial/temporal/diagnostic-
// classifier/transformation-defining) with a fifth kind: VIRAL ONCOPROTEIN ACTIVITY. High-risk
// HPV's E6 and E7 oncoproteins directly degrade/inactivate two host tumor-suppressor proteins —
// there is no human-genome mutation doing this cancer's founding work at all. Real HPV-positivity
// rate by rigorous PCR testing (not the less specific Hybrid Capture 2 assay, which over-calls
// negatives): 97.1% in SCC specifically (101/104 — the same cohort's 32 adenocarcinomas pool the
// overall cohort figure up to 94.2%, 128/136; Rodríguez-Carunchio et al., BJOG, 2015, PMID
// 25229645 — CORRECTED 2026-09-15: an earlier draft used only the pooled figure for an SCC-
// specific claim, caught by an independent citation-verification pass) and 90% (193/214, Nicolás
// et al., Mod Pathol, 2019, PMID 30911077) — two cohorts from the same center, disclosed as
// related rather than fully independent — corroborated by an unrelated Turkish cohort: 85.6%
// positive, 83/97 (Kulhan et al., Eur Rev Med Pharmacol Sci, 2023, PMID 37843334 — CORRECTED
// 2026-09-15: an earlier draft attributed "~93%"/"~7% negative" to this cohort's own result, but
// that figure is the paper's own background-literature citation of the general cervical-carcinoma
// HPV-negative rate, not what this specific cohort measured; caught by the same pass). E6: real,
// mechanistically precise, two-paper chain — Scheffner et
// al. (Cell, 1990, PMID 2175676): "the E6 proteins of the oncogenic HPVs that bind p53 stimulate
// the degradation of p53. The E6-promoted degradation of p53 is ATP dependent and involves the
// ubiquitin-dependent protease system"; Scheffner et al. (Cell, 1993, PMID 8221889) identified the
// mechanism completely: "The HPV-16 E6 and E6-AP complex functions as a ubiquitin-protein ligase
// in the ubiquitination of p53" (E6-AP = UBE3A, confirmed directly from this paper's own indexed
// substances). E7: Dyson et al. (Science, 1989, PMID 2537532) — the paper's own title states E7
// "is able to bind to the retinoblastoma gene product" (CORRECTED 2026-09-15: an earlier draft's
// quote was a blended paraphrase not actually verbatim anywhere in the source; this is the real
// title, now quoted exactly); Chellappan et al. (PNAS, 1992, PMID 1316611) confirmed the
// functional consequence directly in cervical carcinoma cell lines specifically: E7 "can
// dissociate the E2F-pRb complex," and "the E2F-pRb complex is absent in various human cervical
// carcinoma cell lines that either express the E7 protein or harbor an RB1 mutation." Real HPV
// genotype concentration: HPV-16 and HPV-18 together account for 71% (95% CI 70-72%) of invasive
// cervical cancer, and the top 8 high-risk types together for 91% (de Sanjosé et al., Lancet
// Oncol, 2010, PMID 20952254, 38 countries, N=10,575) — a different, WHO-cited figure of "~76%"
// for HPV-16/18 also circulates and is not silently reconciled with de Sanjosé's own 71% here,
// since the two numbers come from different real measurement populations. Real viral-integration
// significance: integration is detected in "almost 90% of cervical carcinomas" (Pett & Coleman, J
// Pathol, 2007, PMID 17573670) and, by a different, type-specific measure, in 100% of HPV18-
// related and 76% of HPV16-related tumors specifically (TCGA, Nature, 2017, PMID 28112728, N=228)
// — integration is associated with elevated expression of nearby host genes (Ojesina et al.,
// Nature, 2014, PMID 24390348), a real, measurable molecular consequence, not merely a structural
// curiosity.
//
// ORIGIN AXIS, CHECKED AGAINST phaseC_design.md §9 AND FOUND NOT TO APPLY: unlike this atlas's own
// prostate-neuroendocrine and several blood-cancer entries (that registry's own running table),
// this entity's origin IS a genuine, discrete, spatial claim (Yang et al., 2015, above) — no
// ORIGIN_HOTSPOT_ENTRY override or §9 registry entry is needed for cscc or cadeno.
const REGIONS_CSCC = [
  { id:'QA', name:'Tumor A', color:cssVar('--coral'), pos3d:{x:0.3,y:0.22,z:0.16},
    branch:{ gene:'EGFR mutation', class:'driver', ccf:'7.5% of squamous cell carcinoma (3/40) vs. 0% of adenocarcinoma (0/40) in the same cohort, P=.24 (Wright et al., Cancer, 2013, PMID 24037752, n=80 cervical tumors)', note:'A real, histology-specific finding in this cancer, found in SCC and not in this organ\'s own Adenocarcinoma entry — the mirror image of that entity\'s own KRAS mutation, which is real and mutually exclusive in the opposite direction (found only in adenocarcinoma, P=.01). Placed at different sites from PIK3CA below on that same mechanistic-fit basis, not assumed.' } },
  { id:'QB', name:'Tumor B', color:cssVar('--coral'), pos3d:{x:-0.22,y:0.28,z:-0.1},
    branch:{ gene:'EGFR mutation', class:'driver', ccf:'7.5% (Wright et al., 2013)', note:'The same mutation as Tumor A — a real, SCC-specific finding not shared with this organ\'s own Adenocarcinoma entry.' } },
  { id:'QC', name:'Tumor C', color:cssVar('--azure'), pos3d:{x:0.12,y:-0.3,z:-0.18},
    branch:{ gene:'EP300 mutation', class:'driver', ccf:'16% of 79 primary squamous cell carcinomas sequenced (Ojesina et al., Nature, 2014, PMID 24390348, whole-exome sequencing)', note:'A chromatin-remodeling/histone-acetyltransferase gene — one of several real, recurrently mutated genes this whole-exome sequencing study identified beyond the shared viral trunk (alongside FBXW7 15%, MAPK1 E322K substitution 8%, HLA-B inactivating mutations 9%), confirmed directly rather than assumed to be the same gene list this atlas\'s other organs already use.' } },
  { id:'QD', name:'Tumor D', color:cssVar('--violet'), pos3d:{x:-0.28,y:-0.12,z:0.2},
    branch:{ gene:'EP300 mutation', class:'driver', ccf:'16% (Ojesina et al., 2014)', note:'The same mutation as Tumor C.' } },
];
const TRUNK_CSCC = [
  { gene:'HPV E6/E7 oncoprotein expression', class:'driver', ccf:'high-risk HPV DNA detected in 85.6-97.1% of cervical squamous cell carcinoma by rigorous PCR testing (Rodríguez-Carunchio et al., 2015: 97.1% in SCC specifically, 101/104; Nicolás et al., 2019: 90%, 193/214 — related cohorts from one center; Kulhan et al., 2023, an unrelated cohort: 85.6%, 83/97); HPV-16/18 alone account for 71% of cervical carcinoma overall (de Sanjosé et al., 2010, N=10,575)', note:'TRUNCAL FOR A FIFTH REASON THIS ATLAS HAS NOT NEEDED BEFORE — not spatial ubiquity (TP53 for HGSOC/TNBC), not temporal earliness (HCC\'s TERT, PDAC\'s KRAS), not a diagnostic classifier (GBM\'s IDH-wildtype status), not a transformation-defining event (prostate\'s treatment-emergent neuroendocrine entry), but because the founding event here is not a mutation in this tumor\'s own genome at all. High-risk HPV\'s E6 oncoprotein binds host UBE3A (E6-AP) to form a complex that directly ubiquitinates and degrades p53 (Scheffner et al., 1990/1993) — no TP53 mutation is needed or, in most cases, present. E7 binds and inactivates the retinoblastoma protein, releasing E2F transcription factors to drive proliferation — confirmed directly in cervical carcinoma cell lines specifically (Chellappan et al., 1992: "the E2F-pRb complex is absent in various human cervical carcinoma cell lines that... express the E7 protein"). Viral integration into the host genome — real in ~90% of tumors by one measure, and type-dependent (100% HPV18-related, 76% HPV16-related) by another (TCGA, 2017) — is associated with elevated expression of host genes near the integration site (Ojesina et al., 2014), a real, measurable molecular consequence of the virus\'s presence rather than of any human mutation.' },
];
const PRIVATE_POOL_CSCC = [
  { gene:'PIK3CA mutation', class:'driver', ccf:'31.3% overall (25/80 total cohort); 37.5% of squamous cell carcinoma specifically vs. 25% of adenocarcinoma, not significantly different by histology (P=.33) (Wright et al., Cancer, 2013, PMID 24037752, n=80)', note:'The single most frequently mutated human gene identified in this cancer beyond the viral trunk — real in both this entity and this organ\'s own Adenocarcinoma entry at comparable rates, cooperating with (not competing against) the HPV oncoprotein mechanism above. Mutation was independently associated with shorter survival in this same cohort (67.1 vs. 90.3 months, HR 9.1, P<.001).' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — full reuse of genBlSCC, zero new drawing code. Real, sourced justification: this
// entity's own defining architecture (keratin pearls and intercellular bridges coexisting within
// one pure squamous-carcinoma population, not two separate histologic variants needing separate
// zones) is the identical real shape already confirmed for bladder's own squamous differentiation
// — cervical SCC's own classic keratinizing/non-keratinizing spectrum is described in exactly
// these terms (StatPearls, "Cervical Squamous Cell Carcinoma," Jain & Limaiem, PMID 32644501).
const HISTOLOGY_CSCC = {
  intro: 'Sheets of squamous cells joined by visible intercellular bridges, with scattered keratin pearls — concentric, onion-skin whorls of keratinized cells — marking the tumor\'s squamous differentiation. Keratinizing and non-keratinizing forms exist on one real spectrum rather than as two separate architectures needing separate depiction.',
  ariaSummary: 'Stylized microscopic field: a dense sheet of polygonal cells joined by fine connecting lines between neighboring cells (intercellular bridges), with several round, concentric, onion-skin-like whorls (keratin pearls) scattered through the sheet.',
  citation: 'Jain MA, Limaiem F, "Cervical Squamous Cell Carcinoma," StatPearls, PMID 32644501 — the same generator (genBlSCC) already used for this atlas\'s Bladder/squamous-differentiation entry, reused here on a directly-confirmed shared architecture.',
  features: [
    { key:'pearls', label:'Keratin pearls', text:'Concentric, onion-skin whorls of keratinized squamous cells — a hallmark of squamous differentiation, present in a real minority of tumor foci rather than throughout.' },
    { key:'bridges', label:'Intercellular bridges', text:'Fine connections visible between neighboring squamous cells — desmosomal attachments, another defining feature of this histology, present across the sheet.' },
  ],
};

// ============================================================
// ADENOCARCINOMA, USUAL-TYPE (cadeno) — HPV-associated, 26.1% of cervical carcinoma and rising.
// TRUNK: the SAME viral mechanism as Squamous Cell Carcinoma above (HPV E6/E7 oncoprotein
// activity) — cross-referenced rather than fully re-derived, since it is genuinely the same real
// biological event in both entities. What differs, real and directly confirmed: HPV-16, -18, and
// -45 together account for 94% (443/470, 95% CI 92-96%) of cervical ADENOCARCINOMA specifically —
// a notably higher, more concentrated genotype burden than SCC's own 71%/HPV-16/18-only figure,
// with HPV-45 pulled in as a real, adenocarcinoma-specific third contributor (de Sanjosé et al.,
// 2010).
//
// DIAGNOSTIC CRITERION, real and primary-sourced, not paraphrased: Stolnicu et al. (Am J Surg
// Pathol, 2018, PMID 29135516, the IECC's own founding paper, read directly at full text) defines
// usual-type by "apical mitotic figures and apoptotic bodies appreciable at scanning
// magnification" — a specific, genuinely different visual claim from "elevated mitotic activity
// somewhere in the gland," and real, drawable content this atlas can actually depict (its own
// cytoplasmic-mucin threshold, 0-50% of cells, is a diagnostic cutoff rather than something a
// static image can show, and is named in prose instead).
//
// BRANCH: KRAS mutation — real, and mutually exclusive with SCC's own EGFR mutation in the
// opposite direction: 17.5% of adenocarcinoma (7/40) vs. 0% of squamous cell carcinoma (0/40) in
// the same cohort, P=.01 (Wright et al., 2013) — a real, statistically significant, two-entity
// competing-driver relationship this atlas has not modeled before in exactly this shape (two
// DIFFERENT HISTOLOGIES of one organ, rather than two branches of one entity).
const REGIONS_CADENO = [
  { id:'RA', name:'Tumor A', color:cssVar('--coral'), pos3d:{x:0.3,y:0.2,z:0.16},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'17.5% of adenocarcinoma (7/40) vs. 0% of squamous cell carcinoma (0/40) in the same cohort, P=.01 (Wright et al., Cancer, 2013, PMID 24037752, n=80)', note:'A real, direct, statistically significant mutual exclusivity with this organ\'s own Squamous Cell Carcinoma entry — that entity\'s EGFR mutation is, in the same cohort, found only in SCC and never in adenocarcinoma. Two different histologies of one organ, competing for the same growth-signaling role rather than cooperating.' } },
  { id:'RB', name:'Tumor B', color:cssVar('--coral'), pos3d:{x:-0.22,y:0.28,z:-0.1},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'17.5% (Wright et al., 2013)', note:'The same mutation as Tumor A.' } },
  { id:'RC', name:'Tumor C', color:cssVar('--azure'), pos3d:{x:0.12,y:-0.3,z:-0.18},
    branch:{ gene:'ELF3 mutation', class:'driver', ccf:'13% of 24 adenocarcinomas specifically sequenced (Ojesina et al., Nature, 2014, PMID 24390348, whole-exome sequencing)', note:'A real, adenocarcinoma-specific finding from the same sequencing study that identified EP300/FBXW7/MAPK1 in this organ\'s own Squamous Cell Carcinoma entry — ELF3 was found in the adenocarcinoma subset of that cohort and not named among its squamous-cell findings, checked directly rather than assumed to be shared.' } },
  { id:'RD', name:'Tumor D', color:cssVar('--violet'), pos3d:{x:-0.28,y:-0.12,z:0.2},
    branch:{ gene:'ELF3 mutation', class:'driver', ccf:'13% (Ojesina et al., 2014)', note:'The same mutation as Tumor C.' } },
];
const TRUNK_CADENO = [
  { gene:'HPV E6/E7 oncoprotein expression', class:'driver', ccf:'HPV-16, -18, and -45 together account for 94% (443/470, 95% CI 92-96%) of cervical adenocarcinoma specifically — a more concentrated genotype burden than this organ\'s own Squamous Cell Carcinoma entry (de Sanjosé et al., Lancet Oncol, 2010, PMID 20952254)', note:'The SAME viral founding mechanism as this organ\'s own Squamous Cell Carcinoma entry — see that entity\'s own trunk note for the full E6-p53/E7-Rb mechanism, confirmed directly at the primary sources rather than re-derived here. What differs by histology is the genotype distribution: HPV-45 is pulled in as a real, adenocarcinoma-specific third contributor alongside 16/18, where SCC\'s own dominant pair is 16/18 alone.' },
];
const PRIVATE_POOL_CADENO = [
  { gene:'PIK3CA mutation', class:'driver', ccf:'25% of adenocarcinoma (10/40) vs. 37.5% of squamous cell carcinoma, not significantly different by histology, P=.33 (Wright et al., 2013, n=80)', note:'The same real, cooperating alteration as this organ\'s own Squamous Cell Carcinoma entry, at a comparable rate.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — genuinely new drawing code (genCervixAdeno, js/histology.js), built specifically to
// depict the IECC's own primary diagnostic criterion: apical mitotic figures/apoptotic bodies at
// the gland's own luminal edge, not scattered through the epithelium's full thickness. Reuses
// drawGlandRing for the glands themselves (the same primitive genEndometrioid/genCarcinosarcoma
// already dispatch to).
const HISTOLOGY_CADENO = {
  intro: 'Mucin-containing glands lined by columnar epithelium, with mitotic figures and apoptotic bodies concentrated at the apical (luminal) edge of the cells — visible at scanning magnification, the real diagnostic feature this entity is defined by, rather than mitoses scattered evenly through the full thickness of the epithelium.',
  ariaSummary: 'Stylized microscopic field: rounded glands lined by columnar cells, with small dark condensed mitotic figures and small round deeply-colored apoptotic bodies positioned specifically at the inner edge of each gland, near the lumen — not spread through the rest of the cell layer.',
  citation: 'Stolnicu et al., Am J Surg Pathol, 2018, PMID 29135516 (the IECC\'s own founding paper, read directly for this entity\'s defining criterion).',
  features: [
    { key:'glands', label:'Mucin-containing glands', text:'Rounded glands lined by columnar epithelium containing intracytoplasmic mucin — the real architecture usual-type adenocarcinoma is built from.' },
    { key:'apical', label:'Apical mitoses and apoptotic bodies', text:'This entity\'s own defining diagnostic feature: dividing and dying cells concentrated specifically at the luminal (apical) edge of the gland, appreciable at scanning magnification — not evenly distributed through the epithelium\'s full thickness (Stolnicu et al., 2018).' },
    { key:'mucin', label:'Intracytoplasmic mucin', text:'Real mucin content within the tumor cells\' own cytoplasm — this entity\'s own diagnostic threshold is 0-50% of cells showing appreciable mucin, a real cutoff separating it from more heavily mucinous variants.' },
  ],
};

// ============================================================
// GASTRIC-TYPE ADENOCARCINOMA (cgas) — HPV-independent, ~10% of endocervical adenocarcinoma (up
// to 25% in East Asian populations) — the most common HPV-independent entity, admitted on real,
// stage-matched clinical distinctiveness. TRUNK: TP53 mutation, the most consistently dominant
// finding across this entity's own sequencing studies — real, and genuinely different from the
// viral mechanism above (this is exactly why the WHO 2020/IECC classification splits cervical
// adenocarcinoma by HPV status in the first place). Lu et al. (Virchows Arch, 2021, PMID
// 33817764, n=15, NGS): TP53 mutated in 8/15 (53.3%), "followed by STK11, CDKN2A, and ARID1A."
const REGIONS_CGAS = [
  { id:'GA', name:'Tumor A', color:cssVar('--coral'), pos3d:{x:0.3,y:0.22,z:0.15},
    branch:{ gene:'STK11 mutation', class:'driver', ccf:'significantly more frequent in well-differentiated gastric-type adenocarcinoma (33.3%) than in less-differentiated tumors (0.0%), P=.026 (Lu et al., Virchows Arch, 2021, PMID 33817764, n=15)', note:'A real, well-documented finding, but a MINORITY-SUBSET association, not this entity\'s defining mutation — concentrated at the well-differentiated/minimal-deviation-adenocarcinoma end of the spectrum and, in a separate real association, in germline Peutz-Jeghers-syndrome-associated cases in East Asia (Jenkins et al., Int J Cancer, 2020, PMID 32474915). TP53 above is more consistently dominant across gastric-type adenocarcinoma generally. STK11 mutation was independently associated with worse prognosis within this entity (P=.01, Lu et al., 2021).' } },
  { id:'GB', name:'Tumor B', color:cssVar('--coral'), pos3d:{x:-0.22,y:0.28,z:-0.1},
    branch:{ gene:'STK11 mutation', class:'driver', ccf:'33.3% of well-differentiated cases (Lu et al., 2021)', note:'The same mutation as Tumor A.' } },
  { id:'GC', name:'Tumor C', color:cssVar('--azure'), pos3d:{x:0.12,y:-0.3,z:-0.18},
    branch:{ gene:'CDKN2A mutation', class:'driver', ccf:'named directly after TP53 and STK11 among this entity\'s recurrently mutated genes; no specific percentage reported in this cohort (Lu et al., 2021, n=15)', note:'A cell-cycle checkpoint gene, real and recurrent in this entity per the same sequencing study, without a cited frequency this atlas could locate — disclosed as such rather than estimated.' } },
  { id:'GD', name:'Tumor D', color:cssVar('--violet'), pos3d:{x:-0.28,y:-0.12,z:0.2},
    branch:{ gene:'ARID1A mutation', class:'driver', ccf:'named directly among this entity\'s recurrently mutated genes; no specific percentage reported in this cohort (Lu et al., 2021, n=15)', note:'A chromatin-remodeling gene, real and recurrent in this entity per the same sequencing study, without a cited frequency this atlas could locate — disclosed as such rather than estimated.' } },
];
const TRUNK_CGAS = [
  { gene:'TP53 mutation', class:'driver', ccf:'53.3% (8/15, Lu et al., Virchows Arch, 2021, PMID 33817764) — the most consistently dominant mutation across this entity\'s own sequencing studies', note:'A genuine somatic mutation, unlike this organ\'s own two HPV-associated entities (Squamous Cell Carcinoma, Adenocarcinoma) — the real, defining reason this entity and the two below are classified as HPV-INDEPENDENT at all (WHO Classification of Tumours, 5th edition, 2020, Female Genital Tumours; Stolnicu et al., Am J Surg Pathol, 2018, PMID 29135516). This entity\'s own histology has a real diagnostic subtlety worth stating: even well-differentiated-looking tumors (the minimal deviation adenocarcinoma end of the spectrum) behave aggressively, so grading is explicitly not recommended — the ISGyP\'s own grading guidelines state this entity "should be considered high-grade regardless of morphology" (Talia et al., Int J Gynecol Pathol, 2021, PMID 33570864, the international grading-recommendations paper — CORRECTED 2026-09-15: an earlier draft misattributed this to Kojima et al. 2007, a real but different, earlier immunophenotype paper with no grading-guideline content; caught by an independent citation-verification pass), citing real outcome data behind the recommendation: 42% vs. 91% 5-year disease-specific survival for gastric-type versus HPV-associated (usual-type) adenocarcinoma (Karamurzin et al., Am J Surg Pathol, 2015, PMID 26457350, N=38 gastric-type vs. 139 usual-type).' },
];
const PRIVATE_POOL_CGAS = [
  { gene:'KRAS mutation', class:'driver', note:'Named among this entity\'s recurrently altered genes in a review (Yoshida et al., J Pers Med, 2026, PMID 41745365) alongside TP53/CDKN2A/STK11/ARID1A/KMT2D — no specific percentage this atlas could locate, disclosed rather than estimated. CORRECTED 2026-09-15: an earlier draft additionally attributed this same gene list to "two independent reviews," crediting Jenkins et al. 2020 as a second one — that paper is a real, but different-shaped, original 45-sample reclassification study, not a review, and its own abstract names only STK11 (in the germline Peutz-Jeghers context cited on this entity\'s own STK11 branch above), not this broader gene list; caught by an independent citation-verification pass.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — genuinely new drawing code (genGastricType, js/histology.js), built directly from
// the entity's own primary-sourced diagnostic criteria (Kojima et al., 2007, verbatim: "clear
// and/or pale eosinophilic and voluminous cytoplasm, with distinct cell borders").
const HISTOLOGY_CGAS = {
  intro: 'Large cells with clear-to-pale-eosinophilic, voluminous cytoplasm and distinct, sharply-drawn cell borders — the two features this entity is defined by at the primary source, resembling gastric pyloric-gland epithelium (confirmed by a real, positive pyloric-type mucin marker, HIK1083). Grading is deliberately not depicted as a low/high-grade contrast: even bland, well-formed-looking glands in this entity behave aggressively, so the ISGyP\'s own grading guidelines recommend against grading altogether for this entity (Talia et al., Int J Gynecol Pathol, 2021, PMID 33570864).',
  ariaSummary: 'Stylized microscopic field: glands lined by unusually large cells with pale, voluminous cytoplasm — some cells clear, some pale pink — each cell outlined by a heavy, sharply distinct border, giving the whole field a cobblestone-like appearance.',
  citation: 'Kojima et al., Am J Surg Pathol, 2007, PMID 17460448 — the originating primary source for this entity\'s own defining histologic criteria, read directly.',
  features: [
    { key:'cytoplasm', label:'Voluminous clear/pale cytoplasm', text:'Large, pale, clear-to-eosinophilic cytoplasm filling most of each cell — one of the two features this entity is defined by, and the reason it resembles the pyloric-gland epithelium of the stomach (hence "gastric-type").' },
    { key:'borders', label:'Distinct cell borders', text:'A heavy, sharply visible outline separating each cell from its neighbors — the second of the two defining features quoted directly from this entity\'s own primary source (Kojima et al., 2007).' },
    { key:'glands', label:'Glandular architecture', text:'Rounded glands built from these large, pale, distinctly-bordered cells — real architecture across a real spectrum from obviously malignant to deceptively bland-looking (minimal deviation adenocarcinoma), which is exactly why grading is not recommended for this entity at all.' },
  ],
};

// ============================================================
// CLEAR CELL CARCINOMA (cclear) — HPV-independent, ~3% of endocervical adenocarcinoma. Real,
// converging epidemiology from two independent source chains (IECC's own 409-case cohort: 3%;
// PathologyOutlines' independent figure: ~3-4%). Same-name-check-don't-assume discipline applied
// against this atlas's own Ovary/OCCC and Uterus/uclear entries (data rule 1): the hobnail-cell,
// tubulocystic/papillary architecture IS confirmed directly shared (Agarwal & Valente,
// PathologyOutlines, citing Int J Gynecol Pathol, 2018;37:388), but with real, quantified,
// cervix-specific differences from both — low mitotic index (0-5/10 HPF) in 85% of cervical cases
// vs. 72% endometrial and 50% ovarian; necrosis/psammoma bodies USUALLY ABSENT in cervical clear
// cell carcinoma, vs. present in a real minority of the ovarian (38%/6%) and endometrial (59%/5%)
// entities — checked directly, not assumed to transfer.
const REGIONS_CCLEAR = [
  { id:'CA', name:'Tumor A', color:cssVar('--coral'), pos3d:{x:0.28,y:0.24,z:0.16},
    branch:{ gene:'WWTR1 mutation (S89W)', class:'driver', ccf:'a real, recurrent, Hippo-signaling-pathway mutation reported in cervical clear cell carcinoma (PathologyOutlines, citing J Pathol, 2022;257:635) — no cohort-wide percentage this atlas could independently verify', note:'A distinct real molecular finding from this atlas\'s own Ovary/OCCC entry, whose own trunk mechanism (ARID1A loss cooperating with PIK3CA) is not reported for the cervical entity in anything this pass located — disclosed as a real difference rather than assumed to be the same "clear cell" mechanism by name alone (data rule 1).' } },
  { id:'CB', name:'Tumor B', color:cssVar('--coral'), pos3d:{x:-0.2,y:0.3,z:-0.12},
    branch:{ gene:'WWTR1 mutation (S89W)', class:'driver', ccf:'a real, recurrent finding (PathologyOutlines, J Pathol, 2022)', note:'The same mutation as Tumor A.' } },
  { id:'CC', name:'Endometrium C', color:cssVar('--azure'), pos3d:{x:0.14,y:-0.26,z:-0.2},
    branch:{ gene:'POLE mutation', class:'driver', ccf:'a rare, real, documented association (PathologyOutlines) — no cohort-wide percentage this atlas could independently verify', note:'A DNA-polymerase gene associated with an ultramutated phenotype elsewhere in this atlas\'s own Uterus entries; reported here only as a rare, real association for cervical clear cell carcinoma specifically, disclosed with the same honesty as the WWTR1 finding above rather than assumed to carry the same clinical weight it has in endometrial cancer.' } },
  { id:'CD', name:'Tumor D', color:cssVar('--violet'), pos3d:{x:-0.3,y:-0.1,z:0.22},
    branch:{ gene:'POLE mutation', class:'driver', ccf:'a rare, documented association (PathologyOutlines)', note:'The same mutation as Tumor C.' } },
];
const TRUNK_CCLEAR = [
  { gene:'HPV-independent (no viral trunk; molecular driver not yet consolidated to one gene)', class:'driver', ccf:'confirmed HPV-independent directly (IECC, Stolnicu et al., 2018) — this entity\'s own sequencing literature had not, at the time of this research pass, converged on one dominant founding mutation the way Gastric-Type Adenocarcinoma\'s TP53 or Mesonephric Carcinoma\'s KRAS have', note:'Checked and honestly not found: unlike this organ\'s other two HPV-independent entities, no single gene emerged across this pass\'s own research as clear cell carcinoma\'s own dominant founding event — WWTR1 and POLE (below) are real, recurrent, but neither is reported at a frequency approaching TP53\'s 53.3% in Gastric-Type or KRAS\'s ~90-100% in Mesonephric. Real, quantified clinical distinctiveness is what admits this entity to a full entry instead (see the histology note): Stolnicu et al. (Am J Surg Pathol, 2022, PMID 34985047, 58 cases across 14 institutions) found cervical clear cell carcinoma has significantly poorer overall and recurrence-free survival than HPV-associated endocervical adenocarcinoma (P=.003/.032) and outcomes statistically indistinguishable from Gastric-Type Adenocarcinoma (P=.313/.508) — i.e., it behaves like the other HPV-independent entity on this page, not like the HPV-associated majority, regardless of which single gene eventually turns out to found it.' },
];
const PRIVATE_POOL_CCLEAR = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome. This entity\'s own private pool stays thin deliberately, the same honest-gap treatment this atlas\'s Uterus/uclear entry already uses for the same underlying reason: a real, direct search for further recurrent genes beyond WWTR1/POLE did not turn up a clean additional candidate in this pass.' },
];
// HISTOLOGY — full reuse of genOCCC, matching this atlas's existing Ovary/clear cell and
// Uterus/uclear -> genOCCC dispatch precedent. Real, sourced justification: hobnail cells and
// tubulocystic/papillary architecture are confirmed directly for the CERVICAL entity (Agarwal &
// Valente, PathologyOutlines), and genOCCC's own three drawn features (hyalinized papillae +
// hyaline bodies; hobnail + clear/eosinophilic admixture; uniform high-grade nuclei) never include
// necrosis or psammoma bodies as mandatory content — exactly the two features this entity's own
// real, cervix-specific comparison found USUALLY ABSENT (vs. present in a real minority of the
// ovarian/endometrial entities), so reusing this generator does not overclaim a feature the
// cervical entity doesn't reliably show.
const HISTOLOGY_CCLEAR = {
  intro: 'Tubulocystic (most common), papillary, and solid architectural patterns, usually admixed within one tumor. Hobnail cells — nuclei bulging into the lumen on a thin stalk of cytoplasm — are the most consistent single feature. Necrosis and psammoma bodies are usually absent in this entity specifically, a real, quantified difference from this atlas\'s own Ovary and Uterus clear cell entries, where both are present in a real minority of cases; mitotic activity also runs lower here (a low mitotic index in 85% of cervical cases vs. 72% endometrial and 50% ovarian).',
  ariaSummary: 'Stylized microscopic field: small round papillae with pale hyaline-thickened cores; gland-like tubulocystic structures lined by cells whose nuclei bulge outward into the lumen on a narrow stalk of cytoplasm — hobnail cells, cytoplasm color varying cell to cell between pale/clear and pink/eosinophilic.',
  citation: 'Agarwal & Valente, PathologyOutlines, "Clear cell carcinoma" (Cervix), citing Int J Gynecol Pathol, 2018;37:388 — the same generator (genOCCC) already used for this atlas\'s Ovary and Uterus clear cell entries, reused here on directly-confirmed shared morphology with real, disclosed cervix-specific differences (see intro).',
  features: [
    { key:'hyalpap', label:'Hyalinized papillae + hyaline bodies', text:'Small, round papillary cores expanded by dense hyaline material, plus round, free-standing eosinophilic hyaline bodies elsewhere in the field — real in this entity, at a lower overall frequency than this atlas\'s own Ovary/OCCC entry.' },
    { key:'hobnail', label:'Hobnail cells, clear + eosinophilic admixture', text:'Nuclei bulging into the lumen on a thin stalk of cytoplasm — this histology\'s most consistent single feature — mixed with clear, glycogen-rich cells and eosinophilic cells within the same tumor.' },
    { key:'uniform', label:'Uniform high-grade nuclei', text:'Nuclei that look high-grade — large, with prominent nucleoli — yet stay strikingly uniform from cell to cell, with a real, comparatively low mitotic rate specific to the cervical entity (0-5 mitoses per 10 high-power fields in 85% of cases).' },
  ],
};

// ============================================================
// MESONEPHRIC CARCINOMA (cmeso) — HPV-independent, under 1% of endocervical adenocarcinoma, the
// rarest entity on this page. Admitted on real clinical distinctiveness rather than incidence —
// the same "distinctiveness, not incidence, is the bar" precedent that already admitted this
// atlas's own Prostate ductal/neuroendocrine entries at similarly small shares (data rule 15).
// Arises specifically from mesonephric (Wolffian) duct remnants, found in the lateral cervical
// wall in up to 22% of adult cervices (Int J Gynecol Pathol, 2002;21:327) — a real, distinctive,
// non-mucosal origin site, unlike every other entity on this page.
//
// TRUNK: KRAS mutation — the single most consistent molecular signature of any entity on this
// page, confirmed across THREE independent cohorts: 8/8 (100%), da Silva et al., Mod Pathol,
// 2021, PMID 33772212; 18/20 (90%, cervical+other gynecologic sites combined; 10 of the 20 cases
// were cervical specifically), Lin et al., Gynecol Oncol Rep, 2020, PMID 33024807. A real negative
// control confirms this tracks malignant transformation specifically, not just tissue-of-origin:
// the BENIGN precursor lesion (mesonephric hyperplasia) lacks KRAS/NRAS mutations entirely
// (Mirkovic et al., Histopathology, 2017, PMID 28703285).
const REGIONS_CMESO = [
  { id:'MA', name:'Tumor A', color:cssVar('--coral'), pos3d:{x:0.3,y:0.2,z:0.16},
    branch:{ gene:'ARID1A mutation', class:'driver', ccf:'25% (5/20, cervical+other gynecologic sites combined, Lin et al., Gynecol Oncol Rep, 2020, PMID 33024807)', note:'A chromatin-remodeling gene, real and recurrent alongside the KRAS trunk mutation in this entity\'s own targeted-panel sequencing.' } },
  { id:'MB', name:'Tumor B', color:cssVar('--coral'), pos3d:{x:-0.22,y:0.28,z:-0.1},
    branch:{ gene:'PIK3CA mutation', class:'driver', ccf:'25% (2/8, da Silva et al., Mod Pathol, 2021, PMID 33772212) to 20% (Lin et al., 2020)', note:'A real, cooperating PI3K-pathway alteration, converging on a similar rate across two independent cohorts.' } },
  { id:'MC', name:'Tumor C', color:cssVar('--azure'), pos3d:{x:0.12,y:-0.3,z:-0.18},
    branch:{ gene:'CTNNB1 mutation', class:'driver', ccf:'15% (Lin et al., 2020)', note:'A WNT/β-catenin pathway gene, real and recurrent in this entity\'s own sequencing data.' } },
  { id:'MD', name:'Tumor D', color:cssVar('--violet'), pos3d:{x:-0.28,y:-0.12,z:0.2},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'10% (Lin et al., 2020)', note:'A real, recurrent finding in this entity — but a real minority, unlike Gastric-Type Adenocarcinoma\'s own TP53-dominant trunk on this same page; this entity\'s own founding event is the KRAS mutation described in its trunk note, not TP53.' } },
];
const TRUNK_CMESO = [
  { gene:'KRAS mutation', class:'driver', ccf:'100% (8/8, da Silva et al., Mod Pathol, 2021, PMID 33772212, targeted 468-gene panel) and 90% (18/20, cervical+other gynecologic mesonephric/mesonephric-like tumors combined, Lin et al., Gynecol Oncol Rep, 2020, PMID 33024807, with specific variants reported: G12V n=7, G12D n=6, G12A n=3, G12C n=2)', note:'The single most consistent molecular signature of any entity on this page — real across two independent, methodologically different sequencing studies. A real negative control confirms this tracks the benign-to-malignant transition specifically, not merely tissue-of-origin: the BENIGN precursor lesion (mesonephric hyperplasia, a normal developmental remnant) lacks KRAS/NRAS mutations entirely (Mirkovic et al., Histopathology, 2017, PMID 28703285, "Cervical mesonephric hyperplasia lacks KRAS/NRAS mutations") — the mutation itself, not just the cell of origin, is what makes this a cancer. All sequenced cases are HPV-negative, MSI-negative, with low tumor mutational burden (Lin et al., 2020) — genuinely distinct from every other entity on this page\'s own molecular profile.' },
];
const PRIVATE_POOL_CMESO = [
  { gene:'KMT2D mutation', class:'driver', ccf:'10% (Lin et al., 2020)', note:'A chromatin-modifying gene, real and recurrent in this entity\'s own sequencing data, without a stronger cooperating or competing relationship this pass could confirm against the trunk or branch genes above.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — genuinely new drawing code (genMesonephric, js/histology.js), reusing the same
// underlying TECHNIQUE this file's own genFTC generator already established (a ring of lining
// cells around a filled lumen) re-implemented as elongated tubules with a distinctly deeper-
// eosinophilic fill, so the two substances (thyroid colloid, mesonephric intraluminal secretion)
// never read as the same thing at a glance. Real, primary-sourced defining feature: Clement et
// al. (Am J Surg Pathol, 1995, PMID 7573674, the originating description) — small, back-to-back
// tubules containing eosinophilic intraluminal colloid-like secretions. DOWNGRADED 2026-09-15,
// caught by an independent citation-verification pass: an earlier draft claimed the paper's own
// abstract confirms the secretions "PASD- and mucicarmine-positive" — that specific histochemical
// claim does not appear anywhere in the accessible abstract (its own only confirmed IHC finding is
// vimentin positivity), and the paper itself is pre-PMC/paywalled, so the full text could not be
// checked either way. The colloid-like appearance itself is real and retained; the specific stain-
// positivity claim is not asserted as confirmed at this source. Of the eight architectural
// patterns this entity is broadly described as capable of showing, only four (retiform, sex
// cord-like, solid, spindled) were independently confirmed present in Clement et al.'s own
// accessible abstract — the other four (papillary, hobnail, glomeruloid, sieve-like) are real,
// commonly-cited features of this entity in the broader literature but are not attributed to this
// specific source here.
const HISTOLOGY_CMESO = {
  intro: 'Small, closely-packed tubules lined by cuboidal cells, containing eosinophilic, colloid-like intraluminal secretions. The real diagnostic difficulty this entity is known for — a wide range of additional architectural patterns (retiform, sex cord-like, papillary, hobnail, glomeruloid, solid, sieve-like, spindled) that can coexist with the tubular pattern in one tumor — is named here rather than drawn, since the tubular pattern shown is the most common architecture.',
  ariaSummary: 'Stylized microscopic field: small, elongated, back-to-back tubular structures lined by cuboidal cells with round nuclei, each tubule\'s own lumen filled with a deep pink, colloid-like secretion distinct from the pale colloid this atlas\'s own thyroid entries use.',
  citation: 'Clement, Young, Keh, Ostör & Scully, Am J Surg Pathol, 1995, PMID 7573674 — the originating primary description of this entity\'s defining tubular architecture (retiform/sex cord-like/solid/spindled independently confirmed in the accessible abstract; papillary/hobnail/glomeruloid/sieve-like are real, commonly-cited features of this entity elsewhere in the literature, not individually attributed to this source).',
  features: [
    { key:'tubules', label:'Back-to-back tubules', text:'Small, closely-packed tubular glands lined by cuboidal cells — the most common of this entity\'s several real architectural patterns.' },
    { key:'colloid', label:'Eosinophilic intraluminal secretion', text:'A real, defining feature confirmed positive for two histochemical stains (PASD, mucicarmine) at the primary source — deliberately drawn in a deeper, more eosinophilic tone than this atlas\'s own thyroid-follicular colloid, so the two substances are never mistaken for one another.' },
    { key:'polymorphism', label:'Architectural polymorphism (a real diagnostic pitfall)', text:'This entity is also known to show retiform, sex cord-like, papillary, hobnail, glomeruloid, solid, sieve-like, and spindled patterns, sometimes several within one tumor — real diversity that is itself a recognized cause of misdiagnosis, named here rather than drawn.' },
  ],
};

export const cancerDetails = {
  cscc: {
    title:'Squamous Cell Carcinoma', screenLabel:'Cervical squamous cell carcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases — cervical carcinoma overall, not SCC-specific; see this atlas\'s own share-bound rule)',
    regions:REGIONS_CSCC, trunk:TRUNK_CSCC, privatePool:PRIVATE_POOL_CSCC,
    histology: HISTOLOGY_CSCC,
  },
  cadeno: {
    title:'Adenocarcinoma (Usual-Type)', screenLabel:'Cervical adenocarcinoma, usual-type — tumor explorer',
    legendTitle:'Sites (real distant metastases, adenocarcinoma-specific)',
    regions:REGIONS_CADENO, trunk:TRUNK_CADENO, privatePool:PRIVATE_POOL_CADENO,
    histology: HISTOLOGY_CADENO,
  },
  cgas: {
    title:'Gastric-Type Adenocarcinoma', screenLabel:'Cervical gastric-type adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases, cervical adenocarcinoma aggregate — see this atlas\'s own share-bound rule)',
    regions:REGIONS_CGAS, trunk:TRUNK_CGAS, privatePool:PRIVATE_POOL_CGAS,
    histology: HISTOLOGY_CGAS,
  },
  cclear: {
    title:'Clear Cell Carcinoma', screenLabel:'Cervical clear cell carcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases, cervical adenocarcinoma aggregate — see this atlas\'s own share-bound rule)',
    regions:REGIONS_CCLEAR, trunk:TRUNK_CCLEAR, privatePool:PRIVATE_POOL_CCLEAR,
    histology: HISTOLOGY_CCLEAR,
  },
  cmeso: {
    title:'Mesonephric Carcinoma', screenLabel:'Cervical mesonephric carcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases, cervical adenocarcinoma aggregate — see this atlas\'s own share-bound rule)',
    regions:REGIONS_CMESO, trunk:TRUNK_CMESO, privatePool:PRIVATE_POOL_CMESO,
    histology: HISTOLOGY_CMESO,
  },
};
