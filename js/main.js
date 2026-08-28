// Namespace import rather than named imports: every reference below is already written as
// THREE.Foo, and a namespace binding keeps all those call sites correct without a rename pass.
// It also keeps the tree-shaking question honest — there is no bundler here, so naming
// individual exports would suggest a size benefit that cannot actually be realised.
import * as THREE from 'three';

import { state, organMarkers, siteBlobs, setSiteBlobs, siteLabelEls, setSiteLabelEls } from './state.js';
import { makeViewer, organicSpiculate, applyMottleVertexColors, LEGACY_LIGHT_SCALE } from './viewer.js';
import { ORGANS, CANCERS, ORGAN_DETAILS, CANCER_DETAILS } from './organs/index.js';
import { makeActivatable, landFocus } from './accessibility.js';
import { renderCrumbs, initBreadcrumb } from './breadcrumb.js';
import { txRenderCellLayer, txClosePanel } from './panel.js';
import { initSearch } from './search.js';
import { initBody, bodyTick } from './body.js';

// ============================================================
// GLOBAL NAV STATE
// ============================================================
const crumbsEl = document.getElementById('crumbs');
const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toastEl.classList.remove('show'), 2200);
}

function setScreen(name){
  state.screen = name;
  const activeScreen = document.getElementById('screen'+name.charAt(0).toUpperCase()+name.slice(1));
  document.querySelectorAll('.screen').forEach(s=>{
    const isActive = s === activeScreen;
    s.classList.toggle('active', isActive);
    // Inactive screens stay in the layout (opacity:0, not display:none) so every three.js
    // container keeps a real clientWidth/clientHeight for resize(). The cost of staying in
    // the layout is that the screen also stays in the tab order and the accessibility tree,
    // so `inert` is what actually takes it out of both without disturbing layout.
    s.toggleAttribute('inert', !isActive);
  });
  if(name==='body' && state.bodyViewer) state.bodyViewer.resize();
  if(name==='organ' && state.organViewer) state.organViewer.resize();
  if(name==='cancer' && state.siteViewer) state.siteViewer.resize();
  renderCrumbs();
  landFocus(activeScreen);
}

// The 3D viewer itself (mesh construction, markers, sex toggle) is built in the "BODY 3D
// VIEWER" section below, alongside the ovary and tumor-site viewers it shares makeViewer
// with — but selectOrgan/glowHotspots/search are wired here because they're referenced by
// both the body markers and the search results list, and search doesn't depend on the 3D
// viewer existing at all (it calls selectOrgan directly, bypassing hotspots entirely).
function glowHotspots(organKey){
  document.querySelectorAll('.hotspot[data-organ="'+organKey+'"]').forEach(el=>{
    el.classList.add('glow');
    setTimeout(()=>el.classList.remove('glow'), 2000);
  });
}

function selectOrgan(key){
  const organ = ORGANS.find(o=>o.key===key);
  if(!organ) return;
  if(organ.active){
    renderOrganScreen(key);
    setScreen('organ');
  } else {
    showToast('Full atlas coming soon for ' + organ.label);
    glowHotspots(key);
  }
}

// ============================================================
// SCREEN 2 — ORGAN (data-driven; see ORGAN_DETAILS below the shared 3D helpers)
// ============================================================
const cancerListEl = document.getElementById('cancerList');

// Rebuilds the cancer list for whichever organ is showing. Was a one-time render keyed to the
// (until now) only organ; now it filters the shared CANCERS list by organKey and re-runs every
// time renderOrganScreen swaps organs, same reasoning renderSearch already applies per keystroke.
function renderCancerList(organKey){
  const list = CANCERS.filter(c=>c.organKey===organKey);
  cancerListEl.innerHTML = list.map(c=>`
    <div class="cancer-row ${c.active?'enabled':''}" data-id="${c.id}">
      <div class="cr-left">
        <div class="cr-name">${c.name}</div>
        <div class="cr-share">${c.share}</div>
      </div>
      <div class="cr-cta ${c.active?'':'disabled'}">${c.active ? 'Explore this cancer →' : 'Profile coming soon'}</div>
    </div>`).join('');
  cancerListEl.querySelectorAll('.cancer-row').forEach(row=>{
    const c = list.find(x=>x.id===row.dataset.id);
    makeActivatable(row, ()=>{
      if(c && c.active){ enterCancerScreen(c.id); }
      else { showToast('Profile coming soon for ' + c.name); }
    }, {
      // Every row responds to activation; only the active one navigates. The difference is
      // currently carried by the CTA's colour and the teal border, so state it in the name too.
      label: c ? c.name + ', ' + c.share + (c.active ? ' — explore this cancer' : ' — profile coming soon') : row.dataset.id
    });
  });
}

