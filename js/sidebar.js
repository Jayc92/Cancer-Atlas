import { ORGANS } from './organs/index.js';
import { makeActivatable } from './accessibility.js';
import { organActionLabel } from './search.js';
import { state } from './state.js';

// Persistent organ-library sidebar — one row per ORGANS entry, in registry order (the same
// order search results already inherit). Thumbnails are static PNGs (assets/thumbs/<key>.png)
// rendered offline from each organ's real shipped mesh + material + warm lighting — see
// CLAUDE.md's "Organ library sidebar" entry for why static assets beat seven live WebGL
// contexts here. Navigation goes through the same selectOrgan callback search and the body
// hotspots use (register-once pattern, injected by main.js), so active organs route to the
// organ screen and inactive ones get the one shared "coming soon" toast — no second path.

const appEl = document.getElementById('app');
const toggleBtn = document.getElementById('sidebarToggle');
const innerEl = document.getElementById('sidebarInner');
const listEl = document.getElementById('sidebarList');
const MOBILE_QUERY = window.matchMedia('(max-width:640px)');

let notifyLayoutChange = null;

function isCollapsed(){ return appEl.classList.contains('sidebar-collapsed'); }

function applyCollapsed(collapsed){
  appEl.classList.toggle('sidebar-collapsed', collapsed);
  // The rail hides by transform (off-canvas), which leaves its rows focusable — inert takes
  // them out of the tab order and the accessibility tree, same pattern as #txPanel. The
  // toggle button sits outside #sidebarInner so it stays reachable in both states.
  innerEl.toggleAttribute('inert', collapsed);
  toggleBtn.setAttribute('aria-expanded', String(!collapsed));
  toggleBtn.setAttribute('aria-label', collapsed ? 'Expand organ library' : 'Collapse organ library');
  toggleBtn.textContent = collapsed ? '›' : '‹';
  if(notifyLayoutChange){
    // On desktop, opening/closing shifts every .screen's left edge, which changes every
    // viewer container's clientWidth — and there is no ResizeObserver anywhere, only a
    // window 'resize' listener (see viewer.js), so the viewers must be told directly.
    // Once immediately, once after the .28s left/transform transition settles at the
    // final width. (On mobile the drawer overlays instead, so both calls are harmless no-ops
    // width-wise.)
    notifyLayoutChange();
    setTimeout(notifyLayoutChange, 320);
  }
}

// Keeps the highlighted row in sync with what's actually being viewed — called from
// setScreen(), so it covers every navigation path (hotspot, search, breadcrumb, sidebar
// itself). Highlighted on the organ screen AND that organ's cancer screen (currentOrganKey
// persists through enterCancerScreen); nothing is highlighted on the body screen, where no
// organ is "current." aria-current carries the same state to assistive tech.
export function updateSidebarActive(){
  const activeKey = (state.screen === 'organ' || state.screen === 'cancer') ? state.currentOrganKey : null;
  listEl.querySelectorAll('.sb-row').forEach(row=>{
    const isCurrent = row.dataset.key === activeKey;
    row.classList.toggle('current', isCurrent);
    if(isCurrent) row.setAttribute('aria-current', 'true');
    else row.removeAttribute('aria-current');
  });
}

export function initSidebar(selectOrgan, onLayoutChange){
  notifyLayoutChange = onLayoutChange;
  listEl.innerHTML = ORGANS.map(o=>`
    <div class="sb-row ${o.active?'sb-active':''}" data-key="${o.key}">
      <img class="sb-thumb" src="assets/thumbs/${o.key}.png" alt="" aria-hidden="true" width="44" height="44">
      <div class="sb-meta"><div class="sb-name">${o.label}</div><div class="sb-sys">${o.system}</div></div>
      <div class="sb-tag">${o.active ? 'Explore' : 'Coming soon'}</div>
    </div>`).join('');
  listEl.querySelectorAll('.sb-row').forEach(row=>{
    const organ = ORGANS.find(o=>o.key===row.dataset.key);
    makeActivatable(row, ()=>{
      selectOrgan(row.dataset.key);
      // Mobile drawer overlays the screen it just navigated to, so close it after a
      // successful navigation. An inactive organ only toasts — leave the drawer open so
      // the user can pick another without reopening it.
      if(MOBILE_QUERY.matches && organ.active) applyCollapsed(true);
    }, {label: organActionLabel(organ)});
  });
  toggleBtn.addEventListener('click', ()=>applyCollapsed(!isCollapsed()));
  // Open by default on desktop (discovery is the point of a library); collapsed by default
  // on mobile, where the drawer overlays the viewers that already need the whole screen.
  applyCollapsed(MOBILE_QUERY.matches);
}
