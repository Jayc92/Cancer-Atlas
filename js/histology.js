import { state } from './state.js';
import { CANCER_DETAILS } from './organs/index.js';
import { makeActivatable } from './accessibility.js';
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

function necrosisBlob(g, cx, cy, rx, ry, rnd, rot){
  g.appendChild(el('path', {d:blobPath(cx, cy, rx, ry, 0.28, 12, rnd, rot||0), fill:HE.necro, stroke:HE.debris, 'stroke-width':1}));
  // karyorrhectic debris — the dust of broken nuclei real necrosis is full of
  for(let i=0;i<Math.round(rx*ry/220);i++){
    const a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*0.8;
    g.appendChild(el('circle', {cx:cx+Math.cos(a)*rx*r*0.9, cy:cy+Math.sin(a)*ry*r*0.9, r:1+rnd()*1.6, fill:HE.debris, opacity:0.7}));
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

const GENERATORS = {
  hgsoc:  genHGSOC,
  tnbc:   genTNBC,
  luad:   genLUAD,
  ccrcc:  genCCRCC,
  hcc:    genHCC,
  gbm:    genGBM,
  acinar: genProstate,
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
