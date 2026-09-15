import { state } from './state.js';
import { CANCER_DETAILS } from './organs/index.js';
import { makeActivatable, updateDisclaimerInert } from './accessibility.js';
import { makeSeededRandom, seedFromKey } from './rng.js';
import { dismissMutationPanel } from './panel.js';

// ============================================================
// MICROSCOPIC (HISTOLOGY) VIEW — cancer screen, level 2
// ============================================================
// A procedurally generated, stylized 2D evocation of each cancer's real, documented H&E
// architecture — the same principle as organicDisplace/organicSpiculate: generate the real
// variation procedurally instead of shipping a fixed external asset (this app has never used
// stock imagery and doesn't start here). Every architectural claim drawn below is backed by
// the per-cancer `histology` data block in that cancer's own js/organs/*.js module, verified
// at the source like every other citation in this app — the drawing code only renders what
// the data block documents, and the in-product card states plainly that the visual is a
// stylized illustration, not a real patient micrograph (data rule 2's say-what's-illustrative
// standard, applied from the first commit).
//
// View-mode mechanics, not a new drill level: toggling swaps #txCellLayer <-> #txHistologyLayer
// with the exact opacity/pointer-events/inert discipline the site-viewer <-> cell-layer
// transition already uses, and the breadcrumb stays at the site level. main.js calls
// resetHistologyMode()/show/hideHistologyToggle() from txEnterRegion/txGoLevel so entering any
// region always starts at the cell scatter and leaving level 2 always cleans this mode up.

const VB = { w: 800, h: 500 };
const SVG_NS = 'http://www.w3.org/2000/svg';

// H&E stain palette — content colors representing hematoxylin (purple-blue nuclei) and eosin
// (pink cytoplasm/stroma), deliberately NOT design-system variables: these depict the stain
// itself, while the design system keeps owning every piece of chrome around the slide.
const HE = {
  bg:      '#f6edf0',
  stroma:  '#eed3dc',
  stromaLn:'#e0b9c7',
  cyto:    '#eec3cf',
  cytoLite:'#f4d8e0',
  cytoLn:  '#d9a8b8',
  nuc:     '#5a3d78',
  nucDark: '#3c2b52',
  clear:   '#fbf7f9',
  clearLn: '#d9bcc7',
  necro:   '#eddbd2',
  debris:  '#d3b4a6',
  vessel:  '#c96a6a',
  vesselDk:'#a84e4e',
  lymph:   '#43306b',
};

