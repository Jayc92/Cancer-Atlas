import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeSeededRandom, seedFromKey } from './rng.js';

// --- Colour-managed rendering pipeline (unparked 2026-09-03, by measurement) ---------------
// This file shipped for its whole life on the "legacy identity" pipeline: ColorManagement
// OFF, LinearSRGB output, no tone mapping — deliberately, to preserve the r128-era hand-tuned
// look (the old comment here recorded a measured 39% luminance drop when the three.js upgrade
// first flipped the defaults, and parked the redesign as "would change the look, not correct
// it"). That parking rationale is now SUPERSEDED by a measurement record (the P2 pipeline
// report, 2026-09-03), whose findings are the contract for the values below:
//   - The legacy pipeline was an IDENTITY pipeline only for the flat-lit case (no decode in,
//     no encode out), so the repo's historical colour verifications remain valid for what
//     they measured. What was wrong was the SHADING: every gradient, terminator, and light
//     mix computed in gamma space — and a hard clip at 1.0/channel with no rolloff, the
//     documented root cause of the blown-white bug class (clip-fix pass: intensities dimmed
//     to 0.42/0.65, marker glow lights stripped from real meshes, 26%-of-lungs plateaus).
//   - Corrected {CM on + sRGB out} leaves the lit-face palette statistically unmoved vs
//     legacy (mean hue delta 4.8° vs 4.9°; sat dev 0.397 vs 0.378 against cited albedos) —
//     the correction does not move the signed-off colours where they were verified.
//   - Operator chosen on numbers, not defaults: AgX measured BEST saturation fidelity to the
//     cited albedos (dev 0.174 — better than legacy's own 0.378); Neutral, the pre-favoured
//     candidate, measured WORST (0.594 — it faithfully preserves this warm rig's saturation
//     overshoot); ACES hue-rotates the darkest reds. All three operators measured ZERO blown
//     pixels at lights ×1.35 across 14 organs × 12 angles, so the choice reduced to fidelity.
//   - Exposure 1.0: "match legacy brightness" is the wrong target — dark organs (liver,
//     kidneys) render brighter under the corrected pipeline BECAUSE legacy's gamma-space
//     lighting crushed dark albedos (the very effect the old comment measured in reverse).
//     Accepted at review with the pale-organ cost inspected (~10-15% dimmer, no regression
//     read; the testis glow halos tame from blown blooms to soft accents).
//   - CONDITION DISCHARGED (2026-09-03, env-map pass): the operator was re-measured against
//     the env-mapped scene at the shipped intensity 0.25 — AgX mean |dSat| 0.043 vs ACES
//     0.079, control 0.107, Neutral 0.207; blown pixels 0 under all four. AgX re-confirmed.
//     BUT THE MECHANISM FLIPPED while the verdict held: in the P2 rig AgX won by offsetting
//     an over-saturating warm rig; under env it UNDERSHOOTS cited saturation on 6 of 9 cited
//     organs (worst testis -0.087). "AgX offsets the rig's saturation push" is therefore no
//     longer true and must not be carried into any later lighting change as a rule of thumb —
//     the next rig change re-measures, it does not reason from P2. Glow-light restoration is
//     still a separate pass with its own gate against the new zero-clip baseline.
THREE.ColorManagement.enabled = true;

// The former LEGACY_LIGHT_SCALE = π is retired (2026-09-03). It existed to compensate for
// r155 deleting useLegacyLights (physically-correct lighting carries a 1/π the legacy path
// omitted), and the derivation below it was sound — but under the corrected pipeline it is
// no longer a "legacy compensation", it is simply part of the light energy the design needs.
// The π is folded into the literal intensities at full precision (0.42π, 0.65π, 0.55π, 0.9π,
// 1.1π, and main.js's glow 0.5π), numerically identical to what shipped, so the constant and
// its misleading name are gone without changing a single rendered value.

// Small helper every organ/cancer data module reads its region/site colors through, so those
// modules never hardcode a hex value that could drift from the design-system CSS variables.
export function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

