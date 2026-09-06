# Battery runner (.claude/battery.py, 2026-09-05) — the guard on the SET, one layer above
# run_checked.sh, and the last unguarded step in the chain.
#
# AN INSTRUMENT THAT ISN'T INVOKED CAN'T FAIL (user ruling, 2026-09-05). run_checked.sh guards
# each INVOCATION: a tool that runs and prints no DONE marker fails the invocation itself, so a
# vacuous run cannot read as a pass. commit_checked.sh guards the COMMIT: the message's numbers
# are copied from the run by machine. deploy_check.js guards the DEPLOY. Nothing guarded the SET.
#
# The proof that this was a real hole and not a tidiness concern: citation_polarity.py had been
# UNRUNNABLE since the v2 extractor landed — it died on KeyError('refs') before printing a single
# line — and it surfaced only because a human happened to run the whole battery by hand on
# 2026-09-05. Ten instruments, and no mechanism could answer "did all ten run?". A dead instrument
# in a battery nobody enumerates is indistinguishable from a clean one.
#
# WHAT THIS ADDS IS ASSERTIONS, NUMBERED BELOW. Everything else here is plumbing. (This line said
# "two" until 2026-09-06 and had been wrong since the third was added the same day it was written —
# a count in prose, drifting, in the header of the tool that ratchets counts. Numbered headings are
# the fix: they cannot disagree with a total that is no longer stated.)
#
#   1. EVERY DECLARED MEMBER OF THE PHASE RAN AND PRINTED ITS OWN MARKER. Not "was attempted" —
#      printed the marker, via run_checked.sh, so the member's own 7-bis obligation is what this
#      runner counts. A member that crashes, is deleted, is renamed, or loses its DONE line takes
#      the whole battery down by name.
#
#   2. EVERY TRACKED FILE IN .claude/ IS DECLARED — as an instrument or explicitly as a
#      non-instrument. This is the assertion that makes the declared list trustworthy, and it
#      exists because record_sync_check.py's map carries this caveat about itself, verbatim:
#
#          "DISCIPLINE: when a new dual-home record is created, add its pair here in the same
#           commit — an undeclared pair is invisible to this check, and the map is itself a
#           record that can go stale (noted honestly; the alternative is a convention parser,
#           which would be a bigger instrument than the failure justifies)."
#
#      That caveat applies to THIS list with equal force and the same wording: a new instrument
#      that forgets to declare itself is invisible to a declared-list-only runner, which is the
#      hole this whole tool exists to close, reintroduced one level up. Here the closure is cheap
#      because the population is a single directory: the list is CLOSED OVER .claude/, so a new
#      file is a hard failure until someone classifies it. Declaring a file a non-instrument is
#      then a decision on the record rather than an omission — which is the difference between a
#      stale map and a maintained one.
#
#   4. THE CORPUS DID NOT SILENTLY SHRINK — the ratchet (user ruling, 2026-09-05, closing a gap
#      this runner shipped with hours earlier). The first version asserted only that the records
#      artifact was non-empty and printed its count, so a v3 extractor emitting 300 records where
#      408 stood would have passed. That was named as uncovered on the stated grounds that a FLOOR
#      constant goes stale on the next legitimate corpus growth. True of a floor, and the wrong
#      conclusion: a RATCHET does not go stale. Record the previous count, fail on a decrease, and
#      let an increase move it up automatically. Growth never trips it, shrinkage always does, and
#      a real reduction takes an explicit --lower-ratchet with a --lower-reason — a deliberate step
#      over the gap instead of a silent one, which is the kind of step this project tolerates.
#
#      ANY decrease is material, and that is a defined threshold rather than a hedge:
#      extract_citations.py is deterministic over the local corpus, so on an unchanged tree the
#      count cannot move at all. There is no noise band to tolerate, and inventing a tolerance
#      would be a floor with extra steps — the thing the ratchet replaces.
#
#      State lives in .claude/record_count.json, declared below as a non-instrument (machine-
#      written state, not a tool). Assertion 2 firing on the very next file added to .claude/ is
#      the mechanism working, not a nuisance. The ratchet is KEYED BY METRIC so extending it is a
#      declaration rather than a redesign; which metrics are wired is answered by
#      .claude/record_count.json and by the sidecars a run prints, not by this comment — a list here
#      would be a second source of truth for something the state file already holds.
#      STILL UNRATCHETED, named rather than left implicit: regress.js's own check count, which
#      could shrink under a green DONE line the same way. ITS CURRENT VALUE IS DELIBERATELY NOT
#      WRITTEN HERE: that is precisely the class the drift rule names. Its own DONE line is the
#      source of truth. (This paragraph named two such metrics until 2026-09-06, when the second —
#      citation_crosscheck's identifier-carrying total — became the sidecar convention's first
#      producer and stopped being unratcheted. The prose had to be edited to keep up, which is the
#      restatement hazard demonstrating itself inside the comment warning about it.)
#
#      HOW THIS GENERALISES — THE SIDECAR CONVENTION (user, 2026-09-05, recorded as a SHAPE AND NOT
#      A TASK, so a session that finds this finds a plan rather than a hole). The wrong way to close
#      those two is to parse the numbers back out of each instrument's DONE line: nine formats to
#      track, and it recreates the prose-restatement problem INSIDE the runner — deriving a machine
#      number from a human-facing string is the same mistake one level in. The right way is for each
#      instrument to emit a machine-readable sidecar ALONGSIDE its human-readable DONE line,
#
#          SIDECAR {"name": "regress", "metrics": {"checks": 167, "failures": 2}}
#
#      so the ratchet reads STRUCTURE and the DONE line stays a sentence for humans. Each is then
#      the authority for its own audience and neither is derived from the other. (The numbers in
#      that example are a FORM, not a reading — whatever the run produced. This header is not their
#      source of truth either, which is the same reason the two are unnamed above.)
#
#      DO NOT SWEEP TEN TOOLS FOR THIS. The convention applies to the NEXT instrument written, and
#      to each existing one WHEN IT IS NEXT TOUCHED FOR ANOTHER REASON. The ratchet generalises for
#      free over time, and nothing is rewritten for a gap that is still theoretical: regress's count
#      dropping would almost certainly follow a deliberate code edit, not the silent producer change
#      the extractor demonstrated.
#
#      THE READER SHIPS WITH THE FIRST PRODUCER, not before it. A consumer with no producer could
#      only ever be demonstrated against a fixture, and the standard here is capability shown on
#      real output — conditions (7) and (8). Whoever writes that instrument wires both ends and gets
#      a live demonstration for free; building the reader today would spend the demonstration.
#
#      IT SHIPPED THAT WAY (2026-09-06, with citation_crosscheck). The trigger was the convention's
#      own: crosscheck had to be touched anyway, because it could file a FAILED id-mapping fetch as
#      an unmappable id and print a smaller total under a clean DONE line — an active hole in a
#      battery member, not a deferred improvement. Sidecar and reader came along free, which is the
#      case the "when it is next touched" clause was written for. Three things only the live wiring
#      could have taught, each recorded at its own site below:
#
#        - A `ratchet` ARRAY is part of the convention, not an extra. crosscheck reports `records`
#          (coverage, must never shrink) beside `flags` (a DEFECT COUNT — ratcheting it would fail
#          the battery for FIXING a flag). Only the producer knows which is which, so the producer
#          declares it and the reader ratchets nothing it was not asked to.
#        - THE PRODUCER-SIDE LOOPHOLE that array opens is closed by vanished_ratchets(): dropping a
#          metric from the array, or the sidecar entirely, would switch a ratchet off silently. It
#          is checked against COMMITTED state rather than a hand-maintained map of who-reports-what,
#          because a map is the staleness this file's assertion 2 exists to refuse.
#        - METRIC KEYS ARE NAMESPACED per producer, and that is the finding, not a style choice. Two
#          different numbers are both called `records` — the extractor's corpus total and
#          crosscheck's identifier-carrying subset. Unnamespaced, this reader's FIRST live run would
#          have compared one against the other and fired RATCHET SHRANK on a corpus that had not
#          moved. A new gate whose first act is a false positive teaches people to pass
#          --lower-ratchet, which is worse than the gap it closed.
#
# WHY THE CHAIN STOPS AT FOUR (user, 2026-09-05 — recorded so nobody adds a fifth from momentum).
# Set -> invocation -> commit message -> deploy is COMPLETE, not arbitrarily truncated, and the
# property that makes it complete is that this runner is a SINGLE ENTRY POINT: one command covers
# everything downstream of it. A guard above the battery would need its own guard, and that regress
# only ever bottoms out at a human running one thing. Four is where the recursion stops because
# four is where the human is.
#
# PHASES exist because deploy_check.js cannot run pre-commit — there is nothing deployed to check
# until the push has happened, and it correctly reports NOT PUSHED if asked early. So the ten
# members split into `pre-commit` (nine) and `post-push` (one), and a third assertion falls out of
# that: every declared instrument must belong to a declared phase, or a typo in a phase name would
# silently retire an instrument. That is "an instrument that isn't invoked can't fail" sneaking
# back in through the declaration itself, so it gets an arm.
#
# Usage:
#   python3 .claude/battery.py --selftest
#   python3 .claude/battery.py pre-commit
#   python3 .claude/battery.py post-push
#   python3 .claude/battery.py pre-commit --lower-ratchet=406 --lower-reason="two dropped, unsourced"
#     ^ the only way past assertion 4, and it stays a check: the lowered bar is then compared to
#       the real count like any other, so a lower cannot switch the assertion off.
#   .claude/commit_checked.sh "<subject>" "DONE " python3 .claude/battery.py pre-commit
#     ^ the intended commit form: marker "DONE " quotes EVERY member's DONE line plus the
#       battery's own into the message, so the commit records the whole set's numbers verbatim.
#
# 7-bis applies to this runner too: DONE line last, and its absence must fail the invocation.
#   .claude/run_checked.sh "DONE battery:" python3 .claude/battery.py pre-commit
import json
import os
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK_DIR = os.path.join(tempfile.gettempdir(), 'atlas-battery')
RECORDS_ARTIFACT = os.path.join(WORK_DIR, 'records.json')
POLARITY_ARTIFACT = os.path.join(WORK_DIR, 'polarity_scan.json')
CROSSCHECK_ARTIFACT = os.path.join(WORK_DIR, 'crosscheck_flags.json')
REGRESS_OUT_DIR = os.path.join(WORK_DIR, 'regress')
REGRESS_PORT = '3057'

