import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { state, bodyMarkerRecords } from './state.js';
import { makeViewer } from './viewer.js';
import { ORGANS, ORGAN_MARKER_SPECS } from './organs/index.js';
import { makeActivatable } from './accessibility.js';
import { organActionLabel } from './search.js';

// ============================================================
// BODY 3D VIEWER (body screen) — baked male + female meshes (assets/*.glb)
// ============================================================
// The male/female bodies are static meshes, not procedural. **History, because it's not
// obvious from the code alone why this isn't the MakeHuman bake this project shipped with
// first:** that bake was abandoned after a real-source-asset defect, not a pipeline bug — a
// wireframe/connected-component check (same technique used below) found MakeHuman's own
// base.obj has a low-poly "cap" surface fusing the inner thighs into one skirt-like cone, plus
// an unrelated stray debug cube, both present even in the pristine, unmodified base mesh
// before any blend-shape math touched it. A CC-BY Sketchfab pair (DNC44's "Basic Human
// Male/Female") was the next candidate, but verifying it required an authenticated Sketchfab
// download and creating that account isn't something this pass does — that path is blocked,
// not disqualified, and could still be revisited by hand later.
//
// Current source: **Blender's "Human Base Meshes" bundle** — a free CC0 asset pack on
// blender.org's own Demo Files page (blender.org/download/demo-files/), credited to "Blender
// Studio and community contributions." Confirmed clean by the same rigor as the abandoned
// candidates: license quoted directly from a README text block *inside* the downloaded
// .blend file itself ("Human Base Meshes: Asset Bundle - Version 1.4 / All provided assets
// are public domain under the CC0 license") — note a *different*, stale text block elsewhere
// in the same file is literally named "LICENSE" and describes an unrelated asset ("Rain Rig",
// CC-BY) that isn't this bundle; the on-point statement is the one in the version-numbered
// README, not the one labeled LICENSE. Topology confirmed via Blender's headless Python API
// (`blender --background --python`, a real first-class interface — unlike MakeHuman, nothing
// hacky about it): `GEO-body_male_realistic` and `GEO-body_female_realistic` are each exactly
// one connected component (no stray geometry), genuinely distinct sculpts (mean per-vertex
// difference ~4.8cm, not zero), with a real measurable gap between the legs at every height
// band from ankle to mid-thigh and a correct merge into one torso only at the hip — no
// MakeHuman-style fusion. Each sex is its own static mesh (no macro-slider/blend-shape math
// to reproduce), a real simplification over the abandoned approach.
//
// The catch: the bundle's bodies carry a Multires modifier at level 3 (677K verts / 1.35M
// triangles each in the Blender file) — far too heavy for a browser GLB. `assets/*.glb` were
// exported at **Multires level 0** (the base cage: 10,582 verts / 21,160 triangles each,
// topology-identical to level 3 — checked at both levels before exporting, not assumed). If
// this ever needs re-exporting, force `modifier.levels = N` (and `sculpt_levels`/
// `render_levels` too) before `export_scene.gltf(..., export_apply=True)`, or the export
// silently regresses back to the 677K-vertex resolution. SECOND re-export gotcha, hit and
// fixed in the Multires-upgrade pass (2026-09-03): the bundle lays the bodies out in a row
// (object locations x = -2.264 male / -1.34 female, feet at z=0), and the shipped GLBs are
// BBOX-CENTERED TO THE WORLD ORIGIN — the offset lives in the exported node's translation,
// not the vertex data, so centering the local mesh alone is not enough. Subtract
// R_node^-1 @ world_bbox_center from the POSITION accessor (or clear the node translation
// AND center locally). Reproduction proof standard: a fresh L0 export after both gotchas
// matched the originally shipped GLBs to 0.00007mm mean per-vertex. Real-world scale now (meters, ~1.7
// tall) instead of MakeHuman's arbitrary ~17-unit body — `makeViewer` opts below are scaled
// accordingly; don't reuse the old radius/minRadius/maxRadius numbers.
//
// Blender is now a build-time tool this project depends on to *regenerate* these two files —
// installed via `brew install --cask blender`, used only via its headless CLI, no GUI
// involved. It is not a runtime dependency: the shipped app still just fetches two static
// GLBs same as before, nothing about page load changed.
const BODY_MATERIAL_COLOR = 0xd9b6a4; // one neutral tone for both — the GLBs carry no material of their own