function el(tag, attrs){
  const n = document.createElementNS(SVG_NS, tag);
  for(const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

// Closed organic blob via quadratic midpoint smoothing — the 2D cousin of organicDisplace's
// job: no two nests/glands/necrotic zones identical, all from one seeded stream.
function blobPath(cx, cy, rx, ry, wobble, points, rnd, rot){
  const pts = [];
  const rotation = rot || 0;
  for(let i=0;i<points;i++){
    const a = i/points*Math.PI*2;
    const rr = 1 + (rnd()*2-1)*wobble;
    const px = Math.cos(a)*rx*rr, py = Math.sin(a)*ry*rr;
    pts.push([
      cx + px*Math.cos(rotation) - py*Math.sin(rotation),
      cy + px*Math.sin(rotation) + py*Math.cos(rotation),
    ]);
  }
  let d = 'M'+((pts[0][0]+pts[points-1][0])/2).toFixed(1)+' '+((pts[0][1]+pts[points-1][1])/2).toFixed(1);
  for(let i=0;i<points;i++){
    const p = pts[i], q = pts[(i+1)%points];
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0]+q[0])/2).toFixed(1)} ${((p[1]+q[1])/2).toFixed(1)}`;
  }
  return d+' Z';
}

// One tumor cell: eosinophilic cytoplasm + hematoxylin nucleus. nucR varies per call —
// pleomorphism is a per-cancer parameter, not an accident of the renderer.
function drawCell(g, x, y, cytoR, nucR, rnd, opts){
  const o = opts || {};
  if(cytoR > 0){
    g.appendChild(el('ellipse', {
      cx:x, cy:y, rx:cytoR*(0.9+rnd()*0.2), ry:cytoR*(0.85+rnd()*0.25),
      fill:o.cytoFill||HE.cyto, stroke:o.cytoStroke||HE.cytoLn, 'stroke-width':1, opacity:o.cytoOpacity||0.9,
    }));
  }
  const rot = rnd()*180;
  g.appendChild(el('ellipse', {
    cx:x + (rnd()*2-1)*(o.nucOffset||0), cy:y + (rnd()*2-1)*(o.nucOffset||0),
    rx:nucR, ry:nucR*(0.72+rnd()*0.4),
    transform:`rotate(${rot.toFixed(0)} ${x} ${y})`,
    fill:o.nucFill||HE.nuc, opacity:0.92,
  }));
}

// A ring of cells around a lumen — glands (LUAD acinar, prostate pattern 3) and papillae
// rims both build on this.
function drawGlandRing(g, cx, cy, lumenR, rnd, opts){
  const o = opts || {};
  const n = Math.max(7, Math.round(lumenR*0.75));
  g.appendChild(el('circle', {cx, cy, r:lumenR + (o.cellR||9), fill:o.cytoFill||HE.cyto, stroke:HE.cytoLn, 'stroke-width':1}));
  g.appendChild(el('circle', {cx, cy, r:lumenR, fill:HE.bg}));
  for(let i=0;i<n;i++){
    const a = i/n*Math.PI*2 + rnd()*0.2;
    const rr = lumenR + (o.cellR||9)*0.55;
    const nr = (o.nucMin||3.2) + rnd()*((o.nucMax||4.6)-(o.nucMin||3.2));
    g.appendChild(el('circle', {cx:cx+Math.cos(a)*rr, cy:cy+Math.sin(a)*rr, r:nr, fill:HE.nuc, opacity:0.92}));
  }
}

// Yolk sac tumor's Schiller-Duval body — a glomerulus-like structure, genuinely new (checked
// directly against every existing primitive: nothing here draws a central-vessel-core wrapped by
// a cell layer, projecting into an open cystic space). Verified directly at two sources:
// "bilayered festoons of cells surrounding a fibrovascular core, reminiscent of primitive
// glomeruli" (Al-Masri et al., Ann Saudi Med, 2011, PMID 21293065) and "a central vessel
// surrounded by fibrous tissue... surrounded by layers of the tumoral cells... resemble primitive
// glomerulus" (Fischerova et al., Diagnostics, 2022, PMID 35204394). Structure, in drawing order:
// a pale cystic space first (the body projects INTO this, so it sits off-center within it), then
// the fibrovascular core (a small vessel, same color pair drawFrond's own core uses), then a
// wrapping ring of cuboidal (squashed, radially-aligned) tumor cells around the core — a
// DIFFERENT technique from drawGlandRing's outward-facing nuclei-only ring, since the source
// specifically describes CELLS (with cytoplasm), not bare nuclei, forming the wrapping layer.
function drawSchillerDuvalBody(g, cx, cy, cystR, rnd, opts){
  const o = opts || {};
  const bodyCx = cx + (o.offsetX||0), bodyCy = cy + (o.offsetY||0);
  const coreR = o.coreR || cystR*0.22;
  const cellR = o.cellR || cystR*0.16;
  // the cystic space the body projects into — pale, open
  g.appendChild(el('path', {d:blobPath(cx, cy, cystR, cystR*0.92, 0.14, 16, rnd, 0), fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1.4, opacity:0.85}));
  // the fibrovascular core
  g.appendChild(el('circle', {cx:bodyCx, cy:bodyCy, r:coreR, fill:o.coreColor||HE.vessel, stroke:o.coreColorDark||HE.vesselDk, 'stroke-width':1.6, opacity:0.9}));
  // the wrapping layer of cuboidal tumor cells, radially aligned around the core
  const n = o.cellCount || 12;
  for(let i=0;i<n;i++){
    const a = i/n*Math.PI*2 + rnd()*0.12;
    const rr = coreR + cellR*0.85;
    const x = bodyCx + Math.cos(a)*rr, y = bodyCy + Math.sin(a)*rr;
    const alignDeg = a*180/Math.PI + 90;
    g.appendChild(el('rect', {
      x:x-cellR*0.55, y:y-cellR*0.85, width:cellR*1.1, height:cellR*1.7,
      transform:`rotate(${alignDeg.toFixed(0)} ${x} ${y})`,
      fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':0.9, opacity:0.95, rx:cellR*0.2,
    }));
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:cellR*0.32, ry:cellR*0.42, transform:`rotate(${alignDeg.toFixed(0)} ${x} ${y})`, fill:HE.nuc, opacity:0.9}));
  }
}

function necrosisBlob(g, cx, cy, rx, ry, rnd, rot){
  g.appendChild(el('path', {d:blobPath(cx, cy, rx, ry, 0.28, 12, rnd, rot||0), fill:HE.necro, stroke:HE.debris, 'stroke-width':1}));
  // karyorrhectic debris — the dust of broken nuclei real necrosis is full of
  for(let i=0;i<Math.round(rx*ry/220);i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.8;
    g.appendChild(el('circle', {cx:cx+Math.cos(a)*rx*r*0.9, cy:cy+Math.sin(a)*ry*r*0.9, r:1+rnd()*1.6, fill:HE.debris, opacity:0.7}));
  }
}

// ------------------------------------------------------------
// FAMILY PRIMITIVES (2026-09-11) — tested by building a fourth generator from parameters rather
// than by hand, per the pilot's own cost report flagging per-entry SVG authoring as the largest
// unbudgeted item. The fourth generator (prostatic ductal adenocarcinoma — papillary and
// cribriform architecture per Seipel et al., Pathology, 2016, PMID 27321992, and Au et al.,
// Ann Diagn Pathol, 2019, PMID 30772651) was built with these primitives, live-verified in the
// browser (real render, correct anchors, visually distinct from every existing frond/cribriform
// slide), then DELIBERATELY NOT KEPT in this file — `ductal` is not yet a real `cancerEntries`
// stub in prostate.js (no mutations/origin/extent/trials authored), and a generator with no
// entry to serve is dead code by this project's own standard. Full record and code in
// `.claude/phaseC_design.md`'s item-2 report; reinstate it verbatim once `ductal` is real.
// Extracted from patterns that ALREADY recur, independently, across genHGSOC/genPTC/genLGSC/
// genBladderUC (a frond: a stroma body, an optional core, a rim of nuclei) and genProstate's
// pattern-4/genCRC's cribriform gland (a mass punched with rejection-sampled non-overlapping
// lumens, cells filling the rest) — this does NOT retrofit those four already-shipped,
// gate-verified generators to call the new functions; it only adds the functions and proves
// them on a genuinely new entry. Two families
// factor cleanly (frond/papilla, cribriform mass); a third (solid sheet — tnbc/luad-zone3/
// prostate-p5/occc-zone3) is simple enough (a bounded blob + drawCell grid) that a dedicated
// helper would save little; several generators (GBM's necrosis+pseudopalisading+microvascular
// tufts, melanoma's epidermis+DEJ+pagetoid spread, HCC's trabecular cords, TNBC's necrosis+TILs,
// seminoma's septal+lymphocytic dressing) are genuinely bespoke — see the item-2 report for the
// full per-organ accounting.
function drawPsammomaBody(g, x, y, r){
  for(let rr=r; rr>2; rr-=r/3.4) g.appendChild(el('circle', {cx:x, cy:y, r:rr, fill:'none', stroke:'#8f76a8', 'stroke-width':2.2, opacity:0.9}));
}
// Meningioma's own signature architecture — concentric whorls of meningothelial cells wound
// around a central point (StatPearls, "Meningioma," NBK560538: "whorls and syncytia of
// meningothelial cells"). Genuinely new: no existing primitive draws a SOLID (no central lumen)
// concentric ring of CELLS the way drawGlandRing's open-lumen technique does — closest in spirit
// to drawPsammomaBody's own concentric-ring technique, but built from real nuclei winding inward
// at successive radii rather than a bare stroked ring. Reuses drawPsammomaBody verbatim for the
// real calcification that forms within many whorls as the meningothelial cells mineralize.
function drawWhorl(g, cx, cy, r, rnd, opts){
  const o = opts || {};
  const rings = Math.max(3, Math.round(r/9));
  for(let ring=rings; ring>0; ring--){
    const rr = r*(ring/rings);
    const n = Math.max(6, Math.round(rr*0.5));
    for(let i=0;i<n;i++){
      const a = i/n*Math.PI*2 + ring*0.35 + rnd()*0.15;
      const x = cx + Math.cos(a)*rr, y = cy + Math.sin(a)*rr;
      const alignDeg = a*180/Math.PI + 90;
      g.appendChild(el('ellipse', {cx:x, cy:y, rx:3.6, ry:1.8, transform:`rotate(${alignDeg.toFixed(0)} ${x} ${y})`, fill:HE.nuc, opacity:0.9}));
    }
  }
  if(o.psammoma) drawPsammomaBody(g, cx, cy, r*0.22);
}
// Squamous cell carcinoma's own signature architecture — concentric whorled keratin lamellae
// narrowing to a densely keratinized center (Sabbula et al., StatPearls, NBK564510: diagnosis
// requires "keratinization or intercellular bridges" in >=10% of tumor bulk). A solid, FILLED
// analog of drawPsammomaBody's unfilled concentric rings, reusing the same "shrink a ring by a
// fixed fraction each pass" technique but with warm eosinophilic keratin tones (real keratin
// stains intensely pink/orange with eosin) rather than psammoma's calcified purple-gray, and
// organic (blobPath-wobbled) rather than perfectly circular — real keratin pearls are irregular
// whorls, not lathe-turned rings.
function drawKeratinPearl(g, x, y, r, rnd){
  const rings = Math.max(4, Math.round(r/4));
  for(let i=rings; i>0; i--){
    const rr = r*(i/rings);
    g.appendChild(el('path', {
      d:blobPath(x, y, rr, rr*(0.9+rnd()*0.15), 0.1, 10, rnd, rnd()*0.5),
      fill: i%2===0 ? '#eb9c66' : '#f4bd90', stroke:'#c97a42', 'stroke-width':0.8, opacity:0.95,
    }));
  }
}
// A punched sheet: one blob mass, N non-overlapping rejection-sampled lumens, cells filling the
// remainder. Generalizes genProstate's pattern-4 mass and genCRC's cribriform gland — same
// rejection-sampling shape in both, independently written; this is the one function they'd both
// call if they were touched again, not a retrofit now.
function drawCribriformMass(g, rnd, cx, cy, rx, ry, opts){
  const o = opts || {};
  const d = blobPath(cx, cy, rx, ry, o.wobble != null ? o.wobble : 0.12, 12, rnd, o.rot || 0);
  g.appendChild(el('path', {d, fill:o.fill || HE.cyto, stroke:o.stroke || HE.cytoLn, 'stroke-width':o.strokeWidth || 1.2}));
  const lumens = [];
  let attempts = 0;
  const want = o.lumenCount || 10, rMin = o.lumenRMin || 10, rMax = o.lumenRMax || 17;
  while(lumens.length < want && attempts < 700){
    attempts++;
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*(o.lumenSpread != null ? o.lumenSpread : 0.78);
    const lx = cx+Math.cos(a)*rx*r, ly = cy+Math.sin(a)*ry*r, lr = rMin+rnd()*(rMax-rMin);
    if(lumens.some(L=>Math.hypot(L.x-lx, L.y-ly) < L.r+lr+(o.lumenGap != null ? o.lumenGap : 4))) continue;
    lumens.push({x:lx, y:ly, r:lr});
  }
  lumens.forEach(L=>{ g.appendChild(el('circle', {cx:L.x, cy:L.y, r:L.r, fill:o.lumenFill || HE.bg, stroke:o.stroke || HE.cytoLn, 'stroke-width':1})); });
  const cellCount = o.cellCount || Math.round(rx*ry/900);
  for(let i=0;i<cellCount;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*(o.cellSpread != null ? o.cellSpread : 0.9);
    const x = cx+Math.cos(a)*rx*r, y = cy+Math.sin(a)*ry*r;
    if(lumens.some(L=>Math.hypot(L.x-x, L.y-y) < L.r+3)) continue;
    g.appendChild(el('circle', {cx:x, cy:y, r:(o.nucMin||3.1)+rnd()*((o.nucMax||4.2)-(o.nucMin||3.1)), fill:HE.nuc, opacity:0.9}));
  }
  return {cx, cy, rx, ry, lumens};
}
// One papillary frond/papilla: a stroma body, an optional core (fibrovascular line — PTC/
// bladderUC; hyaline blob — OCCC's own inline version), and a rim of nuclei whose STYLE is the
// per-cancer diagnostic variable: 'plain' (HGSOC's own right-skewed pleomorphism, LGSC's own
// narrow-band uniformity — same code path, different nucSize function), 'cleared' (PTC's
// Orphan-Annie clearing + optional groove), or 'columnar' (new: elongated, radially-aligned
// nuclei for pseudostratified epithelium — no existing generator needed this specific look).
// `disorder` (0 = one clean rim) stacks extra jittered layers, generalizing bladderUC's
// three-layer piled-up disorder. `radialJitter` staggers each cell's radial position, which
// combined with 'columnar' nuclei is what makes pseudostratification (nuclei at varying heights
// within ONE true layer) read as different from a disordered multi-layer pile-up.
function drawFrond(g, rnd, f, opts){
  const o = opts || {};
  const rot = f.rot || 0;
  const d = blobPath(f.cx, f.cy, f.rx, f.ry, o.wobble != null ? o.wobble : 0.18, 16, rnd, rot);
  g.appendChild(el('path', {d, fill:o.stromaFill || HE.stroma, stroke:o.stromaStroke || HE.stromaLn, 'stroke-width':o.strokeWidth || 1.4}));
  if(o.core){
    const cosR = Math.cos(rot), sinR = Math.sin(rot);
    if(o.core.type === 'fibrovascular'){
      const L = f.rx*(o.core.length || 0.74);
      g.appendChild(el('line', {x1:f.cx-L*cosR, y1:f.cy-L*sinR, x2:f.cx+L*cosR, y2:f.cy+L*sinR, stroke:o.core.color || HE.vessel, 'stroke-width':o.core.width || 7, 'stroke-linecap':'round', opacity:0.85}));
      g.appendChild(el('line', {x1:f.cx-L*cosR, y1:f.cy-L*sinR, x2:f.cx+L*cosR, y2:f.cy+L*sinR, stroke:o.core.colorDark || HE.vesselDk, 'stroke-width':(o.core.width || 7)*0.31, 'stroke-linecap':'round', opacity:0.7}));
    } else if(o.core.type === 'hyaline'){
      g.appendChild(el('path', {d:blobPath(f.cx, f.cy, f.rx*0.72, f.ry*0.66, 0.1, 10, rnd, rot), fill:o.core.color || '#e2a9bb', stroke:o.core.strokeColor || '#d093a8', 'stroke-width':1.4, opacity:0.95}));
    }
  }
  const per = Math.round(2*Math.PI*Math.sqrt((f.rx*f.rx+f.ry*f.ry)/2) / (o.rimSpacing || 13));
  const layers = 1 + (o.disorder || 0);
  const nucSize = o.nucSize || (()=>3+rnd()*rnd()*7);
  const rimCells = [];
  for(let layer=0; layer<layers; layer++){
    const layerCount = layers === 1 ? per : Math.max(4, per - layer*3);
    for(let i=0;i<layerCount;i++){
      const a = i/layerCount*Math.PI*2 + rnd()*(layers>1 ? 0.5 : 0);
      const base = layers === 1 ? 1 : (0.55 + layer*0.16 + (rnd()*2-1)*0.06);
      const rr = base * (1 + (rnd()*2-1)*(o.radialJitter || 0));
      const px = Math.cos(a)*f.rx*1.05*rr, py = Math.sin(a)*f.ry*1.12*rr;
      const x = f.cx + px*Math.cos(rot) - py*Math.sin(rot) + (layers>1 ? (rnd()*2-1)*6 : 0);
      const y = f.cy + px*Math.sin(rot) + py*Math.cos(rot) + (layers>1 ? (rnd()*2-1)*6 : 0);
      const nr = nucSize(rnd);
      if(o.nucStyle === 'cleared'){
        const rotDeg = rnd()*180;
        g.appendChild(el('ellipse', {cx:x, cy:y, rx:nr, ry:nr*(0.62+rnd()*0.22), transform:`rotate(${rotDeg.toFixed(0)} ${x} ${y})`, fill:o.clearFill || HE.clear, stroke:o.nucStroke || HE.nuc, 'stroke-width':1.9, opacity:0.95}));
        if(rnd() < (o.grooveProb || 0)) g.appendChild(el('line', {x1:x-nr*0.55, y1:y, x2:x+nr*0.55, y2:y, transform:`rotate(${rotDeg.toFixed(0)} ${x} ${y})`, stroke:o.nucStroke || HE.nuc, 'stroke-width':1.1, opacity:0.8}));
      } else if(o.nucStyle === 'columnar'){
        const alignDeg = a*180/Math.PI + 90;
        g.appendChild(el('ellipse', {cx:x, cy:y, rx:nr*0.5, ry:nr*1.35, transform:`rotate(${alignDeg.toFixed(0)} ${x} ${y})`, fill:o.nucFill || HE.nuc, opacity:0.92}));
      } else {
        drawCell(g, x, y, 0, nr, rnd, {nucFill: layers>1 && rnd()<0.4 ? HE.nucDark : (o.nucFill || HE.nuc)});
      }
      rimCells.push({x, y});
    }
  }
  return {rimCells};
}
// A small-cell/neuroendocrine field — item 2's third family, built the same way the first two
// were: none of the nineteen shipped generators draw this morphology yet, so there was no
// existing pattern to extract, only a real source to build from. Two cited, quantified features
// drive the design: NUCLEAR MOULDING in 95% of small cell carcinomas (35/37) — adjacent nuclei
// deform against each other rather than staying independently round — and the LACK OF PROMINENT
// NUCLEOLI as the one feature specific to small cell carcinoma among neuroendocrine tumors
// (p=0.004) — Ng & Li, Ann Diagn Pathol, 2024, PMID 39342665. Cells are drawn with NO cytoplasm
// ring at all (naked nuclei, 89%, same source) — the one existing primitive this deliberately
// does NOT reuse is `drawCell`, because drawCell always draws a cytoplasm ellipse first. Molding
// is a real per-cell computation, not a fixed visual trick: each nucleus checks its own nearest
// neighbour and, where one is close enough to plausibly be pressed against it, elongates and
// rotates to face it — cells with no close neighbour stay rounder, so the molded look emerges
// from local crowding the way it does in a real smear, not from a uniform stylistic squash.
function drawSmallCellSheet(g, rnd, cx, cy, rx, ry, opts){
  const o = opts || {};
  const d = blobPath(cx, cy, rx, ry, o.wobble != null ? o.wobble : 0.1, 14, rnd, o.rot || 0);
  g.appendChild(el('path', {d, fill:o.fill || HE.cytoLite, stroke:o.stroke || HE.cytoLn, 'stroke-width':o.strokeWidth || 1}));
  const spacing = o.spacing || 9;
  const cells = [];
  for(let gx=-rx; gx<=rx; gx+=spacing){
    for(let gy=-ry; gy<=ry; gy+=spacing){
      if((gx/rx)**2 + (gy/ry)**2 > 0.92) continue;
      cells.push({x:cx+gx+(rnd()*2-1)*2, y:cy+gy+(rnd()*2-1)*2, r:(o.nucMin||2.6)+rnd()*((o.nucMax||4)-(o.nucMin||2.6)), ry:0, ang:rnd()*180, molded:false});
    }
  }
  cells.forEach((c, i)=>{
    let nearest = null, nd = 1e9;
    for(let j=0;j<cells.length;j++){
      if(j===i) continue;
      const dist = Math.hypot(cells[j].x-c.x, cells[j].y-c.y);
      if(dist < nd){ nd = dist; nearest = cells[j]; }
    }
    if(nearest && nd < spacing*(o.moldingReach || 1.3)){
      c.ang = Math.atan2(nearest.y-c.y, nearest.x-c.x)*180/Math.PI;
      c.ry = c.r*(0.5+rnd()*0.15);
      c.molded = true;
    } else {
      c.ry = c.r*(0.82+rnd()*0.15);
    }
  });
  cells.forEach(c=>{
    g.appendChild(el('ellipse', {cx:c.x, cy:c.y, rx:c.r, ry:c.ry, transform:`rotate(${c.ang.toFixed(0)} ${c.x} ${c.y})`, fill:o.nucFill || HE.nucDark, opacity:0.94}));
  });
  return {cx, cy, rx, ry, cells};
}

// A short, roughly-linear row of small discohesive cells — "single-file"/"indian-file"
// infiltration, the real, cited architecture of any CDH1/E-cadherin-loss-driven discohesive
// carcinoma (gastric diffuse-type; invasive lobular breast carcinoma — both cite the same
// mechanism independently, checked directly at each organ's own source rather than assumed to
// transfer). EXTRACTED (2026-09-13, breast ILC pass) from what was previously inline,
// single-consumer code in genGDiffuse — the discohesion/single-file family's second real
// consumer, following this project's own "extract a shared primitive the moment a second real
// consumer appears" discipline (the same one that produced drawSmallCellSheet for the
// neuroendocrine family). genGDiffuse's own call site is unchanged in output: same five cells,
// same 17px spacing, same nucOffset — this is a pure refactor, not a redesign.
function drawSingleFileCord(g, x0, y0, angle, rnd, opts){
  const o = opts || {};
  const count = o.count || 5, spacing = o.spacing || 17;
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  for(let k=0;k<count;k++){
    const x = x0 + cosA*k*spacing, y = y0 + sinA*k*spacing;
    if(o.skipIf && o.skipIf(x, y)) continue;
    drawCell(g, x, y, o.cytoR||6, o.nucR||3.4+rnd()*(o.nucRJitter!=null?o.nucRJitter:1), rnd, {nucOffset:o.nucOffset!=null?o.nucOffset:1.5});
  }
}

// ------------------------------------------------------------
// Per-cancer generators. Each draws into <g> and returns label anchor points {key,x,y} in
// viewBox coordinates; keys must match the cancer's histology.features[].key.
// ------------------------------------------------------------

function genHGSOC(g, rnd){
  // Papillary fronds separated by slit-like spaces (the spaces form where papillae fuse —
  // PathologyOutlines' own HGSOC signature); rim nuclei drawn at deliberately unequal sizes
  // (the verified ">3x variation" pleomorphism criterion); psammoma bodies, sparingly.
  // NOTE deliberately absent: no "fibrovascular core" vessel is drawn — verification found
  // that phrase attached to LOW-grade serous and endometrial serous descriptions, not to
  // HGSOC's own microscopic description, so the fronds are plain stroma-cored papillae here.
  const fronds = [
    {cx:250, cy:160, rx:180, ry:52, rot:-0.25},
    {cx:545, cy:170, rx:150, ry:46, rot: 0.35},
    {cx:390, cy:365, rx:200, ry:56, rot:-0.06},
  ];
  fronds.forEach(f=>{
    const d = blobPath(f.cx, f.cy, f.rx, f.ry, 0.18, 16, rnd, f.rot);
    g.appendChild(el('path', {d, fill:HE.stroma, stroke:HE.stromaLn, 'stroke-width':1.4}));
    // pleomorphic epithelial rim: nucleus size varies ~3x along the same frond
    const per = Math.round(2*Math.PI*Math.sqrt((f.rx*f.rx+f.ry*f.ry)/2) / 13);
    for(let i=0;i<per;i++){
      const a = i/per*Math.PI*2;
      const px = Math.cos(a)*f.rx*1.06, py = Math.sin(a)*f.ry*1.12;
      const x = f.cx + px*Math.cos(f.rot) - py*Math.sin(f.rot);
      const y = f.cy + px*Math.sin(f.rot) + py*Math.cos(f.rot);
      const nr = 3 + rnd()*rnd()*7; // right-skewed: most small-mid, occasional huge atypical
      drawCell(g, x, y, 0, nr, rnd, {});
    }
  });
  // psammoma bodies: concentric lamellated calcified spherules
  [{x:672, y:352, r:17},{x:128, y:400, r:12}].forEach(p=>{
    for(let r=p.r; r>2; r-=p.r/3.4){
      g.appendChild(el('circle', {cx:p.x, cy:p.y, r:r, fill:'none', stroke:'#8f76a8', 'stroke-width':2.2, opacity:0.9}));
    }
  });
  return [
    {key:'papillae',     x:250, y:160},
    {key:'pleomorphism', x:568, y:118},
    {key:'psammoma',     x:672, y:352},
  ];
}

function genTNBC(g, rnd){
  // Solid sheets, no gland formation; a geographic necrosis zone; TILs — small dark
  // lymphocytes threaded between the far larger tumor cells.
  const necro = {cx:590, cy:140, rx:165, ry:105};
  const inNecro = (x,y)=>((x-necro.cx)/(necro.rx+22))**2 + ((y-necro.cy)/(necro.ry+22))**2 < 1;
  for(let gx=30; gx<VB.w-15; gx+=36){
    for(let gy=30; gy<VB.h-15; gy+=34){
      const x = gx + (rnd()*2-1)*9, y = gy + (rnd()*2-1)*9;
      if(inNecro(x,y)) continue;
      drawCell(g, x, y, 15, 6+rnd()*6.5, rnd, {nucOffset:3});
    }
  }
  necrosisBlob(g, necro.cx, necro.cy, necro.rx, necro.ry, rnd, 0.15);
  // ghost outlines — dead cells that kept their shape and lost their nuclei
  for(let i=0;i<9;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.75;
    g.appendChild(el('circle', {cx:necro.cx+Math.cos(a)*necro.rx*r, cy:necro.cy+Math.sin(a)*necro.ry*r, r:9+rnd()*5, fill:'none', stroke:HE.debris, 'stroke-width':1.4, opacity:0.75}));
  }
  // TILs: clustered small dark round cells between tumor cells
  [{x:200,y:390},{x:430,y:330},{x:130,y:180}].forEach(c=>{
    for(let i=0;i<12;i++){
      const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*46;
      g.appendChild(el('circle', {cx:c.x+Math.cos(a)*r, cy:c.y+Math.sin(a)*r, r:3.1+rnd()*0.9, fill:HE.lymph}));
    }
  });
  return [
    {key:'sheets',   x:300, y:120},
    {key:'necrosis', x:590, y:140},
    {key:'tils',     x:200, y:390},
  ];
}

function genIDC(g, rnd){
  // Invasive ductal carcinoma, no special type — deliberately the OPPOSITE end of the grading
  // spectrum from this organ's own TNBC slide (solid sheets, geographic necrosis, high TIL
  // density — the basal-like, grade-3 end). IDC-NST's real architecture is heterogeneous by
  // definition (it is the residual category once every named special type is excluded — WHO
  // 6th ed., 2026, PMID 42011085, describes it plainly as "irregular neoplastic glands and
  // trabeculae that infiltrate the breast parenchyma"), graded on the Nottingham axis — tubule/
  // gland formation, nuclear pleomorphism, mitotic count (Elston & Ellis, Histopathology, 1991,
  // PMID 1757079) — so the drawn field sits at moderate grade, WITH real (if irregular, variably
  // formed) gland structures, no necrosis, no TIL band: the honest visual contrast is "structured
  // but irregular" against TNBC's "solid and necrotic," not a second version of the same look.
  const glands = [];
  let attempts = 0;
  while(glands.length < 9 && attempts < 700){
    attempts++;
    const x = 60+rnd()*(VB.w-120), y = 55+rnd()*(VB.h-110), r = 16+rnd()*20;
    if(glands.some(gl=>Math.hypot(gl.x-x, gl.y-y) < gl.r+r+24)) continue;
    glands.push({x, y, r});
  }
  // irregular gland formation: real, variably-formed lumens — some round, some distorted/
  // angulated — never the clean, evenly-spaced rings a well-differentiated gland-forming
  // cancer (e.g. this organ's own future well-formed-gland entries) would show.
  glands.forEach(gl=>{
    const irregular = rnd() < 0.4;
    if(irregular){
      g.appendChild(el('path', {d:blobPath(gl.x, gl.y, gl.r+9, gl.r*0.7+7, 0.32, 9, rnd, rnd()*Math.PI), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1}));
      g.appendChild(el('path', {d:blobPath(gl.x, gl.y, gl.r*0.55, gl.r*0.4, 0.3, 8, rnd, rnd()*Math.PI), fill:HE.bg}));
      const n = Math.max(6, Math.round(gl.r*0.5));
      for(let i=0;i<n;i++){
        const a = i/n*Math.PI*2 + rnd()*0.25, rr = gl.r*0.62+rnd()*4;
        g.appendChild(el('circle', {cx:gl.x+Math.cos(a)*rr, cy:gl.y+Math.sin(a)*rr*0.75, r:3.4+rnd()*1.4, fill:HE.nuc, opacity:0.9}));
      }
    } else {
      drawGlandRing(g, gl.x, gl.y, gl.r*0.6, rnd, {cellR:gl.r*0.42, nucMin:3.6, nucMax:5.2});
    }
  });
  // trabecular cords: solid, multi-cell-wide strands infiltrating BETWEEN the glands — wider
  // and less strictly linear than a true single-file cord (that architecture is this atlas's
  // discohesion/single-file family, reserved for CDH1-loss-driven carcinomas — see genILC below
  // and js/organs/breast.js's own trunk notes for why IDC-NST, which retains CDH1, does not
  // draw that pattern).
  for(let t=0;t<7;t++){
    const x0 = 40+rnd()*(VB.w-80), y0 = 40+rnd()*(VB.h-80), ang = rnd()*Math.PI*2, len = 60+rnd()*70;
    const perp = ang+Math.PI/2;
    for(let k=0;k<Math.round(len/16);k++){
      const cx = x0+Math.cos(ang)*k*16, cy = y0+Math.sin(ang)*k*16;
      if(glands.some(gl=>Math.hypot(gl.x-cx, gl.y-cy) < gl.r+14)) continue;
      // two-to-three cells wide across the cord, not single-file
      const width = 2+Math.round(rnd());
      for(let w=0; w<width; w++){
        const off = (w-(width-1)/2)*7;
        const px = cx+Math.cos(perp)*off, py = cy+Math.sin(perp)*off;
        // real nuclear pleomorphism: size/shape vary tumor-cell to tumor-cell, not uniform
        drawCell(g, px, py, 6.5, 3.2+rnd()*3.4, rnd, {nucOffset:2});
      }
    }
  }
  return [
    {key:'glands',      x:glands[0] ? glands[0].x : 200, y:glands[0] ? glands[0].y : 150},
    {key:'trabeculae',  x:120, y:420},
    {key:'pleomorphism',x:600, y:380},
  ];
}

function genILC(g, rnd){
  // Invasive lobular carcinoma — the discohesion/single-file family's SECOND real consumer
  // (after gastric diffuse-type adenocarcinoma), both citing the identical mechanism
  // independently: CDH1/E-cadherin loss removes cell-cell adhesion, so tumor cells cannot form
  // glands and instead infiltrate as single files or loose sheets of discohesive cells
  // (Ciriello et al., Cell, 2015, PMID 26451490 — CDH1 alterations in 95% of ILC by DNA+RNA;
  // StatPearls, Handelsman & Tomlinson-Hansen, NBK554578). PARTIAL REUSE, STATED HONESTLY: the
  // single-file cord itself (drawSingleFileCord, above) is a direct, zero-new-code reuse of the
  // primitive genGDiffuse's own field already needed — but ILC's own classically-described
  // TARGETOID pattern (single-file cords wrapping CONCENTRICALLY around a residual normal duct,
  // PathologyOutlines' own sample-report language: "Targetoid pattern is noted") has no analogue
  // in gastric diffuse-type's field, which infiltrates loose stroma with no duct to wrap around.
  // That one element — a residual duct plus cords radiating from it — is genuinely new drawing
  // code; report this as PARTIAL family reuse, not the zero-new-code result SCLC's own pass
  // confirmed for the neuroendocrine family, and not "entirely new" either.
  const duct = { x: VB.w*0.42, y: VB.h*0.46, r: 46 };
  drawGlandRing(g, duct.x, duct.y, duct.r, rnd, {cellR:11, nucMin:4, nucMax:5.4});
  // targetoid cords: short single-file strands radiating outward from the duct at varying
  // angles, each starting just outside the duct's own cell ring
  const targetoidCount = 10;
  for(let i=0;i<targetoidCount;i++){
    const a = i/targetoidCount*Math.PI*2 + rnd()*0.15;
    const x0 = duct.x+Math.cos(a)*(duct.r+16), y0 = duct.y+Math.sin(a)*(duct.r+16);
    drawSingleFileCord(g, x0, y0, a, rnd, {count:3+Math.round(rnd()*2), spacing:15, cytoR:5.5, nucRJitter:0.8, nucOffset:1.2});
  }
  // free-field single-file cords, well away from the duct — the ordinary infiltrative pattern,
  // not the targetoid special case
  for(let f=0;f<5;f++){
    let x0, y0, tries=0;
    do{ x0 = 40+rnd()*(VB.w-80); y0 = 40+rnd()*(VB.h-80); tries++; }
    while(Math.hypot(x0-duct.x, y0-duct.y) < duct.r+90 && tries<20);
    drawSingleFileCord(g, x0, y0, rnd()*Math.PI*2, rnd, {count:4+Math.round(rnd()*2), spacing:16, cytoR:6, nucRJitter:1, nucOffset:1.4});
  }
  // loosely dispersed individual discohesive cells — "small cells that lack cohesion and are
  // often dispersed individually within fibrous connective tissue" (StatPearls) — small, round-
  // to-oval, minimal pleomorphism (real, cited feature: "little to no nuclear atypia and low
  // proliferation activity"), unlike IDC-NST's own varied-nucleus field above.
  for(let i=0;i<55;i++){
    const x = 20+rnd()*(VB.w-40), y = 20+rnd()*(VB.h-40);
    if(Math.hypot(x-duct.x, y-duct.y) < duct.r+14) continue;
    drawCell(g, x, y, 5.4, 3.1+rnd()*0.6, rnd, {nucOffset:0.8});
  }
  return [
    {key:'targetoid',    x:duct.x, y:duct.y},
    {key:'singlefile',   x:80, y:60},
    {key:'discohesion',  x:650, y:430},
  ];
}

function genLUAD(g, rnd){
  // Three of the five WHO patterns as labeled zones — real tumors are heterogeneous
  // mixtures classified by predominant pattern, so a multi-pattern field is the honest
  // rendering, not a compromise (see the data block's citation).
  // Zone 1 (left): ACINAR — discrete round glands with open lumens.
  const glandSpots = [{x:105,y:95,r:22},{x:200,y:150,r:17},{x:95,y:230,r:26},{x:205,y:300,r:20},{x:110,y:385,r:16},{x:215,y:430,r:23}];
  glandSpots.forEach(s=>drawGlandRing(g, s.x, s.y, s.r, rnd, {}));
  // Zone 2 (middle): LEPIDIC — tumor cells riding along intact alveolar walls, airspaces kept.
  const septa = [
    'M300 60 Q380 110 350 210 Q330 300 400 340 Q470 380 430 460',
    'M420 50 Q400 140 470 180 Q540 215 500 300 Q470 370 520 450',
    'M300 250 Q350 260 360 330 Q368 400 310 440',
  ];
  septa.forEach(d=>{
    g.appendChild(el('path', {d, fill:'none', stroke:HE.stroma, 'stroke-width':10, 'stroke-linecap':'round'}));
    g.appendChild(el('path', {d, fill:'none', stroke:HE.stromaLn, 'stroke-width':1, opacity:0.6}));
  });
  // nuclei studding the septal walls — hand-placed along each drawn curve (getTotalLength
  // can't be used before the SVG is mounted, and three fixed curves don't justify mounting
  // early just to sample them)
  const septalNuclei = [
    [300,60],[345,95],[362,140],[352,190],[338,245],[345,295],[372,325],[412,348],[438,395],[430,445],
    [420,50],[408,105],[425,150],[462,175],[505,200],[520,250],[505,290],[482,330],[478,382],[512,435],
    [300,250],[332,258],[352,290],[360,330],[362,375],[338,415],[312,438],
  ];
  septalNuclei.forEach(p=>{
    g.appendChild(el('circle', {cx:p[0]+(rnd()*2-1)*4, cy:p[1]+(rnd()*2-1)*4, r:3.6+rnd()*1.4, fill:HE.nuc, opacity:0.92}));
  });
  // Zone 3 (right): SOLID — sheets with no recognizable pattern.
  g.appendChild(el('path', {d:blobPath(672, 250, 118, 205, 0.14, 14, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  for(let i=0;i<95;i++){
    const x = 585 + rnd()*185, y = 60 + rnd()*385;
    if(((x-672)/125)**2 + ((y-250)/210)**2 > 1) continue;
    drawCell(g, x, y, 0, 5.5+rnd()*4.5, rnd, {});
  }
  return [
    {key:'acinar',  x:105, y:95},
    {key:'lepidic', x:415, y:210},
    {key:'solid',   x:672, y:300},
  ];
}

// Lung squamous cell carcinoma (LUSC) — two zones, both real diagnostic architecture rather
// than one compromise field: keratinizing (left, keratin pearls embedded in a solid sheet) and
// non-keratinizing (right, intercellular bridges between tightly packed polygonal cells) — the
// two of the WHO 2015 scheme's three variants (keratinizing/non-keratinizing/basaloid) that have
// a real, drawable positive architecture; basaloid is named in the data block's own text but not
// drawn, the same "name the other patterns, draw the clearest ones" treatment LUAD's own lepidic/
// acinar/solid choice already established. Citations: see HISTOLOGY_LUSC in js/organs/lungs.js.
function genLUSC(g, rnd){
  // Zone 1: KERATINIZING — a solid sheet of squamous cells (angular, more cytoplasm than a
  // typical adenocarcinoma cell) with three keratin pearls of varying size embedded in it.
  const sheetA = {cx:210, cy:250, rx:190, ry:200};
  g.appendChild(el('path', {d:blobPath(sheetA.cx, sheetA.cy, sheetA.rx, sheetA.ry, 0.12, 14, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  const pearls = [{x:150, y:170, r:38}, {x:255, y:290, r:46}, {x:150, y:355, r:30}];
  for(let i=0;i<70;i++){
    const x = sheetA.cx-sheetA.rx+rnd()*sheetA.rx*2, y = sheetA.cy-sheetA.ry+rnd()*sheetA.ry*2;
    if(((x-sheetA.cx)/sheetA.rx)**2 + ((y-sheetA.cy)/sheetA.ry)**2 > 0.92) continue;
    if(pearls.some(p=>Math.hypot(x-p.x, y-p.y) < p.r*1.15)) continue; // keep cells off the pearls themselves
    drawCell(g, x, y, 6.5+rnd()*2, 4.5+rnd()*2.2, rnd, {nucOffset:2});
  }
  pearls.forEach(p=>drawKeratinPearl(g, p.x, p.y, p.r, rnd));

  // Zone 2: NON-KERATINIZING — tightly packed polygonal cells with intercellular bridges: short
  // connecting lines between adjacent cell membranes (the desmosomal "spiny" appearance real
  // pathology text describes), drawn between any two cells close enough to plausibly touch.
  const sheetB = {cx:600, cy:250, rx:165, ry:200};
  g.appendChild(el('path', {d:blobPath(sheetB.cx, sheetB.cy, sheetB.rx, sheetB.ry, 0.12, 14, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  const bridgeCells = [];
  for(let gx=-sheetB.rx; gx<=sheetB.rx; gx+=17){
    for(let gy=-sheetB.ry; gy<=sheetB.ry; gy+=17){
      if((gx/sheetB.rx)**2 + (gy/sheetB.ry)**2 > 0.88) continue;
      bridgeCells.push({x:sheetB.cx+gx+(rnd()*2-1)*3, y:sheetB.cy+gy+(rnd()*2-1)*3});
    }
  }
  bridgeCells.forEach((c, i)=>{
    for(let j=i+1;j<bridgeCells.length;j++){
      const d = Math.hypot(bridgeCells[j].x-c.x, bridgeCells[j].y-c.y);
      if(d < 19) g.appendChild(el('line', {x1:c.x, y1:c.y, x2:bridgeCells[j].x, y2:bridgeCells[j].y, stroke:HE.cytoLn, 'stroke-width':1.1, opacity:0.75}));
    }
  });
  bridgeCells.forEach(c=>drawCell(g, c.x, c.y, 7, 4.3+rnd()*1.8, rnd, {nucOffset:1.5}));

  return [
    {key:'pearl',    x:255, y:290},
    {key:'bridges',  x:600, y:250},
  ];
}

function genCCRCC(g, rnd){
  // Nests of optically clear cells wrapped in a delicate branching capillary network.
  const nests = [
    {cx:140,cy:120,rx:95,ry:75},{cx:360,cy:105,rx:100,ry:68},{cx:590,cy:120,rx:105,ry:80},
    {cx:130,cy:330,rx:90,ry:82},{cx:365,cy:322,rx:110,ry:88},{cx:610,cy:345,rx:100,ry:85},
    {cx:250,cy:222,rx:62,ry:44},{cx:492,cy:222,rx:60,ry:42},
  ];
  nests.forEach(nst=>{
    const d = blobPath(nst.cx, nst.cy, nst.rx, nst.ry, 0.14, 12, rnd, rnd()*0.6);
    g.appendChild(el('path', {d, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1}));
    // the encasing capillary — re-stroking the nest border in vessel red is what produces
    // the classic delicate-network look between nests
    g.appendChild(el('path', {d, fill:'none', stroke:HE.vessel, 'stroke-width':2.1, opacity:0.8}));
    // clear cells: crisp borders, empty-looking cytoplasm, small round nuclei
    const cols = Math.floor(nst.rx/16), rows = Math.floor(nst.ry/16);
    for(let i=-cols;i<=cols;i++){
      for(let j=-rows;j<=rows;j++){
        const x = nst.cx + i*15 + (rnd()*2-1)*3.5, y = nst.cy + j*15 + (rnd()*2-1)*3.5;
        if(((x-nst.cx)/(nst.rx*0.88))**2 + ((y-nst.cy)/(nst.ry*0.88))**2 > 1) continue;
        g.appendChild(el('circle', {cx:x, cy:y, r:8.6+rnd()*2.6, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1.2}));
        g.appendChild(el('circle', {cx:x+(rnd()*2-1)*3, cy:y+(rnd()*2-1)*3, r:2.6+rnd()*0.9, fill:HE.nuc, opacity:0.9}));
      }
    }
  });
  return [
    {key:'clearcells', x:365, y:322},
    {key:'nests',      x:590, y:120},
    {key:'vessels',    x:250, y:170},
  ];
}

// Papillary RCC — true papillae with a real fibrovascular core (Delahunt & Eble, Mod Pathol,
// 1997, PMID 9195569), foamy macrophages within the cores (frequent in the Type 1 form),
// psammoma bodies. Reuses drawFrond's fibrovascular-core family primitive verbatim (zero new
// frond-drawing code — small nucSize gives the Type 1 small-oval-nuclei look) and
// drawPsammomaBody outright; the foamy-macrophage cluster is the one genuinely new visual this
// entity needed — checked directly against every existing primitive first, nothing draws a
// pale, bubbly-textured lipid-laden cell.
function genPRCC(g, rnd){
  const fronds = [
    { cx:200, cy:160, rx:150, ry:40, rot:-0.18 },
    { cx:520, cy:140, rx:160, ry:38, rot: 0.28 },
    { cx:360, cy:370, rx:190, ry:44, rot:-0.05 },
  ];
  fronds.forEach(f=>{
    drawFrond(g, rnd, f, {
      core: { type:'fibrovascular', length:0.72, width:6 },
      rimSpacing: 11,
      nucSize: ()=>2.6+rnd()*1.6,
    });
  });
  const foamyClusters = [ {x:200,y:160}, {x:520,y:140}, {x:360,y:370} ];
  foamyClusters.forEach(c=>{
    for(let i=0;i<6;i++){
      const a = rnd()*Math.PI*2, r = 14+rnd()*20;
      const x = c.x+Math.cos(a)*r, y = c.y+Math.sin(a)*r*0.5;
      g.appendChild(el('circle', {cx:x, cy:y, r:6.5+rnd()*2, fill:'#e8d9ad', stroke:'#c9b276', 'stroke-width':1, opacity:0.9}));
      for(let k=0;k<3;k++){
        const ba = rnd()*Math.PI*2, br = rnd()*3.5;
        g.appendChild(el('circle', {cx:x+Math.cos(ba)*br, cy:y+Math.sin(ba)*br, r:1.1+rnd()*0.8, fill:'#f7edc9', opacity:0.85}));
      }
      g.appendChild(el('circle', {cx:x+(rnd()*2-1)*2, cy:y+(rnd()*2-1)*2, r:2, fill:HE.nucDark, opacity:0.9}));
    }
  });
  [{x:120,y:280,r:15},{x:600,y:300,r:12}].forEach(p=>drawPsammomaBody(g, p.x, p.y, p.r));
  return [
    {key:'papillae', x:360, y:370},
    {key:'foamy',    x:200, y:170},
    {key:'psammoma', x:600, y:300},
  ];
}

// Chromophobe RCC — solid sheets of large, pale, finely textured cells with an unusually thick
// membrane, small wrinkled ("raisinoid") nuclei inside a clear perinuclear halo (Marko et al.,
// Radiographics, 2021, PMID 34388049; Davis et al., Cancer Cell, 2014, PMID 25155756). The
// wrinkled nucleus reuses blobPath's own organic-wobble technique at a small radius (no new
// shared primitive); the halo reuses the same clear-ring-around-a-nucleus idea melanoma's
// pagetoid-spread cells already use.
function genCHRCC(g, rnd){
  const sheets = [ {cx:230, cy:200, rx:170, ry:140}, {cx:560, cy:300, rx:160, ry:130} ];
  sheets.forEach(s=>{
    g.appendChild(el('path', {d:blobPath(s.cx, s.cy, s.rx, s.ry, 0.12, 14, rnd, rnd()*0.5), fill:'#f2ecd8', stroke:'#cdbf98', 'stroke-width':1.4}));
    const cols = Math.floor(s.rx/17), rows = Math.floor(s.ry/17);
    for(let i=-cols;i<=cols;i++){
      for(let j=-rows;j<=rows;j++){
        const x = s.cx + i*17 + (rnd()*2-1)*3, y = s.cy + j*17 + (rnd()*2-1)*3;
        if(((x-s.cx)/(s.rx*0.9))**2 + ((y-s.cy)/(s.ry*0.9))**2 > 1) continue;
        g.appendChild(el('circle', {cx:x, cy:y, r:9.2, fill:'#e6ddc0', stroke:'#5a4c30', 'stroke-width':2.2, opacity:0.95}));
        for(let k=0;k<4;k++){
          const ba = rnd()*Math.PI*2, br = rnd()*6.5;
          g.appendChild(el('circle', {cx:x+Math.cos(ba)*br, cy:y+Math.sin(ba)*br, r:0.7+rnd()*0.5, fill:'#d8cca0', opacity:0.55}));
        }
        const nx = x+(rnd()*2-1)*2.4, ny = y+(rnd()*2-1)*2.4;
        g.appendChild(el('circle', {cx:nx, cy:ny, r:4.4, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':0.8}));
        g.appendChild(el('path', {d:blobPath(nx, ny, 2.6, 2.6, 0.35, 7, rnd, rnd()*Math.PI), fill:HE.nucDark, opacity:0.95}));
      }
    }
  });
  return [
    {key:'reticulated', x:230, y:200},
    {key:'membranes',   x:560, y:220},
    {key:'raisinoid',   x:560, y:340},
  ];
}

function genHCC(g, rnd){
  // Trabecular pattern: cords of polygonal tumor hepatocytes several cells thick,
  // separated by sinusoid-like spaces with sparse flat endothelial nuclei.
  const bands = [
    {y0:70,  amp:16, thick:74},
    {y0:185, amp:22, thick:88},
    {y0:315, amp:18, thick:80},
    {y0:435, amp:14, thick:64},
  ];
  bands.forEach(b=>{
    let d = '';
    const pts = [];
    for(let x=-30; x<=VB.w+30; x+=55){
      pts.push([x, b.y0 + Math.sin(x/95 + b.y0)*b.amp + (rnd()*2-1)*6]);
    }
    d = 'M'+pts[0][0]+' '+pts[0][1];
    for(let i=1;i<pts.length;i++){
      const p = pts[i-1], q = pts[i];
      d += ` Q ${(p[0]+q[0])/2} ${p[1]} ${q[0]} ${q[1]}`;
    }
    g.appendChild(el('path', {d, fill:'none', stroke:HE.cytoLite, 'stroke-width':b.thick, 'stroke-linecap':'round'}));
    // tumor hepatocytes: polygonal, eosinophilic, round central nuclei — a few rows thick
    const rows = Math.floor(b.thick/26);
    for(let x=14; x<VB.w-8; x+=27){
      const midY = b.y0 + Math.sin(x/95 + b.y0)*b.amp;
      for(let r2=-(rows-1)/2; r2<=(rows-1)/2; r2+=1){
        const y = midY + r2*24 + (rnd()*2-1)*4;
        drawCell(g, x + (rnd()*2-1)*5, y, 13, 5.4+rnd()*1.8, rnd, {cytoOpacity:0.95});
      }
    }
    // endothelium lining the plate edges: sparse flattened slivers at the band border
    for(let x=30; x<VB.w-10; x+=85+rnd()*40){
      const midY = b.y0 + Math.sin(x/95 + b.y0)*b.amp;
      [-1,1].forEach(s=>{
        g.appendChild(el('ellipse', {cx:x, cy:midY+s*(b.thick/2+3), rx:5, ry:1.4, fill:HE.nucDark, opacity:0.75}));
      });
    }
  });
  // a few red cells drifting in the sinusoid gaps
  for(let i=0;i<14;i++){
    const x = 30+rnd()*(VB.w-60);
    const gap = [128, 252, 378][Math.floor(rnd()*3)];
    g.appendChild(el('circle', {cx:x, cy:gap+(rnd()*2-1)*8, r:2.4, fill:HE.vessel, opacity:0.8}));
  }
  return [
    {key:'trabeculae', x:400, y:185},
    {key:'sinusoids',  x:190, y:255},
    {key:'hepatocytes',x:620, y:318},
  ];
}

// Intrahepatic cholangiocarcinoma — a real gland-forming adenocarcinoma with a dense
// desmoplastic stroma, genuinely different from genHCC above (no gland lumens there at all).
// ZERO NEW DRAWING CODE: this dispatches drawGlandRing (small-duct tubular/acinar pattern,
// little mucin — Banales et al., 2020) for the more common architecture, plus ONE drawFrond
// call with a fibrovascular core and columnar nuclei (large-duct, mucin-producing papillary
// pattern, same source) — the identical two-primitive combination genGInt already uses for its
// own tubular-glands-plus-one-papillary-frond composition, reused here rather than invented.
// The desmoplastic stroma background (sweeping collagen bands + spindle fibroblast nuclei) is
// the same recipe genPDAC and genCRC already use for their own cancer-associated-fibroblast-rich
// backgrounds (Affò et al., 2025; Ilyas & Gores, 2013).
function genICHOL(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.7}));
  for(let i=0;i<13;i++){
    const y = 10+rnd()*480;
    g.appendChild(el('path', {d:`M0 ${y} Q ${140+rnd()*200} ${y+(rnd()*2-1)*40} ${420+rnd()*80} ${y+(rnd()*2-1)*30} T ${VB.w} ${y+(rnd()*2-1)*46}`, fill:'none', stroke:HE.stromaLn, 'stroke-width':2+rnd()*3, opacity:0.5}));
  }
  // cancer-associated fibroblasts: spindle-shaped nuclei scattered through the stroma
  for(let i=0;i<90;i++){
    const x = rnd()*VB.w, y = rnd()*VB.h;
    const ang = Math.sin(x/150)*20 + (rnd()*2-1)*24;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:6, ry:1.5, transform:`rotate(${ang.toFixed(0)} ${x} ${y})`, fill:HE.nucDark, opacity:0.5}));
  }
  // small-duct pattern: small, well-formed tubular/acinar glands, little mucin, scattered
  // haphazardly through the stroma — the more common of iCCA's two real architectures
  const glands = [
    {x:110, y:110, r:12}, {x:290, y:80,  r:10}, {x:150, y:280, r:13},
    {x:340, y:230, r:11}, {x:90,  y:410, r:12}, {x:280, y:400, r:10},
  ];
  glands.forEach(s=>{
    const gg = el('g', {transform:`rotate(${(rnd()*90-45).toFixed(0)} ${s.x} ${s.y})`});
    g.appendChild(gg);
    drawGlandRing(gg, s.x, s.y, s.r, rnd, {nucMin:2.8, nucMax:3.8});
  });
  // large-duct pattern: ONE mucin-producing papillary frond with a fibrovascular core —
  // the second real architecture (Banales et al., 2020's own small-duct/large-duct dichotomy),
  // sited apart from the small-duct cluster so both read as distinct zones
  const frond = {cx:610, cy:280, rx:88, ry:110, rot:-0.2};
  drawFrond(g, rnd, frond, {wobble:0.16, core:{type:'fibrovascular', length:0.72, width:7}, nucStyle:'columnar'});
  return [
    {key:'stroma',    x:400, y:80},
    {key:'smallduct', x:glands[2].x, y:glands[2].y - 34},
    {key:'largeduct', x:frond.cx, y:frond.cy - frond.ry - 20},
  ];
}

function genGBM(g, rnd){
  // Hypercellular tumor; a serpentine necrotic corridor whose borders are rimmed by
  // densely packed, radially oriented nuclei (pseudopalisading); glomeruloid
  // microvascular proliferation tufts.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.cytoLite, opacity:0.4}));
  // the necrotic serpentine band across the middle
  const top = [], bot = [];
  for(let x=-20; x<=VB.w+20; x+=60){
    const mid = 250 + Math.sin(x/130)*58 + (rnd()*2-1)*10;
    const half = 34 + rnd()*14;
    top.push([x, mid-half]); bot.push([x, mid+half]);
  }
  let d = 'M'+top[0][0]+' '+top[0][1];
  for(let i=1;i<top.length;i++){ const p=top[i-1],q=top[i]; d += ` Q ${(p[0]+q[0])/2} ${p[1]} ${q[0]} ${q[1]}`; }
  for(let i=bot.length-1;i>0;i--){ const p=bot[i],q=bot[i-1]; d += ` L ${p[0]} ${p[1]} Q ${(p[0]+q[0])/2} ${p[1]} ${q[0]} ${q[1]}`; }
  d += ' Z';
  g.appendChild(el('path', {d, fill:HE.necro, stroke:HE.debris, 'stroke-width':1}));
  for(let i=0;i<70;i++){
    const x = rnd()*VB.w;
    const mid = 250 + Math.sin(x/130)*58;
    g.appendChild(el('circle', {cx:x, cy:mid+(rnd()*2-1)*26, r:0.9+rnd()*1.5, fill:HE.debris, opacity:0.7}));
  }
  // pseudopalisading rim: elongated nuclei stacked 2-3 deep, oriented ACROSS the border
  [top, bot].forEach((edge, side)=>{
    for(let i=0;i<edge.length-1;i++){
      const [x0,y0] = edge[i], [x1,y1] = edge[i+1];
      const seg = Math.hypot(x1-x0, y1-y0);
      const nx = -(y1-y0)/seg, ny = (x1-x0)/seg; // edge normal
      const outward = side===0 ? -1 : 1;
      for(let t=0; t<seg; t+=6.4){
        const bx = x0 + (x1-x0)*t/seg, by = y0 + (y1-y0)*t/seg;
        const depth = 1 + Math.floor(rnd()*2.4); // 1-3 nuclei stacked outward
        for(let k2=0;k2<depth;k2++){
          const dx = bx + nx*outward*(4 + k2*8.5) + (rnd()*2-1)*2;
          const dy = by + ny*outward*(4 + k2*8.5) + (rnd()*2-1)*2;
          const ang = Math.atan2(ny*outward, nx*outward)*180/Math.PI;
          g.appendChild(el('ellipse', {cx:dx, cy:dy, rx:5.4, ry:2, transform:`rotate(${ang.toFixed(0)} ${dx} ${dy})`, fill:HE.nucDark, opacity:0.92}));
        }
      }
    }
  });
  // hypercellular background tumor away from the band
  for(let i=0;i<330;i++){
    const x = rnd()*VB.w, y = rnd()*VB.h;
    const mid = 250 + Math.sin(x/130)*58;
    if(Math.abs(y-mid) < 78) continue;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:2.4+rnd()*2.4, ry:1.8+rnd()*2, transform:`rotate(${(rnd()*180).toFixed(0)} ${x} ${y})`, fill:HE.nuc, opacity:0.85}));
  }
  // glomeruloid microvascular proliferation: tufts of piled-up small vessels
  [{x:130,y:88},{x:648,y:428}].forEach(tv=>{
    g.appendChild(el('path', {d:blobPath(tv.x, tv.y, 34, 28, 0.2, 10, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
    for(let i=0;i<9;i++){
      const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*20;
      const vx = tv.x+Math.cos(a)*r, vy = tv.y+Math.sin(a)*r*0.8;
      g.appendChild(el('circle', {cx:vx, cy:vy, r:4.5+rnd()*3, fill:'none', stroke:HE.vessel, 'stroke-width':2.4}));
      g.appendChild(el('circle', {cx:vx, cy:vy, r:1.6, fill:HE.vessel, opacity:0.8}));
    }
  });
  return [
    {key:'palisading', x:330, y:196},
    // anchored BELOW the top-left tuft, not on it — a centered label would cover the very
    // structure it names (caught by screenshot, not assumed)
    {key:'mvp',        x:130, y:138},
    {key:'hypercell',  x:640, y:100},
  ];
}

// Astrocytoma, IDH-mutant — grade 3 depicted (real, WHO CNS5 middle ground of this entity's own
// grade 2-4 span, per StatPearls NBK559042): diffuse hypercellularity with real nuclear atypia,
// a focal zone of denser anaplasia, and scattered mitotic figures — deliberately NO necrosis and
// NO microvascular proliferation (this organ's own genGBM already draws those real grade-4
// criteria; this entity's own grade-4 route is disclosed in prose, including its real molecular-
// only route via CDKN2A/B deletion, rather than duplicated as a second slide).
function genASTRO(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.cytoLite, opacity:0.4}));
  // diffusely hypercellular background — pleomorphic nuclei, real varying size/shape (atypia)
  for(let i=0;i<260;i++){
    const x = rnd()*VB.w, y = rnd()*VB.h;
    const big = rnd()<0.3;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:(big?4.2:2.4)+rnd()*2.2, ry:(big?3.2:1.8)+rnd()*2,
      transform:`rotate(${(rnd()*180).toFixed(0)} ${x} ${y})`,
      fill: big ? HE.nucDark : HE.nuc, opacity:0.88 }));
  }
  // focal anaplasia — a denser, more disorganized cluster of atypical cells
  const fx = 560, fy = 300;
  g.appendChild(el('path', {d:blobPath(fx, fy, 120, 95, 0.22, 12, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1, opacity:0.55}));
  for(let i=0;i<90;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*100;
    const x = fx + Math.cos(a)*r*1.15, y = fy + Math.sin(a)*r*0.85;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:3+rnd()*3, ry:2.2+rnd()*3,
      transform:`rotate(${(rnd()*180).toFixed(0)} ${x} ${y})`, fill:HE.nucDark, opacity:0.9 }));
  }
  // scattered mitotic figures — a dividing nucleus depicted as two adjacent condensed masses
  const mitoses = [{x:180,y:130},{x:340,y:400},{x:670,y:110},{x:230,y:290}];
  mitoses.forEach(m=>{
    g.appendChild(el('ellipse', {cx:m.x-2.4, cy:m.y, rx:3.4, ry:2.6, fill:HE.nucDark, opacity:0.95}));
    g.appendChild(el('ellipse', {cx:m.x+2.4, cy:m.y, rx:3.4, ry:2.6, fill:HE.nucDark, opacity:0.95}));
  });
  return [
    {key:'atypia',    x:120, y:60},
    {key:'anaplasia', x:fx,  y:fy-110},
    {key:'mitoses',   x:230, y:340},
  ];
}

// Oligodendroglioma — "fried egg" cells (uniform round nuclei each surrounded by a distinct
// clear perinuclear halo, a formalin-fixation artifact per StatPearls NBK559184) and a "chicken
// wire" capillary network threading between them. Genuinely new drawing code: no existing
// primitive in this file draws a halo ring around each cell in a dense uniform sheet, or a
// branching capillary network of this shape. Reuses drawPsammomaBody verbatim for this entity's
// own real, commonly-identified calcifications.
function genODG(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.cytoLite, opacity:0.35}));
  for(let i=0;i<150;i++){
    const x = 40+rnd()*(VB.w-80), y = 40+rnd()*(VB.h-80);
    g.appendChild(el('circle', {cx:x, cy:y, r:11+rnd()*2, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1, opacity:0.75}));
    g.appendChild(el('circle', {cx:x, cy:y, r:4.6+rnd()*1, fill:HE.nuc, opacity:0.92}));
  }
  // "chicken wire" vasculature — a branching network of thin capillaries between the cells
  for(let i=0;i<5;i++){
    let x = rnd()*VB.w, y = rnd()*VB.h;
    let d = `M ${x.toFixed(0)} ${y.toFixed(0)}`;
    for(let s=0;s<8;s++){
      x = Math.max(20, Math.min(VB.w-20, x+(rnd()*2-1)*90));
      y = Math.max(20, Math.min(VB.h-20, y+(rnd()*2-1)*70));
      d += ` L ${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    g.appendChild(el('path', {d, fill:'none', stroke:HE.vessel, 'stroke-width':1.6, opacity:0.55}));
  }
  [{x:150,y:120,r:13},{x:610,y:370,r:11}].forEach(p=>drawPsammomaBody(g, p.x, p.y, p.r));
  return [
    {key:'friedegg',      x:300, y:250},
    {key:'chickenwire',   x:520, y:150},
    {key:'calcification', x:150, y:170},
  ];
}

