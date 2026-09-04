import * as THREE from 'three';
import { cssVar, organicDisplace } from '../viewer.js';

// active:true. Alias collision check against every existing organ's aliases (60-entry surface
// before this pass): "testis"/"testicle"/"testicular"/"seminoma"/"germ cell tumor"/"germ
// cell"/"tgct" — none collide. "germ cell" is included because a search for the broader tumor
// family should land here; the organ has no other real home for that term.
export const organEntry = { key:'testis', label:'Testis', system:'Reproductive', active:true, sexes:['male'], aliases:['testis','testicle','testicles','testicular','seminoma','germ cell tumor','germ cell','tgct'] };

// Paired organ, symmetric placement — same convention as Ovary's two-point markerSpec. The
// first values tried (±18–30deg at heightFrac 0.36–0.42, modeled loosely on Ovary's own ±25deg)
// hit a REAL bug, caught by live probing rather than assumed fine from a single screenshot:
// both points projected to the IDENTICAL pixel at every heightFrac from 0.30–0.39, and only 2px
// apart at 0.42/±30 — the same ray-through-the-thigh-gap trap this codebase's own Colon marker
// comment already documents, here in a more extreme form because the scrotum sits right at the
// groin crease where the two legs are closest together. A wider angle sweep (probed live, same
// technique as the colon pass) found real separation starting around ±55–60deg and settling at
// a comfortable ~55px by ±65deg — heightFrac nudged down slightly to 0.40 in the same pass.
export const markerSpec = { points:[{heightFrac:0.40, angle:-65}, {heightFrac:0.40, angle:65}] };

// Two-way split, deliberately NOT the three-way WHO 2022 histologic list (seminoma / embryonal
// carcinoma / yolk sac / choriocarcinoma / teratoma / mixed): under WHO 2022, "mixed germ cell
// tumor" IS a non-seminomatous GCT, so a three-or-more-way list built from raw subtype counts
// double-counts mixed tumors into their own row AND back into "non-seminoma" via any pooled
// total. The clean, internally consistent split is the two-way one actually used in triage and
// staging: 22,634 seminoma / 12,432 non-seminoma of 35,066 total testicular GCTs (PMID
// 31310057) — every WHO subtype other than pure seminoma collapses into "non-seminoma" by
// definition, so this denominator has no overlap trap.
export const cancerEntries = [
  // The share figure leads, per this atlas's own convention (Skin's melanoma entry carries its
  // death-share alongside its incidence-share the same way) — but the more important fact here
  // is the cure-rate story: cisplatin-based chemotherapy (BEP) cures the overwhelming majority
  // of seminoma even once it has spread, and there is no poor-prognosis tier for it at all under
  // the IGCCCG system used to risk-stratify metastatic germ cell tumors (Beyer et al., Ann Oncol,
  // 2021 update, PMID 33729863, PMC8099394, 2,451 men): 5-year overall survival is 95% for the
  // good-prognosis group and 88% for intermediate — categories that, for every other cancer in
  // this atlas, would already be considered excellent outcomes for metastatic disease — and the
  // "poor prognosis" category the IGCCCG system defines for other germ cell tumors simply has no
  // seminoma members: every seminoma patient starts in good or intermediate risk.
  { id:'seminoma', name:'Seminoma', share:'~64.5% of testicular germ cell tumors (22,634/35,066, PMID 31310057) — and even once metastatic, there is no poor-prognosis risk category for it at all: 5-year survival is 95% (good-risk) or 88% (intermediate-risk) under the IGCCCG system (Beyer et al., 2021 update, n=2,451)', active:true, organKey:'testis' },
  { id:'nsgct',     name:'Non-seminomatous germ cell tumor', share:'~35.5% of testicular germ cell tumors (12,432/35,066) — embryonal carcinoma, yolk sac tumor, choriocarcinoma, teratoma, or a mixture of these with seminoma', active:false, organKey:'testis' },
];

