import { ORGANS } from './organs/index.js';
import { makeActivatable } from './accessibility.js';

// Organ and cancer rows repeat the same "what is this / does it go anywhere" phrasing, and
// the "coming soon" state is only conveyed visually. Build the name in one place.
export function organActionLabel(organ){
  return organ.label + (organ.active ? ' — explore this organ' : ' — full atlas coming soon');
}

// Single matching rule shared by the results list and the Enter-key shortcut, so the
// two paths can never disagree about what a query matches.
export function organMatchesQuery(organ, q){
  if(organ.label.toLowerCase().includes(q)) return true;
  return (organ.aliases || []).some(alias => alias.includes(q));
}
export function findOrganMatches(q){
  return ORGANS.filter(organ => organMatchesQuery(organ, q));
}

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function renderSearch(query, selectOrgan){
  const q = query.trim().toLowerCase();
  if(!q){ searchResults.classList.remove('show'); searchResults.innerHTML=''; return; }
  const matches = findOrganMatches(q);
  if(matches.length===0){ searchResults.classList.remove('show'); searchResults.innerHTML=''; return; }
  searchResults.innerHTML = matches.map(o=>`
    <div class="sr-row" data-key="${o.key}">
      <div><div class="sr-name">${o.label}</div><div class="sr-sys">${o.system}</div></div>
      <div class="sr-tag">${o.active ? 'Explore' : 'Coming soon'}</div>
    </div>`).join('');
  searchResults.classList.add('show');
  searchResults.querySelectorAll('.sr-row').forEach(row=>{
    const organ = ORGANS.find(o=>o.key===row.dataset.key);
    makeActivatable(row, ()=>{
      selectOrgan(row.dataset.key);
      searchResults.classList.remove('show');
      searchInput.value = '';
    }, {label: organ ? organActionLabel(organ) : row.dataset.key});
  });
}

// Registered once at startup with the one callback this module needs from main.js, the same
// "register once, no circular import" pattern body.js uses for the same reason: selectOrgan
// lives in main.js because it also drives setScreen('organ')/renderOrganScreen, which search
// has no business owning.
export function initSearch(selectOrgan){
  searchInput.addEventListener('input', ()=>renderSearch(searchInput.value, selectOrgan));
  searchInput.addEventListener('keydown', e=>{
    if(e.key==='Enter'){
      const q = searchInput.value.trim().toLowerCase();
      if(!q) return;
      const match = findOrganMatches(q)[0];
      if(match){ selectOrgan(match.key); searchResults.classList.remove('show'); }
    }
  });
}
