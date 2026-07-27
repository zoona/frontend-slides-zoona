# THEME_SWITCHER.md

Drop-in **theme `<select>` box, bottom-right**, that live-swaps the whole deck's design system
when the viewer picks an option. **This skill bakes ≥2 themes into every deck, so the switcher is
always included** — there is no single-theme output. Read this from SKILL.md Phase 3.

The switcher lives **outside the 1920×1080 stage** (it is chrome, never slide content) and is
positioned `fixed` bottom-right, so it never counts against slide density and never reflows the
stage.

---

## How it works

1. Each theme is a class that **overrides CSS custom properties** — `.theme-stripe`, `.theme-linear`,
   … — applied to a `.deck-root` wrapper. Custom properties inherit, so every descendant that reads
   `var(--accent)` etc. reskins instantly when the class changes.
2. The `<select>` options' `value` = the theme class name. On `change`, JS removes all theme classes
   from `.deck-root` and adds the chosen one. Choice is persisted in `localStorage` and restored on
   load.

**Hard requirement for it to actually work:** every color / font / radius in slide markup must read
from a CSS variable — **no hardcoded hex or font-family in slides**. If a slide hardcodes `#533afd`,
that pixel won't reskin. Map each system's tokens to the same variable names (see
EXTERNAL_DESIGN_SYSTEMS.md §3) and only the values differ per theme.

---

## 1. Root structure

Wrap the whole deck in `.deck-root`; the switcher is a sibling of `.deck-viewport`, both inside it:

```html
<div class="deck-root theme-stripe">        <!-- theme class lives here; JS swaps it -->
  <!-- === THEME SWITCHER (off-stage, bottom-right) === -->
  <div class="theme-switch deck-ui" role="group" aria-label="테마 선택">
    <select id="theme-select" aria-label="테마">
      <option value="theme-stripe" selected>Stripe</option>
      <option value="theme-linear">Linear</option>
      <option value="theme-notion">Notion</option>
    </select>
  </div>

  <div class="deck-viewport">
    <div class="deck-stage">
      <!-- slides … all colors via var(--...) -->
    </div>
  </div>
</div>
```

Populate one `<option>` per theme baked into the deck, label = the brand's display name. The first
option (or the persisted one) is the default; keep its class on `.deck-root` in the initial HTML so
there's no flash before JS runs.

## 2. Theme token blocks

Define default variables on `:root` (fallbacks), then override per theme on the theme class. Emit
the same variable set for every theme (only values change):

```css
:root{                     /* fallback / shared geometry */
  --bg:#fff; --surface:#f6f9fc; --fg:#0d253d; --text-muted:#64748d;
  --accent:#533afd; --on-accent:#fff; --border:#e3e8ee;
  --font-display:'Satoshi','Noto Sans KR',system-ui,sans-serif;
  --font-body:'Satoshi','Noto Sans KR',system-ui,sans-serif;
}
.theme-stripe{ --bg:#fff; --surface:#f6f9fc; --fg:#0d253d; --accent:#533afd; --on-accent:#fff; --border:#e3e8ee;
  --font-display:'Satoshi','Noto Sans KR',sans-serif; }
.theme-linear{ --bg:#0d0e12; --surface:#16171d; --fg:#f7f8f8; --text-muted:#8a8f98; --accent:#5e6ad2; --on-accent:#fff; --border:#23252c;
  --font-display:'Inter Tight','Noto Sans KR',sans-serif; }
.theme-notion{ --bg:#ffffff; --surface:#f7f6f3; --fg:#37352f; --text-muted:#787774; --accent:#2383e2; --on-accent:#fff; --border:#e9e9e7;
  --font-display:'Newsreader','Noto Serif KR',serif; }
/* slides then use: background:var(--bg); color:var(--fg); … accent:var(--accent) */
```

## 3. Switcher CSS (theme-adaptive, bottom-right)

The select reads theme vars too, so it stays legible on light *and* dark themes. `appearance:none`
+ a `::after` caret gives a consistent look:

```css
/* === THEME SWITCHER (off-stage chrome) === */
.theme-switch{ position:fixed; right:20px; bottom:20px; z-index:9999; }
.theme-switch::after{
  content:"▾"; position:absolute; right:16px; top:50%; transform:translateY(-50%);
  pointer-events:none; font-size:12px; color:var(--fg,#111);
}
.theme-switch select{
  appearance:none; -webkit-appearance:none;
  font:600 14px/1 system-ui,'Noto Sans KR',sans-serif;
  padding:10px 38px 10px 16px;
  border-radius:9999px; cursor:pointer;
  color:var(--fg,#111);
  background:var(--surface,#fff);
  border:1px solid var(--border,rgba(128,128,128,.35));
  box-shadow:0 6px 20px rgba(0,0,0,.16);
  transition:background .3s ease, color .3s ease, border-color .3s ease;
}
.theme-switch select:focus-visible{ outline:2px solid var(--accent,#533afd); outline-offset:2px; }
@media (prefers-reduced-motion: reduce){ .theme-switch select{ transition:none; } }
```

(`.deck-ui` from `viewport-base.css` already marks this as off-stage chrome; the rules above
refine it.)

## 4. Switcher JS (apply + persist + restore)

Paste alongside the DECK BOOTSTRAP SCRIPT:

