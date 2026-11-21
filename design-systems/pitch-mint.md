---
version: alpha
name: Pitch Mint
description: "어두운 바탕 색 테마. 짙은 회색 바탕에 민트 하나. 제품 시연, 기술 발표용. 데모데이 3분 발표 덱 샘플의 배색을 참고해 만든 자체 테마이며 색만 정의함."

colors:
  primary: "#14b58a"
  on-primary: "#0c1f1a"
  accent-2: "#c7f9ed"
  accent-soft: "#2b5b54"
  ink: "#f7f9f9"
  ink-muted: "#a3a6b1"
  canvas: "#22232b"
  surface: "#2c2d35"
  hairline: "#3d3f4a"

typography:
  display:
    fontFamily: Inter Tight
    fontWeight: 600
  body:
    fontFamily: Inter Tight
    fontWeight: 400
---

# Pitch Mint

짙은 회색 바탕에 민트 하나. 제품 시연, 기술 발표용.

- 구분: 어두운 바탕
- 참고: vip.graphics 피치덱 목록의 데모데이 3분 발표 덱 샘플. 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음
- 범위: 색만 정의. 글꼴과 간격은 덱 기본값을 따름

## 색 역할

| 토큰 | 값 | 쓰는 자리 |
| --- | --- | --- |
| `canvas` | `#22232b` | 슬라이드 바탕 |
| `surface` | `#2c2d35` | 카드, 표 줄무늬 |
| `ink` | `#f7f9f9` | 제목과 본문 글자 |
| `ink-muted` | `#a3a6b1` | 보조 글자, 캡션 |
| `primary` | `#14b58a` | 강조색 |
| `on-primary` | `#0c1f1a` | 강조색 면 위 글자 |
| `accent-2` | `#c7f9ed` | 두 번째 강조색 |
| `accent-soft` | `#2b5b54` | 옅은 강조 면 |
| `hairline` | `#3d3f4a` | 구분선, 테두리 |

## 사용 요령

- 민트 면 위 글자는 흰색이 아니라 on-primary(짙은 녹색)
- accent-2(밝은 민트)는 큰 숫자와 밝은 면에 사용
- 카드는 surface, 테두리는 hairline으로 얇게
