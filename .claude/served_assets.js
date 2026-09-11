// served_assets.js (2026-09-11) — ONE discriminator for "does a changeset touch a served byte",
// shared rather than duplicated, because deploy_check.js already had this exact test
// (headTextAssets' filter: the HTML entry, every JS module, any CSS) and the Pages-wait decision
// on every commit this session has been re-deriving it by eye. regress.js needs the identical
// question to decide whether its own ~15-minute browser suite has anything to prove — a commit
// touching only .claude/ tooling or CLAUDE.md/*.md prose cannot move a single rendered pixel, so
// paying that cost for it is pure waste with zero risk reduction. A SECOND regex here that meant
// to match the first would be exactly the kind of drift this project's own duplication-declared
// convention (commit_checked.sh's DONE_LINE_RE, knowingly mirrored in battery.py) exists to avoid
// where a shared module is cheap — and here, unlike a .sh/.py pair, both callers are plain Node
// CommonJS, so an actual shared `require()` costs nothing.
const { execFileSync } = require('child_process');

const ENTRY = 'cancer-atlas.html';

// Exactly deploy_check.js's own headTextAssets() filter, moved here as the single copy.
function isServedAssetPath(p) {
  return p === ENTRY || /^js\/.*\.js$/.test(p) || /\.css$/.test(p);
}

function gitLines(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
    .split('\n').filter(Boolean);
}

// Which served-asset paths does the changeset this gate is about to certify (or just certified)
// actually touch? Two readings, because battery.py's pre-commit phase runs in both shapes this
// project actually uses:
//   - a dirty tree with staged (and/or unstaged) changes, about to become a commit — read the
//     working tree against HEAD, which is what would actually be committed;
//   - a clean detached worktree checked out AT an already-made commit, for the standing
//     verify-in-a-clean-worktree discipline — nothing is staged or unstaged there by
//     construction, so read HEAD against its own parent instead.
// FAILS SAFE: any git error, or a HEAD with no parent to diff against, returns a synthetic
// non-empty path rather than an empty list — "run the check" is the safe direction, "skip it" is
// the one that needs the evidence. Never silently defaults to skipping on an unreadable state.
function changedServedAssets(repo) {
  try {
    const staged = gitLines(repo, ['diff', '--cached', '--name-only']);
    const unstaged = gitLines(repo, ['diff', '--name-only']);
    const working = [...new Set([...staged, ...unstaged])];
    if (working.length) return working.filter(isServedAssetPath);
    const parent = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD~1'], { encoding: 'utf8' }).trim();
    return gitLines(repo, ['diff', '--name-only', parent, 'HEAD']).filter(isServedAssetPath);
  } catch (e) {
    return ['<served-asset check failed (' + e.message.slice(0, 60) + ') — failing safe to run>'];
  }
}

module.exports = { ENTRY, isServedAssetPath, changedServedAssets };
