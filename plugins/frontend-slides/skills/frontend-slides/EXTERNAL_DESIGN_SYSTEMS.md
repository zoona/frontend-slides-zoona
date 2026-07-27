# EXTERNAL_DESIGN_SYSTEMS.md

How frontend-slides detects, parses, and applies user-curated **DESIGN.md** files as slide
design systems. Read this whenever the design-system library at `~/.claude/design-systems/`
has 1+ files (SKILL.md Phase 2, Step 2.0a).

The library is populated from **getdesign.md** (mirror of the open-source
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) catalog).
Each file is one brand's design system. Add more with
`scripts/add-design-system.sh <brand>` (see bottom).

---

## 0. Two source formats — detect first

getdesign.md ships DESIGN.md files in **two** shapes. Detect before parsing:

```bash
# Structured if the file starts with a YAML frontmatter block containing `colors:`
head -1 <file>.md          # "---"  → candidate
awk '/^---$/{c++} c==1&&/^colors:/{print "STRUCTURED"; exit}' <file>.md
```

| Format | How to recognize | How to read |
| ------ | ---------------- | ----------- |
| **A. Structured (token frontmatter)** | Starts with `---`, frontmatter has `colors:`, `typography:`, `rounded:`, `spacing:`, `components:` | Parse the YAML tokens directly (§1) |
| **B. Prose (9 numbered sections)** | No token frontmatter; body is `## 1. Visual Theme…` → `## 9. Agent Prompt Guide` | Extract tokens from the numbered sections (§2) |

In the current curated set: **A** = stripe, linear, vercel, notion, figma, apple, claude,
nvidia, framer, airbnb. **B** = spotify, tesla. The on-demand script can pull either — always
detect per file.

Both formats also carry rich prose (Visual Theme, Do's/Don'ts, Signature Components). **Always
read the body**, not just tokens — that is where the deck's *character* lives (see §5).

---

## 1. Format A — structured frontmatter

The frontmatter is the machine-readable recipe:

```yaml
colors:      { <semantic-name>: "#hex", ... }        # e.g. primary, ink, canvas, hairline
typography:  { <token>: { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeature } }
rounded:     { xs, sm, md, lg, xl, pill }            # px values, pill = 9999px
spacing:     { xxs, xs, sm, md, lg, xl, xxl, huge }  # px scale
components:  { <name>: { backgroundColor, textColor, typography, rounded, padding } }
             # values use references: "{colors.primary}", "{typography.button-md}", "{rounded.pill}"
```

Typography tokens you'll see (largest→smallest): `display-xxl, display-xl, display-lg,
display-md, heading-lg, heading-md/title, body-lg, body-md, body-tabular, button-md, caption,
micro-cap`. Not every file has every token — take what exists.

Resolve `{colors.x}` / `{typography.x}` / `{rounded.x}` references in `components` back to their
frontmatter definitions before use.

---

## 2. Format B — prose (9 numbered sections)

No frontmatter. Extract a token set from the fixed section layout:

| Need | Section to mine |
| ---- | --------------- |
| Colors (hex + role) | `## 2. Color Palette & Roles` → `### Primary/Text/Surface/Semantic`, and `## 9. Agent Prompt Guide → ### Quick Color Reference` (compact hex list) |
| Fonts + weights | `## 3. Typography Rules` → `### Font Families`, `### Hierarchy` |
| Spacing / radius | `## 5. Layout Principles` → `### Spacing System`, `### Border Radius Scale` |
| Shadows / depth | `## 6. Depth & Elevation` |
| Signature look | `## 1. Visual Theme & Atmosphere`, `## 4. Component Stylings → ### Signature Components` |

Quick color pull:

```bash
grep -oiE '#[0-9a-f]{3,8}\b' <file>.md | sort | uniq -c | sort -rn   # candidate palette
```

Then assign roles by reading the prose (which hex is background vs text vs accent). Prose files
name colors in context — e.g. Spotify: `#121212`/`#181818` surfaces, `#1ed760` accent; Tesla:
`#3E6AE1` primary on white.

Synthesize the same logical token set as Format A so the rest of this doc applies uniformly.

---

## 3. Token → CSS variable mapping

