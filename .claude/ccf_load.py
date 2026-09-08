#!/usr/bin/env python3
# The ccf READ LOAD, measured (2026-09-07). A DECLARED NON-INSTRUMENT: it reports and asserts
# nothing, has no ratchet, emits no sidecar, and cannot fail. Its output is EVIDENCE, for planning a
# read batch — the same standing as figure_search.py and extract_citations.py, and deliberately NOT
# the standing of a gate.
#
# WHY THIS IS NOT AN INSTRUMENT (user ruling, 2026-09-07, declining one). The failure mode a
# freshness instrument would catch — a load figure in CLAUDE.md going stale — is ALREADY PREVENTED by
# commit-binding, the fourth of the number rule's four remedies: "measured at 37aa47a on a clean
# tree" is a claim about a named tree, and a claim about a named tree cannot go stale. What an
# instrument adds is FRESHNESS, which is nicer and not load-bearing, and it costs a sixteenth
# declared instrument plus another sidecar to keep in step. Same bar the glob checker was declined
# on: an existing remedy that already closes the hole beats a second one that closes it sooner.
# Recorded as CONSIDERED AND DECLINED rather than as a held shape — this is not waiting to be built.
# THE LINE THAT WOULD HAVE TO CHANGE IF THAT IS EVER REVISITED is the "bound to a commit because no
# instrument prints it" clause in CLAUDE.md's load paragraph, which is where the trigger comment
# sits. Both halves of that clause would become false at once.
#   READ THE NEXT PARAGRAPH BEFORE ACTING ON THIS ONE. The argument above is the one the decline was
# MADE on, and it still holds for the decline; it is NOT the reason this file exists, and stopping
# here would leave a reader thinking the only thing lost was earlier detection.
#
# WHY SAVING IT IS WORTH MORE THAN THE INSTRUMENT WOULD HAVE BEEN, and this is THE justification to
# re-read if anyone re-examines the decline, because it is the one that survives (user ruling,
# 2026-09-07, revising their own reasoning after watching --verify work): the decline was argued on
# FRESHNESS — commit-binding already prevents a stale figure, so an instrument would only detect
# staleness sooner. But freshness is not what --verify turned out to do. IT CHECKS THE PROSE THAT
# RECORDED THE FIGURE. "They attach 29 blocks" had two candidate antecedents; the script disagreed
# with all four numbers; chasing the disagreement found AN AMBIGUITY IN THE SENTENCE rather than an
# error in the tree. In the user's words: "a saved measurement that refuses to agree quietly is a
# guard on the sentence, and no commit-binding gives you that."
#   THE TWO REMEDIES ARE THEREFORE NOT COMPARABLE, WHICH IS WHY THE DECLINE AND THE SAVE ARE BOTH
# RIGHT. Commit-binding fixes a figure to a tree — it says WHEN the number was true, and it cannot
# say WHAT WAS COUNTED, because the thing that names the population is prose and prose is checked by
# nothing. A re-derivable measurement is the only artefact that can contradict its own record, and it
# is worth keeping for THAT, not for currency. An instrument would have added earlier detection of a
# problem commit-binding already closes; this file adds a check on a claim NOTHING closes.
#
# THE UNIT IS THE RECORD ONLY — REVERTED (2026-09-08), BECAUSE BATCH 4 TESTED THE RE-SPECIFICATION
# AND IT CAME BACK NEGATIVE. This line previously declared THE RECORD PLUS ITS PROVENANCE COMMENT,
# from CLAUDE.md's re-specification of 2026-09-07. Batch 4 is the batch that unit was specified for,
# and the user's ruling on its result is the reversion: "I ruled the record-plus-comment
# re-specification. Batch 4 says it doesn't generalize: zero defects in the comment half, and
# prediction (2) falsified 0 of 2 — on the stratum that exists to test it, at real reading cost, with
# the strata not even effort-matched. The bladder case that motivated it was real, but it was n=1,
# and one instance is what a pre-registration exists to keep from becoming a rule." Those figures are
# QUOTED rather than restated; batch 4's write-up in CLAUDE.md is their only home.
#
# NONE OF THE ATTACHMENT MACHINERY IS REMOVED, AND THAT IS NOT SENTIMENT — three live things need it.
# `--stratum` is batch 4's REPLAY, and a result whose sampling procedure has been deleted is a result
# nobody can check. The load measurement below is comment-inclusive by construction, and `--verify`
# binds it to a named commit. And the one class that SURVIVED the reversion is narrower and needs
# both halves present at once: a comment block that CONTRADICTS its own record. In the user's words,
# "Reading the comment half found nothing; comparing the two halves mechanically would have found
# bladder." That is a grep over a pair, not a unit to read, which is why `unit` keeps both blocks.
# THE LINE THAT HAS TO CHANGE IF RECORD-ONLY EVER BECOMES A REMOVAL rather than a default is
# `stratify()`'s `len(r['unit']) > 1` test — the only place the two strata are distinguished.
#
# HOW ATTACHMENT IS COMPUTED, UNCHANGED: mechanically rather than judged — the contiguous `//` block
# immediately above the record's own line, PLUS the contiguous `//` block immediately above the
# declaration of the array the record sits in. Both kinds, because the bladder defect was in the
# second kind.
#
# THE POPULATION IS EVERY `gene:` RECORD, NOT ONLY THE ccf-CARRYING ONES, and this line exists
# because the first draft of this script got it wrong. CLAUDE.md reads "144 records carry a `gene:`
# field and 117 of those carry a ccf; THEY attach 29 distinct comment blocks" — and "they" is
# ambiguous in a way that matters: scored over the 117 the same tree yields 26 blocks, 951 lines,
# median 25 and 39 attaching none, none of which is the recorded figure. The draft reported the
# RECORD as wrong before the sweep below showed the record was right and the script was reading a
# smaller population. A saved script disambiguates the prose that a remembered one cannot.
#
# COMMENT LINES ARE COUNTED ONCE, NOT ONCE PER READER. A block above a container serves every record
# inside it, so the load is blocks PLUS clauses, not clauses TIMES lines. That is why `comment_lines`
# is a sum over DISTINCT blocks and not over records.
#
# CORPUS FROM GIT, NOT FROM A GLOB — the same rule extract_citations.corpus_paths() follows, for the
# same reason: a glob sees untracked scratch, and a figure a fresh checkout cannot reproduce is not a
# figure. `--at <commit>` reads that tree via `git show`; with no argument it reads the INDEX's file
# list from disk, so a staged organ counts in the commit that adds it.
#
# CALIBRATION, WHICH IS WHY THIS FILE IS TRUSTWORTHY AT ALL: `--verify` re-derives the four figures
# CLAUDE.md binds to 37aa47a and refuses to agree quietly. A measuring script with no known-answer
# case is an oracle nobody has attacked; this one has exactly one, and it is a real commit rather
# than a fixture. If --verify fails, distrust THIS FILE before distrusting the record.
#
# THE FRAME AND THE DRAW LIVE HERE TOO, ADDED (2026-09-08) BECAUSE BATCH 2'S SAMPLE CANNOT BE
# REPLAYED — and that was established by TRYING TO REPLAY IT, not by noticing a missing file.
# CLAUDE.md records batch 2 as "15 records drawn from a frame of 48 mechanism-`note` sentences, seed
# `int('b0f7330',16)` — the HEAD at which the frame was built, fixed before the draw and auditable".
# AUDITABLE IS THE WORD THAT IS FALSE, and it is corrected at that sentence in CLAUDE.md, not only
# here. Three checks, in the order they were run:
#   (1) no frame or draw artefact was ever tracked. 89 distinct paths exist across ALL of history,
#       and the only ever-added file matching frame|draw|sampl|batch|ccf is THIS ONE;
#   (2) `git log --all -S"b0f7330"` returns exactly one commit — ab3ed93, the commit that WROTE the
#       claim, in CLAUDE.md and in the citations.json entry extracted from that same prose. THE ONLY
#       WITNESS IS THE SENTENCE UNDER SUSPICION, which a pickaxe hit cannot tell you by itself;
#   (3) the frame size is not re-derivable from its own description. Ten mechanical readings of
#       "mechanism-`note` sentences" were scored at b0f7330 and NONE yields 48 — that tree carries
#       144 gene-bearing records and 321 note sentences, and the nearest candidate is 56 records
#       whose note contains "et al.". Checked before concluding, because "I cannot find the file" and
#       "the description does not determine the set" are different failures with different remedies.
# A SEED IS NOT A RECIPE. Replaying a sample needs the FRAME MEMBERSHIP and the DRAW PROCEDURE too,
# and neither was written down. This is this file's own lesson — "A FIGURE THAT ONLY A REMEMBERED
# METHOD CAN REPRODUCE IS NOT REALLY BOUND TO ANYTHING" — firing on a SAMPLE rather than a figure,
# and note that commit-binding, the remedy that saves a figure, buys nothing here: b0f7330 pins the
# tree the frame was drawn FROM and says nothing about which 48 of it were IN the frame.
#
# SO THE PROCEDURE IS WRITTEN DOWN AND NOT ONLY THE SEED: the frame is sorted by (path, line) and the
# sample is `random.Random(key).sample(frame, n)`, with `key = int(seed, 16)` for a hex seed so a
# commit prefix can go on being one. SORTING BEFORE SAMPLING IS LOAD-BEARING — corpus() sorts paths,
# but a frame in dict or filesystem order would let the same seed draw different members elsewhere.
#
# MEMBERS ARE NAMED BY SPAN, NOT BY LINE, because two of batch 3's three `file:line` pointers were
# already wrong in the commit that wrote them. The ladder is shortest-first and stops at the first
# span occurring EXACTLY ONCE in its own file, which is the contract internal_quote_check.py already
# enforces on `QUOTES <path>` blocks: bare `gene:'…'`, then gene-through-ccf, then the whole record
# line. A record whose own line is not unique is reported UNANCHORABLE rather than handed a span that
# cannot be verified — an unverifiable pointer is what this is trying to stop producing.
#
# CONTAMINATION IS MECHANICAL, AND REFUSES WHEN IT CANNOT BE: `--touched-by C` marks every member
# whose UNIT lines — the record line PLUS its attached comment blocks — commit C changed. That is
# batch 3's judged "four members were lines edited that same day and were EXCLUDED AS CONTAMINATED"
# made computable, and it matters for batch 4 because ab3ed93 repaired six batch-2 records: 6
# comment lines and 6 non-comment lines added across four organ files. It requires the frame's own
# commit to BE C, because hunk line numbers are only meaningful in the tree they were computed
# against; asked for any other pairing it refuses rather than quietly comparing two trees' addresses.
import random, re, statistics, subprocess, sys
from collections import Counter