// Cast a ray inward from well outside the mesh, at a given fraction of its own height and a
// given angle around the vertical axis, and return where it actually hits the surface (nudged
// outward a hair along the hit normal so the marker sphere doesn't clip into the mesh). `bbox`
// is passed in rather than recomputed per point — it's the same box for every hotspot on a
// given body, and getBoundingSphere/Box3 walking ~22k vertices per hotspot would add up.
function findBodySurfaceAnchor(group, bbox, heightFrac, angleDeg){
  const targetY = bbox.min.y + heightFrac * (bbox.max.y - bbox.min.y);
  const a = angleDeg * Math.PI / 180;
  const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
  // Padding and nudge distance are in the mesh's own units (meters, ~1.7 tall) — scaled down
  // from the abandoned MakeHuman bake's ~17-unit body, not reused as-is.
  const farR = Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z) * 3 + 0.5;
  const origin = new THREE.Vector3(dir.x * farR, targetY, dir.z * farR);
  const raycaster = new THREE.Raycaster(origin, dir.clone().negate(), 0, farR * 2);
  const meshes = [];
  group.traverse(o=>{ if(o.isMesh) meshes.push(o); });
  const hits = raycaster.intersectObjects(meshes, true);
  if(!hits.length){
    // Every spec above was checked against the real mesh before shipping, so this should
    // never fire — but a silent wrong-looking dot is worse than a loud, findable one.
    log_missedBodyRaycast(heightFrac, angleDeg);
    return { point: new THREE.Vector3(0, targetY, 0), normal: new THREE.Vector3(0, 0, 1) };
  }
  const hit = hits[0];
  const worldNormal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  // The normal travels with the anchor (2026-09-09): the picker's visibility gate reads it, and the
  // body groups never rotate (OrbitControls orbits the camera), so a world normal taken here stays valid.
  return { point: hit.point.clone().addScaledVector(worldNormal, 0.005), normal: worldNormal };
}
function log_missedBodyRaycast(heightFrac, angleDeg){
  console.warn('Body hotspot raycast missed the mesh entirely', { heightFrac, angleDeg });
}

function bodyCanvasLabel(){
  return 'Three-dimensional model of a human body, currently showing the ' + state.currentBodySex
    + ' form, with glowing points marking the organs listed after it — teal for organs you can '
    + 'explore, muted for ones not yet wired up. Drag to rotate, scroll to zoom.';
}

function hideBodyLoading(){
  const el = document.getElementById('bodyLoading');
  if(el) el.remove();
}
function showBodyLoadError(err){
  console.error('Failed to load body model', err);
  const el = document.getElementById('bodyLoading');
  if(el) el.textContent = 'Could not load the body model. Check your connection and reload.';
}

function applyBodyMaterial(group){
  const material = new THREE.MeshStandardMaterial({ color:BODY_MATERIAL_COLOR, roughness:0.62, metalness:0.03 });
  group.traverse(o=>{ if(o.isMesh) o.material = material; });
}

// Registered once at startup with the one callback this module needs from main.js — clicking a
// body marker calls selectOrgan, which also drives setScreen('organ')/renderOrganScreen, so it
// stays owned by main.js rather than duplicated here. Same pattern search.js uses.
let selectOrganRef = null;

