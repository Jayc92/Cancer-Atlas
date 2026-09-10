// deploy_check.js (2026-09-05) — the THIRD layer of the gate chain, and the only one that
// verifies the thing users actually load.
//
// THE CHAIN: local green -> HEAD green -> DEPLOYED green. The first two are mechanized
// (run_checked.sh guards the run, commit_checked.sh guards the commit message). The third was
// not, and it can diverge from the other two INDEPENDENTLY: a build failure, a CDN cache, a
// propagation delay, a file that pushed but did not publish. On 4b2c8c5 the live site served a
// dead app and no instrument noticed — it was found by inference, mid-investigation, hours later.
//
// So this gate does not re-derive anything the other two already know. It asks the three
// questions only the deployed origin can answer:
//   1. PUBLISHED  — are the bytes being served the bytes at HEAD? (hash-compare every text
//                   asset; this is the layer that catches "pushed but did not publish", a stale
//                   cache, and propagation lag, none of which touch the repo at all)
//   2. INITIALISES— does the app actually come up? (the 4b2c8c5 failure: femaleBodyGroup null,
//                   0 hotspots, a page that parses as HTML and is dead as an app)
//   3. CLEAN      — zero page errors beyond the DECLARED benign set (the favicon 404)
//
// It is deliberately a POST-PUSH step, not a pre-commit one: there is nothing to check until the
// push has happened, and unlike the other two gates it can be re-run at any time to re-confirm
// that production is still up.
//
// Condition (7): --selftest must show this gate able to FAIL, in all three layers. Arms 1 and 2
// are pure-function (a mismatched hash must fire; the benign filter must swallow the favicon 404
// and must NOT swallow any other 404 — a benign-list that quietly widens is how a real error
// gets excused). Arm 3 is end-to-end and real: the same initialisation assertion is pointed at a
// blank page and must REPORT FAILURE. A gate whose job is catching a dead app has to be shown
// catching one.
// 7-bis: DONE line last. Wrapper form:
//   .claude/run_checked.sh "DONE deploy_check:" node .claude/deploy_check.js
'use strict';
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const ORIGIN = 'https://jayc92.github.io/Cancer-Atlas';
const ENTRY = 'cancer-atlas.html';

// DECLARED BENIGN, exhaustively and by exact shape. The favicon 404 is pre-existing and known:
// there is no favicon in the repo. Anything else is a finding. This list is the gate's honesty
// surface — every entry is a thing it has been told not to see, so it stays this short.
// A DECLARATION NAMES CHECKABLE EVIDENCE, NOT A JUDGEMENT — the rule binding every declaration list
// in this chain, stated in full at citation_reach_check.DECLARED_UNREACHED, where three declarations
// that stated conclusions instead had to be deleted. This list passed its 2026-09-06 audit: "no
// favicon in the repo" is a fact about the tree and was checked (`git ls-files | grep -i favicon`
// returns nothing), not assumed, and arm 2 below pins the list against widening in both directions.
const BENIGN = [
  { why: 'no favicon in the repo (pre-existing, known)', test: (kind, detail) => /favicon\.ico(\?|$)/.test(detail) },
];

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function isBenign(kind, detail) {
  return BENIGN.some((b) => b.test(kind, detail));
}

// Chrome reports one failed request TWICE: as a response event carrying the URL, and as a console
// line that does NOT ("Failed to load resource: the server responded with a status of 404 ()").
// The echo therefore can never be matched against a declared-benign URL, and matching it BY
// PATTERN would swallow every 404's echo — including a missing JS module. That is the benign list
// widening silently, which arm 2 exists to forbid.
// So CORRELATE instead: the echo carries no information the response events do not, so it is
// benign IFF every HTTP>=400 response observed was itself declared benign. One undeclared 404 and
// the echo goes back to being a finding.
const RESOURCE_ECHO = /^Failed to load resource: the server responded with a status of \d+/;

function partition(events) {
  const httpUnexplained = events.filter(([k, v]) => /^HTTP[45]\d\d$/.test(k) && !isBenign(k, v));
  const benign = [], unexplained = [];
  for (const ev of events) {
    const [k, v] = ev;
    if (isBenign(k, v)) { benign.push(ev); continue; }
    if (k === 'CONSOLE' && RESOURCE_ECHO.test(String(v)) && httpUnexplained.length === 0) {
      benign.push(ev); continue;
    }
    unexplained.push(ev);
  }
  return { benign, unexplained };
}

