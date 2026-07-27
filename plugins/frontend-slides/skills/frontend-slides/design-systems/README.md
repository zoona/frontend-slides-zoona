# design-systems

User-curated **DESIGN.md** library consumed by the `zoona-html-deck` skill (Phase 2 → external
design systems). Each `*.md` file here is one brand's design system; drop a file in and it
becomes a selectable slide style. This `README.md` is ignored by the skill (its glob is
`*.md | grep -vi readme`).

## Source

Files are mirrored from **[getdesign.md](https://getdesign.md)** / its open catalog
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(`design-md/<brand>/DESIGN.md`). Independent analyses of publicly observable brand design —
not official assets.

## Curated starter set (12)

`stripe` · `linear` · `vercel` · `notion` · `figma` · `apple` · `claude` · `nvidia` ·
`spotify` · `framer` · `tesla` · `airbnb`

Two on-disk formats coexist (the skill handles both — see the skill's
`EXTERNAL_DESIGN_SYSTEMS.md`):
- **Structured** — YAML frontmatter with `colors/typography/rounded/spacing/components`
  (stripe, linear, vercel, notion, figma, apple, claude, nvidia, framer, airbnb).
- **Prose** — 9 numbered sections, tokens embedded in text (spotify, tesla).

## Add / update more (74 brands available)

Use the skill's helper (pure curl, no node needed):

```bash
~/.claude/skills/zoona-html-deck/scripts/add-design-system.sh --list          # list all brands
~/.claude/skills/zoona-html-deck/scripts/add-design-system.sh linear.app       # add one
~/.claude/skills/zoona-html-deck/scripts/add-design-system.sh raycast supabase  # add several
~/.claude/skills/zoona-html-deck/scripts/add-design-system.sh --force apple     # re-fetch
```

Names ending in `.app`/`.ai`/`.com` are normalized (`linear.app` → `linear.md`). To remove a
system, just delete its `.md` file.
