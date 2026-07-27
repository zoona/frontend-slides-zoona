#!/usr/bin/env python3
"""gen-themes.py — build frontend-slides theme-switcher blocks from the local
design-system library (~/.claude/design-systems/*.md, getdesign.md catalog).

For every Format-A file (YAML-ish frontmatter with a `colors:` block) it maps
tokens -> CSS variables (per EXTERNAL_DESIGN_SYSTEMS.md §3), detects light/dark
from canvas luminance, picks a serif/sans web font, and emits:
  - a `.theme-<slug>{ ... }` CSS block
  - a `<option value="theme-<slug>">Name</option>` entry

It then injects those into a target HTML between the markers:
  /* THEME-BLOCKS:START */ ... /* THEME-BLOCKS:END */
  <!-- THEME-OPTIONS:START --> ... <!-- THEME-OPTIONS:END -->

Usage:  gen-themes.py <target.html> [--default <slug>]
Prose-format files (no `colors:`) are skipped and reported.
"""
import os, re, sys, glob

# 테마 라이브러리 위치: env → 플러그인 번들(../design-systems) → 개인 라이브러리
_here = os.path.dirname(os.path.abspath(__file__))
_bundled = os.path.normpath(os.path.join(_here, "..", "design-systems"))
DS_DIR = os.environ.get("DESIGN_SYSTEMS_DIR") or (
    _bundled if os.path.isdir(_bundled) else os.path.expanduser("~/.claude/design-systems"))

HEX = re.compile(r'^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$')

# token -> CSS var candidate lists (first valid hex wins)
BG      = ['canvas', 'background', 'surface-0', 'bg', 'base', 'canvas-default']
SURFACE = ['surface-soft', 'surface', 'surface-1', 'canvas-soft', 'surface-2',
           'card', 'elevated', 'canvas-cream']
FG      = ['ink', 'text', 'foreground', 'fg', 'body-strong', 'charcoal', 'body']
MUTED   = ['ink-subtle', 'ink-secondary', 'ink-muted', 'text-secondary',
           'text-muted', 'muted', 'steel', 'slate', 'body-muted', 'ink-tertiary']
ACCENT  = ['primary', 'accent', 'brand', 'brand-primary']
ACCENT2 = ['primary-hover', 'primary-focus', 'accent-teal', 'link-blue',
           'accent-2', 'secondary', 'brand-secondary', 'brand-orange',
           'primary-active', 'brand-purple']
LINE    = ['hairline', 'border', 'divider', 'hairline-strong', 'hairline-soft',
           'stroke']

SERIF_HINT = re.compile(
    r'serif|tiempos|copernicus|newsreader|fraunces|georgia|times|editorial|'
    r'reckless|ogg|canela|sectra|freight|lora|playfair|spectral',
    re.I)


def parse_colors(text):
    """Extract the colors: block into {name: hex}."""
    m = re.search(r'^colors:\s*$', text, re.M)
    if not m:
        return {}
    start = m.end()
    # colors block runs until the next top-level key (non-indented `word:`)
    rest = text[start:]
    end = re.search(r'^\S.*:\s*$', rest, re.M)
    block = rest[:end.start()] if end else rest
    out = {}
    for line in block.splitlines():
        km = re.match(r'\s+([a-zA-Z0-9_-]+):\s*"?(#[0-9a-fA-F]{3,6})"?\s*$', line)
        if km:
            out[km.group(1)] = km.group(2)
    return out


def first_hex(colors, keys):
    for k in keys:
        v = colors.get(k)
        if v and HEX.match(v):
            return v
    return None


def display_font_is_serif(text):
    m = re.search(r'^typography:\s*$', text, re.M)
    if not m:
        return False
    seg = text[m.end():m.end() + 1200]  # first chunk covers display tokens
    fm = re.search(r'fontFamily:\s*"?([^"\n]+)"?', seg)
    if not fm:
        return False
    # Strip "sans-serif"/"sans" first so the "serif" inside "sans-serif"
    # doesn't false-positive (SF Pro Display, …, sans-serif -> sans).
    fam = re.sub(r'sans-?serif|\bsans\b', ' ', fm.group(1), flags=re.I)
    return bool(SERIF_HINT.search(fam))


