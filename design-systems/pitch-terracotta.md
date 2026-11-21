---
version: alpha
name: Pitch Terracotta
description: "밝은 바탕 색 테마. 크림색 바탕에 남색 글자와 테라코타 강조. 따뜻하고 손에 잡히는 느낌이라 사람, 조직, 교육 주제에 맞음. 자연 제품, 웰니스 덱 샘플의 배색을 참고해 만든 자체 테마이며 색만 정의함."

colors:
  primary: "#b4623f"
  on-primary: "#ffffff"
  accent-2: "#324975"
  accent-soft: "#f4e3dc"
  ink: "#263a61"
  ink-muted: "#6b7691"
  canvas: "#fdf8f6"
  surface: "#f7ebe6"
  hairline: "#ead8d0"

typography:
  display:
    fontFamily: Inter Tight
    fontWeight: 600
  body:
    fontFamily: Inter Tight
    fontWeight: 400
---

# Pitch Terracotta

크림색 바탕에 남색 글자와 테라코타 강조. 따뜻하고 손에 잡히는 느낌이라 사람, 조직, 교육 주제에 맞음.

- 구분: 밝은 바탕
- 참고: vip.graphics 피치덱 목록의 자연 제품, 웰니스 덱 샘플. 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음
- 범위: 색만 정의. 글꼴과 간격은 덱 기본값을 따름

## 색 역할

| 토큰 | 값 | 쓰는 자리 |
| --- | --- | --- |
| `canvas` | `#fdf8f6` | 슬라이드 바탕 |
| `surface` | `#f7ebe6` | 카드, 표 줄무늬 |
| `ink` | `#263a61` | 제목과 본문 글자 |
| `ink-muted` | `#6b7691` | 보조 글자, 캡션 |
| `primary` | `#b4623f` | 강조색 |
| `on-primary` | `#ffffff` | 강조색 면 위 글자 |
| `accent-2` | `#324975` | 두 번째 강조색 |
| `accent-soft` | `#f4e3dc` | 옅은 강조 면 |
| `hairline` | `#ead8d0` | 구분선, 테두리 |

## 사용 요령

- 제목과 본문은 남색(ink), 테라코타는 숫자와 요지 배지처럼 좁은 자리에만
- 테라코타를 작은 본문 글자색으로 쓰면 대비가 부족함. 면으로 채우고 흰 글자를 올림
- 표지나 간지는 accent-2(남색) 면으로 뒤집어 씀
