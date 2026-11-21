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

## 자체 색 테마 (`pitch-*`)

getdesign.md에서 온 파일이 아니라 직접 만든 색 테마. 피치덱 템플릿 목록(vip.graphics/pitch-decks)의 샘플에서 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음. 색만 정의하며 형식은 Structured와 같아 `gen-themes.py`가 그대로 읽음.

- 밝은 바탕: `pitch-forest`, `pitch-terracotta`, `pitch-swiss`, `pitch-blush`
- 어두운 바탕: `pitch-mint`, `pitch-midnight`, `pitch-violet`, `pitch-ember`

새 색 테마를 더할 때는 기존 `pitch-*.md` 하나를 복사해 `colors:` 값을 바꿈. 필수 토큰은 `canvas`, `ink`, `primary`이고 `surface`, `ink-muted`, `accent-2`, `hairline`이 없으면 스크립트가 파생값을 씀. `add-design-system.sh --force`는 같은 이름의 브랜드 파일만 덮어쓰므로 `pitch-` 접두어 파일은 영향 없음.