export function initBody(selectOrgan){
  selectOrganRef = selectOrgan;
  const container = document.getElementById('bodyViewerWrap');
  // radius/minRadius/maxRadius are scaled to the GLBs' own units — real-world meters now
  // (~1.7 tall), not the abandoned MakeHuman bake's arbitrary ~17-unit body, so these are
  // ~10x smaller than they used to be. frameContents() below re-derives the real distance
  // from the actual mesh anyway, but a nominal opts.radius that starts in the right order of
  // magnitude keeps the initial placement (before framing) sane, and minRadius sets a real
  // "how close can you zoom in" floor scaled to this mesh, not the previous one.
  // The picker's depth pass renders layer 0 only; the marker spheres sit on BODY_MARKER_LAYER, which the
  // main camera must also see (layers are set below, after makeViewer returns).
  state.bodyViewer = makeViewer(container, {
    theta:0.5, phi:1.2, radius:2, minRadius:0.9, maxRadius:5, autoRotate:true,
    autoRotateRadPerFrame:0.0015,
    onClick:(e, cont)=>{
      if(!state.bodyReady) return;
      const rect = cont.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX-rect.left)/rect.width)*2-1,
        -((e.clientY-rect.top)/rect.height)*2+1
      );
      // Screen-space hit test at the 24px WCAG target, same law as main.js's organ markers
      // (see MARKER_PROJECTED_PX there): the body spheres projected ~23px at the default
      // framing but ~17px zoomed fully out — the pointer target dipped under the floor exactly
      // when markers are hardest to see. `mouse` kept for parity with the site viewer's handler.
      const cx = e.clientX-rect.left, cy = e.clientY-rect.top;
      // One picker for click and hover (see pickBodyMarker): depth gates visibility, nearest centre chooses.
      const hit = pickBodyMarker(cx, cy);
      if(hit) selectOrganRef(hit.key);
    }
  });
  state.bodyViewer.camera.layers.enable(BODY_MARKER_LAYER);

  const bodyCanvas = state.bodyViewer.renderer.domElement;
  bodyCanvas.setAttribute('role', 'img');
  bodyCanvas.setAttribute('aria-label', bodyCanvasLabel());

  // Hover reveal, since the DOM proxies are pointer-events:none and can never get a native
  // :hover — this is the mouse-side equivalent of the :focus-visible rule in the CSS. Wired up
  // front (not inside the load callback) since it's a no-op until bodyMarkerRecords is
  // populated anyway, and keeping all container listeners in one place avoids a "did this get
  // attached twice" question if initBodyViewer were ever called more than once.
  container.addEventListener('pointermove', e=>{
    if(!state.bodyReady) return;
    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX-rect.left)/rect.width)*2-1,
      -((e.clientY-rect.top)/rect.height)*2+1
    );
    const cx = e.clientX-rect.left, cy = e.clientY-rect.top;
    // The SAME picker as the click path, so hover always previews exactly the marker a click would select.
    const hit = pickBodyMarker(cx, cy);
    if(hit !== state.hoveredBodyMarker){
      if(state.hoveredBodyMarker) state.hoveredBodyMarker.el.classList.remove('hover');
      state.hoveredBodyMarker = hit;
      if(state.hoveredBodyMarker) state.hoveredBodyMarker.el.classList.add('hover');
    }
    container.style.cursor = hit ? 'pointer' : '';
  });
  container.addEventListener('pointerleave', ()=>{
    if(state.hoveredBodyMarker){ state.hoveredBodyMarker.el.classList.remove('hover'); state.hoveredBodyMarker = null; }
    container.style.cursor = '';
  });

  document.querySelectorAll('#bodySexToggle button').forEach(btn=>{
    btn.addEventListener('click', ()=>toggleBodySex(btn.dataset.sex));
  });

  const loader = new GLTFLoader();
  // The body GLBs ship meshopt-compressed (EXT_meshopt_compression, gltfpack -cc): the L2
  // Multires pair is 36.75MB raw but 4.03MB compressed — cheaper than even the uncompressed
  // L1 compromise (9.56MB), which is what made shipping full L2 the right call. A compressed
  // GLB with no decoder registered fails to LOAD (a broken body, not a degraded one), so this
  // registration is load-bearing. Decoder is WASM inside three's own examples tree — same CDN
  // the import map already trusts.
  loader.setMeshoptDecoder(MeshoptDecoder);
  const loadOne = (url)=>new Promise((resolve, reject)=>loader.load(url, (gltf)=>resolve(gltf.scene), undefined, reject));

  Promise.all([loadOne('assets/female_body.glb'), loadOne('assets/male_body.glb')])
    .then(([femaleScene, maleScene])=>{
      state.femaleBodyGroup = femaleScene;
      state.maleBodyGroup = maleScene;
      applyBodyMaterial(state.femaleBodyGroup);
      applyBodyMaterial(state.maleBodyGroup);
      state.bodyViewer.scene.add(state.femaleBodyGroup, state.maleBodyGroup);
      state.maleBodyGroup.visible = false;
      // Framed against BOTH bodies at once so toggling sex never has to move the camera.
      state.bodyViewer.frameContents([state.femaleBodyGroup, state.maleBodyGroup], 1.25);
      // Staged against BOTH bodies for the same reason the framing is: the plinth must not
      // resize or shift when the sex toggle flips, and the two bodies differ in width.
      state.bodyViewer.addGround([state.femaleBodyGroup, state.maleBodyGroup]);

      buildBodyMarkers();

      state.bodyReady = true;
      hideBodyLoading();
      document.querySelectorAll('#bodySexToggle button').forEach(b=>b.disabled = false);
    })
    .catch(showBodyLoadError);
}