# The ratchet's state, and the only file in .claude/ that a tool writes rather than a human. It is
# COMMITTED on purpose: an uncommitted ratchet would reset on every fresh clone, which is a floor
# of zero wearing a ratchet's clothes.
RATCHET_FILE = os.path.join(REPO_ROOT, '.claude', 'record_count.json')
RECORDS_METRIC = 'records'

PHASES = ('pre-commit', 'post-push')

# THE DECLARED INSTRUMENT LIST. Ten members. Adding an instrument means adding a row here in the
# same commit; assertion 2 makes that mechanical rather than remembered.
INSTRUMENTS = [
    # (name,                     phase,        done marker,                    argv)
    ('syntax_check', 'pre-commit', 'DONE syntax_check:',
     ['sh', '.claude/syntax_check.sh']),
    ('absence_claim_check', 'pre-commit', 'DONE absence_claim_check:',
     ['python3', '.claude/absence_claim_check.py']),
    ('fraction_check', 'pre-commit', 'DONE fraction_check:',
     ['python3', '.claude/fraction_check.py']),
    ('share_sum_check', 'pre-commit', 'DONE share_sum_check:',
     ['python3', '.claude/share_sum_check.py']),
    ('duplicate_figure_check', 'pre-commit', 'DONE duplicate_figure_check:',
     ['python3', '.claude/duplicate_figure_check.py']),
    ('record_sync_check', 'pre-commit', 'DONE record_sync_check:',
     ['python3', '.claude/record_sync_check.py']),
    ('citation_polarity', 'pre-commit', 'DONE citation_polarity:',
     ['python3', '.claude/citation_polarity.py', RECORDS_ARTIFACT, POLARITY_ARTIFACT]),
    ('citation_crosscheck', 'pre-commit', 'DONE citation_crosscheck:',
     ['python3', '.claude/citation_crosscheck.py', RECORDS_ARTIFACT, CROSSCHECK_ARTIFACT]),
    ('regress', 'pre-commit', '==== DONE:',
     ['node', '.claude/regress.js', REGRESS_OUT_DIR, REGRESS_PORT]),
    ('deploy_check', 'post-push', 'DONE deploy_check:',
     ['node', '.claude/deploy_check.js']),
]

