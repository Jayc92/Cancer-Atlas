// Deterministic randomness for cell scatter/mutation assignment. Pure, no DOM/THREE dependency —
// used by viewer.js (organicSpiculate's spike placement) and panel.js (per-cell layout/mutations).

// mulberry32 — a small, fast PRNG with an explicit seed. Used instead of Math.random()
// so a site's cell scatter is identical on every load: cell OV-7 must always be the same
// cell with the same mutations. Reshuffling on reload would imply the tool is re-sampling
// a live patient, and would break any citation of a specific cell in teaching material.
export function makeSeededRandom(seed){
  let state = seed >>> 0;
  return function nextRandom(){
    state = (state + 0x6D2B79F5) >>> 0;
    let scrambled = state;
    scrambled = Math.imul(scrambled ^ (scrambled >>> 15), scrambled | 1);
    scrambled ^= scrambled + Math.imul(scrambled ^ (scrambled >>> 7), scrambled | 61);
    return ((scrambled ^ (scrambled >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a: turns a key like 'OV' or 'OV-7' into the 32-bit integer seed the PRNG wants,
// so each site (and each cell within it) gets its own stable but distinct stream.
export function seedFromKey(key){
  let hash = 2166136261;
  for(let i=0;i<key.length;i++){
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Fisher-Yates. Deliberately not [...pool].sort(()=>random()-0.5), which is biased and
// ordering-dependent on the engine's sort implementation even with a seeded source.
export function shuffleWithRandom(items, nextRandom){
  const shuffled = [...items];
  for(let i=shuffled.length-1;i>0;i--){
    const j = Math.floor(nextRandom()*(i+1));
    const swap = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = swap;
  }
  return shuffled;
}
