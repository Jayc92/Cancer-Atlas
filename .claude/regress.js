// Full regression harness: drives the LIVE pipeline in headless Chrome (rAF/WebGL run fine
// there; the in-app pane cannot — CLAUDE.md verification-method rule). Lived at
// /tmp/atlas-verify/regress.js (rebuilt whenever /tmp was wiped, which is how the
// preserveDrawingBuffer fix below kept not landing) until the Thyroid pass moved it here.
//
// Usage: node .claude/regress.js [outDir] [port]
//   outDir — screenshots + report.json destination (default /tmp/atlas-verify/out)
//   port   — the nocache dev server's port (default 3055; or set ATLAS_PORT).
// Needs puppeteer-core: resolved normally if installed, else from PUPPETEER_CORE, else the
// /tmp/atlas-verify/node_modules convention the packet tooling uses. Chrome path overridable
// via CHROME_PATH (default is the macOS install location).
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch { puppeteer = require(process.env.PUPPETEER_CORE || '/tmp/atlas-verify/node_modules/puppeteer-core'); }
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || '/tmp/atlas-verify/out';
const PORT = process.argv[3] || process.env.ATLAS_PORT || '3055';
fs.mkdirSync(OUT, { recursive: true });
const report = { errors: [], checks: [] };
const check = (name, ok, detail) => { report.checks.push({ name, ok, detail }); if(!ok) console.log('FAIL', name, detail || ''); else console.log('ok  ', name, detail || ''); };

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--use-gl=angle', '--enable-webgl', '--window-size=1400,940'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  // Harness-only shim (validated in the Lungs mesh-swap pass, but never landed here until
  // the Thyroid pass): without preserveDrawingBuffer, Chrome may clear the WebGL buffer any
  // time after present, so a later evaluate's readPixels returns all zeros — which made every
  // blown-white check below pass VACUOUSLY on meshPx=0. Does not change what the app renders.
  await page.evaluateOnNewDocument(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, a) {
      if (t === 'webgl2' || t === 'webgl') a = Object.assign({}, a, { preserveDrawingBuffer: true });
      return orig.call(this, t, a);
    };
  });
  page.on('pageerror', e => report.errors.push({ type: 'pageerror', msg: String(e) }));
  page.on('console', m => { if(m.type() === 'error') report.errors.push({ type: 'console', msg: m.text() }); });
  page.on('response', r => { if(r.status() === 404) report.errors.push({ type: '404', msg: r.url() }); });

  await page.goto(`http://localhost:${PORT}/cancer-atlas.html`, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));

  // ---- body screen: markers per sex ----
  for (const sex of ['female', 'male']) {
    await page.evaluate(s => {
      const btns = [...document.querySelectorAll('#sexToggle button, .sex-toggle button, button')];
      const b = btns.find(x => x.textContent.trim().toLowerCase() === s);
      if (b) b.click();
    }, sex);
    await new Promise(r => setTimeout(r, 1200));
    const markers = await page.evaluate(() => [...document.querySelectorAll('.hotspot')].map(h => {
      const r = h.getBoundingClientRect();
      return { label: (h.textContent || h.getAttribute('aria-label') || '').trim(), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), visible: r.width > 0 && getComputedStyle(h).opacity !== '0' };
    }));
    fs.writeFileSync(path.join(OUT, `body_markers_${sex}.json`), JSON.stringify(markers, null, 1));
    const vis = markers.filter(m => m.visible);
    let minD = 1e9, minPair = '';
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
      const d = Math.hypot(vis[i].x - vis[j].x, vis[i].y - vis[j].y);
      if (d < minD) { minD = d; minPair = vis[i].label + '~' + vis[j].label; }
    }
    check(`body markers ${sex}`, vis.length >= 9, `${vis.length} visible, minDist ${Math.round(minD)}px (${minPair})`);
    await page.screenshot({ path: path.join(OUT, `01_body_${sex}.png`) });
  }

  // ---- body mesh resolution guard ----
  // The bodies ship at Multires level 2 (338,720 tris each, meshopt-compressed). body.js
  // documents TWO silent re-export traps (multires levels regressing, bbox centering), and a
  // wrong-level export would pass every check above — markers re-derive by raycast against
  // whatever surface they're given, so 161 greens prove nothing about resolution. The old
  // raw-GLB triangle-count check can't see through EXT_meshopt_compression, so assert the
  // count through the live app instead: this is the ONLY guard on the documented gotcha.
  // L0 = 21,160, L1 = 84,680, L2 = 338,720 — exact, not a tolerance band.
  const bodyTris = await page.evaluate(async () => {
    const { state } = await import('./js/state.js');
    const count = (g) => { let tris = 0; g.traverse(o => {
      if (o.isMesh && o.geometry.attributes.position.count > 600 && o.geometry.index) tris += o.geometry.index.count / 3; });
      return tris; };
    return { female: count(state.femaleBodyGroup), male: count(state.maleBodyGroup) };
  });
  check('body mesh resolution female', bodyTris.female === 338720, `${bodyTris.female} tris (want 338,720 = Multires L2)`);
  check('body mesh resolution male', bodyTris.male === 338720, `${bodyTris.male} tris (want 338,720 = Multires L2)`);

  // ---- per-organ pass ----
  const organKeys = await page.evaluate(async () => {
    const m = await import('./js/organs/index.js');
    return m.ORGANS.map(o => ({ key: o.key, label: o.label, active: o.active }));
  });
  console.log('organs:', JSON.stringify(organKeys));
  for (const o of organKeys.filter(o => o.active)) {
    await page.evaluate(async (key) => {
      const rows = [...document.querySelectorAll('#sidebarList > *')];
      const row = rows.find(r => r.textContent.toLowerCase().includes(key === 'ovary' ? 'ovaries' : key));
      if (row) row.click();
    }, o.key);
    let pts = 0;
    for (let t = 0; t < 40; t++) {
      await new Promise(r => setTimeout(r, 500));
      pts = await page.evaluate(() => document.querySelectorAll('.organ-point').length);
      const loading = await page.evaluate(() => { const l = document.getElementById('organLoading'); return l && !l.hidden; });
      if (pts === 4 && !loading) break;
    }
    check(`organ ${o.key} hotspots`, pts === 4, `${pts} points`);
    await new Promise(r => setTimeout(r, 800));
    const ptInfo = await page.evaluate(() => [...document.querySelectorAll('.organ-point')].map(p => {
      const r = p.getBoundingClientRect();
      return { label: p.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), visible: r.width > 0 && r.x > 0 && r.y > 0 && r.x < 1400 && r.y < 900 && getComputedStyle(p).opacity !== '0' };
    }));
    check(`organ ${o.key} hotspot visibility`, ptInfo.every(p => p.visible), JSON.stringify(ptInfo.map(p => p.label + (p.visible ? '' : '(HIDDEN)'))));
    const blown = await page.evaluate(() => {
      const wrap = document.getElementById('organViewerWrap');
      const canvas = wrap && wrap.querySelector('canvas');
      if (!canvas) return { err: 'no canvas' };
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { err: 'no gl' };
      const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
      const px = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let mesh = 0, white = 0;
      for (let i = 0; i < px.length; i += 16) {
        const r = px[i], g = px[i + 1], b = px[i + 2];
        const isBg = r < 40 && g < 45 && b < 60;
        if (!isBg) { mesh++; if (r >= 254 && g >= 254 && b >= 254) white++; }
      }
      return { meshPx: mesh, whitePx: white, pct: mesh ? (100 * white / mesh).toFixed(2) : '0' };
    });
    // meshPx > 0 required: a zeroed buffer must FAIL loudly, never pass as "0% blown" again.
    check(`organ ${o.key} blown-white`, blown.err === undefined && blown.meshPx > 0 && parseFloat(blown.pct) < 1.0, JSON.stringify(blown));
    await page.screenshot({ path: path.join(OUT, `02_organ_${o.key}.png`) });
  }

  // ---- per-cancer pass (active only) ----
  const cancers = await page.evaluate(async () => {
    const m = await import('./js/organs/index.js');
    return m.CANCERS.filter(c => c.active).map(c => ({ id: c.id, organKey: c.organKey, name: c.name }));
  });
  console.log('cancers:', JSON.stringify(cancers));
  for (const c of cancers) {
    await page.evaluate(async (ck) => {
      const rows = [...document.querySelectorAll('#sidebarList > *')];
      const row = rows.find(r => r.textContent.toLowerCase().includes(ck === 'ovary' ? 'ovaries' : ck));
      if (row) row.click();
    }, c.organKey);
    await new Promise(r => setTimeout(r, 1500));
    await page.evaluate((cname) => {
      const rows = [...document.querySelectorAll('#screenOrgan [role="button"], #screenOrgan .cancer-row, #screenOrgan li, #screenOrgan div')];
      const row = rows.filter(r => r.textContent.includes(cname)).sort((a, b) => a.textContent.length - b.textContent.length)[0];
      if (row) row.click();
    }, c.name);
    await new Promise(r => setTimeout(r, 2000));
    const labels = await page.evaluate(() => [...document.querySelectorAll('.site-label')].map(l => l.textContent.trim()));
    check(`cancer ${c.id} sites`, labels.length === 4, JSON.stringify(labels));
    const lrects = await page.evaluate(() => [...document.querySelectorAll('.site-label')].map(l => { const r = l.getBoundingClientRect(); return { t: l.textContent.trim(), x: r.x, y: r.y, w: r.width, h: r.height }; }));
    let overlap = '';
    for (let i = 0; i < lrects.length; i++) for (let j = i + 1; j < lrects.length; j++) {
      const a = lrects[i], b = lrects[j];
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) overlap += `${a.t}~${b.t}; `;
    }
    check(`cancer ${c.id} label overlap`, overlap === '', overlap);
    // pairwise projected distance, for the site-separation record
    let minD = 1e9, minPair = '';
    for (let i = 0; i < lrects.length; i++) for (let j = i + 1; j < lrects.length; j++) {
      const d = Math.hypot((lrects[i].x+lrects[i].w/2)-(lrects[j].x+lrects[j].w/2), (lrects[i].y+lrects[i].h/2)-(lrects[j].y+lrects[j].h/2));
      if (d < minD) { minD = d; minPair = lrects[i].t+'~'+lrects[j].t; }
    }
    check(`cancer ${c.id} label separation`, true, `min ${Math.round(minD)}px (${minPair})`);
    await page.screenshot({ path: path.join(OUT, `03_cancer_${c.id}_sites.png`) });
    await page.evaluate(() => { const l = document.querySelector('.site-label'); if (l) l.click(); });
    await new Promise(r => setTimeout(r, 1200));
    const cellCount = await page.evaluate(() => document.querySelectorAll('#txCellLayer .tx-cell, #txCellLayer [role="button"]').length);
    check(`cancer ${c.id} cells`, cellCount >= 20, `${cellCount} cells`);
    await page.evaluate(() => { const el = document.querySelector('#txCellLayer [role="button"]'); if (el) el.click(); });
    await new Promise(r => setTimeout(r, 700));
    const panel = await page.evaluate(() => {
      const b = document.getElementById('txPanelBody');
      return b ? { text: b.textContent.slice(0, 200), hasTrunk: b.textContent.includes('Trunk'), hasUndefined: b.textContent.includes('undefined') } : null;
    });
    check(`cancer ${c.id} mutation panel`, panel && panel.hasTrunk && !panel.hasUndefined, panel ? '' : 'no panel');
    await page.screenshot({ path: path.join(OUT, `04_cancer_${c.id}_panel.png`) });
    await page.evaluate(() => { const x = document.getElementById('txPanelClose'); if (x) x.click(); });
    await new Promise(r => setTimeout(r, 400));
    const histOk = await page.evaluate(() => {
      const t = document.getElementById('txHistologyToggle');
      if (!t || t.hidden || getComputedStyle(t).display === 'none') return { present: false };
      t.click();
      return { present: true };
    });
    await new Promise(r => setTimeout(r, 900));
    const hist = await page.evaluate(() => {
      const layer = document.getElementById('txHistologyLayer');
      const svg = layer && layer.querySelector('svg');
      const feats = layer ? [...layer.querySelectorAll('[role="button"]')].map(f => f.textContent.trim()) : [];
      return { svg: !!svg, feats };
    });
    check(`cancer ${c.id} histology`, histOk.present && hist.svg && hist.feats.length >= 3, JSON.stringify(hist.feats));
    await page.screenshot({ path: path.join(OUT, `05_cancer_${c.id}_hist.png`) });
    await page.evaluate(() => { const t = document.getElementById('txHistologyToggle'); if (t) t.click(); });
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => { const c0 = document.querySelector('#crumbs [role="button"], #crumbs button'); if (c0) c0.click(); });
    await new Promise(r => setTimeout(r, 800));
  }

  // ---- search checks ----
  const searches = [
    ['colon', ['Colon']], ['bowel', ['Colon']], ['pdac', ['Pancreas']], ['pancrea', ['Pancreas']],
    ['stomach', ['Stomach']], ['gastric', ['Stomach']], ['signet', ['Stomach']], ['linitis', ['Stomach']],
    ['adenocarcinoma', ['Lungs', 'Colon', 'Pancreas', 'Stomach']],
    ['clear cell', ['Kidneys', 'Ovaries']],
    ['occc', ['Ovaries']],
    ['ovarian clear cell', ['Ovaries']],
    ['ccrcc', ['Kidneys']],
    // Testis + Bladder pass: new alias checks. None of these terms exist anywhere else in the
    // alias registry (checked directly before writing testis.js/bladder.js), so each must
    // resolve UNIQUELY, unlike "clear cell"'s deliberate two-organ disambiguation above.
    ['testis', ['Testis']], ['testicle', ['Testis']], ['seminoma', ['Testis']], ['germ cell', ['Testis']],
    ['bladder', ['Bladder']], ['urothelial', ['Bladder']], ['transitional cell', ['Bladder']], ['vesical', ['Bladder']],
  ];
  for (const [q, expects] of searches) {
    const res = await page.evaluate((qq) => {
      const inp = document.getElementById('search') || document.querySelector('input[type="search"], input');
      inp.value = qq; inp.dispatchEvent(new Event('input', { bubbles: true }));
      return [...document.querySelectorAll('#searchResults > *')].map(r => r.textContent.trim());
    }, q);
    const ok = expects.every(e => res.some(r => r.includes(e))) && res.length === expects.length;
    check(`search "${q}"`, ok, JSON.stringify(res).slice(0, 140));
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  const fails = report.checks.filter(c => !c.ok).length;
  // --- CITATION STRUCTURAL CHECKS (citation-durability pass, 2026-09-04) --------------------
  // Deterministic and OFFLINE by design: no live link-checking here (a network dependency would
  // flake on the same rate limits the durability pass hit; periodic link-checking belongs in a
  // separate opt-in script). These catch the two failures that actually shipped:
  //   - a claim with no record   (bladder's uncited colour)
  //   - a record pointing nowhere (pancreas's dangling CLAUDE.md citation)
  // Standing condition (3) applied to provenance: read identity, don't infer it.
  try {
    const fsMod = require('fs');
    const manifest = JSON.parse(fsMod.readFileSync(new URL('./citations.json', require('url').pathToFileURL(__dirname + '/')), 'utf8'));
    check('citations: manifest parses', Array.isArray(manifest.entries) && manifest.entries.length > 0,
      `${manifest.entries.length} entries`);
    // reverse direction: every manifest entry's code_refs resolve to real files
    let badRefs = [];
    for (const e of manifest.entries) {
      for (const ref of (e.code_refs || [])) {
        const file = ref.split(':')[0];
        if (!fsMod.existsSync(file)) badRefs.push(`${e.id} -> ${ref}`);
      }
    }
    check('citations: every entry points at a real file', badRefs.length === 0, badRefs.join('; '));
    // forward direction, scoped to the two fully-swept classes:
    // (a) every mottle organ's material.color has a colour-class entry
    const mottleOrgans = ['bladder','brain','breast','kidneys','liver','ovary','pancreas','prostate'];
    const colourIds = new Set(manifest.entries.filter(e => e.cls === 'colour').map(e => e.id));
    const missingColour = mottleOrgans.filter(o => !colourIds.has('col-' + o));
    check('citations: every mottle organ colour has a manifest entry', missingColour.length === 0, missingColour.join(','));
    // (b) every shipped GLB is covered by a licence-class entry (bodies incl.)
    const glbs = fsMod.readdirSync('assets').filter(f => f.endsWith('.glb')).map(f => f.replace('.glb',''));
    const licRefs = manifest.entries.filter(e => e.cls === 'licence').flatMap(e => (e.code_refs || []).join(' ') + ' ' + e.claim);
    const covered = (g) => licRefs.some(t => t.includes(g.replace('_body','').replace('female','').replace('male','')) || t.toLowerCase().includes(g.replace('_','').replace('body','')));
    const uncovered = glbs.filter(g => {
      const organ = g.replace('female_body','bodies').replace('male_body','bodies').replace('.glb','');
      return !manifest.entries.some(e => e.cls === 'licence' &&
        ((e.claim + ' ' + (e.code_refs||[]).join(' ')).toLowerCase().includes(organ === 'bodies' ? 'body' : organ)));
    });
    check('citations: every shipped GLB has a licence entry', uncovered.length === 0, uncovered.join(','));
    // no entry may be BOTH downgraded and still claim verified language in code? (recorded as
    // notes; enforcement of code-comment wording is Phase-4 follow-up, not a structural check)
  } catch (e) {
    check('citations: structural checks ran', false, String(e).slice(0, 120));
  }
  const fails2 = report.checks.filter(c => !c.ok).length;
  console.log(`\n==== DONE: ${report.checks.length} checks, ${fails2} failures, ${report.errors.length} page errors ====`);
  if (report.errors.length) console.log(JSON.stringify(report.errors.slice(0, 10), null, 1));
  await browser.close();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
