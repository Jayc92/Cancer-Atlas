import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { cssVar, applyTissueMottleVertexColors } from '../viewer.js';

// active:true, aliases deliberately do NOT include "adenocarcinoma" — that bare string is
// already claimed by Lungs above (see that entry's comment). Adding it here would make
// searching "adenocarcinoma" surface both organs, the exact collision this file's own
// convention checks for before adding any alias. "prostate"/"prostatic" alone are already
// collision-free. sexes:['male'] was already correct before this pass — verified, not assumed.
export const organEntry = { key:'prostate', label:'Prostate', system:'Reproductive', active:true, sexes:['male'],   aliases:['prostate','prostatic'] };

export const markerSpec = { points:[{heightFrac:0.46, angle:0}] }; // MARGIN, ON THIS LINE ON PURPOSE (user ruling, September the ninth; the date is spelled out because a digit year in a data-line comment reads to the citation extractor as a citation-shaped span — it was the 151st 'unreached span' for a day): the anchor lands at 0.458 of height; the male crotch (perineum, measured) is at 0.453 — 0.005, about 8.5 mm on a 1.7 m body, less than a finger's width above the placement check's floor. NOTHING MOVES: the prostate sits this low, and raising it for margin trades an anatomical fact for a comfort number; what the margin buys is that any re-export, mesh swap or crotch-measure change trips regress.js's 'body marker placement' check LOUDLY instead of relocating this marker onto a thigh. Full record: CLAUDE.md, 'BODY MARKERS RESOLVED, BUT NOT CORRECTLY'. Kept on one line because fourteen hand-typed pointers into this file sit below it.

