import { state, regionCellCache } from './state.js';
import { CANCER_DETAILS } from './organs/index.js';
import { cssVar } from './viewer.js';
import { makeActivatable, landFocus } from './accessibility.js';
import { makeSeededRandom, seedFromKey, shuffleWithRandom } from './rng.js';
import { renderCrumbs } from './breadcrumb.js';

// Ring drawn around cells that carry private mutations. The previous
// rgba(255,255,255,.16) was swallowed by the dot's own coloured glow. Coral is the
// driver-badge colour, so the ring reads as "extra mutations here" rather than as
// decoration. The dark inner band separates ring from dot on the Ovary site, whose
// cells are coral themselves and would otherwise just look like bigger dots.
const PRIVATE_RING_SHADOW = `0 0 0 2px ${cssVar('--bg')}, 0 0 0 4px ${cssVar('--driver')}`;

const txCellLayer = document.getElementById('txCellLayer');
const txCaptionText = document.getElementById('txCaptionText');
const txPanel = document.getElementById('txPanel');
const txPanelId = document.getElementById('txPanelId');
const txPanelSub = document.getElementById('txPanelSub');
const txPanelBody = document.getElementById('txPanelBody');
const txStageEl = document.getElementById('txStage');
const appEl = document.getElementById('app');

export function buildRegionCells(regionIdx){
  const region = CANCER_DETAILS[state.currentCancerId].regions[regionIdx];
  if(regionCellCache[region.id]) return regionCellCache[region.id];
  const count = 22;
  // One stream for layout: positions are generated sequentially by rejection sampling,
  // so they can't be keyed per index the way the per-cell mutation draws are.
  const layoutRandom = makeSeededRandom(seedFromKey(region.id));
  const pts = [];
  let attempts = 0;
  while(pts.length < count && attempts < 4000){
    attempts++;
    const ang = layoutRandom()*Math.PI*2;
    const rad = Math.sqrt(layoutRandom()) * 0.42;
    const x = 0.5 + Math.cos(ang)*rad;
    const y = 0.5 + Math.sin(ang)*rad;
    let ok = true;
    for(const p of pts){ if(Math.hypot(p.x-x,p.y-y) < 0.085){ ok=false; break; } }
    if(ok) pts.push({x,y});
  }
  const cells = pts.map((p,idx)=>{
    const cellId = region.id+'-'+(idx+1);
    // Keyed by the cell's own id, so a cell's mutation profile depends only on which
    // cell it is — not on how many cells happened to be generated before it.
    const cellRandom = makeSeededRandom(seedFromKey(cellId));
    const hasPrivate = cellRandom() < 0.42;
    const priv = [];
    if(hasPrivate){
      const n = cellRandom()<0.3 ? 2 : 1;
      const shuffled = shuffleWithRandom(CANCER_DETAILS[state.currentCancerId].privatePool, cellRandom);
      for(let k=0;k<n;k++) priv.push(shuffled[k]);
    }
    return { id: cellId, x:p.x, y:p.y, private:priv };
  });
  regionCellCache[region.id] = cells;
  return cells;
}

export function txRenderCellLayer(regionIdx){
  txCellLayer.innerHTML = '';
  const cancerDetailForCells = CANCER_DETAILS[state.currentCancerId];
  const region = cancerDetailForCells.regions[regionIdx];
  const regionWord = cancerDetailForCells.regionWord || 'site';
  const cells = buildRegionCells(regionIdx);
  const rect = txStageEl.getBoundingClientRect();
  cells.forEach(cell=>{
    const el = document.createElement('div');
    el.className = 'node clickable';
    const hasPriv = cell.private.length>0;
    el.style.background = region.color;
    el.style.left = (cell.x*rect.width)+'px';
    el.style.top = (cell.y*rect.height)+'px';
    el.style.width = '15px'; el.style.height = '15px';
    el.style.boxShadow = hasPriv ? PRIVATE_RING_SHADOW + `, 0 0 10px ${region.color}` : `0 0 8px ${region.color}`;
    el.title = 'Cell ' + cell.id;
    makeActivatable(el, ()=>txOpenCell(regionIdx, cell), {
      // The coral ring is the only cue that a cell carries private mutations, so say it.
      label: 'Cell ' + cell.id + ', ' + region.name + ' ' + regionWord + ', '
        + (hasPriv ? cell.private.length + ' private mutation' + (cell.private.length===1?'':'s') : 'no private mutations')
    });
    txCellLayer.appendChild(el);
  });
  txCaptionText.textContent = region.name.toUpperCase() + ' · ' + cells.length + ' sampled cells · coral ring = additional private mutations';
}