RECORD = re.compile(r"\bgene:\s*'")
CCF = re.compile(r"\bccf:\s*'")
# An array opening at end of line: `const TRUNK_UC = [`, `PRIVATE_POOL_LUAD = [`, `sites: [`.
# Every narrower variant tried (const-only, const|let|var, any bracket) measured IDENTICALLY on the
# corpus at 37aa47a, so the breadth here is not load-bearing and is not tuned to the answer.
ARRAY_OPEN = re.compile(r"(?:const\s+\w+\s*=|\b[\w']+\s*:)\s*\[\s*$")

# CLAUDE.md's figures for 37aa47a, transcribed. The prose is the source of truth; this is a copy
# kept HERE so --verify can fail, and it is the one place a copy is warranted.
CALIBRATION = {'commit': '37aa47a', 'records': 144, 'with_ccf': 117, 'blocks': 29,
               'comment_lines': 984, 'median': 17, 'max': 120, 'none': 55,
               # The span-uniqueness feasibility figures CLAUDE.md binds to the SAME tree, which are
               # the known-answer case for the ladder: "at 37aa47a, 116 of the 144 records are
               # uniquely identified by their bare `gene:'…'` span; the remaining 28 are the same
               # gene modeled at two sites in one file". Added here for the same reason as the rest —
               # so the ladder can disagree with the record instead of being believed.
               'unique_bare': 116, 'needs_lengthening': 28}