// Repaints every static bit of the organ screen (eyebrow/h1/sub/facts/desc/cancer list) from
// ORGAN_DETAILS, then (re)builds its 3D viewer. Called from selectOrgan before setScreen('organ')
// — nothing here is organ-specific markup any more, so a second organ is a data entry, not a
// second screen.
function renderOrganScreen(organKey){
  state.currentOrganKey = organKey;
  const detail = ORGAN_DETAILS[organKey];
  const wrap = document.getElementById('organWrap');
  wrap.querySelector('.eyebrow').textContent = detail.eyebrow;
  wrap.querySelector('h1').textContent = detail.title;
  wrap.querySelector('.sub').textContent = detail.sub;
  document.getElementById('factsGrid').innerHTML = detail.facts.map(f=>
    `<div class="fact"><div class="flabel">${f.label}</div><div class="fval">${f.val}</div></div>`
  ).join('');
  document.getElementById('organDesc').textContent = detail.desc;
  document.getElementById('sectionTitle').textContent = 'Cancers of the ' + detail.title.toLowerCase();
  renderCancerList(organKey);
  // Reset the investigate-point card to its placeholder text — otherwise switching from Ovary
  // to Breast would leave "Cortex" showing under a model that has no such structure.
  document.getElementById('oiTitle').textContent = 'Investigate';
  const oiText = document.getElementById('oiText');
  oiText.textContent = 'Click a glowing point on the model to learn what that structure is and does.';
  oiText.classList.add('placeholder');
  document.getElementById('screenOrgan').setAttribute('aria-label', detail.title + ' — cancer types');
  initOrganViewer(organKey);
}

// ============================================================
// ORGAN 3D VIEWER (organ screen) — data-driven; see ORGAN_DETAILS
// ============================================================
// Disposes the previous organ's canvas/markers so switching from Ovary to Breast (or back)
// doesn't leave a stale WebGL context or orphaned DOM proxies behind — same reasoning as
// disposeSiteViewer below, for the same reason: only one organ is ever shown at a time.
function disposeOrganViewer(){
  if(!state.organViewer) return;
  state.organViewer.renderer.dispose();
  state.organViewer.renderer.domElement.remove();
  organMarkers.forEach(m=>m.el.remove());
  state.organViewer = null;
  organMarkers.length = 0;
  const loadingEl = document.getElementById('organLoading');
  if(loadingEl){ loadingEl.hidden = false; loadingEl.textContent = 'Loading 3D model…'; }
}

