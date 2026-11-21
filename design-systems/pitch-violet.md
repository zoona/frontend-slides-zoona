---
version: alpha
name: Pitch Violet
description: "어두운 바탕 색 테마. 짙은 남보라 바탕에 밝은 보라. 화면이 화려해도 되는 소개, 행사용. 게임 스튜디오, NFT 덱 샘플의 배색을 참고해 만든 자체 테마이며 색만 정의함."

colors:
  primary: "#8576ff"
  on-primary: "#0f0c34"
  accent-2: "#6602fe"
  accent-soft: "#3b2e96"
  ink: "#f4f4fb"
  ink-muted: "#a9a5d8"
  canvas: "#151142"
  surface: "#1e1955"
  hairline: "#2f2873"

typography:
  display:
    fontFamily: Inter Tight
    fontWeight: 600
  body:
    fontFamily: Inter Tight
    fontWeight: 400
---

# Pitch Violet

짙은 남보라 바탕에 밝은 보라. 화면이 화려해도 되는 소개, 행사용.

- 구분: 어두운 바탕
- 참고: vip.graphics 피치덱 목록의 게임 스튜디오, NFT 덱 샘플. 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음
- 범위: 색만 정의. 글꼴과 간격은 덱 기본값을 따름

## 색 역할

| 토큰 | 값 | 쓰는 자리 |
| --- | --- | --- |
| `canvas` | `#151142` | 슬라이드 바탕 |
| `surface` | `#1e1955` | 카드, 표 줄무늬 |
| `ink` | `#f4f4fb` | 제목과 본문 글자 |
| `ink-muted` | `#a9a5d8` | 보조 글자, 캡션 |
| `primary` | `#8576ff` | 강조색 |
| `on-primary` | `#0f0c34` | 강조색 면 위 글자 |
| `accent-2` | `#6602fe` | 두 번째 강조색 |
| `accent-soft` | `#3b2e96` | 옅은 강조 면 |
| `hairline` | `#2f2873` | 구분선, 테두리 |

## 사용 요령

- accent-2(선명한 보라)는 면과 빛 번짐용. 어두운 바탕 위 글자색으로는 대비 부족
- 카드 강조는 accent-soft 면에 ink 글자
- 글자 강조는 primary만 사용