// The cell dot that opened the panel, so closing returns focus to it rather than dropping to
// <body>. Ignore candidates inside the panel: opening a second cell while the panel is already
// up would otherwise record the panel itself, which is inert by the time we restore.
export function txOpenCell(regionIdx, cell){
  const opener = document.activeElement;
  if(opener && !txPanel.contains(opener)) state.txPanelOpener = opener;
  state.txCurrentCell = cell;
  state.txLevel = 3;
  const cancer = CANCER_DETAILS[state.currentCancerId];
  const region = cancer.regions[regionIdx];
  txPanelId.textContent = 'Cell ' + cell.id;
  txPanelSub.textContent = region.name + ' ' + (cancer.regionWord || 'site');
  let html = '';
  html += txMutGroup('Trunk mutations', cancer.trunk);
  html += txMutGroup('Branch mutation (site assignment illustrative)', [region.branch]);
  html += cell.private.length
    ? txMutGroup('Private mutations (this cell only)', cell.private)
    : `<div class="grp-title">Private mutations (this cell only)</div><div class="empty-note">None sampled in this cell — a reminder that not every population carries every hit.</div>`;
  // Deliberately filled while the panel is still inert, so this write does NOT reach the
  // #txPanelBody live region. On a first open the focus move below is the announcement; a live
  // region firing as well would read the whole mutation list over the top of it. Reopening for
  // another cell while the panel is already up leaves inert off, so that swap does announce —
  // which is the case the live region exists for. Do not hoist the inert toggle above this.
  txPanelBody.innerHTML = html;
  txPanel.classList.add('open');
  txPanel.toggleAttribute('inert', false);
  appEl.classList.add('panel-open');
  renderCrumbs();
  // The panel is the whole point of activating a cell, and its close button is the only way
  // out by keyboard, so move focus into it. Deliberately not a focus trap — the panel is
  // non-modal (clicking the stage dismisses it) and Tab out is legitimate.
  landFocus(txPanel);
}

function txMutGroup(title, list){
  let html = `<div class="grp-title">${title}</div>`;
  list.forEach(m=>{
    html += `
      <div class="mut">
        <div class="mut-top"><span class="mut-gene">${m.gene}</span><span class="badge ${m.class}">${m.class}</span></div>
        ${m.ccf ? `<div class="mut-meta">${m.ccf}</div>` : ''}
        <div class="mut-note">${m.note}</div>
      </div>`;
  });
  return html;
}

export function txClosePanel(updateLevel){
  const wasOpen = txPanel.classList.contains('open');
  txPanel.classList.remove('open');
  txPanel.toggleAttribute('inert', true);
  appEl.classList.remove('panel-open');
  state.txCurrentCell = null;
  if(updateLevel!==false && state.txLevel===3) state.txLevel = 2;
  // Hand focus back to the cell that opened this. landFocus skips it if that cell has since
  // been inerted — stepping back to the site map does exactly that, and txGoLevel(1) supplies
  // its own landing point for that case.
  if(wasOpen && state.txPanelOpener && document.contains(state.txPanelOpener)) landFocus(state.txPanelOpener);
  state.txPanelOpener = null;
}
// Every dismissal of the panel is "close it and drop the cell off the breadcrumb", and there are
// now three ways to ask for it. Naming the pair once means the Escape key cannot drift away from
// what the close button does — including the focus restore inside txClosePanel.
export function dismissMutationPanel(){
  txClosePanel(true);
  renderCrumbs();
}

document.getElementById('txPanelClose').addEventListener('click', dismissMutationPanel);
txStageEl.addEventListener('click', ()=>{ if(state.txLevel===3) dismissMutationPanel(); });

// Escape as a second keyboard exit, so leaving the panel doesn't require finding the close button
// first. Scoped by state rather than by binding and unbinding a listener per open: one listener for
// the page lifetime can't be left behind stale, and the panel is the only dismissible layer here,
// so there is no other Escape meaning to compete with. Bound on document because focus may sit
// inside the panel or back on the cell dot, and both should respond.
document.addEventListener('keydown', (e)=>{
  if(e.key !== 'Escape') return;
  if(!txPanel.classList.contains('open')) return;
  e.preventDefault();
  dismissMutationPanel();
});
window.addEventListener('resize', ()=>{ if(state.screen==='cancer' && state.txLevel===2) txRenderCellLayer(state.txCurrentRegion); });