function initOrganViewer(organKey){
  if(organKey === state.organViewer?.organKey) return; // already built for this organ
  disposeOrganViewer();
  const detail = ORGAN_DETAILS[organKey];
  const container = document.getElementById('organViewerWrap');
  state.organViewer = makeViewer(container, {
    ...detail.viewer, autoRotate:true, warmLighting:true,
    onClick:(e, cont)=>{
      const rect = cont.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX-rect.left)/rect.width)*2-1,
        -((e.clientY-rect.top)/rect.height)*2+1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, state.organViewer.camera);
      const hits = raycaster.intersectObjects(organMarkers.map(m=>m.mesh));
      if(hits.length){
        const hit = organMarkers.find(m=>m.mesh===hits[0].object);
        showOrganInfo(hit.data);
      }
    }
  });
  const thisViewer = state.organViewer;
  thisViewer.organKey = organKey;

  // Describe the canvas rather than the container (see the markup comment on #organViewerWrap).
  // Structure names are deliberately left out of this label now that each one is a real button
  // in the same subtree — repeating them here would make a screen reader read the list twice,
  // once as prose and once as controls.
  const canvas = thisViewer.renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', detail.viewerAria);

  // Two mesh sources coexist here: Ovary/Breast's buildMesh() is procedural and synchronous
  // (returns a THREE.Object3D directly); the five real-scan organs (Lungs/Kidneys/Liver/Brain/
  // Prostate) load a baked GLB via GLTFLoader and return a Promise instead — same duality as
  // body.js's static GLBs vs nothing-to-compare-to-yet. Promise.resolve() wraps either case
  // into one path so this function doesn't need two copies of the hotspot-building logic below.
  // #organLoading only needs to appear for the real async case, but showing/hiding it around a
  // Promise that resolves same-tick is harmless.
  const loadingEl = document.getElementById('organLoading');
  if(loadingEl) loadingEl.hidden = false;

  Promise.resolve(detail.buildMesh())
    .then(mesh=>{
      // The user may have navigated to a different organ (or back to this one, creating a new
      // viewer instance) while this GLB was still in flight. Comparing the captured viewer
      // reference rather than organKey catches both cases — organKey alone would miss a
      // stale load racing a fresh one for the same organ.
      if(state.organViewer !== thisViewer) return;
      if(loadingEl) loadingEl.hidden = true;
      thisViewer.scene.add(mesh);

      // Real-world-meter GLBs (tenths of a meter) sit at a wildly different scale than the
      // procedural organs' arbitrary ~1-2 unit geometry, so detail.viewer's radius/minRadius/
      // maxRadius (tuned for the latter) can't be reused as-is. Rather than hand-picking a new
      // radius per organ, frame the camera to whatever the loaded mesh's own bounding sphere
      // turns out to be — same call body.js makes against the two body GLBs, for the same
      // reason. Hotspot markers are positioned below, after framing, so their on-screen size
      // relative to the model is set by the same call that sized the model itself.
      const isRealMesh = detail.hotspots.some(h=>h.pos);
      if(isRealMesh) thisViewer.frameContents([mesh], 1.3);
      // Marker sphere size and glow-light reach are tuned below (0.06 unit radius, 1.2 unit
      // falloff distance) for the procedural organs' arbitrary ~1-2 unit geometry. Real-mesh
      // organs are real-world meters (a prostate model is ~0.05m across in total), so those
      // fixed numbers would either swallow the whole model or barely register. Scale both to
      // the loaded mesh's own bounding-sphere radius instead — same fix frameContents() above
      // applies to the camera, applied here to the markers.
      const meshBoundingRadius = isRealMesh
        ? new THREE.Box3().setFromObject(mesh).getBoundingSphere(new THREE.Sphere()).radius
        : 1;
      const markerRadius = isRealMesh ? meshBoundingRadius * 0.045 : 0.06;
      const glowDistance = isRealMesh ? meshBoundingRadius * 2.4 : 1.2;

      detail.hotspots.forEach(h=>{
        let pos;
        if(h.pos){
          // Real-mesh organs: a literal anchor point (meters, local mesh space) found by
          // raycasting against the actual imported GLB surface — not the ellipsoid-shaped
          // dir*hotspotScale approximation the procedural organs below still use, which only
          // ever worked because those organs' own geometry is a scaled ellipsoid to begin with.
          pos = new THREE.Vector3(h.pos[0], h.pos[1], h.pos[2]);
        } else {
          const d = new THREE.Vector3(h.dir[0], h.dir[1], h.dir[2]).normalize();
          pos = new THREE.Vector3(d.x*detail.hotspotScale.x*1.04, d.y*detail.hotspotScale.y*1.04, d.z*detail.hotspotScale.z*1.04);
        }
        const mMesh = new THREE.Mesh(
          new THREE.SphereGeometry(markerRadius, 16, 16),
          new THREE.MeshBasicMaterial({ color:0x35c9c1 })
        );
        mMesh.position.copy(pos);
        // decay explicitly 1 (r146 changed the default to 2). This is the light the change hit
        // hardest: at distance 1.2, inverse-square falloff blows the near field out into a halo
        // that swallows the marker instead of ringing it.
        const glow = new THREE.PointLight(0x35c9c1, 0.5 * LEGACY_LIGHT_SCALE, glowDistance, 1);
        glow.position.copy(mMesh.position);
        thisViewer.scene.add(mMesh, glow);

        // The DOM half of the marker. Same arrangement as the tumor-site labels: a real element per
        // 3D point, repositioned each frame from the camera projection, carrying the button semantics
        // the mesh cannot. Activation goes through makeActivatable to showOrganInfo — the identical
        // function the raycast click path calls — so there is one code path and no risk of the two
        // drifting apart.
        const point = document.createElement('div');
        point.className = 'organ-point';
        const name = document.createElement('span');
        name.className = 'opt-name';
        name.textContent = h.label;
        // aria-hidden: the accessible name below already says this word, and without it a screen
        // reader announces the structure twice ("Cortex, Cortex — investigate…").
        name.setAttribute('aria-hidden', 'true');
        point.appendChild(name);
        makeActivatable(point, ()=>showOrganInfo(h), {
          label: h.label + ' — investigate this structure'
        });
        container.appendChild(point);

        organMarkers.push({ mesh:mMesh, data:h, el:point });
      });
    })
    .catch(err=>{
      if(state.organViewer !== thisViewer) return;
      console.error('Failed to load organ model', organKey, err);
      if(loadingEl) loadingEl.textContent = 'Could not load the 3D model. Check your connection and reload.';
    });
}

