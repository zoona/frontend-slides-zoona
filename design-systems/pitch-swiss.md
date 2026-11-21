---
version: alpha
name: Pitch Swiss
description: "밝은 바탕 색 테마. 회백색 바탕에 검정. 색 없이 면과 글자 굵기로만 위계를 만듦. 스위스 스타일 덱 샘플의 배색을 참고해 만든 자체 테마이며 색만 정의함."

colors:
  primary: "#161e24"
  on-primary: "#f7f6f9"
  accent-2: "#29323e"
  accent-soft: "#e1e1e5"
  ink: "#0a0a0a"
  ink-muted: "#5c6168"
  canvas: "#f7f6f9"
  surface: "#ebebed"
  hairline: "#d5d5da"

typography:
  display:
    fontFamily: Inter Tight
    fontWeight: 600
  body:
    fontFamily: Inter Tight
    fontWeight: 400
---

# Pitch Swiss

회백색 바탕에 검정. 색 없이 면과 글자 굵기로만 위계를 만듦.

- 구분: 밝은 바탕
- 참고: vip.graphics 피치덱 목록의 스위스 스타일 덱 샘플. 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음
- 범위: 색만 정의. 글꼴과 간격은 덱 기본값을 따름

## 색 역할

| 토큰 | 값 | 쓰는 자리 |
| --- | --- | --- |
| `canvas` | `#f7f6f9` | 슬라이드 바탕 |
| `surface` | `#ebebed` | 카드, 표 줄무늬 |
| `ink` | `#0a0a0a` | 제목과 본문 글자 |
| `ink-muted` | `#5c6168` | 보조 글자, 캡션 |
| `primary` | `#161e24` | 강조색 |
| `on-primary` | `#f7f6f9` | 강조색 면 위 글자 |
| `accent-2` | `#29323e` | 두 번째 강조색 |
| `accent-soft` | `#e1e1e5` | 옅은 강조 면 |
| `hairline` | `#d5d5da` | 구분선, 테두리 |

## 사용 요령

- 강조는 색이 아니라 검은 면과 굵은 글자로 함
- 수치 카드는 검은 면에 회백색 글자, 나머지는 테두리만
- 차트 계열은 검정, 짙은 회색, 밝은 회색 순
