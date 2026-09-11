import { state } from './state.js';
import { makeActivatable, updateDisclaimerInert } from './accessibility.js';

// ============================================================
// CLINICAL TRIALS — cancer screen, level 1 (site-map level)
// ============================================================
// A peer VIEW MODE of the site-map layer, entered at level 1 — the opposite level from
// histology.js's toggle, and deliberately so: trials describe the whole cancer entry, not one
// metastatic site. Full design in .claude/phaseD_trials_design.md, ruled 2026-09-11. Runtime,
// bounded-assertion content per the architecture settled in phaseB_design.md §1: no detector is
// added for this, and it is not a .claude/ tool, so it carries no NON_INSTRUMENTS declaration —
// the same category js/histology.js already sits in.

const BASE = 'https://clinicaltrials.gov/api/v2/studies';
const FIELDS = 'NCTId,BriefTitle,OverallStatus,LastUpdatePostDate,Condition';
// An INCLUDE-list (design doc §3), not an exclude-list: fails safe against an overallStatus
// value this document has not enumerated. %7C is the literal pipe ClinicalTrials.gov's v2 API
// expects between alternatives — verified live, not assumed, before this shipped.
const STATUS_FILTER = 'RECRUITING%7CNOT_YET_RECRUITING%7CENROLLING_BY_INVITATION';
const PAGE_SIZE = 10;

// PER-ENTRY, EXPLICIT, RECORDED (design doc §1) — never computed from an entry's display name
// at runtime. Verified live against real ClinicalTrials.gov results, twice over (2026-09-10
// initial verification; 2026-09-11 corpus re-check, which found the corpus had already moved,
// plus the fetch-time-filter design that followed from that finding). Only the two entries
// validated live are wired; the remaining fourteen are deliberately not built here.
export const TRIALS_CONDITION_MAP = {
  ccrcc: {
    query: 'clear cell renal cell carcinoma',
    conditionKeywords: ['renal', 'kidney', 'rcc'],
    note: '1/8 broader (kidney cancer generally, a CD70 imaging trial) — a named, reasoned '
      + 'broadening, not a wrong-disease match; accepted at 8/8 on the property that actually '
      + 'matters, zero wrong-disease results.',
  },
  gdiff: {
    query: 'gastric adenocarcinoma',
    conditionKeywords: ['gastric', 'stomach'],
    note: 'dropped "diffuse" from the query after it collided with an unrelated neuro-oncology '
      + 'basket trial via keyword match; the registry does not tag by Lauren classification at '
      + 'the condition level, so subtype specificity is deliberately not in the keyword set.',
  },
};

// ---- the fetch-time filter (design doc §1b) --------------------------------------------------
// THE QUERY IS NOT THE GUARD — THE RETURNED CONDITIONS ARE. A query can return something
// different tomorrow than it did today: verified live, not assumed — the ccRCC query above
// returned a completely different 8-study set one day after the mapping was first validated,
// zero NCT-id overlap with the set the mapping was checked against. What is checkable on every
// fetch, against a corpus that keeps moving, is what each returned study's OWN declared
// conditions say it is about — never what the query asked for or how the study surfaced.
function keywordRegex(keywords){
  // Word-boundaried, case-insensitive: the pointer_check.py scar applies here too — an
  // unboundaried short needle collides with ordinary English. These are real multi-character
  // medical terms, boundaried the same way regardless of length.
  const escaped = keywords.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp('\\b(?:' + escaped.join('|') + ')\\b', 'i');
}

function studyConditions(study){
  const cm = study.protocolSection && study.protocolSection.conditionsModule;
  return (cm && cm.conditions) || [];
}

// Exported so it can be driven directly against a fixture: a fetch-time filter must be shown
// capable of dropping a genuine wrong-disease study before its zero is trusted on real traffic
// (Convention F — a plausible-but-wrong input, not only a broken one). Verified against two
// fixtures before this shipped: a study whose conditions carry no gdiff keyword at all (dropped)
// and the same study with 'Gastric Cancer' appended (kept) — see design doc §1b.
export function filterByCondition(studies, keywords){
  const re = keywordRegex(keywords);
  const kept = [], dropped = [];
  studies.forEach(s=>{
    (studyConditions(s).some(c=>re.test(c)) ? kept : dropped).push(s);
  });
  return { kept, dropped };
}

