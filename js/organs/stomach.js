import * as THREE from 'three';
import { organicDisplace } from '../viewer.js';
import { cssVar } from '../viewer.js';

// active:true. Alias collision check (same convention as every prior organ): no other organ's
// aliases use "stomach", "gastric", "signet", "linitis", or "diffuse". "gastric adenocarcinoma"
// is safe for the same alias.includes(query) reason as "colorectal adenocarcinoma" — no Lungs
// alias contains it. "signet ring" and "linitis plastica" are included because they are the
// terms a person who has just heard them from a pathologist would actually type.
export const organEntry = { key:'stomach', label:'Stomach', system:'Digestive', active:true, sexes:['female','male'], aliases:['stomach','gastric','gastric adenocarcinoma','signet ring','linitis plastica','diffuse gastric'] };

// Left upper quadrant — the stomach sits "on the left of the midline and centrally in the
// upper abdominal area" (StatPearls NBK482334), fundus under the left hemidiaphragm. Negative
// angle = the patient's left, opposite sign from the liver's +40 across the midline — the two
// organs' real anatomical relationship. Spacing checked against the nearest same-side markers
// (Breast -35 at 0.70, Kidneys -50 at 0.53), then verified by screenshot on both sexes.
export const markerSpec = { points:[{heightFrac:0.585, angle:-32}] };

// The cancer list IS the Lauren classification — the user-facing subtype split for this organ
// (Lauren, Acta Pathol Microbiol Scand, 1965: the two histological main types, diffuse and
// so-called intestinal, plus the later indeterminate/mixed category). Frequencies: the widely
// circulated "intestinal 54% / diffuse 32% / mixed 15%" set was checked and REJECTED — it is a
// mis-citation chain (Hu et al., J Gastrointest Oncol, 2012 cites a 41-patient ESOPHAGEAL/GEJ
// study, Polkowski et al. 1999, whose real figures are 54% intestinal / 32% MIXED / 15%
// DIFFUSE — the diffuse and mixed values were transposed en route AND applied to the wrong
// organ). The figures used instead are the largest real gastric series typing all three
// categories: the Korean Gastric Cancer Association 2009 nationwide survey (N=14,658,
// J Gastric Cancer, 2011): intestinal 50.0%, diffuse 39.0%, mixed 10.9% — a surgically-treated
// cohort, stated as such; Dutch population-based data (van der Kaaij et al., Eur J Cancer,
// 2020, N=32,312) put intestinal at 55% and diffuse at 44% (mixed handling unknown — full text
// paywalled). Real cross-series ranges: intestinal 46-57%, diffuse 22.5-44%, mixed 11-21%.
//
// WHY THE DIFFUSE TYPE IS THE ONE WIRED UP (a deliberate choice the task required explaining):
// (1) its driving lesion — loss of the cell-adhesion molecule E-cadherin — is a mechanism
// class no other cancer in this atlas has (every other trunk is a growth/genome-integrity
// pathway); (2) the molecule-to-bedside chain is complete and verified end to end (CDH1 loss →
// discohesion → signet-ring cells → linitis plastica); (3) its microscopic appearance is
// genuinely distinct from the two gland-forming panels this same pass adds (intestinal-type is
// BY DEFINITION "similar to intestinal adenocarcinoma" — drawing it would repeat the colon
// slide); (4) the intestinal type is falling in incidence while diffuse holds or rises. The
// more common intestinal type stays listed with its real share, per the app's usual pattern.
export const cancerEntries = [
  { id:'gint',  name:'Gastric adenocarcinoma — intestinal type (Lauren)', share:'50.0% of gastric cancers in the largest series typing all three Lauren categories (Korean nationwide surgical survey, N=14,658, KGCA, 2011); 55% in Dutch population data — gland-forming, TP53/chromosomal-instability-associated', active:false, organKey:'stomach' },
  { id:'gdiff', name:'Gastric adenocarcinoma — diffuse type (Lauren)',    share:'39.0% of gastric cancers (KGCA, 2011, N=14,658); 44% in Dutch population data — the WHO now calls this poorly cohesive carcinoma', active:true,  organKey:'stomach' },
  { id:'gmix',  name:'Gastric adenocarcinoma — mixed/indeterminate type', share:'10.9% of gastric cancers (KGCA, 2011); 10.9–21.1% across real series — whether it behaves like intestinal or diffuse type is genuinely disputed', active:false, organKey:'stomach' },
];