# THE NON-INSTRUMENTS, declared with a reason each, because assertion 2 is only as good as the
# honesty of this half. A gate hidden in here would be a gate nobody runs.
NON_INSTRUMENTS = {
    'battery.py': 'this runner',
    'run_checked.sh': 'wrapper — guards one invocation; has its own --selftest',
    'commit_checked.sh': 'wrapper — guards the commit message; has its own --selftest',
    'extract_citations.py': 'artifact producer, run as this runner preflight, not a gate',
    'figure_search.py': 'read helper — searches ONE fetched document during a claim read; '
                        'has a DONE line but no corpus-wide population to scan',
    'bake_ao.py': 'offline asset tool (Blender), part of the a131649 reproducible chain',
    'mesh_hygiene.py': 'offline asset tool (Blender), part of the a131649 reproducible chain',
    'render_thumb.py': 'offline asset tool (Blender)',
    'nocache_server.py': 'local dev server; started by this runner for the regression',
    'citations.json': 'the manifest — data, not a tool',
    'record_count.json': 'the ratchet — machine-written state, not a tool; this runner is the '
                         'only writer, and it is committed so a fresh clone inherits the floor',
    'launch.json': 'preview config — data, not a tool',
    'phaseA_mapping.md': 'a record — data, not a tool',
}


def declared_instrument_files():
    """The .claude/ filenames the instrument list claims. Derived from argv, not hand-listed —
    a second hand-maintained list would be a third thing to forget."""
    claimed = set()
    for _name, _phase, _marker, argv in INSTRUMENTS:
        for token in argv:
            if token.startswith('.claude/'):
                claimed.add(os.path.basename(token))
    return claimed


def tracked_claude_files():
    """Tracked (index-visible) files directly in .claude/. `git ls-files` reads the INDEX, so a
    newly `git add`ed instrument is already visible here — which is what makes the same-commit
    discipline enforceable rather than advisory. Untracked scratch and __pycache__ are excluded
    by construction, since they are not part of what ships."""
    out = subprocess.run(['git', '-C', REPO_ROOT, 'ls-files', '.claude'],
                         capture_output=True, text=True, check=True).stdout
    names = set()
    for path in out.split('\n'):
        path = path.strip()
        if not path:
            continue
        relative = path[len('.claude/'):]
        if '/' in relative:      # nested dirs are not instruments; nothing nests today
            continue
        names.add(relative)
    return names


def present_claude_files():
    """What is actually in .claude/ on disk, tracked or not. Only used to tell a stale declaration
    apart from an untracked file, which are different problems with different fixes."""
    return {name for name in os.listdir(os.path.join(REPO_ROOT, '.claude'))
            if os.path.isfile(os.path.join(REPO_ROOT, '.claude', name))}


# ---- the three assertions, as pure functions so the selftest can drive them ------------------

def undeclared_files(tracked, instrument_files, non_instruments, present_on_disk=None):
    """Assertion 2. Any tracked .claude/ file that is neither an instrument nor a declared
    non-instrument, and any declaration naming a file that is not tracked.

    The second half splits in two, and the split is worth the parameter: a declaration whose file
    is GONE is a stale declaration, but a declaration whose file exists on disk and is merely
    UNTRACKED is a file that would not ship — the same-commit discipline caught mid-violation.
    This runner's own first selftest run fired exactly that arm on itself, before it was added to
    the index, which is the case a generic "stale" message would have misdiagnosed."""
    on_disk = present_on_disk if present_on_disk is not None else tracked
    problems = []
    for name in sorted(tracked - instrument_files - set(non_instruments)):
        problems.append(f'UNDECLARED: .claude/{name} — declare it in battery.py as an '
                        'instrument (INSTRUMENTS) or as a non-instrument tool (NON_INSTRUMENTS)')
    for name in sorted((instrument_files | set(non_instruments)) - tracked):
        if name in on_disk:
            problems.append(f'NOT TRACKED: .claude/{name} — declared and present on disk but not '
                            'in the git index, so it would not ship; git add it in this commit')
        else:
            problems.append(f'DECLARED BUT ABSENT: .claude/{name} — the declaration is stale')
    return problems


def unphased_instruments(instruments, phases):
    """Assertion 3. An instrument whose phase is not a real phase would never be invoked."""
    return [f'BAD PHASE: {name} declares phase {phase!r}, not one of {list(phases)} — '
            'it would never be invoked'
            for name, phase, _marker, _argv in instruments if phase not in phases]


def ratchet_verdict(metric, previous, current, lower_to=None, lower_reason=None):
    """Assertion 4. Returns (problems, new_stored_value, notes).

    The whole mechanism: growth raises the stored value, equality holds it, ANY shrink is a problem,
    and a deliberate lower is applied FIRST and then subjected to the same comparison — so lowering
    to 380 on a corpus that actually holds 300 still fails. That composition is why there is no
    special case for "lower": it moves the bar, it does not switch the check off."""
    problems, notes = [], []
    if lower_to is not None:
        if not lower_reason:
            problems.append(
                f'LOWER REFUSED: --lower-ratchet={lower_to} given for {metric} with no '
                '--lower-reason — an explicit lower is a decision on the record, and a reasonless '
                'one is just a floor being quietly moved')
            return problems, previous, notes
        notes.append(f'RATCHET LOWERED: {metric} {previous} -> {lower_to} — {lower_reason}')
        previous = lower_to
    if previous is None:
        notes.append(f'RATCHET INITIALISED: {metric} at {current} — condition (8) applies, a first '
                     'run is calibration; the SECOND run is the check. git add '
                     '.claude/record_count.json, or every fresh clone re-calibrates from nothing')
        return problems, current, notes
    if current < previous:
        problems.append(
            f'RATCHET: {metric} SHRANK {previous} -> {current} ({previous - current} fewer). '
            'Either the producer silently lost records, or a real removal has not been declared. '
            'If the reduction is intended, step over the gap deliberately:\n'
            f'      python3 .claude/battery.py pre-commit --lower-ratchet={current} '
            '--lower-reason="<why>"')
        return problems, previous, notes
    if current > previous:
        notes.append(f'RATCHET RAISED: {metric} {previous} -> {current} — growth moves it up with '
                     'no ceremony; git add .claude/record_count.json in this commit')
        return problems, current, notes
    return problems, previous, notes


