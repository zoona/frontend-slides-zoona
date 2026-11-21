---
version: alpha
name: Pitch Ember
description: "어두운 바탕 색 테마. 검정 바탕에 주황 하나. 한 장에 한 메시지를 크게 보여주는 발표용. 스포츠 덱 샘플의 배색을 참고해 만든 자체 테마이며 색만 정의함."

colors:
  primary: "#f55c2b"
  on-primary: "#140805"
  accent-2: "#fc8a5e"
  accent-soft: "#53250b"
  ink: "#f5f5f5"
  ink-muted: "#9c9ca1"
  canvas: "#0c0c0d"
  surface: "#19191b"
  hairline: "#2c2c2e"

typography:
  display:
    fontFamily: Inter Tight
    fontWeight: 600
  body:
    fontFamily: Inter Tight
    fontWeight: 400
---

# Pitch Ember

검정 바탕에 주황 하나. 한 장에 한 메시지를 크게 보여주는 발표용.

- 구분: 어두운 바탕
- 참고: vip.graphics 피치덱 목록의 스포츠 덱 샘플. 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음
- 범위: 색만 정의. 글꼴과 간격은 덱 기본값을 따름

## 색 역할

| 토큰 | 값 | 쓰는 자리 |
| --- | --- | --- |
| `canvas` | `#0c0c0d` | 슬라이드 바탕 |
| `surface` | `#19191b` | 카드, 표 줄무늬 |
| `ink` | `#f5f5f5` | 제목과 본문 글자 |
| `ink-muted` | `#9c9ca1` | 보조 글자, 캡션 |
| `primary` | `#f55c2b` | 강조색 |
| `on-primary` | `#140805` | 강조색 면 위 글자 |
| `accent-2` | `#fc8a5e` | 두 번째 강조색 |
| `accent-soft` | `#53250b` | 옅은 강조 면 |
| `hairline` | `#2c2c2e` | 구분선, 테두리 |

## 사용 요령

- 주황은 장마다 한두 군데만. 넓게 쓰면 경고색으로 읽힘
- 주황 면 위 글자는 on-primary(거의 검정)
- 사진, 캡처가 들어가는 장은 surface 카드에 올림