export const cancerEntries = [
  // Unlike every prior organ's list, this is not a meaningful multi-way split — it's one
  // overwhelmingly dominant subtype with vanishingly rare variants. Stated plainly (exact SEER
  // cohort figures) rather than forced into false symmetry with HGSOC/LUAD/HCC/GBM's lists.
  // Siech et al. (Annals of Surgical Oncology, 2026, PMID 41718902): of 427,055 patients,
  // 425,692 (99.68%) harbored acinar, 855 (0.20%) ductal, 324 (0.08%) mucinous, 54 (0.01%)
  // signet ring cell, and 130 (0.03%) neuroendocrine carcinoma. ids prefixed to avoid collision
  // with Ovary's existing 'muc' (Mucinous carcinoma) id.
  { id:'acinar',   name:'Acinar adenocarcinoma',          share:'99.68% of prostate cancers treated with surgery or radiotherapy (SEER 2004–2020: 425,692/427,055, Siech et al., Annals of Surgical Oncology, 2026)', active:true,  organKey:'prostate' },
  { id:'pductal',  name:'Ductal adenocarcinoma',          share:'0.20% of prostate cancers treated with surgery or radiotherapy (855/427,055, Siech et al., 2026)', active:true, organKey:'prostate' },
  // pmuc/psignet stay below the incidence floor (phaseC_design.md §13): a targeted SEER
  // competing-risk analysis found neither one's cancer-specific mortality differs from acinar
  // adenocarcinoma at any stage — a real, well-powered "no" on clinical distinctiveness, not a
  // gap in the research. `blurb` is the below-floor schema's one addition beyond what an
  // inactive row already rendered (name/share/citation/disabled CTA) — one sourced sentence,
  // resolvable by PMID/PMCID per the ruling's own citation-resolvability requirement, no mass/
  // histology/extent. Both also get a trials mapping (js/trials.js) — the one thing a below-
  // floor entry gets beyond the blurb.
  { id:'pmuc',     name:'Mucinous adenocarcinoma',        share:'0.08% of prostate cancers treated with surgery or radiotherapy (324/427,055, Siech et al., 2026)', active:false, organKey:'prostate',
    blurb:'A SEER competing-risk analysis found this subtype’s cancer-specific mortality does not differ from acinar adenocarcinoma at any stage (Siech et al., Prostate Cancer Prostatic Dis, 2025, PMID 38987307, PMC12399420).' },
  { id:'psignet',  name:'Signet ring cell adenocarcinoma', share:'0.01% of prostate cancers treated with surgery or radiotherapy (54/427,055, Siech et al., 2026)', active:false, organKey:'prostate',
    blurb:'The same SEER competing-risk analysis found this subtype’s cancer-specific mortality does not differ from acinar adenocarcinoma at any stage either (Siech et al., Prostate Cancer Prostatic Dis, 2025, PMID 38987307, PMC12399420).' },
  { id:'pneuro',   name:'Neuroendocrine carcinoma',       share:'0.03% of prostate cancers treated with surgery or radiotherapy (130/427,055, Siech et al., 2026)', active:true, organKey:'prostate' },
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
// MATERIAL COLOR — DOWNGRADED to illustrative; the recorded attribution is BAD (citation-
// durability pass, 2026-09-04; manifest col-prostate). The material pass recorded:
// PathologyOutlines.com, "Tan to pink — reflecting the mixture of glandular epithelium,
// stromal connective tissue, and blood vessels", "confirmed directly". Re-verification found
// that quote on NO PathologyOutlines page: the current prostate grossing and histology pages
// carry no colour text, the Wayback snapshot of 2025-08-20 — PREDATING the material pass —
// carries none either, and a site-wide exact-phrase search returns zero. The quote was never
// at the named source. Per the downgrade-over-substitution ruling, no lookalike source was
// shopped in: 0xb97c68 stands as an illustrative tan-pink-family value.
// MATERIAL/LIGHTING REALISM PASS — shared recipe (roughness x0.82, specularIntensity 0.15->0.25,
// per-vertex tissue mottle at amplitude 0.28) applied uniformly across all nine real-scan
// organs; full mechanism, clip-safety reasoning, and the transmission investigation's null
// result are in liver.js's own comment (the canonical write-up) and this pass's dated CLAUDE.md
// entry. Color unchanged (0xb97c68 stays the verified tan-pink tone). Seed 7.8 (organ #6 in
// ORGAN_MODULES' order x1.3).
export function buildProstateMesh(){
  const loader = new GLTFLoader();
  // The organ GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -kn -cc;
  // 4A pass, 2026-09-03). A compressed GLB with no decoder registered fails to LOAD --
  // a broken organ, not a degraded one -- so this registration is load-bearing, same as
  // body.js's. Decoder is WASM inside three's own examples tree, same CDN the import map
  // already trusts. Harmless against an uncompressed GLB, so wiring precedes the asset swap.
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject)=>{
    loader.load('assets/prostate.glb', (gltf)=>{
      // MeshPhysicalMaterial + specularIntensity (clip-fix pass, now 0.25 — realism-pass
      // comment above), NOT MeshStandardMaterial: this ports the missing half of the approved
      // material verification — the Blender renders the tissue colors were verified and
      // approved on had Specular IOR Level baked in, but MeshStandardMaterial has no specular
      // control at all, so the live app kept full-strength dielectric specular. Under the legacy
      // hard-clip pipeline that blew grazing-angle fold/fissure walls to flat white (up to 26% of
      // the lungs' on-screen pixels, measured). Full mechanism + light-intensity half of the fix:
      // js/viewer.js's warm-lighting comment. Color unchanged; roughness and specularIntensity
      // both revised by the realism pass above.
      const mat = new THREE.MeshPhysicalMaterial({ color:0xb97c68, roughness:0.49, metalness:0.0, specularIntensity:0.25, vertexColors:true });
      gltf.scene.traverse(o=>{ if(o.isMesh){ o.material = mat; applyTissueMottleVertexColors(o.geometry, 7.8); } });
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
      // ORIGIN clause added 2026-09-12 for pductal (js/morphology.js's ORIGIN_HOTSPOT_ENTRY):
      // Seipel et al., Virchows Arch, 2013, PMID 23443941 — "Location was periurethral,
      // peripheral, or both in 69.8, 3.5, and 26.7 %" — the same 1,051-specimen re-review
      // already cited below for the 8.2% any-component admixture prevalence, a DIFFERENT
      // finding from the same paper, not a second source. Two qualitative corroborations,
      // checked directly, not restated on-screen: Epstein, Med Princ Pract, 2010, PMID
      // 19996627 ("Prostatic ductal adenocarcinomas may arise either in large primary
      // periurethral prostatic ducts or in the peripheral prostatic ducts"); Ranasinha et al.,
      // BJUI Compass, 2021, PMID 35474657, PMCID PMC8988764 ("the periurethral location of DAC
      // (compared to the more peripheral location of acinar adenocarcinoma)").
      text:'The section of urethra that passes directly through the gland, surrounded by the transition zone. Enlargement or a tumor pressing on this segment can cause urinary symptoms — weak stream, frequency, difficulty starting — which are actually more typical of benign transition-zone enlargement than of peripheral-zone cancer, which often causes no urinary symptoms at all until advanced. This is also where ductal adenocarcinoma, one of the gland\'s rare variants, most often arises: in a review of 1,051 radical prostatectomies, ductal tumors were centered here alone in 69.8% of cases and here plus the peripheral zone in another 26.7% — a genuinely different site of origin from acinar adenocarcinoma\'s own peripheral-zone predominance (Seipel et al., Virchows Arch, 2013).' },
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
// checked against EACH OTHER as well, which is the part the precedent this comment used to cite
// got wrong: it appealed to "the same standard as HCC's ARID1A/ARID2/NFE2L2 check", and that
// check tested pool members against the trunk and branches ONLY. ARID1A and ARID2 turned out to
// be an exclusive pair Guichard states outright, so HCC's pool is now the example of the failure,
// not of the standard — see EXCLUSIVE_PAIRS_HCC in liver.js and the pool-pair audit in panel.js.
// THE CONCLUSION HERE SURVIVES THE CORRECTED TEST, which is why nothing below changed: PTEN loss
// and CHD1 deletion have a real, soft, ONE-SIDED cooperating relationship, not a mutual-exclusivity
// one. Note what would have made it a defect and does not: PTEN is ERG-enriched, CHD1 is
// SPOP-associated, and ERG and SPOP ARE exclusive — but a chain through two enrichments is not an
// exclusivity, and treating it as one would manufacture a claim TCGA 2015 declines to make. So
// both are safe in the shared private pool despite that pool being drawn uniformly across every
// focus regardless of branch:
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
    branch:{ gene:'TMPRSS2-ERG gene fusion', class:'driver', ccf:'~50% of prostate cancer overall (European-ancestry cohorts) — a gene FUSION rather than a point or promoter mutation', note:'Fuses the androgen-regulated TMPRSS2 promoter to the ERG oncogene, driving abnormal ERG expression. Because this is a structural rearrangement rather than a single-base mutation, its presence in one focus says nothing about another focus in the same gland — real multifocal cases show it present in some foci and absent in others within the same patient (Mehra et al., Cancer Research, 2007: 21/30, 70% of rearranged multifocal cases were discordant between foci). Confirmed directly mutually exclusive with SPOP mutation (TCGA, Cell, 2015).' } },
  { id:'FB', name:'Peripheral zone B', color:cssVar('--coral'), pos3d:{x:-0.18,y:0.32,z:0.12},
    branch:{ gene:'TMPRSS2-ERG gene fusion', class:'driver', ccf:'~50% of prostate cancer overall (European-ancestry cohorts)', note:'The same fusion as the Peripheral zone A focus — real multifocal glands can have two or more independently-arising foci that each happen to carry an ERG fusion, sometimes even different fusion breakpoints from each other (Cooper et al., Nature Genetics, 2015), rather than one shared founding rearrangement.' } },
  { id:'FC', name:'Peripheral zone C', color:cssVar('--azure'), pos3d:{x:0.12,y:-0.28,z:-0.22},
    branch:{ gene:'SPOP mutation', class:'driver', ccf:'~10–11% of prostate cancer (TCGA, Cell, 2015) — the single most frequent point mutation in ERG-fusion-negative prostate cancer', note:'SPOP normally helps mark other proteins for degradation; mutating it disrupts that quality-control function. Confirmed directly mutually exclusive with ERG fusion status (TCGA, 2015: "Tumors defined by SPOP mutations were mutually exclusive with all ETS fusion-positive cases") — the same real biology that keeps this gene on a separate focus from the Peripheral zone A/B foci\'s ERG fusion rather than co-occurring with it.' } },
  { id:'FD', name:'Transition zone', color:cssVar('--azure'), pos3d:{x:-0.28,y:-0.12,z:0.25},
    branch:{ gene:'SPOP mutation', class:'driver', ccf:'~10–11% of prostate cancer (TCGA, Cell, 2015)', note:'The same mutation as the Peripheral zone C focus — this focus sits in the transition zone rather than the peripheral zone where most prostate cancer arises, a reminder that while the peripheral zone accounts for roughly 75% of cases, multifocal disease is not confined to a single zone.' } },
];
const TRUNK_PROSTATE = [
  { gene:'No shared founding mutation — independently arising foci', class:'driver', ccf:'~76.5% of radical prostatectomy specimens have ≥2 separate tumor foci (251/328, Fontugne et al., JCI Insight, 2022) — this cancer\'s founding event happens separately in each focus, not once for the whole gland the way a shared trunk mutation does', note:'Genomic studies of multiple foci from the same gland (Cooper et al., Nature Genetics, 2015) confirm independent clonal origins are real, not a modeling convenience — though with a real complication: that same study found convergent evolution of ERG rearrangements across separately-arising clones within one gland, while explicitly finding no such convergence "for other potential driver genes." Population-level interfocal discordance is well corroborated: Fontugne et al. (2022) found 59.7% (139/233) of multifocal specimens had discordant ERG/SPINK1 status between foci, echoed by Cyrta et al. (J Pathol, 2022) and Segura-Moreno et al. (Cancer Reports, 2023). This is why ERG fusion and SPOP mutation below are assigned per-focus rather than treated as one shared founding event. One real, clinically important fact this cancer\'s tumor explorer deliberately does NOT model: when prostate adenocarcinoma does metastasize, spread is overwhelmingly bone-dominant — 90% of hematogenous metastases in a 1,589-patient autopsy series (Bubendorf et al., Human Pathology, 2000) — but that describes distant spread, not the independent-origins structure within the gland this organ is built to teach.' },
];
const PRIVATE_POOL_PROSTATE = [
  { gene:'PTEN loss', class:'driver', ccf:'~15–17% homozygous deletion (TCGA, Cell, 2015)', note:'Removes a brake on the PI3K/AKT growth pathway. TCGA (2015) lists among already-known concurrent alterations "the preponderance of PTEN deletions in ERG fusion-positive cases", citing Taylor et al. (2010) for it — a real, differential enrichment alongside ERG-fusion foci specifically, though not confirmed absent from SPOP-mutant foci, so it stays in this shared pool rather than being excluded outright.' },
  { gene:'CHD1 deletion', class:'driver', ccf:'no clean population-wide frequency found to cite here — the same honesty precedent this atlas\'s LUAD adrenal gland and ccRCC brain site already uses', note:'Removes a chromatin-remodeling gene. TCGA (2015) directly ties this deletion to the SPOP-mutant subtype, corroborated by Chen et al. (Nature Cancer, 2025): "Concurrent genetic alterations in SPOP and CHD1 define a unique subtype of PCa." Cooperates with SPOP-mutant foci rather than substituting for the mutation itself.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
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

// ============================================================
// NEUROENDOCRINE CARCINOMA (pneuro) — 2026-09-12, phaseC_design.md §13's clinical-
// distinctiveness exception (granted; the below-floor treatment psignet/pmuc got instead).
// SITE MODEL: real distant metastasis (family 1, the ordinary case) — checked against data rule
// 15 explicitly, not defaulted from acinar's own multifocal-foci departure (which is specific to
// ACINAR's own biology, a fact stated at data rule 15's own writing) or from any other organ's
// departure. Wang et al., Prostate, 2019, PMID 31376193 (SEER 2010-2015, 352 PURE — de novo —
// NEPC vs 408,629 adenocarcinoma at diagnosis): "Pure NEPC had higher rates of visceral
// metastases (brain, lung, and liver: 4.58%, 26.72%, and 36.64%, respectively) but a lower rate
// of bone metastasis (65.65%) compared with... prostate adenocarcinoma." Read precisely: bone
// stays this cancer's single most common site in absolute terms — the real distinctiveness is
// the ELEVATED share going to brain/lung/liver relative to acinar's own even-more bone-dominant
// pattern (Bubendorf et al., 2000, 90% bone-dominant, already cited in TRUNK_PROSTATE above),
// not an absence of bone spread. NOT independently corroborated by a second source — checked
// directly: three other SEER-based NEPC studies exist (Yao 2021 PMID 34956090; Zhu 2021 PMID
// 33847621; Zaffuto 2017 PMID 28506524) but each reports only an overall metastatic-disease
// rate, a different statistic, not this same four-site breakdown — stated here rather than
// presented as cross-checked when it wasn't.
const REGIONS_PNEURO = [
  { id:'NB', name:'Bone', color:cssVar('--coral'), pos3d:{x:-1.2,y:-1.6,z:0.35},
    branch:{ gene:'AURKA amplification', class:'driver', ccf:'Aurora kinase A amplified/overexpressed in 40% of NEPC vs 5% of prostate adenocarcinoma (Beltran et al., Cancer Discov, 2011, PMID 22389870, PMCID PMC3290518)', note:'This cancer\'s single most common metastatic site in absolute terms — 65.65% of pure NEPC (Wang et al., 2019) — though a smaller share of this cancer\'s overall spread than acinar adenocarcinoma\'s own ~90% bone-dominant pattern. AURKA cooperates directly with the Lung/Brain sites\' MYCN amplification rather than competing with it: the source paper shows the two genes co-amplified and demonstrates in vitro/in vivo "that they cooperate to induce a neuroendocrine phenotype," including Aurora-kinase-inhibitor sensitivity — the site assignment below is illustrative (this atlas\'s standing disclaimer), the cooperation itself is the real, cited finding.' } },
  { id:'NL', name:'Liver', color:cssVar('--azure'), pos3d:{x:0.85,y:-0.55,z:-0.5},
    branch:{ gene:'AURKA amplification', class:'driver', ccf:'40% of NEPC vs 5% of prostate adenocarcinoma (Beltran et al., 2011)', note:'The same amplification as the Bone site. Liver is this cancer\'s second most common site (36.64%, Wang et al., 2019) — a real, elevated visceral-spread pattern relative to acinar adenocarcinoma, whose own hematogenous spread is overwhelmingly bone-first.' } },
  { id:'NU', name:'Lung', color:cssVar('--amber'), pos3d:{x:1.55,y:1.35,z:0.55},
    branch:{ gene:'MYCN amplification', class:'driver', ccf:'N-Myc amplified/overexpressed in 40% of NEPC vs 5% of prostate adenocarcinoma (Beltran et al., 2011) — the same cohort and figure as AURKA, since the two are co-amplified', note:'Cooperates with AURKA (Bone/Liver sites) rather than substituting for it — see the Bone site\'s own note for the cited mechanism. 26.72% of pure NEPC spreads here (Wang et al., 2019), well above what acinar adenocarcinoma\'s own bone-dominant pattern would predict for a site this far down its own list.' } },
  { id:'NR', name:'Brain', color:cssVar('--violet'), pos3d:{x:-0.95,y:1.25,z:-0.3},
    branch:{ gene:'MYCN amplification', class:'driver', ccf:'40% of NEPC vs 5% of prostate adenocarcinoma (Beltran et al., 2011)', note:'The same amplification as the Lung site. The least common of this cancer\'s four real sites (4.58%, Wang et al., 2019) but still real, cited spread this atlas\'s prostate acinar entry has no equivalent of at all — that cancer\'s own site map represents independent tumor foci, not distant organs.' } },
];
// TRUNK — a genuinely different KIND of truncal justification from every prior organ in this
// atlas: not spatial ubiquity (TP53/VHL), not temporal earliness (HCC/PDAC's TERT/KRAS), not a
// diagnostic classifier alone (GBM's IDH-wildtype status), but TRANSFORMATION-DEFINING — the
// genomic change that enables the phenotypic switch §9 documents (de Kouchkovsky et al., The
// Prostate, 2024, PMID 38173302), a fourth kind data rule 5 had not yet named. Both entries
// below are the switch's own molecular basis, not a frequency measured in a static tumor the
// way every prior trunk figure in this atlas is.
const TRUNK_PNEURO = [
  { gene:'Concurrent TP53 + RB1 loss', class:'driver', ccf:'53.3% of CRPC-NE carry BOTH losses together vs 13.7% of CRPC-Adeno (P<0.0004) — the individual rates are RB1 70% vs 32% (P=0.003) and TP53 66.7% vs 31.4% (P=0.0043) (Beltran et al., Nat Med, 2016, PMID 26855148, PMCID PMC4777652)', note:'The real "double-hit" this cancer is named for in the mouse-model literature that first demonstrated it: combined Rb1/Trp53 loss is what drives the transdifferentiation from an ordinary androgen-receptor-driven acinar tumor into this androgen-independent neuroendocrine one — the molecular event underneath the timing/lineage story §9 records, not a separate fact. RB1 and TP53 loss cooperate with each other here; neither substitutes for the other, which is why both are named as one combined trunk fact rather than two competing ones.' },
  { gene:'AR pathway attenuation ("AR-indifferent" state)', class:'driver', ccf:'lower AR-signaling-score average with "significant overlap... a spectrum" across pathologic subtypes, plus a significantly decreased ARv7:AR-wildtype ratio (P=0.0025) — but AR gene amplification is still found in 67% and AR protein expression in 75% of treatment-emergent cases in an independent 202-patient cohort (Beltran et al., 2016; Aggarwal et al., J Clin Oncol, 2018, PMID 29985747, PMCID PMC6366813)', note:'Worded precisely because the two cited cohorts disagree on magnitude, not direction: this is a real drop in AR SIGNALING OUTPUT, not a simple absence of the AR gene or protein, which is frequently still present or even amplified. That output drop is mechanistically why this cancer resists androgen-deprivation therapy the way ordinary acinar disease does not — and, since PSA is itself a downstream AR target-gene product, why PSA readings become unreliable here specifically: this cancer often presents with LOW or normal PSA despite aggressive, already-metastatic disease (median PSA 1.20 ng/mL in a treatment-emergent cohort with bone/visceral metastases in most patients — Conteduca et al., Eur J Cancer, 2019, PMID 31525487, PMCID PMC6803064; independently, a case report notes plainly that "a low PSA reading may give false reassurance," Rauf et al., 2020, PMID 32582431) — the opposite diagnostic assumption a reader would carry from acinar adenocarcinoma, where PSA tracks disease burden.' },
];
// PRIVATE POOL — checked against the trunk and both branch-site genes before inclusion, same
// standard as every prior organ. PTEN loss and PIK3CA pathway alterations were specifically
// searched for (real, mechanistically plausible NEPC candidates from mouse-model literature) and
// NOT found with a citable NEPC-specific human-cohort frequency in either of this entry's own
// primary sources — recorded as checked-and-absent rather than silently omitted, the same
// honesty precedent this atlas's own unclaimed-figure sites already use (LUAD's adrenal gland,
// ccRCC's KDM5C/PTEN overall-cohort figures). A real, separate exclusion finding: DNA-damage-
// repair (DDR) pathway gene alterations are "nearly mutually exclusive with t-SCNC
// differentiation" (P=.035, Aggarwal et al., 2018) — this cancer is relatively DDR-alteration-
// POOR, so no DDR gene (e.g. BRCA2, a common CRPC pool pick elsewhere) belongs in this pool.
const PRIVATE_POOL_PNEURO = [
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome. This cancer\'s own pool stays this thin deliberately: its real, distinctive genomic story is concentrated in the trunk\'s TP53/RB1 double-hit and the AURKA/MYCN branch pair above, not spread across additional drivers that checked out uncitable when searched for directly.' },
];
// HISTOLOGY — reuses js/histology.js's drawSmallCellSheet primitive (built and proven on a
// temporary lungs SCLC demo, then withheld pending a real entry to serve — phaseC_design.md
// §7a), this atlas's first real dispatch of it. Sourced from Ng & Li, Ann Diagn Pathol, 2024,
// PMID 39342665 — a PULMONARY neuroendocrine-tumor cytomorphology cohort (n=37 small cell
// carcinomas), NOT a prostate-specific one, used here because "small cell carcinoma" is one
// shared diagnostic entity across primary sites rather than a site-specific morphologic category
// — Epstein et al., 2014 (PMID 24705311, PMC4112087, the Prostate Cancer Foundation's own
// working-committee classification of NE differentiation in prostate cancer) names "Small cell
// carcinoma" as one of its defined categories without redefining the morphology itself. Stated
// as a cross-cohort application, not presented as if measured in a prostate-specific series.
const HISTOLOGY_PNEURO = {
  intro: 'Sheets of small tumor cells with scant to absent cytoplasm — "naked nuclei," reported in 89% of small cell carcinomas — packed densely enough that neighboring nuclei deform against each other rather than staying independently round: nuclear molding, present in 95% of cases and this tumor\'s single most recognizable feature. The one feature that specifically distinguishes small cell carcinoma from other neuroendocrine tumors is an absence of prominent nucleoli. Necrosis is common and often extensive.',
  ariaSummary: 'Stylized microscopic field: a dense sheet of small, dark, closely packed nuclei with essentially no visible cytoplasm around them. Many adjacent nuclei are stretched and angled toward their nearest neighbor, deforming against each other rather than staying round — nuclear molding. An irregular pale region of necrotic debris sits within the sheet.',
  citation: 'Ng & Li, Ann Diagn Pathol, 2024, PMID 39342665 (pulmonary neuroendocrine-tumor cytomorphology cohort, applied here per Epstein et al., 2014\'s shared small-cell-carcinoma classification).',
  features: [
    { key:'molding', label:'Nuclear molding',
      text:'Adjacent nuclei deform against each other where they\'re pressed close — present in 95% of small cell carcinomas (35/37) and the single most consistent architectural feature across the literature.' },
    { key:'naked', label:'Naked nuclei, no cytoplasm ring',
      text:'Nuclei with scant to absent visible cytoplasm — "naked nuclei" — in 89% of cases, a bare-nucleus look distinct from acinar adenocarcinoma\'s own cells, which keep a visible cytoplasm ring around each nucleus.' },
    { key:'necrosis', label:'Necrosis',
      text:'Areas of necrotic debris within the tumor sheet — common and often extensive in this fast-growing, high-grade carcinoma.' },
  ],
};

// ============================================================
// DUCTAL ADENOCARCINOMA (pductal) — 2026-09-12, the OTHER clinical-distinctiveness exception
// granted in phaseC_design.md §13. SITE MODEL: no dedicated DAC-specific metastatic-site
// distribution study exists (checked directly, not assumed) — reuses Bubendorf et al., Human
// Pathology, 2000, PMID 10836297 (the same 1,589-patient autopsy series already cited in
// TRUNK_PROSTATE above), since DAC is fundamentally still prostate adenocarcinoma and no source
// found documents a genuinely different hematogenous spread pattern for it specifically. Stated
// as a reuse, not as if DAC had its own dedicated study the way pneuro's Wang et al. 2019 does.
const REGIONS_PDUCTAL = [
  { id:'DB', name:'Bone', color:cssVar('--coral'), pos3d:{x:-1.15,y:-1.55,z:0.3},
    branch:{ gene:'PTEN alteration', class:'driver', ccf:'a real, mutually exclusive pair with CTNNB1 (below) found specifically enriched in the ductal component: 9 of 10 coincident ductal+acinar cases had a CTNNB1 hotspot mutation OR a PTEN alteration in the ductal focus, absent from the SAME patients\' acinar foci (Gillard et al., Eur Urol Focus, 2019, PMID 29229583, PMCID PMC6614018); corroborated independently (6/15 DA vs 0/15 AA, Lindh et al., Prostate, 2022, PMID 35049068, PMCID PMC9306900)', note:'This cancer\'s most common metastatic site, bone-dominant like acinar disease\'s own hematogenous spread — reused from the same Bubendorf et al. (2000) autopsy series that atlas\'s Acinar adenocarcinoma entry already cites (~90% of hematogenous prostate-cancer metastases), since no dedicated DAC-specific site study was found. PTEN and CTNNB1 mark two independent, alternative routes within the ductal component itself — a real, DAC-distinguishing branch pair, not shared with acinar\'s own trunk-level TMPRSS2-ERG/SPOP framework below.' } },
  { id:'DG', name:'Lung', color:cssVar('--azure'), pos3d:{x:1.5,y:1.3,z:0.5},
    branch:{ gene:'PTEN alteration', class:'driver', ccf:'same pairing as the Bone site', note:'The same PTEN/CTNNB1 pairing as the Bone site. Reused from Bubendorf et al. (2000): ~46% of hematogenous prostate-cancer metastases reach the lung — real, if not DAC-specific, distant spread.' } },
  { id:'DV', name:'Liver', color:cssVar('--amber'), pos3d:{x:0.9,y:-0.5,z:-0.45},
    branch:{ gene:'CTNNB1 hotspot mutation', class:'driver', ccf:'mutually exclusive with PTEN alteration (Bone/Lung sites) — see the Bone site\'s own citation', note:'Reused from Bubendorf et al. (2000): ~25% of hematogenous prostate-cancer metastases reach the liver. CTNNB1 activates WNT/β-catenin signaling — a different route into growth signaling than PTEN\'s PI3K/AKT pathway, real and alternative rather than additive within one tumor focus.' } },
  { id:'DR', name:'Adrenal gland', color:cssVar('--violet'), pos3d:{x:-0.9,y:1.2,z:-0.28},
    branch:{ gene:'CTNNB1 hotspot mutation', class:'driver', ccf:'mutually exclusive with PTEN alteration', note:'The same mutation as the Liver site. Reused from Bubendorf et al. (2000): ~13% of hematogenous prostate-cancer metastases reach the adrenal glands — this cancer\'s least common of the four real sites, same rank order as acinar adenocarcinoma\'s own spread pattern.' } },
];
// TRUNK — a real, checked absence, stated plainly rather than forced into false precision: DAC
// has no single well-established near-universal founder of its own, unlike every other trunk in
// this atlas. It substantially shares acinar's own TMPRSS2-ERG/SPOP molecular framework, but at
// documented, genuinely variable rates across cohorts — stated as a range, not one number,
// matching this atlas's own "note real variability, don't present one figure as universal"
// standard (HCC's TERT, melanoma's BRAF).
const TRUNK_PDUCTAL = [
  { gene:'TMPRSS2-ERG fusion (shared with acinar, at a lower and more variable rate)', class:'driver', ccf:'3% (1/35, Cai et al., Mod Pathol, 2025, PMID 40015646) to 47% (7/15, Lindh et al., 2022) across real DAC cohorts, vs acinar adenocarcinoma\'s own more consistent ~50% (TCGA, Cell, 2015) — one cohort (Schweizer et al., JCO Precis Oncol, 2019, PMID 31123724, PMCID PMC6528668, n=51) reports the fusion "significantly less common" than in matched acinar cohorts without a clean standalone percentage', note:'The same structural gene fusion this atlas\'s Acinar adenocarcinoma entry uses as its own Peripheral zone A/B branch gene — real shared molecular ancestry, not a coincidence of two unrelated findings, but genuinely less frequent and far less consistent from cohort to cohort here than in acinar disease. SPOP mutation, acinar\'s other branch gene, tracks AT OR ABOVE acinar\'s own ~10-11% rate in DAC (11-27% across cohorts) and shows a real, statistically significant DAC-specific enrichment in metastatic disease specifically: 23.5% in DAC-positive metastases vs 5.4% in DAC-negative ones (P=0.047, Zhu et al., J Pathol Clin Res, 2025, PMID 40172755, PMCID PMC11963801) — real evidence this cancer is not simply "acinar disease with some ductal architecture," even where it shares acinar\'s own genes.' },
];
// PRIVATE POOL — checked against the trunk and both branch-site genes. CDH1 (E-cadherin), MYC
// amplification, and PIK3R1 alterations were specifically searched for as real, plausible
// candidates and found to have NO citable DAC-specific literature in either primary source
// consulted — checked-and-absent, not silently omitted, the same honesty precedent this atlas's
// other unclaimed-figure sites already use.
const PRIVATE_POOL_PDUCTAL = [
  { gene:'DNA-damage-repair (DDR) pathway alteration', class:'driver', ccf:'49% of a real DAC cohort (25/51 — 14% mismatch-repair, 31% homologous-repair, Schweizer et al., 2019); independently, 40% MMR-altered with 3 of those 4 hypermutated in a smaller cohort (Schweizer et al., Oncotarget, 2016, PMID 27756888, PMCID PMC5347709)', note:'A real, clinically significant finding beyond mutation frequency alone: DDR/mismatch-repair alterations at this rate carry real treatment implications (immunotherapy eligibility for mismatch-repair-deficient tumors), reported in both DAC-focused cohorts independently.' },
  { gene:'FOXA1 alteration', class:'driver', ccf:'33% of a real DAC cohort (17/51, Schweizer et al., 2019), cross-corroborated as DAC-enriched by two further cohorts (Cai et al., 2025; Zhu et al., 2025)', note:'A transcription factor that cooperates with androgen-receptor signaling — no conflict was found against the trunk or either branch gene in any of the three cited cohorts.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome.' },
];
// HISTOLOGY — see the reinstated genProstateDuctal generator in js/histology.js for the drawing
// itself; citations there.
const HISTOLOGY_PDUCTAL = {
  intro: 'Tall, columnar, pseudostratified epithelium — nuclei at staggered heights within one true cell layer, not a disordered pile-up — arranged into papillary fronds (the most helpful single diagnostic feature) and cribriform (sieve-like) masses, the two most common architectural patterns. The vast majority of these tumors contain an admixed acinar carcinoma component too, at a median 50% of the tumor by volume — drawn here as separate, ordinary acinar glands alongside the papillary and cribriform zones.',
  ariaSummary: 'Stylized microscopic field: two elongated papillary fronds on the left, each with a red fibrovascular core and a rim of tall, columnar nuclei aligned radially outward — pseudostratified epithelium. A large sieve-like cribriform mass sits at center, punched through with multiple round lumens. Five smaller, separate acinar gland rings are scattered on the right, representing the tumor\'s admixed acinar component.',
  citation: 'Seipel et al., Pathology, 2016, PMID 27321992; Au et al., Ann Diagn Pathol, 2019, PMID 30772651.',
  features: [
    { key:'papillary', label:'Papillary architecture',
      text:'Tall, columnar, pseudostratified epithelium lining fibrovascular cores — "the most helpful diagnostic feature" for this cancer, and its most common architectural pattern.' },
    { key:'cribriform', label:'Cribriform architecture',
      text:'A confluent sheet of tumor cells punched through with multiple rounded lumens — this cancer\'s second most common pattern.' },
    { key:'admixture', label:'Admixed acinar component',
      text:'Ordinary, separate acinar glands alongside the papillary and cribriform zones — real tumors contain a median 50% acinar component by volume, not a pure ductal population.' },
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
  pneuro: {
    title:'Neuroendocrine Carcinoma', screenLabel:'Prostate neuroendocrine carcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases, visceral-elevated relative to acinar)',
    regions:REGIONS_PNEURO, trunk:TRUNK_PNEURO, privatePool:PRIVATE_POOL_PNEURO,
    histology: HISTOLOGY_PNEURO,
  },
  pductal: {
    title:'Ductal Adenocarcinoma', screenLabel:'Prostate ductal adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant metastases, reused from acinar\'s own citation)',
    regions:REGIONS_PDUCTAL, trunk:TRUNK_PDUCTAL, privatePool:PRIVATE_POOL_PDUCTAL,
    histology: HISTOLOGY_PDUCTAL,
  },
};
