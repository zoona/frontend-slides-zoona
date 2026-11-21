---
version: alpha
name: Pitch Midnight
description: "어두운 바탕 색 테마. 짙은 남색 바탕에 청록과 하늘색. 데이터, 인프라, 보안 주제용. 사이버보안, 빅데이터 덱 샘플의 배색을 참고해 만든 자체 테마이며 색만 정의함."

colors:
  primary: "#1bb8a3"
  on-primary: "#04121f"
  accent-2: "#2bb8d4"
  accent-soft: "#0c444a"
  ink: "#eef5f8"
  ink-muted: "#8da2b3"
  canvas: "#071629"
  surface: "#0b2537"
  hairline: "#173247"

typography:
  display:
    fontFamily: Inter Tight
    fontWeight: 600
  body:
    fontFamily: Inter Tight
    fontWeight: 400
---

# Pitch Midnight

짙은 남색 바탕에 청록과 하늘색. 데이터, 인프라, 보안 주제용.

- 구분: 어두운 바탕
- 참고: vip.graphics 피치덱 목록의 사이버보안, 빅데이터 덱 샘플. 배색만 참고했고 레이아웃과 그래픽은 가져오지 않음
- 범위: 색만 정의. 글꼴과 간격은 덱 기본값을 따름

## 색 역할

| 토큰 | 값 | 쓰는 자리 |
| --- | --- | --- |
| `canvas` | `#071629` | 슬라이드 바탕 |
| `surface` | `#0b2537` | 카드, 표 줄무늬 |
| `ink` | `#eef5f8` | 제목과 본문 글자 |
| `ink-muted` | `#8da2b3` | 보조 글자, 캡션 |
| `primary` | `#1bb8a3` | 강조색 |
| `on-primary` | `#04121f` | 강조색 면 위 글자 |
| `accent-2` | `#2bb8d4` | 두 번째 강조색 |
| `accent-soft` | `#0c444a` | 옅은 강조 면 |
| `hairline` | `#173247` | 구분선, 테두리 |

## 사용 요령

- 청록(primary)과 하늘색(accent-2)을 차트 두 계열로 나눠 씀
- 넓은 강조 면은 accent-soft(어두운 청록)로 깔고 글자는 ink
- 바탕과 surface 차이가 작으므로 카드에는 hairline 테두리를 같이 씀
