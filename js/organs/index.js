// Assembles the seven per-organ data modules into the flat structures the rest of the app
// expects — ORGANS/CANCERS as arrays (search, body markers, and the organ/cancer lists all
// filter these), ORGAN_DETAILS/CANCER_DETAILS/ORGAN_MARKER_SPECS as key-lookup objects. Adding
// organ #8 means adding one organ module here and one line in each of the four assemblies below
// — not touching main.js, viewer.js, or any other organ's file.
import * as ovary from './ovary.js';
import * as brain from './brain.js';
import * as lungs from './lungs.js';
import * as breast from './breast.js';
import * as liver from './liver.js';
import * as kidneys from './kidneys.js';
import * as prostate from './prostate.js';
import * as colon from './colon.js';
import * as pancreas from './pancreas.js';
import * as stomach from './stomach.js';
import * as skin from './skin.js';

// Order matches the original single-file ORGANS array exactly for the first seven (ovary,
// brain, lungs, breast, liver, kidneys, prostate) — not load-bearing for correctness (filter/
// find don't care about array order, and every alias set is designed collision-free so no
// query ever matches more than one organ), but kept identical anyway rather than relying on
// that reasoning to justify a silent reorder. Colon, pancreas, and stomach are appended in
// the order their shared pass added them, same as prostate was appended in its own pass.
const ORGAN_MODULES = [ovary, brain, lungs, breast, liver, kidneys, prostate, colon, pancreas, stomach, skin];

// `aliases` exists because searching the label alone is too literal: the organ screen
// titles itself "Ovary" (singular) while the label is "Ovaries", so the one wired organ
// was unreachable by its own name. Include singular, plural, and adjectival forms.
// sexes:['female','male'] drives which body model(s) show this organ's hotspot — see
// BODY_MARKERS below, which supplies the actual 3D anchor point(s) per applicable sex.
export const ORGANS = ORGAN_MODULES.map(m => m.organEntry);

// organKey filters this flat list down to "cancers of the currently displayed organ" in
// renderCancerList — one list shared across every organ rather than one array per organ.
export const CANCERS = ORGAN_MODULES.flatMap(m => m.cancerEntries);

export const ORGAN_DETAILS = {};
ORGAN_MODULES.forEach(m => { ORGAN_DETAILS[m.organEntry.key] = m.organDetail; });

// One entry per cancer screen. Everything txEnterRegion/txGoLevel/txOpenCell/renderCrumbs/
// initSiteViewer need to show a different cancer lives here — regions/trunk/privatePool plus
// the display strings that used to be hardcoded markup (screen aria-label, legend title).
export const CANCER_DETAILS = Object.assign({}, ...ORGAN_MODULES.map(m => m.cancerDetails));

// Every organ hotspot's anchor, as a fraction of standing height (0 = lowest vertex, 1 =
// highest) plus an angle around the vertical axis (0deg = straight ahead, +Z). There's no
// analytic torsoRadiusAt(height) formula for a real mesh, so a spec here doesn't encode a
// position directly — it's an instruction to findBodySurfaceAnchor() to raycast inward from
// outside the mesh at this height/angle and land wherever the surface actually is. That makes
// the same spec correct for both sexes despite their different proportions.
// Angles were re-derived from scratch for this mesh, not carried over from the abandoned
// MakeHuman spec — the rest pose is different (arms angled down-and-out from the shoulder
// rather than a flat horizontal T-pose) and the safe angular window against the arm is wider
// as a result: the arm only intrudes past roughly 55-70deg through the chest/waist band here,
// vs. MakeHuman's ~55deg ceiling. Verified per height band with the same
// angle-vs-radius sampling technique used to catch that mesh's problems, not by eyeballing the
// render. Not meant to be anatomically precise (kidneys are genuinely more lateral/posterior
// than a front-facing viewer can show well) — same level of simplification every hotspot
// system this app has had, going back to the original flat SVG dots, has used.
export const ORGAN_MARKER_SPECS = {};
ORGAN_MODULES.forEach(m => { ORGAN_MARKER_SPECS[m.organEntry.key] = m.markerSpec; });
