import * as THREE from 'three';
import { cssVar, layerSlab } from '../viewer.js';

// active:true. Alias collision check (same convention as every prior organ): no other organ's
// aliases contain "skin", "melanoma", "cutaneous", "mole", or "integument" (checked against
// every aliases array before writing these). "mole" is included because it is the word a
// person who has just noticed one would actually type; "epidermis" doubles as the route in
// for anyone typing "dermis"/"derm" (substring match). "melanoma" stays unique to this organ —
// no other alias contains it (lungs' 'adenocarcinoma' was the near-miss checked).
export const organEntry = { key:'skin', label:'Skin', system:'Integumentary', active:true, sexes:['female','male'], aliases:['skin','melanoma','cutaneous melanoma','cutaneous','mole','integument','epidermis'] };

// SEX-DIFFERENTIATED MARKER PLACEMENT — the first organ whose body-screen marker sits at a
// different place on the two bodies, and it is data, not decoration: "Overall, the trunk was
// the most common location in men (range 31%-58%) and the lower limbs and hips in women
// (26%-40%)" (Di Carlo et al., CONCORD-3 sex-differences study, Eur J Cancer, 2025 —
// 1,578,482 adults, 59 countries; corroborated in plain language by NCI PDQ and, at subtype
// level, SEER Training Modules). The male marker sits on the upper anterior chest — CONCORD's
// "trunk" category, deliberately front-visible: the body viewer opens face-on, hotspot dots
// are DOM overlays with no occlusion culling but the 3D anchor sphere IS depth-occluded, so a
// back anchor would be the one marker whose sphere hides at the default view (reviewed and
// decided against; the anterior trunk is equally inside the verified category). The female
// marker sits on the lower leg. Both placements are explained to the user in the organ
// description, not left as an unexplained asymmetry.
// PLACEMENT MECHANICS: points may carry an optional `sexes` filter (body.js applies a spec's
// points to every applicable body otherwise — a one-line, backward-compatible extension made
// for this organ). The leg marker's angle is large (side-on) BY GEOMETRIC NECESSITY, not
// convention: findBodySurfaceAnchor's ray always passes through the body's central axis, and
// at calf height the two legs straddle that axis — a front-on ray (small angle) threads the
// gap between them and misses (the same ray-through-the-thigh-gap trap the colon pass hit at
// 0.46 heightFrac, here in its pure form). Only a near-side-on ray intersects the near leg.
// Probed with the same height/angle grid harness as the colon marker, on both bodies.
export const markerSpec = { points:[
  { heightFrac:0.78, angle:33,  sexes:['male']   },  // upper right anterior chest (trunk)
  { heightFrac:0.17, angle:75,  sexes:['female'], site:'limb' },  // left lower leg (calf/shin) — DECLARED limb site: the placement check exempts it
] };

// The cancer list is the real skin-cancer landscape, and its headline asymmetry is stated
// where a user will actually see it: melanoma is ~2% of skin cancers but causes >80% of
// skin-cancer deaths ("While only 2% of skin cancers are melanomas, melanoma causes more than
// 80% of deaths from skin cancer" — NCI PDQ, Skin Cancer Prevention, HP version; the
// commonly-repeated "~75%" was checked and is NOT the sourced number). Keratinocyte-carcinoma
// volume: 5,434,193 NMSCs in 3,315,554 US patients in 2012, BCC:SCC treated ratio 1.0 in
// Medicare — NOT the folkloric 4:1 (Rogers et al., JAMA Dermatol, 2015, abstract verbatim).
// MELANOMA SUBTYPE SHARES carry a denominator trap, resolved here rather than papered over:
// the classic "SSM ~70%" holds only among subtype-SPECIFIED melanomas — ~50% of SEER records
// are "melanoma NOS" (Bradford et al., Arch Dermatol, 2009, stated outright), and against ALL
// registrations worldwide SSM is 36% (Di Carlo et al., CONCORD-3 morphology study, Br J
// Dermatol, 2022, N=1,578,482). Shares shown are COMPUTED from Bradford's SEER-17 incidence
// rates (SSM 57.4 / NM 12.7 / LMM 12.0 / ALM 1.8 per million person-years -> 68.4/15.1/14.3/
// 2.1% of the specified total) — these corroborate the aging SEER Training Module's ~70% SSM
// and ~15% NM but CONTRADICT its LMM ~5% (real ~14%) and ALM ~8% (real ~2%); the training
// module's "ALM = up to 70% of melanomas in Blacks" is likewise superseded by Bradford's
// registry 36%. The nodular death asymmetry is deliberately IN the share text, per review:
// "15% to 20% of primary melanomas and responsible for 40% of melanoma deaths" (StatPearls,
// Malignant Melanoma — subtype table, verbatim).
export const cancerEntries = [
  { id:'melanoma', name:'Cutaneous melanoma', share:'~2% of skin cancers but more than 80% of skin-cancer deaths (NCI). Of subtype-specified US melanomas: superficial spreading ~68%, nodular ~15%, lentigo maligna ~14%, acral lentiginous ~2% (computed from SEER-17 rates, Bradford et al., 2009 — about half of registry melanomas carry no recorded subtype; of ALL registrations worldwide, superficial spreading is 36%, CONCORD-3). Nodular melanoma alone, at 15–20% of primaries, accounts for ~40% of melanoma deaths', active:true, organKey:'skin' },
  { id:'bcc', name:'Basal cell carcinoma', share:'the most frequently diagnosed malignancy in humans — with cutaneous SCC, ~5.4 million US keratinocyte carcinomas per year in ~3.3 million people (2012; Rogers et al., 2015), and the treated BCC:SCC ratio in Medicare data is ~1:1, not the often-quoted 4:1. Nodular ~79%, superficial ~15%, morpheaform ~6% of cases (Scrivener et al., 2002) — locally destructive but almost never metastasizes (0.0028%–0.55%, corroborated two ways)', active:true, organKey:'skin' },
  { id:'scc', name:'Cutaneous squamous cell carcinoma', share:'the second most common skin cancer — incidence rose from 61.8 to 162.5 per 100,000 person-years between 1976-1984 and 2000-2010, roughly 2.6-fold (Muzic et al., Mayo Clin Proc, 2017) — and unlike BCC it carries a real, if low, metastatic risk, nodal-first: an estimated 3.0-6.7% of cases develop nodal metastasis (Karia et al., 2013)', active:true, organKey:'skin' },
  { id:'mcc', name:'Merkel cell carcinoma', share:'rare (~0.68-0.7 per 100,000 person-years, US, stable since 2013 — Paulson et al., 2018; Fakult et al., JAAD, 2025) but highly aggressive neuroendocrine skin cancer with a genuinely bimodal cause — ~81% driven by Merkel cell polyomavirus, the rest by direct UV damage (Moshiri et al., 2017) — plus advancing age and immunosuppression as real risk factors (StatPearls)', active:true, organKey:'skin' },
];

// PROCEDURAL, deliberately — and a NEW rejection class, recorded because it is neither of the
// two prior ones: not "no asset exists" (Ovary, Stomach) and not "license regime" (Open
// Anatomy stomach). A real, license-clean asset EXISTS and was measured before being rejected:
// the HRA publishes whole-body Skin reference organs (3DPX-020986 Female / 3DPX-021016 Male,
// CC BY 4.0, Visible Human-derived; female GLB downloaded, 12,246,132 bytes, sha256
// 0fc377c7a2e7...). Its GLB JSON chunk was parsed directly: ONE mesh ('VH_F_skin', 191,322
// vertices, one primitive, no named sub-meshes), bounding box 0.97 x 1.67 x 0.33 m — a
// complete body-shaped OUTER-SURFACE shell with zero layer structure. It is structurally the
// wrong information for this organ screen: skin is the one organ where "where is it?" is
// trivial (the body screen already shows that) and "what is it?" — the layered structure
// melanocytes live in, the layers Breslow depth is measured through — is the entire lesson.
// At 12.2MB it would also be the largest asset in the repo (8.3x the whole female body model)
// while visually duplicating the body screen the user just left. Kept on file like the Open
// Anatomy stomach: if a whole-body distribution view is ever wanted, it exists and is clean.
//
// WHAT IS BUILT INSTEAD: a schematic cross-section block — the textbook "biopsy slab" — with
// the three real layers stacked at exaggerated thickness (stated to the user in the organ
// description, stomach-serosa precedent): epidermis, dermis, hypodermis, an undulating
// dermal-epidermal junction (real rete-ridge geometry), a pigmented basal band at that
// junction (melanin concentrates in the basal layer — where the melanocytes are), and hair
// follicles with emerging shafts (the single strongest "this is skin, not geological strata"
// identifier — the stomach J-hook legibility lesson applied in advance).
// REAL FIGURES the exaggeration is measured against (all verified): measured epidermis
// 31.2-596.6 um across 37 body sites (Lintzeri et al., JEADV, 2022 meta-analysis of 133
// studies; the classic "0.05-1.5mm" is textbook tradition — SEER Training Modules — with the
// 1.5mm palm/sole figure ~2.5x above the measured pooled maximum); dermis 1.5-4mm, ~90% of
// skin thickness (SEER); whole skin ~2mm average (SEER). Block layer proportions here run
// ~14%/49%/37% of a 16mm section — a legibility scale, not an anatomical one.
// LAYER COLORS, each verified and tiered honestly:
// - Dermis: off-white/ivory — "the white dermis was fully exposed" (Liu et al., Int Wound J,
//   2023, human graft preparation; corroborated by Heitzmann et al., 2024, human burn
//   debridement). The conventional textbook PINK was checked and could NOT be verified in any
//   fetched source, so it is deliberately not used.
// - Hypodermis: light yellow — "light-yellow subcutaneous fat" (Mochizuki et al., JPRS, 2026,
//   intraoperative; the weakest sourcing tier in this organ — surgical figure captions, not
//   anatomy textbooks — flagged as such).
// - Surface tone: one mid-brown point on a real continuum, stated to the user in the organ
//   description: "Different skin tones are due to differences in the amount of melanin...
//   rather than the number of melanocytes" (StatPearls, Histology, Skin) — the basal band
//   below it is the darkest element because that is literally where the melanin is made.
const SX = 0.030, SZ = 0.021;            // block footprint, design units (3.0 x 2.1 cm)
const Y_TOP = 0.008, Y_BOT = -0.008;     // 1.6 cm total section height (design units)
const DEJ_BASE = 0.0058;                 // dermal-epidermal junction mean height
const BAND = 0.0007;                     // pigmented basal band thickness
const DH_BASE = -0.0022;                 // dermis/hypodermis boundary mean height
// PRESENTATION SCALE — the one organ whose absolute rendered size is deliberately NOT a
// real-world claim (its proportions are already stated to the user as exaggerated; unlike the
// stomach, no dimension of this schematic block is cited to a source). Rendered at true 3cm
// scale, the block sits INSIDE makeViewer's fixed 0.1m camera near plane once frameContents
// brings the camera close enough to frame it (~7cm) — the whole mesh near-clips into floating
// fragments. This is the same near-plane trap CLAUDE.md records for Blender thumbnails
// (prostate, ~5cm), firing in the live viewer for the first time because this is the smallest
// object it has ever framed. Scaling the schematic up (group.scale below; hotspot anchors
// multiplied to match, since markers are scene-level, not mesh children) keeps the framed
// camera safely outside the near plane without touching the shared viewer.
const SCALE = 5;
const P = (x, y, z) => [x*SCALE, y*SCALE, z*SCALE];