// --- Environment map: a gradient derived from the design system, not an imported HDRI ---------
// Every light in this file is a point/directional/ambient source, which means indirect light is
// a flat constant: an ambient term adds the SAME irradiance to a surface facing the viewer and
// one facing into a fold. A real room does not do that, and it is why concave organ geometry
// (lung fissure, kidney hilum, prostate fold) has always read flatter than the surrounding
// convex surface. An image-based environment gives direction-varying indirect light for free.
//
// DERIVATION — the three stops are read from the app's own CSS custom properties through
// cssVar(), the same channel every organ module reads its region colours through, so the
// "room" the organs sit in cannot drift from the UI they sit inside:
//   floor   --bg      #0b0f1a   the page background, i.e. what is actually behind the canvas
//   horizon --panel   #121a2b   the panel chrome that visually surrounds the viewer
//   sky     --text    #e7ecf6   the brightest token in the system; the only one bright enough
//                               to function as a light source rather than a tint
// --teal (and every other accent) is DELIBERATELY EXCLUDED from the illumination spectrum.
// Accents exist to make UI state legible; putting one in the env map would push a hue onto
// every tissue albedo in the app, and those albedos are individually cited against real
// gross-anatomy sources. The three tokens above are all neutral-to-cool greys of the same
// family, so this map varies mostly in VALUE — which is the property being added here.
//
// Built as LINEAR-LIGHT FLOAT data, not sRGB bytes, on purpose. scene.environment is handed to
// PMREMGenerator internally, and an 8-bit texture's colour-space tag has to survive that
// conversion for the result to mean what it says; Color.setStyle() with ColorManagement on
// already returns linear working-space components, so writing those into a FloatType texture
// makes the decode explicit here instead of assumed downstream.
//
// RESOLUTION IS A CORRECTNESS CONSTRAINT, NOT A QUALITY DIAL. PMREMGenerator sizes its cube face
// at equirectWidth/4 and its blur chain starts at LOD_MIN = 4, i.e. a 16-texel face. Below that
// the roughness mips are never written, and diffuse IBL — which samples those mips — evaluates to
// exactly ZERO while mip 0 still holds real colour, so the map looks present and lights nothing.
// A white roughness-0.5 probe sphere lit by env alone, measured through this exact code path:
//     W=32 -> 0.0      W=48 -> 0.0      W=64 -> 120.75      W=256 -> 120.65     W=512 -> 120.60
// So W must be >= 64, and above 64 the response is converged to within 0.2% for a gradient with no
// high-frequency content. W=256 is two octaves clear of the cliff, because the failure at the cliff
// is silent: no warning, no error, just unlit geometry.
//
// The same cliff retroactively corrects the premise this feature was built on. The reference app
// (thebuggeddev/anatomy) ships its gradient at SIXTEEN texels wide — cube face 4, further below
// the floor than the 32 first tried here — so by the measurement above its env map almost
// certainly contributes nothing, and its look comes from baked albedo textures plus its light
// rig alone. "The gap against the reference is that they have IBL and we don't" was wrong on
// both halves; recorded so nobody re-imports its dimensions as a known-good reference.
//
// Row 0 of a DataTexture is v=0, and three.js's equirectUv() maps v=0 to -Y: the data is filled
// FLOOR-FIRST, upward. Getting this backwards renders a plausible-looking scene lit from below.
const ENV_HORIZON_V = 0.45;  // slightly below the equator, so the bright half reads as "above"
// ENV_INTENSITY — MEASURED, not chosen by eye. Swept 0 / 0.08 / 0.15 / 0.20 / 0.25 / 0.32 / 0.40 /
// 0.50 under AgX at exposure 1.0, comparing each of the 9 cited-albedo organs' lit face against its
// cited albedo in HSV. Hue error and value error both improve monotonically as env rises
// (|dHue| 4.73 -> 4.05, dVal -0.063 -> -0.041), so on those two axes alone more is always better.
// Saturation splits the organs in two and pulls in opposite directions:
//     mean |dSat|, pale organs (cited V >= 0.70)   0.034 -> 0.056   worsens with env
//     mean |dSat|, dark organs (kidneys, liver)    0.074 -> 0.014   improves with env
// Adding broadband indirect light desaturates every albedo it touches, which corrects the two dark
// organs (rendered ABOVE cited saturation) and degrades the seven pale ones (rendered BELOW it).
// The two curves cross at 0.25 — pale 0.043, dark 0.042 — so 0.25 is the minimax point: it is the
// level that minimises the error of whichever group is worse off. Neither 0.20 (dark 0.049) nor
// 0.32 (pale 0.047) is as good by that test, and aggregate |dSat| is flat across the whole
// 0.15-0.32 span (0.042-0.044), so the aggregate cannot pick a value and the split has to.
// The minimax choice also happens to dominate its lower neighbour outright: against 0.20 it wins
// hue (4.40 vs 4.47) and value (-0.052 vs -0.054) and concedes 0.001 of mean |dSat| — so 0.25
// stands on three axes, not one (accepted at review on exactly that reading).
//
// This is a single GLOBAL level, deliberately. The disagreement above is between pale and dark
// ALBEDOS, and both groups live inside one material class (B), so a per-material-class
// envMapIntensity cannot address it; and varying env by albedo lightness would assert that pale
// tissues sit in a dimmer room than dark ones, while also making a fidelity delta attributable to a
// per-organ fudge factor rather than to the cited albedo it is supposed to test.
//
// Light intensities are UNCHANGED. dVal stays negative at every level measured, i.e. the renders sit
// below cited value rather than above it, and the blown-pixel count is 0 for all 14 organs at every
// env level and under all four tone-mapping operators. Env is closing an existing value deficit,
// not adding brightness that has to be paid for elsewhere.
const ENV_INTENSITY = 0.25;
// One map for every viewer. All three derive from the same CSS tokens, so three copies would be
// identical by construction; each renderer still runs its own PMREM conversion, which is per-
// renderer state, but the 512 KB source is built once.
let sharedEnvTexture = null;
export function getEnvTexture(){
  if(sharedEnvTexture) return sharedEnvTexture;
  const floorColor = new THREE.Color().setStyle(cssVar('--bg'));
  const horizonColor = new THREE.Color().setStyle(cssVar('--panel'));
  const skyColor = new THREE.Color().setStyle(cssVar('--text'));
  const W = 256, H = 128;
  const data = new Float32Array(W * H * 4);
  const c = new THREE.Color();
  for(let y=0; y<H; y++){
    const v = (y + 0.5) / H;
    if(v < ENV_HORIZON_V){
      c.copy(floorColor).lerp(horizonColor, v / ENV_HORIZON_V);
    } else {
      // Smoothstep above the horizon rather than a straight ramp: the upper half is the half
      // with enough radiance to show a seam in a specular highlight on a smooth serosal surface.
      const t = (v - ENV_HORIZON_V) / (1 - ENV_HORIZON_V);
      c.copy(horizonColor).lerp(skyColor, t * t * (3 - 2 * t));
    }
    for(let x=0; x<W; x++){
      const i = (y * W + x) * 4;
      data[i] = c.r; data[i+1] = c.g; data[i+2] = c.b; data[i+3] = 1;
    }
  }
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  // Linear, not the DataTexture default of Nearest: PMREM samples this map as a continuous
  // function, and nearest-filtering a gradient feeds it stair steps to blur.
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  // colorSpace left at NoColorSpace: the data above IS linear working-space light.
  tex.needsUpdate = true;
  sharedEnvTexture = tex;
  return tex;
}

// ============================================================
// SHARED INTERACTION HELPER
// ============================================================
// Drag-vs-click disambiguation. Every pointer gesture in this app does double duty —
// "rotate the model" and "select the thing under the cursor" — so a gesture only counts
// as a click if the pointer barely moved. Shared by the body screen and every
// makeViewer instance so the threshold cannot drift between viewers.
const CLICK_DRAG_THRESHOLD_PX = 6;

