#!/usr/bin/env python3
# aria_entity_check.py (2026-09-14) — a field rendered through .textContent/.setAttribute and a
# field rendered through .innerHTML have OPPOSITE escaping requirements, and this codebase has
# both kinds of field living in the same organ data files under similar-looking names. innerHTML
# decodes an HTML entity ("&amp;" -> "&"); textContent/setAttribute do not, so a literal "&amp;"
# renders on screen as the four characters "&amp;". THE INCIDENT THIS CLOSES: a concurrent
# session found and fixed five live instances of exactly this (js/organs/skin.js's melanoma share
# text, bladder.js's organDetail.sub, colon.js's three cancerEntries.share strings, kidneys.js's
# ccrcc share) by hand, across four files, after they had shipped and rendered wrong. Structural
# defects recur; this makes the class mechanically checkable so the next field doesn't have to be
# found by a human reading rendered output.
#
# THE FIELD SET WAS TRACED, NOT GUESSED — every field name below was confirmed by reading its own
# render call site in js/main.js, js/histology.js, js/panel.js before being classified, exactly
# the same discipline this project's other checkers hold citations to. DANGEROUS (feeds
# .textContent or .setAttribute, confirmed 2026-09-14):
#   cancerEntries[].share      -> js/main.js:218 (the aria `label:` built for search/sidebar rows)
#   organDetail.sub            -> js/main.js:248 .textContent
#   organDetail.desc           -> js/main.js:252 .textContent
#   organDetail.title          -> js/main.js:247,253 .textContent (also composed into other labels)
#   cancerDetails[].screenLabel -> js/main.js:784 .textContent
#   cancerDetails[].legendTitle -> js/main.js:784 .textContent (i.e. #txLegendTitle, same call)
#   organDetail.viewerAria     -> js/main.js:518 .setAttribute('aria-label', ...)
#   histology.ariaSummary      -> js/histology.js:2442 .setAttribute('aria-label', ...)
#   histology.intro            -> js/histology.js:2427 .textContent
#   histology.citation         -> js/histology.js:2428,2464 .textContent
#   hotspots[].text            -> js/main.js:674 .textContent (unambiguous: no safe `text:` field
#                                 exists anywhere in this corpus, unlike `label`, so no exclusion
#                                 is needed for this one)
#   hotspots[].label / histology.features[].label -> js/main.js:672, js/histology.js:2462
#                                 .textContent — but `label` ALSO appears in organDetail.facts[],
#                                 which renders via .innerHTML (js/main.js:249) and is where the
#                                 entity form is the CORRECT one — see the exclusion below.
# SAFE (feeds .innerHTML, confirmed 2026-09-14, entities are correct there and must not be flagged):
#   organDetail.facts[].label, organDetail.facts[].val -> js/main.js:249 .innerHTML
#
# THE ONE AMBIGUOUS FIELD NAME, RESOLVED BY BLOCK, NOT BY GUESSING: `label:'...'` is dangerous
# everywhere in this corpus EXCEPT inside a `facts:[...]` array literal. facts_spans() finds every
# such array's byte range in the source text (bracket-depth counted, not regex-guessed, because a
# naive `facts:\[.*?\]` would stop at the first nested `]` inside a quoted string) and a `label`
# match is excluded when its offset falls inside one of those spans. `text:'...'` needs no such
# exclusion because no safe (innerHTML-rendered) field in this corpus is ever named `text`.
import glob, json, re, sys

ENTITY = re.compile(r'&(?:[a-zA-Z][a-zA-Z0-9]*|#[0-9]+|#x[0-9a-fA-F]+);')
# Field pattern mirrors fraction_check.py's own FIELDS regex shape (quoted-string field literal,
# escape-aware) rather than reinventing a different string-literal grammar for the same corpus.
DANGEROUS_UNAMBIGUOUS = re.compile(
    r"(?:share|sub|desc|title|screenLabel|legendTitle|viewerAria|ariaSummary|intro|citation|text)"
    r":'((?:[^'\\]|\\.)*)'"
)
LABEL_FIELD = re.compile(r"label:'((?:[^'\\]|\\.)*)'")


def facts_spans(src):
    """Byte-offset (start, end) pairs covering every `facts:[...]` array literal in src, found by
    counting bracket depth from the `[` immediately after `facts:` rather than by a regex that
    would stop at the first `]` — real facts arrays in this corpus contain nested `[...]` inside
    hotspot/site coordinate literals elsewhere in the same file, though not inside facts itself
    today; counted properly anyway so a future facts entry gaining a bracketed value doesn't
    silently break the exclusion."""
    spans = []
    for m in re.finditer(r'facts:\s*\[', src):
        start = m.end() - 1  # position of the opening '['
        depth = 0
        i = start
        in_str = False
        str_ch = ''
        while i < len(src):
            c = src[i]
            if in_str:
                if c == '\\':
                    i += 2
                    continue
                if c == str_ch:
                    in_str = False
            elif c in ("'", '"'):
                in_str = True
                str_ch = c
            elif c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    spans.append((start, i + 1))
                    break
            i += 1
    return spans


def in_any_span(pos, spans):
    return any(s <= pos < e for s, e in spans)