// Interface height functions — deterministic, shared by the mesh builder AND the hotspot
// anchors below, so the anchors always sit exactly on the generated surfaces (the same
// mesh-and-anchors-from-one-parameterization discipline as the procedural stomach).
function surfY(x, z){
  // gentle dome + fine skin-line texture
  return Y_TOP + 0.0005*Math.cos(x/SX*Math.PI*0.8)*Math.cos(z/SZ*Math.PI*0.8)
       + 0.00022*Math.sin(x*2100 + 0.7)*Math.sin(z*1700 + 2.1);
}
function dejY(x, z){
  // rete ridges: the dermal-epidermal junction really is an undulating boundary
  return DEJ_BASE + 0.00055*Math.sin(x*1400)*Math.cos(z*1100)
       + 0.00028*Math.sin(x*2600 + 1.3);
}
function dhY(x, z){
  // softer, lobular fat boundary (amplitudes damped after the first render — the boundary
  // read as a rippling sheet rather than a gentle lobular line)
  return DH_BASE + 0.0006*Math.sin(x*900 + 2.0)*Math.cos(z*750 + 0.5)
       + 0.00022*Math.sin(z*1500 + 1.0);
}

// layerSlab (the shared box-with-follow-surface-tops primitive) now lives in js/viewer.js,
// imported above — extracted there during the Marrow pass (2026-09-15) so a second schematic-
// cross-section organ doesn't duplicate it. Its old signature took no sx/sz (closing over this
// file's own SX/SZ module constants); the shared version takes them explicitly, so every call
// site here now passes SX, SZ as its last two arguments.

export function buildSkinMesh(){
  const group = new THREE.Group();
  // epidermis (surface tone), pigmented basal band, dermis (verified white/ivory — NOT the
  // conventional pink), hypodermis (verified light-yellow fat)
  group.add(layerSlab(surfY, (x,z)=>dejY(x,z),        0x9a6a4c, 0.62, SX, SZ)); // epidermis
  group.add(layerSlab((x,z)=>dejY(x,z), (x,z)=>dejY(x,z)-BAND, 0x5e3d28, 0.66, SX, SZ)); // basal band
  // dermis base is pushed well toward neutral — the warm key/ambient (0xffddb0/0xfff1e0)
  // suppress blue hard in this legacy pipeline, and the first render's 0xded2bd sampled as
  // outright TAN (195,167,130) on the cut face, which contradicts the verified "white dermis";
  // re-sampled after this change to confirm an ivory read without blown-white pixels.
  group.add(layerSlab((x,z)=>dejY(x,z)-BAND, dhY,     0xf2eee6, 0.58, SX, SZ)); // dermis
  group.add(layerSlab(dhY, ()=>Y_BOT,                 0xd9c06a, 0.55, SX, SZ)); // hypodermis

  // Hair follicles + shafts — two, interior (not bisected by the cut faces), each a tilted
  // tube from a bulb in the deep dermis up through the epidermis, with a free shaft above the
  // surface. The follicle is what makes the slab read as SKIN at a glance.
  const follicle = (fx, fz, tilt)=>{
    const sheathMat = new THREE.MeshPhysicalMaterial({ color:0x8a5b40, roughness:0.6, metalness:0.0, specularIntensity:0.15 });
    const hairMat   = new THREE.MeshPhysicalMaterial({ color:0x33241a, roughness:0.5, metalness:0.0, specularIntensity:0.15 });
    const yBulb = -0.0012, ySurf = surfY(fx, fz);
    const fLen = ySurf - yBulb;
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.00042, 0.00058, fLen, 10), sheathMat);
    tube.position.set(fx + Math.sin(tilt)*fLen/2, yBulb + fLen/2, fz);
    tube.rotation.z = -tilt;
    group.add(tube);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.00075, 10, 10), sheathMat);
    bulb.position.set(fx, yBulb, fz);
    group.add(bulb);
    const hLen = 0.0062;
    const topX = fx + Math.sin(tilt)*fLen, topY = ySurf;
    const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.00019, 0.00026, hLen, 8), hairMat);
    hair.position.set(topX + Math.sin(tilt)*hLen/2, topY + Math.cos(tilt)*hLen/2, fz);
    hair.rotation.z = -tilt;
    group.add(hair);
  };
  follicle(-0.0062,  0.0028, 0.20);
  follicle( 0.0042, -0.0038, 0.14);
  group.scale.setScalar(SCALE); // see the SCALE comment above — near-plane clearance
  return group;
}

export const organDetail = {
  eyebrow:'Integumentary System', title:'Skin',
  sub:'The body’s largest organ · epidermis, dermis & hypodermis · barrier, thermoregulation, sensation & vitamin D',
  facts:[
    {label:'Layers', val:'Three — epidermis (keratinized stratified squamous epithelium, avascular), dermis (dense collagen&ndash;elastin connective tissue), hypodermis (fat &amp; connective tissue)'},
    {label:'Scale', val:'Surface area ~1.5&ndash;2 m&sup2;; average total thickness ~2 mm. Its share of body weight is genuinely disputed across sources (~4&ndash;17%), so none is claimed here'},
    {label:'Melanocytes', val:'~1,000&ndash;2,000 per mm&sup2; in the basal layer (about 1 per 10 basal keratinocytes) — density is the same across skin tones; tone differs by melanin output, not cell count'},
    {label:'Function', val:'Barrier against water loss, microbes, trauma &amp; UV &middot; immune defense &middot; temperature &amp; water homeostasis &middot; vitamin D production &middot; touch, heat, cold &amp; pain sensation'},
  ],
  // Melanocyte-density equity fact gets the distinguishing-fact second-sentence treatment
  // (Brenner & Hearing, Photochem Photobiol, 2008, verbatim: "The number of melanocytes in
  // the skin is race-independent... densities between 2000/mm2 in head or forearm skin to
  // 1000/mm2 elsewhere"; ratio 1:10 in the basal layer, Cichorek et al., 2013). Thickness
  // figures: measured epidermis 31-597um (Lintzeri 2022 meta-analysis) vs the textbook
  // "0.05-1.5mm" (SEER Training Modules) — both stated, labeled; dermis 1.5-4mm and ~2mm
  // whole-skin average (SEER). Area 1.5-2 m2 (Jebbawi et al., Pharmaceutics, 2020). The
  // often-quoted "~15% of body weight" was checked and is NOT confirmable (sources scatter:
  // 5-10% Jebbawi; one-sixth Perez-Sanchez 2018; ~2.7kg SEER) — no percentage is claimed.
  // Sex-differing primary-site epidemiology (the marker explanation): CONCORD-3 (Di Carlo
  // et al., Eur J Cancer, 2025), verbatim range in the markerSpec comment above.
  desc:'Skin is the body’s largest organ — around 1.5 to 2 square meters of it — and one of two organs this atlas shows as a cut block rather than a whole shape (the other is Marrow, a distributed tissue running through bone), because skin covers the whole body rather than sitting in one place. From the top down: the epidermis, a thin avascular sheet of keratinized stratified squamous epithelium, constantly renewed from its deepest stratum; the dermis, a thick collagen-and-elastin connective layer carrying the vessels, nerves, glands and hair follicles (on cut section it is white — the pink of most diagrams is convention, not observation); and the hypodermis, an insulating, shock-absorbing layer of fat. Melanocytes — the cells melanoma arises from — live in the epidermis’s basal layer, roughly one for every ten basal keratinocytes, handing melanin to their neighbors as built-in UV shielding. Their density is essentially the same in everyone: differences in skin tone come from how much melanin the cells produce and package, not how many of them there are — the surface tone shown here is one point on that real continuum. In men, melanoma arises most often on the trunk; in women, on the lower limbs and hips (CONCORD-3, 59 countries) — which is why the body-screen marker for this organ sits on the chest of the male figure and the lower leg of the female one. One note about this 3D model itself: it is a schematic cross-section built to published descriptions, and neither its overall size nor its layer proportions are to scale — the thicknesses are exaggerated for legibility, where a real epidermis measures 0.03 to 0.6 mm across body sites and the whole skin averages only ~2 mm.',
  buildMesh: buildSkinMesh,
  // Real meters (~3cm block). pos-anchored hotspots put it through the frameContents/scaled-
  // marker/no-glow-light path (that branch keys on pos-vs-dir, not mesh provenance) — correct
  // here for the same reason as every real organ: anchors sit ON surfaces. minRadius must
  // allow close zoom on a centimeters-scale object.
  viewer:{ theta:0.5, phi:1.15, radius:0.5, minRadius:0.12, maxRadius:1.2, autoRotateRadPerFrame:0.0016 },
  viewerAria:'Three-dimensional schematic cross-section block of skin, cut like a specimen: a '
    + 'thin brown epidermis on top with two hairs emerging from it, a very thin darker band at '
    + 'its base, a thick ivory-white dermis below that, and a light-yellow fat layer at the '
    + 'bottom, with four glowing teal points marking the structures listed after it. Drag to '
    + 'rotate, scroll to zoom.',
  // pos: literal anchor points (meters) computed FROM THE SAME interface functions the mesh is
  // built from (stomach precedent, one step stronger: evaluated at module load rather than
  // transcribed), nudged just proud of the surface. Verified visible at the default camera
  // angle by screenshot, per the Kidneys lesson. The basal-layer point is the "arises here"
  // point every organ leads with — here it is deliberately SECOND in reading order top-down,
  // because the epidermis point above it is what a top-down cut block presents first.
  hotspots:[
    { key:'epidermis', label:'Epidermis', pos:P(-0.0105, surfY(-0.0105, 0.0040)+0.0002, 0.0040),
      text:'The outer sheet: keratinized stratified squamous epithelium, avascular — it lives on diffusion from the dermis below. Keratinocytes born in the deepest stratum are pushed outward, flatten, fill with keratin and are shed: four strata across most of the body (basale, spinosum, granulosum, corneum), five in the thick skin of palms and soles. Measured thickness is 0.03 to 0.6 mm depending on site — far thinner than any diagram, this one included, can draw it. Cutaneous squamous cell carcinoma arises from these keratinocytes, often progressing from a precancerous actinic keratosis within this same sheet.' },
    // Anchored on the RIGHT cut face (+x wall) rather than the front one — the front face
    // carries the Dermis and Hypodermis dots, and this label (the longest in the organ)
    // overlapped the Dermis label at the default rotation when all three shared that face;
    // measured by DOM-rect intersection, not eyeballed.
    { key:'basal', label:'Melanocytes & the basal layer', pos:P(SX/2, dejY(SX/2, 0.002)-BAND/2, 0.002),
      text:'Melanoma arises here. The stratum basale is the epidermis’s single deepest cell layer, riding the undulating dermal-epidermal junction, and it is where the melanocytes sit — about one per ten basal keratinocytes, handing off melanin that shields neighboring cells’ DNA from UV. The darker band drawn at this junction is that pigment. Melanoma is malignant transformation of these cells; how deep a melanoma has grown below this layer — Breslow depth — is the most important prognostic factor in the localized disease. Basal cell carcinoma, the most frequently diagnosed malignancy in humans, arises from the basal keratinocytes that make up most of this same layer. Merkel cell carcinoma arises here too, from the rare mechanoreceptor cells scattered among these basal keratinocytes.' },
    { key:'dermis', label:'Dermis', pos:P(-0.0118, -0.0015, SZ/2),
      text:'The skin’s structural bulk — around 90% of its thickness: dense collagen for strength, elastin for recoil, plus the blood vessels, lymphatics, nerves, sweat glands and hair follicles the epidermis lacks. Its upper papillary layer interlocks with the epidermis at the rete ridges; the deeper reticular layer is the thick, load-bearing weave. For a melanoma, crossing into this vascular, lymphatic-rich layer is what turns a surface lesion into a disease that can travel.' },
    { key:'hypodermis', label:'Hypodermis', pos:P(0.0108, -0.0054, SZ/2),
      text:'The subcutaneous layer: lobules of fat in a net of connective tissue — insulation, energy store and shock absorber, anchoring the skin to the fascia beneath. On cut section it is the yellow layer. A melanoma reaching this depth is a deeply invasive tumor: Breslow depths are measured in millimeters, and the whole distance from skin surface to this layer is only a few of them.' },
  ],
};

