#!/bin/sh
# SINGLE ENTRY POINT (2026-09-11, user-directed): the sixth live instance of the ambient-cwd scar
# this session (see CLAUDE.md's "FOUR THINGS CAUGHT WHILE BUILDING PHASE D..." item 2, and its own
# predecessors) made the point structurally: remembering an absolute-path or `cd` prefix on every
# single command against this repo does not scale, because the reset happens at moments outside
# any one command's own control (a backgrounded call's own cd never propagating forward; a turn
# boundary resetting the caller's shell to the primary working directory entirely, observed live
# this session). This collapses every one of those hazards but one into a SINGLE, reusable point:
# cd here (this script's own parent directory, resolved from its own path — never a
# machine-specific literal, since battery.py's assertion 6 forbids one in a tracked file), then
# exec whatever was asked for.
#
# WHAT THIS DOES NOT CLOSE, STATED RATHER THAN IMPLIED: invoking THIS script itself by a bad
# relative path from the wrong cwd still fails, irreducibly — the outermost layer no code inside
# any wrapper can reach, because that code never runs if the shell cannot resolve the path to it
# first (run_checked.sh's own header already documents this exact boundary, and it is not this
# script's to close either). What this DOES buy: every command run THROUGH this one script,
# including every relative path inside its own arguments, is now correct regardless of where the
# invoking shell happened to be a moment before — one absolute path to get right, not one per
# command.
#
# USAGE: <absolute-path-to-this-script> <command> [args...]
#   /abs/path/to/cancer-atlas/.claude/at_root.sh .claude/commit_checked.sh "..." "DONE " python3 .claude/battery.py pre-commit
set -e
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"
exec "$@"
