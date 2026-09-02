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
    for(let k2=0;k2<5;k2++){
      const x = x0 + Math.cos(ang)*k2*17, y = y0 + Math.sin(ang)*k2*17;
      if(signets.some(s=>Math.hypot(s.x-x,s.y-y) < s.r+13)) continue;
      drawCell(g, x, y, 6, 3.4+rnd()*1, rnd, {nucOffset:1.5});
    }
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

const GENERATORS = {
  hgsoc:  genHGSOC,
  tnbc:   genTNBC,
  luad:   genLUAD,
  ccrcc:  genCCRCC,
  hcc:    genHCC,
  gbm:    genGBM,
  acinar: genProstate,
  crc:    genCRC,
  pdac:   genPDAC,
  gdiff:  genGDiffuse,
  melanoma: genMelanoma,
  clear:  genOCCC,
  seminoma: genSeminoma,
  uc:     genBladderUC,
  ptc:    genPTC,
  ftc:    genFTC,
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