// EVERY citation in this organ's data was verified directly at the source before being
// written in (four dedicated verification passes: anatomy/subtypes, genomics, metastatic
// pattern, histology/colors). Verification outcomes that shaped this block:
// - The task brief's Cagney PMID was WRONG (28666227 is a chromatography paper) — corrected
//   to 28444227 before anything cited it.
// - The brief's "0.6% of 677" BRAF+NRAS figure was attributed to Colombino 2012 — WRONG
//   SOURCE: traced through the citing review's reference list to Jakob et al., Cancer, 2012
//   (PMID 22180178) and verified in that primary text ("Four (0.6%) patients had activating
//   mutations in both BRAF and NRAS", N=677).
// - Curtin et al., NEJM, 2005's circulating four-way BRAF site split (59/11/23/11%) could
//   NOT be verified (paywalled, no open-access restatement — the Foulkes 2010 failure mode,
//   data rule 10) and is NOT used; its abstract's combined "81% of melanomas on skin without
//   chronic sun-induced damage had mutations in BRAF or N-RAS" IS verbatim and safe, and
//   Curtin et al., JCO, 2006 (same lab, same four groups) carries the site-variation claim
//   verbatim — that is the citation used.
// - TCGA 2015 itself MIS-CITES Pollock 2003 twice (for BRAF/NRAS anti-correlation and for
//   BRAF-PTEN co-occurrence — its only Pollock reference is the nevi paper, which addresses
//   neither claim). Both claims are sound — TCGA measured each in its own cohort — so both
//   are cited to TCGA's own data here, never through its Pollock attribution. Same class as
//   the prostate pass's Cooper-misattributed-as-"Boutros" catch, one level deeper: a
//   landmark paper's own reference list carrying the error.
// - Pollock 2003 writes "V599E" — the pre-renumbering name for V600E — and its nevi figure
//   is 82% (63/77), not the commonly rounded "~80%". Quoted accordingly.
// - "Highest brain-metastasis rate per incident case" is NOT supported (lung wins that:
//   19.9% vs melanoma's 6.9%, Barnholtz-Sloan et al., JCO, 2004) — the claim shipped is the
//   verified one: highest proportion AMONG PATIENTS METASTATIC AT DIAGNOSIS (28.2%, Cagney).
// - The "~75% of stage IV develop brain mets at autopsy" figure survives only at review
//   level (citation chains traced: the 2020 review's "75%" cites Davies 2011, whose own
//   abstract says 44% clinical) — carried in the Nervous-system note explicitly AS a review
//   estimate, never as a primary figure.
//
// MUTATION-FRAMING MODEL: the branch pair (CDKN2A loss / PTEN loss) is COOPERATING (rule 4,
// the ccRCC pattern, verified for THIS cancer rather than inherited): PTEN loss positively
// co-occurs with BRAF V600E (Tsao 2004: "In the 12 of 15 melanoma cell lines (80%) and two
// of two melanoma metastases with PTEN alterations, BRAF was also mutated"; TCGA 2015: "PTEN
// mutations and deletions were more frequent in BRAF-mutant melanomas"; computed on the
// PanCancer Atlas re-processing: OR 3.39, p=3.1e-05 — computation validated against six
// paper-stated figures before being trusted for anything novel), and CDKN2A loss is
// subtype-orthogonal ("Although CDKN2A/B alterations were nearly evenly distributed across
// subtypes..." — TCGA). 15.6% of BRAF-hotspot tumors carry BOTH (computed, same validated
// pipeline) — the two-sites-each split below is supported by co-occurrence data, not merely
// tolerated. Haluska et al., Clin Cancer Res, 2006, states the three-way partition verbatim:
// "In general, melanomas carry a mutated NRAS, a mutated BRAF, or concurrent BRAF and PTEN
// mutations." The NRASxPTEN exclusion trend's popular mechanism ("NRAS activates PI3K
// itself") is NOT verbatim in any fetched source and is not asserted — sources say
// "epistatic relationship" (Tsao) and RAS functions "portioned by mutations in the pathways
// lying downstream" (Haluska).
//
// EXCLUDED from this cancer's ledger, each for a verified reason:
// - NRAS: the organ's defining hard exclusion — see the trunk note (0.6% of 677, Jakob 2012;
//   1 double-mutant in 318, TCGA, p<1e-15; class-3 exception and treatment-resistance
//   distinction handled there as prose, HCC rule-plus-exception precedent).
// - NF1: "NF1 mutations were anti-correlated with hot-spot BRAF mutations (p = 1.93e-9)"
//   (TCGA, verbatim; computed OR 0.21, p=5.6e-08) — an alternative MAPK driver, the LUAD-EGFR
//   class of error. Also one of Yao's two class-3 partners, a second reason it lives in the
//   trunk-note prose and nowhere else.
// - KIT: "not in any (0%) melanomas on skin without chronic sun damage" (Curtin 2006,
//   verbatim); TCGA places KIT exclusively in the Triple-WT column (computed OR 0.35,
//   p=0.013). Belongs to the acral/mucosal/CSD forms this tumor is not — mentioned in the
//   trunk note's site-variation prose instead.
// - HRAS/KRAS: "all were mutually exclusive with NRAS and BRAF V600 and K601 mutations"
//   (TCGA, verbatim).
// - RB1: SOFT exclusion, mechanistic-fit class (the ESR1/MDM4 rule, not exclusivity —
//   computed OR 0.67, p=0.39, NOT significant): TCGA's Table 1 lists RB1 only in the NF1
//   subtype column (a subtype excluded above), and it duplicates the CDKN2A branch gene's
//   own pathway (TCGA scores them jointly as "RB1/CDKN2A cell-cycle").
// - MAP2K1/MEK1: excluded for PATHWAY REDUNDANCY AND ITS RESISTANCE-GENE ROLE, explicitly
//   NOT for exclusivity — the data trend the other way (computed OR 1.59 toward
//   co-occurrence, 16 double-positives; the only exclusion evidence anywhere is n=2 in
//   Hodis). Recording it as "mutually exclusive with BRAF" would be unsupported, so it is
//   not recorded that way. It is MEK — the trunk's own immediate downstream kinase — and a
//   known BRAF/MEK-inhibitor resistance gene (the Nazarian category).
// - RAC1 P29S: admissible but excluded from the pool on rank — ~2x depleted in BRAF-mutant
//   tumors (12.5% of BRAF/NRAS-wild-type vs 6.2% of mutant, Krauthammer 2012, verbatim;
//   computed OR 0.44, p=0.053) and documented as an EARLY event ("similar frequency in
//   primary (9.2%) and metastatic tumors (8.6%)... consistent with this mutation occurring
//   early"), which cuts against a per-cell private framing. Three cleaner candidates exist.
const REGIONS_MEL = [
  // Site frequencies: Riihimaki et al., Cancer Med, 2018 (PMID 30328287) — the same Swedish
  // national-registry group and infrastructure as the atlas's existing colon and stomach
  // site sources; their capstone covering all cancers is the one that carries melanoma.
  // N=4,923 metastatic melanoma patients (3,015 men / 1,908 women) of 179,581 metastatic
  // patients total, 1987-2012; percentages are OF METASTATIC PATIENTS, multi-site counting
  // (sums exceed 100%), EXTRANODAL by design ("179,581 site-specific extranodal metastases"
  // — so distant lymph nodes structurally have no number here, stated in the Skin note), and
  // ascertainment leans lethal (the authors themselves flag death-certificate emphasis).
  // Sex-split figures are the paper's own verbatim table values; the site names use the
  // paper's categories — "Nervous system" is ICD-10 C79.3/4, slightly broader than brain
  // alone, stated in that site's note rather than silently renamed "Brain".
  // Four sites map exactly onto AJCC 8th-edition M categories (Gershenwald et al., CA Cancer
  // J Clin, 2017): M1d (CNS), M1b (lung), M1c (non-CNS visceral), M1a (distant skin).
  // Bone (18% men / 16% women, same table) is the stated omission: skin outranks it in women
  // (22 vs 16), ties it in men, and is the melanoma-distinctive site.
  // pos3d designed against PROJECTED pairwise separation at the site viewer's default camera
  // (theta 0.6, phi 1.15) — the standing method the CRC pass established; this spread's
  // projected minimum is 2.15 units (Lung/Skin pair), above every prior cancer's
  // (CRC 1.75 / PDAC 1.68 / GDIFF 1.97), screenshot-verified at the exact default rotation.
  // A first spread at 1.43 visually merged the Nervous system and Liver blobs — the same
  // depth-dominant-separation trap the method exists to catch.
  { id:'MN', name:'Nervous system', color:cssVar('--coral'), pos3d:{x:0.45,y:1.9,z:-0.4},
    branch:{ gene:'CDKN2A loss', class:'driver', ccf:'~60% of the BRAF subtype carries CDKN2A mutation, deletion, or promoter hypermethylation (TCGA, Cell, 2015, Table 1) — deletion-dominant, hence "loss" rather than "mutation"', note:'The p16 cell-cycle brake, disabled — and the timing is the striking part: "Biallelic inactivation of CDKN2A emerged exclusively in invasive melanomas" (Shain et al., NEJM, 2015) — this is a lesion of the transition from in-situ to invasive disease. Safe alongside the trunk because it is orthogonal to the BRAF/NRAS axis: "nearly evenly distributed across subtypes" (TCGA). The brain is melanoma’s signature destination: the nervous system is its most common metastatic site — 49% of metastatic men, 44% of metastatic women (Riihimaki et al., 2018; the registry category, ICD-10 C79.3/4, is slightly broader than brain alone) — and among patients metastatic at diagnosis, melanoma has the highest proportion with brain metastases of any primary cancer (28.2%, Cagney et al., Neuro Oncol, 2017). Per incident case, lung cancer holds that title instead (19.9% vs 6.9%, Barnholtz-Sloan et al., 2004) — the two claims are different denominators and this atlas states the verified one. In an MD Anderson trial cohort, 44% of advanced-melanoma patients developed brain metastases (Davies et al., Cancer, 2011); review estimates run up to ~75% at autopsy, but that figure survives only at review level. AJCC’s 8th edition created a dedicated M1d category for CNS metastasis — brain involvement now outranks every other site distinction in melanoma staging.' } },
  { id:'MU', name:'Lung', color:cssVar('--azure'), pos3d:{x:1.95,y:-0.55,z:0.55},
    branch:{ gene:'PTEN loss', class:'driver', ccf:'~20% of the BRAF subtype (TCGA, Cell, 2015, Table 1; mutation or deletion)', note:'The brake on PI3K/AKT survival signaling, lost — and the single best-documented cooperation with this cancer’s trunk anywhere in this atlas: 80% of PTEN-altered melanoma lines also carried mutant BRAF (Tsao et al., J Invest Dermatol, 2004), TCGA found PTEN loss concentrated in BRAF-mutant tumors, and the mouse experiment is definitive — BRAF V600E alone produces only benign melanocytic hyperplasia that fails to progress over 15-20 months, while adding Pten silencing yields melanoma "with 100% penetrance, short latency and with metastases observed in lymph nodes and lungs" (Dankort et al., Nat Genet, 2009). A branch mutation doing exactly what this atlas’s model says branch mutations do. Timing: PTEN mutations appear "only in advanced primary melanomas" (Shain et al., 2015), and reduced PTEN expression associates with Breslow thickness over 3.5 mm (p<0.0001, Goel et al., 2006). Lung involvement: 41% of metastatic men, 39% of women — melanoma’s second site (Riihimaki et al., 2018); lung metastasis defines the M1b category.' } },
  { id:'MV', name:'Liver', color:cssVar('--amber'), pos3d:{x:-2.0,y:0.7,z:-0.05},
    branch:{ gene:'CDKN2A loss', class:'driver', ccf:'~60% of the BRAF subtype (TCGA, Cell, 2015, Table 1) — same subtype-orthogonal cell-cycle event as the Nervous system site', note:'The same invasive-transition event as the Nervous system site — shown at two sites, as its cooperating counterpart PTEN also is, because a branch event can seed more than one subclone; 15.6% of BRAF-mutant tumors in TCGA’s cohort carry both branch losses at once (computed from the deposited data, validated against the paper’s own figures), so the two-genes-two-sites-each split reflects real co-occurrence, not convenience. Liver involvement: 29% of metastatic men, 27% of women (Riihimaki et al., 2018). Non-CNS visceral metastasis like this defines AJCC’s M1c category — a reminder that in melanoma staging the liver, lung, and brain each sit in different prognostic tiers.' } },
  { id:'MS', name:'Skin (distant)', color:cssVar('--violet'), pos3d:{x:-0.5,y:-1.75,z:0.65},
    branch:{ gene:'PTEN loss', class:'driver', ccf:'~20% of the BRAF subtype (TCGA, Cell, 2015, Table 1) — same cooperating survival-pathway event as the Lung site', note:'A skin cancer metastasizing to distant skin — 18% of metastatic men and 22% of metastatic women (Riihimaki et al., 2018), making distant skin a top-four site that outranks bone in women (16%) and ties it in men (18%; bone is this screen’s stated omission). Two honesty notes. First: this site means DISTANT skin and soft tissue — AJCC’s M1a, grouped with distant lymph nodes — a different entity from the satellite and in-transit metastases of stage III, which are intralymphatic spread within the region between the primary and its first-echelon nodes (Gershenwald et al., 2017). Second: distant lymph nodes belong in the same M1a group and are a real, prominent melanoma site, but carry NO number anywhere in this atlas — the frequency source excluded nodal metastases by design ("extranodal"), and the one population study covering them is paywalled with no extractable figures. Stated rather than guessed.' } },
];
const TRUNK_MEL = [
  { gene:'BRAF V600E', class:'driver', ccf:'BRAF is mutated in 52% of cutaneous melanoma (TCGA, Cell, 2015, N=318) — real cohort range 43–70% (43–48% Colombino 2012; 47% of 677, Jakob 2012; ~60–70% of superficial spreading melanomas, Haluska 2006) — NOT a near-universal founder like pancreatic cancer’s KRAS at 93%, and framed honestly as such; V600E is ~72% of BRAF mutations (Jakob 2012)', note:'"Mutational activation of BRAF is the earliest and most common genetic alteration in human melanoma" (Dankort et al., Nat Genet, 2009) — earliest in the strongest sense: 82% of benign nevi already carry it (63/77, Pollock et al., Nat Genet, 2003 — written V599E there, the pre-renumbering name for V600E), meaning the trunk mutation of this cancer usually exists for years in moles that never become anything, and is insufficient alone. It also varies by where on the body the melanoma arises: BRAF and NRAS mutations are common in melanomas on intermittently sun-exposed skin — 81% of that group carries one or the other (Curtin et al., NEJM, 2005) — but infrequent on acral, mucosal, and chronically sun-damaged skin (Curtin et al., JCO, 2006), where KIT alterations appear instead (and KIT is 0% on skin without chronic sun damage — which is why KIT appears nowhere in this ledger). This tumor models the common, intermittently-sun-exposed cutaneous form. One equity fact from that same site axis: acral lentiginous melanoma — palms, soles, nail beds, where sun exposure is not a documented risk factor — occurs at the SAME absolute rate in Black and non-Hispanic White Americans (1.8 per million person-years each); it dominates melanoma in darker skin (36% of cases vs 1%) only because the UV-driven subtypes are so much rarer there (Bradford et al., Arch Dermatol, 2009). THE DEFINING EXCLUSION: NRAS appears nowhere in this ledger. BRAF V600E and NRAS mutations are essentially mutually exclusive in untreated melanoma — 4 of 677 tumors (0.6%) carried both (Jakob et al., Cancer, 2012), and TCGA found exactly one double-mutant in 318 (p < 1e-15). The documented exception is real but cannot touch this tumor: rare class 3 BRAF mutants — low-activity or kinase-dead variants like D594 — DO co-occur with RAS mutations, because they need RAS to signal at all; V600E is class 1, RAS-independent, so with V600E as trunk the exclusion is hard (Yao et al., Nature, 2017). The one other documented route to NRAS-in-a-V600E-tumor is treatment pressure: under BRAF-inhibitor therapy, resistant subclones emerge via NRAS mutation or PDGFRB upregulation — "but not through secondary mutations in B-RAF(V600E)" (Nazarian et al., Nature, 2010). Different rule for a different situation, stated rather than blended.' },
  { gene:'TERT promoter mutation (C228T / C250T)', class:'driver', ccf:'75% of TCGA’s BRAF subtype (39/52; TCGA, Cell, 2015); 71% of melanomas in the discovery cohort (50/70, Huang et al., Science, 2013); 33% of primary vs 85% of metastatic tumor tissue in the parallel discovery paper (Horn et al., Science, 2013 — a specimen-type difference, not a discovery-vs-replication one)', note:'Two single-letter changes in a gene’s ON switch rather than the gene itself: either C228T or C250T — mutually exclusive with each other — creates a new ETS transcription-factor binding site shown in reporter assays to increase TERT promoter activity (Huang et al., 2013), and each is "a cytidine-to-thymidine transition at a dipyrimidine motif indicative of ultraviolet (UV) light-induced damage" (Huang et al., 2013): the trunk tier of this cancer carries a literal UV fingerprint. Temporal trunk, the same justification class as this atlas’s liver and pancreas: 77% of intermediate lesions and melanomas in situ already carry TERT promoter mutations — "selected at an unexpectedly early stage of the neoplastic progression" (Shain et al., NEJM, 2015, whose 37-tumor evolutionary series also orders everything else here: benign lesions harbor BRAF V600E exclusively, CDKN2A biallelic loss appears exclusively in invasive melanoma, PTEN and TP53 only in advanced primaries). And a real cross-organ thread: this is the same promoter mutation that is the trunk of this atlas’s liver cancer — melanoma and hepatocellular carcinoma were flagged side by side in the same 2013 screen that first described these mutations (Huang et al. found them in 5 of 6 melanoma and 4 of 6 HCC cell lines) — two organs, one recurring earliest-event.' },
];
const PRIVATE_POOL_MEL = [
  { gene:'PPP6C R264C', class:'driver', ccf:'~10% of the BRAF subtype (TCGA, Cell, 2015, Table 1); 12% of sun-exposed melanomas (Krauthammer et al., Nat Genet, 2012)', note:'A serine/threonine phosphatase subunit with mutations clustering in its active site — and the cleanest possible co-occurrence profile for this pool: found "exclusively in tumors with mutations in BRAF or NRAS" (Krauthammer et al., 2012) — its documented requirement is a trunk this tumor already has. The R264C hot spot is attributed to direct UVB damage (Hodis et al., Cell, 2012).' },
  { gene:'ARID2 mutation', class:'driver', ccf:'~15% of the BRAF subtype counting all mutations (TCGA, Cell, 2015, Table 1); 7% counting loss-of-function mutations only (Hodis et al., Cell, 2012) — two counting rules, both real, stated rather than averaged', note:'A SWI/SNF chromatin-remodeling subunit, recurrently broken — its mutations carry the same C-to-T UV signature as most of this genome’s damage. The same complex’s genes recur across this atlas (ARID1A in lung and liver, ARID2 in liver): chromatin remodeling is a pan-cancer casualty, here with a sunburn signature on it.' },
  { gene:'IDH1 R132 mutation', class:'driver', ccf:'~6% of cutaneous melanoma (TCGA, Cell, 2015)', note:'The one candidate TCGA lists in every one of its four molecular subtype columns — no subtype preference at all, the cleanest safety profile in this pool. Cross-organ echo: this is the same gene whose mutation status DEFINES the diagnostic boundary in this atlas’s brain cancer (glioblastoma is IDH-wildtype by definition; an IDH-mutant grade-4 astrocytic tumor is a different diagnosis) — in melanoma the identical R132 hot spot carries no classifying weight whatsoever. Same letter, different word.' },
  { gene:'TP53 mutation', class:'driver', ccf:'~10% of the BRAF subtype — TCGA’s own table prints the caveat: "TP53 wild-type in ~90% of BRAF subtype" (TCGA, Cell, 2015); 15% of the cohort overall, 93.9% of those in UV-signature samples', note:'The genome’s damage-response checkpoint, mutated late and in a minority — melanoma mostly disables the p53 PATHWAY indirectly (CDKN2A loss removes p14ARF, p53’s stabilizer) rather than hitting the gene itself — this atlas’s reading of two cited facts: TCGA’s pathway analysis puts direct MDM2/TP53 alteration at 19% of cases against 69% for RB1/CDKN2A (TCGA, Cell, 2015) — which is why the guardian-of-the-genome gene is a private-tier finding here rather than the trunk it is in ovarian and breast cancer. When present: mutation counts run higher and the changes are C-to-T transitions (TCGA), and it appears "only in advanced primary melanomas" (Shain et al., 2015).' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background noise, common because TTN is one of the genome’s largest genes. It earns its place in THIS cancer’s pool for a reason the source states directly: across 7,042 tumors, "cancers related to chronic mutagenic exposures such as lung (tobacco) and malignant melanoma (UV) exhibited the highest prevalence" of somatic mutations (Alexandrov et al., Nature, 2013) — melanoma is in that highest-prevalence group, and so is lung, and almost all of melanoma’s load is passengers like this one.' },
];

// HISTOLOGY (microscopic-view data — every claim verified directly; PathologyOutlines was
// captured via the browser pane, one page: Mansour & Donati, "Invasive melanoma"). The slide
// depicts SUPERFICIAL SPREADING MELANOMA — the pagetoid-spread archetype and the most common
// subtype — which constrains the background: PathologyOutlines classifies SSM under LOW
// cumulative sun damage, so solar elastosis (a lentigo-maligna finding) is deliberately NOT
// drawn; drawing it would put the wrong subtype's background under an SSM field.
// Breslow phrasing: three independent sources carry the definition ("from the top of the
// granular layer... to the deepest invasive cell", PathologyOutlines; Gontijo et al., An Bras
// Dermatol, 2026; Asato et al., 2024) and three carry the superlative — but as "THE most
// important prognostic factor", never "the SINGLE most important" (unsupported, and one
// source names ulceration as the other key indicator; worded accordingly). The AJCC-8 paper
// itself (Gershenwald 2017) contains NEITHER the anatomic definition NOR the superlative —
// verified by full-text search — so it is cited only for staging mechanics, never for the
// definition. Melanin's brown is assembled from two sources (dusty/granular cytoplasmic
// pigment, PathologyOutlines; eumelanin "brown-black pigment", StatPearls Biochemistry) — no
// single fetched quote says "melanin appears brown on H&E"; the drawn color is that
// combination, recorded here.
const HISTOLOGY_MEL = {
  intro: 'Melanoma is malignant transformation of melanocytes, and its microscopic story is architectural anarchy at the dermal-epidermal junction: nests of atypical melanocytes in irregular sizes and shapes, single cells outnumbering nests, and — the classic sign — pagetoid spread, single melanocytes climbing into the upper epidermis where melanocytes do not belong (benign nevi generally stay at the basal layer). Depicted here is the superficial spreading type, the most common. Downward growth is what kills: Breslow depth, measured in millimeters from the top of the granular layer to the deepest invasive cell, is the most important prognostic factor in localized melanoma — a slide with a ruler on it decides the stage. Unlike a benign nevus, the dermal cells fail to mature (shrink) with depth, and mitotic figures appear where none should be.',
  ariaSummary: 'Stylized microscopic field: a band of pink epidermis across the top with an undulating boundary against pale pink dermis below. Along that junction sit crowded, irregularly sized and shaped nests of dark atypical cells with brown pigment. Single dark cells are scattered upward through the epidermis above the nests — pagetoid spread. Below the junction, loose sheets of large atypical cells with brown dusty pigment invade the dermis; a vertical measuring bar at the right marks the Breslow depth from the top of the epidermis’s granular layer down to the deepest invasive cell.',
  citation: 'Mansour & Donati, PathologyOutlines.com, "Invasive melanoma"; Gontijo et al., An Bras Dermatol, 2026; Asato et al., An Bras Dermatol, 2024; Waqar et al., Cureus, 2022; Heistein et al., StatPearls, "Malignant Melanoma".',
  features: [
    { key:'breslow', label:'Breslow depth',
      text:'The measurement that runs melanoma staging: millimeters from the top of the epidermis’s granular layer (or the base of an ulcer, if ulcerated) straight down to the deepest invasive tumor cell — the most important prognostic factor in localized melanoma. Tenths of a millimeter move patients between stages; ulceration is the other key pathological indicator.' },
    { key:'pagetoid', label:'Pagetoid spread',
      text:'Single atypical melanocytes scattered above the basal layer, into the upper spinous and even granular layers — territory where melanocytes do not belong. Benign nevi usually lack it; florid, widespread pagetoid spread favors melanoma, and it is the defining epidermal picture of the superficial spreading type drawn here.' },
    { key:'nests', label:'Irregular junctional nests',
      text:'Nests of atypical melanocytes along the dermal-epidermal junction in different sizes and shapes, irregularly spaced, focally confluent — with single melanocytes coming to outnumber the nests themselves. Compare a benign nevus: evenly sized, evenly spaced nests that mature with depth. The dusty brown cytoplasmic pigment is melanin, made by the tumor’s cells of origin.' },
  ],
};

// BCC — every citation verified directly at the source (2026-09-13, "ordinary-organ" batch's
// skin round). REGISTRY-REPORTABILITY GAP, distinct from the share-bound rule's class of gap:
// BCC (like SCC) is not reportable to SEER/most state cancer registries at all — a categorically
// different, more definitive absence than "the organ aggregate is unsafe to use for this rare
// subtype," which is what the share-bound rule covers elsewhere. This affects EXTENT specifically
// (no SEER Summary Stage distribution exists for this disease, full stop); margin/growth draw on
// ordinary gross/histologic pathology literature, unaffected by registry status, and share draws
// on Medicare-claims-based national estimates (Rogers et al., 2015) rather than SEER incidence.
//
// SITE MODEL — real-but-unquantified, not a structural departure. The real metastatic rate is
// 0.0028%-0.55%, corroborated two ways: StatPearls; and von Domarus & Stevens, JAAD, 1984, PMID
// 6736323, a literature series (205 cases identified, 170 accepted and evaluated) plus their own
// institutional 0.1% rate. StatPearls
// separately gives a lower age-adjusted mortality figure, 0.12/100,000 — consistent with this
// rarity, but not itself a second metastatic-rate measurement. That combined rate sits below
// GBM's own <1-2% departure threshold, but no dedicated population-registry site-distribution
// study exists for this cancer. Available distribution data is von Domarus & Stevens' own pooled
// case literature: real sites named, no clean modern percentage attached to any of them. The fix
// reuses the "real site, no percentage" honesty precedent LUAD's adrenal gland and ccRCC's liver/
// brain already established in this file, extended here to all four sites rather than one or two,
// because that is what the evidence actually supports.
const REGIONS_BCC = [
  { id:'BL', name:'Lymph nodes', color:cssVar('--coral'), pos3d:{x:0.55,y:1.85,z:-0.35},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'40% (17/42, direct sequencing, Reifenberger et al., Br J Dermatol, 2005, PMID 15656799) to 61% (293 tumors, whole-exome, Bonilla et al., Nat Genet, 2016, PMID 26950094) — real cross-cohort range, older/smaller-cohort methods reading lower', note:'Real, and genuinely independent of this cancer’s own trunk: Reifenberger et al. found TP53 mutations in BCCs "with and without" mutations in the Hedgehog-pathway genes PTCH1/SMO/SUFU — meaning TP53 status does not sort tumors the way the trunk mutation does, and is not itself diagnostic. Mouse-model evidence instead shows it as an accelerating, cooperating event layered onto an already-Hedgehog-driven tumor: p53 loss "markedly enhances" Hedgehog-driven tumorigenesis (Epstein, Nat Rev Cancer, 2008, PMID 18813320) — the same accelerating-not-founding role this atlas’s melanoma entry already gives PTEN loss alongside its own BRAF trunk. Lymph-node involvement is a real, if exceedingly rare, BCC metastatic route (StatPearls).' } },
  { id:'BU', name:'Lung', color:cssVar('--azure'), pos3d:{x:1.95,y:-0.5,z:0.6},
    branch:{ gene:'TP53 mutation', class:'driver', ccf:'40-61% — same cross-cohort range as the Lymph nodes site', note:'The same accelerating, trunk-independent event as the Lymph nodes site, shown at a second site because a branch mutation can seed more than one subclone — melanoma’s own CDKN2A-loss/PTEN-loss branch genes in this same file use an identical two-sites-each split for the same reason. Lung is one of the real, named routes for the rare cases that do metastasize (von Domarus & Stevens, 1984; StatPearls) — no population-level percentage was found for this site specifically in what this pass verified, and none is claimed.' } },
  { id:'BB', name:'Bone', color:cssVar('--amber'), pos3d:{x:-2.0,y:0.65,z:-0.05},
    branch:{ gene:'MYCN mutation', class:'driver', ccf:'30% of tumors (293 tumors, whole-exome, Bonilla et al., Nat Genet, 2016, PMID 26950094, "recurrent mutations in MYCN (30%)") — this cohort’s single most frequent branch-tier event', note:'A real, BCC-confirmed frequency; the cooperating mechanism is inferred rather than BCC-specifically demonstrated in what this pass could verify — MYCN is a documented direct GLI-pathway target gene in other Hedgehog-driven tumors (Hedgehog-subtype medulloblastoma), and GLI is the Hedgehog trunk’s own downstream effector, making cooperation with this cancer’s PTCH1/SMO trunk mechanistically plausible rather than confirmed. Bone is one of the real, named routes for the rare cases that do metastasize (StatPearls) — no population-level percentage was found for this site in what this pass verified, and none is claimed.' } },
  { id:'BS', name:'Skin (distant)', color:cssVar('--violet'), pos3d:{x:-0.5,y:-1.8,z:0.65},
    branch:{ gene:'MYCN mutation', class:'driver', ccf:'30% — same cohort-confirmed frequency as the Bone site', note:'The same GLI-pathway-plausible, cohort-confirmed event as the Bone site, shown at a second site, mirroring the same two-sites-each split used for TP53 above in this entry. A basal cell carcinoma spreading to distant skin is one of the real, named routes for the rare cases that do metastasize (StatPearls) — no population-level percentage was found for this site in what this pass verified, and none is claimed. Overall metastatic rate across all sites combined: 0.0028%-0.55%, corroborated two ways (StatPearls; von Domarus & Stevens, 1984’s own institutional 0.1% rate). The mortality rate is lower still (0.12 per 100,000 = ~0.00012%, StatPearls) — a real, separate figure consistent with this rarity, but not itself a second measurement of the metastatic rate, since not every metastatic case is fatal within a given study period.' } },
];
const TRUNK_BCC = [
  { gene:'PTCH1 mutation or loss', class:'driver', ccf:'73% (293 tumors, whole-exome, Bonilla et al., Nat Genet, 2016, PMID 26950094) — real cross-cohort range 33-90%: 33% by an early, lower-sensitivity SSCP screen (Gailani et al., Nat Genet, 1996, PMID 8782823, n=37); 67% by SSCP screening with confirmatory sequencing (Reifenberger et al., Br J Dermatol, 2005, PMID 15656799, n=42, the same underlying technique family as Gailani’s, run at higher sensitivity); ~90% by review synthesis (Epstein, Nat Rev Cancer, 2008, PMID 18813320) — the spread tracks method sensitivity, older/smaller studies reading lower, the same class of honest range this atlas already carries for HCC’s TERT and LUAD’s KRAS', note:'PTCH1 is the Hedgehog pathway’s own brake: its protein normally represses SMO, and losing it releases signaling that keeps the GLI transcription factors constitutively active — the single most consistently altered gene in this cancer across every cohort ever sequenced. The single most striking fact this atlas has found for any organ’s mutation burden belongs here, not to melanoma: whole-exome sequencing found basal cell carcinoma is "the most mutated type of human cancer" (Jayaraman et al., J Invest Dermatol, 2014, PMID 23774526) — louder than this atlas’s own melanoma entry, the prior record-holder. Independently corroborated by Bonilla et al. (2016): ~65 mutations/Mb across 293 samples, again framed as the highest rate observed in cancer.' },
  { gene:'SMO mutation', class:'driver', ccf:'10-20% — 10% by SSCP screening with confirmatory sequencing (Reifenberger et al., 2005), 20% by whole-exome (Bonilla et al., 2016)', note:'SMO is the receptor PTCH1 normally restrains; an activating mutation here reaches the identical downstream GLI output as losing PTCH1 does — a second real route to the same pathway activation, largely reported as an alternative to PTCH1 loss rather than a routine co-occurrence (Epstein, 2008: "an additional 10%" of cases beyond PTCH1’s own ~90%), though a formal statistical exclusivity test for this specific pair could not be independently confirmed in what this pass verified.' },
];
const PRIVATE_POOL_BCC = [
  { gene:'PPP6C mutation', class:'driver', ccf:'15% (293 tumors, Bonilla et al., 2016)', note:'A serine/threonine phosphatase subunit, recurrently mutated — the same gene this atlas’s own melanoma entry already carries as a private-pool finding there, at a comparable frequency, in an unrelated UV-driven cancer.' },
  { gene:'STK19 mutation', class:'driver', ccf:'10% (293 tumors, Bonilla et al., 2016)', note:'A real, recurrent finding in this cohort. Flagged rather than asserted without qualification: in melanoma, an apparent STK19 hotspot has separately been argued in the literature to reflect a sequence-mapping artifact rather than a true somatic driver — whether that concern applies to this cancer’s own STK19 calls was not independently checked in what this pass verified.' },
  { gene:'PTPN14 loss-of-function', class:'driver', ccf:'23% (293 tumors, Bonilla et al., 2016)', note:'A Hippo-pathway component, real and recurrent at whole-exome scale in this specific cohort — Hippo/YAP-Hedgehog/GLI crosstalk has been described in developmental-biology literature this pass reviewed, but a BCC-specific demonstration of that crosstalk was not independently confirmed in what this pass verified.' },
  { gene:'RB1 loss-of-function', class:'driver', ccf:'8% (293 tumors, Bonilla et al., 2016)', note:'A cell-cycle checkpoint gene, real and recurrent in this specific cohort — mechanistically coherent with a Hedgehog-driven, exceptionally high-mutation-burden tumor, though not independently demonstrated as cooperating with this cancer’s own trunk beyond the shared cell-cycle theme.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background noise, common because TTN is one of the genome’s largest genes. It earns its place in this cancer’s pool for the reason stated directly in the trunk note: this is real cancer’s single highest measured mutation rate, and almost all of that load is passengers like this one.' },
];

