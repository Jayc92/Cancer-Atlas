// Which organ/cancer is currently loaded into the (single, shared) organ/cancer screens, plus
// every other piece of state the original single-file closure shared across "screens" —
// collected here as one mutable object so every module that used to read/write a bare `let`
// can instead read/write `state.xxx`, with the exact same shared-mutable-reference semantics
// (not copies) the original closure had. renderCrumbs, buildRegionCells, txOpenCell,
// txRenderCellLayer and initSiteViewer all read currentCancerId/currentOrganKey instead of a
// hardcoded REGIONS/TRUNK.
export const state = {
  screen: 'body', // body | organ | cancer
  currentOrganKey: null,
  currentCancerId: null,
  txLevel: 1,
  txCurrentRegion: null,
  txCurrentCell: null,
  txPanelOpener: null,

  bodyViewer: null,
  currentBodySex: 'female',
  femaleBodyGroup: null,
  maleBodyGroup: null,
  hoveredBodyMarker: null,
  bodyReady: false,

  organViewer: null,
  siteViewer: null,
};

// Keyed by region.id ('OV'/'OM'/... for HGSOC, 'BN'/'LV'/... for TNBC) — shared across cancers
// safely as long as every cancer's region ids are unique from every other's, which they are.
export const regionCellCache = {};

// { mesh, el, key, sex } per body hotspot — never reassigned, only pushed to, so a plain
// exported const array (rather than a `state.xxx` property) keeps the same shared-reference
// behavior without needing a setter.
export const bodyMarkerRecords = [];

// { mesh, data, el } per organ investigate-point — same reasoning as bodyMarkerRecords.
export const organMarkers = [];

// { mesh, regionIdx } per tumor-site blob — reassigned wholesale on dispose, so this one DOES
// need to live behind a setter (see setSiteBlobs) rather than being spread/mutated in place.
export let siteBlobs = [];
export function setSiteBlobs(next){ siteBlobs = next; }

// Projected DOM label per tumor-site blob — same reassign-on-dispose reasoning as siteBlobs.
export let siteLabelEls = [];
export function setSiteLabelEls(next){ siteLabelEls = next; }