export function makeMoveTracker(){
  let totalMovementPx = 0, lastX = 0, lastY = 0;
  return {
    begin(e){ totalMovementPx = 0; lastX = e.clientX; lastY = e.clientY; },
    // Returns this event's delta so each caller applies its own rotation math.
    track(e){
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      totalMovementPx += Math.abs(dx) + Math.abs(dy);
      return { dx, dy };
    },
    isClick(){ return totalMovementPx < CLICK_DRAG_THRESHOLD_PX; }
  };
}

// ============================================================
// SHARED 3D HELPERS
// ============================================================

// Deterministic organic vertex displacement (no external noise lib needed)
export function organicDisplace(geometry, amplitude, freq, seed){
  const pos = geometry.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
    const len = Math.sqrt(x*x+y*y+z*z) || 1;
    const nx=x/len, ny=y/len, nz=z/len;
    const n = Math.sin(nx*freq+seed) * Math.cos(ny*freq*1.3+seed*2) * Math.sin(nz*freq*0.7+seed*3);
    const disp = 1 + amplitude*n;
    pos.setXYZ(i, x*disp, y*disp, z*disp);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

// Spiculated variant for the tumor site blobs: layers organicDisplace's smooth asymmetric
// wobble with a sparse set of narrow, finger-like projections, each confined to a tight cone
// around a random direction (angular falloff via pow(dot, sharpness), not radial noise). A
// uniformly higher amplitude on organicDisplace only ever produces bigger/smoother lumps —
// never fingers, no matter how large — because that noise has no notion of "a few sharp
// spikes vs everywhere". This is what actually reads as spiculated/invasive margins rather
// than a rounder blob.
export function organicSpiculate(geometry, opts){
  const amplitude = opts.amplitude, freq = opts.freq, seed = opts.seed;
  const spikeRandom = makeSeededRandom(seedFromKey('spike'+seed));
  const spikes = [];
  for(let i=0;i<opts.spikeCount;i++){
    const theta = spikeRandom()*Math.PI*2, phi = Math.acos(2*spikeRandom()-1);
    spikes.push({
      dx: Math.sin(phi)*Math.cos(theta), dy: Math.cos(phi), dz: Math.sin(phi)*Math.sin(theta),
      len: opts.spikeLength * (0.55 + 0.8*spikeRandom()),
      sharp: opts.sharpness * (0.7 + 0.6*spikeRandom())
    });
  }
  const pos = geometry.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
    const len = Math.sqrt(x*x+y*y+z*z) || 1;
    const nx=x/len, ny=y/len, nz=z/len;
    const n = Math.sin(nx*freq+seed) * Math.cos(ny*freq*1.3+seed*2) * Math.sin(nz*freq*0.7+seed*3);
    let spike = 0;
    for(const s of spikes){
      const dot = Math.max(0, nx*s.dx + ny*s.dy + nz*s.dz);
      spike += Math.pow(dot, s.sharp) * s.len;
    }
    const disp = 1 + amplitude*n + spike;
    pos.setXYZ(i, x*disp, y*disp, z*disp);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

// Necrotic-looking mottling, baked as per-vertex color rather than a procedural texture —
// there are no meaningful UVs on a subdivided icosahedron to hang a texture off, so vertex
// colors is the simpler path given what's already here. Patchy rather than a smooth gradient
// (the (t-threshold)/range clamp zeroes out most of the surface before blending starts), which
// reads as isolated darker patches instead of an even tint — closer to how necrotic tissue
// actually looks. Capped at 0.4 of the way to the necrotic tone so the site's own color stays
// the dominant one; the emissive glow below is set from the pure, unmottled region color for
// the same reason — the glow is what has to stay instantly identifiable at a glance.
export function applyMottleVertexColors(geometry, colorHex, seed){
  const base = new THREE.Color(colorHex);
  const necrotic = new THREE.Color(0x1c1410);
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count*3);
  const c = new THREE.Color();
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
    const len = Math.sqrt(x*x+y*y+z*z) || 1;
    const nx=x/len, ny=y/len, nz=z/len;
    const t = Math.sin(nx*13+seed*1.7) * Math.cos(ny*14.2+seed*2.3) * Math.sin(nz*11.6+seed*3.1);
    const patch = Math.max(0, (t-0.05)/0.95);
    c.copy(base).lerp(necrotic, patch*0.55);
    c.toArray(colors, i*3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

// ORGAN REALISM PASS (dated entry in CLAUDE.md carries the full recipe/measurements) — ports
// the PATCHY-NOISE TECHNIQUE above, not the function itself, onto the nine real-scan organ
// meshes. Two changes from applyMottleVertexColors, both deliberate:
//
// 1. MULTIPLICATIVE DARKENING MASK, not a lerp toward a second stored color. Vertex colors and
//    material.color multiply in this renderer's fragment shader (`diffuseColor.rgb *= vColor`,
//    same chunk MeshStandardMaterial and MeshPhysicalMaterial both use) — which is exactly why
//    the tumor-blob material above never sets its own `color` at all (default white, so
//    material.color * vColor === vColor, the vertex color IS the final color). Every organ
//    material here keeps its own verified, cited real-tissue `color` hex, so baking that same
//    hex into the vertex-color attribute would make the shader multiply the color by itself
//    (0.55 * 0.55, not 0.55) — silently darkening the ENTIRE mesh, not just the mottled patches.
//    Confirmed by reasoning through the shader chunk before writing this, not discovered by a
//    bad screenshot. The fix: this function's vertex-color attribute holds a plain (m,m,m)
//    gray multiplier, m<=1 always, applied on TOP of the organ's own untouched material.color —
//    m=1 (no change) across most of the surface, dipping toward `1-amplitude` inside patches.
//    This is also what makes the port clip-safe by construction: a multiplier that can only
//    ever be <=1 can only ever REDUCE a vertex's rendered brightness relative to the unmottled
//    base, never push it closer to this pipeline's hard 1.0 clip ceiling — worth stating
//    explicitly given the clip-fix pass this same file documents above. Scaling every channel by
//    the same factor also leaves hue and HSV saturation exactly unchanged (only value drops),
//    which is why this reads as "less blood flow / a shadowed fold," not a color-family shift.
//
// 2. BOUNDING-BOX-RECENTERED direction, not raw-position-normalized. applyMottleVertexColors'
//    `nx=x/len` treats the geometry's raw position attribute as already centered at its own
//    local origin — true for the tumor blobs (a fresh IcosahedronGeometry, always centered at
//    (0,0,0)) but NOT guaranteed for an imported GLB: colon.js and pancreas.js recenter the
//    *node* (`gltf.scene.position.sub(center)`) after load, which leaves the underlying
//    BufferGeometry's own position attribute exactly as authored — still ~19-26cm off-origin in
//    HRA body-space for those two. Feeding that raw offset into the same sin/cos basis biases
//    almost every vertex into a narrow slice of the curve instead of spreading patches across
//    the surface. Recomputing the direction from the geometry's OWN bounding box (per-axis,
//    centered and half-extent-normalized to roughly [-1,1]) fixes this for every organ
//    regardless of where its vertex data sits, at the cost of one extra `computeBoundingBox()`
//    per sub-mesh — negligible next to this app's own mesh-resolution budget (see the
//    mesh-geometry-resolution entry below: every organ mesh benchmarked under 0.08ms/frame at
//    far higher vertex counts than this adds).
export function applyTissueMottleVertexColors(geometry, seed, opts){
  opts = opts || {};
  const amplitude = opts.amplitude != null ? opts.amplitude : 0.28;
  const freq = opts.freq || 13;
  // --- Baked per-vertex AO composition (4B) -------------------------------------------------
  // If the GLB shipped a COLOR_0 attribute, it is the offline-baked ambient occlusion
  // (grey, ao in [0,1]; bake recorded in the 4B entry — Cycles, fixed seed, from the a131649
  // masters). It is stashed once under 'aoBaked' so this function stays IDEMPOTENT: the
  // composed 'color' written below would otherwise be read back as AO on a second call and
  // compound. Composition is multiplicative with a strength knob k (opts.aoStrength):
  //     final = m × (1 − k·(1 − ao)),   m ≤ 1, k ∈ [0,1], ao ∈ [0,1]
  // Both factors are ≤ 1, so the mottle's clip-safe-by-construction property survives
  // unconditionally — the same reason the mottle itself is safe. k lives HERE, not in the
  // bake, so per-organ tuning (or disabling: k = 0 reproduces the pre-4B look exactly) never
  // requires re-baking an asset.
  if(!geometry.getAttribute('aoBaked') && geometry.getAttribute('color')){
    geometry.setAttribute('aoBaked', geometry.getAttribute('color'));
  }
  const bakedAO = geometry.getAttribute('aoBaked') || null;
  const aoStrength = opts.aoStrength != null ? opts.aoStrength : (bakedAO ? 1.0 : 0.0);
  // --- Mottle frame (Tier 2, 2026-09-04) ---------------------------------------------------
  // By default the sin/cos pattern is normalised to THIS geometry's own bounding box — which on
  // a multi-sub-mesh organ makes the pattern DISCONTINUOUS at every sub-mesh boundary: each part
  // re-normalises to its own box, so the phase jumps where parts meet. That was the pancreas
  // "seam" the P5 audit found (attributed by isolation: AO-only renders seamlessly across the
  // same boundary; mottle-only shows the line). Multi-mesh callers pass opts.frame =
  // { box: THREE.Box3 in WORLD space, matrixWorld: this mesh's world matrix } and every part
  // then samples ONE shared field — continuous by construction. Single-mesh callers change
  // nothing. (Bladder shares this latent mechanism across its 6 sub-meshes but shows no visible
  // seam at its freq-4 pattern scale, so its look — signed off — is deliberately left alone.
  // If bladder's mottle FREQUENCY is ever retuned, expect the boundary seam to surface: the fix
  // is the same opts.frame union box pancreas.js passes, and the explanation is this comment.)
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const frame = opts.frame || null;
  const center = frame ? frame.box.getCenter(new THREE.Vector3()) : bb.getCenter(new THREE.Vector3());
  const size = frame ? frame.box.getSize(new THREE.Vector3()) : bb.getSize(new THREE.Vector3());
  // Floored the same defensive way organicDisplace floors a zero-length direction vector
  // (`|| 1`) — guards a flat/degenerate sub-mesh axis from dividing toward infinity; none of
  // the nine organs' real sub-meshes are actually this thin, but a shared helper shouldn't
  // assume that of every future caller.
  const halfX = Math.max(size.x/2, 1e-6), halfY = Math.max(size.y/2, 1e-6), halfZ = Math.max(size.z/2, 1e-6);
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count*3);
  const w = frame ? new THREE.Vector3() : null;
  for(let i=0;i<pos.count;i++){
    // With a shared frame the sample point must be in the frame's (world) space — compressed
    // GLBs carry dequantisation transforms on wrapper nodes, so locals are NOT world-aligned.
    let px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
    if(frame){ w.set(px, py, pz).applyMatrix4(frame.matrixWorld); px = w.x; py = w.y; pz = w.z; }
    const nx=(px-center.x)/halfX, ny=(py-center.y)/halfY, nz=(pz-center.z)/halfZ;
    const t = Math.sin(nx*freq+seed*1.7) * Math.cos(ny*(freq+1.2)+seed*2.3) * Math.sin(nz*(freq-1.4)+seed*3.1);
    const patch = Math.max(0, (t-0.05)/0.95);
    const m = 1 - patch*amplitude;
    // getX denormalizes uint8/uint16 attributes itself in three 0.185, so ao is [0,1] whether
    // COLOR_0 arrived as float or as gltfpack's quantized normalized bytes.
    const ao = bakedAO ? (1 - aoStrength * (1 - bakedAO.getX(i))) : 1;
    const v = m * ao;
    colors[i*3]=v; colors[i*3+1]=v; colors[i*3+2]=v;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

export function makeViewer(container, opts){
  const scene = new THREE.Scene();
  // Near plane 0.01, not 0.1. applyFraming() slides the camera to (boundingRadius · padding)
  // / sin(halfFov) with no floor tied to the near plane, so a real mesh small enough frames the
  // camera to INSIDE its own near plane and everything nearer than the plane is clipped away.
  // The thyroid — the first true-scale mesh under ~5 cm — frames to 9.6 cm, inside the old
  // 10 cm near. And because artist meshes ship doubleSided, the failure isn't an obvious blank
  // view but a convincing sliced-open shell: from behind, the inside of the anterior wall reads
  // as a clean solid organ. Caught only because the front view disagreed with the back view,
  // which an opaque closed mesh cannot do. 0.01 clears every organ down to ~1 cm bounding
  // radius at its zoom floor; at these scene scales (organs cm–dm, bodies ~2 m, far 100) the
  // depth-buffer precision cost is far below anything visible.
  const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  // Pairs with ColorManagement.enabled = true at the top of this module: decode going in,
  // encode coming out. Setting only one of the two would leave the pipeline lopsided — that
  // sentence survives from the legacy comment because it cuts both ways.
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // AgX at exposure 1.0 — measured choice, not a default; see the pipeline comment at the
  // top of this file for the numbers and the re-measure-after-envmap condition.
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Indirect light. See getEnvTexture() above for the derivation of the map itself, and the
  // ENV_INTENSITY block beside it for how the intensity below was chosen.
  // opts.envIntensity === 0 disables it (an explicit control for measurement runs), which is
  // why the test is against null rather than falsy.
  scene.environment = getEnvTexture();
  scene.environmentIntensity = opts.envIntensity != null ? opts.envIntensity : ENV_INTENSITY;

  // Intensities below are the original hand-tuned design values with the retired π folded in
  // at full precision (see the pipeline comment at the top of this file) — numerically
  // identical to what every prior pass shipped and reviewed.
  //
  // opts.warmLighting is an organ-viewer-only opt-in (set by initOrganViewer in main.js,
  // never by body.js or the tumor-site viewer), added specifically so the real-tissue material
  // colors on the seven organs (see each js/organs/*.js buildXMesh — verified against real
  // gross-anatomy sources, not guessed, same discipline as every citation in this app) don't
  // get lit by the same cool-white key + teal rim that were originally tuned against the old,
  // paler procedural colors. (Historical note: this opt-in predates the colour-managed
  // pipeline and deliberately did not touch it while it was parked; the pipeline has since
  // been corrected — see the top of this file.) Only the light *color* and the rim light's
  // presence differ between modes, and only for organs.
  const warm = !!opts.warmLighting;
  // Warm-mode intensities are LOWER than the cool path's 0.55/0.9 on purpose (clip-fix pass):
  // this legacy pipeline hard-clips at 1.0 per channel (ColorManagement off, LinearSRGB out,
  // no tone mapping), and 0.55+0.9 gives a 1.45x peak diffuse factor — enough to clip the
  // R/G channels of every paler verified tissue albedo (breast R 0.89 x 1.45 = 1.29) before
  // specular even lands. On concave/wrinkled geometry (lung fissure, areolar indent,
  // prostate's medial fold, brain sulci) whole light-facing, camera-grazing walls tipped past
  // 1.0 in all three channels at once -> hard-edged blown-white plateaus, measured at up to
  // 26% of the lungs' on-screen pixels. Latent since the original warm-lighting commit —
  // that pass's review renders were Blender approximations with deliberately tamed specular,
  // so the live pipeline's clipping was never in any reviewed screenshot. 0.42+0.65 = 1.07x
  // peak keeps the brightest verified albedo just under clip; the per-organ material colors
  // (verified against real gross-anatomy sources) are deliberately untouched, and scaling
  // light intensity uniformly preserves their hue by construction.
  // PRESENT-TENSE CODA (pipeline correction, 2026-09-03): the hard ceiling this paragraph
  // works around is GONE — AgX tone mapping compresses instead of clipping, measured at zero
  // blown pixels with these lights ×1.35 across all organs and angles. The 0.42/0.65 values
  // are RETAINED anyway: raising light energy (and restoring the stripped marker glow lights)
  // is a separate, individually-gated pass, not a free rider on the pipeline switch.
  scene.add(new THREE.AmbientLight(warm ? 0xfff1e0 : 0xffffff, warm ? 1.319468914507713 : 1.7278759594743864));  // 0.42π / 0.55π folded
  const key = new THREE.DirectionalLight(warm ? 0xffddb0 : 0xffffff, warm ? 2.0420352248333655 : 2.827433388230814);  // 0.65π / 0.9π folded
  key.position.set(3, 4, 5);
  scene.add(key);
  if(!warm){
    // 4th arg is decay, explicit because its default flipped 1 → 2 in r146. This teal rim
    // light is a broad wash across the whole model, so inverse-square falloff would
    // extinguish it. Dropped entirely in warm mode — a cool teal accent is the exact thing
    // the warm-material treatment is moving away from, not something to warm-tint in place.
    const rim = new THREE.PointLight(0x35c9c1, 3.455751918948773, 20, 1);  // 1.1π folded
    rim.position.set(-4, -2, -3);
    scene.add(rim);
  }

  // --- Camera control: real OrbitControls ---------------------------------------------------
  // Attached to the container, not to renderer.domElement, for two reasons. The canvas fills
  // the container so the hit area is the same either way, but the projected DOM proxies
  // (.organ-point / .site-label) are container children, and more importantly OrbitControls
  // normalises rotation by `domElement.clientHeight` — so the element it is given is the
  // element the speed calibration below has to be computed against.
  const controls = new OrbitControls(camera, container);

  // Panning is off. Preserving the old behaviour is only half the reason: the other half is
  // that panning moves controls.target off the origin, and three other things in this file
  // assume the target IS the origin — the framing maths measures distance from (0,0,0), the
  // projected label positions come from a camera that looks at it, and frameContents() places
  // the camera along a direction vector through it. Enabling pan would silently break all of
  // those rather than just adding a gesture.
  controls.enablePan = false;
  // The hand-rolled rig applied pointer deltas straight to theta/phi with no easing, so the
  // model stopped the instant the pointer stopped. Damping would add glide the design never had.
  controls.enableDamping = false;

  controls.minDistance = opts.minRadius || 2.4;
  // Assigned, not just read: frameContents() may need to push the zoom-out limit further than
  // the caller's guess in order to fit everything on a wide or narrow viewport.
  controls.maxDistance = opts.maxRadius || 7;
  // The polar clamp the hand-rolled rig applied as Math.max(0.35, Math.min(2.7, phi)). Keeping
  // it stops the camera reaching either pole, where the model reads as a featureless disc.
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 2.7;

  // Two speed calibrations, both derived rather than eyeballed, so the migration is a
  // like-for-like swap instead of a new feel. Derivations:
  //
  //  rotateSpeed — OrbitControls turns a drag into `2π · Δpx / clientHeight` radians, i.e. it
  //  normalises by container height so a full drag across the viewer is a constant fraction of
  //  a turn at any size. The hand-rolled rig used a flat 0.008 rad/px regardless of size.
  //  Equating them gives rotateSpeed = 0.008 · clientHeight / 2π. That depends on the container,
  //  so it is recomputed in resize() rather than fixed at construction — which makes the match
  //  hold at every viewport, where a single hardcoded constant would only be right at one.
  //
  //  autoRotateSpeed — with update() called with no argument, OrbitControls advances
  //  2π/60/60 · autoRotateSpeed radians per frame, matching the hand-rolled rig's per-frame
  //  (not per-second) spin. So autoRotateSpeed = radiansPerFrame · 3600/2π.
  //  NEGATED because the two spin in opposite directions: the old spin() did `theta += delta`,
  //  while autoRotate calls _rotateLeft(), which does `theta -= angle`. Without the sign the
  //  models would still rotate at the right speed, the wrong way round.
  const HAND_ROLLED_RAD_PER_PX = 0.008;
  controls.autoRotateSpeed = -(opts.autoRotateRadPerFrame || 0.0016) * 3600 / (2 * Math.PI);
  controls.autoRotate = opts.autoRotate !== false;

  // zoomSpeed — this one can only be approximated, and the residual difference is real.
  // The hand-rolled rig added a fixed distance per wheel notch (radius += deltaY · 0.003);
  // OrbitControls multiplies by 0.95^(zoomSpeed · |deltaY|/100), a proportional step. A fixed
  // step and a proportional step cannot be equal at more than one radius. Solving for equality
  // at the radius the viewer actually opens at, for a standard 100-unit notch, gives the value
  // below; away from that radius OrbitControls zooms in relatively coarser steps when close and
  // finer when far, which is the more conventional feel but is not identical to what was here
  // before.
  //
  // It has to be the radius the viewer actually OPENS at, which is not necessarily opts.radius:
  // applyFraming() slides the camera out to fit the contents, and for the tumour site map that
  // lands near 8.7 rather than its nominal 4.6. Anchoring to the nominal value made the site
  // map's wheel zoom 1.8x too fast (measured: +6.3% apparent size per notch against the old
  // rig's +3.6%). The ovary viewer's framed distance happens to sit close to its nominal, which
  // is why it matched and hid the error — hence the recalibration at the end of applyFraming().
  // Solve 0.95^zoomSpeed = 1 - step/radius, i.e. "one notch multiplies the distance by whatever
  // subtracting a fixed 0.3 used to". The step is SUBTRACTED, so it is log(1 - step/radius), not
  // log(1 + ...): those agree only to first order and the difference is a real 7.8% error in the
  // zoom step at radius 4. minDistance keeps radius well above the step, but clamp anyway rather
  // than risk log of a non-positive number if a future viewer is configured closer in than one
  // notch's worth of distance.
  const WHEEL_STEP = 100 * 0.003;
  function calibrateZoomSpeed(radius){
    const fraction = Math.min(WHEEL_STEP / radius, 0.5);
    controls.zoomSpeed = Math.log(1 - fraction) / Math.log(0.95);
  }
  const nominalRadius = opts.radius || 4.2;
  calibrateZoomSpeed(nominalRadius);

  // Deliberately NOT calling controls.listenToKeyEvents(). Arrow-key panning is opt-in, and
  // leaving it off keeps the arrow keys free — the viewers hold real focusable controls (the
  // investigate points and site labels), and a camera that moved on arrow presses would fight
  // the keyboard navigation the accessibility passes established.

  // Initial camera placement. The spherical formula is still here because OrbitControls has no
  // "start at this theta/phi/radius" API — it derives its own spherical state from wherever the
  // camera already is on each update(). This is placement, not control: nothing recomputes it.
  const startTheta = opts.theta || 0.6, startPhi = opts.phi || 1.15;
  camera.position.set(
    nominalRadius * Math.sin(startPhi) * Math.sin(startTheta),
    nominalRadius * Math.cos(startPhi),
    nominalRadius * Math.sin(startPhi) * Math.cos(startTheta)
  );
  controls.update();

  // A framing request can arrive before the container has been laid out, and the fit
  // depends on a real aspect ratio — computing it against a placeholder 1x1 container
  // yields a nonsense distance. So remember the request and let resize() retry it once
  // the container actually has dimensions.
  let framingMeshes = null, framingPadding = 1.12, hasFramed = false;
  // Held so a second addGround() call replaces the staging instead of stacking a second plinth
  // inside the first (organ viewers are reused across sidebar selections, not rebuilt per organ).
  let groundGroup = null;

  // Pull the camera back far enough that everything in `framingMeshes` fits the frame.
  // The rig always looks at the origin, so distance is measured from there rather than
  // from the contents' centre. The limiting constraint is the narrower of the two view
  // angles — vertical on a wide viewport, horizontal on a tall one.
  function applyFraming(){
    const w = container.clientWidth, h = container.clientHeight;
    if(!framingMeshes || !w || !h) return false;
    const box = new THREE.Box3();
    framingMeshes.forEach(mesh=>{ mesh.updateMatrixWorld(); box.expandByObject(mesh); });
    if(box.isEmpty()) return false;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const framingRadius = sphere.center.length() + sphere.radius;
    const verticalFov = camera.fov * Math.PI / 180;
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
    const halfAngle = Math.min(verticalFov, horizontalFov) / 2;
    const needed = (framingRadius * framingPadding) / Math.sin(halfAngle);
    // Raised BEFORE the camera is moved, because controls.update() clamps the distance into
    // [minDistance, maxDistance] — widen the limit second and it would undo the framing.
    if(needed > controls.maxDistance) controls.maxDistance = needed;
    // Slide the camera along its current view direction rather than assigning a radius: that
    // preserves whatever orientation the user has already dragged to, which is what the old
    // updateCamera() did by leaving theta/phi alone. Distance is measured from the target,
    // which is the origin (pan is disabled), matching how framingRadius was computed above.
    const wanted = Math.max(controls.minDistance, needed);
    const dir = camera.position.clone().sub(controls.target);
    // Guard the degenerate case where the camera sits exactly on the target and has no
    // direction to slide along; fall back to the configured start orientation.
    if(dir.lengthSq() < 1e-8) dir.set(
      Math.sin(startPhi) * Math.sin(startTheta),
      Math.cos(startPhi),
      Math.sin(startPhi) * Math.cos(startTheta)
    );
    camera.position.copy(controls.target).addScaledVector(dir.normalize(), wanted);
    controls.update();
    // Re-anchor the wheel-zoom step to where the camera actually ended up, not to opts.radius.
    calibrateZoomSpeed(wanted);
    hasFramed = true;
    return true;
  }

  function resize(){
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    // Recalibrated per size, not once at construction — see the rotateSpeed derivation above.
    // clientHeight can legitimately be 0 here (a container inside a screen that has never been
    // shown), so fall back to the clamped h rather than dividing into a zero and producing a
    // rotateSpeed of 0 that would silently disable dragging.
    controls.rotateSpeed = HAND_ROLLED_RAD_PER_PX * h / (2 * Math.PI);
    // Retry a framing request that couldn't be satisfied before layout existed. Framing is
    // deliberately NOT re-run on later resizes: applyFraming() overrides camera distance, so
    // re-framing here would snap the user's zoom back mid-inspection. The staleness this
    // latch admits is bounded, and was measured (2026-09-03, pre-push latch check): the fit
    // above is purely angular, so it goes stale only if the container's ASPECT changes after
    // framing. The organ wrap pins aspect-ratio:1/1 in CSS, so its aspect cannot change with
    // layout — exactly invariant to container SIZE, and invariant to aspect up to integer
    // clientWidth/clientHeight rounding (a CSS square can still land 318x317, a <0.4% aspect
    // jitter, orders of magnitude inside the 1.3 framing padding). The body/site wraps
    // (inset:0) genuinely change aspect. The live trigger there is not "portrait windows" as
    // such — it is ANYTHING that pushes the aspect through 1.0 after framing, flipping which
    // axis limits the fit, and the sidebar toggle contributes 248px toward that flip: framed
    // wide + toggled narrower reaches it at a WIDER window than window-reshape alone. Measured
    // harmless at 1500x980 (aspect stays >1 in both toggle states, margins 567->443); the
    // Prompt-5 test case is the narrowest usable window PLUS a sidebar toggle, and any fix is
    // clip-aware re-fit design (this latch is load-bearing), not re-frame-on-resize.
    if(!hasFramed) applyFraming();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Click-vs-drag ------------------------------------------------------------------------
  // Still app-side, and deliberately so. OrbitControls r185 has no built-in equivalent: there
  // is no tap/threshold/"has moved" concept anywhere in it, and its only events are
  // start/change/end. `change` cannot stand in for one either, because update() dispatches it
  // on every autoRotate step (and autoRotate is on in both viewers), so a change between
  // start and end proves nothing about whether the *user* moved anything.
  //
  // What this does NOT do any more is move the camera — OrbitControls owns that now. These
  // listeners only measure how far the pointer travelled, reusing the same makeMoveTracker the
  // body screen uses, so the 6px threshold stays defined in exactly one place.
  let dragging = false;
  const tracker = makeMoveTracker();

  container.addEventListener('pointerdown', e=>{
    dragging = true; tracker.begin(e);
  });
  // On window, not the container, and that matters more than it used to: OrbitControls calls
  // setPointerCapture on its domElement, which retargets subsequent pointer events to it.
  // Window-level listeners still see them as they bubble, so this keeps measuring gestures that
  // leave the viewer mid-drag — the case the old code also handled by listening here.
  window.addEventListener('pointermove', e=>{
    if(!dragging) return;
    tracker.track(e);
  });
  window.addEventListener('pointerup', e=>{
    if(!dragging) return;
    dragging = false;
    if(tracker.isClick() && opts.onClick) opts.onClick(e, container);
  });

  return {
    scene, camera, renderer, container, controls,
    // autoRotate stays on this interface because two call sites outside the viewer toggle it
    // (drilling into a site pauses the spin, coming back resumes it). Delegating rather than
    // shadowing keeps one source of truth.
    get autoRotate(){ return controls.autoRotate; },
    set autoRotate(v){ controls.autoRotate = v; },
    get dragging(){ return dragging; },
    get framed(){ return hasFramed; },
    // Advance the controls one frame. Replaces the old spin(delta): autoRotate is now
    // OrbitControls' job, including pausing itself while the user drags — internally it is
    // gated on state === NONE, which is why the tick loops no longer need the !dragging test
    // they used to carry.
    update(){ controls.update(); },
    // Fit the camera to these meshes instead of trusting a hardcoded starting radius.
    // Returns false if the container isn't laid out yet; resize() will retry.
    frameContents(meshes, padding){
      framingMeshes = meshes;
      if(padding) framingPadding = padding;
      return applyFraming();
    },
    // Ground staging: a plinth disc plus a baked contact shadow, sized from the meshes given.
    // Purpose is depth cueing, not realism — a mesh floating in an empty void has nothing to
    // anchor its scale or its "down" against, which is the same reason the env map above exists.
    // Deliberately a BAKED gradient rather than a real shadow map: one directional light casting
    // a real shadow would need a shadow camera fitted per organ (organs here span ~1cm to ~30cm
    // bounding radius), and would put a hard-edged shape under an organ whose own silhouette is
    // the thing being examined. A soft radial darkening reads as contact without asserting a
    // shape the geometry doesn't have.
    //
    // Cannot affect picking, by construction: all three raycast sites in this app intersect
    // EXPLICIT mesh arrays (main.js organMarkers.map(m=>m.mesh) and siteBlobs.map(b=>b.mesh),
    // body.js visible.map(r=>r.mesh)) rather than scene.children, so geometry added here is
    // invisible to every hit test. Nor does it affect framing: applyFraming() measures
    // framingMeshes, which is whatever the caller passed to frameContents() — never the scene.
    addGround(meshes){
      if(groundGroup){ scene.remove(groundGroup); groundGroup = null; }
      const box = new THREE.Box3();
      meshes.forEach(mesh=>{ mesh.updateMatrixWorld(); box.expandByObject(mesh); });
      if(box.isEmpty()) return null;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      // Radius = the smallest disc that CONTAINS the footprint, plus 10%. Stated geometrically
      // rather than as a tuned fraction of one axis, because a fraction of max(x,z) is only
      // right at one footprint aspect ratio: it oversizes a wedge-shaped organ (liver, footprint
      // 0.247 x 0.170 m) while barely covering an elongated one (colon, 0.396 x 0.195 m — its
      // caecum hung off the front edge). Half the footprint diagonal is the circumscribing
      // radius for any aspect ratio, and the 10% is the visible margin.
      const radius = 0.5 * Math.hypot(size.x, size.z) * 1.10;
      const height = radius * 0.10;
      groundGroup = new THREE.Group();
      // Named, and reachable through the viewer as ground() below, because "staging" is not
      // inferable from geometry type. Anything that walks the scene to separate staging from
      // anatomy — the regression harness, any colour measurement that must exclude the plinth —
      // would otherwise test for CylinderGeometry/PlaneGeometry and catch real meshes: the skin
      // slab's hair shafts are cylinders too. Guessing by type mislabelled 4 anatomy meshes on
      // skin and misread the testis entirely.
      groundGroup.name = 'groundStaging';

      // --line, not --panel-2, and this was measured rather than picked. --panel-2 is DARKER than
      // the viewer pane it sits in, so a disc made of it renders below the background luminance
      // and reads as a hole punched in the panel, not a surface — 39-52% of the staging area came
      // out darker than the surrounding panel across thyroid/liver/colon, and the contact shadow
      // on top of it made a black smudge. --line is the design system's surface-delineation
      // token and renders 6-20 lum ABOVE the pane, so the disc reads as something lit. Same
      // trial also showed the shadow is useless WITHOUT the disc (a soft black gradient over a
      // dark void is invisible): the two are one element, not two independent options.
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 64),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(cssVar('--line')), roughness: 0.92, metalness: 0.0
        })
      );
      plinth.name = 'groundPlinth';
      plinth.position.set(center.x, box.min.y - height/2, center.z);
      groundGroup.add(plinth);

      // 256² is well past sufficient for a radial gradient that is then magnified and blurred by
      // nothing — the smoothness comes from the gradient itself, not from texel count.
      const cnv = document.createElement('canvas');
      cnv.width = cnv.height = 256;
      const ctx = cnv.getContext('2d');
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      // Peak 0.28 over the --line plinth: 0.40 was trialled and reads heavy under a small organ
      // (thyroid), 0.18 is invisible; 0.28 was the value that read as contact on all three trial
      // organs at once. Mid stop at 0.36x peak keeps the falloff from looking like a hard disc.
      grad.addColorStop(0.00, 'rgba(0,0,0,0.28)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.10)');
      grad.addColorStop(1.00, 'rgba(0,0,0,0.00)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      const shadowTex = new THREE.CanvasTexture(cnv);
      shadowTex.colorSpace = THREE.SRGBColorSpace;
      // Plane half-extent 0.95·radius, so its edges sit just inside the plinth rim on the axes.
      // Its corners reach 1.34·radius, past the rim — invisible because the gradient is fully
      // transparent well before there, which is cheaper than clipping to a disc.
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(radius * 1.9, radius * 1.9),
        // toneMapped:false — this is a compositing element, not a lit surface; running a
        // black-to-transparent overlay through AgX would lift its core off black.
        // depthWrite:false keeps it from occluding anything that draws after it.
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false })
      );
      shadow.name = 'groundContactShadow';
      shadow.rotation.x = -Math.PI / 2;
      // Epsilon scaled to the model, not absolute: these viewers span two orders of magnitude of
      // scene scale, and a fixed offset that clears z-fighting on the bodies would float visibly
      // above the plinth on the ovary.
      shadow.position.set(center.x, box.min.y + radius * 0.003, center.z);
      groundGroup.add(shadow);

      scene.add(groundGroup);
      return groundGroup;
    },
    // Read access to the staging, so callers can hide or inspect it without pattern-matching on
    // geometry type. Returns null in the viewers that deliberately have no plinth (the tumour site
    // map), which is a meaningful answer rather than a missing one.
    ground(){ return groundGroup; },
    resize,
    project(vec3){
      const v = vec3.clone().project(camera);
      const w = container.clientWidth, h = container.clientHeight;
      return { x:(v.x+1)/2*w, y:(1-v.y)/2*h, z:v.z };
    }
  };
}