// ---- layer 1: PUBLISHED ------------------------------------------------------------------
// Compared against the HEAD BLOBS, not the working tree. The question is "are the bytes I
// pushed the bytes being served", and a dirty working tree is not supposed to be live.
function headTextAssets(repo) {
  const out = execFileSync('git', ['-C', repo, 'ls-tree', '-r', '--name-only', 'HEAD'], { encoding: 'utf8' });
  return out.split('\n').filter((p) => p === ENTRY || /^js\/.*\.js$/.test(p) || /\.css$/.test(p));
}

function headBlob(repo, p) {
  return execFileSync('git', ['-C', repo, 'show', `HEAD:${p}`], { maxBuffer: 64 << 20 });
}

async function comparePublished(repo, assets) {
  const stale = [];
  const batch = 6;
  for (let i = 0; i < assets.length; i += batch) {
    const slice = assets.slice(i, i + batch);
    await Promise.all(slice.map(async (p) => {
      const local = headBlob(repo, p);
      let res;
      try {
        res = await fetch(`${ORIGIN}/${p}`, { cache: 'no-store' });
      } catch (e) {
        stale.push({ p, why: `fetch failed: ${e.message}` });
        return;
      }
      if (!res.ok) {
        stale.push({ p, why: `HTTP ${res.status}` });
        return;
      }
      const served = Buffer.from(await res.arrayBuffer());
      const a = sha(local), b = sha(served);
      if (a !== b) {
        stale.push({ p, why: `bytes differ — HEAD ${a.slice(0, 12)} (${local.length}B) vs served ${b.slice(0, 12)} (${served.length}B)` });
      }
    }));
  }
  return stale;
}

// ---- layers 2 and 3: INITIALISES and CLEAN ------------------------------------------------
function loadPuppeteer() {
  // Resolution order (2026-09-10): installed, explicit PUPPETEER_CORE, the persistent home-cache install (path built at
  // runtime, no literal in the tree), then the old /tmp convention last — see regress.js for why /tmp is last.
  for (const m of ['puppeteer', 'puppeteer-core', process.env.PUPPETEER_CORE, require('path').join(require('os').homedir(), '.cache', 'cancer-atlas', 'node_modules', 'puppeteer-core'), '/tmp/atlas-verify/node_modules/puppeteer-core'].filter(Boolean)) {
    try { return require(m); } catch { /* next */ }
  }
  throw new Error('no puppeteer available');
}

// The initialisation assertion, factored out so the selftest can point it at a page that is
// KNOWN not to initialise and watch it fail. That is the whole point of arm 3.
async function probe(url) {
  const puppeteer = loadPuppeteer();
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--use-gl=angle', '--enable-webgl', '--window-size=1400,940'],
  });
  const events = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => events.push(['PAGEERROR', String(e)]));
    page.on('console', (m) => { if (m.type() === 'error') events.push(['CONSOLE', m.text()]); });
    page.on('requestfailed', (r) => events.push(['REQFAIL', `${r.url()} :: ${(r.failure() || {}).errorText}`]));
    page.on('response', (r) => { if (r.status() >= 400) events.push([`HTTP${r.status()}`, r.url()]); });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 4000));
    const st = await page.evaluate(async () => {
      const { state } = await import('./js/state.js');
      return {
        female: state.femaleBodyGroup ? 'present' : 'MISSING',
        male: state.maleBodyGroup ? 'present' : 'MISSING',
        hotspots: document.querySelectorAll('.hotspot').length,
      };
    }).catch((e) => ({ evalError: String(e) }));
    return { st, events };
  } finally {
    await browser.close();
  }
}

function initFailures(st) {
  const bad = [];
  if (!st || st.evalError) { bad.push(`state module unreachable: ${st && st.evalError}`); return bad; }
  if (st.female !== 'present') bad.push('state.femaleBodyGroup MISSING — the app did not initialise');
  if (st.male !== 'present') bad.push('state.maleBodyGroup MISSING — the app did not initialise');
  if (!(st.hotspots > 0)) bad.push(`0 hotspots rendered — the app did not initialise`);
  return bad;
}

