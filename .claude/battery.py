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
# WHAT THIS ADDS IS TWO ASSERTIONS. Everything else here is plumbing.
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
# WHAT IT DOES NOT COVER, named rather than left implicit: a SILENTLY SHRINKING extractor. The
# runner asserts the records artifact is non-empty and prints its count, but a v3 extractor that
# emitted 300 records instead of 408 would pass. A floor constant would go stale on the next
# legitimate corpus growth, so the honest state is: uncovered, visible in the DONE line, and the
# same class as the crosscheck degradation this commit fixed one layer down.
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
        print(line if marker in line else f'    {line}')
    return proc.returncode, marker in combined


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

    print('SELFTEST', 'PASS — fires on a missing member, a vacuous member, a failing member, '
          'an undeclared file, a stale declaration and a bad phase; passes complete sets'
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

    record_count = None
    if needs_records:
        record_count, preflight_problems = regenerate_records()
        problems += preflight_problems
        if preflight_problems:
            # Downstream citation scans would be vacuously clean; do not run them at all rather
            # than print two green DONE lines over an empty corpus.
            members = [(n, m, a) for n, m, a in members if RECORDS_ARTIFACT not in a]

    server = start_dev_server() if needs_server else None
    results = {}
    try:
        for name, marker, argv_member in members:
            results[name] = run_member(name, marker, argv_member)
    finally:
        stop_dev_server(server)

    problems += missing_from_run([n for n, _m, _a in members], results)

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
          f'{record_count if record_count is not None else "n/a"} citation records extracted, '
          f'{len(problems)} problems')
    return 1 if problems else 0


if __name__ == '__main__':
    if shutil.which('git') is None:
        print('battery: git is required (assertion 2 reads the index)', file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv))