```html
<script>
(function () {
  var root = document.querySelector('.deck-root');
  var sel  = document.getElementById('theme-select');
  if (!root || !sel) return;
  var classes = Array.prototype.map.call(sel.options, function (o) { return o.value; });
  function apply(v) {
    classes.forEach(function (c) { root.classList.remove(c); });
    root.classList.add(v);
    try { localStorage.setItem('deck-theme', v); } catch (e) {}
  }
  var saved; try { saved = localStorage.getItem('deck-theme'); } catch (e) {}
  if (saved && classes.indexOf(saved) > -1) sel.value = saved;
  apply(sel.value);
  sel.addEventListener('change', function () { apply(sel.value); });
})();
</script>
```

---

## Generation rules

- **Always include this switcher** — every deck bakes in ≥2 themes, so there is never a one-option
  box. Aim for at least 2–3 baked themes (curated set) or the full library via `gen-themes.py`.
- Bake one `.theme-<slug>` block per selected system, values mapped per EXTERNAL_DESIGN_SYSTEMS.md
  §3–§4 (colors → vars, typography scaled for the stage into `--font-*` + size vars).
- Keep **fixed-stage geometry identical across themes** — only color/typography vars change. Layout,
  spacing rhythm, and the 1920×1080 measurements stay constant so switching never reflows.
- After generating, screenshot **each** theme option: a mapped palette can fail contrast on a layout
  tuned for another system. Fix per-theme var overrides; do not drop the switcher.
- The switcher label is the brand display name (Format A frontmatter `name`, or the `## 1.` title
  for prose files) — cleaned up (e.g. "Stripi-Inspired-design-analysis" → "Stripe").

---

## 5. Keyboard shortcuts + favorites (many-theme decks)

When a deck bakes in *many* themes (e.g. the whole getdesign.md library via `gen-themes.py`), the
plain `<select>` isn't enough. Add keyboard cycling and a favorites system.

### Shortcuts

| Key | Action |
| --- | ------ |
| **⌥→ / ⌥←** | next / previous theme (cycle). **Option only — never add Command**: `⌘⌥←/→` is the browser's tab-switch shortcut and gets intercepted. |
| `T` / `Shift+T` | backup cycle (in case ⌥+arrow is swallowed) |
| `F` | toggle favorite on the current theme |
| `Shift+F` | toggle "favorites-only cycle" mode |

The base bootstrap in `viewport-base.css` already **ignores modified arrows** (`if (e.altKey || e.metaKey ||
e.ctrlKey) return;`), so `⌥→` never also advances a slide — the switcher owns the modified arrows.

### Register shortcuts with the base help overlay

`viewport-base.css`'s bootstrap builds the **H / ? help overlay** for every deck and exposes
`window.deckHelp.addSection(title, rows)`. The switcher must NOT build its own help — it appends a
"테마" section so the deck's one help overlay lists theme + favorite shortcuts too:

```js
if (window.deckHelp) window.deckHelp.addSection('테마 / 즐겨찾기', [
  ['⌥←  ⌥→', '테마 전환'],
  ['T  ⇧T', '테마 전환 (백업)'],
  ['F', '현재 테마 즐겨찾기'],
  ['⇧F', '즐겨찾기만 순환']
]);
```

(H / ? / Esc to open-close the overlay is handled by the base bootstrap; single-theme decks still
get it, just without the 테마 section.)

### Favorites UX

- Favorited themes get a `★` prefix in their `<option>` (store the base name in `dataset.base` so
  the star can be added/removed without losing it).
- A round **star button** next to the `<select>` shows the current theme's fav state (`★`/`☆`,
  `.is-fav` = accent color) and toggles on click — same as `F`.
- Every toggle / theme change fires a bottom-center **toast**; the favorite toast adds a `.fav`
  class (accent border + a `scale` pop). **Do not animate `opacity` inside the pop keyframe** —
  let `.show` own opacity via transition; the keyframe animates `transform: scale()` only.

### localStorage scheme (favorites global, theme per-deck)

| Key | Scope | Holds |
| --- | ----- | ----- |
| `zoona-favs` | **global** (all decks share) | JSON array of favorited theme values |
| `zoona-fav-only` | **global** | `'1'`/`'0'` favorites-only mode |
| `zoona-theme:<deckId>` | **per-deck** | this deck's last-selected theme |

`deckId = root.dataset.deck || document.title || location.pathname`. **Give every deck a stable
`data-deck="<slug>"` on `.deck-root`** so per-deck theme memory is reliable (title/path are
fallbacks). Rationale: favorite *themes* are a personal preference worth sharing across decks, but
the *current theme* is per-deck state — sharing it would make opening deck B jump to deck A's theme.

> **localStorage is per-origin.** These keys are shared across decks only within the same origin
> (all `file://` locally, or the same deployed domain). Different deploy domains = isolated.

Full reference implementation (star button markup/CSS, `gen-themes.py` for bulk theme blocks, and
the complete switcher script) lives in the generated demo; reuse it verbatim for many-theme decks.

### Verifying in an automated (background) tab

CSS transitions/animations are **paused in a hidden/background tab**, so `getComputedStyle` reads
frozen start values (opacity 0, scale at 0%) even though the UI is correct. Check
`document.visibilityState` before concluding a toast/animation is broken — assert class/state logic
(`classList`, `localStorage`) rather than computed opacity, or foreground the tab first.