def load_ratchet(path=None):
    """A MISSING file is a first run. A file that EXISTS AND DOES NOT PARSE is a problem, never a
    silent re-initialisation: resetting the ratchet to nothing would discard the whole protection
    while printing a calibration note, which is precisely the degradation class the crosscheck
    refusal was written to kill. Returns (state or None, problems)."""
    path = path or RATCHET_FILE
    if not os.path.exists(path):
        return {'counts': {}, 'lowers': []}, []
    try:
        state = json.load(open(path, encoding='utf-8'))
        if not isinstance(state.get('counts'), dict):
            raise ValueError("no 'counts' object")
    except (OSError, ValueError) as exc:
        return None, [f'RATCHET UNREADABLE: {path} exists but does not parse — {exc}. Refusing to '
                      're-initialise, which would silently discard the ratchet.']
    state.setdefault('lowers', [])
    return state, []


def save_ratchet(state, path=None):
    path = path or RATCHET_FILE
    with open(path, 'w', encoding='utf-8') as handle:
        json.dump(state, handle, indent=1)
        handle.write('\n')


def ratchet_phrase(previous, current, new_value, problems):
    """The DONE line's ratchet clause. Machine-derived, because a restated one would drift."""
    if problems:
        return f'{previous} BREACHED by {current}'
    if previous is None:
        return f'{new_value} initialised (calibration)'
    if new_value > previous:
        return f'{previous}->{new_value} raised'
    if new_value < previous:
        return f'{previous}->{new_value} LOWERED deliberately'
    return f'{new_value} held'


def parse_lower(argv):
    """--lower-ratchet=N --lower-reason="why". Flag-shaped, so the phase parse ignores them.

    Returns (lowers, reason, problems) where `lowers` maps metric key -> value. A BARE `=N` still
    means the extractor's records metric, because that is what every existing invocation and the
    usage block above mean by it; a sidecar metric is addressed as `=<producer>.<metric>:<N>`.
    Keeping the bare form working matters more than uniformity here: the alternative is a flag that
    silently changes meaning for anyone who learned it before the sidecars existed."""
    lowers, reason, problems = {}, None, []
    for arg in argv[1:]:
        if arg.startswith('--lower-ratchet='):
            raw = arg.split('=', 1)[1]
            metric, _, value = raw.rpartition(':')
            metric = metric or RECORDS_METRIC
            try:
                lowers[metric] = int(value)
            except ValueError:
                problems.append(f'BAD FLAG: --lower-ratchet={raw!r} — takes an integer count, '
                                'optionally prefixed <producer>.<metric>: to name a sidecar metric')
        elif arg.startswith('--lower-reason='):
            reason = arg.split('=', 1)[1].strip() or None
    return lowers, reason, problems


# ---- the sidecar reader ------------------------------------------------------------------------
# Ships with its first producer (citation_crosscheck, 2026-09-06), per the convention above: a
# consumer with no producer could only be demonstrated against a fixture, and the standard is
# capability shown on real output.

SIDECAR_PREFIX = 'SIDECAR '


def parse_sidecars(text):
    """Every `SIDECAR {...}` line in one member's output. Returns (sidecars, problems).

    A MALFORMED sidecar is a PROBLEM, never skipped. Skipping is how a producer stops being
    ratcheted by accident: the line is still printed, the run is still green, and nothing is
    watching the number any more. That is the whole failure class this reader was built for, so it
    cannot be the reader's own error path."""
    sidecars, problems = {}, []
    for line in text.split('\n'):
        stripped = line.strip()
        if not stripped.startswith(SIDECAR_PREFIX):
            continue
        raw = stripped[len(SIDECAR_PREFIX):]
        try:
            payload = json.loads(raw)
        except ValueError as exc:
            problems.append(f'BAD SIDECAR: {raw[:80]!r} does not parse — {exc}. A sidecar that '
                            'cannot be read is an unratcheted metric wearing a ratchet.')
            continue
        name = payload.get('name')
        metrics = payload.get('metrics')
        if not isinstance(name, str) or not name:
            problems.append(f'BAD SIDECAR: {raw[:80]!r} has no "name" — the ratchet keys on the '
                            'producer, so an anonymous sidecar cannot be stored')
            continue
        if not isinstance(metrics, dict) or not metrics:
            problems.append(f'BAD SIDECAR: {name} carries no "metrics" object')
            continue
        bad_values = [k for k, v in metrics.items()
                      if not isinstance(v, int) or isinstance(v, bool)]
        if bad_values:
            problems.append(f'BAD SIDECAR: {name} metrics {sorted(bad_values)} are not integers — '
                            'the ratchet compares magnitudes and has nothing to compare')
            continue
        ratchet = payload.get('ratchet', [])
        if not isinstance(ratchet, list) or any(not isinstance(m, str) for m in ratchet):
            problems.append(f'BAD SIDECAR: {name} "ratchet" must be a list of metric names')
            continue
        undeclared = [m for m in ratchet if m not in metrics]
        if undeclared:
            problems.append(f'BAD SIDECAR: {name} asks to ratchet {sorted(undeclared)}, which it '
                            'does not report — a ratchet on an absent metric never fires')
            continue
        sidecars[name] = {'metrics': metrics, 'ratchet': ratchet}
    return sidecars, problems


def sidecar_metric_key(producer, metric):
    """NAMESPACED, and this is load-bearing rather than tidy. citation_crosscheck's sidecar reports
    a metric it calls `records` — its identifier-carrying total — and the extractor's long-standing
    ratchet key is also `records`, holding a much larger number. Unnamespaced, the first live run
    of this reader would have read one producer's metric against the other's stored value and fired
    RATCHET SHRANK on a corpus that had not moved at all. A reader whose first act is a false
    positive teaches people to pass --lower-ratchet, which is the opposite of the point."""
    return f'{producer}.{metric}'


