---
version: alpha
name: Pitch Forest
description: "밝은 바탕 색 테마. 흰 바탕에 짙은 녹색 하나. 금융, 실적, 계획 보고처럼 차분해야 하는 자리에 맞음. 투자은행 발표 덱 샘플의 배색을 참고해 만든 자체 테마이며 색만 정의함."

colors:
  primary: "#236c5c"
  on-primary: "#ffffff"
  accent-2: "#134339"
  accent-soft: "#dbe9e5"
  ink: "#10221d"
  ink-muted: "#5a6b66"
  canvas: "#ffffff"
  surface: "#f1f5f4"
  hairline: "#d9e3e0"

typography:
  display:
    fontFamily: Inter Tight
    fontWeight: 600
  body:
    fontFamily: Inter Tight
    fontWeight: 400
---

# Pitch Forest

흰 바탕에 짙은 녹색 하나. 금융, 실적, 계획 보고처럼 차분해야 하는 자리에 맞음.

- 구분: 밝은 바탕
- 참고: vip.graphics 피치덱 목록의 투자은행 발표 덱 샘플. 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음
- 범위: 색만 정의. 글꼴과 간격은 덱 기본값을 따름

## 색 역할

| 토큰 | 값 | 쓰는 자리 |
| --- | --- | --- |
| `canvas` | `#ffffff` | 슬라이드 바탕 |
| `surface` | `#f1f5f4` | 카드, 표 줄무늬 |
| `ink` | `#10221d` | 제목과 본문 글자 |
| `ink-muted` | `#5a6b66` | 보조 글자, 캡션 |
| `primary` | `#236c5c` | 강조색 |
| `on-primary` | `#ffffff` | 강조색 면 위 글자 |
| `accent-2` | `#134339` | 두 번째 강조색 |
| `accent-soft` | `#dbe9e5` | 옅은 강조 면 |
| `hairline` | `#d9e3e0` | 구분선, 테두리 |

## 사용 요령

- 표 머리와 구분 면은 accent-2(더 짙은 녹색)로 채우고 글자는 흰색
- 차트 계열은 녹색 농담 3단계와 회색으로 구성, 다른 색상 추가하지 않음
- 강조 면이 넓을 때는 accent-soft를 깔고 글자는 ink