// Meningioma — concentric whorls of meningothelial cells, syncytial sheets between them, and
// psammoma bodies mineralizing within some whorls (StatPearls, "Meningioma," NBK560538, verbatim:
// "whorls and syncytia of meningothelial cells... eventually mineralize, forming psammoma
// bodies"). Reuses drawWhorl (which itself reuses drawPsammomaBody verbatim) — a fundamentally
// different architecture from every glioma in this organ, matching this entity's own real,
// different cell of origin and growth pattern.
function genMENIN(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.cytoLite, opacity:0.35}));
  for(let i=0;i<150;i++){
    const x = rnd()*VB.w, y = rnd()*VB.h;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:5+rnd()*3, ry:3+rnd()*2, transform:`rotate(${(rnd()*180).toFixed(0)} ${x} ${y})`, fill:HE.cyto, opacity:0.5}));
  }
  const whorls = [{x:220,y:180,r:80,psammoma:true},{x:570,y:140,r:62,psammoma:false},{x:430,y:370,r:88,psammoma:true}];
  whorls.forEach(w=>drawWhorl(g, w.x, w.y, w.r, rnd, {psammoma:w.psammoma}));
  return [
    {key:'whorls',   x:220, y:70},
    {key:'psammoma', x:430, y:280},
    {key:'syncytia', x:670, y:420},
  ];
}

function genProstate(g, rnd){
  // The Gleason spectrum as labeled zones — real tumors genuinely contain multiple
  // coexisting patterns (the score is the sum of the two most prevalent ones), so a
  // single field showing 3 -> 4 -> 5 side by side is framed as the grading spectrum.
  // faint fibromuscular stroma texture
  for(let i=0;i<10;i++){
    const y = 30+rnd()*440;
    g.appendChild(el('path', {d:`M0 ${y} Q ${200+rnd()*100} ${y+(rnd()*2-1)*30} ${VB.w} ${y+(rnd()*2-1)*40}`, fill:'none', stroke:HE.stroma, 'stroke-width':4+rnd()*5, opacity:0.5}));
  }
  // Pattern 3 (left): discrete, well-formed, separate glands
  [{x:95,y:100,r:20},{x:190,y:150,r:15},{x:88,y:235,r:17},{x:185,y:295,r:21},{x:100,y:380,r:14},{x:200,y:430,r:17}].forEach(s=>{
    drawGlandRing(g, s.x, s.y, s.r, rnd, {nucMin:3, nucMax:4.2});
  });
  // Pattern 4 (middle): one large cribriform mass — a sheet punched through with lumens —
  // plus a short chain of fused glands
  const crib = {cx:405, cy:200, rx:105, ry:88};
  g.appendChild(el('path', {d:blobPath(crib.cx, crib.cy, crib.rx, crib.ry, 0.12, 12, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.2}));
  // The sieve has to READ as a sieve: the first cut of this drew 9 small lumens that the
  // label then sat on top of, leaving the mass looking near-solid — i.e. accidentally
  // depicting pattern 5 in the pattern-4 slot (caught by screenshot). Lumens are larger,
  // denser, and outlined now, and the label anchor moved off the mass to its lower edge.
  const lumens = [];
  let attempts = 0;
  while(lumens.length < 12 && attempts < 600){
    attempts++;
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.78;
    const lx = crib.cx+Math.cos(a)*crib.rx*r, ly = crib.cy+Math.sin(a)*crib.ry*r;
    const lr = 11+rnd()*6;
    if(lumens.some(L=>Math.hypot(L.x-lx,L.y-ly) < L.r+lr+4)) continue;
    lumens.push({x:lx,y:ly,r:lr});
  }
  lumens.forEach(L=>{
    g.appendChild(el('circle', {cx:L.x, cy:L.y, r:L.r, fill:HE.bg, stroke:HE.cytoLn, 'stroke-width':1}));
  });
  for(let i=0;i<55;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.9;
    const x = crib.cx+Math.cos(a)*crib.rx*r, y = crib.cy+Math.sin(a)*crib.ry*r;
    if(lumens.some(L=>Math.hypot(L.x-x,L.y-y) < L.r+3)) continue;
    g.appendChild(el('circle', {cx:x, cy:y, r:3.1+rnd()*1.1, fill:HE.nuc, opacity:0.9}));
  }
  // fused glands: rings sharing walls
  [[330,390],[370,410],[412,398],[450,418]].forEach((p,i)=>{
    drawGlandRing(g, p[0], p[1], 12+(i%2)*3, rnd, {nucMin:3, nucMax:4.4});
  });
  // Pattern 5 (right): solid sheet dissolving into single infiltrating cells
  g.appendChild(el('path', {d:blobPath(650, 170, 92, 105, 0.16, 12, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1}));
  for(let i=0;i<60;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.9;
    g.appendChild(el('circle', {cx:650+Math.cos(a)*90*r, cy:170+Math.sin(a)*100*r, r:3.4+rnd()*1.4, fill:HE.nuc, opacity:0.9}));
  }
  for(let i=0;i<26;i++){
    drawCell(g, 560+rnd()*210, 315+rnd()*150, 7.5, 3.6+rnd()*1.3, rnd, {});
  }
  return [
    {key:'p3', x:145, y:262},
    // below the cribriform mass, not centered on it — a centered label hid the lumens that
    // make pattern 4 legible as a sieve (caught by screenshot, same as GBM's mvp anchor)
    {key:'p4', x:405, y:310},
    {key:'p5', x:650, y:170},
  ];
}

function genCRC(g, rnd){
  // Colorectal adenocarcinoma: complex/cribriform glands, "dirty" necrosis INSIDE gland
  // lumens, desmoplastic stroma at the invasive edge. Two verification-driven constraints
  // shape this drawing (see colon.js's histology block for sources): (1) cribriform
  // architecture is a pattern of GLANDULAR DIFFERENTIATION here, not a high-grade marker —
  // WHO 6th ed. (2026) says so explicitly, the opposite of what prostate's pattern-4
  // cribriform connotes two generators up, so the intro text carries that distinction
  // rather than letting the two slides silently imply the same meaning; (2) dirty necrosis
  // is characteristic/suggestive of colorectal origin, NOT specific to it — framed that way
  // in the feature text, never as diagnostic.
  // faint loose stroma background
  for(let i=0;i<8;i++){
    const y = 20+rnd()*460;
    g.appendChild(el('path', {d:`M0 ${y} Q ${180+rnd()*160} ${y+(rnd()*2-1)*36} ${VB.w} ${y+(rnd()*2-1)*44}`, fill:'none', stroke:HE.stroma, 'stroke-width':3+rnd()*4, opacity:0.45}));
  }
  // Two large complex glands whose lumens hold dirty necrosis: ring of tall columnar tumor
  // cells around a lumen filled with granular eosinophilic debris + nuclear dust.
  const dirty = [{cx:250, cy:150, r:78}, {cx:565, cy:330, r:66}];
  dirty.forEach(dg=>{
    g.appendChild(el('path', {d:blobPath(dg.cx, dg.cy, dg.r+26, (dg.r+26)*0.88, 0.10, 14, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.3}));
    g.appendChild(el('path', {d:blobPath(dg.cx, dg.cy, dg.r, dg.r*0.85, 0.12, 12, rnd, 0), fill:HE.bg, stroke:HE.cytoLn, 'stroke-width':1}));
    // the "dirty" content: granular debris + karyorrhectic dust filling the lumen
    g.appendChild(el('path', {d:blobPath(dg.cx, dg.cy, dg.r*0.82, dg.r*0.68, 0.22, 12, rnd, 0.4), fill:HE.necro, opacity:0.95}));
    for(let i=0;i<Math.round(dg.r*0.85);i++){
      const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*dg.r*0.72;
      g.appendChild(el('circle', {cx:dg.cx+Math.cos(a)*r, cy:dg.cy+Math.sin(a)*r*0.8, r:0.9+rnd()*1.7, fill:HE.debris, opacity:0.75}));
    }
    // tall columnar rim cells: elongated nuclei oriented radially (polarity partly lost —
    // a few deliberately skewed off-axis rather than a perfectly ordered picket fence)
    const n = Math.round(dg.r*0.42);
    for(let i=0;i<n;i++){
      const a = i/n*Math.PI*2 + rnd()*0.15;
      const rr = dg.r + 13;
      const nx = dg.cx+Math.cos(a)*rr, ny = dg.cy+Math.sin(a)*rr*0.88;
      const ang = a*180/Math.PI + 90 + (rnd()<0.25 ? (rnd()*2-1)*40 : (rnd()*2-1)*10);
      g.appendChild(el('ellipse', {cx:nx, cy:ny, rx:2.3, ry:5.2, transform:`rotate(${ang.toFixed(0)} ${nx} ${ny})`, fill:HE.nuc, opacity:0.92}));
    }
  });
  // A cribriform gland (upper right): one epithelial mass punched through with several
  // lumens — sharing walls, no intervening stroma. Glandular differentiation, not grade.
  const crib = {cx:600, cy:112, rx:92, ry:70};
  g.appendChild(el('path', {d:blobPath(crib.cx, crib.cy, crib.rx, crib.ry, 0.10, 12, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.2}));
  const clumens = [];
  let att = 0;
  while(clumens.length < 7 && att < 400){
    att++;
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.72;
    const lx = crib.cx+Math.cos(a)*crib.rx*r, ly = crib.cy+Math.sin(a)*crib.ry*r;
    const lr = 10+rnd()*6;
    if(clumens.some(L=>Math.hypot(L.x-lx,L.y-ly) < L.r+lr+5)) continue;
    clumens.push({x:lx,y:ly,r:lr});
  }
  clumens.forEach(L=>{ g.appendChild(el('circle', {cx:L.x, cy:L.y, r:L.r, fill:HE.bg, stroke:HE.cytoLn, 'stroke-width':1})); });
  for(let i=0;i<40;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.88;
    const x = crib.cx+Math.cos(a)*crib.rx*r, y = crib.cy+Math.sin(a)*crib.ry*r;
    if(clumens.some(L=>Math.hypot(L.x-x,L.y-y) < L.r+3)) continue;
    g.appendChild(el('circle', {cx:x, cy:y, r:2.9+rnd()*1.1, fill:HE.nuc, opacity:0.9}));
  }
  // A few smaller angulated/fused glands mid-field — "complex" architecture between the
  // two big set-pieces.
  [[430,205,14],[472,242,11],[398,262,13],[120,330,15],[172,382,12]].forEach(p=>{
    drawGlandRing(g, p[0], p[1], p[2], rnd, {nucMin:3, nucMax:4.6});
  });
  // Desmoplastic stroma at the invasive edge (bottom band): dense, sweeping spindle-cell
  // stroma with elongated fibroblast nuclei aligned along the sweep, one small tumor gland
  // caught advancing into it.
  g.appendChild(el('path', {d:`M0 ${430} Q ${VB.w*0.3} ${402} ${VB.w*0.62} ${436} T ${VB.w} ${424} L ${VB.w} ${VB.h} L 0 ${VB.h} Z`, fill:HE.stroma, stroke:HE.stromaLn, 'stroke-width':1.2, opacity:0.95}));
  for(let i=0;i<46;i++){
    const x = rnd()*VB.w;
    const yBase = 430 + Math.sin(x/120)*10;
    const y = yBase + 12 + rnd()*(VB.h-yBase-18);
    const ang = -8 + Math.sin(x/140)*14 + (rnd()*2-1)*10;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:7.5, ry:1.7, transform:`rotate(${ang.toFixed(0)} ${x} ${y})`, fill:HE.nucDark, opacity:0.7}));
  }
  drawGlandRing(g, 322, 458, 13, rnd, {nucMin:3.2, nucMax:4.8});
  return [
    // anchored between the two dirty-necrosis glands' rims, not on a lumen — the debris IS
    // the feature, so the label sits beside the upper gland rather than covering its contents
    {key:'dirtynecrosis', x:250, y:248},
    {key:'glands',        x:600, y:196},
    {key:'desmoplasia',   x:120, y:470},
  ];
}

// Mucinous adenocarcinoma (colon) — genuinely different architecture from Ovary's own Mucinous
// carcinoma (genMucinous above): that entity's cited feature is INTRAGLANDULAR mucin (mucin-
// filled glands/cysts, nuclei pushed basally toward the outer wall) — this entity's own cited
// feature is EXTRACELLULAR mucin POOLS, with malignant epithelial clusters of varying grade
// floating freely within the mucin rather than lining an organized gland lumen (Darwish et al.,
// World J Gastrointest Surg, 2025; Vos et al., J Pathol Clin Res, 2026 — see colon.js's own
// HISTOLOGY_CMUC comment block for full sourcing). Checked directly against every existing
// primitive before writing new code: drawGlandRing/drawFrond/drawCribriformMass all draw
// ORGANIZED epithelium around a lumen or fibrovascular core, the opposite of this entity's own
// defining architecture — free-floating, discontinuous clusters suspended in a non-cellular pool.
function genCMuc(g, rnd){
  const MUCINPOOL = '#dbe6ea'; // pale, cool blue-gray — mucin's classic H&E tinctorial appearance,
  // deliberately distinct from Ovary's own warm pale MUCIN fill (genMucinous, '#f7ecd8') so the
  // two different entities never read as the same substance at a glance.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const pools = [
    {cx:210, cy:170, rx:175, ry:135, rot:-0.1},
    {cx:560, cy:330, rx:165, ry:125, rot:0.25},
  ];
  const poolClusters = pools.map(p=>{
    g.appendChild(el('path', {d:blobPath(p.cx, p.cy, p.rx, p.ry, 0.14, 16, rnd, p.rot), fill:MUCINPOOL, stroke:HE.cytoLn, 'stroke-width':1}));
    const spots = [];
    const n = 4 + Math.round(rnd()*2);
    for(let i=0;i<n;i++){
      const a = rnd()*Math.PI*2, rr = Math.sqrt(rnd())*0.72;
      const cx = p.cx + Math.cos(a)*p.rx*rr, cy = p.cy + Math.sin(a)*p.ry*rr;
      const clusterR = 14 + rnd()*16;
      g.appendChild(el('path', {d:blobPath(cx, cy, clusterR, clusterR*(0.7+rnd()*0.3), 0.18, 9, rnd, rnd()*Math.PI), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1}));
      const cellCount = 3 + Math.round(rnd()*3);
      for(let j=0;j<cellCount;j++){
        const ca = j/cellCount*Math.PI*2 + rnd()*0.3;
        drawCell(g, cx+Math.cos(ca)*clusterR*0.5, cy+Math.sin(ca)*clusterR*0.5*0.8, 4.2+rnd()*1.6, 3.0+rnd()*1.6, rnd, {});
      }
      spots.push({x:cx, y:cy});
    }
    return spots;
  });
  return [
    {key:'mucinpools',      x:pools[0].cx - pools[0].rx*0.3, y:pools[0].cy + pools[0].ry*0.85},
    {key:'floatingclusters', x:poolClusters[0][0].x, y:poolClusters[0][0].y},
    {key:'signetboundary',  x:poolClusters[1][0].x, y:poolClusters[1][0].y},
  ];
}

