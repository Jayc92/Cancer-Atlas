import * as THREE from 'three';
import { cssVar } from '../viewer.js';

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
  { heightFrac:0.17, angle:75,  sexes:['female'] },  // left lower leg (calf/shin)
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
  { id:'melanoma', name:'Cutaneous melanoma', share:'~2% of skin cancers but more than 80% of skin-cancer deaths (NCI). Of subtype-specified US melanomas: superficial spreading ~68%, nodular ~15%, lentigo maligna ~14%, acral lentiginous ~2% (computed from SEER-17 rates, Bradford et al., 2009 — about half of registry melanomas carry no recorded subtype; of ALL registrations worldwide, superficial spreading is 36%, CONCORD-3). Nodular melanoma alone, at 15&ndash;20% of primaries, accounts for ~40% of melanoma deaths', active:true, organKey:'skin' },
  { id:'bcc', name:'Basal cell carcinoma', share:'the most frequently diagnosed malignancy in humans — with cutaneous SCC, ~5.4 million US keratinocyte carcinomas per year in ~3.3 million people (2012; Rogers et al., 2015), and the treated BCC:SCC ratio in Medicare data is ~1:1, not the often-quoted 4:1 — locally destructive but almost never metastasizes', active:false, organKey:'skin' },
  { id:'scc', name:'Cutaneous squamous cell carcinoma', share:'the second most common skin cancer — incidence rose nearly 3-fold from the 1970s to the early 2000s (StatPearls) — and unlike BCC it carries a real, if low, metastatic risk', active:false, organKey:'skin' },
  { id:'mcc', name:'Merkel cell carcinoma', share:'rare (~0.7 per 100,000 person-years, US) but highly aggressive neuroendocrine skin cancer — risk factors are UV, advancing age, immunosuppression, and Merkel cell polyomavirus (StatPearls)', active:false, organKey:'skin' },
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

// One layer slab: a box whose top/bottom surfaces follow the interface functions. Faces get
// their OWN vertices (top grid, bottom grid, four wall strips) so computeVertexNormals keeps
// the cut edges crisp instead of smearing normals around the 90-degree corner — the walls ARE
// the cut faces this whole representation exists to show.
function layerSlab(fTop, fBottom, color, roughness){
  const NX = 44, NZ = 32;
  const hx = SX/2, hz = SZ/2;
  const positions = [], indices = [];
  const gridAt = (fn)=>{ // returns starting vertex index of an NX+1 x NZ+1 grid
    const start = positions.length/3;
    for(let i=0;i<=NX;i++) for(let j=0;j<=NZ;j++){
      const x = -hx + i/NX*SX, z = -hz + j/NZ*SZ;
      positions.push(x, fn(x,z), z);
    }
    return start;
  };
  const quad = (a,b,c,d)=>{ indices.push(a,b,c, b,d,c); };
  // top surface (up-facing winding), bottom (down-facing)
  const t = gridAt(fTop);
  for(let i=0;i<NX;i++) for(let j=0;j<NZ;j++){
    const a = t+i*(NZ+1)+j;
    quad(a+NZ+1, a, a+NZ+2, a+1);
  }
  const b = gridAt(fBottom);
  for(let i=0;i<NX;i++) for(let j=0;j<NZ;j++){
    const a = b+i*(NZ+1)+j;
    quad(a, a+NZ+1, a+1, a+NZ+2);
  }
  // four wall strips, each with fresh vertices sampled along its rim
  const wall = (samples, outward)=>{
    const start = positions.length/3;
    samples.forEach(([x,z])=>{ positions.push(x, fTop(x,z), z); positions.push(x, fBottom(x,z), z); });
    for(let k=0;k<samples.length-1;k++){
      const a = start+k*2;
      if(outward) indices.push(a, a+1, a+2, a+1, a+3, a+2);
      else        indices.push(a, a+2, a+1, a+1, a+2, a+3);
    }
  };
  const xs = Array.from({length:NX+1}, (_,i)=>-hx + i/NX*SX);
  const zs = Array.from({length:NZ+1}, (_,j)=>-hz + j/NZ*SZ);
  wall(zs.map(z=>[ hx, z]), false);  // +x wall
  wall(zs.map(z=>[-hx, z]), true);   // -x wall
  wall(xs.map(x=>[x,  hz]), true);   // +z wall (the front cut face the hotspots sit on)
  wall(xs.map(x=>[x, -hz]), false);  // -z wall
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  // Same material treatment as every organ since the clip-fix pass: MeshPhysicalMaterial for
  // its specularIntensity control (MeshStandardMaterial has none), 0.15 per the approved
  // Blender-verified material model.
  const mat = new THREE.MeshPhysicalMaterial({ color, roughness, metalness:0.0, specularIntensity:0.15 });
  return new THREE.Mesh(geo, mat);
}