def vanished_ratchets(counts, sidecars, ran):
    """A metric that was ratcheted before and is not declared now. The producer-side loophole in
    the convention: any instrument could stop asking to be ratcheted — drop the entry from its
    `ratchet` array, or stop printing the sidecar entirely — and every later run would pass while
    watching one metric fewer. Same shape as assertion 1 one level in, and closed the same way,
    against COMMITTED state rather than a hand-maintained map of who-reports-what.

    SCOPED TO THE MEMBERS THAT RAN, which is what makes it correct across phases: deploy_check's
    metrics live in the same state file and are legitimately absent from a pre-commit run."""
    problems = []
    for key in sorted(counts):
        producer, sep, metric = key.partition('.')
        if not sep or producer not in ran:
            continue
        declared = sidecars.get(producer, {}).get('ratchet', [])
        if metric in declared:
            continue
        if producer not in sidecars:
            problems.append(
                f'RATCHET ABANDONED: {producer} ran and printed no sidecar, but {key} is '
                'ratcheted in committed state. Either restore the sidecar or remove the stored '
                'metric deliberately — a producer silently dropping its own ratchet is exactly '
                'the hole the sidecar convention was written to close.')
        else:
            problems.append(
                f'RATCHET ABANDONED: {producer} no longer lists {metric!r} in its sidecar '
                f'"ratchet" array, but {key} is ratcheted in committed state. Dropping a metric '
                'from the array turns the ratchet off while the run stays green.')
    return problems


def missing_from_run(expected, results):
    """Assertion 1. `expected` is the phase's declared member names; `results` maps name ->
    (exit_code, marker_seen). A member absent from `results` was never attempted; a member with
    marker_seen False ran without printing its DONE line; a non-zero exit is its own failure."""
    problems = []
    for name in expected:
        if name not in results:
            problems.append(f'NEVER RAN: {name} — declared for this phase and not invoked')
            continue
        code, marker_seen = results[name]
        if not marker_seen:
            problems.append(f'NO DONE LINE: {name} — ran without printing its marker '
                            '(vacuous run; the 7-bis failure)')
        elif code != 0:
            problems.append(f'FAILED: {name} — exit {code}')
    return problems


# ---- preflight -------------------------------------------------------------------------------

def regenerate_records():
    """The v2 records artifact, which citation_polarity and citation_crosscheck both consume.

    It is generated on demand and never committed, so the runner rebuilds it rather than trusting
    whatever is left in TMPDIR from an earlier session — a stale artifact would make both scans
    describe a corpus that no longer exists. citation_crosscheck.py now REFUSES without it
    (2026-09-05: it used to default to an empty list and quietly check 110 records instead of
    142), and regenerating here is what keeps that refusal from ever firing in normal use."""
    os.makedirs(WORK_DIR, exist_ok=True)
    print('--- preflight: regenerating the v2 records artifact')
    proc = subprocess.run(['python3', '.claude/extract_citations.py', RECORDS_ARTIFACT],
                          cwd=REPO_ROOT, capture_output=True, text=True)
    sys.stdout.write(''.join(f'    {line}\n' for line in proc.stdout.split('\n') if line.strip()))
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        return None, [f'PREFLIGHT FAILED: extract_citations.py exit {proc.returncode}']
    try:
        records = json.load(open(RECORDS_ARTIFACT, encoding='utf-8'))
    except Exception as exc:
        return None, [f'PREFLIGHT FAILED: records artifact unreadable — {exc}']
    if not records:
        return None, ['PREFLIGHT FAILED: records artifact is empty — every citation scan '
                      'downstream would be vacuously clean']
    return len(records), []


def start_dev_server():
    """regress.js expects a server already listening; it does not start one. Starting it here is
    what makes a full battery run a single command. If it fails to come up, regress cannot reach
    the page, prints no DONE line, and assertion 1 fails the battery by name — fail-closed
    without any extra check, which is the right amount of machinery for this."""
    proc = subprocess.Popen(['python3', '.claude/nocache_server.py', REGRESS_PORT],
                            cwd=REPO_ROOT, stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL, start_new_session=True)
    url = f'http://127.0.0.1:{REGRESS_PORT}/cancer-atlas.html'
    for _attempt in range(40):
        try:
            urllib.request.urlopen(url, timeout=1).read(1)
            return proc
        except (urllib.error.URLError, OSError):
            time.sleep(0.25)
    return proc      # never came up; regress will fail and say so


def stop_dev_server(proc):
    if proc is None:
        return
    try:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except (ProcessLookupError, PermissionError):
        proc.terminate()


# ---- running ---------------------------------------------------------------------------------

def run_member(name, marker, argv):
    """One instrument, through run_checked.sh — the member's own DONE-marker obligation is
    enforced by the existing wrapper rather than re-implemented here. Output is streamed with the
    member's name prefixed so a long battery log stays readable, and DONE lines are passed through
    UNCHANGED so `commit_checked.sh "<subject>" "DONE "` can quote every one of them verbatim."""
    print(f'--- {name}')
    proc = subprocess.run(['sh', '.claude/run_checked.sh', marker] + argv,
                          cwd=REPO_ROOT, capture_output=True, text=True)
    combined = proc.stdout + proc.stderr
    for line in combined.split('\n'):
        if not line.strip():
            continue
        # DONE lines unindented and unmodified: they are quoted into commit messages by grep.
        # BY FORM, not by this member's declared marker (2026-09-06). Indenting is what decides
        # whether commit_checked.sh's anchored matcher can see a line, so the two have to agree on
        # what a DONE line IS or the printer silently hides output from the record. Marker-based
        # indenting already had a latent instance: a member whose selftest prints
        # `DONE <name>_selftest:` does not contain its own marker `DONE <name>:`, so it was indented
        # and would be dropped — deploy_check's is exactly that shape. Same two forms as
        # .claude/commit_checked.sh's DONE_LINE_RE, duplicated knowingly and named there too.
        is_done = line.startswith('DONE ') or line.startswith('==== DONE')
        print(line if is_done else f'    {line}')
    # The output is returned so the sidecar reader can parse STRUCTURE out of it. Note what is
    # NOT returned to that reader's caller: any interpretation of the human DONE line. The
    # sidecar is a separate channel on purpose.
    return proc.returncode, marker in combined, combined