# EVERY RECORD A ccf BATCH HAS ALREADY READ, keyed by (path, ANCHORING SPAN) rather than by line,
# because four `file:line` pointers to these very records were stale in the commits that wrote them.
# Excluded from a draw automatically, with a reason each, so a re-read cannot enter a fresh sample
# silently — which is the batch-3 exclusion rule made durable instead of remembered.
#   IT IS SELF-CHECKED, WHICH IS THE PART THAT MAKES IT WORTH TRUSTING: every key must match EXACTLY
# ONE frame member, or a draw REFUSES. So an edit that changes one of these spans stops the next
# batch instead of quietly readmitting a record that has already been read — the same "resolves
# exactly once" discipline record_sync_check.py applies to its declared map.
#   BATCH 2 IS ONLY 6 OF ITS 15 AND THAT IS THE COST OF THE UNREPLAYABLE DRAW, RECORDED HERE RATHER
# THAN GLOSSED: the other nine were read and cleared, and nothing names them. They remain in the
# frame and can be drawn again. The bias that introduces is NOT a straight re-read, because what
# cleared them was the OLD unit — their record lines. Their comments were never examined, and the
# comment is where batch 3 found the drift had moved. An unwitting re-draw therefore re-reads a
# cleared clause with unread provenance attached, which is a weaker confound than a true duplicate,
# and its size is bounded: 9 of the frame.
#   THE `file:line` POINTERS IN THE REASONS BELOW ARE HISTORICAL QUOTATIONS, NOT LIVE POINTERS, AND
# THE DISTINCTION IS LOAD-BEARING FOR pointer_check.py. Each is past tense — "was cited as X" — and
# carries its own verdict, because the whole point of keying this map by SPAN is that those line
# numbers no longer resolve. pointer_check COUNTS them (adding these reasons is why the pointer
# ratchet moved in the commit that introduced this map), and under its declared FLOOR-ONLY boundary
# it does not resolve them, so the battery is green and correctly so. NO GUARD IS ADDED HERE: an
# identity check over this population would flag three of the four as broken when three are
# deliberately, documentedly broken, so it would manufacture false alarms rather than find defects.
# If pointer_check is ever given identity verification, it must treat a pointer inside a past-tense
# "was cited as" clause as historical — and THIS is the line that has to change to say so.
ALREADY_READ = {
    ('js/organs/kidneys.js', "gene:'SETD2 mutation'"):
        'batch 2 — CERTAINTY DRIFT: "found convergent evolution" where Gerlinger says "suggesting '
        'convergent phenotypic evolution". Repaired in ab3ed93',
    ('js/organs/lungs.js', "gene:'MET amplification'"):
        'batch 2 — CERTAINTY DRIFT: "recurrent mechanism" for a word with zero hits in Awad, where '
        'the finding is two of 38 patients. Repaired in ab3ed93',
    ('js/organs/colon.js', "gene:'TCF7L2 alteration'"):
        'batch 2 — CERTAINTY DRIFT: "confirmed" over Cornish P-values the source labels '
        '"Uncorrected two-sided". Repaired in ab3ed93; was cited as colon.js:274, stale at birth',
    ('js/organs/colon.js', "gene:'AMER1 (FAM123B/WTX) mutation'"):
        'batch 2 — CERTAINTY DRIFT plus SCOPE DRIFT: the same Cornish "confirmed", and Li\'s '
        'population dropped. Repaired in ab3ed93; was cited as colon.js:275, stale at birth',
    ('js/organs/colon.js', "gene:'SMAD4 loss'"):
        'batch 2 — CATEGORY SUBSTITUTION: Fang\'s mutation meta-analysis called "loss". Repaired '
        'in ab3ed93',
    ('js/organs/prostate.js', "gene:'PTEN loss'"):
        'batch 2 — ATTRIBUTION ERROR: TCGA 2015 credited with what TCGA attributes to Taylor 2010. '
        'Repaired in ab3ed93. Note the span is unique in prostate.js only — `PTEN loss` appears in '
        'six organ files, which is why the key is a PAIR',
    ('js/organs/bladder.js', "gene:'TERT promoter mutation (C228T / C250T)'"):
        'batch 3 — the user-facing note was CLEAN; its provenance comment carried two defects '
        '(Allory 282/357 for "283 of 357", and "a primary NMIBC cohort" for UBCs "of different '
        'stages"). The record that re-specified the unit; was cited as bladder.js:232, stale at '
        'birth in 2f35ac8',
    ('js/organs/pancreas.js',
     "gene:'SMAD4 loss', class:'driver', ccf:'31% of PDAC by mutation + structural variant "
     "(Waddell et al., Nature, 2015, 100 whole genomes) — classically ~50% once homozygous "
     "deletion, the dominant mechanism (25/84 tumors, Hahn et al., Science, 1996), is counted'"):
        'batch 3 — CLEAN: labels an immunolabeling endpoint "SMAD4 loss" while its ccf separates '
        'mutation+SV from homozygous deletion. Needs the ccf in its key because pancreas.js models '
        'SMAD4 loss at two sites and the bare gene span is ambiguous there',
    ('js/organs/liver.js', "gene:'ARID1A mutation'"):
        'batch 3 — CLEAN: used Guichard\'s own significance word at a boundary p=0.05 rather than '
        'strengthening it. Attaches NO comment block at all, so on the re-specified unit it is '
        'identical to the old one; was cited as liver.js:251, which was still correct at ab3ed93',
}


