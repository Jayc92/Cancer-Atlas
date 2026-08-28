import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cssVar } from '../viewer.js';

// active:true, aliases deliberately do NOT include "adenocarcinoma" — that bare string is
// already claimed by Lungs above (see that entry's comment). Adding it here would make
// searching "adenocarcinoma" surface both organs, the exact collision this file's own
// convention checks for before adding any alias. "prostate"/"prostatic" alone are already
// collision-free. sexes:['male'] was already correct before this pass — verified, not assumed.
export const organEntry = { key:'prostate', label:'Prostate', system:'Reproductive', active:true, sexes:['male'],   aliases:['prostate','prostatic'] };

export const markerSpec = { points:[{heightFrac:0.46, angle:0}] };

export const cancerEntries = [
  // Unlike every prior organ's list, this is not a meaningful multi-way split — it's one
  // overwhelmingly dominant subtype with vanishingly rare variants. Stated plainly (exact SEER
  // cohort figures) rather than forced into false symmetry with HGSOC/LUAD/HCC/GBM's lists.
  // Siech et al. (Annals of Surgical Oncology, 2026, PMID 41718902): of 427,055 patients,
  // 425,692 (99.68%) harbored acinar, 855 (0.20%) ductal, 324 (0.08%) mucinous, 54 (0.01%)
  // signet ring cell, and 130 (0.03%) neuroendocrine carcinoma. ids prefixed to avoid collision
  // with Ovary's existing 'muc' (Mucinous carcinoma) id.
  { id:'acinar',   name:'Acinar adenocarcinoma',          share:'99.68% of prostate cancers (425,692/427,055, Siech et al., Annals of Surgical Oncology, 2026)', active:true,  organKey:'prostate' },
  { id:'pductal',  name:'Ductal adenocarcinoma',          share:'0.20% of prostate cancers (855/427,055, Siech et al., 2026)', active:false, organKey:'prostate' },
  { id:'pmuc',     name:'Mucinous adenocarcinoma',        share:'0.08% of prostate cancers (324/427,055, Siech et al., 2026)', active:false, organKey:'prostate' },
  { id:'psignet',  name:'Signet ring cell adenocarcinoma', share:'0.01% of prostate cancers (54/427,055, Siech et al., 2026)', active:false, organKey:'prostate' },
  { id:'pneuro',   name:'Neuroendocrine carcinoma',       share:'0.03% of prostate cancers (130/427,055, Siech et al., 2026)', active:false, organKey:'prostate' },
];

// Real anatomy, not procedural: NIH 3D, "Human Reference Atlas 3D Reference Object Library"
// (account "HRA"), entry 3DPX-021015 — CC BY 4.0, same sourcing/decimation discipline as Lungs
// above. Full details, including the gland-isolation process, are in CLAUDE.md. The source
// model's raw mesh included two ~2cm paired duct-like appendages beyond the gland body itself —
// investigated (length, taper, cross-section) rather than assumed away, and more consistent
// with genuine ejaculatory ducts than a vas-deferens segmentation artifact, though not
// certain either way with no ground-truth labels available. Dropped from this mesh regardless,
// for visual consistency with every other organ's single-silhouette presentation (CLAUDE.md
// notes it as a possible future refinement, not built into this pass) — assets/prostate.glb is
// the gland alone.
// MATERIAL COLOR (real-tissue pass, verified before picking): the old 0xc9998e was already a
// tan-pink direction, checked and richened rather than assumed correct. Source: PathologyOutlines.com's
// description of the normal prostate cut surface — "Tan to pink — reflecting the mixture of
// glandular epithelium, stromal connective tissue, and blood vessels" — confirmed directly, not
// a generic "gland-colored" guess. 0xb97c68 keeps that same real tan-pink family, more
// saturated so it holds up under lighting instead of washing paler.
export function buildProstateMesh(){
  const loader = new GLTFLoader();
  return new Promise((resolve, reject)=>{
    loader.load('assets/prostate.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity 0.15, NOT MeshStandardMaterial (clip-fix
      // pass): this ports the missing half of the approved material verification — the
      // Blender renders the tissue colors were verified and approved on had Specular IOR
      // Level 0.15 baked in, but MeshStandardMaterial has no specular control at all, so the
      // live app kept full-strength dielectric specular. Under the legacy hard-clip pipeline
      // that blew grazing-angle fold/fissure walls to flat white (up to 26% of the lungs'
      // on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
      // js/viewer.js's warm-lighting comment. Color/roughness values unchanged.
      const mat = new THREE.MeshPhysicalMaterial({ color:0xb97c68, roughness:0.6, metalness:0.0, specularIntensity:0.15 });
      gltf.scene.traverse(o=>{ if(o.isMesh) o.material = mat; });
      resolve(gltf.scene);
    }, undefined, reject);
  });
}

