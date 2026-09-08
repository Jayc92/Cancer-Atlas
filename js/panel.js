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
      // Take the first n ADMISSIBLE members, not the first n: a cancer may declare
      // `exclusivePairs` (see liver.js's EXCLUSIVE_PAIRS_HCC) naming pool members its own
      // cited source reports as mutually exclusive, and this draw is what actually decides
      // whether such a pair ever appears in a cell. Nothing else does — the prose can hedge
      // all it likes, the generator still emits the genotype.
      //
      // DELIBERATELY CONSUMES NO EXTRA cellRandom() CALLS. The RNG stream is identical to
      // before, so every cell that carried one mutation still carries one and every cell that
      // carried two still carries two (a 4-member pool with one excluded pair always has an
      // admissible second). Only the COMPOSITION of the conflicting draws changes, and a
      // cancer with no exclusivePairs is byte-identical to the previous behaviour. Skipping a
      // conflict by re-rolling instead would have shifted every subsequent cell's profile.
      // ---- POOL-PAIR EXCLUSIVITY AUDIT, 2026-09-06 (done by hand, on ruling; the result is
      // recorded here rather than in a log because THIS is the line that decides whether an
      // audited pair can appear, and a finding kept somewhere else is a finding the next editor
      // of this loop will not read). A pathway-resolving detector was explicitly NOT built: the
      // candidate set is every unordered pair of real members of one pool, which across 16 pools
      // is a few dozen pairs, i.e. an enumerable list and not a population. Most pools hold 2-4
      // real members plus a deliberate passenger (TTN synonymous variant, exclusive with nothing).
      //
      // STANDARD APPLIED: a pair is a defect when the corpus's OWN cited source, for THIS tumour
      // type, states the two are mutually exclusive — the ARID1A/ARID2 shape, where the generator
      // emits a genotype the citation says does not exist. Transitive chains do NOT qualify, and
      // that mattered: prostate.js pools PTEN loss with CHD1 deletion while citing PTEN as
      // ERG-enriched, CHD1 as SPOP-associated, and ERG as exclusive with SPOP. Two enrichments
      // plus one exclusivity is not an exclusivity, and promoting it to one would invent a claim
      // TCGA 2015 declines to make — the same certainty drift this project counts as a defect in
      // the other direction. prostate.js's own text is careful about this ("not stated as absent
      // from", "not proven absent from"); its CONCLUSION is sound. Only its JUSTIFICATION is
      // stale, since it cites HCC's pre-fix check as precedent.
      //
      // CLEARED, and worth naming because a cleared pair looks identical to an unexamined one:
      //   brain/GBM      PTEN loss + CDKN2A/B deletion — different pathways; the exclusivities
      //                  Brennan states are PI3K-vs-PTEN and RB1-vs-CDKN2A/B, neither this pair.
      //                  GBM is also the corpus's CORRECT PRECEDENT: it excluded PIK3CA and RB1
      //                  by testing candidates against EXISTING POOL MEMBERS, which is exactly
      //                  the test liver.js and kidneys.js omitted. The method was already here.
      //   colon/CRC      FBXW7 + AMER1, TCF7L2 + AMER1 — actively verified the other way: Li 2025
      //                  identifies APC-KRAS-FBXW7-AMER1 as a CO-OCCURRENCE set, and Nunes 2024
      //                  found positive APC co-occurrence with both, with "zero reports anywhere
      //                  of exclusivity" recorded in colon.js's own words.
      //   liver/HCC      ARID1A + NFE2L2, ARID2 + NFE2L2 — cooperating with CTNNB1, not exclusive.
      //   kidneys/ccRCC  PTEN loss + CDKN2A loss — no source addresses the pair. (MTOR + PTEN was
      //                  the separate held case, dissolved by downgrading the unverified claim.)
      //   all others     no span in the corpus names both members of a pool pair near exclusivity
      //                  language, per-file or cross-file.
      //
      // THREE FURTHER HITS, RULED 2026-09-06 — AND THE RULING TURNS ON A DISTINCTION THIS AUDIT
      // FIRST GOT WRONG. I filed all three as one shape ("a pair the corpus declares exclusive in
      // one organ, pooled in another"), which conflates two different kinds of statement:
      //   EMPIRICAL EXCLUSIVITY — "in this cohort these two were mutually exclusive" — is a fact
      //     about a tumour type. It does NOT transfer. Importing it is the ESR1/MDM4 error class:
      //     real gene, real frequency, wrong tumour.
      //   MECHANISTIC REDUNDANCY — "both alterations remove the same checkpoint" — is a claim
      //     about biology, and where the corpus asserts it IN ITS OWN VOICE it needs no import.
      // Treating one-hit-per-pathway-node as tumour-agnostic, which is how I framed the middle
      // disposition, would smuggle the first in wearing the clothes of the second. That framing is
      // rejected; each pair is disposed of on which kind of claim actually bears on it.
      //
      // HALF CLOSED, AND NOT A PROVENANCE-IMPORT QUESTION AT ALL:
      //   lungs/LUAD  CDKN2A loss + RB1 loss. MISFILED ABOVE. Its CDKN2A entry carried no ccf and
      //     no source of any kind, which put it in the BLADDER-COLOUR CLASS — uncited content
      //     driving generated output — governed by source-or-remove, not by anything about
      //     exclusivity. Two questions, and only the first is now answered.
      //   (1) SOURCED, 2026-09-07 — BY DOWNGRADE, WHICH IS THE WHOLE RESULT. TCGA (Nature, 2014)
      //     was read in full text for this rather than recalled: it says "The CDKN2A locus was the
      //     most significant deletion" and gives that deletion's frequency only in a supplementary
      //     table, never in its text. Its CDKN2A 4% is a MUTATION figure, printed in one sentence
      //     with RB1's 4%, and a third route — promoter hypermethylation — is counted in neither.
      //     So NO percentage in that paper measures the event this entry models, and the entry now
      //     carries the quotation plus its counting rule instead of a number. Downgrading beat
      //     substituting, again.
      //   (1-bis) AND THE FIX PROPAGATED ONE LINE DOWN, which is the part worth keeping: stating
      //     CDKN2A's counting rule made its NEIGHBOUR visibly wrong. RB1 loss shipped "~4%" — the
      //     same mutation-only figure, from the same sentence — under a "loss" label, a partial
      //     count wearing a total's name. Corrected in place in the same commit, because a counting
      //     rule cannot ship next to a figure that contradicts it.
      //   (2) STILL OPEN: the redundancy, which is INTERNAL CONSISTENCY rather than provenance.
      //     THIS CORPUS'S OWN TWO NOTES both say the alteration "Removes a cell-cycle checkpoint",
      //     in near-identical words, in the same pool. Two other organs faced this pair and both
      //     kept CDKN2A and dropped RB1: skin.js on pathway-redundancy grounds, having tested the
      //     pair empirically (OR 0.67, p=0.39, not significant) and DECLINED to call it
      //     exclusivity; brain.js because Brennan 2013 states the routes to disabling Rb are
      //     alternative and mutually exclusive. Only skin.js's grounds are usable here — brain.js's
      //     is an EMPIRICAL COHORT FINDING in GBM and would be the ESR1/MDM4 error class if
      //     imported, exactly as ruled above.
      //   (2-bis) WHAT THE FULL-TEXT READ SETTLED AND WHAT IT DID NOT. Checked directly: TCGA 2014
      //     does NOT state this pair mutually exclusive in LUAD, so bladder.js's TCGA 2017
      //     CDKN2A-perp-RB1 stays un-imported and unusable. It DOES report a cell-cycle module,
      //     "alteration of cell cycle regulators", at 64%. That module is the LUAD-native grounds
      //     this pair has always lacked — but its MEMBERSHIP LIST IS IN SUPPLEMENTARY FIG. 10,
      //     WHICH HAS NOT BEEN READ, so "TCGA scores these two as one module in LUAD" is NOT
      //     currently a claim this corpus can make. It is an inference from the module's NAME, and
      //     naming it as such is the point: one supplementary figure is the difference between
      //     deciding (2) on another organ's precedent and deciding it on LUAD's own evidence.
      //   (2-ter) AND (2) IS A CONTENT DECISION, so it waits for a ruling rather than riding along
      //     with (1): it removes a modeled gene, changes what THIS LOOP can emit, and drops the
      //     citation-record ratchet, whose floor then has to be lowered deliberately with the
      //     removed records READ rather than counted. IF YOU ADD OR REMOVE A MEMBER OF ANY POOL
      //     HERE, that ratchet moves with it — record_count.json is not decoration.
      //
      // EXAMINED AND CLEARED ON RULING — kept here for the reason the audit was worth running at
      // all: a cleared pair looks identical to an unexamined one.
      //   breast/TNBC  PIK3CA mutation + PTEN loss. Brennan 2013 states PI3K-perp-PTEN and that is
      //     why brain.js excluded PIK3CA from the GBM pool — but that is an empirical cohort
      //     finding in glioblastoma, so importing it would be the named error AND would probably
      //     be wrong on the facts: PIK3CA and PTEN alterations are not exclusive in breast the way
      //     they are in GBM. breast.js:189's "the same growth advantage PIK3CA mutations reach by
      //     a different door" is an alternative-route description, and it claims no exclusivity —
      //     which is the correct amount to claim. No change.
      //   stomach/GDIFF  TP53 + APC. colon.js records APC-perp-TP53 from Nunes 2024 at MODULE
      //     level and hedges it even for colorectum (pairwise AMER1xTP53 did not survive
      //     multiple-testing correction). A finding already hedged in its own organ does not
      //     survive transfer to another. No change.
      const declaredExclusivePairs = CANCER_DETAILS[state.currentCancerId].exclusivePairs || [];
      for(const candidateMutation of shuffled){
        if(priv.length >= n) break;
        const conflictsWithPick = priv.some(alreadyPicked => declaredExclusivePairs.some(
          pair => pair.includes(candidateMutation.gene) && pair.includes(alreadyPicked.gene)));
        if(!conflictsWithPick) priv.push(candidateMutation);
      }
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