function buildBodyMarkers(){
  state.femaleBodyGroup.updateMatrixWorld(true);
  state.maleBodyGroup.updateMatrixWorld(true);
  const femaleBbox = new THREE.Box3().setFromObject(state.femaleBodyGroup);
  const maleBbox = new THREE.Box3().setFromObject(state.maleBodyGroup);
  const container = document.getElementById('bodyViewerWrap');

  ORGANS.forEach(organ=>{
    const spec = ORGAN_MARKER_SPECS[organ.key];
    if(!spec) return;
    (organ.sexes || []).forEach(sex=>{
      const group = sex === 'female' ? state.femaleBodyGroup : state.maleBodyGroup;
      const bbox = sex === 'female' ? femaleBbox : maleBbox;
      // A point may carry its own optional `sexes` filter on top of the organ-level one —
      // added for Skin, whose marker sits at a DIFFERENT verified site per sex (trunk in men,
      // lower leg in women — CONCORD-3; see skin.js's markerSpec comment). Every other
      // organ's points omit the field and keep the original both-bodies behavior unchanged.
      spec.points.filter(point => !point.sexes || point.sexes.includes(sex)).forEach(point=>{
        const { point: anchor, normal } = findBodySurfaceAnchor(group, bbox, point.heightFrac, point.angle);
        const mesh = new THREE.Mesh(
          // Scaled to this mesh's real-world-meter units (~1.7 tall) — 0.03 is the same
          // fraction of standing height the old 0.3 marker was, against the abandoned
          // MakeHuman bake's ~17-unit body.
          new THREE.SphereGeometry(0.03, 12, 12),
          new THREE.MeshBasicMaterial({ color: organ.active ? 0x35c9c1 : 0x8393ad })
        );
        mesh.position.copy(anchor);
        mesh.visible = sex === state.currentBodySex;
        // IDENTITY FOR MEASUREMENT (2026-09-09): the placement check in regress.js reads which organ
        // and which spec point a sphere belongs to from here, never from where it projects. `site`
        // is the point's DECLARED target — 'limb' for the one marker that means to sit on a leg
        // (skin, female, CONCORD-3); everything else is asserted to sit on the trunk/head column.
        mesh.userData.marker = { organ: organ.key, sex, heightFrac: point.heightFrac, angle: point.angle, site: point.site || 'trunk' };
        mesh.layers.set(BODY_MARKER_LAYER);   // excluded from the picker's body-depth pass (see renderBodyDepthPass)
        group.add(mesh);

        const el = document.createElement('div');
        el.className = 'hotspot ' + (organ.active ? 'active-organ' : 'inactive-organ');
        el.dataset.organ = organ.key;
        el.innerHTML = '<div class="ring"></div><div class="dot"></div><div class="hotspot-label"></div>';
        el.querySelector('.hotspot-label').textContent = organ.label;
        el.hidden = sex !== state.currentBodySex;
        makeActivatable(el, ()=>selectOrganRef(organ.key), { label: organActionLabel(organ) });
        container.appendChild(el);

        bodyMarkerRecords.push({ mesh, el, key:organ.key, sex, normal });
      });
    });
  });
}