export const organDetail = {
  eyebrow:'Male Reproductive System', title:'Prostate',
  sub:'Walnut-sized gland · surrounds the urethra below the bladder · adds fluid to semen',
  facts:[
    {label:'Location', val:'Pelvis, below the bladder, surrounding the urethra'},
    {label:'Zones', val:'Peripheral (~70% of volume, ~75% of cancers), central, and transition (site of BPH) zones — McNeal\'s model'},
    {label:'Function', val:'Secretes alkaline fluid that protects &amp; nourishes sperm'},
  ],
  // The zonal fact gets the same second-sentence treatment every prior organ's one genuinely
  // distinguishing fact has gotten: here it's the reason this organ's cancer screen is built
  // around independent multifocal origins rather than distant metastasis, same as GBM's
  // blood-brain-barrier fact set up why that organ's screen is built around intratumor regions.
  desc:'The prostate sits in the pelvis directly below the bladder, encircling the urethra as it exits. McNeal\'s zonal model divides the gland into three regions: the peripheral zone, the largest at roughly 70% of total volume and the site of origin for about 75% of prostate cancers; the central zone, surrounding the ejaculatory ducts; and the transition zone, a smaller region around the urethra itself where benign prostatic hyperplasia — not cancer — most commonly develops. The gland\'s secretions, an alkaline fluid that protects sperm from the acidic vaginal environment, contribute substantially to semen volume.',
  buildMesh: buildProstateMesh,
  // Real-world-meter GLB (bbox ~5.2x2.7x2.3cm, the smallest of the five) — see lungs.js for
  // why minRadius/maxRadius are rescaled here rather than left at the old ~1-unit procedural
  // values.
  viewer:{ theta:0.5, phi:1.15, radius:0.13, minRadius:0.03, maxRadius:0.3, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a prostate, a rounded walnut-shaped organic form, with '
    + 'four glowing teal points marking the structures listed after it. Drag to rotate, scroll '
    + 'to zoom.',
  // pos: literal anchor points (meters, local mesh space) raycast against the real
  // assets/prostate.glb surface — see lungs.js for the method. Central zone is anchored toward
  // the specific surface region where the (now-removed) ejaculatory-duct appendages attached to
  // the gland body, found by locating that seam's own boundary-edge centroid directly in the
  // source mesh — a real anatomical landmark, not a guess — since the central zone is literally
  // defined as the tissue surrounding those ducts. Peripheral/Transition/Urethra are placed
  // relative to that same found axis, following McNeal's zonal layout (peripheral zone
  // posterior/lateral, transition zone anterior near the base, urethra through the center
  // toward the apex).
  hotspots:[
    // Directly parallel to every prior organ's first point — the "arises here" structure.
    { key:'peripheral', label:'Peripheral zone', pos:[0.00397,-0.00170,0.00397],
      text:'The largest zone, making up roughly 70% of the gland\'s volume and wrapping around the back and sides of the urethra. About 75% of prostate adenocarcinomas arise here — directly paralleling how ovarian cancer begins in the ovary\'s surface epithelium, breast cancer in the breast\'s ducts, lung adenocarcinoma in the lung\'s alveoli, clear cell renal cell carcinoma in the kidney\'s cortex, and hepatocellular carcinoma in the liver\'s hepatocytes.' },
    // Deliberate contrast point, not another "arises here" — same technique Liver's Bile
    // ducts point and Brain's Cerebral cortex point already use.
    { key:'transition', label:'Transition zone', pos:[-0.00310,0.00828,-0.00310],
      text:'A smaller zone surrounding the urethra between the bladder neck and the peripheral zone. This is where benign prostatic hyperplasia (BPH), a common non-cancerous enlargement, most often develops — not where most cancer arises.' },
    { key:'central', label:'Central zone', pos:[0.00257,0.00385,0.01285],
      text:'A cone-shaped zone surrounding the ejaculatory ducts as they pass through the gland toward the urethra. Cancer arises here least often of the three zones.' },
    { key:'urethra', label:'Prostatic urethra', pos:[-0.00055,-0.00218,-0.00055],
      text:'The section of urethra that passes directly through the gland, surrounded by the transition zone. Enlargement or a tumor pressing on this segment can cause urinary symptoms — weak stream, frequency, difficulty starting — which are actually more typical of benign transition-zone enlargement than of peripheral-zone cancer, which often causes no urinary symptoms at all until advanced.' },
  ],
};

// THIRD STRUCTURAL DEPARTURE — a different kind from GBM's. GBM's departure was "this disease
// barely metastasizes, so 'sites' has to mean intratumor regions instead of distant organs."
// Prostate adenocarcinoma DOES metastasize (see the trunk note's bone-dominance aside below),
// but that's not the departure this organ is built around. The real departure, verified before
// building anything: prostate adenocarcinoma is well-documented as genuinely MULTIFOCAL, with
// separate tumor foci in the same gland arising from INDEPENDENT clonal origins rather than one
// tumor spreading locally. Fontugne et al. (JCI Insight, 2022, PMID 35050902, PMC8876549) found
// 251/328 (76.5%) of radical prostatectomy specimens had ≥2 separate tumor foci. So the four
// "regions" below are four independently-arising foci within one gland — not distant organs
// (every prior cancer except GBM) and not zones of one contiguous mass (GBM) — a third real
// site-model. `pos3d` is clustered tightly, same technique GBM introduced for the same reason:
// these are all foci within one small gland, not scattered distant sites.
//
// AUTHORSHIP CORRECTION — the task's suggested source, "Boutros et al., Nature Genetics, 2015,"
// does not exist as a first-author paper. The real paper is Cooper CS, Eeles R, Wedge DC, Van
// Loo P, Gundem G, et al. (Nature Genetics, 2015, PMID 25730763, PMC4380509) — Boutros and
// Fraser are among 50+ coauthors, the same "coauthor named as if first author" pattern already
// caught once in this atlas (ccRCC's Nickerson→Moore correction).
//
// TWO CLAIMS FROM THE TASK BRIEF DID NOT HOLD UP AND WERE DROPPED OR REPLACED, same standard as
// every prior organ's fabricated-adjacent claims (LUAD's unfound ~49% TERT figure, HCC's SMAD4):
// - "MYCL amplification with TP53 loss (Boutros 2015)" is not a real, documented finding. The
//   real Cooper et al. 2015 paper never mentions MYCL. TCGA's own prostate paper (Cancer Genome
//   Atlas Research Network, Cell, 2015, PMID 26544944, PMC4695400) explicitly states "we found
//   no focal, clonal MYCL amplifications...in either data set nor in a separate set of 63
//   untreated prostate cancer samples" — a direct contradiction, not just thin evidence.
//   Dropped entirely, no substitute needed.
// - The suggested "documented case of one ERG+ focus adjacent to a SPOP-mutated focus,
//   independently confirmed origins" does not appear in Cooper et al. 2015 or any later
//   multifocality paper checked. Cooper et al. 2015 actually documents the opposite kind of
//   finding — convergent ERG evolution across independently-arising clones within one gland,
//   explicitly stating "we did not see convergent evolution for other potential driver genes."
//   Replaced with real, corroborated population-level discordance data instead: Fontugne et al.
//   (2022) found 139/233 (59.7%) multifocal specimens had discordant ERG/SPINK1 status between
//   foci, corroborated independently by Cyrta et al. (J Pathol, 2022, PMID 35220606) and
//   Segura-Moreno et al. (Cancer Reports, 2023, PMID 36199157). Mehra et al. (Cancer Research,
//   2007, PMID 17804708) found the ERG-specific figure: 21/30 (70%) rearranged multifocal cases
//   discordant between foci.
//
// TRUNK IS A FACT-STATEMENT, NOT A MUTATION — same move GBM's IDH-wildtype-status entry already
// made. No single mutation is shared across the whole gland here, so the trunk entry represents
// the "independently arising foci" fact itself rather than being left empty (which would render
// as a bare "Trunk mutations" header with nothing under it).
//
// TWO BRANCH GENES, SPLIT ACROSS FOCI — same architectural pattern as HCC's TP53/CTNNB1 and
// GBM's EGFR/PDGFRA, not a fourth way of representing "two genes that don't co-occur." TMPRSS2-
// ERG fusion (~50% of prostate cancer overall, confirmed across multiple 2026 papers in
// European-ancestry cohorts) and SPOP mutation (~10-11%, TCGA 2015) are confirmed directly
// mutually exclusive: TCGA 2015 states "Tumors defined by SPOP mutations were mutually exclusive
// with all ETS fusion-positive cases." ERG fusion is structurally different from every other
// branch/trunk gene in this atlas — a gene FUSION, not a point or promoter mutation — which is
// exactly why its presence/absence can differ between foci in the same patient in a way a
// shared founding point mutation couldn't.
//
// PTEN LOSS AND CHD1 DELETION — checked individually against both branch genes before inclusion,
// same standard as HCC's ARID1A/ARID2/NFE2L2 check. Both have a real, soft, ONE-SIDED cooperating
// relationship (not a mutual-exclusivity one), so both are safe in the shared private pool the
// same way ARID1A/ARID2/NFE2L2 (CTNNB1-cooperating, not TP53-exclusive) were safe in HCC's pool
// despite that pool being drawn uniformly across every focus regardless of branch:
// - PTEN loss: ~15-17% homozygous deletion (TCGA 2015) — TCGA 2015 found "the preponderance of
//   PTEN deletions in ERG fusion-positive cases," i.e. enriched in ERG+ tumors, but not stated as
//   absent from SPOP-mutant tumors. A real, differential, non-exclusive relationship.
// - CHD1 deletion: no overall cohort-wide percentage found (same honesty precedent as LUAD's
//   adrenal gland and ccRCC's liver/brain sites) — but TCGA 2015 directly ties it to the
//   SPOP-mutant subtype ("deletion of CHD1...associated with SPOP-mutant tumors"), corroborated
//   by Chen et al. (Nature Cancer, 2025, PMID 40360905): "Concurrent genetic alterations in SPOP
//   and CHD1 define a unique subtype of PCa." Cooperates with the SPOP branch, not proven
//   absent from ERG+ tumors.
//
// SPINK1 CHECKED AND EXCLUDED — the task's own suggested branch/private candidate list included
// it, but it fails the same test AXIN1 (HCC)/NF1/RB1/PIK3CA (GBM) failed: Fontugne et al. (2022)
// and TCGA (2015) both frame SPINK1 overexpression (~10-12%) as a distinct, ERG-negative
// molecular subtype — confirmed mutually exclusive with ERG fusion specifically, the same way
// AXIN1 was confirmed mutually exclusive with CTNNB1. Since ERG fusion is already one of this
// organ's two branch genes, and the private pool draws onto cells from every focus regardless of
// that focus's branch, including SPINK1 would let it land on an ERG-branch focus's cells —
// directly contradicting the confirmed mutual-exclusivity finding rather than just showing a
// less-common combination. Excluded, same as AXIN1/NF1/RB1/PIK3CA before it.
// Region names deliberately do NOT contain the word "focus" — regionWord:'focus' below already
// appends it everywhere a region name is displayed standalone (panel subtitle, marker label),
// so a name like "Focus 1" would render as the doubled "Focus 1 focus". Same naming discipline
// GBM's region names ("Enhancing core", not "Enhancing core region") already use.
const REGIONS_PROSTATE = [
  { id:'FA', name:'Peripheral zone A', color:cssVar('--coral'), pos3d:{x:0.3,y:0.18,z:0.2},
    branch:{ gene:'TMPRSS2-ERG gene fusion', class:'driver', ccf:'~50% of prostate cancer overall (European-ancestry cohorts) — a gene FUSION, not a point or promoter mutation like every other branch/trunk gene in this atlas', note:'Fuses the androgen-regulated TMPRSS2 promoter to the ERG oncogene, driving abnormal ERG expression. Because this is a structural rearrangement rather than a single-base mutation, its presence in one focus says nothing about another focus in the same gland — real multifocal cases show it present in some foci and absent in others within the same patient (Mehra et al., Cancer Research, 2007: 21/30, 70% of rearranged multifocal cases were discordant between foci). Confirmed directly mutually exclusive with SPOP mutation (TCGA, Cell, 2015).' } },
  { id:'FB', name:'Peripheral zone B', color:cssVar('--coral'), pos3d:{x:-0.18,y:0.32,z:0.12},
    branch:{ gene:'TMPRSS2-ERG gene fusion', class:'driver', ccf:'~50% of prostate cancer overall (European-ancestry cohorts)', note:'The same fusion as the Peripheral zone A focus — real multifocal glands can have two or more independently-arising foci that each happen to carry an ERG fusion, sometimes even different fusion breakpoints from each other (Cooper et al., Nature Genetics, 2015), rather than one shared founding rearrangement.' } },
  { id:'FC', name:'Peripheral zone C', color:cssVar('--azure'), pos3d:{x:0.12,y:-0.28,z:-0.22},
    branch:{ gene:'SPOP mutation', class:'driver', ccf:'~10–11% of prostate cancer (TCGA, Cell, 2015) — the single most frequent point mutation in ERG-fusion-negative prostate cancer', note:'SPOP normally helps mark other proteins for degradation; mutating it disrupts that quality-control function. Confirmed directly mutually exclusive with ERG fusion status (TCGA, 2015: "Tumors defined by SPOP mutations were mutually exclusive with all ETS fusion-positive cases") — the same real biology that keeps this gene on a separate focus from the Peripheral zone A/B foci\'s ERG fusion rather than co-occurring with it.' } },
  { id:'FD', name:'Transition zone', color:cssVar('--azure'), pos3d:{x:-0.28,y:-0.12,z:0.25},
    branch:{ gene:'SPOP mutation', class:'driver', ccf:'~10–11% of prostate cancer (TCGA, Cell, 2015)', note:'The same mutation as the Peripheral zone C focus — this focus sits in the transition zone rather than the peripheral zone where most prostate cancer arises, a reminder that while the peripheral zone accounts for roughly 75% of cases, multifocal disease is not confined to a single zone.' } },
];
const TRUNK_PROSTATE = [
  { gene:'No shared founding mutation — independently arising foci', class:'driver', ccf:'~76.5% of radical prostatectomy specimens have ≥2 separate tumor foci (251/328, Fontugne et al., JCI Insight, 2022) — this cancer\'s founding event happens separately in each focus, not once for the whole gland the way every other trunk entry in this atlas represents', note:'Genomic studies of multiple foci from the same gland (Cooper et al., Nature Genetics, 2015) confirm independent clonal origins are real, not a modeling convenience — though with a real complication: that same study found convergent evolution of ERG rearrangements across separately-arising clones within one gland, while explicitly finding no such convergence "for other potential driver genes." Population-level interfocal discordance is well corroborated: Fontugne et al. (2022) found 59.7% (139/233) of multifocal specimens had discordant ERG/SPINK1 status between foci, echoed by Cyrta et al. (J Pathol, 2022) and Segura-Moreno et al. (Cancer Reports, 2023). This is why ERG fusion and SPOP mutation below are assigned per-focus rather than treated as one shared founding event. One real, clinically important fact this cancer\'s tumor explorer deliberately does NOT model: when prostate adenocarcinoma does metastasize, spread is overwhelmingly bone-dominant — 90% of hematogenous metastases in a 1,589-patient autopsy series (Bubendorf et al., Human Pathology, 2000) — but that describes distant spread, not the independent-origins structure within the gland this organ is built to teach.' },
];
const PRIVATE_POOL_PROSTATE = [
  { gene:'PTEN loss', class:'driver', ccf:'~15–17% homozygous deletion (TCGA, Cell, 2015)', note:'Removes a brake on the PI3K/AKT growth pathway. TCGA (2015) found "the preponderance of PTEN deletions in ERG fusion-positive cases" — a real, differential enrichment alongside ERG-fusion foci specifically, though not confirmed absent from SPOP-mutant foci, so it stays in this shared pool rather than being excluded outright.' },
  { gene:'CHD1 deletion', class:'driver', ccf:'no clean population-wide frequency found to cite here — the same honesty precedent this atlas\'s LUAD adrenal gland and ccRCC liver/brain sites already use', note:'Removes a chromatin-remodeling gene. TCGA (2015) directly ties this deletion to the SPOP-mutant subtype, corroborated by Chen et al. (Nature Cancer, 2025): "Concurrent genetic alterations in SPOP and CHD1 define a unique subtype of PCa." Cooperates with SPOP-mutant foci rather than substituting for the mutation itself.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly at the source): pattern
// definitions confirmed against the exact papers: Epstein et al., Am J Surg Pathol, 2016
// (the ISUP 2014 consensus — "Gleason pattern 4 includes cribriform, fused, and poorly
// formed glands," cribriform assigned to pattern 4 "regardless of morphology") and Epstein
// et al., Eur Urol, 2016 (Grade Group table: pattern 3 = "only individual discrete
// well-formed glands"; pattern 5 = "lack of gland formation (or with necrosis)"), plus
// PathologyOutlines' Gleason grading page ("single, separate glands"; "retention of at
// least a wisp of stroma intervening between neighboring glands"). Two verified framing
// constraints shaped this view: (1) real tumors genuinely contain multiple coexisting
// patterns — that is WHY the score sums a primary and secondary pattern — but no source
// describes an ordered 3→4→5 gradient in one field, so the intro labels this a SCHEMATIC
// COMPOSITE of the grading spectrum, never "a typical field"; (2) the "sum of the two most
// prevalent patterns" rule is stated for prostatectomy — needle biopsies grade the worst
// pattern as secondary regardless of amount — so the intro says "primary plus secondary"
// without asserting the second slot is always the second-most-prevalent.
const HISTOLOGY_PROSTATE = {
  intro: 'A schematic composite of the modern Gleason grading spectrum — not one typical field. Pattern 3: individual, discrete, well-formed glands, each separated by at least a wisp of stroma. Pattern 4: poorly formed, fused, cribriform (sieve-like) and glomeruloid glands. Pattern 5: essentially no gland formation — ragged sheets, cords and single cells. Real tumors genuinely contain multiple coexisting patterns — the Gleason score sums the primary and secondary ones — though not usually arranged as an ordered left-to-right gradient like this.',
  ariaSummary: 'Stylized microscopic field presented as a schematic left-to-right grading spectrum. Left: half a dozen small, separate, well-formed gland rings with open lumens — Gleason pattern 3. Middle: one large cribriform mass, a confluent sheet of tumor cells punched through with multiple rounded lumens, plus a short chain of fused glands — pattern 4. Right: a solid sheet of tumor dissolving downward into scattered single infiltrating cells — pattern 5.',
  citation: 'Epstein et al., Am J Surg Pathol, 2016 (ISUP 2014 consensus); Epstein et al., Eur Urol, 2016; PathologyOutlines.com, "Gleason grading."',
  features: [
    { key:'p3', label:'Gleason pattern 3',
      text:'Only individual, discrete, well-formed glands — single and separate, each retaining at least a wisp of intervening stroma. The lowest pattern still assigned in modern grading (patterns 1 and 2 are no longer used).' },
    { key:'p4', label:'Gleason pattern 4',
      text:'Poorly formed, fused, cribriform and glomeruloid glands. The large sieve-like mass here is cribriform growth — a confluent sheet of tumor cells punched through with multiple lumens — which the ISUP 2014 consensus assigns to pattern 4 regardless of morphology.' },
    { key:'p5', label:'Gleason pattern 5',
      text:'Lack of gland formation: ragged sheets, cords and dissociated single cells infiltrating the stroma. Comedonecrosis within cribriform structures also qualifies, though none is drawn here.' },
  ],
};

export const cancerDetails = {
  acinar: {
    title:'Acinar Adenocarcinoma', screenLabel:'Prostate acinar adenocarcinoma — tumor explorer',
    legendTitle:'Independent tumor foci within one gland (not distant metastases)',
    regionWord:'focus',
    regions:REGIONS_PROSTATE, trunk:TRUNK_PROSTATE, privatePool:PRIVATE_POOL_PROSTATE,
    histology: HISTOLOGY_PROSTATE,
  },
};