Map by **role keyword**, not exact name (names vary per brand). Emit these `:root` variables:

| CSS variable | Source color role (match any) |
| ------------ | ----------------------------- |
| `--bg` | `canvas`, `background`, `surface-0`, darkest/lightest base |
| `--surface` | `canvas-soft`, `surface`, `surface-1`, elevated panel |
| `--surface-2` | `canvas-cream`, next elevation, band/section bg |
| `--fg` / `--text` | `ink`, `text`, `foreground`, primary text |
| `--text-muted` | `ink-mute`, `ink-secondary`, `text-secondary` |
| `--accent` | `primary` |
| `--accent-deep` | `primary-deep`, `primary-press` |
| `--accent-soft` | `primary-soft`, `primary-bg-subdued` |
| `--on-accent` | `on-primary` |
| `--border` | `hairline`, `border`, `divider` |
| `--pos` / `--neg` | semantic green/red (`ruby`, `magenta`, success/error) |

Also emit radius + spacing scales verbatim:

```css
:root{
  --r-xs:4px; --r-sm:6px; --r-md:8px; --r-lg:12px; --r-xl:16px; --r-pill:9999px;
  --s-xs:4px; --s-sm:8px; --s-md:12px; --s-lg:16px; --s-xl:24px; --s-2xl:32px; --s-huge:64px;
}
```

**Determine light vs dark** from `--bg` luminance and honor it for the whole deck (Spotify/Tesla
force their polarity; Stripe is light with a dark dashboard track). Do not invert a brand's theme.

---

## 4. Typography — scale for the 1920×1080 stage

DESIGN.md sizes are **web** sizes (display-xl ≈ 48px). The slide stage is 1920×1080, so scale up.

**Rule:** `slide_px = round(web_px × factor)`, larger factor for hero display, gentler for body.

| Token | typical web px | ×factor | slide px | slide role |
| ----- | -------------- | ------- | -------- | ---------- |
| display-xxl | 56 | 2.4 | ~132 | hero / cover title |
| display-xl | 48 | 2.4 | ~115 | section title |
| display-lg | 32 | 2.6 | ~84 | slide title |
| display-md | 26 | 2.5 | ~66 | subtitle |
| heading-lg | 22 | 2.4 | ~52 | card heading |
| body-lg | 16 | 2.3 | ~37 | lead body |
| body-md | 14 | 2.2 | ~31 | body / bullets |
| caption | 12 | 2.0 | ~24 | caption / label |
| micro-cap | 10 | 2.0 | ~20 | eyebrow / tag |

Guardrails: cap the biggest hero title around **120–160px**; never let body drop below **~26px**
on the stage (see SKILL.md density limits). Scale `letterSpacing` by the **same factor** as its
size (negative tracking on thin display type is a signature of many of these systems — keep it).
Preserve `fontWeight`, `lineHeight`, and `fontFeature` (`ss01` etc.) as-is.

### 4a. Font substitution (proprietary → web)

Many systems use proprietary fonts (Sohne, SpotifyMixUI, Universal Sans, Circular…). The
`fontFamily` stack already lists fallbacks, and **Format A files include a `### Note on Font
Substitutes` body section — read it; it names the intended free substitute.** Prefer the
distinctive Fontshare/Google match over a generic system font:

| Proprietary look | Free substitute (Fontshare / Google) |
| ---------------- | ------------------------------------- |
| Sohne / neo-grotesque | `Satoshi`, `General Sans`, `Söhne`-like → `Inter Tight` |
| Circular / geometric | `Poppins`, `Onest`, `Geist` |
| Gotham / Universal Sans | `Archivo`, `Roobert`-like → `General Sans` |
| Editorial serif | `Instrument Serif`, `Fraunces`, `Newsreader` |
| Mono / technical | `JetBrains Mono`, `Geist Mono` |

Fidelity to the brand wins here over SKILL.md's "avoid Inter" rule **when the user explicitly
picked a brand design system** — but reach for the distinctive equivalent first. Load the chosen
web font via a Google Fonts / Fontshare `<link>` (no system fonts).

### 4b. Korean fallback (always inject)

Append a Korean fallback to every `font-family` stack so mixed KR/EN decks render cleanly:

