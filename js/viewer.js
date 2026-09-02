import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeSeededRandom, seedFromKey } from './rng.js';

// --- Rendering-pipeline compatibility with the r128-era look -------------------------------
// Three defaults changed between r128 and 0.185.1 that alter how this scene *looks* without
// touching a single line of scene code. Measured on the ovary viewer, the version bump alone
// took mean opaque RGB from [244,217,202] to [149,124,115] — a 39% luminance drop, pale pink
// to muddy brown — while the opaque-pixel count stayed within 0.07%, proving the camera and
// geometry were untouched and only shading changed. The three causes:
//
//   1. ColorManagement.enabled defaults true (r152). Material colours given as sRGB hex are
//      now gamma-decoded into a linear working space before lighting. Since this scene's
//      lights sum to well under 1.0, the decode darkens far more than the output encode
//      brightens back, so the net effect is a big loss.
//   2. WebGLRenderer.outputColorSpace replaced outputEncoding, defaulting to sRGB (r152).
//   3. PointLight.decay defaults 2 instead of 1 (r146) — inverse-square instead of linear
//      falloff. On the four marker glows (distance 1.2) that turned tight highlights into
//      blown-out halos, because within r < 1 the 1/r² term explodes.
//
// This scene's lights were hand-tuned by eye against the un-managed r128 pipeline, and the
// palette in CLAUDE.md is a signed-off design system, so the goal here is to reproduce that
// appearance rather than re-tune the design against new defaults. Both of these are supported
// opt-outs, not workarounds. The trade-off is deliberate and worth knowing: with colour
// management off, a hex value handed to a THREE material is no longer guaranteed to match the
// same hex in CSS. That is already how this file behaved on r128, and every colour in it was
// picked under those conditions, so switching now would change the look, not correct it.
// Turning these back on is a visual-design decision, and it means re-tuning all five lights.
THREE.ColorManagement.enabled = false;

// The fourth changed default, and the one with no opt-out at all: r155 deleted
// WebGLRenderer.useLegacyLights and made physically correct lighting the only mode (the property
// is not merely deprecated in 0.185.1 — it does not appear in the build). Light contribution now
// carries the 1/π normalisation the legacy path omitted, so every intensity in this file, all of
// which were tuned by eye under the legacy path, reads about π times too dim.
//
// π is not a guess here. Measuring the ovary viewer against the r128 baseline gave per-channel
// ratios of 2.74 / 2.89 / 2.93 — below π, and rising as the channel gets darker, which is what
// you expect when the *reference* is the clipped one: the bright r128 render saturated at 255 in
// places, so it understates the true ratio most in the channel closest to the ceiling.
// Multiplying by π and re-measuring is the check, and it is the check that follows below.
export const LEGACY_LIGHT_SCALE = Math.PI;

// Small helper every organ/cancer data module reads its region/site colors through, so those
// modules never hardcode a hex value that could drift from the design-system CSS variables.
export function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

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
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const center = bb.getCenter(new THREE.Vector3());
  const size = bb.getSize(new THREE.Vector3());
  // Floored the same defensive way organicDisplace floors a zero-length direction vector
  // (`|| 1`) — guards a flat/degenerate sub-mesh axis from dividing toward infinity; none of
  // the nine organs' real sub-meshes are actually this thin, but a shared helper shouldn't
  // assume that of every future caller.
  const halfX = Math.max(size.x/2, 1e-6), halfY = Math.max(size.y/2, 1e-6), halfZ = Math.max(size.z/2, 1e-6);
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count*3);
  for(let i=0;i<pos.count;i++){
    const nx=(pos.getX(i)-center.x)/halfX, ny=(pos.getY(i)-center.y)/halfY, nz=(pos.getZ(i)-center.z)/halfZ;
    const t = Math.sin(nx*freq+seed*1.7) * Math.cos(ny*(freq+1.2)+seed*2.3) * Math.sin(nz*(freq-1.4)+seed*3.1);
    const patch = Math.max(0, (t-0.05)/0.95);
    const m = 1 - patch*amplitude;
    colors[i*3]=m; colors[i*3+1]=m; colors[i*3+2]=m;
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
  // Pairs with ColorManagement.enabled = false at the top of this module: no decode going in,
  // so no encode coming out. Setting only one of the two would leave the pipeline lopsided.
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Intensities are written as their original hand-tuned values × LEGACY_LIGHT_SCALE so the
  // numbers a future reader recognises from the design pass stay legible in the source.
  //
  // opts.warmLighting is an organ-viewer-only opt-in (set by initOrganViewer in main.js,
  // never by body.js or the tumor-site viewer), added specifically so the real-tissue material
  // colors on the seven organs (see each js/organs/*.js buildXMesh — verified against real
  // gross-anatomy sources, not guessed, same discipline as every citation in this app) don't
  // get lit by the same cool-white key + teal rim that were originally tuned against the old,
  // paler procedural colors. This does NOT touch THREE.ColorManagement, outputColorSpace, or
  // LEGACY_LIGHT_SCALE itself — the parked color-management pipeline decision stays parked;
  // only the light *color* and the rim light's presence change, and only for organs.
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
  scene.add(new THREE.AmbientLight(warm ? 0xfff1e0 : 0xffffff, (warm ? 0.42 : 0.55) * LEGACY_LIGHT_SCALE));
  const key = new THREE.DirectionalLight(warm ? 0xffddb0 : 0xffffff, (warm ? 0.65 : 0.9) * LEGACY_LIGHT_SCALE);
  key.position.set(3, 4, 5);
  scene.add(key);
  if(!warm){
    // 4th arg is decay, explicit because its default flipped 1 → 2 in r146. This teal rim
    // light is a broad wash across the whole model, so inverse-square falloff would
    // extinguish it. Dropped entirely in warm mode — a cool teal accent is the exact thing
    // the warm-material treatment is moving away from, not something to warm-tint in place.
    const rim = new THREE.PointLight(0x35c9c1, 1.1 * LEGACY_LIGHT_SCALE, 20, 1);
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
    // Retry a framing request that couldn't be satisfied before layout existed.
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
    resize,
    project(vec3){
      const v = vec3.clone().project(camera);
      const w = container.clientWidth, h = container.clientHeight;
      return { x:(v.x+1)/2*w, y:(1-v.y)/2*h, z:v.z };
    }
  };
}
