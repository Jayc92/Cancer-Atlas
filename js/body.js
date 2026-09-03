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
    return new THREE.Vector3(0, targetY, 0);
  }
  const hit = hits[0];
  const worldNormal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  return hit.point.clone().addScaledVector(worldNormal, 0.005);
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
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, state.bodyViewer.camera);
      const visible = bodyMarkerRecords.filter(r=>r.sex===state.currentBodySex);
      const hits = raycaster.intersectObjects(visible.map(r=>r.mesh));
      if(hits.length){
        const hit = visible.find(r=>r.mesh===hits[0].object);
        selectOrganRef(hit.key);
      }
    }
  });

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
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, state.bodyViewer.camera);
    const visible = bodyMarkerRecords.filter(r=>r.sex===state.currentBodySex);
    const hits = raycaster.intersectObjects(visible.map(r=>r.mesh));
    const hit = hits.length ? visible.find(r=>r.mesh===hits[0].object) : null;
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
        const anchor = findBodySurfaceAnchor(group, bbox, point.heightFrac, point.angle);
        const mesh = new THREE.Mesh(
          // Scaled to this mesh's real-world-meter units (~1.7 tall) — 0.03 is the same
          // fraction of standing height the old 0.3 marker was, against the abandoned
          // MakeHuman bake's ~17-unit body.
          new THREE.SphereGeometry(0.03, 12, 12),
          new THREE.MeshBasicMaterial({ color: organ.active ? 0x35c9c1 : 0x8393ad })
        );
        mesh.position.copy(anchor);
        mesh.visible = sex === state.currentBodySex;
        group.add(mesh);

        const el = document.createElement('div');
        el.className = 'hotspot ' + (organ.active ? 'active-organ' : 'inactive-organ');
        el.dataset.organ = organ.key;
        el.innerHTML = '<div class="ring"></div><div class="dot"></div><div class="hotspot-label"></div>';
        el.querySelector('.hotspot-label').textContent = organ.label;
        el.hidden = sex !== state.currentBodySex;
        makeActivatable(el, ()=>selectOrganRef(organ.key), { label: organActionLabel(organ) });
        container.appendChild(el);

        bodyMarkerRecords.push({ mesh, el, key:organ.key, sex });
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

export function bodyTick(){
  if(state.screen==='body' && state.bodyViewer){
    state.bodyViewer.update();
    state.bodyViewer.renderer.render(state.bodyViewer.scene, state.bodyViewer.camera);
    if(state.bodyReady){
      bodyMarkerRecords.forEach(r=>{
        if(r.sex !== state.currentBodySex) return;
        const p = state.bodyViewer.project(r.mesh.position);
        r.el.style.left = p.x+'px';
        r.el.style.top = p.y+'px';
      });
    }
  }
  requestAnimationFrame(bodyTick);
}