# ---- selftest --------------------------------------------------------------------------------

def selftest():
    ok = True
    arms = 0
    failures = 0

    def say(good, message):
        nonlocal ok, arms, failures
        ok = ok and good
        arms += 1
        if not good:
            failures += 1
        print(f"  {'ok  ' if good else 'FAIL'} {message}")

    # arm 1: THE FAILURE THIS TOOL EXISTS FOR — a declared member absent from the run.
    say(any('NEVER RAN' in p for p in missing_from_run(
        ['a', 'b'], {'a': (0, True)})),
        'fires when a declared member never ran (the polarity shape: dead instrument, '
        'battery still green)')
    # arm 2: a member that ran and printed no marker — the 7-bis failure, distinct from arm 1
    # because "attempted" and "reported" are different claims and only the second is a check.
    say(any('NO DONE LINE' in p for p in missing_from_run(['a'], {'a': (0, False)})),
        'fires when a member runs without printing its DONE line')
    # arm 3: a member that reported and failed must still fail the battery
    say(any('FAILED' in p for p in missing_from_run(['a'], {'a': (1, True)})),
        'fires when a member reports and exits non-zero')
    # arm 4: the passing direction — a complete phase must be silent, or the battery is stuck
    # failing and nobody would keep running it.
    say(not missing_from_run(['a', 'b'], {'a': (0, True), 'b': (0, True)}),
        'passes when every declared member ran, reported, and exited zero')

    # arm 5: assertion 2 fires on an undeclared file — the staleness hole record_sync_check.py
    # admits to in its own map, closed here by making the list total over the directory.
    say(any('UNDECLARED' in p for p in undeclared_files(
        {'known.py', 'brand_new_check.py'}, {'known.py'}, {})),
        'fires on a tracked .claude/ file that is neither instrument nor declared tool')
    # arm 6: and on the reverse half — a declaration pointing at a file that is gone
    say(any('DECLARED BUT ABSENT' in p for p in undeclared_files(
        {'known.py'}, {'known.py', 'deleted_check.py'}, {}, present_on_disk={'known.py'})),
        'fires on a declaration whose file no longer exists (stale in the other direction)')
    # arm 6b: the same half, but the file EXISTS and is merely unstaged — a different problem, and
    # the one this runner hit on itself the first time it ran.
    say(any('NOT TRACKED' in p for p in undeclared_files(
        {'known.py'}, {'known.py', 'new_check.py'}, {},
        present_on_disk={'known.py', 'new_check.py'})),
        'distinguishes a declared-but-unstaged file from a stale declaration')
    say(not undeclared_files({'a.py', 'b.json'}, {'a.py'}, {'b.json': 'data'}),
        'passes a fully declared directory')

    # arm 7: assertion 3 — a typo in a phase name silently retires an instrument, which is the
    # tool's own failure mode reintroduced through its own declaration.
    say(unphased_instruments([('x', 'pre_commit', 'DONE x:', [])], PHASES),
        'fires on an instrument declared with a phase that does not exist')
    say(not unphased_instruments(INSTRUMENTS, PHASES),
        'the live instrument list has no unphased member')

    # arm 8: the live declarations must actually be total over the live directory. This is the
    # one arm that reads real state, and it is the arm that will fail on the day someone adds an
    # instrument without declaring it — which is the point.
    live = undeclared_files(tracked_claude_files(), declared_instrument_files(), NON_INSTRUMENTS,
                            present_on_disk=present_claude_files())
    say(not live, f'the live .claude/ directory is fully declared '
                  f'({len(tracked_claude_files())} tracked files)'
                  + ('' if not live else f' — {live}'))
    # arm 9: every phase has at least one member, so `battery.py <phase>` can never be a no-op
    # run that exits zero having checked nothing.
    for phase in PHASES:
        members = [n for n, p, _m, _a in INSTRUMENTS if p == phase]
        say(bool(members), f'phase {phase!r} has declared members ({len(members)})')

    # arm 10: assertion 4, the ratchet, in every direction. The load-bearing arm is the SHRINK BY
    # ONE: "material" is defined as any decrease, so a check that only fired on a large drop would
    # be a tolerance band nobody declared.
    say(any('SHRANK' in p for p in ratchet_verdict('records', 408, 407)[0]),
        'fires on a shrink of ONE (any decrease is material — the extractor is deterministic, '
        'so there is no noise band)')
    say(any('SHRANK' in p for p in ratchet_verdict('records', 408, 300)[0]),
        'fires on the named hole exactly: 300 records where 408 stood')
    grow_problems, grow_value, grow_notes = ratchet_verdict('records', 408, 450)
    say(not grow_problems and grow_value == 450 and any('RAISED' in n for n in grow_notes),
        'growth never trips it and moves the stored value up automatically (408 -> 450)')
    hold_problems, hold_value, _hold_notes = ratchet_verdict('records', 408, 408)
    say(not hold_problems and hold_value == 408, 'an unchanged count holds, silently')
    # the deliberate step over the gap: allowed, but only with a reason, and still checked
    low_problems, low_value, low_notes = ratchet_verdict('records', 408, 380, lower_to=380,
                                                        lower_reason='two removed under '
                                                                     'source-or-remove')
    say(not low_problems and low_value == 380 and any('LOWERED' in n for n in low_notes),
        'accepts an explicit lower WITH a reason and records it')
    say(any('LOWER REFUSED' in p for p in ratchet_verdict('records', 408, 380, lower_to=380)[0]),
        'refuses a lower with no reason (a reasonless lower is a floor being moved quietly)')
    say(any('SHRANK' in p for p in ratchet_verdict('records', 408, 300, lower_to=380,
                                                   lower_reason='declared')[0]),
        'a lower still gets checked: lowering to 380 on a corpus of 300 fires anyway')
    first_problems, first_value, first_notes = ratchet_verdict('records', None, 408)
    say(not first_problems and first_value == 408 and any('INITIALISED' in n for n in first_notes),
        'a first run initialises without failing, and says it is calibration (condition (8))')
    # arm 11: a present-but-corrupt state file must be a PROBLEM, not a silent re-initialisation.
    corrupt = os.path.join(tempfile.mkdtemp(), 'record_count.json')
    open(corrupt, 'w').write('{ not json')
    corrupt_state, corrupt_problems = load_ratchet(corrupt)
    say(corrupt_state is None and any('UNREADABLE' in p for p in corrupt_problems),
        'a corrupt ratchet file is a problem, not a reset (discarding the floor silently is the '
        'degradation class, not a recovery)')
    missing_state, missing_problems = load_ratchet(os.path.join(os.path.dirname(corrupt), 'nope.json'))
    say(missing_state == {'counts': {}, 'lowers': []} and not missing_problems,
        'an absent ratchet file is a first run, not a failure')

    # arm 12: the SIDECAR READER. The passing direction first, on a line in the shape its first
    # producer actually prints, so this arm fails if that format ever drifts.
    good_line = ('DONE citation_crosscheck: 1 records checked, 0 flags\n'
                 'SIDECAR {"metrics": {"flags": 0, "records": 1}, '
                 '"name": "citation_crosscheck", "ratchet": ["records"]}')
    parsed, parse_problems = parse_sidecars(good_line)
    say(not parse_problems and parsed.get('citation_crosscheck', {}).get('ratchet') == ['records']
        and parsed['citation_crosscheck']['metrics']['flags'] == 0,
        'reads a well-formed sidecar and leaves the human DONE line alone')
    say(parse_sidecars('DONE something: 3 things, 0 problems') == ({}, []),
        'output with no sidecar is not a problem (nine instruments have not been retrofitted, '
        'and the convention says do not sweep them)')
    # every malformed direction is a PROBLEM rather than a skip: a skipped sidecar is a metric that
    # silently stops being watched, which is the failure this reader exists to prevent.
    for label, line in [
            ('unparseable JSON', 'SIDECAR {not json'),
            ('no name', 'SIDECAR {"metrics": {"a": 1}}'),
            ('no metrics', 'SIDECAR {"name": "x"}'),
            ('a non-integer metric', 'SIDECAR {"name": "x", "metrics": {"a": "many"}}'),
            ('a boolean posing as a count', 'SIDECAR {"name": "x", "metrics": {"a": true}}'),
            ('a ratchet on an unreported metric',
             'SIDECAR {"name": "x", "metrics": {"a": 1}, "ratchet": ["b"]}')]:
        found, found_problems = parse_sidecars(line)
        say(bool(found_problems) and not found, f'refuses a sidecar with {label}')

    # arm 13: the namespacing, which is the collision this reader would have shipped with. The two
    # metrics are both called "records" and hold different numbers.
    say(sidecar_metric_key('citation_crosscheck', 'records') != RECORDS_METRIC,
        "a producer's `records` metric cannot collide with the extractor's `records` ratchet "
        '(unnamespaced, the reader\'s first live run would have fired SHRANK on a corpus that '
        'had not moved)')

    # arm 14: the producer-side loophole — a metric that was ratcheted and is not declared now.
    say(any('RATCHET ABANDONED' in p for p in vanished_ratchets(
        {'citation_crosscheck.records': 142},
        {'citation_crosscheck': {'metrics': {'records': 142}, 'ratchet': []}},
        {'citation_crosscheck'})),
        'fires when a producer drops a metric from its own "ratchet" array (turning the ratchet '
        'off while the run stays green)')
    say(any('printed no sidecar' in p for p in vanished_ratchets(
        {'citation_crosscheck.records': 142}, {}, {'citation_crosscheck'})),
        'fires when a producer with a ratcheted metric stops printing its sidecar entirely')
    say(not vanished_ratchets(
        {'citation_crosscheck.records': 142},
        {'citation_crosscheck': {'metrics': {'records': 142}, 'ratchet': ['records']}},
        {'citation_crosscheck'}),
        'passes while the metric is still declared')
    say(not vanished_ratchets({'deploy_check.assets': 27}, {}, {'citation_crosscheck'}),
        "does NOT fire on another phase's stored metrics (deploy_check is post-push and is "
        'legitimately absent from a pre-commit run)')
    say(not vanished_ratchets({RECORDS_METRIC: 408}, {}, {'citation_crosscheck'}),
        "does NOT fire on the extractor's un-namespaced metric, which has no producer to run")

    # arm 15: the lower flag, both address forms. The bare form is load-bearing: it is what the
    # usage block documents and what every existing invocation means, so a reader that quietly
    # repurposed it would break a documented flag to gain uniformity.
    bare_lowers, bare_reason, bare_problems = parse_lower(
        ['battery.py', 'pre-commit', '--lower-ratchet=406', '--lower-reason=two dropped'])
    say(bare_lowers == {RECORDS_METRIC: 406} and bare_reason == 'two dropped' and not bare_problems,
        "a bare --lower-ratchet=N still addresses the extractor's records metric")
    keyed_lowers, _keyed_reason, keyed_problems = parse_lower(
        ['battery.py', 'pre-commit', '--lower-ratchet=citation_crosscheck.records:140'])
    say(keyed_lowers == {'citation_crosscheck.records': 140} and not keyed_problems,
        '--lower-ratchet=<producer>.<metric>:N addresses one sidecar metric')
    say(any('BAD FLAG' in p for p in parse_lower(['battery.py', '--lower-ratchet=lots'])[2]),
        'refuses a non-integer lower rather than ignoring the flag')

    print('SELFTEST', 'PASS — fires on a missing member, a vacuous member, a failing member, '
          'an undeclared file, a stale declaration, a bad phase, a shrinking corpus, a malformed '
          'sidecar and an abandoned ratchet; passes complete sets'
          if ok else 'FAIL — do not trust a green battery from this build')
    # 7-bis applies to the selftest as well (deploy_check.js's precedent): a selftest that never
    # executed must not be indistinguishable from one that passed.
    print(f'DONE battery_selftest: {arms} arms run, {failures} failures')
    return ok