function toggleBodySex(sex){
  if(!state.bodyReady || sex === state.currentBodySex) return;
  state.currentBodySex = sex;
  state.femaleBodyGroup.visible = sex === 'female';
  state.maleBodyGroup.visible = sex === 'male';
  bodyMarkerRecords.forEach(r=>{
    const show = r.sex === state.currentBodySex;
    r.mesh.visible = show;
    r.el.hidden = !show;
  });
  if(state.hoveredBodyMarker && state.hoveredBodyMarker.sex !== state.currentBodySex){
    state.hoveredBodyMarker.el.classList.remove('hover');
    state.hoveredBodyMarker = null;
  }
  document.querySelectorAll('#bodySexToggle button').forEach(b=>{
    b.setAttribute('aria-pressed', String(b.dataset.sex === state.currentBodySex));
  });
  state.bodyViewer.renderer.domElement.setAttribute('aria-label', bodyCanvasLabel());
}

// Same two-scaling-laws fix as the organ markers (see main.js MARKER_PROJECTED_PX): the body
// spheres hold a constant projected diameter, and the pointer paths above use the 24px
// screen-space target (BODY_MARKER_HIT_RADIUS_PX) instead of a raycast — so the VISIBLE size is
// free to shrink; the accessibility floor is held by the hit test and the 24×24 DOM proxies, not
// by the sphere. 23px was a CONFLATION, not a constraint (user, 2026-09-09): it was kept because
// 'the spheres dipped under the floor when zoomed out', a problem the constant-projected-size
// law had already removed. SIZED AGAINST A MEASUREMENT, not a guess — pairwise projected
// separations of every visible marker at the default framing, both sexes (regress.js writes
// body_markers_<sex>.json): female 105 pairs, min 4.1px (Ovaries~Bladder), next 13.4px
// (the Ovaries pair), 14.1px (Pancreas~Stomach); male 120 pairs, min 4.0px (Prostate~Testis),
// 7.2px (Testis~Bladder), 10.0px (Prostate~Bladder), 11.7px (Pancreas~Stomach). The rule
// 'visible diameter below half the minimum separation' cannot be met by any legible dot (2px),
// and the pairs under ~12px are anatomically adjacent organs on one height of the front surface
// — the FLOOR, reported as anatomy rather than tuned away. 11px is the organ screen's value
// (one law product-wide), a 2.1× reduction, and at 11px the only overlapping pairs at the
// default framing are that pelvic set (female Ovaries~Bladder; male Prostate~Testis,
// Testis~Bladder, Prostate~Bladder); everything else separates, and the constant-screen-size
// law separates the rest as the user zooms in. Centres do not move, so the regression's
// minDist pairs must not move with this change — asserted by re-running it.
const BODY_MARKER_PROJECTED_PX = 11;
const BODY_MARKER_HIT_RADIUS_PX = 12;
const BODY_MARKER_BASE_R = 0.03;