// Primary colonic lymphoma (diffuse large B-cell lymphoma) — genuinely different cell size and
// architecture from every neuroendocrine-family generator's own drawSmallCellSheet (SMALL,
// MOLDED, bare nuclei with no visible cytoplasm): this entity's own cited cytology is "atypical
// medium-large lymphoid cells" with centroblastic/immunoblastic morphology, frequent mitoses, and
// apoptotic debris (Elsharawi et al., J Hematol, 2025 — see colon.js's own HISTOLOGY_CLYMPH
// comment block for full sourcing) — discrete cells with real cytoplasm and, in a scattered
// subset, a prominent nucleolus (reusing the exact nucleolus-dot technique genLGSC already
// established), never molded against their neighbors the way small round blue cell tumors are.
// Checked directly against every existing primitive before writing new code: drawSmallCellSheet
// is mechanistically the wrong shape for this entity's own real cell size and lack of molding.
function genCLymph(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const sheet = {cx:400, cy:250, rx:340, ry:220};
  g.appendChild(el('path', {d:blobPath(sheet.cx, sheet.cy, sheet.rx, sheet.ry, 0.08, 16, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  const cells = [];
  for(let gx=-sheet.rx; gx<=sheet.rx; gx+=24){
    for(let gy=-sheet.ry; gy<=sheet.ry; gy+=24){
      if((gx/sheet.rx)**2 + (gy/sheet.ry)**2 > 0.88) continue;
      cells.push({x:sheet.cx+gx+(rnd()*2-1)*5, y:sheet.cy+gy+(rnd()*2-1)*5});
    }
  }
  let nucleolusCount = 0;
  cells.forEach(c=>{
    drawCell(g, c.x, c.y, 7.5+rnd()*2, 5.5+rnd()*1.8, rnd, {});
    // a scattered minority carry a visibly prominent nucleolus — the real centroblastic/
    // immunoblastic cytologic detail, drawn on a subset rather than every cell
    if(rnd() < 0.12 && nucleolusCount < 9){
      nucleolusCount++;
      g.appendChild(el('circle', {cx:c.x+(rnd()*2-1)*1.2, cy:c.y+(rnd()*2-1)*1.2, r:1.6, fill:HE.nucDark}));
    }
  });
  // apoptotic debris: small dark irregular fragments scattered through the sheet
  for(let i=0;i<40;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.85;
    g.appendChild(el('circle', {cx:sheet.cx+Math.cos(a)*sheet.rx*r, cy:sheet.cy+Math.sin(a)*sheet.ry*r, r:0.8+rnd()*1.3, fill:HE.debris, opacity:0.7}));
  }
  // frequent mitoses — several scattered figures, the opposite of this atlas's own
  // low-proliferation "single mitosis" idiom (e.g. ovary's low-grade serous carcinoma)
  const mitoses = [{x:260,y:150},{x:480,y:190},{x:340,y:340},{x:540,y:330},{x:220,y:330}];
  mitoses.forEach(m=>{
    const rot = rnd()*180;
    g.appendChild(el('rect', {x:m.x-1.5, y:m.y-6, width:3, height:12, fill:HE.nucDark, transform:`rotate(${rot.toFixed(0)} ${m.x} ${m.y})`}));
    g.appendChild(el('rect', {x:m.x-1.5, y:m.y-6, width:3, height:12, fill:HE.nucDark, transform:`rotate(${(rot+70).toFixed(0)} ${m.x} ${m.y})`}));
  });
  necrosisBlob(g, 400, 250, 70, 48, rnd, 0.15);
  // Two callers share this generator with two DIFFERENT third features — colon.js's own
  // HISTOLOGY_CLYMPH keys its third feature 'necrosis' (the real, drawn necrosisBlob above);
  // lymphnodes.js's own HISTOLOGY_NDLBCL keys its third feature 'effaced' instead (the real,
  // architecture-replacing-the-whole-field property this monotonous sheet already depicts,
  // contrasted against follicular lymphoma's organized nodules — see that entry's own intro
  // text). The render loop below only shows an anchor whose key has a matching feature in the
  // CALLING entity's own histology.features, so BOTH anchors ship here and each entity's own
  // feature list picks up only the one it actually defines — found live (2026-09-14) when
  // ndlbcl's real, authored 3rd feature rendered as only 2, because this generator's own
  // returned anchor list had never been extended past clymph's original 'necrosis' key.
  return [
    {key:'largecells', x:sheet.cx - sheet.rx*0.6, y:sheet.cy - sheet.ry*0.7},
    {key:'mitoses',     x:mitoses[0].x, y:mitoses[0].y - 22},
    {key:'necrosis',    x:400, y:250},
    {key:'effaced',     x:sheet.cx + sheet.rx*0.55, y:sheet.cy + sheet.ry*0.6},
  ];
}

function genPDAC(g, rnd){
  // Pancreatic ductal adenocarcinoma: the field is MOSTLY stroma — desmoplastic stroma can
  // make up "up to 90% of the tumour volume" (see pancreas.js's histology block), so unlike
  // every other generator here the tumor is the minority element by design. Scattered,
  // haphazardly oriented, deceptively well-differentiated glands; one gland immediately
  // adjacent to a muscular artery (a real Hruban & Klimstra diagnostic clue — with their own
  // caveat that it is "not by itself diagnostic"); perineural invasion (~80-90% of resected
  // cases): tumor glands wrapping a nerve.
  // dominant desmoplastic background: layered sweeping collagen bands + spindle fibroblasts
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.75}));
  for(let i=0;i<16;i++){
    const y = 10+rnd()*480;
    g.appendChild(el('path', {d:`M0 ${y} Q ${140+rnd()*200} ${y+(rnd()*2-1)*40} ${420+rnd()*80} ${y+(rnd()*2-1)*30} T ${VB.w} ${y+(rnd()*2-1)*46}`, fill:'none', stroke:HE.stromaLn, 'stroke-width':2+rnd()*3.5, opacity:0.55}));
  }
  for(let i=0;i<120;i++){
    const x = rnd()*VB.w, y = rnd()*VB.h;
    const ang = Math.sin(x/150)*24 + (rnd()*2-1)*22;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:6.5, ry:1.5, transform:`rotate(${ang.toFixed(0)} ${x} ${y})`, fill:HE.nucDark, opacity:0.55}));
  }
  // haphazard neoplastic glands: well-formed rings at random orientations and spacings —
  // the point is the ARRANGEMENT (random, no lobular organization), and how normal each
  // individual gland looks despite the disease's lethality
  const glands = [
    {x:120, y:95,  r:17}, {x:335, y:70,  r:13}, {x:585, y:150, r:16},
    {x:215, y:255, r:14}, {x:475, y:300, r:18}, {x:120, y:420, r:13},
    {x:700, y:415, r:14},
  ];
  glands.forEach(s=>{
    // slight elliptical squash at a random angle so no two glands sit in the same
    // orientation — the "haphazard arrangement" criterion drawn literally
    const gg = el('g', {transform:`rotate(${(rnd()*90-45).toFixed(0)} ${s.x} ${s.y})`});
    g.appendChild(gg);
    drawGlandRing(gg, s.x, s.y, s.r, rnd, {nucMin:3, nucMax:4.4});
  });
  // one incomplete lumen: a gland whose epithelial ring is deliberately broken open so the
  // lumen touches stroma directly (Hruban & Klimstra's "incomplete lumina")
  const inc = {x:645, y:60, r:15};
  g.appendChild(el('path', {d:`M ${inc.x-inc.r-9} ${inc.y} A ${inc.r+9} ${inc.r+9} 0 1 1 ${inc.x+((inc.r+9)*0.5).toFixed(1)} ${inc.y+((inc.r+9)*0.87).toFixed(1)}`, fill:'none', stroke:HE.cyto, 'stroke-width':16, 'stroke-linecap':'round'}));
  for(let i=0;i<9;i++){
    const a = 0.35 + i/9*Math.PI*1.5;
    g.appendChild(el('circle', {cx:inc.x+Math.cos(a)*(inc.r+4), cy:inc.y+Math.sin(a)*(inc.r+4), r:3.2+rnd()*1, fill:HE.nuc, opacity:0.92}));
  }
  // muscular artery with a neoplastic gland immediately against its wall
  const art = {x:310, y:395, r:26};
  g.appendChild(el('circle', {cx:art.x, cy:art.y, r:art.r, fill:HE.cytoLite, stroke:HE.vesselDk, 'stroke-width':2}));
  g.appendChild(el('circle', {cx:art.x, cy:art.y, r:art.r-8, fill:'none', stroke:HE.vessel, 'stroke-width':5, opacity:0.85}));
  g.appendChild(el('circle', {cx:art.x, cy:art.y, r:art.r-15, fill:HE.bg, stroke:HE.vesselDk, 'stroke-width':1}));
  for(let i=0;i<5;i++){
    const a = rnd()*Math.PI*2;
    g.appendChild(el('circle', {cx:art.x+Math.cos(a)*(art.r-15)*0.5, cy:art.y+Math.sin(a)*(art.r-15)*0.5, r:2.2, fill:HE.vessel, opacity:0.85}));
  }
  drawGlandRing(g, art.x+art.r+16, art.y-6, 12, rnd, {nucMin:3.2, nucMax:4.6});
  // perineural invasion: a wavy nerve bundle with a tumor gland hugging its curve
  const nerve = {x0:520, y0:455, x1:790, y1:395};
  g.appendChild(el('path', {d:`M ${nerve.x0} ${nerve.y0} C ${nerve.x0+80} ${nerve.y0-38}, ${nerve.x1-90} ${nerve.y1+40}, ${nerve.x1} ${nerve.y1}`, fill:'none', stroke:HE.cytoLite, 'stroke-width':17, 'stroke-linecap':'round'}));
  g.appendChild(el('path', {d:`M ${nerve.x0} ${nerve.y0} C ${nerve.x0+80} ${nerve.y0-38}, ${nerve.x1-90} ${nerve.y1+40}, ${nerve.x1} ${nerve.y1}`, fill:'none', stroke:HE.cytoLn, 'stroke-width':1.2, opacity:0.8, 'stroke-dasharray':'7 5'}));
  for(let t=0.12; t<0.95; t+=0.16){
    const nx = nerve.x0 + (nerve.x1-nerve.x0)*t;
    const ny = nerve.y0 + (nerve.y1-nerve.y0)*t + Math.sin(t*Math.PI)* -22;
    g.appendChild(el('ellipse', {cx:nx, cy:ny, rx:4.4, ry:1.6, transform:`rotate(${(-14+(rnd()*2-1)*14).toFixed(0)} ${nx} ${ny})`, fill:HE.nucDark, opacity:0.8}));
  }
  const png = el('g', {transform:'rotate(28 610 420)'});
  g.appendChild(png);
  drawGlandRing(png, 610, 420, 11, rnd, {nucMin:3.2, nucMax:4.6});
  return [
    {key:'stroma',     x:150, y:180},
    // beside the gland cluster, not on any single ring — the arrangement is the feature
    {key:'haphazard',  x:480, y:222},
    // above the nerve's curve, not on it — same off-the-structure anchoring GBM's mvp and
    // prostate's cribriform labels needed (centered labels hid what they named)
    {key:'perineural', x:648, y:475},
  ];
}

function genGDiffuse(g, rnd){
  // Diffuse-type (WHO: poorly cohesive) gastric adenocarcinoma: the defining feature is the
  // ABSENCE of the architecture every other adenocarcinoma generator above draws — no glands
  // anywhere in this field, only discohesive single cells and loose files infiltrating the
  // stroma, many with signet-ring morphology ("a central, optically clear, globoid droplet
  // of cytoplasmic mucin with an eccentrically placed nucleus" — see stomach.js's histology
  // block for sources). Stroma is drawn but deliberately NOT labeled as a feature: diffuse
  // gastric cancer does show marked desmoplasia, but labeling it here would read as a repeat
  // of PDAC's signature slide two generators up — the discohesion and the signet rings are
  // what make THIS cancer's field its own.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.6}));
  for(let i=0;i<12;i++){
    const y = 15+rnd()*470;
    g.appendChild(el('path', {d:`M0 ${y} Q ${200+rnd()*180} ${y+(rnd()*2-1)*34} ${VB.w} ${y+(rnd()*2-1)*40}`, fill:'none', stroke:HE.stromaLn, 'stroke-width':2+rnd()*3, opacity:0.5}));
  }
  for(let i=0;i<70;i++){
    const x = rnd()*VB.w, y = rnd()*VB.h;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:6, ry:1.5, transform:`rotate(${((rnd()*2-1)*30).toFixed(0)} ${x} ${y})`, fill:HE.nucDark, opacity:0.5}));
  }
  // signet-ring cells: large, round, optically-clear mucin globule filling the cytoplasm,
  // nucleus crushed into a crescent against the membrane. Drawn at real prominence — this
  // is the cancer's signature object and exists in no other generator in this file.
  const signets = [];
  let att = 0;
  while(signets.length < 15 && att < 900){
    att++;
    const x = 45+rnd()*(VB.w-90), y = 45+rnd()*(VB.h-90);
    const r = 15+rnd()*9;
    if(signets.some(s=>Math.hypot(s.x-x,s.y-y) < s.r+r+26)) continue;
    signets.push({x,y,r});
  }
  signets.forEach(s=>{
    const a = rnd()*Math.PI*2; // which way the nucleus is shoved
    g.appendChild(el('circle', {cx:s.x, cy:s.y, r:s.r, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1.4}));
    // the mucin droplet: a faint inner sheen ring so the vacuole reads as full, not empty
    g.appendChild(el('circle', {cx:s.x-s.r*0.22, cy:s.y-s.r*0.22, r:s.r*0.5, fill:'#ffffff', opacity:0.5}));
    // eccentric crescent nucleus, flattened along the cell membrane
    const nx = s.x+Math.cos(a)*s.r*0.68, ny = s.y+Math.sin(a)*s.r*0.68;
    const ang = a*180/Math.PI + 90;
    g.appendChild(el('ellipse', {cx:nx, cy:ny, rx:s.r*0.52, ry:s.r*0.20, transform:`rotate(${ang.toFixed(0)} ${nx} ${ny})`, fill:HE.nucDark, opacity:0.95}));
  });
  // discohesive non-signet tumor cells: single cells and short indian-file rows percolating
  // between stroma bands — never rings, never shared walls
  for(let i=0;i<60;i++){
    const x = 25+rnd()*(VB.w-50), y = 25+rnd()*(VB.h-50);
    if(signets.some(s=>Math.hypot(s.x-x,s.y-y) < s.r+14)) continue;
    drawCell(g, x, y, 6.5, 3.2+rnd()*1.4, rnd, {nucOffset:2});
  }
  for(let f=0; f<4; f++){
    const x0 = 60+rnd()*(VB.w-260), y0 = 60+rnd()*(VB.h-140);
    const ang = (rnd()*2-1)*0.5;
    drawSingleFileCord(g, x0, y0, ang, rnd, {cytoR:6, nucRJitter:1, skipIf:(x,y)=>signets.some(s=>Math.hypot(s.x-x,s.y-y) < s.r+13)});
  }
  // pick label anchors off actual drawn objects: nearest signet to the upper-left third
  let best = signets[0], bd = 1e9;
  signets.forEach(s=>{ const d = Math.hypot(s.x-210, s.y-150); if(d<bd){bd=d; best=s;} });
  return [
    // beside the chosen signet-ring cell, not on it — the clear vacuole is the feature
    {key:'signet',       x:best.x, y:best.y+best.r+22},
    {key:'discohesion',  x:600, y:120},
    {key:'infiltration', x:170, y:420},
  ];
}