// PROCEDURAL, deliberately — the one new organ of this pass without a real scan, following the
// Ovary precedent (real proportions on a procedural mesh) after the sourcing search came up
// genuinely empty rather than lazily unsearched:
// - The HRA 3D reference library contains NO stomach at all — confirmed four independent ways
//   (all 80 NIH 3D entries enumerated; HRA reference-organs API; HRA linked-open-data catalog;
//   live NIH 3D search). The stomach is outside HRA/HuBMAP scope entirely (no ASCT+B table).
// - NIH 3D's only stomach (3DPX-021124, third-party) has four mutually contradictory
//   attribution statements and GLB metadata revealing a Sketchfab artist sculpt — unusable
//   under CC BY. BodyParts3D's stomach is 1,810 triangles (placeholder tier) with a
//   self-contradictory license (site says CC BY 4.0; the OBJ header still says CC BY-SA 2.1
//   Japan). Z-Anatomy's stomach is real but CC BY-SA (copyleft this cleanly-CC-BY project
//   deliberately avoids). Open Anatomy's SPL Liver Atlas has a real CT-derived stomach
//   (35,088 points) — the strongest candidate found — but under the 3D Slicer BSD-style
//   license, whose distribution terms require reproducing the entire license text: a second
//   license regime, flagged for review rather than silently adopted (swapping it in later is a
//   contained change if wanted).
// So: a swept-tube J built to VERIFIED real dimensions rather than an arbitrary blob —
// "In the erect posture the empty stomach is somewhat J-shaped" (Gray's Anatomy, 1918), with
// Gray's own caveat that "no one form can be described as typical"; distended length "about 10
// to 11 inches (25 to 27.5 cm.)" and greatest diameter "not more than 4 to 4.5 inches (10 to
// 11.2 cm.)" (Cunningham's Text-book of Anatomy, 1905); the direct cardia-to-pylorus chord
// "varies from 3 to 5 inches (7.5 to 12.5 cm.)" (same); the greater curvature "four or five
// times as long as the lesser curvature" (Gray's, 1918). This mesh: ~29cm along its axis —
// inside the 26-34cm range Cunningham attributes to the authorities he surveys, just past his
// own 25-27.5cm headline figure — 10.4cm greatest diameter, ~11.6cm cardia-pylorus chord, a
// fundus dome overhanging the cardia level, and the pylorus riding ~8.5cm above the greater
// curvature's most dependent point — each checked against those
// quotes, not eyeballed. Single-silhouette convention (no esophageal or duodenal stubs), same
// reasoning as Prostate's dropped duct appendages.
// MATERIAL COLOR — one honest gap, stated rather than papered over: no fetchable source states
// a color for the normal gastric SEROSA in words (the gross-anatomy classics describe the
// serous coat's extent, not its color; the mucosa is "of a pinkish tinge at the pyloric end,
// and of a red or reddish-brown color over the rest" — Gray's, 1918 — but that is the INSIDE).
// The exterior tone used here (0xc08a7c, a deeper pink-tan than the colon's) is a flagged
// INFERENCE from continuous GI serosa descriptions ("pink-tan and smooth" colon serosa,
// Cureus, 2022; "red-tan and glistening" jejunal serosa, CRSLS, 2022), not a verified quote —
// the one organ color in this atlas carried as inference, recorded here and in CLAUDE.md.
// SILHOUETTE REVISION (review feedback, pre-commit): the first build was dimensionally
// correct but read as a rounded blob, and two geometry causes were found rather than
// nudged at: (1) the end "caps" were single pole-vertex FANS — i.e. cones — so any wide
// fundus end necessarily rendered as a taper-to-a-tip instead of a dome (the wider the
// fundus radius, the worse); both ends now get real HEMISPHERE caps (three intermediate
// rings + pole), which is what finally makes the fundus a blunt dome and the pylorus a
// rounded knob. (2) The radius taper was too gradual and the axis bend too gentle for the
// antral narrowing and J-hook to register. This profile fixes the READ, keeping every
// verified dimension: a much steeper radius falloff after the body (0.052 → 0.038 → 0.026
// → 0.017 — the antral narrowing), a tighter axis hook whose inner edge goes genuinely
// concave (the lesser curvature, with an incisura-like sweep where body meets antrum), and
// a longer two-station pyloric tube that climbs — the pylorus ends ~8.5cm above the
// greater curvature's lowest point. The axis now STARTS at the dome's equator (the
// hemisphere cap supplies everything above it).
const STOMACH_AXIS = [
  [ 0.056,  0.080,  0.003],   // fundus dome equator (the hemisphere cap rises above this)
  [ 0.058,  0.052,  0.006],   // widest zone (fundus/upper body)
  [ 0.042, -0.005,  0.010],   // body
  [ 0.012, -0.058,  0.010],   // lower body, entering the hook
  [-0.030, -0.078,  0.004],   // the bend — greater curvature's most dependent stretch
  [-0.066, -0.055, -0.002],   // antrum, climbing toward the patient's right
  [-0.080, -0.030, -0.002],   // pyloric canal
  [-0.086, -0.018, -0.002],   // pylorus end — the hook's high end (rounded by its own cap)
];
const STOMACH_RADII = [0.046, 0.052, 0.047, 0.038, 0.026, 0.017, 0.011, 0.008];
const STOMACH_SEED = 4.2;