// THE PICKER (repaired 2026-09-09, user authorization). Two jobs, kept apart: DEPTH IS A VISIBILITY GATE,
// NEAREST CENTRE IS THE CHOOSER. The previous rule — depth breaking ties among in-radius candidates — was
// measured wrong at the only input where correctness is unambiguous: clicking the centre of the prostate
// dot selected the bladder, and the left testis dot selected the bladder, because the bladder sat ~1.5%
// nearer the camera on the SAME surface; nearest-centre matched the clicked dot in 4/4, and under
// auto-rotation the depth order changes, so the same click resolved differently over time. Depth keeps the
// job it is right for — front-versus-back on a closed mesh, where a chest click must never select a
// marker on the spine — as a GATE: an occluded marker is never eligible (the old far-side click-through is
// gone on purpose). Among eligible candidates inside the 24px target, the nearest centre wins.
//
// THE GATE IS A DEPTH-BUFFER TEST, NOT A FACING TEST — measured before choosing (24 yaws × both bodies):
// no threshold on normal·toCamera separates visible from occluded markers (visible dots down to −0.93 on
// the skin's leg marker, occluded up to +0.80), and an exact camera→marker raycast costs ~24 ms on the
// 339K-triangle body — affordable for the regression's cross-check, not for hover. So the gate reads the
// BODY'S OWN DEPTH: when a pick has candidates, the body is rendered once with a depth-packing material
// into an offscreen target (the marker spheres live on their own layer and are excluded), and each
// candidate's centre is compared with the body depth at its pixel; a centre behind the body surface by
// more than BODY_PICK_DEPTH_TOL is occluded. Exact at pixel resolution; one low-cost depth pass per pick
// event that has candidates, nothing when the pointer is over empty canvas. regress.js ('body marker
// picking') asserts every eligible marker's own centre selects it and cross-checks this gate against the
// exact raycast at the default framing and across a yaw sweep, on both bodies.
const BODY_PICK_DEPTH_TOL = 0.01;   // metres of view depth; a marker centre sits 5 mm outside its own surface
const BODY_MARKER_LAYER = 1;
let pickRT = null;
const pickDepthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
const pickBuf = new Uint8Array(4), pickClear = new THREE.Color(), pickSize = new THREE.Vector2();
function perspectiveDepthToViewDistance(fragZ, near, far){ return -((near * far) / ((far - near) * fragZ - far)); }
function renderBodyDepthPass(){
  const v = state.bodyViewer, renderer = v.renderer, camera = v.camera;
  renderer.getDrawingBufferSize(pickSize);
  if(!pickRT || pickRT.width !== pickSize.x || pickRT.height !== pickSize.y){
    if(pickRT) pickRT.dispose();
    pickRT = new THREE.WebGLRenderTarget(pickSize.x, pickSize.y, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
  }
  const prevTarget = renderer.getRenderTarget(), prevOverride = v.scene.overrideMaterial, prevMask = camera.layers.mask;
  renderer.getClearColor(pickClear); const prevAlpha = renderer.getClearAlpha();
  camera.layers.set(0);                                  // the body (and staging) only — spheres are on BODY_MARKER_LAYER
  v.scene.overrideMaterial = pickDepthMat;
  renderer.setClearColor(0xffffff, 1);                   // an empty pixel unpacks to depth ≈ 1: background, never an occluder
  renderer.setRenderTarget(pickRT); renderer.clear(); renderer.render(v.scene, camera);
  renderer.setRenderTarget(prevTarget); renderer.setClearColor(pickClear, prevAlpha);
  v.scene.overrideMaterial = prevOverride; camera.layers.mask = prevMask;
  return pickSize;
}
function bodyMarkerOccluded(r, size){
  const v = state.bodyViewer, camera = v.camera;
  const ndc = r.mesh.position.clone().project(camera);
  const px = Math.floor((ndc.x + 1) / 2 * size.x), py = Math.floor((ndc.y + 1) / 2 * size.y);   // GL origin: bottom-left
  if(px < 0 || py < 0 || px >= size.x || py >= size.y) return true;                              // off-screen: not pickable
  v.renderer.readRenderTargetPixels(pickRT, px, py, 1, 1, pickBuf);
  // three 0.185's RGBADepthPacking, unpacked: (255/256) · (r + g/256 + b/256² + a/256³) with each byte /255 — the
  // MOST SIGNIFICANT BYTE IS RED. Measured, not recalled: the first draft unpacked alpha as the MSB (the older
  // layout) and every body depth came out near zero, so every marker read as occluded; the raw bytes at a
  // visible marker's pixel ([255, 85, 232, 0] for a depth of 0.9974) settled the order, and the corrected
  // unpack reproduces the marker's own projected depth to five decimals. If three is ever re-pinned, re-measure.
  const bodyFrag = (255 / 256) * ((pickBuf[0] / 255) + (pickBuf[1] / 255) / 256 + (pickBuf[2] / 255) / 65536 + (pickBuf[3] / 255) / 16777216);
  if(bodyFrag >= 0.9999) return false;                                                            // background at this pixel
  const bodyDist = perspectiveDepthToViewDistance(bodyFrag, camera.near, camera.far);
  const markerDist = perspectiveDepthToViewDistance(ndc.z * 0.5 + 0.5, camera.near, camera.far);
  return bodyDist < markerDist - BODY_PICK_DEPTH_TOL;
}
export function pickBodyMarker(cx, cy){
  const cands = [];
  bodyMarkerRecords.forEach(r=>{
    if(r.sex !== state.currentBodySex) return;
    const pt = state.bodyViewer.project(r.mesh.position);
    const d = Math.hypot(pt.x-cx, pt.y-cy);
    if(d <= BODY_MARKER_HIT_RADIUS_PX) cands.push({ r, d });
  });
  if(!cands.length) return null;
  const size = renderBodyDepthPass();
  cands.sort((a,b)=>a.d-b.d);                            // CHOOSER: nearest centre …
  for(const c of cands){ if(!bodyMarkerOccluded(c.r, size)) return c.r; }   // … among those the GATE lets through
  return null;
}
// Test-facing view of the current body's markers THROUGH the module's own gate (identity, not a replica):
// regress.js asserts against this and cross-checks the gate with an exact occlusion raycast.
export function bodyMarkerEligibility(){
  const size = renderBodyDepthPass();
  return bodyMarkerRecords.filter(r=>r.sex === state.currentBodySex).map(r=>{
    const pt = state.bodyViewer.project(r.mesh.position), p = r.mesh.position;
    return { key: r.key, x: pt.x, y: pt.y, px: p.x, py: p.y, pz: p.z, eligible: !bodyMarkerOccluded(r, size) };
  });
}

export function bodyTick(){
  if(state.screen==='body' && state.bodyViewer){
    state.bodyViewer.update();
    state.bodyViewer.renderer.render(state.bodyViewer.scene, state.bodyViewer.camera);
    if(state.bodyReady){
      const bCam = state.bodyViewer.camera;
      const bH = state.bodyViewer.renderer.domElement.clientHeight || 1;
      const bTan = Math.tan(bCam.fov * Math.PI / 360);
      bodyMarkerRecords.forEach(r=>{
        if(r.sex !== state.currentBodySex) return;
        const p = state.bodyViewer.project(r.mesh.position);
        r.el.style.left = p.x+'px';
        r.el.style.top = p.y+'px';
        const d = bCam.position.distanceTo(r.mesh.position);
        r.mesh.scale.setScalar((BODY_MARKER_PROJECTED_PX / bH) * d * bTan / BODY_MARKER_BASE_R);
      });
    }
  }
  requestAnimationFrame(bodyTick);
}