function showOrganInfo(h){
  document.getElementById('oiTitle').textContent = h.label;
  const t = document.getElementById('oiText');
  t.textContent = h.text;
  t.classList.remove('placeholder');
}

function organTick(){
  if(state.screen==='organ' && state.organViewer){
    state.organViewer.update();
    state.organViewer.renderer.render(state.organViewer.scene, state.organViewer.camera);
    // Keep each keyboard proxy sitting exactly on top of its glowing mesh. Same projection call
    // siteTick uses for the site labels, so there is one piece of camera-to-screen math in the
    // file rather than two.
    //
    // No occlusion test here on purpose. A point on the far side of the organ is hidden by the
    // mesh's depth buffer but its proxy still projects onto the silhouette — and the existing
    // mouse path has always behaved the same way, because the raycast only tests the marker
    // meshes and never the organ body. Culling back-facing points for the keyboard would make it
    // stricter than the pointer, which is the wrong direction for this fix. The model auto-rotates,
    // so every point comes round to the front within a few seconds regardless.
    organMarkers.forEach(m=>{
      const p = state.organViewer.project(m.mesh.position);
      m.el.style.left = p.x+'px';
      m.el.style.top = p.y+'px';
    });
  }
  requestAnimationFrame(organTick);
}

// ============================================================
// SCREEN 3 — CANCER / TUMOR EXPLORER (data-driven; see CANCER_DETAILS below)
// ============================================================
// ============================================================
// TUMOR SITE-MAP 3D VIEWER (cancer screen, level 1)
// ============================================================
const txSiteViewerEl = document.getElementById('txSiteViewer');
const txCellLayer = document.getElementById('txCellLayer');
const txCaptionText = document.getElementById('txCaptionText');

// Tears down the previous cancer's canvas/markers/labels so a second cancer type doesn't leave
// stale WebGL resources or DOM proxies behind. Cheap to call unconditionally on every
// enterCancerScreen — initSiteViewer only actually rebuilds when cancerId is new (see below).
function disposeSiteViewer(){
  if(!state.siteViewer) return;
  state.siteViewer.renderer.dispose();
  state.siteViewer.renderer.domElement.remove();
  siteLabelEls.forEach(el=>el.remove());
  state.siteViewer = null;
  setSiteBlobs([]);
  setSiteLabelEls([]);
}

