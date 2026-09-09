#!/usr/bin/env node
// capture_organs — the reproducible capture behind a RECORDED LOOK (Phase A, 2026-09-09). EVIDENCE, NOT
// A GATE: it asserts nothing about the corpus, prints facts, writes PNGs outside the tree, and exits 0
// whenever the capture itself succeeded. Declared a non-instrument in battery.py for that reason.
//
// WHY IT IS TRACKED. The per-category visual read (js/morphology.js, the MARGIN_CATEGORIES line) must be
// recorded in EVIDENTIARY form — user ruling, 2026-09-09: a recorded look that says "verified distinct"
// is true about what someone did and silent about what they compared, the same shape as the annotations
// that spent three days over-claiming. The record names the capture, the two forms compared, and what
// specifically distinguished them, so a reader can open the image and check. A capture PATH into /tmp
// is the scratch pointer this project already learned not to write (a scratch location cannot keep the
// retrievability the path promises), so the durable form of "the capture path" is THIS TOOL plus the
// commit: `node .claude/capture_organs.js <outDir> <Organ>...` at <commit> regenerates the image the
// record describes. The PNG itself stays out of the tree; the command and the commit are the record.
//
// Usage: node .claude/capture_organs.js <outDir> <Organ label>... [--port N]
//   e.g. node .claude/capture_organs.js /tmp/look-ptc Thyroid Testis
// Drives the live app in headless Chrome the way .claude/regress.js does (same puppeteer resolution, same
// GL flags, same sidebar navigation), starts its own nocache server on --port (default 3062), captures
// #organViewerWrap per organ (captureBeyondViewport false — the P5 lesson), and writes facts.json with
// the badges, marker count and console errors seen per organ. The default camera pose is what a visitor
// sees first; poses are not varied here on purpose, so two records made weeks apart compare like for like.
'use strict';
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch { puppeteer = require(process.env.PUPPETEER_CORE || '/tmp/atlas-verify/node_modules/puppeteer-core'); }
const fs = require('fs'), path = require('path');
const { spawn } = require('child_process');
const REPO = path.resolve(__dirname, '..');

const argv = process.argv.slice(2);
const portIdx = argv.indexOf('--port');
const PORT = portIdx >= 0 ? argv.splice(portIdx, 2)[1] : '3062';
const OUT = argv.shift();
const ORGANS = argv;
if (!OUT || !ORGANS.length) { console.error('usage: node .claude/capture_organs.js <outDir> <Organ label>... [--port N]'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const server = spawn('python3', ['.claude/nocache_server.py', PORT], { cwd: REPO, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new', args: ['--use-gl=angle', '--enable-webgl', '--window-size=1400,940'],
  });
  const facts = { commit: null, organs: {}, errors: [] };
  try {
    try { facts.commit = require('child_process').execSync('git rev-parse --short HEAD', { cwd: REPO }).toString().trim(); } catch { facts.commit = 'unknown'; }
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    page.on('pageerror', e => facts.errors.push('pageerror ' + String(e)));
    page.on('console', m => { if (m.type() === 'error') facts.errors.push('console ' + m.text()); });
    await page.goto(`http://localhost:${PORT}/cancer-atlas.html`, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2500));
    for (const organ of ORGANS) {
      const clicked = await page.evaluate((name) => {
        const rows = [...document.querySelectorAll('#sidebarList > *')];
        const row = rows.find(r => r.textContent.includes(name));
        if (!row) return false; row.click(); return true;
      }, organ);
      if (!clicked) { facts.organs[organ] = { error: 'no sidebar row matched' }; continue; }
      await new Promise(r => setTimeout(r, 4500));   // GLB load + framing + first frames
      facts.organs[organ] = await page.evaluate(() => ({
        badges: [...document.querySelectorAll('.tumour-badge')].map(b => ({ text: b.textContent, aria: b.getAttribute('aria-label') })),
        markers: document.querySelectorAll('.organ-point').length,
      }));
      const wrap = await page.$('#organViewerWrap');
      const file = path.join(OUT, organ.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png');
      await wrap.screenshot({ path: file, captureBeyondViewport: false });
      facts.organs[organ].png = path.basename(file);
    }
    fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(facts, null, 1));
    console.log(JSON.stringify(facts, null, 1));
    console.log(`DONE capture_organs: ${ORGANS.length} organ(s) captured at ${facts.commit} into ${OUT}`);
  } finally { await browser.close(); server.kill(); }
})().catch(e => { console.error('capture_organs: harness error', e); process.exit(1); });