function buildUrl(query){
  return BASE + '?query.cond=' + encodeURIComponent(query) + '&filter.overallStatus=' + STATUS_FILTER
    + '&fields=' + FIELDS + '&sort=LastUpdatePostDate:desc&pageSize=' + PAGE_SIZE;
}

// Four states (design doc §4). LOADING has no return value here — the caller shows its own copy
// while this promise is in flight. EMPTY-UNANSWERED is a probe failure (network/HTTP), never
// dressed as a finding about the disease — the measured-catastrophe-vs-failed-to-measure
// distinction this project's own deploy_check.js established, applied here to runtime content.
export async function fetchTrialsForEntry(cancerId){
  const entry = TRIALS_CONDITION_MAP[cancerId];
  if(!entry) return null;
  const fetchedAt = new Date();
  let studies;
  try{
    const res = await fetch(buildUrl(entry.query));
    if(!res.ok) return { state:'empty-unanswered', fetchedAt };
    const data = await res.json();
    studies = data.studies || [];
  }catch(err){
    return { state:'empty-unanswered', fetchedAt };
  }
  const { kept, dropped } = filterByCondition(studies, entry.conditionKeywords);
  // Defensive client-side sort even though the request already asks the API to sort
  // server-side (sort=LastUpdatePostDate:desc, verified live) — a guarantee this code owns
  // rather than trusts silently to an upstream default that could change.
  kept.sort((a, b)=>lastUpdateDate(b).localeCompare(lastUpdateDate(a)));
  // THE DROP COUNT IS THE MAPPING'S OWN QUALITY SIGNAL (design doc §1d) — reported on every
  // fetch, not silently absorbed, so a mapping that starts producing many drops is visible
  // without anyone having to go looking for it.
  console.log('[trials] ' + cancerId + ': ' + studies.length + ' fetched, ' + dropped.length
    + ' dropped (condition mismatch), ' + kept.length + ' shown');
  const base = { fetchedAt, totalFetched: studies.length, dropCount: dropped.length };
  if(kept.length === 0) return { ...base, state:'empty-answered' };
  return { ...base, state:'results', studies:kept };
}

function lastUpdateDate(study){
  const sm = study.protocolSection && study.protocolSection.statusModule;
  return (sm && sm.lastUpdatePostDateStruct && sm.lastUpdatePostDateStruct.date) || '';
}
function studyStatus(study){
  const sm = study.protocolSection && study.protocolSection.statusModule;
  return (sm && sm.overallStatus) || '';
}
function studyTitle(study){
  const im = study.protocolSection && study.protocolSection.identificationModule;
  return (im && im.briefTitle) || '';
}
function studyId(study){
  const im = study.protocolSection && study.protocolSection.identificationModule;
  return (im && im.nctId) || '';
}

// ------------------------------------------------------------
// Layer wiring — same register-once shape as js/histology.js's toggle.
// ------------------------------------------------------------
const layerEl = document.getElementById('txTrialsLayer');
const toggleBtn = document.getElementById('txTrialsToggle');
const listEl = document.getElementById('trialsList');
const statusLineEl = document.getElementById('trialsStatusLine');

let trialsOn = false;
let loadedForCancerId = null;

const DATE_FMT = new Intl.DateTimeFormat('en-US', { dateStyle:'medium', timeStyle:'short' });

function renderLoading(){
  statusLineEl.textContent = 'Fetching trials from ClinicalTrials.gov…';
  listEl.innerHTML = '';
}