function initSiteViewer(cancerId){
  if(cancerId === state.currentCancerId && state.siteViewer) return; // already built for this cancer
  disposeSiteViewer();
  state.currentCancerId = cancerId;
  const detail = CANCER_DETAILS[cancerId];
  const container = txSiteViewerEl;
  state.siteViewer = makeViewer(container, {
    theta:0.6, phi:1.15, radius:4.6, minRadius:3, maxRadius:8, autoRotate:true,
    // Was siteTick()'s spin(0.0022) — the site map spins slightly faster than the ovary.
    autoRotateRadPerFrame:0.0022,
    onClick:(e, cont)=>{
      const rect = cont.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX-rect.left)/rect.width)*2-1,
        -((e.clientY-rect.top)/rect.height)*2+1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, state.siteViewer.camera);
      const hits = raycaster.intersectObjects(siteBlobs.map(b=>b.mesh));
      if(hits.length){
        const blob = siteBlobs.find(b=>b.mesh===hits[0].object);
        txEnterRegion(blob.regionIdx);
      }
    }
  });

  // Describe the canvas itself rather than the container (see the markup comment on #txSiteViewer:
  // the container has to stay role="group" so the site labels survive). No need to list the four
  // site names here — they are reachable as real buttons, and repeating them would make a screen
  // reader read the same four words twice. What is genuinely unavailable otherwise is the picture:
  // that the clusters are positioned, not decorative.
  const siteCanvas = state.siteViewer.renderer.domElement;
  siteCanvas.setAttribute('role', 'img');
  siteCanvas.setAttribute('aria-label',
    'Three-dimensional rendering of one ' + detail.title.toLowerCase() + ' tumor as four coloured '
    + 'cell clusters, spaced to match the real site pattern. Drag to rotate, mouse or trackpad only.');

  document.getElementById('screenCancer').setAttribute('aria-label', detail.screenLabel);
  document.getElementById('txLegendTitle').textContent = detail.legendTitle;
  document.getElementById('txLegendRows').innerHTML = detail.regions.map(region=>
    `<div class="lg-row"><span class="lg-dot" style="background:${region.color};color:${region.color}"></span>${region.name}</div>`
  ).join('');

  // MESH-DETAIL PASS: detail 3→5 (960→2160 vertices per blob — every one of the seven cancers'
  // site/region/focus meshes shares this one call site, so the fix is uniform across all of
  // them at once). The `sharpness:11` spike falloff in organicSpiculate is the real reason this
  // needed more than organ meshes did: a narrow, angularly-confined spike only has a handful of
  // vertices near its tip at low subdivision, and no normal recompute fixes an undersampled
  // spike tip — confirmed by screenshot on GBM's four-blob cluster (the spikiest, most
  // visually complex site map) before and after. Benchmarked the same way as the organ
  // meshes above — detail 3 through 9 all rendered under 0.08ms/frame in the synthetic
  // render()-timing harness, so detail 5 has wide headroom left, not a maxed-out setting.
  const newSiteBlobs = [];
  const newSiteLabelEls = [];
  detail.regions.forEach((region, idx)=>{
    const geo = new THREE.IcosahedronGeometry(0.6, 5);
    organicSpiculate(geo, {
      amplitude:0.14, freq:4.2, seed:idx*2.1 + 0.4,
      spikeCount:7, spikeLength:0.42, sharpness:11,
    });
    applyMottleVertexColors(geo, region.color, idx*2.1 + 0.4);
    const mat = new THREE.MeshStandardMaterial({
      vertexColors:true,
      roughness:0.55, metalness:0.05,
      // Pure, unmottled region color — the glow is the one thing that has to stay instantly
      // identifiable, so it doesn't carry the vertex-color mottle the surface diffuse does.
      emissive: new THREE.Color(region.color), emissiveIntensity:0.18
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(region.pos3d.x, region.pos3d.y, region.pos3d.z);
    state.siteViewer.scene.add(mesh);
    newSiteBlobs.push({ mesh, regionIdx:idx });

    const label = document.createElement('div');
    label.className = 'site-label';
    label.textContent = region.name;
    label.style.color = region.color;
    label.style.borderColor = region.color;
    // A site's clickable target is its WebGL blob, reached by raycasting — nothing a keyboard
    // or a screen reader can address. This projected label is the only real DOM node per
    // site, so it carries the button semantics. It keeps pointer-events:none, so the mouse
    // path stays exactly as it was (still the raycast) and there is no double activation.
    makeActivatable(label, ()=>txEnterRegion(idx), {label: region.name + ' ' + (detail.regionWord || 'site') + ' — explore its cells'});
    container.appendChild(label);
    newSiteLabelEls.push(label);
  });
  setSiteBlobs(newSiteBlobs);
  setSiteLabelEls(newSiteLabelEls);

  // Frame all four sites now that they exist. The site blobs spread further from the
  // origin than the ovary mesh does, so a hardcoded radius clipped the topmost blob
  // (Omentum) off the viewport at 16:9.
  state.siteViewer.frameContents(siteBlobs.map(b=>b.mesh));
}

function siteTick(){
  if(state.screen==='cancer' && state.txLevel===1 && state.siteViewer){
    // Self-heal if the initial fit was deferred because the container had no layout yet.
    if(!state.siteViewer.framed) state.siteViewer.resize();
    // One unconditional call replaces `if(autoRotate && !dragging) spin(0.0022)`. Both guards
    // now live inside OrbitControls: it applies autoRotate only when its own autoRotate flag is
    // set AND its state is NONE, so a drag in progress suppresses the idle spin for free.
    state.siteViewer.update();
    state.siteViewer.renderer.render(state.siteViewer.scene, state.siteViewer.camera);
    siteBlobs.forEach((b,i)=>{
      const p = state.siteViewer.project(b.mesh.position);
      siteLabelEls[i].style.left = p.x+'px';
      siteLabelEls[i].style.top = p.y+'px';
      siteLabelEls[i].style.opacity = p.z < 1 ? '1' : '0';
    });
  }
  requestAnimationFrame(siteTick);
}

function txEnterRegion(regionIdx){
  state.txCurrentRegion = regionIdx;
  state.txLevel = 2;
  if(state.siteViewer) state.siteViewer.autoRotate = false;
  txSiteViewerEl.classList.add('hidden');
  txCaptionText.textContent = '';
  txRenderCellLayer(regionIdx);
  txCellLayer.classList.add('active');
  // Both layers are hidden by opacity, so `inert` has to follow `.active`/`.hidden` for the
  // tab order to match what is on screen. Same reasoning as setScreen().
  txSiteViewerEl.toggleAttribute('inert', true);
  txCellLayer.toggleAttribute('inert', false);
  renderCrumbs();
  // Entering a site inerts the viewer that holds the site label just activated, and this path
  // goes through neither setScreen nor txGoLevel, so it needs its own landing point.
  landFocus(document.getElementById('screenCancer'));
}

function txGoLevel(lv){
  if(lv===1){
    txClosePanel(false);
    state.txLevel = 1;
    state.txCurrentRegion = null; state.txCurrentCell = null;
    txCellLayer.classList.remove('active');
    txSiteViewerEl.classList.remove('hidden');
    txCaptionText.textContent = '';
    txCellLayer.toggleAttribute('inert', true);
    txSiteViewerEl.toggleAttribute('inert', false);
    if(state.siteViewer){ setTimeout(()=>{ state.siteViewer.autoRotate = true; }, 200); }
    // Stepping back to the site map inerts the cell layer, so the cell that focus would
    // otherwise return to is gone. Land on the screen. Level 2 needs no equivalent: the cell
    // dots are still live there, and txClosePanel returns focus to the one that was opened.
    landFocus(document.getElementById('screenCancer'));
  } else if(lv===2){
    txClosePanel(false);
    state.txLevel = 2;
  }
  renderCrumbs();
}

function enterCancerScreen(cancerId){
  // initSiteViewer sets currentCancerId — must run before setScreen('cancer'), because
  // setScreen calls renderCrumbs(), which reads CANCER_DETAILS[currentCancerId] to label the
  // breadcrumb. Doing this in the other order looked fine on repeat visits (currentCancerId
  // was already set from last time) and only broke on the very first visit to a given cancer.
  initSiteViewer(cancerId);
  setScreen('cancer');
  state.siteViewer.resize();
  txGoLevel(1);
}

// ============================================================
initBreadcrumb({ setScreen, txGoLevel });
initSearch(selectOrgan);
initBody(selectOrgan);
requestAnimationFrame(bodyTick);
requestAnimationFrame(organTick);
requestAnimationFrame(siteTick);
renderCrumbs();
