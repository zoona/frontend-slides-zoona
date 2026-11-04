# 움직임 장면 라이브러리

키 한 번에 비트 하나가 재생되는 장면. 코드를 새로 쓰지 않고 데이터만 넣는다.

## 언제 쓰나

| 장의 내용 | 장면 |
|---|---|
| 기간별 항목, 한 일 정리 | `timeline` |
| 분류표, 커버리지, 등급 현황 | `map` |
| 구조도, 절차, 업무 흐름, 개선 전후 | `flow` |
| 사례 나열, 후보 비교, 결과 공개 | `cards` |
| 큰 숫자의 규모 설명 | `dots` |
| 문장 위주 | 일반 슬라이드 |

한 덱의 절반 넘게 움직임 장면이면 줄인다. `carousel`과 `dots`는 덱당 한 번 정도.

## 덱 뼈대

```html
<style>/*DM-BASE-CSS*/ /*DM-CSS*/ (덱 테마) </style>
<div class="deck-viewport"><div class="deck-stage">
  <section class="slide active">일반 슬라이드</section>
  <section class="slide" data-motion="map"><script type="application/json">{데이터}</ script></section>
</div></div>
<script>/*DM-BOOT*/</ script><script>/*DM-JS*/</ script><script>DeckMotion.init();</ script>
```

위 `</ script>`의 공백은 이 문서 표기용이므로 실제 덱에서는 뺀다. 작성 후 `python3 scripts/inline-motion.py 입력.html 출력.html`로 단일 파일을 만든다. 예시 전체는 `examples/motion-demo.src.html`.

## 공통 필드

| 필드 | 뜻 |
|---|---|
| `kicker` | 제목 위 작은 분류명 |
| `title`, `sub` | 제목과 부제 |
| `badge` | 우상단 표시. 초안이나 예시 데이터면 반드시 표시 |
| `beats` | 비트별 `{title, sub}`. 비트마다 제목을 바꿀 때 사용 |

## 장면별 데이터

**timeline** — 축과 항목, 이어진 일, 종류별 재배열 순서. `links`가 없으면 그 비트를 건너뜀. `regroup:false`로 재배열 생략.
```json
{"periods":["1월","2월"],"groups":[{"name":"제품"}],
 "items":[{"id":1,"period":0,"group":0}],
 "links":[{"name":"한 줄기","tone":"accent","items":[1,5,9]}],
 "marks":[{"period":0,"label":"착수"}]}
```

**map** — 칸, 등급 채움, 바깥 항목, 투표 순서. `outside`, `votes`는 있을 때만. `levels` 순서가 진함 순서.
```json
{"levels":[{"key":"운영","label":"운영","tone":"c1"},{"key":"실증","label":"실증","tone":"c1"}],
 "columns":[{"name":"서빙","cells":[{"name":"양자화","level":"실증"}]}],
 "outside":{"title":"지도 밖","items":["NPU"]},"votes":{"양자화":6}}
```

**flow** — `col`로 열, 같은 열 안 순서로 행을 자동 배치. 비트별로 `nodes`, `edges`(`"a>b"`)를 추가하고 `hide`로 지움. `particles:true`면 입자가 흐름. `note`는 큰 숫자 표시. `style:"sketch"`면 손그림 화풍.
```json
{"nodes":[{"id":"a","label":"요청","col":0},{"id":"b","label":"기록","col":1,"tone":"warn"}],
 "edges":[{"from":"a","to":"b","w":3}],
 "beats":[{"title":"경로","nodes":["a","b"],"edges":["a>b"]},
          {"title":"흐름","particles":true,"note":{"big":"38%","text":"설명"}}]}
```

**cards** — `mode:"row"`는 키마다 한 장씩(`perBeat:false`면 한 번에), `mode:"carousel"`은 카드 줄을 넘기고 `reveal`을 뒤집어 공개.
```json
{"mode":"row","cards":[{"tag":"분류","title":"제목","text":"설명"}]}
```

**dots** — 격자 점 채움, 윗줄 강조, 다른 단위로 모음. `steps`는 비트별 큰 숫자.
```json
{"cols":52,"rows":40,"highlightRows":10,"gatherPerCol":8,
 "steps":[{"big":"2,080시간","sub":"설명"},{"big":"520시간"},{"big":"65근무일"}]}
```

`tone` 값: `fg mut dim accent warn on c1 c2 c3 c4 c5`. 색은 전부 테마 변수(`--dm-*`)를 따른다.

## 새 장면 추가

`DeckMotion.register('name',(slide,data,kit)=>({beats:[초...],draw(t){...}}))`. 규칙은 하나: `draw(t)`는 `t`만 보고 그린다. `Date.now`, `requestAnimationFrame`, 시드 없는 난수 금지. 글자와 선은 `kit.text`, `kit.line`으로 만들고 캔버스는 점 수백 개 이상일 때만 쓴다.

## 검증과 출력

```bash
scripts/motion-capture.sh <덱 URL> <출력 폴더> --pdf 덱.pdf --video 덱.mp4 --fps 30
```

- 모든 멈춤 지점에서 글자 겹침, 화면 밖, 카드 넘침을 검사해 `check.json`에 남김. 0건이어도 멈춤 지점 PNG를 눈으로 확인
- `carousel`은 겹침이 의도된 장면이라 검사 제외
- 영상에는 소리가 없음

브라우저 콘솔에서 `deckMotion.check()`, `deckMotion.goStop(n)`, `deckMotion.seek(초)` 사용 가능. 주소의 `#3.2`는 3번 슬라이드 2번 비트.

## 발표 전 점검

- 글꼴을 CDN으로 불러오면 인터넷이 끊길 때 시스템 글꼴로 바뀜. 현장이 불확실하면 글꼴을 덱과 같은 폴더에 둠
- 대체 자료로 PDF를 함께 준비