def corpus(at=None):
    """Every tracked js/organs/*.js, sorted. From git's index, or from `at`'s tree."""
    cmd = ['git', 'ls-tree', '-r', '--name-only', at] if at else ['git', 'ls-files']
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    return sorted(p for p in out.split('\n')
                  if p.startswith('js/organs/') and p.endswith('.js') and p.count('/') == 2)


def lines_of(path, at=None):
    if at:
        return subprocess.run(['git', 'show', f'{at}:{path}'],
                              capture_output=True, text=True, check=True).stdout.split('\n')
    with open(path) as fh:
        return fh.read().split('\n')


def block_above(lines, idx):
    """The contiguous `//` block immediately above line index idx, as a half-open index range, or
    None. IMMEDIATELY is literal: one blank line breaks attachment, which is the mechanical rule the
    re-specification asked for and the reason this function makes no judgement calls."""
    i = idx - 1
    while i >= 0 and lines[i].strip().startswith('//'):
        i -= 1
    return (i + 1, idx) if i + 1 < idx else None


def array_open_above(lines, idx):
    for i in range(idx - 1, -1, -1):
        if ARRAY_OPEN.search(lines[i].rstrip()):
            return i
    return None


def attached(lines, idx):
    """THE UNIT'S COMMENT HALF, as a list of half-open index ranges: the record's own block plus the
    block above its array's opener. Extracted from measure() so frame() cannot drift from it — a
    second copy of the attachment rule is exactly the two-hand-maintained-lists hazard this project
    keeps finding, and --verify proves the extraction changed no figure."""
    out = []
    own = block_above(lines, idx)
    if own:
        out.append(own)
    opener = array_open_above(lines, idx)
    if opener is not None:
        shared = block_above(lines, opener)
        if shared:
            out.append(shared)
    return out