function renderResult(cancerId, result){
  const entry = TRIALS_CONDITION_MAP[cancerId];
  const stamp = 'Trials shown as of ' + DATE_FMT.format(result.fetchedAt) + ' · fetched from ClinicalTrials.gov';
  if(result.state === 'empty-unanswered'){
    statusLineEl.textContent = stamp.replace('Trials shown as of', 'Last attempted');
    listEl.innerHTML = '<div class="trials-error">We couldn\'t reach ClinicalTrials.gov just now — '
      + 'try again, or search directly at <a href="https://clinicaltrials.gov/" target="_blank" '
      + 'rel="noopener">clinicaltrials.gov</a>.</div>';
    return;
  }
  if(result.state === 'empty-answered'){
    statusLineEl.textContent = stamp;
    listEl.innerHTML = '<div class="trials-empty">No open trials are currently listed for this condition.</div>';
    return;
  }
  // RESULTS. dropCount is reported here too (design doc §1d) — not just to the console — since
  // it is honest information about why a raw fetch count and a shown count can differ.
  statusLineEl.textContent = stamp + (result.dropCount > 0
    ? ' · ' + result.dropCount + ' result' + (result.dropCount === 1 ? '' : 's') + ' omitted (didn\'t match this condition)'
    : '');
  const titleRe = keywordRegex(entry.conditionKeywords);
  listEl.innerHTML = result.studies.map(s=>{
    const nctId = studyId(s), title = studyTitle(s), status = studyStatus(s), updated = lastUpdateDate(s);
    const multiCondition = title && !titleRe.test(title);
    return '<div class="trial-card">'
      + '<a href="https://clinicaltrials.gov/study/' + encodeURIComponent(nctId) + '" target="_blank" rel="noopener">' + title + '</a>'
      + '<div class="trial-meta"><span class="trial-status">' + status + '</span>'
      + (updated ? '<span>Updated ' + updated + '</span>' : '') + '</div>'
      + (multiCondition ? '<div class="trial-multinote">Multi-condition trial — lists this condition among several others it studies.</div>' : '')
      + '</div>';
  }).join('');
}

function loadTrials(cancerId){
  renderLoading();
  fetchTrialsForEntry(cancerId).then(result=>{
    // The user may have left this cancer's screen, or the toggle may have been closed, while
    // the fetch was in flight — same stale-response guard every async loader in this app uses
    // (initOrganViewer's GLB load is the precedent). Comparing both the still-current cancer id
    // and that the layer is still the active one avoids writing a finished fetch's markup into
    // a panel nobody is looking at.
    if(state.currentCancerId !== cancerId || !trialsOn) return;
    renderResult(cancerId, result);
  });
}

function applyMode(on){
  trialsOn = on;
  layerEl.classList.toggle('active', on);
  layerEl.toggleAttribute('inert', !on);
  document.getElementById('screenCancer').classList.toggle('trials-open', on);
  updateDisclaimerInert();
  const siteViewerEl = document.getElementById('txSiteViewer');
  siteViewerEl.classList.toggle('hidden', on);
  // .hidden alone (opacity:0 + pointer-events:none) leaves the site-label buttons inside it
  // focusable and keyboard-activatable — the same trap #txCellLayer's own markup comment
  // documents. inert removes the whole subtree from the accessibility tree, matching every
  // other layer swap on this screen.
  siteViewerEl.toggleAttribute('inert', on);
  if(state.siteViewer) state.siteViewer.autoRotate = !on;
  toggleBtn.setAttribute('aria-pressed', String(on));
}

function enterTrials(){
  const cancerId = state.currentCancerId;
  if(!cancerId || !TRIALS_CONDITION_MAP[cancerId]) return; // belt-and-braces, same as histology's guard
  applyMode(true);
  if(loadedForCancerId !== cancerId){
    loadedForCancerId = cancerId;
    loadTrials(cancerId);
  }
  toggleBtn.focus({ preventScroll:true });
}

export function resetTrialsMode(){
  if(!trialsOn){
    toggleBtn.setAttribute('aria-pressed', 'false');
    return;
  }
  applyMode(false);
}

export function showTrialsToggle(){
  toggleBtn.hidden = !TRIALS_CONDITION_MAP[state.currentCancerId];
}

export function hideTrialsToggle(){
  toggleBtn.hidden = true;
}

export function initTrials(){
  toggleBtn.addEventListener('click', ()=>{
    if(trialsOn) resetTrialsMode();
    else enterTrials();
  });
}
