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
# THE UNIT, from CLAUDE.md's ccf re-specification: THE RECORD PLUS ITS PROVENANCE COMMENT, attached
# mechanically rather than judged — the contiguous `//` block immediately above the record's own
# line, PLUS the contiguous `//` block immediately above the declaration of the array the record sits
# in. Both kinds, because the bladder defect was in the second kind.
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
import re, statistics, subprocess, sys

RECORD = re.compile(r"\bgene:\s*'")
CCF = re.compile(r"\bccf:\s*'")
# An array opening at end of line: `const TRUNK_UC = [`, `PRIVATE_POOL_LUAD = [`, `sites: [`.
# Every narrower variant tried (const-only, const|let|var, any bracket) measured IDENTICALLY on the
# corpus at 37aa47a, so the breadth here is not load-bearing and is not tuned to the answer.
ARRAY_OPEN = re.compile(r"(?:const\s+\w+\s*=|\b[\w']+\s*:)\s*\[\s*$")

# CLAUDE.md's figures for 37aa47a, transcribed. The prose is the source of truth; this is a copy
# kept HERE so --verify can fail, and it is the one place a copy is warranted.
CALIBRATION = {'commit': '37aa47a', 'records': 144, 'with_ccf': 117, 'blocks': 29,
               'comment_lines': 984, 'median': 17, 'max': 120, 'none': 55}


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
            attached = []
            own = block_above(lines, n)
            if own:
                attached.append((path,) + own)
            opener = array_open_above(lines, n)
            if opener is not None:
                shared = block_above(lines, opener)
                if shared:
                    attached.append((path,) + shared)
            for key in attached:
                blocks[key] = key[2] - key[1]
            per_record.append(sum(blocks[key] for key in attached))
    return {
        'files': len(corpus(at)), 'records': records, 'with_ccf': with_ccf,
        'blocks': len(blocks), 'comment_lines': sum(blocks.values()),
        'median': int(statistics.median(per_record)) if per_record else 0,
        'max': max(per_record, default=0),
        'none': sum(1 for v in per_record if v == 0),
    }


def verify():
    at = CALIBRATION['commit']
    got = measure(at)
    bad = [(k, CALIBRATION[k], got[k]) for k in
           ('records', 'with_ccf', 'blocks', 'comment_lines', 'median', 'max', 'none')
           if got[k] != CALIBRATION[k]]
    for key, want, saw in bad:
        print(f'  MISMATCH {key}: CLAUDE.md binds {want} to {at}, this file measures {saw}')
    print(f'DONE ccf_load --verify: {7 - len(bad)}/7 figures reproduce the record bound to {at}, '
          f'{len(bad)} mismatched')
    return 1 if bad else 0


if __name__ == '__main__':
    args = sys.argv[1:]
    if '--verify' in args:
        sys.exit(verify())
    at = args[0] if args else None
    m = measure(at)
    print(f'  the unit is the record plus its provenance comment; comment lines counted ONCE each')
    print(f'DONE ccf_load: at {at or "the index"} — {m["records"]} records carry a gene field across '
          f'{m["files"]} organ files and {m["with_ccf"]} of those carry a ccf; they attach '
          f'{m["blocks"]} distinct comment blocks totalling {m["comment_lines"]} comment lines; the '
          f'median record attaches {m["median"]} such lines, the heaviest attaches {m["max"]}, and '
          f'{m["none"]} attach none')