function genGInt(g, rnd){
  // Intestinal-type gastric adenocarcinoma: WHO/Lauren define this type BY its resemblance to
  // colonic adenocarcinoma — well-to-moderately differentiated glands arising in a background of
  // gastric intestinal metaplasia (the Correa-cascade precursor step this organ's own diffuse-type
  // generator two entries up is drawn without, since that cascade is intestinal-specific). This
  // field deliberately reuses drawGlandRing, the SAME primitive genCRC/genPDAC already draw with
  // (full reuse, not new drawing code — the honest consequence of sharing one real architecture),
  // composed simply (round, evenly-spaced, single-layer glands) rather than CRC's own complex/
  // cribriform/dirty-necrosis set-pieces, which are that cancer's own distinguishing features, not
  // this one's. The one genuinely stomach-specific addition is the scattered goblet cell: a small,
  // polarized clear-mucin cap at one pole of an otherwise ordinary cell, not the whole-cell vacuole
  // genGDiffuse's own signet ring uses immediately above.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.5}));
  for(let i=0;i<7;i++){
    const y = 20+rnd()*460;
    g.appendChild(el('path', {d:`M0 ${y} Q ${180+rnd()*160} ${y+(rnd()*2-1)*30} ${VB.w} ${y+(rnd()*2-1)*36}`, fill:'none', stroke:HE.stromaLn, 'stroke-width':2+rnd()*3, opacity:0.4}));
  }
  // well-formed round-to-oval glands, evenly spaced across the field — rejection-sampled so none
  // overlap, the classic "resembles colonic adenocarcinoma" architecture.
  const glands = [];
  let att = 0;
  while(glands.length < 13 && att < 900){
    att++;
    const x = 55+rnd()*(VB.w-110), y = 45+rnd()*(VB.h-90);
    const r = 20+rnd()*14;
    if(glands.some(gl=>Math.hypot(gl.x-x,gl.y-y) < gl.r+r+18)) continue;
    glands.push({x,y,r});
  }
  glands.forEach(gl=>{ drawGlandRing(g, gl.x, gl.y, gl.r, rnd, {cellR:11, nucMin:3.4, nucMax:5.0}); });
  // goblet cells: intestinal metaplasia's own signature, scattered through the background stroma
  // between glands, never inside a gland's own cell ring drawn above.
  for(let i=0;i<26;i++){
    const x = 25+rnd()*(VB.w-50), y = 25+rnd()*(VB.h-50);
    if(glands.some(gl=>Math.hypot(gl.x-x,gl.y-y) < gl.r+18)) continue;
    const a = rnd()*Math.PI*2;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:5.5, ry:4, fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':0.9}));
    g.appendChild(el('circle', {cx:x+Math.cos(a)*2.6, cy:y+Math.sin(a)*2.6, r:2.6, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':0.8}));
    g.appendChild(el('ellipse', {cx:x-Math.cos(a)*2.2, cy:y-Math.sin(a)*2.2, rx:1.6, ry:1.1, fill:HE.nucDark, opacity:0.9}));
  }
  // one papillary frond — the second real architecture named for this type alongside the tubular gland
  const frond = {cx:610, cy:130, rx:78, ry:100, rot:0.15};
  drawFrond(g, rnd, frond, {wobble:0.16, core:{type:'fibrovascular', length:0.7, width:6}});
  return [
    {key:'glands',    x:glands[0] ? glands[0].x : 140, y:(glands[0] ? glands[0].y : 140) - 40},
    {key:'goblet',    x:610, y:330},
    {key:'papillary', x:frond.cx, y:frond.cy - frond.ry - 20},
  ];
}

function genMelanoma(g, rnd){
  // Cutaneous melanoma, superficial spreading type — the first slide in this file with a
  // skin surface on it: an epidermis band across the top, an undulating dermal-epidermal
  // junction, and everything the verification pass confirmed for SSM (see skin.js's
  // histology block): irregular junctional nests, pagetoid single cells climbing the
  // epidermis, a dermal invasive component with dusty brown melanin and melanophages, one
  // mitotic figure, and the Breslow gauge — a measurement annotation, drawn as a thin
  // technical ruler (deliberately not tissue-colored) from the top of the granular layer to
  // the deepest invasive cell. Deliberately ABSENT: solar elastosis — that is a lentigo
  // maligna (high cumulative sun damage) background finding, and PathologyOutlines classes
  // SSM as low-CSD; drawing it would put the wrong subtype's background under this field.
  // Melanin brown is an assembled inference (dusty/granular pigment + eumelanin brown-black),
  // recorded in skin.js's histology comment.
  const PIG = '#8a5a3c', PIGDK = '#5f3c26';
  // dermis background
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  for(let i=0;i<10;i++){
    const y = 170+rnd()*310;
    g.appendChild(el('path', {d:`M0 ${y} Q ${180+rnd()*220} ${y+(rnd()*2-1)*26} ${VB.w} ${y+(rnd()*2-1)*30}`, fill:'none', stroke:HE.stromaLn, 'stroke-width':2+rnd()*2.5, opacity:0.45}));
  }
  // dermal-epidermal junction: undulating rete-ridge boundary, effaced/irregular over the
  // tumor-bearing left two-thirds (amplitude jitter), calmer at the right edge
  const dej = [];
  for(let x=0; x<=VB.w; x+=20){
    const calm = x>600 ? 0.45 : 1;
    dej.push([x, 128 + (16 + rnd()*14*calm)*Math.sin(x*0.035 + 0.6) * calm + (rnd()*2-1)*7*calm]);
  }
  // epidermis band: top of viewBox down to the DEJ polyline
  let epiD = 'M0 0 L800 0';
  for(let i=dej.length-1;i>=0;i--) epiD += ` L${dej[i][0]} ${dej[i][1].toFixed(1)}`;
  g.appendChild(el('path', {d:epiD+' Z', fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  // stratum corneum: thin lamellar strip at the very top; the granular layer sits just under
  // it — the Breslow gauge's top tick anchors to that level (y≈22)
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:16, fill:HE.cyto, opacity:0.8}));
  for(let i=0;i<26;i++){
    const y = 3+rnd()*11;
    g.appendChild(el('path', {d:`M${rnd()*VB.w*0.9} ${y} q 30 ${(rnd()*2-1)*3} 62 0`, fill:'none', stroke:HE.cytoLn, 'stroke-width':1, opacity:0.6}));
  }
  // resident keratinocyte nuclei: small, orderly, sparse — the calm the tumor disrupts
  for(let i=0;i<120;i++){
    const x = rnd()*VB.w;
    const dy = dej[Math.min(dej.length-1, Math.round(x/20))][1];
    const y = 22 + rnd()*(dy-30);
    if(y > dy-8) continue;
    g.appendChild(el('circle', {cx:x, cy:y, r:2.1+rnd()*0.9, fill:HE.nuc, opacity:0.45}));
  }
  // irregular junctional nests: variably sized/shaped clusters riding the DEJ, focally
  // confluent on the left; each = a pigmented blob + crowded dark atypical nuclei
  const nests = [
    {x:95,  rx:42, ry:26}, {x:175, rx:30, ry:20}, {x:225, rx:52, ry:30},
    {x:330, rx:24, ry:16}, {x:415, rx:38, ry:24}, {x:520, rx:20, ry:14},
  ];
  nests.forEach(n=>{
    const dy = dej[Math.min(dej.length-1, Math.round(n.x/20))][1];
    const cy = dy - n.ry*0.25 + rnd()*6;
    g.appendChild(el('path', {d:blobPath(n.x, cy, n.rx, n.ry, 0.3, 10, rnd, rnd()*1.2), fill:PIG, opacity:0.35, stroke:HE.cytoLn, 'stroke-width':1}));
    const count = Math.round(n.rx*n.ry/38);
    for(let k=0;k<count;k++){
      const a = rnd()*Math.PI*2, r = Math.sqrt(rnd());
      drawCell(g, n.x+Math.cos(a)*n.rx*r*0.8, cy+Math.sin(a)*n.ry*r*0.8, 6.5, 3.6+rnd()*2.2, rnd, {nucFill:HE.nucDark, nucOffset:1.5, cytoOpacity:0.5});
    }
    n.cy = cy;
  });
  // pagetoid spread: single atypical melanocytes with a clear halo, scattered UP into the
  // spinous/granular levels above the nests — where melanocytes do not belong
  for(let i=0;i<13;i++){
    const x = 40+rnd()*520;
    const dy = dej[Math.min(dej.length-1, Math.round(x/20))][1];
    const y = 26 + rnd()*(dy-58);
    g.appendChild(el('circle', {cx:x, cy:y, r:7+rnd()*2, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1}));
    g.appendChild(el('circle', {cx:x, cy:y, r:3.6+rnd()*1.2, fill:HE.nucDark, opacity:0.95}));
  }
  // dermal invasive component: loose sheets of large epithelioid cells with dusty brown
  // pigment descending under the main nest cluster; absence of maturation = the deep cells
  // stay as big as the superficial ones
  const invaders = [];
  for(let i=0;i<46;i++){
    const t = rnd();
    const x = 120 + rnd()*340 + t*90;
    const y = 165 + t*195 + rnd()*24;
    invaders.push({x, y});
  }
  // the deepest invasive cell — placed explicitly; the Breslow gauge's bottom tick aligns
  // to this exact depth
  const deepest = {x:400, y:382};
  invaders.push(deepest);
  invaders.forEach(c=>{
    drawCell(g, c.x, c.y, 8.5+rnd()*2, 4.4+rnd()*2.4, rnd, {nucFill:HE.nucDark, nucOffset:2, cytoFill:HE.cyto});
    if(rnd()<0.5) g.appendChild(el('circle', {cx:c.x+(rnd()*2-1)*6, cy:c.y+(rnd()*2-1)*6, r:1.1+rnd()*1.2, fill:PIG, opacity:0.8}));
  });
  // melanophages: darkly pigmented macrophages in the papillary dermis, hoovering up melanin
  for(let i=0;i<9;i++){
    const x = 90+rnd()*470, y = 160+rnd()*90;
    g.appendChild(el('path', {d:blobPath(x, y, 6+rnd()*3, 5+rnd()*2, 0.35, 8, rnd, 0), fill:PIGDK, opacity:0.85}));
  }
  // one dermal mitotic figure (drawable per the verification; NOT an AJCC-8 T1 criterion, so
  // it stays unlabeled garnish): a condensed double-bar of chromosomes
  g.appendChild(el('rect', {x:236, y:262, width:3, height:11, fill:HE.nucDark, transform:'rotate(24 237 267)'}));
  g.appendChild(el('rect', {x:243, y:262, width:3, height:11, fill:HE.nucDark, transform:'rotate(-18 244 267)'}));
  // Breslow gauge: thin technical ruler from the granular layer (just under the corneum) to
  // the deepest invasive cell's depth — annotation styling, deliberately not tissue-colored
  const GX = 716, yTop = 22, yBot = deepest.y;
  const RULER = '#41527a';
  g.appendChild(el('line', {x1:GX, y1:yTop, x2:GX, y2:yBot, stroke:RULER, 'stroke-width':2}));
  g.appendChild(el('line', {x1:GX-14, y1:yTop, x2:GX+14, y2:yTop, stroke:RULER, 'stroke-width':2}));
  g.appendChild(el('line', {x1:GX-14, y1:yBot, x2:GX+14, y2:yBot, stroke:RULER, 'stroke-width':2}));
  for(let y=yTop+30; y<yBot-8; y+=30) g.appendChild(el('line', {x1:GX-5, y1:y, x2:GX+5, y2:y, stroke:RULER, 'stroke-width':1.4, opacity:0.7}));
  // dashed guide from the deepest cell to the gauge's bottom tick, so the measurement's
  // anchor is visually explicit
  g.appendChild(el('line', {x1:deepest.x+14, y1:deepest.y, x2:GX-16, y2:yBot, stroke:RULER, 'stroke-width':1.2, 'stroke-dasharray':'5 5', opacity:0.7}));
  return [
    {key:'breslow',  x:GX-4, y:214},
    {key:'pagetoid', x:315,  y:52},
    {key:'nests',    x:225,  y:(nests[2].cy||150)+44},
  ];
}

function genOCCC(g, rnd){
  // Ovarian clear-cell carcinoma — deliberately distinct from BOTH of the slides it could be
  // confused with. vs genHGSOC: papillae here are SMALL and ROUND with no hierarchical
  // branching, a single-cell rim, and cores swollen with dense hyaline material (DeLair 2011:
  // "small and round and lacking hierarchical branching... stratification of more than 3
  // cells"; Diagnostics 2021 fig legend: "small and regular papillae, frequently hyalinized");
  // nuclei are drawn UNIFORM (narrow radius band, no right-skewed atypia) and exactly one
  // mitotic figure appears (usually <5/10 HPF vs serous >12 — same-source contrast); no
  // psammoma bodies (a serous feature; no source attributes them to OCCC). vs genCCRCC (the
  // other "clear cell"): no chicken-wire capillary re-stroke — that network is the KIDNEY
  // tumor's signature — and the architecture is tubulocystic + papillary, not packed solid
  // nests. Mixed-in eosinophilic (pink) cells are deliberate: clear cytoplasm alone is not
  // the diagnostic criterion (Diagnostics 2021), so a uniformly clear field would overclaim.
  const HYAL = '#e2a9bb'; // dense hyaline basement-membrane material — deeper eosin than stroma
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  g.appendChild(el('path', {d:blobPath(400, 250, 420, 275, 0.08, 14, rnd, 0), fill:HE.stroma, opacity:0.45}));

  // helper: one lining/rim cell, uniform-nucleus discipline (3.4–4.5px — the anti-HGSOC rule)
  const uNuc = ()=>3.4 + rnd()*1.1;

  // --- tubulocystic pattern: two cystic spaces with hobnail lining ---
  const cysts = [
    {cx:170, cy:135, rx:128, ry:92, rot:-0.12},
    {cx:125, cy:388, rx:98,  ry:66, rot: 0.2},
  ];
  cysts.forEach(c=>{
    const d = blobPath(c.cx, c.cy, c.rx, c.ry, 0.09, 14, rnd, c.rot);
    // single-layer cuboidal lining band, then the open lumen
    g.appendChild(el('path', {d, fill:HE.cytoLite, stroke:HE.clearLn, 'stroke-width':1.3}));
    g.appendChild(el('path', {d:blobPath(c.cx, c.cy, c.rx*0.82, c.ry*0.78, 0.09, 14, rnd, c.rot), fill:HE.bg}));
    // lining nuclei: most sit in the band; every third is a HOBNAIL — nucleus displaced
    // INWARD past the lumen edge so it visibly bulges into the space (the citable phrase is
    // "eccentric, rounded, and bulbous nuclei" — J Cancer 2021)
    const per = Math.round(2*Math.PI*Math.sqrt((c.rx*c.rx+c.ry*c.ry)/2) / 15);
    for(let i=0;i<per;i++){
      const a = i/per*Math.PI*2;
      const hob = (i%3===0);
      const rr = hob ? 0.72 : 0.9; // hobnail nuclei ride inside the lumen boundary
      const px = Math.cos(a)*c.rx*rr, py = Math.sin(a)*c.ry*rr;
      const x = c.cx + px*Math.cos(c.rot) - py*Math.sin(c.rot);
      const y = c.cy + px*Math.sin(c.rot) + py*Math.cos(c.rot);
      if(hob){
        // scant pale cytoplasm trailing the bulging nucleus
        g.appendChild(el('circle', {cx:x, cy:y, r:6.4+rnd()*1.4, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1}));
      }
      g.appendChild(el('circle', {cx:x, cy:y, r:hob ? uNuc()+0.8 : uNuc(), fill:HE.nuc, opacity:0.92}));
    }
  });

  // --- papillary pattern: small ROUND papillae, hyaline-swollen cores, single-cell rims ---
  const paps = [
    {cx:452, cy:104, r:54},
    {cx:592, cy:88,  r:46},
    {cx:520, cy:222, r:50},
    {cx:668, cy:196, r:40},
  ];
  paps.forEach(p=>{
    // core FIRST and WIDE: the dense hyaline material occupies most of the papilla — drawn
    // deliberately wider than the single cell layer riding on it (the depictable half of the
    // diagnostic triad: complex papillae + hyaline cores + hyaline bodies)
    const dOut = blobPath(p.cx, p.cy, p.r, p.r*0.92, 0.07, 12, rnd, rnd()*0.5);
    g.appendChild(el('path', {d:dOut, fill:HE.cytoLite, stroke:HE.clearLn, 'stroke-width':1.2}));
    g.appendChild(el('path', {d:blobPath(p.cx, p.cy, p.r*0.72, p.r*0.66, 0.1, 10, rnd, rnd()*0.5), fill:HYAL, stroke:'#d093a8', 'stroke-width':1.4, opacity:0.95}));
    // the ≤3-cell-layer rule drawn as ONE clean rim layer, uniform nuclei
    const per = Math.max(9, Math.round(p.r*0.42));
    for(let i=0;i<per;i++){
      const a = i/per*Math.PI*2 + rnd()*0.12;
      const x = p.cx + Math.cos(a)*p.r*0.88, y = p.cy + Math.sin(a)*p.r*0.82;
      g.appendChild(el('circle', {cx:x, cy:y, r:uNuc(), fill:HE.nuc, opacity:0.92}));
    }
  });

  // --- solid pattern: a sheet of clear cells with eosinophilic cells mixed in ---
  const sheet = {cx:568, cy:398, rx:200, ry:88};
  const dSheet = blobPath(sheet.cx, sheet.cy, sheet.rx, sheet.ry, 0.1, 14, rnd, 0.05);
  g.appendChild(el('path', {d:dSheet, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1.2}));
  for(let i=-13;i<=13;i++){
    for(let j=-6;j<=6;j++){
      const x = sheet.cx + i*15 + (rnd()*2-1)*3.5, y = sheet.cy + j*14 + (rnd()*2-1)*3.5;
      if(((x-sheet.cx)/(sheet.rx*0.86))**2 + ((y-sheet.cy)/(sheet.ry*0.84))**2 > 1) continue;
      const pink = rnd() < 0.16; // the verified mixed field: mostly clear, some eosinophilic
      g.appendChild(el('circle', {cx:x, cy:y, r:8.2+rnd()*2.2, fill:pink?HE.cyto:HE.clear, stroke:pink?HE.cytoLn:HE.clearLn, 'stroke-width':1.1}));
      g.appendChild(el('circle', {cx:x+(rnd()*2-1)*2.6, cy:y+(rnd()*2-1)*2.6, r:uNuc()-0.6, fill:HE.nuc, opacity:0.9}));
    }
  }
  // exactly ONE mitotic figure (melanoma's condensed double-bar idiom) — the point IS its
  // loneliness: usually <5 per 10 HPF here, >12 in the serous slide two doors down
  g.appendChild(el('rect', {x:497, y:381, width:3, height:11, fill:HE.nucDark, transform:'rotate(22 498 386)'}));
  g.appendChild(el('rect', {x:504, y:381, width:3, height:11, fill:HE.nucDark, transform:'rotate(-16 505 386)'}));

  // --- hyaline bodies: free-standing dense spheres between structures (triad, part 3) ---
  [{x:328,y:186,r:9},{x:352,y:322,r:7},{x:700,y:296,r:8},{x:262,y:262,r:6}].forEach(h=>{
    g.appendChild(el('circle', {cx:h.x, cy:h.y, r:h.r, fill:HYAL, stroke:'#c98ba2', 'stroke-width':1.6}));
  });

  return [
    {key:'hyalpap', x:520, y:222},
    {key:'hobnail', x:170, y:135},
    {key:'uniform', x:568, y:398},
  ];
}

function genSeminoma(g, rnd){
  // Seminoma — sheets/nests divided into lobules by thin fibrovascular septa, and the septa
  // are the point: a lymphocytic infiltrate running through them is this tumor's single most
  // recognizable low-power feature (verified: "nests and sheets with intercepting thin
  // fibrovascular septa which have lymphocytes," PMC6906820). Cells are drawn LARGE, uniform,
  // and clear-to-eosinophilic — deliberately NOT right-skewed/pleomorphic the way HGSOC's or
  // this same pass's Bladder slide are; uniformity is itself a verified, named contrast with
  // this atlas's more atypical tumors. One multinucleated syncytiotrophoblast floats in a
  // lobule, per the source's own "sometimes syncytiotrophoblasts" — drawn exactly once, the
  // same restrained "occasional, not the point" treatment OCCC's own single mitotic figure got.
  const lobules = [
    {cx:190, cy:145, rx:150, ry:120, rot:-0.1},
    {cx:560, cy:120, rx:170, ry:110, rot: 0.15},
    {cx:210, cy:380, rx:165, ry:105, rot: 0.05},
    {cx:590, cy:375, rx:180, ry:110, rot:-0.08},
  ];
  const uNuc = ()=>5.6 + rnd()*1.6; // uniform band — the anti-pleomorphism rule for this tumor
  lobules.forEach(l=>{
    const d = blobPath(l.cx, l.cy, l.rx, l.ry, 0.09, 14, rnd, l.rot);
    g.appendChild(el('path', {d, fill:HE.stroma, opacity:0.5}));
    const inner = blobPath(l.cx, l.cy, l.rx*0.9, l.ry*0.9, 0.09, 14, rnd, l.rot);
    g.appendChild(el('path', {d:inner, fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
    // packed large polygonal cells, clear-to-eosinophilic mix, distinct borders
    for(let i=0;i<26;i++){
      const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.78;
      const px = Math.cos(a)*l.rx*r, py = Math.sin(a)*l.ry*r;
      const x = l.cx + px*Math.cos(l.rot) - py*Math.sin(l.rot);
      const y = l.cy + px*Math.sin(l.rot) + py*Math.cos(l.rot);
      const pink = rnd() < 0.35;
      drawCell(g, x, y, 12.5+rnd()*2.5, uNuc(), rnd, {cytoFill: pink?HE.cyto:HE.clear, cytoStroke: pink?HE.cytoLn:HE.clearLn});
    }
  });
  // one syncytiotrophoblast: a larger, darker, multinucleated cell — occasional, not the rule
  const st = {x:560, y:150};
  g.appendChild(el('ellipse', {cx:st.x, cy:st.y, rx:22, ry:17, fill:HE.cyto, stroke:HE.vesselDk, 'stroke-width':1.6, opacity:0.95}));
  [[-8,-4],[7,-6],[-2,7]].forEach(([dx,dy])=>{
    g.appendChild(el('circle', {cx:st.x+dx, cy:st.y+dy, r:5.2, fill:HE.nucDark}));
  });
  // fibrovascular septa between lobules, carrying the lymphocytic infiltrate
  const septa = [
    {x1:340, y1:180, x2:420, y2:220}, {x1:280, y1:260, x2:340, y2:330}, {x1:430, y1:250, x2:480, y2:300},
  ];
  septa.forEach(s=>{
    g.appendChild(el('line', {x1:s.x1, y1:s.y1, x2:s.x2, y2:s.y2, stroke:HE.stromaLn, 'stroke-width':22, 'stroke-linecap':'round', opacity:0.55}));
    for(let i=0;i<9;i++){
      const t = i/8, x = s.x1+(s.x2-s.x1)*t + (rnd()*2-1)*8, y = s.y1+(s.y2-s.y1)*t + (rnd()*2-1)*8;
      g.appendChild(el('circle', {cx:x, cy:y, r:3+rnd()*1, fill:HE.lymph}));
    }
  });
  return [
    {key:'sheets',      x:190, y:145},
    {key:'lymphocytes', x:370, y:250},
    {key:'cytology',    x:590, y:375},
  ];
}

// Non-seminomatous germ cell tumor — embryonal carcinoma's irregular glandular/solid sheets
// (drawGlandRing reuse, zero new drawing code, the same primitive genCRC/genPDAC/genLUAD/
// genProstate already use) as the field's dominant tumor population, plus ONE Schiller-Duval
// body (the new primitive above) as the headline yolk-sac-tumor feature. Deliberately NOT drawn:
// choriocarcinoma's biphasic pattern, teratoma's multi-germ-layer tissue — both real and named
// in the intro text only, the same "name more than is drawn" restraint ATC's own three (not five)
// patterns already establish for this atlas.
function genNSGCT(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.55}));
  // embryonal carcinoma: irregular, haphazardly-oriented glandular/solid sheets — deliberately
  // more disorderly than genPDAC's own well-formed, evenly-spaced glands, since embryonal
  // carcinoma is described as PRIMITIVE and disorderly rather than deceptively well-differentiated
  const glands = [
    {x:120, y:100, r:26}, {x:310, y:70,  r:20}, {x:180, y:230, r:30},
    {x:95,  y:400, r:22}, {x:270, y:410, r:26}, {x:150, y:330, r:16},
  ];
  glands.forEach(s=>{
    const gg = el('g', {transform:`rotate(${(rnd()*180-90).toFixed(0)} ${s.x} ${s.y})`});
    g.appendChild(gg);
    drawGlandRing(gg, s.x, s.y, s.r, rnd, {nucMin:3.5, nucMax:5.5, cellR:11});
  });
  // solid sheets of primitive cells filling the space between glands
  for(let i=0;i<70;i++){
    const x = 20+rnd()*440, y = 20+rnd()*460;
    if(glands.some(gl=>Math.hypot(gl.x-x, gl.y-y) < gl.r+16)) continue;
    drawCell(g, x, y, 9+rnd()*2, 4+rnd()*1.6, rnd, {cytoFill:HE.cytoLite, cytoOpacity:0.85});
  }
  // ONE Schiller-Duval body, sited apart from the embryonal-carcinoma cluster
  drawSchillerDuvalBody(g, 610, 260, 130, rnd, {offsetX:-18, offsetY:12, cellCount:13});
  // Teratoma's real, cited multi-germ-layer heterogeneity (Salzillo et al., Cancers, 2024,
  // PMCID PMC11240729) — drawn as one mature-cartilage nodule, a real, visually distinctive
  // mesodermal component: pale blue-gray matrix with chondrocytes sitting in clear lacunar
  // spaces, genuinely new (no existing primitive draws a cartilage matrix), sited in its own
  // corner apart from both the embryonal-carcinoma cluster and the Schiller-Duval body so all
  // three read as distinct zones of one heterogeneous tumor.
  const cart = {x:660, y:440, r:70};
  g.appendChild(el('path', {d:blobPath(cart.x, cart.y, cart.r, cart.r*0.82, 0.13, 14, rnd, 0.2), fill:'#c9d4dc', stroke:'#9fb0bc', 'stroke-width':1.6, opacity:0.95}));
  for(let i=0;i<22;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.75;
    const x = cart.x+Math.cos(a)*cart.r*r, y = cart.y+Math.sin(a)*cart.r*0.82*r;
    g.appendChild(el('ellipse', {cx:x, cy:y, rx:6.5, ry:5, fill:HE.clear, stroke:'#9fb0bc', 'stroke-width':1, opacity:0.9}));
    g.appendChild(el('circle', {cx:x+(rnd()*2-1)*1.5, cy:y+(rnd()*2-1)*1.5, r:2.6, fill:HE.nucDark, opacity:0.9}));
  }
  return [
    {key:'embryonal',     x:180, y:230},
    {key:'schillerduval', x:610, y:120},
    {key:'teratoma',      x:cart.x, y:cart.y - cart.r - 14},
  ];
}

function genBladderUC(g, rnd){
  // High-grade invasive urothelial carcinoma — a papillary frond with a real fibrovascular
  // core, covered by DISORDERED, piled-up cells (no clean single rim — the loss-of-polarity
  // finding drawn as literal multi-layer disorder, the opposite of HGSOC's/OCCC's neat rims),
  // plus invasive nests infiltrating stroma below it. Nuclei are markedly pleomorphic and
  // hyperchromatic (right-skewed size + a darker fraction), with several mitotic figures —
  // "frequent," verified — deliberately more than OCCC's lonely single figure, the contrast
  // that source's own wording draws. No umbrella-cell layer is drawn at all: their absence in
  // high-grade disease is the honest point, not an omission to fix.
  g.appendChild(el('path', {d:blobPath(400, 250, 380, 240, 0.06, 12, rnd, 0), fill:HE.stroma, opacity:0.4}));
  // the papillary frond: fibrovascular core (a thin vessel-toned line) inside a stroma body
  const frond = {cx:220, cy:150, rx:145, ry:210, rot:-0.15};
  const coreD = blobPath(frond.cx, frond.cy, frond.rx*0.34, frond.ry*0.82, 0.14, 12, rnd, frond.rot);
  g.appendChild(el('path', {d:blobPath(frond.cx, frond.cy, frond.rx, frond.ry, 0.14, 16, rnd, frond.rot), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1.2}));
  g.appendChild(el('path', {d:coreD, fill:HE.stroma, stroke:HE.vessel, 'stroke-width':1.6}));
  // disordered, piled-up covering cells — three loosely-radial, jittered "layers", not one rim
  for(let ring=0; ring<3; ring++){
    const per = 16 - ring*3;
    for(let i=0;i<per;i++){
      const a = i/per*Math.PI*2 + rnd()*0.5;
      const rr = (0.55 + ring*0.16 + (rnd()*2-1)*0.06);
      const px = Math.cos(a)*frond.rx*rr, py = Math.sin(a)*frond.ry*rr;
      const x = frond.cx + px*Math.cos(frond.rot) - py*Math.sin(frond.rot) + (rnd()*2-1)*6;
      const y = frond.cy + px*Math.sin(frond.rot) + py*Math.cos(frond.rot) + (rnd()*2-1)*6;
      const dark = rnd() < 0.4;
      const nr = 4 + rnd()*rnd()*8; // right-skewed: pleomorphic, occasional huge atypical
      drawCell(g, x, y, 9+rnd()*3, nr, rnd, {nucFill: dark?HE.nucDark:HE.nuc, nucOffset:3});
    }
  }
  // invasive nests/tongues below the frond, infiltrating pale stroma
  const nests = [
    {cx:520, cy:330, rx:110, ry:70, rot:0.2}, {cx:610, cy:200, rx:80, ry:60, rot:-0.3}, {cx:470, cy:430, rx:90, ry:55, rot:0.1},
  ];
  nests.forEach(n=>{
    const d = blobPath(n.cx, n.cy, n.rx, n.ry, 0.22, 13, rnd, n.rot);
    g.appendChild(el('path', {d, fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.2}));
    for(let i=0;i<16;i++){
      const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.75;
      const px = Math.cos(a)*n.rx*r, py = Math.sin(a)*n.ry*r;
      const x = n.cx + px*Math.cos(n.rot) - py*Math.sin(n.rot);
      const y = n.cy + px*Math.sin(n.rot) + py*Math.cos(n.rot);
      const dark = rnd() < 0.4;
      drawCell(g, x, y, 8+rnd()*2.5, 4+rnd()*rnd()*7, rnd, {nucFill: dark?HE.nucDark:HE.nuc, nucOffset:2.5});
    }
  });
  // frequent mitoses — several figures, deliberately more than OCCC's single lonely one
  [[300,120,10],[560,300,-25],[500,410,35],[640,180,-8]].forEach(([x,y,rot])=>{
    g.appendChild(el('rect', {x:x-4, y:y-6, width:3, height:12, fill:HE.nucDark, transform:`rotate(${rot} ${x} ${y})`}));
    g.appendChild(el('rect', {x:x+2, y:y-6, width:3, height:12, fill:HE.nucDark, transform:`rotate(${-rot*0.7} ${x+4} ${y})`}));
  });
  return [
    {key:'papillary', x:220, y:150},
    {key:'nuclei',    x:300, y:75},
    {key:'invasion',  x:520, y:330},
  ];
}

function genPTC(g, rnd){
  // Papillary thyroid carcinoma — the diagnosis-on-the-nuclei slide. Fronds here DO carry a
  // drawn red fibrovascular core: "a central fibrovascular stalk covered by a neoplastic
  // epithelial lining" is this entity's verbatim source language (StatPearls NBK536943) —
  // the deliberate inverse of genHGSOC above, where that phrase was checked and found to
  // belong to OTHER serous entities, so its fronds are plain stroma. Nuclei are drawn as the
  // source's own list: enlarged/elongated, crowded and overlapping, chromatin cleared with
  // peripheral margination (open circles with a dark rim — "Orphan Annie eyes"), grooves on
  // some, two intranuclear cytoplasmic pseudo-inclusions. Sizes stay in a narrow band: the
  // verified features are clearing/grooves/crowding, NOT the >3x pleomorphism that defines
  // HGSOC, so no right-skewed size trick here. Psammoma bodies drawn without apology — they
  // sit on this tumor's diagnostic-feature list where HGSOC's page says only "variable."
  const fronds = [
    {cx:240, cy:150, rx:190, ry:46, rot:-0.22},
    {cx:560, cy:190, rx:150, ry:42, rot: 0.42},
    {cx:360, cy:375, rx:210, ry:50, rot:-0.04},
  ];
  fronds.forEach(f=>{
    const d = blobPath(f.cx, f.cy, f.rx, f.ry, 0.14, 16, rnd, f.rot);
    g.appendChild(el('path', {d, fill:HE.stroma, stroke:HE.stromaLn, 'stroke-width':1.4}));
    // the fibrovascular stalk: a red vessel core running the frond's long axis
    const cosR = Math.cos(f.rot), sinR = Math.sin(f.rot), L = f.rx*0.74;
    g.appendChild(el('line', {
      x1:f.cx - L*cosR, y1:f.cy - L*sinR, x2:f.cx + L*cosR, y2:f.cy + L*sinR,
      stroke:HE.vessel, 'stroke-width':7, 'stroke-linecap':'round', opacity:0.85,
    }));
    g.appendChild(el('line', {
      x1:f.cx - L*cosR, y1:f.cy - L*sinR, x2:f.cx + L*cosR, y2:f.cy + L*sinR,
      stroke:HE.vesselDk, 'stroke-width':2.2, 'stroke-linecap':'round', opacity:0.7,
    }));
    // crowded, overlapping epithelial rim of cleared nuclei — spacing deliberately tighter
    // than the frond perimeter strictly fits (the "crowding and overlap" criterion)
    const per = Math.round(2*Math.PI*Math.sqrt((f.rx*f.rx+f.ry*f.ry)/2) / 9.5);
    for(let i=0;i<per;i++){
      const a = i/per*Math.PI*2;
      const px = Math.cos(a)*f.rx*1.05, py = Math.sin(a)*f.ry*1.14;
      const x = f.cx + px*cosR - py*sinR;
      const y = f.cy + px*sinR + py*cosR;
      const nr = 5.2 + rnd()*1.8;                  // enlarged, narrow size band
      const rot = rnd()*180;
      // Orphan Annie eye: cleared center, chromatin marginated to a dark rim
      g.appendChild(el('ellipse', {
        cx:x, cy:y, rx:nr, ry:nr*(0.62+rnd()*0.22), // elongated
        transform:`rotate(${rot.toFixed(0)} ${x} ${y})`,
        fill:HE.clear, stroke:HE.nuc, 'stroke-width':1.9, opacity:0.95,
      }));
      if(rnd() < 0.3){ // nuclear groove: a fold across the cleared face
        g.appendChild(el('line', {
          x1:x-nr*0.55, y1:y, x2:x+nr*0.55, y2:y,
          transform:`rotate(${rot.toFixed(0)} ${x} ${y})`,
          stroke:HE.nuc, 'stroke-width':1.1, opacity:0.8,
        }));
      }
    }
  });
  // two intranuclear cytoplasmic pseudo-inclusions: a pink pocket punched into the nucleus —
  // drawn exactly twice, the "occasional, not the rule" treatment (OCCC's single mitosis)
  [{x:240+190*1.05*Math.cos(0)*Math.cos(-0.22), y:150+190*1.05*Math.cos(0)*Math.sin(-0.22)},
   {x:560, y:190-42*1.14}].forEach(p=>{
    g.appendChild(el('ellipse', {cx:p.x, cy:p.y, rx:6.4, ry:5.2, fill:HE.clear, stroke:HE.nuc, 'stroke-width':2, opacity:0.98}));
    g.appendChild(el('circle', {cx:p.x, cy:p.y, r:2.9, fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':0.8}));
  });
  // psammoma bodies: same concentric-lamella technique as HGSOC's, drawn as full members of
  // the diagnostic picture rather than rarities
  [{x:680, y:352, r:18},{x:118, y:300, r:13}].forEach(p=>{
    for(let r=p.r; r>2; r-=p.r/3.4){
      g.appendChild(el('circle', {cx:p.x, cy:p.y, r:r, fill:'none', stroke:'#8f76a8', 'stroke-width':2.2, opacity:0.9}));
    }
  });
  return [
    {key:'papillae', x:360, y:375},
    {key:'nuclei',   x:560, y:145},
    {key:'psammoma', x:680, y:352},
  ];
}

function genFTC(g, rnd){
  // Follicular thyroid carcinoma — the diagnosis-at-a-boundary slide, a genuinely new
  // concept for this atlas: nothing about the cells is drawn as malignant, because nothing
  // about them IS (verified: FNA/IHC/sequencing all fail to separate FTC from adenoma —
  // PMC10135557). The slide's whole story is the capsule: an encapsulated nodule of small
  // crowded follicles, one full-thickness mushroom breach, one plugged capsular vessel.
  // Small helper: a follicle = ring of lining nuclei around a colloid center.
  const follicle = (x, y, r, colloidFill)=>{
    g.appendChild(el('circle', {cx:x, cy:y, r:r, fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
    g.appendChild(el('circle', {cx:x, cy:y, r:r*0.55, fill:colloidFill, opacity:0.9}));
    const n = Math.max(6, Math.round(r*0.85));
    for(let i=0;i<n;i++){
      const a = i/n*Math.PI*2 + rnd()*0.2;
      g.appendChild(el('ellipse', {
        cx:x+Math.cos(a)*r*0.8, cy:y+Math.sin(a)*r*0.8, rx:2.6, ry:2.1,
        fill:HE.nuc, opacity:0.92,
      }));
    }
  };
  // surrounding normal gland for contrast: large, placid, colloid-rich follicles (the
  // "spherical... storage compartments filled with colloid" of StatPearls NBK551659)
  [{x:95,y:85,r:52},{x:250,y:60,r:40},{x:700,y:80,r:56},{x:120,y:430,r:46},{x:715,y:445,r:50},{x:520,y:462,r:38}].forEach(f=>{
    follicle(f.x, f.y, f.r, HE.cyto);
  });
  // the encapsulated tumor nodule: thick fibrous capsule drawn as a heavy ring
  const nod = {cx:390, cy:255, rx:215, ry:150};
  const capsule = blobPath(nod.cx, nod.cy, nod.rx, nod.ry, 0.05, 18, rnd, 0.1);
  g.appendChild(el('path', {d:capsule, fill:HE.bg, stroke:HE.stromaLn, 'stroke-width':16, opacity:0.95}));
  g.appendChild(el('path', {d:capsule, fill:'none', stroke:HE.stroma, 'stroke-width':8, opacity:0.9}));
  // inside: small, crowded, back-to-back follicles — the pattern an adenoma reproduces exactly
  for(let i=0;i<46;i++){
    const a = rnd()*Math.PI*2, rr = Math.sqrt(rnd())*0.82;
    const x = nod.cx + Math.cos(a)*nod.rx*rr, y = nod.cy + Math.sin(a)*nod.ry*rr;
    follicle(x, y, 12+rnd()*5, HE.cytoLite);
  }
  // CAPSULAR INVASION: a full-thickness mushroom of tumor punching through the right side of
  // the capsule — the tongue is drawn after the capsule so its fill breaks the ring visibly
  const tx = nod.cx + nod.rx*0.98, ty = nod.cy - 20;
  const tongue = blobPath(tx+34, ty, 52, 34, 0.12, 12, rnd, 0.05);
  g.appendChild(el('path', {d:tongue, fill:HE.bg, stroke:HE.cytoLn, 'stroke-width':1.2}));
  follicle(tx+22, ty-8, 13, HE.cytoLite);
  follicle(tx+46, ty+8, 12, HE.cytoLite);
  follicle(tx+30, ty+18, 10, HE.cytoLite);
  // VASCULAR INVASION: a vessel at the capsule's far edge with a plug of tumor cells inside
  const vx = 660, vy = 385;
  g.appendChild(el('ellipse', {cx:vx, cy:vy, rx:46, ry:26, fill:'#f3d9d9', stroke:HE.vesselDk, 'stroke-width':3}));
  const plug = blobPath(vx-8, vy, 24, 14, 0.15, 10, rnd, 0);
  g.appendChild(el('path', {d:plug, fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  for(let i=0;i<8;i++){
    const a = rnd()*Math.PI*2, rr = Math.sqrt(rnd());
    g.appendChild(el('ellipse', {cx:vx-8+Math.cos(a)*20*rr, cy:vy+Math.sin(a)*10*rr, rx:2.6, ry:2.1, fill:HE.nuc}));
  }
  return [
    {key:'follicles', x:390, y:255},
    {key:'capsule',   x:tx+34, y:ty},
    {key:'vessel',    x:vx, y:vy},
  ];
}

function genMTC(g, rnd){
  // Medullary thyroid carcinoma: nests of polygonal-to-plasmacytoid tumor cells with abundant
  // eosinophilic cytoplasm and coarsely granular ("salt-and-pepper") chromatin, separated by
  // thin fibrovascular septae — and, distinctively, real AMYLOID: amorphous, homogeneous, pink
  // extracellular material filling those same septae, derived from the calcitonin this tumor
  // itself secretes. No shared "nested/organoid" primitive exists yet in this file (genCCRCC's
  // own clear-cell nests are an inline, non-reusable concept), so the nest architecture below is
  // built directly — new composition, though from the same blobPath/cell vocabulary every
  // generator in this file already uses. The amyloid fill reuses the hyaline-pink pairing
  // (#e2a9bb/#d093a8) drawFrond's own hyaline core option already established for another
  // cancer's amorphous eosinophilic material in this same file — amyloid and hyaline are both
  // amorphous eosinophilic extracellular deposits, so the reuse is a real one, not arbitrary.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.4}));
  const nests = [
    {cx:180, cy:140, r:76}, {cx:430, cy:110, r:64}, {cx:600, cy:250, r:70},
    {cx:220, cy:340, r:68}, {cx:470, cy:400, r:60},
  ];
  nests.forEach(n=>{
    g.appendChild(el('path', {d:blobPath(n.cx, n.cy, n.r, n.r*0.9, 0.12, 14, rnd, rnd()*Math.PI), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.3}));
    const cellN = Math.round(n.r*n.r/220);
    for(let i=0;i<cellN;i++){
      const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.86;
      const x = n.cx+Math.cos(a)*n.r*r, y = n.cy+Math.sin(a)*n.r*0.9*r;
      // coarse, irregular "salt-and-pepper" chromatin — larger and less uniform than the fine
      // chromatin every follicular-cell generator in this file uses.
      g.appendChild(el('ellipse', {cx:x, cy:y, rx:4.4+rnd()*1.3, ry:3.6+rnd()*1.1, transform:`rotate(${(rnd()*360).toFixed(0)} ${x} ${y})`, fill:HE.nuc, opacity:0.9}));
      for(let s=0;s<2;s++){
        g.appendChild(el('circle', {cx:x+(rnd()*2-1)*3, cy:y+(rnd()*2-1)*3, r:0.7+rnd()*0.5, fill:HE.nucDark, opacity:0.7}));
      }
    }
  });
  for(let i=0;i<nests.length;i++){
    for(let j=i+1;j<nests.length;j++){
      const a = nests[i], b = nests[j];
      const d = Math.hypot(a.cx-b.cx, a.cy-b.cy);
      if(d > (a.r+b.r)*1.6) continue;
      const mx = (a.cx+b.cx)/2, my = (a.cy+b.cy)/2;
      const ang = Math.atan2(b.cy-a.cy, b.cx-a.cx)*180/Math.PI;
      g.appendChild(el('ellipse', {cx:mx, cy:my, rx:d*0.28, ry:18+rnd()*6, transform:`rotate(${ang.toFixed(0)} ${mx} ${my})`, fill:'#e2a9bb', stroke:'#d093a8', 'stroke-width':1.2, opacity:0.85}));
    }
  }
  return [
    {key:'nests',      x:nests[0].cx, y:nests[0].cy - nests[0].r - 18},
    {key:'amyloid',    x:(nests[0].cx+nests[3].cx)/2, y:(nests[0].cy+nests[3].cy)/2},
    {key:'chromatin',  x:nests[2].cx, y:nests[2].cy},
  ];
}

function genATC(g, rnd){
  // Anaplastic thyroid carcinoma — this atlas's FIRST tumor built from spindle-shaped CELL
  // BODIES, not merely elongated nuclei — a precise distinction, checked directly rather than
  // assumed: genGBM's own pseudopalisading rim (this file, two organs over) already draws
  // elongated tumor-cell NUCLEI (rx:5.4/ry:2 ellipses), but with no matching spindle-shaped
  // cytoplasm around them, and genCRC's desmoplastic stroma draws true spindle-shaped cell
  // bodies, but only as REACTIVE STROMAL FIBROBLASTS in the background, never the tumor
  // population itself. Checked directly against every existing generator before writing this
  // one: none represents an elongated TUMOR-cell BODY arranged in organized fascicles, so this is
  // genuinely new drawing code, not a reuse (matching ILC's own targetoid pattern precedent one
  // family, one tier up: full reuse / partial reuse / bespoke — this is the third tier). WHO 2022
  // names three patterns that "can occur alone or in any combination" — sarcomatoid (spindle),
  // giant cell, and epithelioid/squamoid — confirmed against a 144-case series (Suster et al.,
  // Virchows Arch, 2026, PMID 41748947) to genuinely co-occur within one tumor rather than exist
  // as separate pure forms; squamoid areas specifically were found admixed with the other two
  // patterns "in all cases". All three are drawn admixed in one field below; the giant cells and
  // the small epithelioid nest are simple enough to build from the same ellipse/nucleus
  // vocabulary every other generator already uses — it is specifically the spindle fascicles that
  // needed new geometry.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.45}));
  necrosisBlob(g, 150, 420, 70, 46, rnd, 0.3);
  // FASCICLES: bundles of elongated spindle cells running at different angles, some crossing
  // near right angles — echoing the "alternating fascicles... cut at right angles" description
  // of this pattern's lower-grade sub-form; the field overall reads high-grade (larger,
  // hyperchromatic spindle cells, admixed giant cells below), the more common sub-form.
  const bands = [
    {x0:40, y0:120, ang:0.15, len:520, n:34},
    {x0:60, y0:260, ang:1.35, len:260, n:20},
    {x0:330, y0:60, ang:0.95, len:300, n:22},
  ];
  bands.forEach(b=>{
    const dx = Math.cos(b.ang), dy = Math.sin(b.ang);
    const px = -dy, py = dx;
    for(let i=0;i<b.n;i++){
      const t = i/b.n*b.len + rnd()*14;
      const off = (rnd()*2-1)*16;
      const cx = b.x0 + dx*t + px*off, cy = b.y0 + dy*t + py*off;
      const ang = b.ang*180/Math.PI + (rnd()*2-1)*10;
      const rx = 13+rnd()*5, ry = 3.2+rnd()*1.3;
      g.appendChild(el('ellipse', {cx, cy, rx, ry, transform:`rotate(${ang.toFixed(0)} ${cx} ${cy})`, fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':0.9, opacity:0.92}));
      g.appendChild(el('ellipse', {cx, cy, rx:rx*0.42, ry:ry*0.72, transform:`rotate(${ang.toFixed(0)} ${cx} ${cy})`, fill:HE.nucDark, opacity:0.95}));
    }
  });
  // a storiform whorl — spindle cells radiating around a hub, the same high-grade sub-pattern's
  // own named architecture.
  const hub = {cx:560, cy:340, r:76};
  const nw = 26;
  for(let i=0;i<nw;i++){
    const a = i/nw*Math.PI*2 + rnd()*0.1;
    const r = hub.r*(0.35+rnd()*0.6);
    const cx = hub.cx+Math.cos(a)*r, cy = hub.cy+Math.sin(a)*r;
    const ang = a*180/Math.PI + 90;
    const rx = 12+rnd()*4, ry = 3+rnd()*1.2;
    g.appendChild(el('ellipse', {cx, cy, rx, ry, transform:`rotate(${ang.toFixed(0)} ${cx} ${cy})`, fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':0.9}));
    g.appendChild(el('ellipse', {cx, cy, rx:rx*0.4, ry:ry*0.75, transform:`rotate(${ang.toFixed(0)} ${cx} ${cy})`, fill:HE.nucDark, opacity:0.95}));
  }
  // multinucleated giant cells, admixed among the spindle population
  const giants = [[210,90],[470,470],[130,260]];
  giants.forEach(([x,y])=>{
    g.appendChild(el('path', {d:blobPath(x, y, 26, 20, 0.3, 12, rnd, rnd()*Math.PI), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.3}));
    const nn = 3+Math.floor(rnd()*2);
    for(let i=0;i<nn;i++){
      const a = i/nn*Math.PI*2 + rnd()*0.4;
      const nx = x+Math.cos(a)*10, ny = y+Math.sin(a)*8;
      g.appendChild(el('ellipse', {cx:nx, cy:ny, rx:6.5, ry:5, transform:`rotate(${(rnd()*40-20).toFixed(0)} ${nx} ${ny})`, fill:HE.nucDark, opacity:0.92}));
    }
  });
  // a small epithelioid/squamoid nest, admixed at the field's edge rather than pure/isolated —
  // "squamous or squamoid features were associated in all cases with other areas" (Suster 2026)
  const nest = {cx:660, cy:150, rx:60, ry:50};
  g.appendChild(el('path', {d:blobPath(nest.cx, nest.cy, nest.rx, nest.ry, 0.14, 12, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.2}));
  for(let i=0;i<22;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.82;
    const x = nest.cx+Math.cos(a)*nest.rx*r, y = nest.cy+Math.sin(a)*nest.ry*r;
    g.appendChild(el('circle', {cx:x, cy:y, r:3.4+rnd()*1.1, fill:HE.nuc, opacity:0.9}));
  }
  return [
    {key:'spindle',  x:bands[0].x0+120, y:bands[0].y0-24},
    {key:'giant',    x:giants[1][0],    y:giants[1][1]+30},
    {key:'squamoid', x:nest.cx,         y:nest.cy-nest.ry-16},
  ];
}

function genEndometrioid(g, rnd){
  // Endometrioid carcinoma — the ovary pilot's third slide. vs genHGSOC: no branching
  // papillae at all; this is CONFLUENT GLANDS, packed back-to-back with almost no
  // intervening stroma (the "expansile" invasion pattern, Diagnostics 2021 Section 4.1).
  // vs genOCCC (same organ): normal eosinophilic cytoplasm throughout, no clear cells, no
  // hobnailing, no hyaline. Grade is drawn as a genuine architectural fact, not decoration:
  // one corner loses gland formation entirely (a solid sheet), the >5%-solid grade-2/3
  // criterion made visible. Mitotic count stays moderate (5-10/10HPF) — fewer scattered
  // figures than HGSOC's slide, more than OCCC's lone one.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  g.appendChild(el('path', {d:blobPath(400, 250, 420, 275, 0.06, 14, rnd, 0), fill:HE.stroma, opacity:0.3}));
  // confluent glands: packed hexagonal-ish lumens with almost no gap between rings
  const glandSpots = [];
  for(let row=0; row<6; row++){
    for(let col=0; col<8; col++){
      if(col>4 && row>3) continue; // leave the bottom-right quadrant for the solid sheet
      const jitterX = (rnd()*2-1)*6, jitterY = (rnd()*2-1)*6;
      glandSpots.push({ x:70 + col*72 + (row%2?36:0) + jitterX, y:60 + row*68 + jitterY, r:26+rnd()*6 });
    }
  }
  glandSpots.forEach(s=>{ drawGlandRing(g, s.x, s.y, s.r*0.5, rnd, { cellR:9, nucMin:3.6, nucMax:5.0 }); });
  // one region with total loss of gland formation: a solid sheet (the grade criterion)
  const sheet = { cx:610, cy:390, rx:150, ry:98 };
  g.appendChild(el('path', {d:blobPath(sheet.cx, sheet.cy, sheet.rx, sheet.ry, 0.1, 14, rnd, 0.1), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1.2}));
  for(let i=-9;i<=9;i++){
    for(let j=-5;j<=5;j++){
      const x = sheet.cx + i*15 + (rnd()*2-1)*3, y = sheet.cy + j*14 + (rnd()*2-1)*3;
      if(((x-sheet.cx)/(sheet.rx*0.85))**2 + ((y-sheet.cy)/(sheet.ry*0.82))**2 > 1) continue;
      drawCell(g, x, y, 8.4+rnd()*1.6, 3.8+rnd()*1.1, rnd, {});
    }
  }
  // moderate mitotic activity, scattered across the glandular field
  [{x:230,y:180},{x:340,y:340},{x:150,y:410},{x:460,y:150}].forEach(m=>{
    const rot = rnd()*180;
    g.appendChild(el('rect', {x:m.x-1.5, y:m.y-6, width:3, height:12, fill:HE.nucDark, transform:`rotate(${rot.toFixed(0)} ${m.x} ${m.y})`}));
    g.appendChild(el('rect', {x:m.x-1.5, y:m.y-6, width:3, height:12, fill:HE.nucDark, transform:`rotate(${(rot+70).toFixed(0)} ${m.x} ${m.y})`}));
  });
  return [
    {key:'glands', x:210, y:230},
    {key:'grade', x:610, y:390},
    {key:'mitoses', x:340, y:340},
  ];
}

function genMucinous(g, rnd){
  // Mucinous carcinoma — deliberately the LARGEST, most cyst-dominated slide in this organ:
  // real mucinous tumors are big (8-40cm), the one histologic fact this atlas can render at
  // slide scale as "unusually large, mucin-swollen glands" rather than a number. Cytoplasm
  // is drawn PALE and FOAMY (mucin-laden) with the nucleus pushed to the cell's OUTER edge —
  // the opposite of OCCC's hobnail cells (nucleus bulging INTO the lumen) — because mucinous
  // cells are loaded with mucin on the luminal side, pushing the nucleus basally. Two
  // invasion zones drawn side by side per Diagnostics 2021 Section 6.1: expansile (glands
  // crowd with minimal stroma) and infiltrative (isolated glands in dense, scarred stroma).
  const MUCIN = '#f7ecd8'; // pale, faintly warm — distinct from every other fill in this palette
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  g.appendChild(el('path', {d:blobPath(400, 250, 420, 275, 0.06, 14, rnd, 0), fill:HE.stroma, opacity:0.3}));
  const mucinousGland = (cx, cy, rx, ry, rot)=>{
    const d = blobPath(cx, cy, rx, ry, 0.12, 14, rnd, rot);
    g.appendChild(el('path', {d, fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1.3}));
    g.appendChild(el('path', {d:blobPath(cx, cy, rx*0.8, ry*0.78, 0.12, 14, rnd, rot), fill:MUCIN}));
    const per = Math.max(10, Math.round(2*Math.PI*Math.sqrt((rx*rx+ry*ry)/2) / 16));
    for(let i=0;i<per;i++){
      const a = i/per*Math.PI*2;
      const px = Math.cos(a)*rx*0.94, py = Math.sin(a)*ry*0.94;
      const x = cx + px*Math.cos(rot) - py*Math.sin(rot), y = cy + px*Math.sin(rot) + py*Math.cos(rot);
      // basally-oriented nucleus: pushed OUT toward the gland's outer wall, away from the mucin lumen
      g.appendChild(el('ellipse', {cx:x, cy:y, rx:4.6, ry:3.2, transform:`rotate(${(a*180/Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`, fill:HE.nuc, opacity:0.92}));
    }
  };
  // expansile zone (left): large glands crowd together, almost no stroma between them
  [{cx:150,cy:130,rx:105,ry:78,rot:-0.1},{cx:280,cy:220,rx:88,ry:68,rot:0.2},{cx:120,cy:330,rx:98,ry:74,rot:0.05}].forEach(c=>mucinousGland(c.cx,c.cy,c.rx,c.ry,c.rot));
  // infiltrative zone (right): isolated smaller glands within denser, scarred stroma
  g.appendChild(el('path', {d:blobPath(590, 300, 190, 165, 0.1, 16, rnd, 0), fill:HE.stromaLn, opacity:0.55}));
  [{cx:520,cy:190,r:34},{cx:640,cy:230,r:28},{cx:560,cy:330,r:30},{cx:660,cy:370,r:26}].forEach(c=>mucinousGland(c.cx,c.cy,c.r,c.r*0.85,rnd()*0.4));
  return [
    {key:'mucin', x:150, y:130},
    {key:'size', x:280, y:220},
    {key:'invasion', x:590, y:300},
  ];
}

function genLGSC(g, rnd){
  // Low-grade serous carcinoma — the deliberate quiet counterpart to genHGSOC in the SAME
  // organ. Small, evenly-sized papillae (no hierarchical branching, no hyaline cores unlike
  // genOCCC's papillae), a single uniform cell layer with MILD atypia (narrow nucleus-size
  // band, unlike HGSOC's >3x variation), the occasional PROMINENT NUCLEOLUS (a small dark
  // dot inside a nucleus — Diagnostics 2021: "may have prominent nucleoli"), and exactly one
  // mitotic figure — the same "loneliness is the point" idiom genOCCC uses, since this
  // tumor's own defining contrast with HGSOC is how little is happening per field.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  g.appendChild(el('path', {d:blobPath(400, 250, 420, 275, 0.06, 14, rnd, 0), fill:HE.stroma, opacity:0.35}));
  const uNuc = ()=>3.6 + rnd()*0.9; // narrow band — the anti-HGSOC discipline, same as OCCC's
  const papillae = [];
  for(let row=0; row<5; row++){
    for(let col=0; col<7; col++){
      papillae.push({ cx: 90 + col*100 + (row%2?40:0) + (rnd()*2-1)*10, cy: 70 + row*88 + (rnd()*2-1)*10, r: 34+rnd()*8 });
    }
  }
  let nucleolusCount = 0;
  papillae.forEach(p=>{
    const d = blobPath(p.cx, p.cy, p.r, p.r*0.9, 0.08, 12, rnd, rnd()*0.5);
    g.appendChild(el('path', {d, fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1.1}));
    const per = Math.max(8, Math.round(p.r*0.4));
    for(let i=0;i<per;i++){
      const a = i/per*Math.PI*2 + rnd()*0.1;
      const x = p.cx + Math.cos(a)*p.r*0.86, y = p.cy + Math.sin(a)*p.r*0.8;
      g.appendChild(el('circle', {cx:x, cy:y, r:uNuc(), fill:HE.nuc, opacity:0.92}));
      // a scattered minority carry a visibly prominent nucleolus
      if(rnd() < 0.1 && nucleolusCount < 5){
        nucleolusCount++;
        g.appendChild(el('circle', {cx:x+(rnd()*2-1)*0.8, cy:y+(rnd()*2-1)*0.8, r:1.3, fill:HE.nucDark}));
      }
    }
  });
  // exactly one mitotic figure — the low-proliferation contrast with HGSOC's own slide
  g.appendChild(el('rect', {x:497, y:381, width:3, height:11, fill:HE.nucDark, transform:'rotate(18 498 386)'}));
  g.appendChild(el('rect', {x:504, y:381, width:3, height:11, fill:HE.nucDark, transform:'rotate(-20 505 386)'}));
  return [
    {key:'papillae', x:190, y:158},
    {key:'atypia', x:390, y:246},
    {key:'mitoses', x:498, y:386},
  ];
}

// Prostatic ductal adenocarcinoma — reinstated verbatim from phaseC_design.md §7's withheld
// proof-of-family generator (built, live-verified, then deliberately withheld pending a real
// `cancerEntries` stub — now real, phaseC_design.md §13). Papillary architecture "the most
// helpful diagnostic feature" (Seipel et al., Pathology, 2016, PMID 27321992); cribriform the
// second most common pattern, real tumors admixed with acinar carcinoma at a median 50% ductal
// component (Au et al., Ann Diagn Pathol, 2019, PMID 30772651) — drawn as a third zone of
// ordinary discrete acinar glands, the honest multi-pattern framing LUAD/prostate-acinar/OCCC
// already use.
function genProstateDuctal(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  g.appendChild(el('path', {d:blobPath(400, 250, 420, 275, 0.06, 14, rnd, 0), fill:HE.stroma, opacity:0.3}));
  const fronds = [
    {cx:190, cy:130, rx:150, ry:44, rot:-0.2},
    {cx:150, cy:340, rx:135, ry:40, rot: 0.28},
  ];
  fronds.forEach(f=>drawFrond(g, rnd, f, {
    core:{type:'fibrovascular', length:0.72},
    rimSpacing:9, radialJitter:0.16, nucStyle:'columnar', nucSize:()=>5+rnd()*2,
  }));
  const crib = drawCribriformMass(g, rnd, 460, 180, 110, 92, {lumenCount:11, lumenRMin:10, lumenRMax:16});
  const acinarSpots = [
    {x:660, y:110, r:20}, {x:600, y:190, r:16}, {x:665, y:260, r:22},
    {x:590, y:340, r:17}, {x:670, y:410, r:19},
  ];
  acinarSpots.forEach(s=>drawGlandRing(g, s.x, s.y, s.r, rnd, {nucMin:3, nucMax:4.2}));
  return [
    {key:'papillary',  x:190, y:130},
    {key:'cribriform', x:crib.cx, y:crib.cy+crib.ry+18},
    {key:'admixture',  x:660, y:110},
  ];
}

// Prostate neuroendocrine carcinoma — this atlas's first real dispatch of drawSmallCellSheet
// (built and proven on a withheld lungs-SCLC demo, phaseC_design.md §7a; the primitive itself
// was kept in this file specifically for the day a real consumer authored). Two sheet zones +
// one necrosis patch (necrosisBlob, pre-existing and unmodified) — no crush-artifact pass, since
// that effect is specific to lung specimens sampled by bronchoscopy, not this entry's own
// biopsy/prostatectomy sampling. Citations: see HISTOLOGY_PNEURO in js/organs/prostate.js.
function genProstateNeuro(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const sheetA = drawSmallCellSheet(g, rnd, 220, 190, 175, 145, {spacing:8.5, moldingReach:1.35});
  const sheetB = drawSmallCellSheet(g, rnd, 560, 340, 165, 130, {spacing:8.5, moldingReach:1.35, rot:0.3});
  necrosisBlob(g, 430, 150, 90, 62, rnd, -0.1);
  return [
    {key:'molding', x:sheetA.cx, y:sheetA.cy},
    {key:'naked',   x:sheetB.cx, y:sheetB.cy},
    {key:'necrosis', x:430, y:150},
  ];
}

// Small cell lung cancer (SCLC) — the neuroendocrine histology family's HOME-ORGAN consumer:
// Ng & Li, Ann Diagn Pathol, 2024, PMID 39342665's own 37-case SCLC cohort is what prostate's
// pneuro entry borrowed cross-organ (see genProstateNeuro above); here the same figures are this
// entity's own, not an application. ZERO NEW DRAWING CODE — the exact same drawSmallCellSheet
// (x2) + necrosisBlob dispatch as pneuro, proving the family's reuse the way genProstateDuctal's
// papillary/cribriform reuse already did for a different family. "Marked nuclear irregularity"
// (86%, the cohort's third-most-common feature) and crush artifact (real, cited, but the source
// gives only a qualitative bronchoscopy-vs-effusion contrast, no overall rate) are named in the
// intro/ariaSummary text rather than given their own drawn feature — the same "name more than is
// drawn" treatment LUAD's own five-WHO-patterns-but-three-drawn intro already established — since
// nuclear irregularity is already visually present in the molded cells' own elongated shape
// (no new geometry needed) and crush artifact has no clean number to anchor a labeled claim on.
// Citations: see HISTOLOGY_SCLC in js/organs/lungs.js.
function genLungsSCLC(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const sheetA = drawSmallCellSheet(g, rnd, 220, 190, 175, 145, {spacing:8.5, moldingReach:1.35});
  const sheetB = drawSmallCellSheet(g, rnd, 560, 340, 165, 130, {spacing:8.5, moldingReach:1.35, rot:0.3});
  necrosisBlob(g, 430, 150, 90, 62, rnd, -0.1);
  return [
    {key:'molding', x:sheetA.cx, y:sheetA.cy},
    {key:'naked',   x:sheetB.cx, y:sheetB.cy},
    {key:'necrosis', x:430, y:150},
  ];
}

// Bladder neuroendocrine carcinoma — the neuroendocrine histology family's FOURTH real
// consumer (after Prostate's pneuro, Lungs' sclc, and this same family's own drawSmallCellSheet
// primitive design). Zero new drawing code: same two drawSmallCellSheet calls + necrosisBlob as
// genLungsSCLC, this entity's own real cited features (nuclear molding, naked nuclei,
// geographic necrosis — Akbulut et al., 2024; Cancer, 1997, PMID 9010109).
function genBlNEC(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const sheetA = drawSmallCellSheet(g, rnd, 220, 190, 175, 145, {spacing:8.5, moldingReach:1.35});
  const sheetB = drawSmallCellSheet(g, rnd, 560, 340, 165, 130, {spacing:8.5, moldingReach:1.35, rot:0.3});
  necrosisBlob(g, 430, 150, 90, 62, rnd, -0.1);
  return [
    {key:'molding', x:sheetA.cx, y:sheetA.cy},
    {key:'naked',   x:sheetB.cx, y:sheetB.cy},
    {key:'necrosis', x:430, y:150},
  ];
}

// Bladder squamous cell carcinoma — one sheet showing both defining features together (unlike
// Lungs' own genLUSC, which draws two SEPARATE zones for two different WHO histologic variants,
// this entity's two features — keratin pearls and intercellular bridges — coexist within one
// pure squamous carcinoma, not two variants). Reuses drawKeratinPearl verbatim and the same
// bridge-line technique genLUSC's own non-keratinizing zone uses.
function genBlSCC(g, rnd){
  const sheet = {cx:400, cy:250, rx:320, ry:200};
  g.appendChild(el('path', {d:blobPath(sheet.cx, sheet.cy, sheet.rx, sheet.ry, 0.1, 16, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  const pearls = [{x:230, y:170, r:36}, {x:520, y:300, r:44}, {x:260, y:360, r:28}];
  const cells = [];
  for(let gx=-sheet.rx; gx<=sheet.rx; gx+=17){
    for(let gy=-sheet.ry; gy<=sheet.ry; gy+=17){
      if((gx/sheet.rx)**2 + (gy/sheet.ry)**2 > 0.9) continue;
      const x = sheet.cx+gx+(rnd()*2-1)*3, y = sheet.cy+gy+(rnd()*2-1)*3;
      if(pearls.some(p=>Math.hypot(x-p.x, y-p.y) < p.r*1.15)) continue;
      cells.push({x, y});
    }
  }
  cells.forEach((c, i)=>{
    for(let j=i+1;j<cells.length;j++){
      const d = Math.hypot(cells[j].x-c.x, cells[j].y-c.y);
      if(d < 19) g.appendChild(el('line', {x1:c.x, y1:c.y, x2:cells[j].x, y2:cells[j].y, stroke:HE.cytoLn, 'stroke-width':1.1, opacity:0.75}));
    }
  });
  cells.forEach(c=>drawCell(g, c.x, c.y, 7, 4.3+rnd()*1.8, rnd, {nucOffset:1.5}));
  pearls.forEach(p=>drawKeratinPearl(g, p.x, p.y, p.r, rnd));
  return [
    {key:'pearls',  x:520, y:300},
    {key:'bridges', x:sheet.cx, y:sheet.cy},
  ];
}

// Bladder adenocarcinoma (non-urachal) — the enteric, gland-forming pattern. Reuses
// drawGlandRing verbatim (zero new drawing code, the same primitive genPDAC/genLUAD already
// use), scattered at random orientations the way genPDAC's own haphazard-arrangement gland
// field is drawn.
function genBlADC(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.cytoLite, opacity:0.5}));
  const glands = [
    {x:150, y:120, r:34}, {x:400, y:90,  r:28}, {x:640, y:160, r:32},
    {x:230, y:300, r:30}, {x:480, y:340, r:36}, {x:150, y:420, r:26},
    {x:660, y:400, r:30},
  ];
  glands.forEach(s=>{
    const gg = el('g', {transform:`rotate(${(rnd()*90-45).toFixed(0)} ${s.x} ${s.y})`});
    g.appendChild(gg);
    drawGlandRing(gg, s.x, s.y, s.r, rnd, {nucMin:3.4, nucMax:4.8, cellR:11});
  });
  // mucin pools: small pale blue-gray extracellular mucin deposits near a couple of the
  // glands — real, cited, present within and around enteric-pattern glands (Gopalan et al.,
  // 2009), though heavy mucin production is chiefly a urachal, not non-urachal, feature (the
  // intro text's own honesty distinction).
  const mucinPools = [{x:310, y:190, rx:34, ry:24}, {x:560, y:250, rx:30, ry:22}];
  mucinPools.forEach(p=>{
    g.appendChild(el('path', {d:blobPath(p.x, p.y, p.rx, p.ry, 0.22, 10, rnd, rnd()*Math.PI), fill:'#dce8e6', stroke:'#b9cfcb', 'stroke-width':1, opacity:0.85}));
  });
  // focal signet-ring cells: reuses genGDiffuse's own signet-ring drawing verbatim (the
  // family's second real consumer), drawn SPARINGLY — a minority, focal finding in non-urachal
  // disease (Gopalan et al., 2009: present focally in 8% of a 24-tumor series), not this
  // entity's own defining architecture the way it is for gastric diffuse-type adenocarcinoma.
  const signets = [{x:585, y:130, r:16}, {x:610, y:160, r:13}];
  signets.forEach(s=>{
    const a = rnd()*Math.PI*2;
    g.appendChild(el('circle', {cx:s.x, cy:s.y, r:s.r, fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1.4}));
    g.appendChild(el('circle', {cx:s.x-s.r*0.22, cy:s.y-s.r*0.22, r:s.r*0.5, fill:'#ffffff', opacity:0.5}));
    const nx = s.x+Math.cos(a)*s.r*0.68, ny = s.y+Math.sin(a)*s.r*0.68;
    const ang = a*180/Math.PI + 90;
    g.appendChild(el('ellipse', {cx:nx, cy:ny, rx:s.r*0.52, ry:s.r*0.20, transform:`rotate(${ang.toFixed(0)} ${nx} ${ny})`, fill:HE.nucDark, opacity:0.95}));
  });
  return [
    {key:'glands', x:480, y:340},
    {key:'mucin',  x:310, y:190},
    {key:'signet', x:597, y:145},
  ];
}

function genPACC(g, rnd){
  // Acinar cell carcinoma: solid sheets and small rounded acinar (gland-like) clusters of cells
  // with abundant granular eosinophilic cytoplasm and basally-oriented nuclei carrying a single
  // prominent nucleolus. Reuses drawCell verbatim for the base cell (the same cytoplasm+nucleus
  // primitive this file's own generators are built from) and drawGlandRing for the acinar
  // clusters (the same primitive this atlas's own colorectal/LUAD/bladc entries already use for
  // gland-forming architecture) — the one genuinely new touch is a small granule-dot overlay
  // inside each cell's cytoplasm; this pass's own search of this file found no existing primitive
  // depicting granular cytoplasm before this one.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.cytoLite, opacity:0.5}));
  function granularCell(x, y, r, rnd, opts){
    const o = opts || {};
    drawCell(g, x, y, r, r*0.42, rnd, {nucOffset:r*0.32, ...o});
    const gN = Math.round(r*0.9);
    for(let i=0;i<gN;i++){
      const a = rnd()*Math.PI*2, rr = Math.sqrt(rnd())*r*0.82;
      g.appendChild(el('circle', {cx:x+Math.cos(a)*rr, cy:y+Math.sin(a)*rr, r:0.7+rnd()*0.6, fill:HE.vessel, opacity:0.45}));
    }
  }
  // Solid sheet, upper-left third of the field.
  const sheetCells = [];
  for(let row=0; row<5; row++){
    for(let col=0; col<7; col++){
      sheetCells.push({x:70+col*36+(rnd()*10-5), y:70+row*34+(rnd()*10-5), r:13+rnd()*3});
    }
  }
  sheetCells.forEach(c=>granularCell(c.x, c.y, c.r, rnd));
  // Acinar clusters, lower-right two-thirds — small rounded gland-like groups reusing drawGlandRing,
  // then a granule-dot overlay per ring so the acinar cells still read as granular, not smooth.
  const acini = [
    {x:430, y:150, r:46}, {x:600, y:120, r:38}, {x:520, y:280, r:44},
    {x:660, y:320, r:40}, {x:410, y:400, r:42}, {x:590, y:430, r:36},
  ];
  acini.forEach(a=>{
    drawGlandRing(g, a.x, a.y, a.r*0.42, rnd, {nucMin:a.r*0.16, nucMax:a.r*0.22, cellR:a.r*0.5});
    const gN = Math.round(a.r*1.1);
    for(let i=0;i<gN;i++){
      const ang = rnd()*Math.PI*2, rr = a.r*0.55 + rnd()*a.r*0.35;
      g.appendChild(el('circle', {cx:a.x+Math.cos(ang)*rr, cy:a.y+Math.sin(ang)*rr, r:0.6+rnd()*0.5, fill:HE.vessel, opacity:0.4}));
    }
  });
  return [
    {key:'granules', x:sheetCells[10].x, y:sheetCells[10].y - 22},
    {key:'nuclei',   x:sheetCells[24].x, y:sheetCells[24].y},
    {key:'acinar',   x:acini[2].x, y:acini[2].y - acini[2].r - 14},
  ];
}

function genPNET(g, rnd){
  // Pancreatic neuroendocrine tumor: elongated trabecular ribbons of cells with coarse
  // "salt-and-pepper" chromatin, separated by thin fibrovascular septae — reuses genMTC's own
  // blobPath cell-cluster + coarse two-tone chromatin loop (the same technique, cited in that
  // generator's own comment as new composition from shared primitives), recomposed into
  // ELONGATED ribbons rather than round nests, and WITHOUT the amyloid fill MTC's own generator
  // draws, since PanNET has no real amyloid counterpart found in this pass's own search — thin
  // plain septae instead.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.4}));
  const ribbons = [
    {x0:80, y0:130, x1:320, y1:100, w:46}, {x0:360, y0:90,  x1:600, y1:160, w:40},
    {x0:120, y0:280, x1:400, y1:250, w:50}, {x0:440, y0:230, x1:690, y1:300, w:42},
    {x0:180, y0:400, x1:460, y1:420, w:44},
  ];
  ribbons.forEach(rb=>{
    const mx=(rb.x0+rb.x1)/2, my=(rb.y0+rb.y1)/2;
    const ang = Math.atan2(rb.y1-rb.y0, rb.x1-rb.x0)*180/Math.PI;
    const len = Math.hypot(rb.x1-rb.x0, rb.y1-rb.y0);
    const gg = el('g', {transform:`rotate(${ang.toFixed(1)} ${mx} ${my})`});
    g.appendChild(gg);
    gg.appendChild(el('path', {d:blobPath(mx, my, len/2+14, rb.w/2, 0.14, 16, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.3}));
    const cellN = Math.round(len*rb.w/900);
    for(let i=0;i<cellN;i++){
      const lx = (rnd()*2-1)*(len/2-6), ly = (rnd()*2-1)*(rb.w/2-6);
      const x = mx + lx*Math.cos(ang*Math.PI/180) - ly*Math.sin(ang*Math.PI/180);
      const y = my + lx*Math.sin(ang*Math.PI/180) + ly*Math.cos(ang*Math.PI/180);
      g.appendChild(el('ellipse', {cx:x, cy:y, rx:4.2+rnd()*1.2, ry:3.5+rnd()*1.0, transform:`rotate(${(rnd()*360).toFixed(0)} ${x} ${y})`, fill:HE.nuc, opacity:0.9}));
      for(let s=0;s<2;s++){
        g.appendChild(el('circle', {cx:x+(rnd()*2-1)*3, cy:y+(rnd()*2-1)*3, r:0.7+rnd()*0.5, fill:HE.nucDark, opacity:0.7}));
      }
    }
  });
  // Thin fibrovascular septae between neighboring ribbons — plain pale strands, no amyloid.
  for(let i=0;i<ribbons.length;i++){
    for(let j=i+1;j<ribbons.length;j++){
      const a=ribbons[i], b=ribbons[j];
      const amx=(a.x0+a.x1)/2, amy=(a.y0+a.y1)/2, bmx=(b.x0+b.x1)/2, bmy=(b.y0+b.y1)/2;
      const d = Math.hypot(amx-bmx, amy-bmy);
      if(d > 190) continue;
      const mx=(amx+bmx)/2, my=(amy+bmy)/2;
      const ang = Math.atan2(bmy-amy, bmx-amx)*180/Math.PI;
      g.appendChild(el('ellipse', {cx:mx, cy:my, rx:d*0.3, ry:9+rnd()*3, transform:`rotate(${ang.toFixed(0)} ${mx} ${my})`, fill:HE.stroma, stroke:HE.stromaLn, 'stroke-width':1, opacity:0.7}));
    }
  }
  return [
    {key:'trabecular', x:ribbons[0].x0+40, y:ribbons[0].y0-24},
    {key:'septae',     x:(ribbons[0].x1+ribbons[1].x0)/2, y:(ribbons[0].y1+ribbons[1].y0)/2},
    {key:'chromatin',  x:ribbons[2].x0+80, y:ribbons[2].y0},
  ];
}

function genPCYST(g, rnd){
  // Invasive carcinoma arising in IPMN, colloid pattern: large, dominant pools of pale acellular
  // mucin (reusing blobPath, the same primitive Bladder/adenocarcinoma's own small mucin pools
  // already use — but scaled up to be the field's dominant element, colloid carcinoma's own
  // defining architecture) with small clusters of malignant epithelial cells floating freely
  // inside them (reusing drawCell), plus a rim of the same cells lining one pool's edge.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.cytoLite, opacity:0.4}));
  const pools = [
    {x:230, y:170, rx:150, ry:100}, {x:560, y:150, rx:120, ry:90}, {x:420, y:360, rx:170, ry:105},
  ];
  pools.forEach((p,i)=>{
    g.appendChild(el('path', {d:blobPath(p.x, p.y, p.rx, p.ry, 0.16, 14, rnd, rnd()*Math.PI), fill:'#dce8e6', stroke:'#b9cfcb', 'stroke-width':1.4, opacity:0.9}));
  });
  // Floating epithelial clusters inside the first two pools.
  const floaters = [
    {x:200, y:150}, {x:270, y:200}, {x:540, y:130}, {x:580, y:175}, {x:400, y:340}, {x:460, y:390},
  ];
  floaters.forEach(f=>{
    const n = 2+Math.floor(rnd()*2);
    for(let i=0;i<n;i++){
      drawCell(g, f.x+(rnd()*2-1)*10, f.y+(rnd()*2-1)*10, 8+rnd()*2, 4.2+rnd()*1, rnd, {nucOffset:2});
    }
  });
  // A lining rim of cells along the third pool's own edge, the other real configuration this
  // pattern's diagnostic definition allows.
  const rimPool = pools[2];
  for(let a=0; a<Math.PI*2; a+=0.28){
    const x = rimPool.x + Math.cos(a)*rimPool.rx*0.94, y = rimPool.y + Math.sin(a)*rimPool.ry*0.94;
    drawCell(g, x, y, 7+rnd()*1.5, 3.8+rnd()*0.8, rnd, {nucOffset:1.5});
  }
  return [
    {key:'mucinpools', x:pools[0].x, y:pools[0].y - pools[0].ry - 16},
    {key:'floating',   x:floaters[2].x, y:floaters[2].y - 20},
    {key:'lining',     x:rimPool.x + rimPool.rx*0.7, y:rimPool.y - rimPool.ry*0.7},
  ];
}

function genBCC(g, rnd){
  // Basal cell carcinoma: solid basaloid nests with peripheral palisading (an outward-facing,
  // picket-fence ring of elongated nuclei at each nest's boundary) and a retraction artifact
  // (a thin, pale halo separating each nest from the surrounding stroma — a real, if
  // processing-artifactual, diagnostic clue: StatPearls NBK482439). No existing primitive draws
  // a SOLID nest with OUTWARD-facing peripheral nuclei — drawGlandRing's own ring faces a
  // central lumen, the opposite orientation — so the nest-plus-palisade shape here is genuinely
  // new, built from the same el()/blobPath()/rnd() primitives every generator in this file uses.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.stroma, opacity:0.35}));
  const nests = [
    {x:150, y:130, r:70}, {x:400, y:90,  r:58}, {x:620, y:150, r:64},
    {x:230, y:320, r:66}, {x:470, y:360, r:72}, {x:660, y:340, r:50},
  ];
  nests.forEach((n, ni)=>{
    const rot = rnd()*Math.PI;
    // Retraction artifact first, so a pale halo peeks out from behind the nest drawn over it.
    g.appendChild(el('path', {d:blobPath(n.x, n.y, n.r*1.14, n.r*1.1, 0.08, 16, rnd, rot), fill:HE.bg, opacity:0.9}));
    // The nest itself: densely basophilic, minimal visible cytoplasm.
    g.appendChild(el('path', {d:blobPath(n.x, n.y, n.r, n.r*0.96, 0.1, 16, rnd, rot), fill:HE.nucDark, stroke:HE.nuc, 'stroke-width':1.2, opacity:0.92}));
    // Peripheral palisading: elongated nuclei just inside the boundary, oriented tangentially.
    const pN = Math.round(n.r*0.42);
    for(let i=0;i<pN;i++){
      const a = i/pN*Math.PI*2 + rnd()*0.15;
      const x = n.x + Math.cos(a)*n.r*0.82, y = n.y + Math.sin(a)*n.r*0.79;
      const tangentDeg = (a*180/Math.PI) + 90;
      g.appendChild(el('ellipse', {cx:x, cy:y, rx:5.2+rnd()*1.0, ry:2.3+rnd()*0.5, transform:`rotate(${tangentDeg.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`, fill:HE.nuc, stroke:HE.nucDark, 'stroke-width':0.6, opacity:0.95}));
    }
    // Disorganized interior: smaller, randomly-oriented nuclei filling the nest's core.
    const iN = Math.round(n.r*0.55);
    for(let i=0;i<iN;i++){
      const a = rnd()*Math.PI*2, rr = Math.sqrt(rnd())*n.r*0.62;
      const x = n.x + Math.cos(a)*rr, y = n.y + Math.sin(a)*rr*0.94;
      g.appendChild(el('ellipse', {cx:x, cy:y, rx:3.4+rnd()*1.2, ry:2.8+rnd()*1.0, transform:`rotate(${(rnd()*180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`, fill:HE.nuc, opacity:0.85}));
    }
    // Mucin pools on two of the six nests — a real, commonly-reported finding (StatPearls).
    if(ni===1 || ni===4){
      for(let m=0;m<2;m++){
        const a = rnd()*Math.PI*2, rr = n.r*0.32;
        const mx = n.x+Math.cos(a)*rr, my = n.y+Math.sin(a)*rr*0.9;
        g.appendChild(el('path', {d:blobPath(mx, my, 10+rnd()*4, 7+rnd()*3, 0.2, 8, rnd, rnd()*Math.PI), fill:HE.clear, stroke:HE.clearLn, 'stroke-width':0.8, opacity:0.85}));
      }
    }
    // A mitotic figure on one nest — two small dark rotated bars, the same idiom this file's
    // own bladder/thyroid generators already use for frequent mitoses.
    if(ni===3){
      const mx = n.x-8, my = n.y+6;
      for(let s=0;s<2;s++){
        g.appendChild(el('rect', {x:mx-3+s*5, y:my-1.2, width:5, height:2.4, transform:`rotate(${(30+s*70).toFixed(0)} ${mx+s*5} ${my})`, fill:HE.nucDark}));
      }
    }
  });
  return [
    {key:'palisading', x:nests[0].x, y:nests[0].y - nests[0].r - 14},
    {key:'retraction',  x:nests[2].x, y:nests[2].y - nests[2].r - 14},
    {key:'mucin',       x:nests[4].x, y:nests[4].y - nests[4].r - 14},
  ];
}

function genSCC(g, rnd){
  // Cutaneous squamous cell carcinoma: the SAME defining architecture as this file's own genLUSC
  // (lung SCC) and genBlSCC (bladder SCC) — keratin pearls + intercellular bridges, real and
  // WHO-sourced for this organ too (Guo et al., Front Oncol, 2026, PMID 42482763; StatPearls
  // NBK441939). ZERO NEW DRAWING CODE: this is genLUSC's own two-zone technique dispatched again
  // verbatim (drawKeratinPearl + the intercellular-bridge line-between-near-neighbors idiom), the
  // same reuse this file's own SCLC/pductal generators already demonstrated for their own families.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.cytoLite, opacity:0.35}));
  const sheetA = {cx:210, cy:250, rx:190, ry:200};
  g.appendChild(el('path', {d:blobPath(sheetA.cx, sheetA.cy, sheetA.rx, sheetA.ry, 0.12, 14, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1}));
  const pearls = [{x:150, y:170, r:38}, {x:255, y:290, r:46}, {x:150, y:355, r:30}];
  for(let i=0;i<70;i++){
    const x = sheetA.cx-sheetA.rx+rnd()*sheetA.rx*2, y = sheetA.cy-sheetA.ry+rnd()*sheetA.ry*2;
    if(((x-sheetA.cx)/sheetA.rx)**2 + ((y-sheetA.cy)/sheetA.ry)**2 > 0.92) continue;
    if(pearls.some(p=>Math.hypot(x-p.x, y-p.y) < p.r*1.15)) continue;
    drawCell(g, x, y, 6.5+rnd()*2, 4.5+rnd()*2.2, rnd, {nucOffset:2});
  }
  pearls.forEach(p=>drawKeratinPearl(g, p.x, p.y, p.r, rnd));

  const sheetB = {cx:600, cy:250, rx:165, ry:200};
  g.appendChild(el('path', {d:blobPath(sheetB.cx, sheetB.cy, sheetB.rx, sheetB.ry, 0.12, 14, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1}));
  const bridgeCells = [];
  for(let gx=-sheetB.rx; gx<=sheetB.rx; gx+=17){
    for(let gy=-sheetB.ry; gy<=sheetB.ry; gy+=17){
      if((gx/sheetB.rx)**2 + (gy/sheetB.ry)**2 > 0.88) continue;
      bridgeCells.push({x:sheetB.cx+gx+(rnd()*2-1)*3, y:sheetB.cy+gy+(rnd()*2-1)*3});
    }
  }
  bridgeCells.forEach((c, i)=>{
    for(let j=i+1;j<bridgeCells.length;j++){
      const d = Math.hypot(bridgeCells[j].x-c.x, bridgeCells[j].y-c.y);
      if(d < 19) g.appendChild(el('line', {x1:c.x, y1:c.y, x2:bridgeCells[j].x, y2:bridgeCells[j].y, stroke:HE.cytoLn, 'stroke-width':1.1, opacity:0.75}));
    }
  });
  bridgeCells.forEach(c=>drawCell(g, c.x, c.y, 7, 4.3+rnd()*1.8, rnd, {nucOffset:1.5}));

  return [
    {key:'pearl',    x:255, y:290},
    {key:'bridges',  x:600, y:250},
  ];
}

function genMCC(g, rnd){
  // Merkel cell carcinoma: the neuroendocrine histology family's third real consumer (after
  // prostate's pneuro and lungs' SCLC), proving the same reuse a third time — drawSmallCellSheet
  // dispatched again verbatim for nuclear molding/salt-and-pepper chromatin, plus necrosisBlob.
  // The one genuinely new element: TRABECULAR growth, a real, quantified, distinguishing feature
  // for this cancer specifically (Bandino et al., 2018: >72% of MCC, rarely in mimicking small
  // round blue cell tumors) — built from the SAME drawSmallCellSheet primitive at a highly
  // elongated aspect ratio (ribbon-shaped rather than round), not new drawing code either.
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const sheetA = drawSmallCellSheet(g, rnd, 200, 160, 145, 120, {spacing:8, moldingReach:1.4});
  const trab1 = drawSmallCellSheet(g, rnd, 470, 300, 150, 34, {spacing:7.5, moldingReach:1.4, rot:0.35});
  const trab2 = drawSmallCellSheet(g, rnd, 560, 400, 130, 30, {spacing:7.5, moldingReach:1.4, rot:0.55});
  necrosisBlob(g, 330, 380, 70, 50, rnd, 0.2);
  return [
    {key:'molding',    x:sheetA.cx, y:sheetA.cy},
    {key:'chromatin',  x:sheetA.cx+60, y:sheetA.cy+40},
    {key:'trabecular', x:trab1.cx, y:trab1.cy},
  ];
}

// Lymph Nodes organ (2026-09-14) — eight entities, one verbatim histology reuse (ndlbcl below,
// registered as genCLymph — the identical disease this atlas's own Colon-organ clymph entity
// already draws, just presenting nodally) and seven genuinely new generators, checked against
// every existing primitive before writing new code per this project's own reuse-before-writing
// standard: none of drawGlandRing/drawWhorl/drawKeratinPearl/drawCribriformMass/drawFrond/
// drawSmallCellSheet/drawSingleFileCord fit follicular lymphoma's organized nodular architecture,
// Burkitt's starry-sky pattern, Hodgkin's sparse-large-cell-in-mixed-background, or AITL's
// arborizing vasculature — each gets real new drawing code below.

// Follicular lymphoma: the one entity on this screen whose growth pattern is itself organized
// into discrete follicles (Salaverria et al., 2023 — "at least a focal follicular growth
// pattern"), not a diffuse sheet. Each follicle is a mixed centrocyte/centroblast population,
// the real WHO-defined cytology.
function genFL(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const follicles = [
    {cx:230, cy:180, rx:110, ry:95},
    {cx:470, cy:150, rx:95,  ry:88},
    {cx:610, cy:320, rx:105, ry:92},
    {cx:280, cy:370, rx:90,  ry:80},
  ];
  follicles.forEach((f, i)=>{
    g.appendChild(el('path', {d:blobPath(f.cx, f.cy, f.rx, f.ry, 0.14, 14, rnd, i*0.7), fill:HE.stroma, stroke:HE.stromaLn, 'stroke-width':1.5}));
    for(let gx=-f.rx; gx<=f.rx; gx+=20){
      for(let gy=-f.ry; gy<=f.ry; gy+=20){
        if((gx/f.rx)**2 + (gy/f.ry)**2 > 0.82) continue;
        const x = f.cx+gx+(rnd()*2-1)*4, y = f.cy+gy+(rnd()*2-1)*4;
        const isCentroblast = rnd() < 0.28;
        drawCell(g, x, y, isCentroblast?6.5+rnd():4.5+rnd()*1.5, isCentroblast?4.2+rnd()*0.8:3+rnd()*1.4, rnd, {});
      }
    }
  });
  return [
    {key:'follicles',    x:follicles[0].cx - follicles[0].rx*0.55, y:follicles[0].cy - follicles[0].ry*0.7},
    {key:'centrocytes',  x:follicles[1].cx, y:follicles[1].cy},
    {key:'centroblasts', x:follicles[2].cx, y:follicles[2].cy - 20},
  ];
}

// Mantle cell lymphoma: monotonous small-medium cells with angulated nuclei, drawn at the
// mantle-zone growth pattern specifically (a paler, spared residual germinal center surrounded
// by an expanded cuff of neoplastic cells) — the most diagnostically distinctive of this
// disease's three real growth patterns, per Jares, Colomer & Campo, 2012.
function genMCL(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const field = {cx:400, cy:250, rx:330, ry:210};
  g.appendChild(el('path', {d:blobPath(field.cx, field.cy, field.rx, field.ry, 0.08, 16, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  const gc = {cx:400, cy:250, rx:80, ry:65};
  g.appendChild(el('path', {d:blobPath(gc.cx, gc.cy, gc.rx, gc.ry, 0.12, 12, rnd, 0), fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1.2}));
  for(let gx=-field.rx; gx<=field.rx; gx+=20){
    for(let gy=-field.ry; gy<=field.ry; gy+=20){
      if((gx/field.rx)**2 + (gy/field.ry)**2 > 0.9) continue;
      const x = field.cx+gx+(rnd()*2-1)*4, y = field.cy+gy+(rnd()*2-1)*4;
      if(((x-gc.cx)/gc.rx)**2 + ((y-gc.cy)/gc.ry)**2 < 1.05) continue; // spared GC stays empty
      drawCell(g, x, y, 5+rnd()*1.4, 3.6+rnd()*1.1, rnd, {});
    }
  }
  return [
    {key:'monotonous',  x:field.cx - field.rx*0.6, y:field.cy - field.ry*0.6},
    {key:'mantlezone',  x:gc.cx + gc.rx*1.4, y:gc.cy},
    {key:'residualgc',  x:gc.cx, y:gc.cy},
  ];
}

// Burkitt lymphoma: a monotonous medium-cell sheet, defined by the "starry sky" pattern —
// pale tingible-body macrophages scattered through the dark tumor cells — a direct visual
// consequence of this disease's near-total (>95%) proliferation rate.
function genBL(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const sheet = {cx:400, cy:250, rx:335, ry:215};
  g.appendChild(el('path', {d:blobPath(sheet.cx, sheet.cy, sheet.rx, sheet.ry, 0.08, 16, rnd, 0), fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1}));
  const macrophages = [];
  for(let i=0;i<11;i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.82;
    macrophages.push({x:sheet.cx+Math.cos(a)*sheet.rx*r, y:sheet.cy+Math.sin(a)*sheet.ry*r, r:16+rnd()*8});
  }
  for(let gx=-sheet.rx; gx<=sheet.rx; gx+=17){
    for(let gy=-sheet.ry; gy<=sheet.ry; gy+=17){
      if((gx/sheet.rx)**2 + (gy/sheet.ry)**2 > 0.85) continue;
      const x = sheet.cx+gx+(rnd()*2-1)*3, y = sheet.cy+gy+(rnd()*2-1)*3;
      if(macrophages.some(m=>((x-m.x)**2+(y-m.y)**2) < m.r*m.r)) continue;
      drawCell(g, x, y, 4.6+rnd()*0.9, 3.4+rnd()*0.7, rnd, {});
    }
  }
  macrophages.forEach(m=>{
    g.appendChild(el('path', {d:blobPath(m.x, m.y, m.r, m.r*0.9, 0.22, 10, rnd, rnd()*3), fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1, opacity:0.85}));
    for(let i=0;i<4;i++){
      const a = rnd()*Math.PI*2, rr = rnd()*m.r*0.5;
      g.appendChild(el('circle', {cx:m.x+Math.cos(a)*rr, cy:m.y+Math.sin(a)*rr, r:1.4+rnd()*1.6, fill:HE.debris, opacity:0.75}));
    }
  });
  const mitoses = [{x:260,y:150},{x:520,y:190},{x:360,y:340}];
  mitoses.forEach(m=>{
    const rot = rnd()*180;
    g.appendChild(el('rect', {x:m.x-1.4, y:m.y-5.5, width:2.8, height:11, fill:HE.nucDark, transform:`rotate(${rot.toFixed(0)} ${m.x} ${m.y})`}));
    g.appendChild(el('rect', {x:m.x-1.4, y:m.y-5.5, width:2.8, height:11, fill:HE.nucDark, transform:`rotate(${(rot+70).toFixed(0)} ${m.x} ${m.y})`}));
  });
  return [
    {key:'monotonous', x:sheet.cx - sheet.rx*0.6, y:sheet.cy - sheet.ry*0.7},
    {key:'starrysky',  x:macrophages[0].x, y:macrophages[0].y},
    {key:'mitoses',    x:mitoses[0].x, y:mitoses[0].y - 20},
  ];
}

// Classical Hodgkin lymphoma: a mixed reactive background (small lymphocytes, eosinophils,
// plasma cells) with rare, large, binucleate Reed-Sternberg cells — the inverse density of
// every other lymphoma on this screen, since HRS cells make up only 0.1-10% of the tumor mass.
function genCHL(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const field = {cx:400, cy:250, rx:330, ry:210};
  g.appendChild(el('path', {d:blobPath(field.cx, field.cy, field.rx, field.ry, 0.08, 16, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  for(let gx=-field.rx; gx<=field.rx; gx+=15){
    for(let gy=-field.ry; gy<=field.ry; gy+=15){
      if((gx/field.rx)**2 + (gy/field.ry)**2 > 0.9) continue;
      const x = field.cx+gx+(rnd()*2-1)*5, y = field.cy+gy+(rnd()*2-1)*5;
      const roll = rnd();
      if(roll < 0.10){ // eosinophil — bilobed, brighter/redder
        drawCell(g, x, y, 3.6, 2.2, rnd, {cytoFill:HE.vessel, nucFill:'#7a3030'});
      } else if(roll < 0.16){ // plasma cell — eccentric nucleus, denser cytoplasm
        drawCell(g, x, y, 3.4, 2.0, rnd, {cytoFill:HE.stroma, nucOffset:1.6});
      } else { // small reactive lymphocyte
        drawCell(g, x, y, 0, 2.4+rnd()*0.6, rnd, {});
      }
    }
  }
  const rs = [{x:270,y:200},{x:520,y:310}];
  rs.forEach(c=>{
    g.appendChild(el('ellipse', {cx:c.x, cy:c.y, rx:15, ry:13, fill:HE.cyto, stroke:HE.cytoLn, 'stroke-width':1.4}));
    [-5.2, 5.2].forEach(dx=>{
      g.appendChild(el('circle', {cx:c.x+dx, cy:c.y, r:6.2, fill:HE.nuc}));
      g.appendChild(el('circle', {cx:c.x+dx, cy:c.y, r:2.4, fill:HE.nucDark}));
    });
  });
  return [
    {key:'rscells',         x:rs[0].x, y:rs[0].y - 24},
    {key:'mixedbackground', x:field.cx + field.rx*0.4, y:field.cy - field.ry*0.5},
    {key:'rarity',          x:rs[1].x, y:rs[1].y - 24},
  ];
}

// AITL: a diffuse, polymorphous infiltrate of pale clear-cytoplasm T cells effaced through the
// node, with the disease's own single most recognizable feature — branching, arborizing
// high-endothelial venules — threading through it.
function genAITL(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const field = {cx:400, cy:250, rx:330, ry:210};
  g.appendChild(el('path', {d:blobPath(field.cx, field.cy, field.rx, field.ry, 0.08, 16, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  // arborizing vessels: a trunk with several branching segments
  function branch(g, x, y, angle, len, depth, rnd){
    if(depth <= 0 || len < 14) return;
    const x2 = x + Math.cos(angle)*len, y2 = y + Math.sin(angle)*len;
    g.appendChild(el('line', {x1:x, y1:y, x2:x2, y2:y2, stroke:HE.vesselDk, 'stroke-width':Math.max(1.4, depth*1.1), 'stroke-linecap':'round'}));
    branch(g, x2, y2, angle + 0.5 + rnd()*0.3, len*0.72, depth-1, rnd);
    branch(g, x2, y2, angle - 0.5 - rnd()*0.3, len*0.72, depth-1, rnd);
  }
  branch(g, 260, 400, -1.7, 90, 4, rnd);
  branch(g, 560, 380, -2.1, 85, 4, rnd);
  for(let gx=-field.rx; gx<=field.rx; gx+=16){
    for(let gy=-field.ry; gy<=field.ry; gy+=16){
      if((gx/field.rx)**2 + (gy/field.ry)**2 > 0.9) continue;
      const x = field.cx+gx+(rnd()*2-1)*4, y = field.cy+gy+(rnd()*2-1)*4;
      const roll = rnd();
      if(roll < 0.09){
        drawCell(g, x, y, 3.6, 2.2, rnd, {cytoFill:HE.vessel, nucFill:'#7a3030'}); // eosinophil
      } else if(roll < 0.15){
        drawCell(g, x, y, 3.4, 2.0, rnd, {cytoFill:HE.stroma, nucOffset:1.6}); // plasma cell
      } else {
        drawCell(g, x, y, 4.6+rnd()*0.8, 3.2+rnd()*0.7, rnd, {cytoFill:HE.clear, cytoStroke:HE.clearLn}); // clear TFH-derived cell
      }
    }
  }
  return [
    {key:'clearcells',   x:field.cx - field.rx*0.55, y:field.cy - field.ry*0.6},
    {key:'arborizing',   x:300, y:340},
    {key:'polymorphous', x:field.cx + field.rx*0.4, y:field.cy + field.ry*0.5},
  ];
}

// Nodal marginal zone lymphoma: pale, monocytoid cells surrounding darker residual follicular
// remnants — a biphasic pattern, and a diffuse rather than confined growth, matching this
// entity's own genuinely unresolved relationship to the marginal zone it is named for.
function genNMZL(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const field = {cx:400, cy:250, rx:330, ry:210};
  g.appendChild(el('path', {d:blobPath(field.cx, field.cy, field.rx, field.ry, 0.08, 16, rnd, 0), fill:HE.clear, stroke:HE.clearLn, 'stroke-width':1}));
  const remnants = [{cx:290, cy:200, r:60}, {cx:520, cy:320, r:52}];
  remnants.forEach(r=>{
    g.appendChild(el('path', {d:blobPath(r.cx, r.cy, r.r, r.r*0.88, 0.16, 12, rnd, rnd()*3), fill:HE.stroma, stroke:HE.stromaLn, 'stroke-width':1.2}));
    for(let gx=-r.r; gx<=r.r; gx+=16){
      for(let gy=-r.r*0.88; gy<=r.r*0.88; gy+=16){
        if((gx/r.r)**2 + (gy/(r.r*0.88))**2 > 0.85) continue;
        drawCell(g, r.cx+gx+(rnd()*2-1)*3, r.cy+gy+(rnd()*2-1)*3, 4.2+rnd(), 3.2+rnd()*0.8, rnd, {});
      }
    }
  });
  for(let gx=-field.rx; gx<=field.rx; gx+=18){
    for(let gy=-field.ry; gy<=field.ry; gy+=18){
      if((gx/field.rx)**2 + (gy/field.ry)**2 > 0.9) continue;
      const x = field.cx+gx+(rnd()*2-1)*4, y = field.cy+gy+(rnd()*2-1)*4;
      if(remnants.some(r=>((x-r.cx)**2+(y-r.cy)**2) < r.r*r.r*0.85)) continue;
      drawCell(g, x, y, 5.4+rnd()*1.2, 3.4+rnd()*0.9, rnd, {cytoFill:HE.clear, cytoStroke:HE.clearLn});
    }
  }
  return [
    {key:'monocytoid',        x:field.cx, y:field.cy + 60},
    {key:'residualfollicles', x:remnants[0].cx, y:remnants[0].cy},
    {key:'diffusegrowth',     x:field.cx - field.rx*0.55, y:field.cy - field.ry*0.6},
  ];
}

// PTCL-NOS: a pleomorphic, architecture-effacing infiltrate with no single defining cell type —
// a diagnosis reached by exclusion, drawn the same way: varied small/medium/large atypical
// cells with reactive eosinophils and plasma cells, no organized structure.
function genPTCLN(g, rnd){
  g.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const field = {cx:400, cy:250, rx:330, ry:210};
  g.appendChild(el('path', {d:blobPath(field.cx, field.cy, field.rx, field.ry, 0.08, 16, rnd, 0), fill:HE.cytoLite, stroke:HE.cytoLn, 'stroke-width':1}));
  for(let gx=-field.rx; gx<=field.rx; gx+=17){
    for(let gy=-field.ry; gy<=field.ry; gy+=17){
      if((gx/field.rx)**2 + (gy/field.ry)**2 > 0.9) continue;
      const x = field.cx+gx+(rnd()*2-1)*5, y = field.cy+gy+(rnd()*2-1)*5;
      const roll = rnd();
      if(roll < 0.08){
        drawCell(g, x, y, 3.4, 2.1, rnd, {cytoFill:HE.vessel, nucFill:'#7a3030'}); // eosinophil
      } else if(roll < 0.14){
        drawCell(g, x, y, 3.2, 1.9, rnd, {cytoFill:HE.stroma, nucOffset:1.5}); // plasma cell
      } else {
        const sizeRoll = rnd();
        const cytoR = sizeRoll<0.33 ? 3.4+rnd()*0.8 : sizeRoll<0.75 ? 5+rnd()*1 : 7+rnd()*1.6;
        drawCell(g, x, y, cytoR, cytoR*0.62, rnd, {});
      }
    }
  }
  return [
    {key:'pleomorphic', x:field.cx - field.rx*0.55, y:field.cy - field.ry*0.6},
    {key:'effaced',     x:field.cx, y:field.cy},
    {key:'reactive',    x:field.cx + field.rx*0.4, y:field.cy + field.ry*0.5},
  ];
}

const GENERATORS = {
  hgsoc:  genHGSOC,
  tnbc:   genTNBC,
  idc:    genIDC,
  ilc:    genILC,
  luad:   genLUAD,
  lusc:   genLUSC,
  sclc:   genLungsSCLC,
  ccrcc:  genCCRCC,
  prcc:   genPRCC,
  chrcc:  genCHRCC,
  hcc:    genHCC,
  ichol:  genICHOL,
  gbm:    genGBM,
  astro:  genASTRO,
  odg:    genODG,
  menin:  genMENIN,
  acinar: genProstate,
  crc:    genCRC,
  cmuc:   genCMuc,
  clymph: genCLymph,
  pdac:   genPDAC,
  gdiff:  genGDiffuse,
  gint:   genGInt,
  melanoma: genMelanoma,
  clear:  genOCCC,
  seminoma: genSeminoma,
  nsgct: genNSGCT,
  uc:     genBladderUC,
  blnec:  genBlNEC,
  blscc:  genBlSCC,
  bladc:  genBlADC,
  ptc:    genPTC,
  ftc:    genFTC,
  mtc:    genMTC,
  atc:    genATC,
  endo:   genEndometrioid,
  muc:    genMucinous,
  lgsc:   genLGSC,
  pneuro: genProstateNeuro,
  pductal: genProstateDuctal,
  pacc:   genPACC,
  pnet:   genPNET,
  pcyst:  genPCYST,
  bcc:    genBCC,
  scc:    genSCC,
  mcc:    genMCC,
  fl:     genFL,
  mcl:    genMCL,
  bl:     genBL,
  chl:    genCHL,
  aitl:   genAITL,
  ndlbcl: genCLymph,
  nmzl:   genNMZL,
  ptcln:  genPTCLN,
};

// ------------------------------------------------------------
// Layer wiring
// ------------------------------------------------------------
const layerEl = document.getElementById('txHistologyLayer');
const slideWrap = document.getElementById('histSlideWrap');
const toggleBtn = document.getElementById('txHistologyToggle');
const cellLayerEl = document.getElementById('txCellLayer');
const hiTitle = document.getElementById('hiTitle');
const hiText = document.getElementById('hiText');
const hiCite = document.getElementById('hiCite');

// The one always-true honesty line, shown with every citation — data rule 2 applied to a
// visual: the drawing is generated from the documented architecture, it is not a micrograph.
const STYLIZED_NOTE = 'Stylized illustration generated from the documented architecture — not a real patient micrograph. ';

let histologyOn = false;
let builtForCancerId = null;

function showIntroCard(h){
  hiTitle.textContent = 'Microscopic architecture';
  hiText.textContent = h.intro;
  hiCite.textContent = STYLIZED_NOTE + h.citation;
}

function buildSlide(cancerId){
  const detail = CANCER_DETAILS[cancerId];
  const h = detail.histology;
  slideWrap.innerHTML = '';
  if(!h || !GENERATORS[cancerId]) return false;

  const svg = el('svg', {viewBox:`0 0 ${VB.w} ${VB.h}`, xmlns:SVG_NS, preserveAspectRatio:'xMidYMid meet'});
  // The WebGL canvases get role="img" + a viewerAria description; the histology SVG gets the
  // same treatment, with the architecture summary as its accessible description — this is the
  // "real text summary, not just labeled points" a non-sighted user gets.
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', h.ariaSummary);
  svg.appendChild(el('rect', {x:0, y:0, width:VB.w, height:VB.h, fill:HE.bg}));
  const g = el('g', {});
  svg.appendChild(g);
  // Seeded off the cancer id: the same cancer always draws the same field — deterministic,
  // same discipline as every organicDisplace/spiculate seed in this app.
  const rnd = makeSeededRandom(seedFromKey('histology-'+cancerId));
  const anchors = GENERATORS[cancerId](g, rnd) || [];
  slideWrap.appendChild(svg);

  slideWrap.setAttribute('aria-label', 'Stylized microscopic view of ' + detail.title.toLowerCase());
  anchors.forEach(a=>{
    const feature = (h.features || []).find(f=>f.key===a.key);
    if(!feature) return; // an anchor without documented text gets no label at all
    const label = document.createElement('div');
    label.className = 'hist-label';
    label.textContent = feature.label;
    label.style.left = (a.x/VB.w*100)+'%';
    label.style.top = (a.y/VB.h*100)+'%';
    makeActivatable(label, ()=>{
      hiTitle.textContent = feature.label;
      hiText.textContent = feature.text;
      hiCite.textContent = STYLIZED_NOTE + h.citation;
    }, {label: feature.label + ' — explain this feature'});
    slideWrap.appendChild(label);
  });
  builtForCancerId = cancerId;
  return true;
}

function applyMode(on){
  histologyOn = on;
  layerEl.classList.toggle('active', on);
  layerEl.toggleAttribute('inert', !on);
  // Hides the site-color legend while the slide is up — it keys the 3D site map, not this
  // view, and it physically overlaps the info card's citation line (see the CSS comment).
  document.getElementById('screenCancer').classList.toggle('hist-open', on);
  updateDisclaimerInert();
  // The cell layer only re-activates if we're actually AT the cell-scatter level — main.js's
  // txGoLevel(1) owns the level-1 state and calls resetHistologyMode() with the layer already
  // torn down, so this guard keeps the two owners from fighting.
  if(state.screen==='cancer' && state.txLevel >= 2){
    cellLayerEl.classList.toggle('active', !on);
    cellLayerEl.toggleAttribute('inert', on);
  }
  toggleBtn.setAttribute('aria-pressed', String(on));
}

function enterHistology(){
  const cancerId = state.currentCancerId;
  // Belt-and-braces: unreachable through real interaction (the toggle is hidden whenever no
  // cancer is active), but a programmatic click on the hidden button with currentCancerId
  // still null would fall through the builtForCancerId check below via null === null and
  // throw in showIntroCard. Found by the verification harness itself — puppeteer's
  // isMobile viewport switch reloads the page, resetting app state under the test script.
  const detail = CANCER_DETAILS[cancerId];
  if(!detail || !detail.histology) return;
  if(builtForCancerId !== cancerId){
    if(!buildSlide(cancerId)) return; // no histology data for this cancer — leave cells shown
  }
  // The panel describes one sampled cell; the histology view has no cells. Dismiss rather
  // than leave a panel referencing something no longer on screen (also drops txLevel to 2).
  dismissMutationPanel();
  // Card fills while the layer is still inert, so the write does NOT hit the live region —
  // the announced state change is the toggle's own aria-pressed flip, exactly the same
  // deliberate ordering txOpenCell documents for the mutation panel. Do not reorder.
  showIntroCard(CANCER_DETAILS[cancerId].histology);
  applyMode(true);
  // dismissMutationPanel's focus restore aims at the cell dot that opened the panel, which
  // applyMode just inerted — the browser would kick focus to <body>. The control the user
  // actually operated is this toggle; keep focus on it.
  toggleBtn.focus({preventScroll:true});
}

export function resetHistologyMode(){
  if(!histologyOn){
    toggleBtn.setAttribute('aria-pressed', 'false');
    return;
  }
  applyMode(false);
}

export function showHistologyToggle(){
  // Only offer the view where there's real data behind it.
  const h = CANCER_DETAILS[state.currentCancerId] && CANCER_DETAILS[state.currentCancerId].histology;
  toggleBtn.hidden = !h;
}

export function hideHistologyToggle(){
  toggleBtn.hidden = true;
}

export function initHistology(){
  toggleBtn.addEventListener('click', ()=>{
    if(histologyOn) resetHistologyMode();
    else enterHistology();
  });
}