def measure(at=None):
    blocks = {}          # (path, start, end) -> line count; a dict so a SHARED block counts once
    per_record = []
    records = with_ccf = 0
    for path in corpus(at):
        lines = lines_of(path, at)
        for n, line in enumerate(lines):
            if not RECORD.search(line):
                continue
            records += 1
            with_ccf += bool(CCF.search(line))
            keys = [(path,) + r for r in attached(lines, n)]
            for key in keys:
                blocks[key] = key[2] - key[1]
            per_record.append(sum(blocks[key] for key in keys))
    return {
        'files': len(corpus(at)), 'records': records, 'with_ccf': with_ccf,
        'blocks': len(blocks), 'comment_lines': sum(blocks.values()),
        'median': int(statistics.median(per_record)) if per_record else 0,
        'max': max(per_record, default=0),
        'none': sum(1 for v in per_record if v == 0),
    }


GENE_SPAN = re.compile(r"gene:\s*'(?:[^'\\]|\\.)*'")
CCF_SPAN = re.compile(r"ccf:\s*'(?:[^'\\]|\\.)*'")
HUNK = re.compile(r'^@@ -\S+ \+(\d+)(?:,(\d+))? @@')


def ladder(line):
    """Candidate spans for one record line, SHORTEST FIRST, each a literal substring of that line so
    it can be pasted into a `QUOTES <path>` block unaltered. The two lengthenings are the ones
    CLAUDE.md named — into the ccf, then the whole line — and no fourth rung is invented here: if the
    record's own line is not unique, that is a fact about the corpus and gets reported as one."""
    out = []
    g = GENE_SPAN.search(line)
    if g:
        out.append(('gene', g.group(0)))
        c = CCF_SPAN.search(line)
        if c and c.end() > g.start():
            out.append(('gene+ccf', line[g.start():c.end()]))
    out.append(('record-line', line.strip()))
    return out