def hx(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def luminance(h):
    r, g, b = [c / 255 for c in hx(h)]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def rgba(h, a):
    r, g, b = hx(h)
    return f"rgba({r},{g},{b},{a})"


def blend(h1, h2, t):
    """Mix h1 toward h2 by t (0..1)."""
    a, b = hx(h1), hx(h2)
    return '#%02x%02x%02x' % tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def display_name(slug):
    return ' '.join(w.upper() if len(w) <= 2 else w.capitalize()
                    for w in slug.replace('_', '-').split('-'))


def build(path):
    text = open(path, encoding='utf-8', errors='ignore').read()
    colors = parse_colors(text)
    if not colors:
        return None  # Format B / prose — skip
    bg = first_hex(colors, BG)
    accent = first_hex(colors, ACCENT)
    fg = first_hex(colors, FG)
    if not (bg and accent and fg):
        return None  # missing essentials — skip
    surface = first_hex(colors, SURFACE) or bg
    muted = first_hex(colors, MUTED) or fg
    # Guard low-contrast muted (e.g. a dark-mode gray reused on a light canvas):
    # if it's too close to the background, derive a legible one from fg↔bg.
    if abs(luminance(muted) - luminance(bg)) < 0.22:
        muted = blend(fg, bg, 0.45)
    accent2 = first_hex(colors, ACCENT2) or accent
    line = first_hex(colors, LINE) or rgba(fg, .16)

    light = luminance(bg) > 0.5
    serif = display_font_is_serif(text)
    kr = "'Noto Serif KR',serif" if serif else "'Noto Sans KR',sans-serif"
    face = "'Fraunces'" if serif else "'Inter Tight'"
    krmono = "'Noto Serif KR'" if serif else "'Noto Sans KR'"

    if light:
        glow1, glow2 = rgba(accent, .12), rgba(accent2, .09)
        ghost, grain = rgba(fg, .07), 'multiply'
    else:
        glow1, glow2 = rgba(accent, .20), rgba(accent2, .13)
        ghost, grain = rgba(accent, .16), 'screen'

    slug = os.path.basename(path)[:-3]
    css = (
        f".theme-{slug}{{\n"
        f"  --bg:{bg}; --bg-2:{surface}; --fg:{fg}; --muted:{muted};\n"
        f"  --accent:{accent}; --accent-2:{accent2};\n"
        f"  --line:{line};\n"
        f"  --glow-1:{glow1}; --glow-2:{glow2};\n"
        f"  --stroke-ghost:{ghost};\n"
        f"  --font-display:{face},{kr};\n"
        f"  --font-mono:'Space Mono',{krmono},monospace;\n"
        f"  --grain-blend:{grain};\n"
        f"}}"
    )
    opt = f'<option value="theme-{slug}">{display_name(slug)}</option>'
    return slug, css, opt


def inject(html, start, end, payload):
    pat = re.compile(re.escape(start) + r'.*?' + re.escape(end), re.S)
    return pat.sub(start + '\n' + payload + '\n' + end, html, count=1)


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: gen-themes.py <target.html> [--default <slug>]")
    target = sys.argv[1]
    default = None
    if '--default' in sys.argv:
        default = sys.argv[sys.argv.index('--default') + 1]

    files = sorted(f for f in glob.glob(os.path.join(DS_DIR, '*.md'))
                   if os.path.basename(f).lower() != 'readme.md')
    built, skipped = [], []
    for f in files:
        r = build(f)
        (built if r else skipped).append(r[0] if r else os.path.basename(f))

    if not built:
        sys.exit("no parseable themes found in " + DS_DIR)

    # order: default first (if given & present), else alphabetical
    results = [build(os.path.join(DS_DIR, s + '.md')) for s in built]
    if default and default in built:
        results.sort(key=lambda r: (r[0] != default, r[0]))

    css = '\n'.join(r[1] for r in results)
    opts = '\n      '.join(
        (r[2].replace('<option', '<option selected', 1)
         if (default and r[0] == default) or (not default and i == 0)
         else r[2])
        for i, r in enumerate(results))

    html = open(target, encoding='utf-8').read()
    html = inject(html, '/* THEME-BLOCKS:START */', '/* THEME-BLOCKS:END */', css)
    # note: START marker in file also has a trailing comment; match loosely
    html = re.sub(r'/\* THEME-BLOCKS:START.*?\*/.*?/\* THEME-BLOCKS:END \*/',
                  '/* THEME-BLOCKS:START (auto-generated) */\n' + css +
                  '\n/* THEME-BLOCKS:END */', html, count=1, flags=re.S)
    html = inject(html, '<!-- THEME-OPTIONS:START -->',
                  '<!-- THEME-OPTIONS:END -->', '      ' + opts)

    # sync default class on .deck-root + #cur-theme label
    dslug = default if (default and default in built) else results[0][0]
    dname = display_name(dslug)
    html = re.sub(r'(class="deck-root )theme-[a-z0-9-]+(")',
                  r'\1theme-' + dslug + r'\2', html, count=1)
    html = re.sub(r'(<b id="cur-theme">)[^<]*(</b>)',
                  r'\g<1>' + dname + r'\g<2>', html, count=1)

    open(target, 'w', encoding='utf-8').write(html)
    print(f"themes: {len(results)} injected, {len(skipped)} skipped")
    print("default:", dslug)
    print("skipped (prose/no-colors):", ', '.join(skipped) if skipped else '-')


if __name__ == '__main__':
    main()