export function buildStomachMesh(){
  const pts = STOMACH_AXIS.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const SEGS = 72, AROUND = 48, CAP_RINGS = 3;
  const frames = curve.computeFrenetFrames(SEGS, false);
  // radius profile: Catmull-Rom over the control radii, stationed at each control point's
  // ARC-LENGTH fraction along the axis — getPointAt(t) below is arc-length-parameterized, so
  // indexing the radii by control-point NUMBER instead would slide every radius to the wrong
  // station (the control points are not evenly spaced: the fundus segment is short, the body
  // segments long). Caught when the first render showed a thin fundus and a fat pylorus.
  const stations = [0];
  for(let i=1;i<pts.length;i++) stations.push(stations[i-1] + pts[i].distanceTo(pts[i-1]));
  const total = stations[stations.length-1];
  for(let i=0;i<stations.length;i++) stations[i] /= total;
  const radiusAt = (t)=>{
    const n = STOMACH_RADII.length - 1;
    let i = 0;
    while(i < n-1 && t > stations[i+1]) i++;
    const u = Math.min(Math.max((t - stations[i]) / (stations[i+1] - stations[i]), 0), 1);
    const r0 = STOMACH_RADII[Math.max(i-1,0)], r1 = STOMACH_RADII[i],
          r2 = STOMACH_RADII[Math.min(i+1,n)], r3 = STOMACH_RADII[Math.min(i+2,n)];
    // standard Catmull-Rom basis
    return 0.5*((2*r1) + (-r0+r2)*u + (2*r0-5*r1+4*r2-r3)*u*u + (-r0+3*r1-3*r2+r3)*u*u*u);
  };
  // Assemble the full ring list first — hemisphere cap rings at the fundus end, the swept
  // tube, hemisphere cap rings at the pylorus end — then tessellate uniformly. 0.92 slightly
  // squashes both domes along the axis so they read organic rather than geometrically perfect.
  const rings = []; // each: {P, N, B, r}
  const t0 = curve.getTangentAt(0), t1 = curve.getTangentAt(1);
  const Pstart = curve.getPointAt(0), Pend = curve.getPointAt(1);
  const rStart = STOMACH_RADII[0], rEnd = STOMACH_RADII[STOMACH_RADII.length-1];
  const N0 = frames.normals[0], B0 = frames.binormals[0];
  const N1 = frames.normals[SEGS], B1 = frames.binormals[SEGS];
  for(let k=CAP_RINGS; k>=1; k--){
    const a = (k/(CAP_RINGS+1))*(Math.PI/2); // polar angle from the equator toward the pole
    rings.push({
      P: Pstart.clone().addScaledVector(t0, -rStart*0.92*Math.sin(a)),
      N: N0, B: B0, r: rStart*Math.cos(a),
    });
  }
  for(let i=0;i<=SEGS;i++){
    const t = i/SEGS;
    rings.push({ P: curve.getPointAt(t), N: frames.normals[i], B: frames.binormals[i], r: radiusAt(t) });
  }
  for(let k=1; k<=CAP_RINGS; k++){
    const a = (k/(CAP_RINGS+1))*(Math.PI/2);
    rings.push({
      P: Pend.clone().addScaledVector(t1, rEnd*0.92*Math.sin(a)),
      N: N1, B: B1, r: rEnd*Math.cos(a),
    });
  }
  const positions = [], indices = [];
  rings.forEach(ring=>{
    for(let j=0;j<AROUND;j++){
      const a = j/AROUND*Math.PI*2;
      positions.push(
        ring.P.x + (ring.N.x*Math.cos(a) + ring.B.x*Math.sin(a))*ring.r,
        ring.P.y + (ring.N.y*Math.cos(a) + ring.B.y*Math.sin(a))*ring.r,
        ring.P.z + (ring.N.z*Math.cos(a) + ring.B.z*Math.sin(a))*ring.r
      );
    }
  });
  for(let i=0;i<rings.length-1;i++){
    for(let j=0;j<AROUND;j++){
      const a = i*AROUND+j, b = i*AROUND+(j+1)%AROUND, c = (i+1)*AROUND+j, d = (i+1)*AROUND+(j+1)%AROUND;
      indices.push(a,b,c, b,d,c);
    }
  }
  // pole vertices closing both hemispheres
  const lastRing = rings.length-1;
  const pole0 = positions.length/3;
  positions.push(Pstart.x - t0.x*rStart*0.92, Pstart.y - t0.y*rStart*0.92, Pstart.z - t0.z*rStart*0.92);
  const pole1 = positions.length/3;
  positions.push(Pend.x + t1.x*rEnd*0.92, Pend.y + t1.y*rEnd*0.92, Pend.z + t1.z*rEnd*0.92);
  for(let j=0;j<AROUND;j++){
    indices.push(pole0, (j+1)%AROUND, j);
    indices.push(pole1, lastRing*AROUND+j, lastRing*AROUND+(j+1)%AROUND);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  // Same deterministic organic surface treatment as the procedural Ovary — amplitude is
  // FRACTIONAL (radial scale), so 0.022 on this ~10cm-from-origin mesh is ~2mm of wobble at
  // the extremities, a serosal-surface irregularity rather than a shape change.
  organicDisplace(geo, 0.022, 14, STOMACH_SEED);
  const mat = new THREE.MeshPhysicalMaterial({ color:0xc08a7c, roughness:0.58, metalness:0.0, specularIntensity:0.15 });
  return new THREE.Mesh(geo, mat);
}

export const organDetail = {
  eyebrow:'Digestive System', title:'Stomach',
  sub:'J-shaped reservoir · cardia, fundus, body, antrum & pylorus · stores food and begins protein digestion',
  facts:[
    {label:'Regions', val:'Five named regions — cardia, fundus, body, antrum &amp; pylorus (some references fold the antrum into a four-part scheme)'},
    {label:'Capacity', val:'A few tens of mL when empty (25 ± 18 mL by MRI) — stretching to hold 2–3 L, up to ~4 L'},
    {label:'Function', val:'Temporary storage plus mechanical &amp; chemical digestion — parietal cells secrete acid &amp; intrinsic factor, chief cells pepsinogen'},
    {label:'Blood supply', val:'Celiac trunk &amp; its branches: left &amp; right gastric (lesser curvature), gastro-omental arteries (greater curvature), 3–5 short gastrics (fundus)'},
  ],
  // The muscle-wall fact gets the second-sentence treatment every organ's one genuinely
  // distinguishing fact gets: the stomach is the only part of the GI tract with THREE muscle
  // layers — "The inner oblique layer is unique to the stomach and is primarily responsible
  // for food churning and mechanical digestion" (StatPearls NBK482334) — which is also why
  // its wall is the natural home of one of the four investigate points below. Capacity
  // figures: the folkloric "~50 mL empty" was checked and NOT found citable; the measured MRI
  // values (25 ± 18 mL, Grimm et al., 2018; 35 ± 7 mL, Mudie et al., 2014) are used instead,
  // with StatPearls' 2-3 L and OpenStax's ~4 L for the distended end.
  desc:'The stomach hangs below the diaphragm as a J-shaped pouch — in the classic erect, empty posture at least; Gray\'s Anatomy itself cautions that "no one form can be described as typical." Food enters at the cardia (level of the tenth thoracic vertebra, left of the midline), the dome-shaped fundus rises above and to the left under the diaphragm, and the body sweeps down the long convex greater curvature — four to five times the length of the short, concave lesser curvature — before the antrum narrows to the pylorus, right of the midline, where a muscular sphincter meters food into the duodenum. Uniquely in the digestive tract, its wall carries three muscle layers; the extra inner oblique layer churns food against gastric juice acidified to pH 1.5–3.5. Gastric adenocarcinoma arises from the glandular epithelium of its mucosal lining. One note about this 3D model itself: it is procedural — built to published dimensions rather than derived from a scan — and its pink-tan surface tone is an inference from published descriptions of neighboring digestive-tract organs\' outer surfaces, because no anatomical source states the stomach\'s own serosal color in words.',
  buildMesh: buildStomachMesh,
  // Procedural mesh in real meters (~18 x 20 x 10cm envelope) — pos-anchored hotspots put it
  // through the same frameContents/scaled-marker path as the real-scan organs (that branch
  // keys on pos-vs-dir anchoring, not on how the mesh was made), which also means no marker
  // glow lights — correct here for the same reason as the real organs: these anchors sit ON
  // the surface, where a point light degenerates to distance zero (see main.js's clip-fix
  // comment). minRadius/maxRadius are real-meter values.
  viewer:{ theta:0.5, phi:1.15, radius:0.42, minRadius:0.12, maxRadius:1.0, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional model of a stomach, a smooth J-shaped pouch — the rounded fundus '
    + 'dome at the upper right of the view, the body descending along its long outer curve, the '
    + 'antrum and pylorus tapering up toward the lower left — with four glowing teal points '
    + 'marking the structures listed after it. Drag to rotate, scroll to zoom.',
  // pos: literal anchor points (meters) on this procedural mesh's own generated surface —
  // computed from the identical curve/radius parameterization above (then nudged by the same
  // deterministic organicDisplace formula), not raycast approximations. Verified visible at
  // the default camera angle by screenshot, per the Kidneys lesson.
  hotspots:[
    // The "arises here" point every organ leads with.
    { key:'pits', label:'Gastric pits & glands', pos:[0.0550, 0.0500, 0.0585],
      text:'The mucosal surface is dotted with millions of gastric pits, each the mouth of a gland: parietal cells secreting hydrochloric acid and intrinsic factor, chief cells secreting pepsinogen — activated to pepsin by that same acid. Gastric adenocarcinoma arises from the glandular epithelium of this mucosa, directly paralleling how colorectal cancer begins in the colon\'s glandular lining and pancreatic cancer in the ductal epithelium.' },
    { key:'rugae', label:'Rugae', pos:[0.0320, -0.0080, 0.0549],
      text:'The large accordion folds the mucosa and submucosa collapse into when the stomach is empty — flattening out as it fills, part of how a resting volume of a few tens of milliliters stretches to hold liters. In the diffuse type of gastric cancer, extensive infiltration of the wall can efface these folds entirely: the rigid, non-distensible "leather bottle" stomach (linitis plastica).' },
    { key:'muscle', label:'Muscularis externa', pos:[-0.0150, -0.0920, 0.0304],
      text:'Three smooth-muscle layers — longitudinal, circular, and an inner oblique layer found nowhere else in the GI tract — churn food against gastric juice. In cancer staging this wall is the yardstick: a tumor invading the muscularis propria is T2, and the diffuse type characteristically spreads within these wall layers rather than growing as a mass into the lumen.' },
    { key:'pylorus', label:'Pyloric sphincter', pos:[-0.0800, -0.0260, 0.0077],
      text:'The circular muscle layer thickens here into the sphincter that meters chyme into the duodenum — holding each ~30 mL portion of the antrum\'s contents until it is liquid enough to pass. G cells in this region secrete gastrin, the hormone that drives the parietal cells\' acid production upstream.' },
  ],
};

// EVERY citation in this organ's data was verified directly at the source before being written
// in. The single most consequential verification outcome is recorded on the cancerEntries
// comment above (the Lauren 54/32/15 mis-citation chain). Others that shaped this block:
// - "Diffuse type is more common in women" — checked and NOT CONFIRMED; it is sex-EQUAL
//   (incidence M/F 1.07 vs intestinal's 2.65, Derakhshan et al., Gut, 2009; "diffuse-type
//   cancers occur equally in both sexes", StatPearls) — the claim is not used anywhere here.
// - H. pylori is "equally associated with the intestinal or diffuse type" (Huang et al.,
//   Gastroenterology, 1998) — the CORREA CASCADE (atrophic gastritis → intestinal metaplasia)
//   is intestinal-specific, H. pylori itself is not; worded accordingly in gint's share line
//   territory and kept out of gdiff's story.
// - StatPearls' gastric chapter contains a self-contradictory sentence ("Intestinal-type
//   cancers may be associated with signet-ring cells") that its own later text and every
//   other source contradict — flagged as a source error, not used.
//
// MUTATION-FRAMING MODEL: the two branch events below are COMPETING in the strict, TCGA-stated
// sense — "The CLDN18–ARHGAP fusions were mutually exclusive with RHOA mutations and were
// enriched in genomically stable tumours" (TCGA, Nature, 2014) — so they are split two sites
// each, the same architecture as GBM's EGFR/PDGFRA and Prostate's ERG/SPOP, never shown in one
// cell. Within the genomically-stable subtype, 30% of cases carry one or the other.
//
// EXCLUDED from this cancer's ledger, each for a verified subtype reason (the same class of
// check as LUAD's EGFR rule, applied along the molecular-subtype axis):
// - ARID1A: mutation is concentrated in the MSI (83%) and EBV (73%) subtypes vs 11% in
//   non-EBV/MSS disease (Wang K et al., Nat Genet, 2011) — the wrong subtypes for a
//   genomically-stable/diffuse tumor — AND it is "negatively associated with mutations in
//   TP53" (same paper), which is in this private pool.
// - PIK3CA: EBV-defining (80% of EBV-positive tumors vs 3-42% elsewhere, TCGA 2014).
// - RNF43: MSI-associated (TCGA 2014 hypermutated analysis).
// - ERBB2/HER2 and the CCNE1/CCND1/CDK6 amplifications: CIN-subtype events (TCGA 2014) — the
//   intestinal-side biology, not this tumor's.
const REGIONS_GDIFF = [
  // Site frequencies: Riihimäki et al. (Oncotarget, 2016, PMID 27447571) — Swedish national
  // cohort, N=7,559 gastric cancers, site shares among metastatic patients (~39% of the
  // cohort; ≈2,925 patients): liver 48%, peritoneum 32%, lung 15%, bone 12%. The same paper's
  // Table 3 carries the diffuse-relevant twist stated in the Liver and Peritoneum notes:
  // signet-ring histology flips the pattern (peritoneum 58% vs 28%, OR 2.3; liver 16% vs 53%,
  // OR 0.3). Lymph nodes are real but deliberately NOT a site here: the source explicitly
  // excluded nodal metastases from its distribution ("Metastases to lymph nodes (C77) ...
  // were not included in this analysis"), so no citable percentage exists — same class of
  // honesty as PDAC's peritoneum, resolved the opposite way (drop the site) because four
  // better-quantified sites exist.
  { id:'GL', name:'Liver', color:cssVar('--coral'), pos3d:{x:1.45,y:1.0,z:0.3},
    branch:{ gene:'RHOA mutation', class:'driver', ccf:'15% of genomically-stable gastric cancers — the molecular subtype 73% of diffuse-type tumors belong to; "identified ... almost exclusively in genomically stable tumours" (TCGA, Nature, 2014)', note:'RHOA is a small GTPase governing cell movement and cohesion — mutating it is the second route (after CDH1 loss itself) by which this subtype breaks the rules that keep epithelial cells attached and organized. Mutually exclusive with the CLDN18–ARHGAP fusion shown at the Peritoneum and Bone sites: a real either/or, stated by TCGA directly, modeled here the same way as GBM\'s EGFR/PDGFRA split. Liver is gastric cancer\'s most common metastatic site overall — 48% of metastatic patients (Riihimäki et al., Oncotarget, 2016, N=7,559) — but the diffuse/signet-ring form specifically UNDER-uses it: 16% vs 53% for other adenocarcinomas (OR 0.3, same study), trading blood-borne liver spread for the peritoneal route.' } },
  { id:'GP', name:'Peritoneum', color:cssVar('--azure'), pos3d:{x:-1.5,y:0.8,z:0.35},
    branch:{ gene:'CLDN18–ARHGAP fusion', class:'driver', ccf:'15% of genomically-stable gastric cancers (CLDN18–ARHGAP6 or ARHGAP26 fusions, TCGA, Nature, 2014); fusions plus RHOA mutations together cover 30% of that subtype', note:'A fusion joining the tight-junction protein claudin-18 to a Rho-GTPase-activating protein — like RHOA mutation (its mutually exclusive counterpart at the Liver and Lung sites), it strikes at cell adhesion and motility, this subtype\'s defining theme. The peritoneum is the diffuse type\'s signature territory: 32% of metastatic gastric-cancer patients overall, rising to 58% for signet-ring histology vs 28% for other adenocarcinomas (OR 2.3, Riihimäki et al., 2016) — and in a resected series, peritoneal spread ran 10.0% in diffuse-type vs 3.4% in intestinal-type tumors (Zheng et al., Virchows Arch, 2008, N=814). Peritoneal carcinomatosis develops in 14% of ALL gastric-cancer patients (Thomassen et al., Int J Cancer, 2014, N=5,220).' } },
  { id:'GU', name:'Lung', color:cssVar('--amber'), pos3d:{x:0.9,y:-1.5,z:-0.25},
    branch:{ gene:'RHOA mutation', class:'driver', ccf:'15% of genomically-stable gastric cancers (TCGA, Nature, 2014) — same subtype-defining event as the Liver site', note:'The same genomically-stable-subtype driver as the Liver site — shown at two sites, as its mutually exclusive counterpart fusion also is, because a branch event can seed more than one subclone. Lung involvement: 15% of metastatic gastric-cancer patients (Riihimäki et al., 2016) — and like the liver, the lungs are LESS favored by signet-ring histology than by other adenocarcinomas (OR 0.4, same study).' } },
  { id:'GB', name:'Bone', color:cssVar('--violet'), pos3d:{x:-0.95,y:-1.15,z:0.55},
    branch:{ gene:'CLDN18–ARHGAP fusion', class:'driver', ccf:'15% of genomically-stable gastric cancers (TCGA, Nature, 2014) — same subtype-defining event as the Peritoneum site', note:'Bone involvement: 12% of metastatic gastric-cancer patients — and one of the three territories signet-ring histology favors ("more frequently metastasized within the peritoneum, bone and ovaries", Riihimäki et al., 2016). The ovary deserves its own mention even without a site of its own: a Krukenberg tumor — ovarian metastasis classically full of signet-ring cells — traces to a stomach primary in two-thirds of cases (Kiyokawa et al., Am J Surg Pathol, 2006, N=120), and non-intestinal Lauren type and signet-ring components are independent risk factors for it (odds ratios 3.4 and 3.3, Li et al., World J Clin Cases, 2020, N=1,696 women). No percentage is claimed for the ovary as a metastatic site because none is citable — the population registry grouped it into "other" for small numbers — the same honesty precedent as PDAC\'s peritoneum.' } },
];
const TRUNK_GDIFF = [
  { gene:'CDH1 (E-cadherin) inactivation', class:'driver', ccf:'37% of genomically-stable gastric cancers carry somatic CDH1 mutation (TCGA, Nature, 2014); 56.3% of sporadic diffuse-type tumors in a dedicated series (9/16 — and 0/7 intestinal-type, Machado et al., Oncogene, 2001), with promoter hypermethylation as a second, non-mutational route in another 56.3% — not a near-universal founder like pancreatic cancer\'s KRAS; trunk here means the subtype-defining lesion, the same sense as lung adenocarcinoma\'s KRAS at 33%', note:'E-cadherin is the calcium-dependent adhesion molecule that holds epithelial cells to each other — lose it, and cells let go. That single loss is this cancer\'s whole story in miniature: discohesion produces the scattered single cells and signet rings of the microscope slide, and their diffuse infiltration through the wall produces the rigid "leather bottle" stomach (linitis plastica) at the bedside. The gene can fall to mutation or to promoter hypermethylation — methylation acts as the "second hit" in more than half of mutation-carrying sporadic tumors (Machado et al., 2001; the two-hit framing is Grady et al., Nat Genet, 2000) — and, rarely, the first hit is inherited: germline CDH1 mutation causes hereditary diffuse gastric cancer, an autosomal dominant syndrome that also carries lobular breast cancer risk (Guilford et al., Nature, 1998 — discovered in a New Zealand Māori kindred; Blair et al., Lancet Oncol, 2020 guidelines).' },
];
const PRIVATE_POOL_GDIFF = [
  { gene:'TP53 mutation', class:'driver', ccf:'~50% of gastric cancers overall (the most frequently mutated gene at 50% of 119 patients, van Beek et al., Ann Surg Oncol, 2018)', note:'The genome\'s damage-response checkpoint — but placed carefully here: TP53 mutation concentrates in the chromosomal-instability molecular subtype (71%, TCGA, 2014), which is the INTESTINAL side of gastric cancer\'s molecular split, not this tumor\'s. Sequencing studies found no significant association with Lauren type either way (van Beek et al., 2018), so it appears in this diffuse-type tumor as a private-tier event — present, real, but not what defines this cancer.' },
  { gene:'APC mutation', class:'driver', ccf:'among TCGA\'s 25 significantly mutated gastric-cancer genes (β-catenin pathway; TCGA, Nature, 2014) — no clean subtype-specific percentage exists to cite, so none is shown', note:'The colon\'s famous gatekeeper is a real, recurrently mutated gastric gene too — a reminder that the same genes recur across the GI tract at different ranks. No documented conflict with CDH1, RHOA, or the CLDN18–ARHGAP fusion.' },
  { gene:'SMAD4 mutation', class:'driver', ccf:'among TCGA\'s 25 significantly mutated gastric-cancer genes (TGF-β pathway; TCGA, Nature, 2014) — no clean subtype-specific percentage exists to cite, so none is shown', note:'The TGF-β pathway\'s central mediator, of pancreatic-cancer fame, recurrently lost here as well — breaking growth-inhibitory signaling in a tumor whose defining lesion is adhesive, not proliferative: cooperation, not redundancy.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background mutational noise, common simply because TTN is one of the largest genes in the genome, same as in every other cancer modeled in this atlas.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly; the PathologyOutlines
// quotes were read off the live pages via the browser pane after direct fetches hit HTTP 429).
// This is the atlas's first NON-gland-forming adenocarcinoma slide — the diffuse type is
// defined by the ABSENCE of the architecture every other adenocarcinoma panel here draws
// ("little or no gland formation"; "does not typically have gland formation") — and its
// signature object, the signet-ring cell, exists in no other generator: "a central, optically
// clear, globoid droplet of cytoplasmic mucin with an eccentrically placed nucleus" (Kaur &
// Vyas, PathologyOutlines, "Diffuse type"). Terminology: "Official WHO term is poorly cohesive
// carcinoma" (same source); the ≥50%-signet-ring threshold for calling a tumor signet-ring
// cell carcinoma is confirmed in peer-reviewed papers ATTRIBUTING it to WHO (Kim et al., World
// J Gastroenterol, 2025; Machlowska et al., Int J Mol Sci, 2020) but was not found in a WHO
// document itself — cited accordingly. Diffuse tumors also show "marked desmoplasia" (Kaur &
// Vyas) — drawn as background but deliberately NOT a labeled feature, which would read as a
// repeat of the pancreas panel's signature; the discohesion carries this slide.
const HISTOLOGY_GDIFF = {
  intro: 'Diffuse-type (WHO: poorly cohesive) gastric adenocarcinoma is defined by what is missing: glands. Where every other adenocarcinoma in this atlas builds rings and lumens, this cancer infiltrates as scattered single cells and small loose clusters — the direct microscopic consequence of losing E-cadherin, the molecule that holds epithelial cells together. Its signature cell is the signet ring: a large, optically clear droplet of cytoplasmic mucin filling the cell and crushing the nucleus into a crescent against the membrane. When signet-ring cells make up at least half the tumor, it is called signet-ring cell carcinoma. Spreading cell by cell through the wall\'s layers rather than as a mass, this type can stiffen the whole stomach into the non-distensible "leather bottle" of linitis plastica.',
  ariaSummary: 'Stylized microscopic field: pale pink stroma crossed by loose fibrous bands, with no glands anywhere. Scattered across the whole field are single tumor cells — many are signet-ring cells: large round cells filled by a clear vacuole, each with a dark crescent-shaped nucleus flattened against one edge. Between them, smaller discohesive tumor cells drift alone or in short single-file rows.',
  citation: 'Kaur & Vyas, PathologyOutlines.com, "Diffuse type"; Martinez Ciarpaglini, PathologyOutlines.com, "Carcinoma-general"; Mariette et al., Gastric Cancer, 2019; Kim et al., World J Gastroenterol, 2025.',
  features: [
    { key:'signet', label:'Signet-ring cell',
      text:'A tumor cell whose cytoplasm is one huge, optically clear droplet of mucin, shoving the nucleus into an eccentric crescent — the profile of a signet ring. When these make up at least 50% of a tumor it is diagnosed as signet-ring cell carcinoma; below that, poorly cohesive carcinoma NOS.' },
    { key:'discohesion', label:'Discohesive single cells',
      text:'Cells alone, in pairs, or in short files — never rings, never shared gland walls. This is E-cadherin loss made visible: without the adhesion molecule the CDH1 trunk mutation removes, the cells simply do not hold together, which is also what lets them slip through tissue one at a time.' },
    { key:'infiltration', label:'Diffuse infiltration',
      text:'The cells percolate through the stroma and wall layers instead of forming a discrete mass — often sparing the surface and thickening the submucosa, which is why these tumors can be endoscopically subtle while turning the stomach wall rigid: the gross-level "leather bottle" stomach, linitis plastica.' },
  ],
};

export const cancerDetails = {
  gdiff: {
    title:'Diffuse-Type Gastric Adenocarcinoma', screenLabel:'Diffuse-type gastric adenocarcinoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_GDIFF, trunk:TRUNK_GDIFF, privatePool:PRIVATE_POOL_GDIFF,
    histology: HISTOLOGY_GDIFF,
  },
};