def scan_string(fields_re, src, spans=None):
    """Yields (line, field_head, matched_entity, full_value) for every entity found in a matched
    field value, skipping matches inside `spans` if given."""
    for m in fields_re.finditer(src):
        if spans is not None and in_any_span(m.start(), spans):
            continue
        val = m.group(1)
        ent = ENTITY.search(val)
        if ent:
            line = src[:m.start()].count('\n') + 1
            head = src[m.start():m.start() + 40].split(':', 1)[0]
            yield line, head, ent.group(0), val


FIXTURES_DANGEROUS = [
    ("share:'BCC and SCC together are &gt;90% of skin cancers'", True, 'entity in a share field'),
    ("share:'BCC and SCC together are >90% of skin cancers'", False, 'real character, no entity'),
    ("sub:'Pelvic reservoir &middot; stores &amp; expels urine'", True, 'entity in a sub field'),
    ("desc:'Something &ndash; something else'", True, 'entity in a desc field'),
    ("viewerAria:'A model with two lobes &amp; a hilum'", True, 'entity in viewerAria'),
    ("text:'Crosses into the dermis &mdash; a vascular layer'", True, 'entity in hotspot/feature text'),
    ("note:'this is a ccf note field, not scanned at all'", False, 'field not in the dangerous set'),
]
FIXTURES_LABEL = [
    ("facts:[{label:'Layers', val:'Three &ndash; epidermis, dermis &amp; hypodermis'}]", False,
     'facts[].label/.val is innerHTML-rendered — entities are correct and must not be flagged'),
    ("hotspots:[{key:'x', label:'Basal &amp; layer', text:'...'}]", True,
     'hotspot label outside any facts:[] span is textContent-rendered — must not carry entities'),
]


def selftest():
    ok = True
    for t, want, label in FIXTURES_DANGEROUS:
        got = list(scan_string(DANGEROUS_UNAMBIGUOUS, t))
        good = bool(got) == want
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} {label}: {got or 'clean'}")
    for t, want, label in FIXTURES_LABEL:
        spans = facts_spans(t)
        got = list(scan_string(LABEL_FIELD, t, spans))
        good = bool(got) == want
        ok &= good
        print(f"  {'ok  ' if good else 'FAIL'} {label}: {got or 'clean'}")
    # A facts block containing a bracketed value must not break span-finding (the reason
    # facts_spans counts depth instead of matching to the first ']').
    nested = "facts:[{label:'Scale', val:'x [1,2] y'}, {label:'Other &amp; thing', val:'z'}]"
    spans = facts_spans(nested)
    got = list(scan_string(LABEL_FIELD, nested, spans))
    good = not got
    ok &= good
    print(f"  {'ok  ' if good else 'FAIL'} a bracketed value inside facts:[] does not truncate the span: {got or 'clean'}")
    print('SELFTEST', 'PASS — fires on entities in textContent/aria-label fields, silent on '
          'facts[].label/.val, and the facts:[] span survives a nested bracket'
          if ok else 'FAIL — do not trust this scan')
    return ok


if __name__ == '__main__':
    if not selftest():
        sys.exit(1)
    if '--selftest' in sys.argv:
        sys.exit(0)
    print()
    checked = 0
    flags = {}
    for f in sorted(glob.glob('js/organs/*.js')):
        src = open(f, encoding='utf-8').read()
        short = f.split('/')[-1][:-3]
        checked += 1
        spans = facts_spans(src)
        for line, head, ent, val in scan_string(DANGEROUS_UNAMBIGUOUS, src):
            key = f'{short}:{line}|{head}|{ent}'
            flags[key] = f'{short}:{line} [{head}] contains literal entity {ent!r} in a ' \
                         f'textContent/aria-label-rendered field — value starts {val[:60]!r}'
            print(f'  ENTITY? {short}:{line}  [{head}] {ent} in {val[:70]!r}')
        for line, head, ent, val in scan_string(LABEL_FIELD, src, spans):
            key = f'{short}:{line}|label|{ent}'
            flags[key] = f'{short}:{line} [label] contains literal entity {ent!r} outside any ' \
                         f'facts:[] span (textContent-rendered) — value starts {val[:60]!r}'
            print(f'  ENTITY? {short}:{line}  [label, outside facts] {ent} in {val[:70]!r}')
    if checked == 0:
        print('  PROBLEM: examined ZERO files — a report of no entities over nothing scanned is '
              'not a pass, it is a broken scan.')
        print(f'DONE aria_entity_check: {checked} files scanned, {len(flags)} flags, scan broken')
        sys.exit(3)
    print('SIDECAR ' + json.dumps({
        'name': 'aria_entity_check',
        'metrics': {'files_scanned': checked, 'flags': len(flags)},
        # empty on purpose, same reasoning as fraction_check's own: every flag here is a DEFECT,
        # and the correct remedy (replace the entity with the real character) makes the count go
        # DOWN — ratcheting it would punish the fix.
        'ratchet': [],
    }, sort_keys=True))
    print(f'DONE aria_entity_check: {checked} files scanned, {len(flags)} flags '
          f'(textContent/aria-label fields carrying a literal HTML entity)')