def anchor(text, line):
    for level, span in ladder(line):
        if text.count(span) == 1:
            return level, span
    return 'UNANCHORABLE', None


def touched(commit, path):
    """1-based line numbers of `path` that `commit` ADDED OR CHANGED, in commit's own tree, read from
    -U0 hunk headers. A pure deletion contributes nothing, so a member whose unit merely LOST a line
    is not marked: the error runs toward under-reporting contamination, which is the direction that
    leaves a stale member in the frame rather than silently shrinking it."""
    out = subprocess.run(['git', 'diff', '-U0', f'{commit}^', commit, '--', path],
                         capture_output=True, text=True, check=True).stdout
    hit = set()
    for ln in out.split('\n'):
        m = HUNK.match(ln)
        if m:
            start, count = int(m.group(1)), int(m.group(2) or 1)
            hit.update(range(start, start + count))
    return hit


def _same_commit(a, b):
    rev = lambda r: subprocess.run(['git', 'rev-parse', r], capture_output=True, text=True,
                                   check=True).stdout.strip()
    return rev(a) == rev(b)


def frame(at=None, touched_by=None):
    """THE FRAME: every gene-bearing record at `at`, named by SPAN, carrying its unit's line set and
    whether `touched_by` changed any of those lines. Sorted by (path, line), which is what makes the
    draw below reproducible off a seed alone."""
    if touched_by is not None:
        if at is None:
            sys.exit('REFUSING: --touched-by needs an explicit frame commit — a hunk\'s line numbers '
                     'mean nothing against the index')
        if not _same_commit(at, touched_by):
            sys.exit(f'REFUSING: the frame is at {at} but --touched-by names {touched_by}. Hunk line '
                     f'numbers are only meaningful in the tree they were computed against, so this '
                     f'pairing would compare two trees\' addresses and call the result an exclusion.')
    rows = []
    for path in corpus(at):
        lines = lines_of(path, at)
        text = '\n'.join(lines)
        dirty = touched(touched_by, path) if touched_by is not None else set()
        for n, line in enumerate(lines):
            if not RECORD.search(line):
                continue
            unit = {n + 1}
            for start, end in attached(lines, n):
                unit.update(range(start + 1, end + 1))
            level, span = anchor(text, line)
            rows.append({'path': path, 'line': n + 1, 'level': level, 'span': span,
                         'has_ccf': bool(CCF.search(line)), 'unit': sorted(unit),
                         'contaminated': sorted(unit & dirty)})
    return sorted(rows, key=lambda r: (r['path'], r['line']))


def unresolved_reads(rows, keys=None):
    """Every read-list key that does not match EXACTLY ONE member of `rows`, with its count. A draw
    refuses on any of these rather than proceeding with a list it cannot resolve. `keys` is a
    parameter only so selftest() can pass its own — the default is the real list."""
    keys = ALREADY_READ if keys is None else keys
    return [(p, s, sum(1 for r in rows if r['path'] == p and r['span'] == s))
            for (p, s) in keys
            if sum(1 for r in rows if r['path'] == p and r['span'] == s) != 1]