// ---- selftest -----------------------------------------------------------------------------
async function selftest() {
  let ok = true;
  let arms = 0, failed = 0;
  const say = (good, msg) => {
    ok = ok && good; arms += 1; if (!good) failed += 1;
    console.log(`  ${good ? 'ok  ' : 'FAIL'} ${msg}`);
  };

  // arm 1: the hash comparator must fire on a mismatch
  say(sha(Buffer.from('a')) !== sha(Buffer.from('b')),
    'byte comparator distinguishes differing content (layer 1 can report stale)');

  // arm 2, both directions: the benign list must swallow the favicon 404 and NOTHING else.
  say(isBenign('HTTP404', 'https://jayc92.github.io/Cancer-Atlas/favicon.ico'),
    'benign filter swallows the declared favicon 404');
  say(!isBenign('HTTP404', 'https://jayc92.github.io/Cancer-Atlas/js/organs/liver.js'),
    'benign filter does NOT swallow a different 404 (the list cannot widen silently)');
  say(!isBenign('PAGEERROR', "SyntaxError: Unexpected identifier 's'"),
    'benign filter does NOT swallow the 4b2c8c5 parse error');

  // arm 3, end-to-end: the initialisation assertion must FAIL on a page that does not initialise.
  const blank = await probe('data:text/html,<html><body>not the atlas</body></html>')
    .then((r) => r.st).catch((e) => ({ evalError: String(e) }));
  const bad = initFailures(blank);
  say(bad.length > 0, `initialisation assertion fails on a blank page (${bad.length} failure(s) reported)`);

  // arm 4: THE 4b2c8c5 SHAPE SPECIFICALLY. Arm 3 exits at the unreachable-module branch, so it
  // never touches the MISSING branches — and those are the ones that matter, because on 4b2c8c5
  // the page loaded, the modules loaded, and the state simply stayed null. An arm that fails for
  // the wrong reason is not a capability check for the right one.
  const dead = initFailures({ female: 'MISSING', male: 'MISSING', hotspots: 0 });
  say(dead.length === 3, `reports all three initialisation failures on the 4b2c8c5 shape `
    + `(loaded page, null state) — got ${dead.length}`);
  say(initFailures({ female: 'present', male: 'present', hotspots: 31 }).length === 0,
    'reports no failures on a healthy state (the gate is not stuck failing)');

  // arms 5 and 6: the console ECHO correlation, both directions. This is the only place the gate
  // excuses an event it cannot read the URL of, so it has to be shown doing it conditionally.
  const echo = ['CONSOLE', 'Failed to load resource: the server responded with a status of 404 ()'];
  const favicon = ['HTTP404', `${ORIGIN}/favicon.ico`];
  const realMiss = ['HTTP404', `${ORIGIN}/js/organs/liver.js`];
  say(partition([favicon, echo]).unexplained.length === 0,
    'excuses the console echo when every HTTP error observed was declared benign');
  say(partition([favicon, realMiss, echo]).unexplained.length === 2,
    'keeps the console echo as a finding when an UNDECLARED 404 is also present');

  console.log('SELFTEST', ok
    ? 'PASS — all three layers shown able to fail: stale bytes, a widened benign list, a dead page'
    : 'FAIL — do not trust a green deploy report from this build');
  // 7-bis applies to the SELFTEST too: a wrapped `--selftest` run needs a DONE line, or a
  // selftest that never executed is indistinguishable from one that passed. This is the only
  // mode of any battery tool that can run to completion without one.
  console.log(`DONE deploy_check_selftest: ${arms} arms run, ${failed} failures`);
  return ok;
}

