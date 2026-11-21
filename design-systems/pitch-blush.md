---
version: alpha
name: Pitch Blush
description: "밝은 바탕 색 테마. 옅은 분홍 바탕에 짙은 자주빛 글자와 진한 분홍 강조. 부드럽지만 글자 대비는 유지. 여성 건강(펨테크) 덱 샘플의 배색을 참고해 만든 자체 테마이며 색만 정의함."

colors:
  primary: "#cc3a72"
  on-primary: "#ffffff"
  accent-2: "#f69dbe"
  accent-soft: "#fae4eb"
  ink: "#2a1c26"
  ink-muted: "#7a6672"
  canvas: "#fdf8fa"
  surface: "#fae8ee"
  hairline: "#f0d5df"

typography:
  display:
    fontFamily: Inter Tight
    fontWeight: 600
  body:
    fontFamily: Inter Tight
    fontWeight: 400
---

# Pitch Blush

옅은 분홍 바탕에 짙은 자주빛 글자와 진한 분홍 강조. 부드럽지만 글자 대비는 유지.

- 구분: 밝은 바탕
- 참고: vip.graphics 피치덱 목록의 여성 건강(펨테크) 덱 샘플. 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음
- 범위: 색만 정의. 글꼴과 간격은 덱 기본값을 따름

## 색 역할

| 토큰 | 값 | 쓰는 자리 |
| --- | --- | --- |
| `canvas` | `#fdf8fa` | 슬라이드 바탕 |
| `surface` | `#fae8ee` | 카드, 표 줄무늬 |
| `ink` | `#2a1c26` | 제목과 본문 글자 |
| `ink-muted` | `#7a6672` | 보조 글자, 캡션 |
| `primary` | `#cc3a72` | 강조색 |
| `on-primary` | `#ffffff` | 강조색 면 위 글자 |
| `accent-2` | `#f69dbe` | 두 번째 강조색 |
| `accent-soft` | `#fae4eb` | 옅은 강조 면 |
| `hairline` | `#f0d5df` | 구분선, 테두리 |

## 사용 요령

- accent-2(옅은 분홍)는 면과 그래프 채움용, 글자색으로는 쓰지 않음
- 카드 바탕은 surface, 강조 카드만 primary 면에 흰 글자