def selftest():
    """CONDITION (7) FOR THE READ-LIST GUARD: a check that reports zero must be shown capable of
    reporting non-zero before its zero is believed.
      WHY A FIXTURE AND NOT AN ARCHAEOLOGY RUN, WHICH WAS TRIED FIRST AND IS THE MORE INTERESTING
    RESULT: the guard could not be made to fire anywhere in real history. All nine keys resolve to
    exactly one member at b0f7330, 2f35ac8, dc12997, 37aa47a AND a131649 — every tree tried,
    including one from before the reads happened. The reason is the reason span-naming was adopted:
    the repairs edited `note` prose and provenance comments and never touched the `gene:`/`ccf:`
    fields the keys are built from, so the identity survived edits that moved every line number
    around it. A guard whose failure mode is unreachable from the corpus needs a constructed case,
    and saying so is better than reporting a zero nobody attacked.
      The duplicate case is unreachable through frame() by construction — the ladder never returns a
    span that occurs twice, it lengthens or gives up — so it is tested against the CHECKER directly,
    which is what it guards."""
    rows = [{'path': 'js/organs/fixture.js', 'span': "gene:'DUP'", 'unit': [1]},
            {'path': 'js/organs/fixture.js', 'span': "gene:'DUP'", 'unit': [1]},
            {'path': 'js/organs/fixture.js', 'span': "gene:'ONE'", 'unit': [1]}]
    cases = [('a key matching NOTHING', "gene:'ABSENT'", 0),
             ('a key matching TWICE', "gene:'DUP'", 2),
             ('a key matching ONCE', "gene:'ONE'", None)]
    ok = True
    for label, span, expect in cases:
        got = unresolved_reads(rows, {('js/organs/fixture.js', span): 'fixture'})
        if expect is None:
            good = not got
            saw = 'silent' if good else f'fired with {got[0][2]} matches'
        else:
            good = len(got) == 1 and got[0][2] == expect
            saw = f'fired with {got[0][2]} matches' if got else 'SILENT'
        ok &= good
        print(f'  {"ok  " if good else "FAIL"} {label}: {saw}')
    print('SELFTEST PASS — the read-list guard can fire and can stay silent'
          if ok else 'SELFTEST FAIL')
    return ok


def stratify(rows, stratum):
    """THE STRATUM IS THE CONTROL, AND IT IS A PROPERTY OF THE UNIT RATHER THAN OF THE CONTENT — which
    is what makes it usable as one. A record attaching NO comment block is a record for which the
    re-specified unit and the old unit are THE SAME OBJECT, so reading that stratum measures the
    record-only rate on fresh, uncontaminated records, in the same batch and by the same reader.
    That is the comparison batch 2's unreplayable draw took away, rebuilt as a control group instead
    of a historical claim about a population that has since been repaired."""
    if stratum == 'comments':
        return [r for r in rows if len(r['unit']) > 1]
    if stratum == 'none':
        return [r for r in rows if len(r['unit']) == 1]
    if stratum == 'all':
        return list(rows)
    sys.exit(f'REFUSING: unknown stratum {stratum!r}; expected comments, none or all')


def draw(rows, n, seed):
    """THE DRAW PROCEDURE, WRITTEN DOWN RATHER THAN REMEMBERED — which is the whole reason this
    function exists. Sort by (path, line), then random.Random(key).sample(). Returns the integer key
    as well as the sample so a record of the draw can state what the seed actually became."""
    key = int(seed, 16) if re.fullmatch(r'[0-9a-fA-F]{4,40}', seed) else int(seed)
    pool = sorted(rows, key=lambda r: (r['path'], r['line']))
    if n > len(pool):
        sys.exit(f'REFUSING: asked to draw {n} from {len(pool)} eligible members')
    return key, random.Random(key).sample(pool, n)


def verify():
    at = CALIBRATION['commit']
    got = measure(at)
    rows = frame(at)
    got['unique_bare'] = sum(1 for r in rows if r['level'] == 'gene')
    got['needs_lengthening'] = sum(1 for r in rows if r['level'] != 'gene')
    keys = ('records', 'with_ccf', 'blocks', 'comment_lines', 'median', 'max', 'none',
            'unique_bare', 'needs_lengthening')
    bad = [(k, CALIBRATION[k], got[k]) for k in keys if got[k] != CALIBRATION[k]]
    for key, want, saw in bad:
        print(f'  MISMATCH {key}: CLAUDE.md binds {want} to {at}, this file measures {saw}')
    print(f'DONE ccf_load --verify: {len(keys) - len(bad)}/{len(keys)} figures reproduce the record '
          f'bound to {at}, {len(bad)} mismatched')
    return 1 if bad else 0