- Serif-led system → `'Noto Serif KR', serif`
- Sans-led system → `'Noto Sans KR', sans-serif`

Add the matching Google Fonts import. Example resulting stack:
`font-family: 'Satoshi', 'Noto Sans KR', system-ui, sans-serif;`

---

## 5. Signature details — read the body

Tokens make a deck *correct*; the prose makes it *unmistakably that brand*. Before generating,
mine the body for one or two signature devices and build them into the deck chrome:

- `## Visual Theme & Atmosphere` / Overview → the core mood (e.g. Stripe's gradient mesh in the
  upper third; Tesla's edge-to-edge photography and near-empty chrome; Spotify's content-first
  near-black).
- `### Signature Components` → brand-specific motifs (e.g. NVIDIA's 12×12 green corner squares,
  Claude's spike-mark glyph, pill-and-circle geometry).
- `## Do's and Don'ts` → hard guardrails. Honor the Don'ts (they prevent off-brand output).
- `## Elevation & Depth` → shadow recipes for cards/panels.

Turn the strongest 1–2 devices into reusable slide elements (a section divider, a corner accent,
a background field). Do not literally copy the brand's marketing content — borrow the *system*.

---

## Step 2.0b-EXT — Choosing the default theme from the library

Decks are **always multi-theme** (§Step 2.0c-MIX). This step only picks which system is the
**default (first-screen) theme**; the rest of the chosen set still gets baked in with the switcher.

1. **List** available systems: `ls ~/.claude/design-systems/*.md | grep -vi readme`. Show the
   user their `name`/description (Format A: frontmatter `description`; Format B: first paragraph
   of `## 1. Visual Theme`). Ask which one is the default (structured-question UI, header "System").
2. **Parse** the chosen file per §1/§2 → logical token set.
3. **Map** tokens → CSS variables (§3), **scale** typography (§4), inject Korean fallback (§4b),
   pick font substitutes (§4a).
4. **Generate 3 previews** as usual (SKILL.md Step 2.0) to lock the default theme's layout language
   — e.g. (a) cover-hero, (b) content/grid, (c) a signature-device layout (§5). Obey Preview
   Authenticity Rules (no metadata on slides).
5. On pick → this system becomes the deck's **default `.theme-<slug>`**. Then proceed to
   §Step 2.0c-MIX to bake the rest of the theme set + switcher. Preserve palette, type scale,
   radius/spacing, and the signature device across every slide layout (title, section, content,
   quote, comparison, closing).

## Step 2.0c-MIX — "둘 다 비교" multi-theme deck with switcher

**The default path for every deck.** 2+ design systems (and/or a custom design) baked into one deck
with a live theme toggle. (This skill has no single-theme output.)

1. Build the deck once with **CSS-variable-driven** theming — every color/type/radius value reads
   from `:root`/theme-class variables (never hardcode a hex in slide markup).
2. Define each theme as a class on a `.deck-root` wrapper: `.theme-<slug>` per system, each
   overriding the shared variable set. External systems are mapped per §3; a custom design becomes
   its own `.theme-<slug>` block with hand-authored variable values.
3. Inject the **bottom-right `<select>` theme switcher** — full drop-in markup, CSS, and JS are in
   **[THEME_SWITCHER.md](THEME_SWITCHER.md)**. It lists one `<option>` per baked-in theme, applies
   the pick live, and persists it. Read that file and follow it; do not re-invent the switcher here.
4. Only **typography values that differ per theme** (font family, tracking) also need to live in
   variables so the toggle reskins type too, not just color. Fixed-stage geometry stays constant.
5. Verify **each** theme option in a screenshot — a mapped external palette can fail contrast on a
   layout tuned for a preset. Fix per-theme overrides, don't abandon the toggle.

---

## Adding more systems

```bash
scripts/add-design-system.sh --list          # show all 74 available brands from getdesign.md
scripts/add-design-system.sh linear.app       # fetch one into ~/.claude/design-systems/
scripts/add-design-system.sh stripe vercel notion   # several at once
```

The script normalizes names (`linear.app` → `linear.md`), works without node/npx (pure curl),
and skips files that already exist unless `--force`. Provenance and the full brand list live in
`~/.claude/design-systems/README.md`.