// HISTOLOGY (microscopic-view data — verified directly against StatPearls, "Basal Cell
// Carcinoma" (Puckett & Steele, NBK482439, PMID 29494046); PathologyOutlines returned HTTP 429
// (this project’s own documented, persistent block) so this entry rests on one directly-
// fetched source rather than this atlas’s usual two — disclosed rather than papered over.
const HISTOLOGY_BCC = {
  intro: 'Basal cell carcinoma is malignant transformation of basal keratinocytes, and its microscopic signature is nests of basaloid cells — basophilic (dark, blue-staining) nuclei with minimal surrounding cytoplasm — showing peripheral palisading: the outermost row of cells lines up in an orderly picket-fence pattern around each nest, in sharp contrast to the disorganized architecture inside it. A thin, clear gap — the retraction artifact — typically separates each nest from the surrounding stroma, an artifact of tissue processing rather than a real biological space, but a reliable diagnostic clue. Mucin deposition within and around the nests, and scattered mitotic figures, complete the picture. The nodular subtype depicted here — large, rounded nests — is the most common of BCC’s real histologic variants, accounting for roughly four in five cases.',
  ariaSummary: 'Stylized microscopic field: pale pink dermis with several large, rounded dark-blue nests of basaloid cells scattered through it. Each nest’s outermost ring of cells is neatly aligned, nuclei pointing outward, like a picket fence — peripheral palisading — while cells toward the center of each nest sit in disorganized clusters. A thin pale gap separates each nest from the surrounding pink stroma — the retraction artifact. Small pools of lighter, bluish material sit within some nests — mucin.',
  citation: 'Puckett & Steele, StatPearls, "Basal Cell Carcinoma" (NBK482439, PMID 29494046); Scrivener et al., Br J Dermatol, 2002, PMID 12100183 (subtype frequency).',
  features: [
    { key:'palisading', label:'Peripheral palisading',
      text:'The outermost row of basaloid cells in each tumor nest lines up in an orderly, picket-fence arrangement, nuclei oriented outward — a sharp, reliable contrast against the disorganized cells filling the center of the same nest, and one of this cancer’s most distinctive architectural signatures.' },
    { key:'retraction', label:'Retraction artifact (clefting)',
      text:'A thin, clear gap commonly separates each tumor nest from the surrounding stroma on standard tissue sections — an artifact of how the tissue is processed rather than a real biological space, but one pathologists rely on as a diagnostic clue precisely because it appears so consistently in this cancer.' },
    { key:'mucin', label:'Mucin deposition',
      text:'Pools of mucin — a real, commonly reported finding — accumulate within and around the tumor nests, adding to the palisading and clefting as part of this cancer’s recognizable microscopic signature.' },
  ],
};

