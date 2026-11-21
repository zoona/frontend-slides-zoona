# design-systems

zoona-slides 스킬이 읽는 테마 라이브러리. `*.md` 파일 하나가 스위처의 테마 하나가 됨. 이 `README.md`는 스킬이 읽지 않음.

## 들어 있는 테마

| 테마 | 바탕 | 배색 |
| --- | --- | --- |
| `ibm` | 밝음 | 흰 바탕, 파랑 (기본 덱의 기본 테마, IBM Carbon) |
| `pitch-forest` | 밝음 | 흰 바탕, 짙은 녹색 |
| `pitch-terracotta` | 밝음 | 크림 바탕, 남색 글자, 테라코타 |
| `pitch-swiss` | 밝음 | 회백색 바탕, 검정 |
| `pitch-blush` | 밝음 | 옅은 분홍 바탕, 진한 분홍 |
| `pitch-mint` | 어두움 | 짙은 회색 바탕, 민트 |
| `pitch-midnight` | 어두움 | 짙은 남색 바탕, 청록과 하늘색 |
| `pitch-violet` | 어두움 | 남보라 바탕, 밝은 보라 |
| `pitch-ember` | 어두움 | 검정 바탕, 주황 |

`pitch-*`는 직접 만든 색 테마. 피치덱 템플릿 목록(vip.graphics/pitch-decks)의 샘플에서 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음. 색만 정의하며 글꼴과 간격은 덱 기본값을 따름.

## 이력

- 2026-11-21: getdesign.md에서 받은 브랜드 테마 73종 삭제, 색 테마 8종으로 교체. `ibm`만 기본 테마라 남김. 삭제한 파일은 git 이력에 있음

## 색 테마 추가

기존 `pitch-*.md` 하나를 복사해 `colors:` 값을 바꿈. 필수 토큰은 `canvas`, `ink`, `primary`이고 `surface`, `ink-muted`, `accent-2`, `hairline`이 없으면 `gen-themes.py`가 파생값을 씀.

## 브랜드 테마가 필요할 때

getdesign.md 카탈로그([VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md))에서 그때 받음. 공개된 브랜드 디자인을 분석한 자료이며 공식 에셋이 아님.

```bash
~/.claude/skills/zoona-slides/scripts/add-design-system.sh --list
```

```bash
~/.claude/skills/zoona-slides/scripts/add-design-system.sh linear.app
```

지울 때는 해당 `.md` 파일을 삭제.