// PROCEDURAL — no HRA/NIH 3D reference-organ entry exists for testis (all 81 entries in the
// Human Reference Atlas reference-organ library were checked; none is a testis). A
// Sketchfab-focused hunt (2026-09-03, run after the same playbook replaced Ovary and Stomach)
// was ALSO negative — the pre-registered "keep procedural" outcome's first firing. Recorded so
// no future pass redoes it: the only anatomically-real candidate ("Anatomy of Human Testis",
// 209.9k tris, the sole model with genuine testis+epididymis anatomy) is CC BY-NC-SA;
// TrentPierce's popular "Testicles" is an external SCROTUM (wrong object); ahmed17's
// 3.96M-tri "male genital system" renders testes as featureless spheres (worse than this
// mesh); and the edu360/xpdemy "male reproductive system" pair is a rule-30
// license-laundering suspect (identical 44,916 tris under different uploaders). Full field
// + live-viewer confirmations: the cancer-atlas-testis-source-hunt packet. Built like
// Ovary, not like Skin: this is a solid ellipsoid gland with four decorative surface hotspots,
// the same representational job Ovary already does for a similarly-sized paired reproductive
// organ, so it uses Ovary's `dir`+hotspotScale convention (arbitrary design-unit mesh scale,
// hand-tuned camera radius/minRadius/maxRadius) rather than Skin's `pos`+true-meter-scale
// convention. That choice matters: Skin needed literal meter-scale `pos` anchors because its
// whole lesson is precise layer-boundary depths, and true-meter scale is what put it inside
// makeViewer's fixed 0.1m camera near-plane, requiring the SCALE-multiplier fix recorded in that
// file. A dir-based organ's camera distance is whatever viewer.radius/minRadius/maxRadius say —
// never auto-approached by frameContents — so it never approaches that near-plane regardless of
// the mesh's true real-world size. No SCALE fix is needed here for that reason, not because the
// organ is any less small in reality.
// PROPORTIONS: StatPearls ("Anatomy, Abdomen and Pelvis: Testes," NBK470201) gives "3 cm by 5 cm
// in length and 2 cm to 3 cm in width" — read as length ~4cm (midpoint), width ~2.5cm (midpoint);
// no independent depth figure is given, so depth is assumed equal to width (a near-circular
// cross-section), stated here rather than silently assumed. Ratio length:width:depth = 4:2.5:2.5,
// applied to a base unit sized similarly to Ovary's (1.1 vs Ovary's 1.28 — testis is the smaller
// of the two real organs, and the base unit is an arbitrary design scale, not a meter figure).
// COLOR: the weakest-sourced parameter in this file, flagged rather than dressed up with a
// citation that doesn't hold — no fetched source gave a gross cut-surface color for NORMAL
// testicular parenchyma specifically (only tumor macroscopy turned up in the histology search
// below). 0xd6b98f is a plain warm tan-cream, the commonly-illustrated tissue tone for this
// organ, chosen the same way Skin's hypodermis color was flagged as its "weakest sourcing tier."
export function buildTestisMesh(){
  const geo = new THREE.SphereGeometry(1, 80, 80);
  // Amplitude well below Ovary's (0.045): real testis is smooth and firm, not lumpy — "smooth
  // and soft" on palpation per StatPearls — so the organic wobble is present but subtle.
  organicDisplace(geo, 0.022, 5, 2.4);
  const mat = new THREE.MeshPhysicalMaterial({ color:0xd6b98f, roughness:0.52, metalness:0.0, specularIntensity:0.15 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(1.1 * (2.5/4), 1.1, 1.1 * (2.5/4));
  return mesh;
}

export const organDetail = {
  eyebrow:'Male Reproductive System', title:'Testis',
  sub:'Paired organ · scrotal · produces sperm and testosterone',
  facts:[
    {label:'Size', val:'~3&ndash;5 cm long, 2&ndash;3 cm wide (StatPearls)'},
    {label:'Location', val:'Scrotum, suspended by the spermatic cord'},
    {label:'Function', val:'Spermatogenesis (Sertoli-supported) &amp; testosterone production (Leydig cells)'},
    {label:'Blood supply', val:'Testicular arteries, arising from the abdominal aorta just below the renal arteries'},
  ],
  // The "arises here" fact stated plainly, then the precursor-lesion nuance immediately after —
  // same second-sentence-treatment convention every prior organ's one distinguishing fact gets.
  // Verified rather than assumed: germ cell neoplasia in situ (GCNIS) is the WHO-recognized
  // precursor and the natural-history evidence for it is real and strong (von der Maase et al.,
  // Int J Androl, 1986: of men under contralateral surveillance, those with biopsy-proven CIS in
  // the unaffected testis had a 40% risk of invasive cancer at 3 years and 50% at 5, while 0 of
  // 473 men WITHOUT it developed any — the cleanest natural-history proof a precursor lesion in
  // this atlas has). But the one clean empirical figure for how often GCNIS is actually FOUND
  // adjacent to a primary tumor on pathological review is lower than "nearly all" would suggest:
  // 78.7% (85/108, Evaluation of germ-cell neoplasia in situ entity in testicular tumors, 2019) —
  // stated as such rather than rounded up, because incidental detection depends on how many
  // sections are sampled and invasive tumor can overgrow the very lesion it arose from.
  desc:'The testes are the male gonads, suspended in the scrotum by the spermatic cord. Inside, seminiferous tubules make up most of the organ\'s volume — spermatogenesis happens along their walls, supported by Sertoli cells, while the surrounding interstitial tissue holds the testosterone-producing Leydig cells. Almost every testicular germ cell tumor, seminoma included, is accepted as arising from germ cell neoplasia in situ (GCNIS): a preinvasive lesion that reliably precedes invasion (0 of 473 men without it went on to develop cancer in a classic surveillance series) and that pathological review finds adjacent to the tumor in most, though not quite all, resected specimens (78.7% in one directly-verified series) — the gap being a detection limit, not evidence the lesion is sometimes truly absent.',
  buildMesh: buildTestisMesh,
  hotspotScale: new THREE.Vector3(1.1 * (2.5/4), 1.1, 1.1 * (2.5/4)),
  // radius 4.4, not the 3.6 this shipped with (Tier 1b, 2026-09-03): testis is the one organ
  // frameContents never touches (procedural, no h.pos hotspots), so this hardcoded distance IS
  // its framing — and at 3.6 the 1.1-semi-axis ellipsoid filled 89% of the frame's half-height,
  // edge-to-edge with a marker half-cut (P5 audit, rank 16/16 partly on framing). 4.4 is not a
  // taste number: it is frameContents' own fit applied by hand — needed = r×1.3/sin(fov/2) =
  // 1.1×1.3/sin(19°) = 4.39 — so the procedural organ now sits in its frame exactly as every
  // real-mesh organ does. minRadius unchanged (zoom-in floor is a separate question).
  viewer:{ theta:0.5, phi:1.2, radius:4.4, minRadius:2.3, maxRadius:5.5, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a testis, a smooth tan ellipsoid, with four glowing teal '
    + 'points marking the structures listed after it. Drag to rotate, scroll to zoom.',
  hotspots:[
    { key:'tubules', label:'Seminiferous tubules', dir:[0.85,-0.1,0.3],
      text:'Seminoma arises here. These tightly coiled tubules make up most of the organ\'s volume; spermatogenesis proceeds along their walls from germ cells anchored near the basement membrane, with Sertoli cells surrounding and supporting the maturing cells at every stage. GCNIS, the precursor lesion nearly every testicular germ cell tumor arises from, develops within these same tubules before any invasion occurs.' },
    { key:'leydig', label:'Leydig cells', dir:[-0.3,0.35,-0.82],
      text:'Scattered through the loose interstitial tissue between tubules, these cells produce testosterone — the single largest source of the hormone in the male body, released under control of luteinizing hormone from the anterior pituitary.' },
    { key:'rete', label:'Rete testis', dir:[-0.15,0.88,-0.35],
      text:'An anastomosing network of channels in the mediastinum testis, along the gland\'s posterior aspect, where the seminiferous tubules converge before draining into the efferent ductules and on to the epididymis\'s head at the testis\'s upper pole.' },
    { key:'albuginea', label:'Tunica albuginea', dir:[0.3,0.45,0.82],
      text:'A durable fibrous capsule enclosing the whole gland, sending a thin connective-tissue layer inward between the seminiferous tubules. It is what gives the organ its firm, smooth feel on examination.' },
  ],
};

// ============================================================
// SEMINOMA
// ============================================================
// SITE MODEL — GATED before building, per CLAUDE.md's data-rule-16-and-onward practice of
// resolving a genuine design question before writing region data. The candidate departure was
// "seminoma's spread is a real, sequenced, contiguous chain (abdomen -> chest -> neck), so maybe
// it needs its own region-word family the way GBM's intratumor regions or Prostate's independent
// foci do." Ruling: NO — stays in the ordinary real-anatomical-spread family. The taxonomy this
// atlas already has was never about whether spread has internal order; it is about what KIND of
// thing the four blobs represent (real distant anatomical destinations vs. intratumor regions vs.
// independently-arising foci). A sequenced chain of real lymph-node stations and one real distant
// hematogenous site is still real anatomical spread. GBM (<1-2% extracranial spread, verified)
// and Prostate (76.5% multifocal, verified) each earned a departure against a hard number seminoma
// does not clear. What IS real and worth encoding is the ORDER — done through pos3d (caudal to
// cranial, see below) and prose, not through new schema.
// SOURCES, verified directly: Paly et al. (J Urol, 2013, PMID 23321493; 145 involved nodes across
// 90 patients with isolated nodal relapse) is the primary quantified anchor for WHERE seminoma's
// nodal disease actually sits: 84% para-aortic, 9% common iliac, 7% pelvic, and 99% of all
// involved nodes fell within 2.5cm of the aorta below the T12/L1 disc space — a strikingly tight,
// predictable landing zone, which is WHY radiotherapy planning for seminoma can use a fixed field
// at all. Zeng et al. (Front Oncol, 2025, PMID 39977396) adds the laterality rule (left-sided
// primaries drain to para-aortic nodes, right-sided to interaortocaval — respected in this
// region's own note without inventing a numeric split this atlas doesn't need) and the real
// contralateral-microscopic-spread figure (6-11.1%). Wood et al. (J Urol, 1996, PMID 8617040)
// is the source for the CONTIGUOUS, ORDERED character of spread — quoted directly: "The
// contiguous nature of disease spread from abdomen to chest and neck in seminoma is confirmed" —
// used here only for that qualitative, ordering claim, not for a specific percentage at each
// station (a closer read of that abstract's own numbers left real ambiguity about whether they
// describe marginal prevalence or a conditional/template relationship between stations; rather
// than risk shipping a misread figure, no percentage from that source is used). Lung as a fourth,
// distinctly HEMATOGENOUS (not nodal) site is real and distinctively LOW for seminoma specifically
// — Wood 1996: lung metastasis in 9% of seminoma vs 40% of NSGCT, the sharpest histology contrast
// in that paper — stated in this site's own note as the honest reason it sits fourth rather than
// as another nodal station.
// POS3D — caudal to cranial by TRUE anatomical height (not a straight line): para-aortic nodes
// (abdomen) sit lowest; mediastinal nodes and lung both sit at chest height (lung offset in
// x/z as a materially different, hematogenous route, not "above" the mediastinum); supraclavicular
// nodes (neck) sit highest. This keeps the real body-height ordering honest while still reading,
// on screen, as the finding it exists to show: every successive site sits level with or above the
// last, tracing the disease's real path up the body. Region ids PA/MD/SC/LG verified against the
// full 46-id registry already in use elsewhere in this app before being written (none collide).
const REGIONS_SEMINOMA = [
  { id:'PA', name:'Para-aortic lymph nodes', color:cssVar('--coral'), pos3d:{x:-1.1,y:-1.75,z:0.3},
    branch:{ gene:'KIT activating mutation', class:'driver', ccf:'~5&ndash;35% of seminoma depending on cohort size and whether restricted to pure seminoma (5.1% exon 17 of 220 tumors, the largest single cohort, Coffey et al., 2008; ~18% of TCGA\'s mixed seminoma/NSGCT cohort rising to ~35% within its 72 pure-seminoma subset, Shen et al., 2018)', note:'A receptor tyrosine kinase turned constitutively on, almost always by a mutation in the activation loop (exon 17) rather than the juxtamembrane domain (exon 11) — the reverse of KIT\'s usual pattern in gastrointestinal stromal tumors. First landing zone for seminoma\'s real, tightly clustered nodal spread: 84% of involved nodes in a large surveillance-relapse series were para-aortic, and 99% fell within 2.5cm of the aorta below the T12/L1 disc space (Paly et al., 2013) — the predictable geography that makes template radiotherapy fields possible for this disease.' } },
  { id:'MD', name:'Mediastinal lymph nodes', color:cssVar('--azure'), pos3d:{x:1.15,y:-0.15,z:-0.25},
    branch:{ gene:'KIT activating mutation', class:'driver', ccf:'~5&ndash;35% of seminoma (same range as the Para-aortic site)', note:'The same mutation class as the Para-aortic site — real seminomas with KIT mutations are not confined to one metastatic step, since the mutation is present in the primary tumor before any spread occurs. The next real station up the chain: seminoma\'s nodal spread is described as contiguous and ordered from abdomen toward chest (Wood et al., 1996), unlike the more erratic, hematogenous-first pattern of non-seminomatous tumors.' } },
  { id:'SC', name:'Supraclavicular lymph nodes', color:cssVar('--amber'), pos3d:{x:-1.05,y:1.05,z:0.35},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'~14% of testicular germ cell tumors, exclusively in seminoma except for one mixed-tumor case (TCGA, Shen et al., 2018)', note:'An activating RAS-pathway mutation documented co-occurring with KIT in the same tumor in TCGA\'s cohort (6 of the cohort\'s seminomas carried both) — safe alongside the branch gene used at the two more proximal sites. The most cranial real nodal station in seminoma\'s classic spread pattern, at the base of the neck.' } },
  { id:'LG', name:'Lung', color:cssVar('--violet'), pos3d:{x:1.0,y:1.6,z:-0.4},
    branch:{ gene:'KRAS mutation', class:'driver', ccf:'~14% of testicular germ cell tumors, exclusively in seminoma except for one mixed-tumor case (TCGA, Shen et al., 2018)', note:'The same mutation as the Supraclavicular site. Unlike the three lymph-node sites above, this is hematogenous spread — and distinctively rare for seminoma specifically: 9% of seminoma develops lung metastasis versus 40% of non-seminomatous germ cell tumors, the sharpest single contrast in a classic comparison of the two histologies (Wood et al., 1996) — one more way seminoma behaves like the gentler half of this disease.' } },
];

// TRUNK — a deliberately different KIND of genomic event from every point-mutation trunk
// elsewhere in this atlas: a whole-arm chromosomal gain, not a base change. The real parallel
// already built into this app is Prostate's TMPRSS2-ERG fusion, its other non-point-mutation
// trunk/branch event — both are structural rather than sequence-level lesions, stated here as the
// cross-reference it is.
// FRAMING, corrected from an earlier misreading before anything was written: i(12p) is NOT a
// precursor-documented, HCC-TERT-style temporal trunk. It is the INVASION-DEFINING event —
// absent from GCNIS by definition and present only once invasion has occurred. Fichtner et al.
// (2026, PMC12700052): "It is thought that the isochromosome 12p develops during the progression
// of a GCNIS to an invasive TGCT." Ravisankar et al. (2026, PMID 42628849): i(12p) is "a hallmark
// of invasive germ cell tumors that is absent in GCNIS," with a FISH series showing GCNIS-only
// lesions essentially negative for it while invasive seminoma components were positive — "All
// seminoma components negative for i(12p) showed polysomy 12, suggesting that these are mutually
// exclusive alterations" (a real, verified alternate route to the same net 12p gain).
// TWO DIFFERENT QUANTITIES, not one range: i(12p) SPECIFICALLY is found in 87% of tumors (114 of
// 131, TCGA, Shen et al., 2018) — and the 17 tumors TCGA found lacking i(12p) all "retained at
// least 4 copies of 12p," i.e. gained the same material a different way. 12p GAIN BY ANY
// MECHANISM (i(12p) or polysomy) is the broader, ~73% figure (536 FISH specimens; PMID 33798590:
// "12p gains are likely to be present in approximately 73% of male GCT," sensitivity 77.2%).
// Both are real, verified, and are not the same quantity — stated as two distinct figures
// rather than folded into one range.
const TRUNK_SEMINOMA = [
  { gene:'Isochromosome 12p [i(12p)] / 12p gain', class:'driver', ccf:'i(12p) specifically: 87% of tumors (114/131, TCGA, Shen et al., 2018). 12p gain by any mechanism (i(12p) or polysomy 12): ~73% of male germ cell tumors across a 536-specimen FISH series (PMID 33798590) &mdash; two related but distinct quantities, not one range', note:'A whole extra copy of chromosome 12\'s short arm — a structural, whole-arm chromosomal gain, not a point mutation, the same different KIND of event as this atlas\'s Prostate cancer, whose TMPRSS2-ERG gene fusion is its other non-point-mutation trunk/branch lesion. This is the change that marks the transition from the noninvasive precursor to an actual tumor: it is essentially absent from GCNIS itself and appears only once invasion has occurred, so it functions as this cancer\'s invasion-defining event rather than a precursor-stage marker. A minority of tumors reach the same net 12p gain a different way &mdash; extra whole copies of chromosome 12 (polysomy) without the isochromosome itself &mdash; and the two routes appear to be mutually exclusive alternatives to the same destination rather than two independent hits.' },
];

// PRIVATE POOL — checked for mechanistic fit against the trunk (i(12p)) and both branch-site
// genes (KIT, KRAS) before inclusion, same standard as every prior organ.
// NRAS EXCLUDED, deliberately, despite being real and TCGA-significant (4% of the cohort,
// "exclusively in seminomas except for one KRAS mutation in an NSGCT"): TCGA states "mutations
// in KRAS and NRAS co-existed in only one seminoma" — near-mutually-exclusive with KRAS. Because
// this atlas's private pool is drawn independently into cells at EVERY site regardless of that
// site's branch gene, putting NRAS in the pool would let it land in the same rendered cell as a
// KRAS branch hit at the Supraclavicular/Lung sites at random — depicting a combination the real
// data says essentially does not happen. The KIT-and-bilateral-disease exclusion this atlas
// already made once (two directly conflicting primary sources) is the same discipline applied
// here to a same-tumor co-occurrence conflict instead of a between-tumor one.
// PIK3CB admitted on real, if thinner, evidence: a 2025 real-world sequencing cohort found
// somatic alterations in 56% (15/27) of TGCT patients, "primarily in KRAS (25.9%), KIT (11.1%),
// and PIK3CB (7.4%)" (PMC12469615) — reported alongside KIT and KRAS as part of the same altered
// fraction, not flagged against either, and no interaction analysis anywhere in this file's
// research flagged a conflict. Smaller and less established than TCGA's own three
// significantly-mutated genes, and stated as such rather than presented at TCGA's evidentiary
// weight.
const PRIVATE_POOL_SEMINOMA = [
  { gene:'PIK3CB alteration', class:'driver', ccf:'~7.4% in a real-world sequencing cohort of testicular germ cell tumors (2/27, PMC12469615) &mdash; a smaller, less-established cohort than TCGA\'s own significantly-mutated gene list', note:'A catalytic PI3-kinase subunit gene, found altered alongside KIT and KRAS in the same real-world cohort without any documented conflict against either. Included on thinner evidence than this atlas\'s usual bar, and described that way rather than inflated to TCGA\'s own confidence level.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome. It fits this tumor especially well: seminoma\'s overall mutation burden is unusually low (see the Trunk-mutations panel\'s companion fact), so passenger noise like this makes up a larger share of what little is there.' },
];

// HISTOLOGY — PathologyOutlines was unreachable for this pass (HTTP 429, same block the OCCC
// pass hit), so the morphologic load rests on two open-access sources: a 2019 case-report review
// (PMC6906820) and a 2026 case report (PMC13218944), both checked directly. Verbatim: "The cells
// are arranged into nests and sheets with intercepting thin fibrovascular septa which have
// lymphocytes and sometimes syncytiotrophoblasts. Cells have clear or eosinophilic cytoplasm with
// large nuclei and prominent nucleoli" (PMC6906820); "well-circumscribed solid intratesticular
// nodule with fibrous septa and lymphocytic infiltrates, arising from germ cell neoplasia in situ"
// (PMC13218944). Deliberately NOT drawn: granulomatous reaction (real in seminoma but described
// only qualitatively, no source gave a frequency or a clean standalone visual worth a fourth
// feature slot over the three used); syncytiotrophoblasts (real but occasional — "sometimes" in
// the source's own wording — so left to the intro's prose rather than given a dedicated feature
// that would overstate how often they appear).
const HISTOLOGY_SEMINOMA = {
  intro: 'Seminoma grows as sheets and nests of tumor cells divided into lobules by thin fibrovascular septa — and those septa carry the tumor\'s single most recognizable microscopic feature: a lymphocytic infiltrate, dense enough that pathologists routinely notice the immune response before the tumor cells themselves. The cells are uniform, large and polygonal, with clear-to-eosinophilic cytoplasm, prominent nucleoli, and distinct cell borders — round to polyhedral, packed tightly but not fused into a syncytium. Occasional multinucleated syncytiotrophoblasts sit scattered among them, unrelated to any true trophoblastic component.',
  ariaSummary: 'Stylized microscopic field: sheets of large, uniform, round to polygonal tumor cells with pale clear cytoplasm, distinct cell borders and prominent central nucleoli, divided into lobules by thin pink fibrovascular septa. Clusters of small dark lymphocytes sit within the septa between lobules. One larger multinucleated cell floats among the tumor sheet, representing a syncytiotrophoblast.',
  citation: 'Classic Testicular Seminoma in Men Aged 50 Years or Over: A Case Report and Review of the Literature (PMC6906820); A pure intertubular testicular seminoma mimicking a burned-out tumor: a case report (PMC13218944).',
  features: [
    { key:'sheets', label:'Sheets divided by septa',
      text:'Tumor cells grow as nests and sheets, divided into poorly demarcated lobules by thin fibrovascular septa — the architecture a low-power view first reveals, well before any single cell\'s features are visible.' },
    { key:'lymphocytes', label:'Lymphocytic infiltrate',
      text:'A lymphocytic infiltrate running through the fibrovascular septa between tumor lobules — often the first thing that draws the eye at low power, and one of the most consistent, recognizable features of this tumor across the literature.' },
    { key:'cytology', label:'Clear polygonal cells',
      text:'Large, round-to-polyhedral cells with distinct cell borders, clear-to-eosinophilic cytoplasm, and prominent nucleoli — uniform from cell to cell, unlike the marked pleomorphism this atlas\'s other tumors often show.' },
  ],
};

export const cancerDetails = {
  seminoma: {
    title:'Seminoma', screenLabel:'Seminoma — tumor explorer',
    legendTitle:'Sites (real, ordered nodal-then-hematogenous spread)',
    regions:REGIONS_SEMINOMA, trunk:TRUNK_SEMINOMA, privatePool:PRIVATE_POOL_SEMINOMA,
    histology: HISTOLOGY_SEMINOMA,
  },
};