// SCC — every citation verified directly at the source (2026-09-13/14, same batch as BCC).
// Same registry-non-reportability gap as BCC (Karia, Han & Schmults, JAAD, 2013, PMID 23375456,
// its own verbatim statement: "CSCC has been excluded from national cancer registries") — EXTENT
// is uncharacterised for the identical reason; margin/growth and share are unaffected.
//
// TRUNK — TP53 dominant (58-71%) plus CDKN2A as a second, temporally-EARLY trunk entry (present
// already in the actinic-keratosis precursor stage, per Tandukar et al., Nat Commun, 2025, PMID
// 41309580 — the same temporal-trunk justification class this atlas already uses for HCC's TERT
// and PDAC's KRAS, data rule 5), NOT branch-tier, because it is a founding rather than a
// region-specific event.
//
// SITE MODEL — real-but-unquantified for three of four sites, following BCC's own precedent, but
// with a genuine difference this entity's own research established: unlike BCC, SCC's real
// metastatic story is dedicated and quantified at the NODAL step specifically (Karia et al., 2013:
// 3.0-6.7% of an estimated 186,157-419,543 annual US cases developed nodal metastasis) — modeled
// at the Lymph nodes site with that real range; Lung/Bone/Skin(distant) are real, StatPearls-named
// routes for the minority that spread further, with no clean population percentage found for any
// of them in this pass's own search, disclosed the same honest way BCC's own three sites are.
//
// BRANCH — NOTCH1/NOTCH2 loss-of-function (~75%, Wang et al., PNAS, 2011, PMID 22006338) and HRAS
// activating mutation (real, cohort-dependent range, 3-20% — see each site's own note) — no
// dedicated site-correlated gene study exists for this cancer (checked directly in this pass's own search,
// same finding as BCC), so the site pairing is ILLUSTRATIVE per data rule 2's own standing
// convention, not the meningioma-class exception.
const REGIONS_SCC = [
  { id:'SL', name:'Lymph nodes', color:cssVar('--coral'), pos3d:{x:0.55,y:1.9,z:-0.35},
    branch:{ gene:'NOTCH1/NOTCH2 loss-of-function', class:'driver', ccf:'~75% carry a NOTCH1 or NOTCH2 mutation (Wang et al., PNAS, 2011, PMID 22006338, "defining a spectrum for the most prevalent tumor suppressor specific to these epithelial malignancies")', note:'NOTCH here is a tumor SUPPRESSOR, the opposite of its oncogenic role in T-cell leukemia — loss-of-function truncations and point substitutions abrogate signaling rather than activating it. Real, well-corroborated, and orthogonal to the TP53/CDKN2A trunk. Nodal metastasis is this cancer’s own real, dedicated, quantified metastatic route: an estimated 3.0-6.7% of cases (Karia, Han & Schmults, JAAD, 2013, PMID 23375456) — far higher than BCC’s own exceedingly rare spread, the one clear real difference between these two keratinocyte carcinomas’ natural history.' } },
  { id:'SU', name:'Lung', color:cssVar('--azure'), pos3d:{x:1.95,y:-0.55,z:0.55},
    branch:{ gene:'HRAS activating mutation', class:'driver', ccf:'real, cohort-dependent range — 3/40 tumors in one dedicated sequencing cohort (Inman et al., Nat Commun, 2018, PMID 30202019), consistent with "previously identified in 3-20% of cSCC" (per that same paper’s own cited literature)', note:'A real, distinct route to MAPK-pathway activation, independent of the TP53/CDKN2A trunk. Lung is one of the real, named routes for the minority of cases that spread beyond regional nodes (StatPearls) — no population-level percentage was found in this pass’s own search, and none is claimed.' } },
  { id:'SB', name:'Bone', color:cssVar('--amber'), pos3d:{x:-2.0,y:0.7,z:-0.05},
    branch:{ gene:'NOTCH1/NOTCH2 loss-of-function', class:'driver', ccf:'~75% — same cohort-confirmed frequency as the Lymph nodes site', note:'The same tumor-suppressor loss as the Lymph nodes site, shown at a second site per this entry’s own two-sites-each split (mirroring BCC’s TP53/MYCN convention above). Bone is one of the real, named routes for the minority of cases that spread beyond regional nodes (StatPearls) — no population-level percentage was found in this pass’s own search, and none is claimed.' } },
  { id:'SS', name:'Skin (distant)', color:cssVar('--violet'), pos3d:{x:-0.5,y:-1.8,z:0.65},
    branch:{ gene:'HRAS activating mutation', class:'driver', ccf:'real, cohort-dependent range — same as the Lung site above', note:'The same MAPK-activating route as the Lung site, shown at a second site per this entry’s own two-sites-each split. A squamous cell carcinoma spreading to distant skin is one of the real, named routes for the minority of cases that spread beyond regional nodes (StatPearls) — no population-level percentage was found in this pass’s own search, and none is claimed.' } },
];
const TRUNK_SCC = [
  { gene:'TP53 mutation', class:'driver', ccf:'58% by early, lower-sensitivity sequencing (14/24, Brash et al., PNAS, 1991, PMID 1946433, N=24) to 70% by modern whole-exome sequencing (Inman et al., Nat Commun, 2018, PMID 30202019, TP53-gene-mutation frequency specifically) — a separate, broader, PATHWAY-level figure exists alongside it: a 2021 pooled driver-mutation meta-analysis (NPJ Genom Med, PMID 34272401) reports p53-pathway loss-of-function events (not TP53-gene mutation specifically) in 71% of tumors, the same gene-vs-pathway distinction this atlas already flags for ccRCC’s MTOR-pathway figure — real cross-cohort range on the gene-level figure alone, older/smaller-cohort methods reading lower', note:'This tumor carries a real UV mutational signature directly in this trunk gene: three of the earliest-described p53 mutations showed "a CC to TT double-base change, which is only known to be induced by UV" (Brash et al., 1991), and the tumor-suppressor pathway loss is genome-wide — cutaneous squamous cell carcinoma has one of the highest mutation burdens of any cancer, ~50 mutations per megabase (Inman et al., 2018).' },
  { gene:'CDKN2A mutation or loss', class:'driver', ccf:'~50% (Inman et al., 2018, "CDKN2A changes in nearly 50% of cases") to 39% (2021 pooled meta-analysis, PMID 34272401, "cell-cycle-checkpoint control... occurred in 39% of tumors, primarily affecting the CDKN2A gene")', note:'Temporal trunk, the same justification class this atlas already uses for HCC’s TERT and PDAC’s KRAS (data rule 5): this is an EARLY event, not a late one — "TERT promoter and CDKN2A mutations emerge in actinic keratoses" (Tandukar et al., Nat Commun, 2025, PMID 41309580), the precancerous precursor lesion this cancer often arises from, present before invasive disease develops. The same paper found the invasive-transition step itself is marked by different, later events — ARID2 inactivation and MAPK-pathway activation — disclosed in this entry’s own branch-gene notes (HRAS) rather than modeled as a third trunk tier.' },
];
const PRIVATE_POOL_SCC = [
  { gene:'PIK3CA mutation', class:'driver', ccf:'6% (advanced/metastatic cohort, 315-gene panel, Al-Rohil et al., Cancer, 2016, PMID 26479420)', note:'Real, and flagged with its own real scope limit: this cohort was screened for "clinically relevant genomic alterations" specifically (drug-matchable targets), not a comprehensive mutation census — a real, if advanced-disease-skewed, frequency.' },
  { gene:'CCND1 amplification', class:'driver', ccf:'6% — same advanced-cohort panel as PIK3CA above', note:'A cell-cycle gene, real and recurrent in this specific advanced-disease cohort, mechanistically coherent alongside CDKN2A loss (both converge on the same cell-cycle checkpoint).' },
  { gene:'FBXW7 mutation', class:'driver', ccf:'5% — same advanced-cohort panel as PIK3CA above', note:'Real and recurrent in this specific cohort — the same gene this atlas’s own colorectal-cancer entry already carries as a private-pool finding, in an unrelated tumor.' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background noise, common because TTN is one of the genome’s largest genes. It earns its place in this cancer’s pool for the reason stated directly in the trunk note: cutaneous SCC carries one of the highest mutation burdens of any cancer, ~50 mutations per megabase (Inman et al., 2018), and almost all of that load is passengers like this one.' },
];

// HISTOLOGY — the SAME defining architecture as this atlas’s own LUSC (lung SCC) and blscc
// (bladder SCC) entries, real and independently sourced for this organ too: StatPearls,
// "Cutaneous Squamous Cell Carcinoma" (NBK441939) names keratin pearl formation and
// intercellular bridges directly for skin SCC; Sabbula, Gasalberti & Mukkamalla, StatPearls,
// "Squamous Cell Lung Cancer" (NBK564510) independently names the same two features for this
// atlas’s own LUSC entry, corroborating the same architecture across two organs rather than one
// source doing double duty. (Guo et al., Front Oncol, 2026, PMID 42482763 — this atlas’s own
// blscc entry’s source — was checked and is deliberately NOT reused here, caught during this
// pass’s own independent citation-verification agent: its "definitive morphological features,
// including keratin pearl formation and/or intercellular bridges" quote is that paper’s own
// working inclusion-criterion for classifying squamous differentiation in BLADDER tumors
// specifically, not a general cross-organ statement about squamous carcinoma — citing it here
// would have over-generalized a bladder-specific source, the same class of mistake as data rule
// 1’s ESR1/MDM4 case.)
// Reuses genLUSC’s own two-zone technique verbatim (drawKeratinPearl + the intercellular-bridge
// line-between-near-neighbors idiom) rather than writing new drawing code — the SAME real
// architecture, not a coincidental resemblance. Exactly 2 separately-drawable features, matching
// LUSC’s and blscc’s own real limit for the identical reason (see regress.js’s own KNOWN_FAILURES
// entry for this cancer, added alongside those two on the same real, WHO-sourced justification).
const HISTOLOGY_SCC = {
  intro: 'Cutaneous squamous cell carcinoma is malignant transformation of keratinocytes, and its microscopic signature is the same one that defines squamous carcinoma anywhere in the body: keratin pearls — concentric, onion-skin whorls of keratinizing cells, sometimes with a fully cornified center — and intercellular bridges, the short desmosomal connections between adjacent tumor cells that give this cancer’s cytoplasm its characteristic “spiny” look under the microscope. Either feature alone is sufficient for diagnosis; most tumors show both, in varying proportion between well-differentiated (more keratinization) and poorly-differentiated (fewer pearls, more bridging) areas.',
  ariaSummary: 'Stylized microscopic field split into two zones. On the left, a sheet of angular pink cells surrounds several concentric whorled structures — keratin pearls, layered like the rings of an onion, some with a solid pale center. On the right, tightly packed polygonal cells fill the field, with fine lines connecting neighboring cells at their touching edges — intercellular bridges, giving the sheet a spiny, cross-hatched texture.',
  citation: 'StatPearls, "Cutaneous Squamous Cell Carcinoma" (NBK441939); Sabbula, Gasalberti & Mukkamalla, StatPearls, "Squamous Cell Lung Cancer" (NBK564510, corroborating the same architecture in this atlas’s own LUSC entry).',
  features: [
    { key:'pearl', label:'Keratin pearl',
      text:'Concentric, onion-skin whorls of squamous cells progressively keratinizing toward the center, sometimes fully cornified — the single most recognizable architectural feature of squamous cell carcinoma anywhere it arises, and sufficient on its own for diagnosis.' },
    { key:'bridges', label:'Intercellular bridges',
      text:'Short, spiny connections between the membranes of adjacent tumor cells — the light-microscope appearance of real desmosomal attachments — giving non-keratinizing areas of the tumor a cross-hatched, “spiny” texture distinct from the smoother sheets of an adenocarcinoma.' },
  ],
};

// MCC — every citation verified directly at the source (2026-09-14, same batch as BCC/SCC). The
// genuinely novel structural fact this entity's own research established: MCC has TWO REAL,
// DISTINCT PATHOGENESES — not merely two divergent mutation routes the way this atlas's other
// status-trunk entities already model (GBM's IDH-wildtype status, OCCC's TP53 status, bladder's
// pathway-divergence status, FTC's RAS-vs-PAX8 divergence — see this entry's own TRUNK note
// below), but one route that is VIRAL rather than mutational at all — MCPyV-POSITIVE tumors
// (~81%, Moshiri et al., J Invest Dermatol, 2017, PMID 27815175: 229
// of 282 tumors) are driven by the Merkel cell polyomavirus's own large and small T antigens, with
// a genomically QUIET result (0.40 mutations/Mb, Harms et al., Cancer Res, 2015, PMID 26238782);
// MCPyV-NEGATIVE tumors (~19%) are UV-driven, with a mutation burden that EXCEEDS melanoma's own
// (10.09 mutations/Mb, same source — a ~25-fold difference from the viral route, and at exome-SNV
// scale a real neoantigen burden exceeding melanoma's, Goh et al., Oncotarget, 2016, PMID
// 26655088: "harbor more tumor neoantigens than melanomas... median of 173... 65... neoantigens/
// sample" for MCPyV-negative MCC vs melanoma respectively).
//
// TRUNK — a two-entry STATUS trunk, the same architecture this atlas already uses for FTC's
// RAS-vs-PAX8 divergence and bladder's pathway-divergence status (data rules 24/27), because
// neither route is a subtype of the other — each is a real, independently-diagnosable founding
// mechanism.
//
// A REAL, DISCLOSED MODEL LIMITATION, stated here rather than silently worked around: MCPyV-
// positive tumors are genomically quiet by the mechanism itself (viral, not mutational), so they
// have no real recurrent branch- or private-pool-tier mutations to model — the private pool this
// atlas's own architecture draws into EVERY cell regardless of site would misrepresent a virally-
// driven tumor if populated with the UV-driven route's own tumor-suppressor-loss genes. The
// branch/private tiers below are therefore built entirely from the MCPyV-NEGATIVE lineage's real,
// well-documented biology, and every gene's own note says so explicitly — a sampled cell's trunk
// assignment (MCPyV-positive vs -negative status) should be read as which real route this
// particular tumor took, and the branch/private mutations shown illustrate the UV-driven route's
// own real heterogeneity specifically, not a claim that MCPyV-positive tumors carry them too.
//
// SITE MODEL — real, dedicated, and unusually well-sourced for this atlas: Lewis et al., Cancer
// Med, 2020, PMID 31883234, N=215 patients with distant metastasis (of 1,168 enrolled), 305 total
// metastatic sites. Distant lymph nodes (not skin, not lung) is this entity's own most common real
// site — a genuinely distinctive fact worth stating directly rather than defaulting to the
// lung/brain/liver/bone shape most other cancers in this atlas use.
//
// EXTENT — SEER has no dedicated Stat Facts page for this entity at all (confirmed by direct
// navigation of SEER's own public tool, 2026-09-14) despite MCC being genuinely SEER-reportable —
// a real, different gap from BCC/SCC's own non-reportability. The best available real stage-at-
// diagnosis distribution is NCDB (National Cancer Data Base), not SEER — Harms et al., Ann Surg
// Oncol, 2016, PMID 27198511, N=9,387, the actual paper AJCC's 8th edition staging system is based
// on — disclosed as a non-SEER source rather than silently treated as equivalent to one.
const REGIONS_MCC = [
  { id:'ML', name:'Distant lymph nodes', color:cssVar('--coral'), pos3d:{x:0.55,y:1.85,z:-0.35},
    branch:{ gene:'NOTCH1/NOTCH2 loss-of-function', class:'driver', ccf:'confirmed within the MCPyV-negative subgroup specifically — "All viral-negative tumors harbored mutations in RB1, TP53, and a high frequency of mutations in NOTCH1 and FAT1" (Wong et al., Cancer Res, 2015, PMID 26627015, N=21 MCPyV-negative tumors)', note:'This gene, and every other branch/private-pool gene in this entry, is specific to the MCPyV-NEGATIVE, UV-driven route — see this entry\'s own trunk note for why the virally-driven majority route is not expected to independently carry it. Distant lymph nodes is this cancer\'s own real, most common metastatic site: 41% of documented distant-metastasis cases (88 of 215 patients, Lewis et al., Cancer Med, 2020, PMID 31883234) — a genuinely distinctive fact, since this dedicated site-distribution study identifies lymph nodes as this cancer\'s own single most common real metastatic destination, a level of site-specific certainty BCC\'s and SCC\'s own real-but-unquantified sites (above, in this same organ) do not have.' } },
  { id:'MS', name:'Skin (distant)', color:cssVar('--azure'), pos3d:{x:1.95,y:-0.55,z:0.55},
    branch:{ gene:'PRUNE2 loss-of-function', class:'driver', ccf:'confirmed within the MCPyV-negative subgroup specifically — 5 of 8 tumors in a dedicated whole-exome validation cohort (Harms et al., Cancer Res, 2015, PMID 26238782)', note:'Real and recurrent in the MCPyV-negative lineage specifically — see this entry\'s own trunk note. Distant skin is this cancer\'s own second most common real metastatic site: 25% of documented distant-metastasis cases (54 of 215 patients, Lewis et al., 2020) — skin-only distant spread carries a real, better prognosis than multi-organ or liver involvement (hazard ratio 2.7 and 2.1 respectively, same source).' } },
  { id:'MV', name:'Liver', color:cssVar('--amber'), pos3d:{x:-2.0,y:0.7,z:-0.05},
    branch:{ gene:'NOTCH1/NOTCH2 loss-of-function', class:'driver', ccf:'same MCPyV-negative-subgroup confirmation as the Distant lymph nodes site above', note:'The same tumor-suppressor loss as the Distant lymph nodes site, shown at a second site, mirroring the same split used for this gene at that site above. Liver is this cancer\'s own third most common real metastatic site: 23% of documented distant-metastasis cases (49 of 215 patients, Lewis et al., 2020) — and, unlike distant skin, liver involvement carries a real, worse prognosis (hazard ratio 2.1).' } },
  { id:'MB', name:'Bone', color:cssVar('--violet'), pos3d:{x:-0.5,y:-1.8,z:0.65},
    branch:{ gene:'PRUNE2 loss-of-function', class:'driver', ccf:'same MCPyV-negative-subgroup confirmation as the Skin (distant) site above', note:'The same loss-of-function event as the Skin (distant) site, shown at a second site, mirroring the same split used for this gene at that site above. Bone is this cancer\'s own fourth real metastatic site among the four modeled here: 21% of documented distant-metastasis cases (45 of 215 patients, Lewis et al., 2020) — real and dedicated data, unlike BCC\'s and SCC\'s own unquantified secondary sites elsewhere in this organ.' } },
];
const TRUNK_MCC = [
  { gene:'MCPyV-positive status (viral T antigens)', class:'driver', ccf:'~81% of MCC (229/282 tumors, multimodal virus detection, Moshiri et al., J Invest Dermatol, 2017, PMID 27815175) — the majority route', note:'A real, mechanistically distinct founding route: the virus\'s large T antigen carries mutations that truncate its own C-terminal helicase/DNA-replication domain while leaving its N-terminal retinoblastoma(RB)-binding domain intact — "tumor-derived virus mutations do not affect retinoblastoma tumor suppressor protein (Rb) binding by LT but do eliminate viral DNA replication capacity" (Shuda et al., PNAS, 2008, PMID 18812503). The tumor cell gets constitutive functional RB1 inactivation without ever needing a somatic RB1 mutation. Small T antigen contributes independently, maintaining "eukaryotic translation initiation factor 4E-binding protein 1 (4E-BP1) hyperphosphorylation, resulting in dysregulated cap-dependent translation" (Shuda et al., J Clin Invest, 2011, PMID 21841310) and recruiting the cellular oncoprotein MYCL to a chromatin-remodeling complex (Cheng et al., PLoS Pathog, 2017, PMID 29028833). The genomic result is the quietest genome this atlas has modeled for any virally-driven route: 0.40 mutations/Mb (Harms et al., Cancer Res, 2015, PMID 26238782) — real cancer, without the mutation-driven branch/private-pool architecture every other entity in this atlas carries; see this entry\'s own standing note on that limitation.' },
  { gene:'MCPyV-negative status (UV-driven)', class:'driver', ccf:'~19% of MCC (53/282 tumors, same source) — real, and genomically the LOUDEST route this atlas has found: 10.09 mutations/Mb (Harms et al., 2015), a ~25-fold difference from the viral route, with 85% of mutations being C>T transitions, "a pattern similar to the UV mutational signature in melanoma" (same source)', note:'TP53 and RB1 are near-universal within this subgroup specifically — 7/8 and 5/8 in one dedicated sequencing cohort (Harms et al., 2015), and "All viral-negative tumors harbored mutations in RB1, TP53" in an independent 21-tumor cohort (Wong et al., Cancer Res, 2015, PMID 26627015). At exome-SNV scale this route\'s own neoantigen burden exceeds melanoma\'s (Goh et al., Oncotarget, 2016, PMID 26655088) — the same convergent RB1/p53-pathway loss the viral route reaches through T-antigen binding, reached here through direct, UV-signature mutation instead. This is the founding route for every branch and private-pool gene modeled in this entry — see this entry\'s own standing note.' },
];
const PRIVATE_POOL_MCC = [
  { gene:'PIK3CA activating mutation', class:'driver', ccf:'confirmed within the MCPyV-negative subgroup, including activating hotspot E545K (Harms et al., Cancer Res, 2015, PMID 26238782, one of 16 tumors in the full validation cohort)', note:'Real and recurrent within the MCPyV-negative lineage specifically — the same standing note as this entry\'s branch genes: not modeled as present in the virally-driven majority route.' },
  { gene:'KNSTRN mutation', class:'driver', ccf:'confirmed within the MCPyV-negative subgroup (Harms et al., Cancer Res, 2015, PMID 26238782)', note:'Real and recurrent within the MCPyV-negative lineage specifically, alongside PRUNE2/NOTCH1/NOTCH2/GRIN2A in the same dedicated sequencing cohort — same standing note on lineage-specificity as this entry\'s branch genes.' },
  { gene:'TTN passenger mutation', class:'passenger', note:'Background noise from one of the genome\'s largest genes — honestly lineage-restricted, like every other gene in this entry\'s branch/private tiers: it belongs to the MCPyV-negative route\'s own high mutation burden (10.09 mutations/Mb), not to the virally-driven majority route, which has almost nothing to generate passengers from at all.' },
];

// HISTOLOGY — real, small-cell neuroendocrine architecture, reusing this atlas's own established
// drawSmallCellSheet family (already dispatched for lung/bladder/prostate small-cell/neuroendocrine
// carcinoma) rather than writing new drawing code, plus one real, quantified, genuinely
// MCC-distinguishing feature that family didn't previously need: trabecular growth pattern,
// found in "over 72% of MCCs but only rarely in non-MCC" small round blue cell tumors, with 72.2%
// sensitivity / 87.8% specificity for distinguishing this cancer from its mimics (Bandino et al.,
// Am J Dermatopathol, 2018) — real IHC markers (CM2B4 anti-large-T-antigen positivity, CK20
// dot-like perinuclear staining) are named in prose rather than drawn, the same "name more than is
// drawn" treatment LUAD's own two undrawn growth patterns and GBM's MGMT methylation status
// already get.
const HISTOLOGY_MCC = {
  intro: 'Merkel cell carcinoma is malignant transformation of Merkel cells, and its microscopic picture is classic small-cell neuroendocrine architecture: sheets of small, round, hyperchromatic cells with scant cytoplasm, nuclear molding — nuclei pressing into and deforming their neighbors — and finely stippled “salt and pepper” chromatin. A real, distinguishing feature beyond the generic small-cell picture: trabecular growth, cells arranged in ribbon-like cords rather than pure sheets, found in the large majority of these tumors and useful for telling this cancer apart from other small round blue cell tumors it can resemble. Necrosis and a high mitotic rate are common. Two real immunohistochemical markers not shown here but worth naming: CM2B4, an antibody against the Merkel cell polyomavirus’s own large T antigen, and a distinctive dot-like, perinuclear pattern of cytokeratin 20 positivity reported almost nowhere else in cancer.',
  ariaSummary: 'Stylized microscopic field: sheets of small, densely packed dark cells with scant visible cytoplasm, their nuclei molding against and flattening one another. The chromatin has a fine, stippled, salt-and-pepper texture. Some cells are arranged in ribbon-like cords — the trabecular pattern — rather than uniform sheets. An irregular pale patch marks an area of necrosis.',
  citation: 'Rocha et al., 2025, PMID 39819074; Bandino et al., Am J Dermatopathol, 2018 (trabecular pattern); Busam et al., Am J Surg Pathol, 2009, PMID 19609205 (CM2B4); Vanchinathan et al., 2009, PMID 19318809 (CK20 dot-like pattern).',
  features: [
    { key:'molding', label:'Nuclear molding',
      text:'Densely packed small tumor cells with scant cytoplasm press against and deform their neighbors’ nuclei — the defining cytologic feature of small-cell neuroendocrine carcinoma wherever it arises, this cancer included.' },
    { key:'chromatin', label:'Salt-and-pepper chromatin',
      text:'Finely stippled, evenly distributed nuclear chromatin without prominent nucleoli — the classic neuroendocrine chromatin pattern, giving the nuclei a speckled, granular look rather than the coarse clumping of many other carcinomas.' },
    { key:'trabecular', label:'Trabecular growth',
      text:'Cells arranged in ribbon-like cords rather than uniform sheets — a real, quantified, genuinely distinguishing feature of this cancer specifically: present in over 72% of Merkel cell carcinomas but only rarely in the other small round blue cell tumors it can be mistaken for (Bandino et al., 2018).' },
  ],
};

export const cancerDetails = {
  melanoma: {
    title:'Cutaneous Melanoma', screenLabel:'Cutaneous melanoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_MEL, trunk:TRUNK_MEL, privatePool:PRIVATE_POOL_MEL,
    histology: HISTOLOGY_MEL,
  },
  bcc: {
    title:'Basal Cell Carcinoma', screenLabel:'Basal cell carcinoma — tumor explorer',
    legendTitle:'Sites (real, exceedingly rare metastatic routes — no population percentage exists for any of them)',
    regions:REGIONS_BCC, trunk:TRUNK_BCC, privatePool:PRIVATE_POOL_BCC,
    histology: HISTOLOGY_BCC,
  },
  scc: {
    title:'Cutaneous Squamous Cell Carcinoma', screenLabel:'Cutaneous squamous cell carcinoma — tumor explorer',
    legendTitle:'Sites (real nodal-first spread — Lymph nodes quantified, others real but unquantified)',
    regions:REGIONS_SCC, trunk:TRUNK_SCC, privatePool:PRIVATE_POOL_SCC,
    histology: HISTOLOGY_SCC,
  },
  mcc: {
    title:'Merkel Cell Carcinoma', screenLabel:'Merkel cell carcinoma — tumor explorer',
    legendTitle:'Sites (real, dedicated metastatic-site study — see this entry\'s own trunk note for why the mutation ledger below draws on one lineage only)',
    regions:REGIONS_MCC, trunk:TRUNK_MCC, privatePool:PRIVATE_POOL_MCC,
    histology: HISTOLOGY_MCC,
  },
};