# ---- main ------------------------------------------------------------------------------------

def main(argv):
    if not selftest():
        return 1
    if '--selftest' in argv:
        return 0
    phase = next((a for a in argv[1:] if not a.startswith('-')), None)
    if phase not in PHASES:
        print(f'usage: battery.py [{" | ".join(PHASES)}] [--selftest]', file=sys.stderr)
        return 2

    problems = []
    problems += undeclared_files(tracked_claude_files(), declared_instrument_files(),
                                 NON_INSTRUMENTS, present_on_disk=present_claude_files())
    problems += unphased_instruments(INSTRUMENTS, PHASES)

    members = [(n, m, a) for n, p, m, a in INSTRUMENTS if p == phase]
    needs_records = any(RECORDS_ARTIFACT in a for _n, _m, a in members)
    needs_server = any('.claude/regress.js' in a for _n, _m, a in members)

    lowers, lower_reason, flag_problems = parse_lower(argv)
    problems += flag_problems

    # ONE state object for both ratchet paths — the extractor's metric and every sidecar metric —
    # and one save at the end, so a run cannot half-write the file.
    state, load_problems = load_ratchet()
    problems += load_problems
    ratchet_dirty = False

    record_count = None
    ratchet_clause = 'n/a'
    if needs_records:
        record_count, preflight_problems = regenerate_records()
        problems += preflight_problems
        if preflight_problems:
            # Downstream citation scans would be vacuously clean; do not run them at all rather
            # than print two green DONE lines over an empty corpus.
            members = [(n, m, a) for n, m, a in members if RECORDS_ARTIFACT not in a]
        elif state is None:
            ratchet_clause = 'UNREADABLE'
        else:
            previous = state['counts'].get(RECORDS_METRIC)
            ratchet_problems, new_value, notes = ratchet_verdict(
                RECORDS_METRIC, previous, record_count, lowers.get(RECORDS_METRIC), lower_reason)
            problems += ratchet_problems
            for note in notes:
                print(f'    {note}')
            ratchet_clause = ratchet_phrase(previous, record_count, new_value, ratchet_problems)
            if not ratchet_problems and new_value != previous:
                if RECORDS_METRIC in lowers:
                    state['lowers'].append({'metric': RECORDS_METRIC, 'from': previous,
                                            'to': lowers[RECORDS_METRIC], 'count': record_count,
                                            'reason': lower_reason})
                state['counts'][RECORDS_METRIC] = new_value
                ratchet_dirty = True

    server = start_dev_server() if needs_server else None
    results, outputs = {}, {}
    try:
        for name, marker, argv_member in members:
            code, marker_seen, text = run_member(name, marker, argv_member)
            results[name] = (code, marker_seen)
            outputs[name] = text
    finally:
        stop_dev_server(server)

    problems += missing_from_run([n for n, _m, _a in members], results)

    # ---- sidecars ------------------------------------------------------------------------------
    # Read only from members that RAN, REPORTED AND EXITED ZERO. That scoping is deliberate in both
    # directions. A failing member is already failing by name, and its absent sidecar is a
    # CONSEQUENCE of that failure, not an independent finding — citation_crosscheck's own new abort
    # path exits before printing one, so an unscoped reader would add "you dropped your ratchet" on
    # top of the real diagnosis and point at the wrong thing. And it opens no loophole: a producer
    # that quietly stops ratcheting a metric still reports and still exits zero, so it is still in
    # scope and still caught below.
    reported_clean = {name for name, (code, seen) in results.items() if seen and code == 0}
    sidecars = {}
    for name in sorted(reported_clean):
        parsed, parse_problems = parse_sidecars(outputs[name])
        problems += parse_problems
        for producer, payload in parsed.items():
            if producer != name:
                problems.append(
                    f'SIDECAR MISATTRIBUTED: {name} printed a sidecar naming {producer!r}. The '
                    'ratchet keys on the producer, so a member writing under another name would '
                    "compare its own numbers against a different instrument's stored value.")
                continue
            sidecars[producer] = payload

    problems += vanished_ratchets(state['counts'] if state else {}, sidecars, reported_clean)

    ratcheted_metrics = 0
    if state is not None:
        for producer in sorted(sidecars):
            payload = sidecars[producer]
            for metric in payload['ratchet']:
                key = sidecar_metric_key(producer, metric)
                previous = state['counts'].get(key)
                current = payload['metrics'][metric]
                metric_problems, new_value, notes = ratchet_verdict(
                    key, previous, current, lowers.get(key), lower_reason)
                problems += metric_problems
                for note in notes:
                    print(f'    {note}')
                ratcheted_metrics += 1
                if not metric_problems and new_value != previous:
                    if key in lowers:
                        state['lowers'].append({'metric': key, 'from': previous,
                                                'to': lowers[key], 'count': current,
                                                'reason': lower_reason})
                    state['counts'][key] = new_value
                    ratchet_dirty = True

    if state is not None and ratchet_dirty:
        save_ratchet(state)

    print()
    for problem in problems:
        print(f'  {problem}')
    declared_for_phase = sum(1 for _n, p, _m, _a in INSTRUMENTS if p == phase)
    reported = sum(1 for code, seen in results.values() if seen and code == 0)
    # DONE line last (7-bis). REPORTED-over-DECLARED, not a bare total — deploy_check.js printed
    # "27 assets byte-matched" on a run where four demonstrably had not, in the one instrument
    # whose whole purpose was refusing a green-looking summary. The lesson generalises: a count
    # in a DONE line must name its denominator.
    # "reported", NOT "reported clean": regress.js exits 0 carrying two KNOWN label-overlap
    # failures, so a battery line claiming clean would be false on every green run. The runner
    # counts marker-printed-and-exit-zero and says exactly that; each member's own DONE line
    # carries its own findings, quoted verbatim, which is where the numbers belong.
    print(f'DONE battery: phase {phase} — {reported}/{declared_for_phase} declared instruments '
          f'ran and reported (marker printed, exit 0), {len(INSTRUMENTS)} declared in total, '
          f'{len(tracked_claude_files())} .claude/ files all declared, '
          f'{record_count if record_count is not None else "n/a"} citation records extracted '
          f'(ratchet {ratchet_clause}), {len(sidecars)}/{len(reported_clean)} reporting members '
          f'emitted a sidecar, {ratcheted_metrics} sidecar metrics ratcheted, '
          f'{len(problems)} problems')
    return 1 if problems else 0


if __name__ == '__main__':
    if shutil.which('git') is None:
        print('battery: git is required (assertion 2 reads the index)', file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv))