export function buildSkinMesh(){
  const group = new THREE.Group();
  // epidermis (surface tone), pigmented basal band, dermis (verified white/ivory — NOT the
  // conventional pink), hypodermis (verified light-yellow fat)
  group.add(layerSlab(surfY, (x,z)=>dejY(x,z),        0x9a6a4c, 0.62)); // epidermis
  group.add(layerSlab((x,z)=>dejY(x,z), (x,z)=>dejY(x,z)-BAND, 0x5e3d28, 0.66)); // basal band
  // dermis base is pushed well toward neutral — the warm key/ambient (0xffddb0/0xfff1e0)
  // suppress blue hard in this legacy pipeline, and the first render's 0xded2bd sampled as
  // outright TAN (195,167,130) on the cut face, which contradicts the verified "white dermis";
  // re-sampled after this change to confirm an ivory read without blown-white pixels.
  group.add(layerSlab((x,z)=>dejY(x,z)-BAND, dhY,     0xf2eee6, 0.58)); // dermis
  group.add(layerSlab(dhY, ()=>Y_BOT,                 0xd9c06a, 0.55)); // hypodermis

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
  desc:'Skin is the body’s largest organ — around 1.5 to 2 square meters of it — and the only one this atlas shows as a cut block rather than a whole shape, because skin covers the whole body rather than sitting in one place. From the top down: the epidermis, a thin avascular sheet of keratinized stratified squamous epithelium, constantly renewed from its deepest stratum; the dermis, a thick collagen-and-elastin connective layer carrying the vessels, nerves, glands and hair follicles (on cut section it is white — the pink of most diagrams is convention, not observation); and the hypodermis, an insulating, shock-absorbing layer of fat. Melanocytes — the cells melanoma arises from — live in the epidermis’s basal layer, roughly one for every ten basal keratinocytes, handing melanin to their neighbors as built-in UV shielding. Their density is essentially the same in everyone: differences in skin tone come from how much melanin the cells produce and package, not how many of them there are — the surface tone shown here is one point on that real continuum. In men, melanoma arises most often on the trunk; in women, on the lower limbs and hips (CONCORD-3, 59 countries) — which is why the body-screen marker for this organ sits on the chest of the male figure and the lower leg of the female one. One note about this 3D model itself: it is a schematic cross-section built to published descriptions, and neither its overall size nor its layer proportions are to scale — the thicknesses are exaggerated for legibility, where a real epidermis measures 0.03 to 0.6 mm across body sites and the whole skin averages only ~2 mm.',
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
      text:'The outer sheet: keratinized stratified squamous epithelium, avascular — it lives on diffusion from the dermis below. Keratinocytes born in the deepest stratum are pushed outward, flatten, fill with keratin and are shed: four strata across most of the body (basale, spinosum, granulosum, corneum), five in the thick skin of palms and soles. Measured thickness is 0.03 to 0.6 mm depending on site — far thinner than any diagram, this one included, can draw it.' },
    // Anchored on the RIGHT cut face (+x wall) rather than the front one — the front face
    // carries the Dermis and Hypodermis dots, and this label (the longest in the organ)
    // overlapped the Dermis label at the default rotation when all three shared that face;
    // measured by DOM-rect intersection, not eyeballed.
    { key:'basal', label:'Melanocytes & the basal layer', pos:P(SX/2, dejY(SX/2, 0.002)-BAND/2, 0.002),
      text:'Melanoma arises here. The stratum basale is the epidermis’s single deepest cell layer, riding the undulating dermal-epidermal junction, and it is where the melanocytes sit — about one per ten basal keratinocytes, handing off melanin that shields neighboring cells’ DNA from UV. The darker band drawn at this junction is that pigment. Melanoma is malignant transformation of these cells; how deep a melanoma has grown below this layer — Breslow depth — is the most important prognostic factor in the localized disease.' },
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
  { gene:'TP53 mutation', class:'driver', ccf:'~10% of the BRAF subtype — TCGA’s own table prints the caveat: "TP53 wild-type in ~90% of BRAF subtype" (TCGA, Cell, 2015); 15% of the cohort overall, 93.9% of those in UV-signature samples', note:'The genome’s damage-response checkpoint, mutated late and in a minority — melanoma mostly disables the p53 PATHWAY indirectly (CDKN2A loss removes p14ARF, p53’s stabilizer) rather than hitting the gene itself, which is why the guardian-of-the-genome gene is a private-tier finding here rather than the trunk it is in ovarian and breast cancer. When present: mutation counts run higher and the changes are C-to-T transitions (TCGA), and it appears "only in advanced primary melanomas" (Shain et al., 2015).' },
  { gene:'TTN synonymous variant', class:'passenger', note:'A DNA change with no effect on the protein it sits in — background noise, common because TTN is one of the genome’s largest genes. It earns its place in THIS cancer’s pool more than any other: across 7,042 tumors, "cancers related to chronic mutagenic exposures such as lung (tobacco) and malignant melanoma (UV) exhibited the highest prevalence" of somatic mutations (Alexandrov et al., Nature, 2013) — melanoma’s per-cell mutation load is the heaviest in this atlas, and almost all of it is passengers like this one.' },
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

export const cancerDetails = {
  melanoma: {
    title:'Cutaneous Melanoma', screenLabel:'Cutaneous melanoma — tumor explorer',
    legendTitle:'Sites (real distant-metastasis pattern)',
    regions:REGIONS_MEL, trunk:TRUNK_MEL, privatePool:PRIVATE_POOL_MEL,
    histology: HISTOLOGY_MEL,
  },
};