def _excluded_clause(rows, touched_by):
    """Built as a variable rather than inline, because `a + b if cond else ''` binds over the whole
    concatenation and would drop the earlier clauses on the else branch — a silent truncation of a
    DONE line, which is the one output this chain treats as the verdict."""
    parts = [f'{sum(1 for r in rows if not r["span"])} UNANCHORABLE',
             f'{sum(1 for r in rows if (r["path"], r["span"]) in ALREADY_READ)} already read']
    if touched_by is not None:
        parts.append(f'{sum(1 for r in rows if r["contaminated"])} with unit lines touched by '
                     f'{touched_by}')
    return ', '.join(parts)


def eligible_for_draw(rows):
    """Anchorable, uncontaminated, and not already read. Refuses if the read-list cannot resolve, and
    refuses FIRST if the guard that decides that cannot be shown to work — a silent read-list on a
    broken checker is the one outcome that would readmit an already-read record invisibly."""
    if not selftest():
        sys.exit('REFUSING to draw with a failing read-list selftest (condition 7)')
    bad = unresolved_reads(rows)
    for path, span, n in bad:
        print(f'  UNRESOLVED ALREADY_READ ({n} matches): {path} :: {span[:70]}')
    if bad:
        sys.exit(f'REFUSING to draw: {len(bad)} ALREADY_READ key(s) do not resolve to exactly one '
                 f'member of this frame. A key that matches nothing would readmit a record that has '
                 f'already been read; one that matches twice names no single record. Repair the key '
                 f'against the frame rather than dropping it.')
    return [r for r in rows if r['span'] and not r['contaminated']
            and (r['path'], r['span']) not in ALREADY_READ]


if __name__ == '__main__':
    args = sys.argv[1:]
    if '--verify' in args:
        sys.exit(verify())

    touched_by = None
    if '--touched-by' in args:
        i = args.index('--touched-by')
        touched_by = args[i + 1]
        del args[i:i + 2]

    stratum = 'all'
    if '--stratum' in args:
        i = args.index('--stratum')
        stratum = args[i + 1]
        del args[i:i + 2]

    if '--draw' in args:
        i = args.index('--draw')
        want, seed = int(args[i + 1]), args[i + 2]
        del args[i:i + 3]
        at = args[0] if args else None
        rows = frame(at, touched_by)
        pool = stratify(eligible_for_draw(rows), stratum)
        key, picked = draw(pool, want, seed)
        for r in picked:
            print(f'  {r["path"]}:{r["line"]} [{r["level"]}] unit={len(r["unit"])} {r["span"]}')
        print(f'DONE ccf_draw: {want} drawn from {len(pool)} eligible in stratum {stratum!r} of the '
              f'{len(rows)} gene-bearing records at {at or "the index"} (excluded: '
              f'{_excluded_clause(rows, touched_by)}); seed {seed} = {key}; procedure = '
              f'random.Random(key).sample(stratum sorted by (path, line), n)')
        sys.exit(0)

    if '--frame' in args:
        args.remove('--frame')
        at = args[0] if args else None
        rows = frame(at, touched_by)
        for r in rows:
            if r['level'] != 'gene' or r['contaminated']:
                flag = 'CONTAMINATED ' if r['contaminated'] else ''
                print(f'  {flag}{r["path"]}:{r["line"]} [{r["level"]}] {r["span"] or "(no span)"}')
        levels = ', '.join(f'{v} anchored by {k}' for k, v in
                           sorted(Counter(r['level'] for r in rows).items()))
        print(f'DONE ccf_frame: at {at or "the index"} — {len(rows)} gene-bearing records; {levels}; '
              f'excluded: {_excluded_clause(rows, touched_by)}')
        sys.exit(0)

    at = args[0] if args else None
    m = measure(at)
    print('  a COMMENT-INCLUSIVE LOAD figure — record plus attached blocks, comment lines counted '
          'ONCE each; not the read unit, which reverted to record-only after batch 4')
    print(f'DONE ccf_load: at {at or "the index"} — {m["records"]} records carry a gene field across '
          f'{m["files"]} organ files and {m["with_ccf"]} of those carry a ccf; they attach '
          f'{m["blocks"]} distinct comment blocks totalling {m["comment_lines"]} comment lines; the '
          f'median record attaches {m["median"]} such lines, the heaviest attaches {m["max"]}, and '
          f'{m["none"]} attach none')