// ---- main ---------------------------------------------------------------------------------
(async () => {
  if (!(await selftest())) process.exit(1);
  if (process.argv.includes('--selftest')) process.exit(0);

  const repo = path.resolve(__dirname, '..');
  const head = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const problems = [];

  // Is HEAD even pushed? A distinct failure from a bad deploy, and worth naming as itself.
  try {
    execFileSync('git', ['-C', repo, 'fetch', '-q', 'origin', 'main'], { stdio: 'ignore' });
  } catch {
    console.log('  NOTE: git fetch failed — the pushed/unpushed comparison below may be stale');
  }
  let remote = '';
  try {
    remote = execFileSync('git', ['-C', repo, 'rev-parse', 'origin/main'], { encoding: 'utf8' }).trim();
  } catch { /* no remote ref */ }
  if (remote && remote !== head) {
    problems.push(`NOT PUSHED: HEAD ${head.slice(0, 7)} != origin/main ${remote.slice(0, 7)} — nothing below can be a check on HEAD`);
  }

  const assets = headTextAssets(repo);
  const stale = await comparePublished(repo, assets);
  // THE MOST DANGEROUS MOMENT FOR THIS GATE IS THE FIRST RUN AFTER A PUSH, and the reason is that the
  // benign explanation is sitting right there and is USUALLY TRUE: Pages has not rebuilt yet, so the
  // files the push changed still serve their old bytes and every one of them lands here. Measured
  // 2026-09-07 — two NOT PUBLISHED findings naming exactly the two changed assets, green ~150s later
  // with no action taken. In the user's words, that makes it "the single most likely moment for someone
  // to wave a real failure through", because the reasoning that excuses a transient is the same
  // reasoning that would excuse a genuine stale deploy.
  //
  // SO THE DISCRIMINATOR IS WRITTEN DOWN RATHER THAN LEFT TO JUDGEMENT: a rebuild delay can only
  // affect assets the push actually CHANGED. If a file appears here that is NOT in
  // `git diff --name-only origin/main@{1} origin/main`, waiting will not fix it and it is a real
  // finding. Same commit re-run twice with no change and still stale is also real. WAIT AND RE-RUN
  // ONCE; do not edit, do not re-push, and do not explain it away twice.
  //
  // AND THE SHARP FORM OF THAT, which is the one to keep (user ruling, 2026-09-08): THE WAIT IS NOT A
  // PROPERTY OF PUSHING, IT IS A PROPERTY OF PUSHING A SERVED ASSET. The only files that can
  // legitimately appear below are `changed ∩ headTextAssets()` — the very filter this gate applies four
  // lines up — so the question is decidable rather than a timing heuristic: compute the intersection,
  // do not estimate it.
  //   git diff --name-only <old origin/main> HEAD | grep -E '^cancer-atlas\.html$|^js/.*\.js$|\.css$'
  // IF THAT SET IS EMPTY, EVERY FINDING HERE IS REAL — nothing the push touched could have staled a
  // served byte. That is why this framing matters more than the paragraph above it: the weak form only
  // ever tells you to WAIT, so on a `.claude/`-only or docs-only commit it sends you to re-run 150s
  // later into exactly the same red, and the waiting LOOKS like diligence. This form tells you when
  // waiting is WRONG, which is the direction that fails safe.
  //   MEASURED on 873baec (`.claude/run_checked.sh` + `.claude/deploy_check.js`, intersection empty):
  // 27/27 byte-matched on the FIRST run with no wait at all. A green first run after a push is not luck
  // and not a reason to relax — it is what an empty intersection predicts.
  for (const s of stale) problems.push(`NOT PUBLISHED: ${s.p} — ${s.why}`);

  let st = null, events = [];
  try {
    ({ st, events } = await probe(`${ORIGIN}/${ENTRY}`));
  } catch (e) {
    problems.push(`PROBE FAILED: ${e.message}`);
  }
  for (const f of initFailures(st)) problems.push(`NOT INITIALISED: ${f}`);
  const { benign: benignSeen, unexplained } = partition(events);
  for (const [k, v] of unexplained.slice(0, 20)) problems.push(`PAGE ERROR: ${k} ${String(v).slice(0, 200)}`);

  for (const p of problems) console.log(`  ${p}`);
  // DONE line last (7-bis): a green deploy is never a pass without it.
  // The count is MATCHED-over-TOTAL, not total. The first draft printed "27 assets byte-matched"
  // on a run where four of them demonstrably did not match — a DONE line whose numbers did not
  // mean what they said, in the one instrument whose whole purpose is refusing to accept a
  // green-looking summary. Caught by reading its own first real output against its own findings.
  console.log(`DONE deploy_check: ${assets.length - stale.length}/${assets.length} assets `
    + `byte-matched to HEAD ${head.slice(0, 7)}, `
    + `${st && st.hotspots ? st.hotspots : 0} hotspots live, `
    + `${unexplained.length} unexplained page errors (${benignSeen.length} declared-benign), `
    + `${problems.length} problems`);
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.error('deploy_check crashed:', e); process.exit(2); });
