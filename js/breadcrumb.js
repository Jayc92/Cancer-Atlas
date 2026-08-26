import { state } from './state.js';
import { ORGAN_DETAILS, CANCER_DETAILS } from './organs/index.js';
import { makeActivatable } from './accessibility.js';

const crumbsEl = document.getElementById('crumbs');

// Registered once at startup with the two callbacks a crumb click can trigger — setScreen and
// txGoLevel both live in main.js, which also owns renderCrumbs' own call sites, so this is the
// one place in the split that would otherwise need a circular import; storing the refs here
// instead keeps every other module's dependency graph one-directional.
let nav = { setScreen: null, txGoLevel: null };
export function initBreadcrumb(navCallbacks){ nav = navCallbacks; }

export function renderCrumbs(){
  let parts = [{label:'Body', fn:()=>nav.setScreen('body')}];
  if(state.screen==='organ' || state.screen==='cancer'){
    parts.push({label:ORGAN_DETAILS[state.currentOrganKey].title, fn:()=>nav.setScreen('organ')});
  }
  if(state.screen==='cancer'){
    const cancer = CANCER_DETAILS[state.currentCancerId];
    parts.push({label:cancer.title, fn:()=>nav.txGoLevel(1)});
    if(state.txLevel>=2 && state.txCurrentRegion!==null){
      parts.push({label:cancer.regions[state.txCurrentRegion].name, fn:()=>nav.txGoLevel(2)});
    }
    if(state.txLevel===3 && state.txCurrentCell){
      parts.push({label:'Cell '+state.txCurrentCell.id, fn:null});
    }
  }
  crumbsEl.innerHTML = parts.map((p,i)=>{
    const isLast = i===parts.length-1;
    return `<span class="crumb ${isLast?'current':''}" data-i="${i}">${p.label}</span>` + (isLast?'':'<span class="sep">›</span>');
  }).join('');
  // innerHTML above discards the previous segments, so role/tabindex/handlers have to be
  // reapplied on every navigation rather than wired once at startup.
  crumbsEl.querySelectorAll('.crumb').forEach((el,i)=>{
    const isCurrent = i === parts.length-1;
    if(isCurrent){
      // The trailing segment is where you already are. It used to be clickable, but the
      // only thing it did was re-navigate to the current location.
      el.setAttribute('aria-current', 'page');
      return;
    }
    if(!parts[i].fn) return;
    makeActivatable(el, parts[i].fn, {label: 'Back to ' + parts[i].label});
  });
}
