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
| 확률, 점수, 학습 진행처럼 값이 바뀌는 비교 | `bars` |
| 거리, 가까움, 묶음(임베딩 공간 등) | `space` |
| 동작 원리: 크기 비율, 칸 격자, 합쳐지고 줄어드는 과정 | `morph` |
| 깊이가 뜻을 갖는 구조: 층 쌓기, 3차원 텐서 모양 | `solid` |
| 문장 위주 | 일반 슬라이드 |

한 덱의 절반 넘게 움직임 장면이면 줄인다. `carousel`과 `dots`는 덱당 한 번 정도.

**고르는 기준.** 상자와 선(`flow`)은 "무엇이 어디로 가나"를 보여 준다. 원리 설명에서 청중이 막히는 곳은 대개 "그 안에서 숫자가 어떻게 바뀌나"다. 값이 바뀌면 `bars`, 위치와 거리가 바뀌면 `space`, 크기나 모양이 바뀌면 `morph`로 그린다. 3D(`solid`)는 깊이 방향이 실제 뜻(층 수, 텐서의 셋째 차원)을 가질 때만 쓴다. 행렬 비율, 막대 값, 2차원 거리는 평면이 더 정확하게 읽히므로 3D로 세우지 않는다. 같은 장면의 상자가 다음 비트에서 줄거나 합쳐지는 것이 핵심이라 상자를 새로 그리지 말고 같은 id의 상태를 바꾼다.

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

**morph** — 상태 보간. 요소(`els`)를 정의하고 비트마다 `set`으로 상태를 주면 앞 비트 상태에서 이어 그린다. 숫자 값(`v`)은 세면서 바뀌고, 위치와 크기는 옮겨 가며 바뀐다. 처음 `set`에 나온 요소는 나타나고 `hide`에 넣으면 사라진다. 글자와 색은 이동 중간에 바뀐다.
```json
{"els":[{"id":"W","type":"box","tone":"mut","fill":.18},
        {"id":"g","type":"box","rows":2,"cols":8,"cellTone":"accent"},
        {"id":"n","type":"text","x":300,"y":860,"size":34,"suf":"개"},
        {"id":"p","type":"dot","r":14},{"id":"L","type":"link","from":"p","to":"W","arrow":true}],
 "beats":[{"title":"원래 크기","set":{"W":{"x":300,"y":330,"w":440,"h":440,"label":"W"},"n":{"v":1048576}}},
          {"title":"줄어듦","set":{"W":{"w":8,"tone":"warn"},"n":{"v":32768}}},
          {"title":"칸 값","set":{"g":{"x":900,"y":400,"w":800,"h":200,"vals":[0,.5,1]}},"hide":["n"]}]}
```
| type | 상태 |
|---|---|
| `box` | `x,y`(왼쪽 위) `w,h` `fill`(채움 진하기) `lw`(테두리) `label` `sub` `lp`(in, top, bottom, left, right) `ltone`. `rows`,`cols`를 주면 칸 격자가 되고 `vals`(0~1)가 칸 진하기 |
| `dot`, `ring` | `x,y`(중심) `r` `label`. dot은 `lp:"left"`로 글자를 왼쪽에 |
| `text` | `x,y` `s`(글) 또는 `v`(숫자) `d`(소수 자리) `pre` `suf` `size` `anchor` |
| `link` | `from`, `to`(요소 id) `arrow`. 양 끝 요소를 따라 움직임 |

공통 상태는 `a`(투명도)와 `tone`. 요소별 `_d`로 그 비트 안에서 늦게 시작한다. 비트마다 `note`를 쓸 수 있다.

**bars** — 행마다 계열별 막대. 비트의 `values`에 값을 주면 길이와 숫자가 함께 바뀐다. `kind:"mark"` 계열은 목표선. `pick`은 한 행을 강조하고 나머지를 흐리게, `tags`는 행 오른쪽 글.
```json
{"rows":[{"label":"A","sub":"설명"}],"series":[{"key":"p","label":"확률"},{"key":"t","label":"정답","kind":"mark","markLabel":"정답"}],
 "beats":[{"title":"예측","values":{"p":[.5]}},{"values":{"t":[1]},"tags":["오차 0.50"]},{"values":{"p":[.9]},"pick":0}]}
```

**space** — 2차원 평면의 점. 비트의 `pos`는 영역 안 0~1 좌표. `links`는 두 점을 잇는 선, `rings`는 묶음 원(`at`, `r`은 영역 너비 대비), `hide`로 지움. 실제 차원을 줄여 그린 그림이면 그 사실을 화면에 적는다.
```json
{"area":[110,300,1810,870],"points":[{"id":"a","label":"문장 1"},{"id":"b","label":"문장 2","lp":"left"}],
 "beats":[{"pos":{"a":[.1,.2],"b":[.7,.6]}},{"pos":{"b":[.2,.3]},"links":[{"from":"a","to":"b"}]},
          {"hide":["a>b"],"rings":[{"id":"r1","at":[.15,.25],"r":.1,"label":"묶음"}]}]}
```
**solid** — 3D 좌표 요소를 카메라로 투영. 비트마다 `cam`(`yaw`, `pitch` 도, `zoom`, `ox`,`oy` 화면 중심, `cx`,`cy`,`cz` 회전 중심, `f` 원근 거리)을 주면 앞 비트 시점에서 돌아가며 바뀐다(`camMove`초). 요소 상태는 `morph`와 같은 `set`, `hide`, `_d` 규칙. 글자는 기울이지 않고 투영된 자리에 화면 기준으로 세워 읽기 쉽게 둔다. 판은 깊이 순서로 다시 쌓는다. 첫 비트는 정면(`yaw:0`)으로 시작해 평면 그림과 이어지게 하고, 돌린 뒤 마지막에 정면으로 돌아와 다음 장과 잇는 흐름을 권장.
```json
{"cam":{"yaw":0,"ox":1040,"oy":600},
 "els":[{"id":"L0","type":"sheet","x":-410,"y":-170,"z":0,"w":820,"h":340,"rows":4,"cols":20,"vals":[],"rowLabels":["a","b","c","d"]},
        {"id":"L1","type":"sheet","x":-410,"y":-170,"z":56,"w":820,"h":340,"rows":4,"cols":20,"vals":[]}],
 "beats":[{"set":{"L0":{"label":"입력","lp":"top"}}},
          {"cam":{"yaw":56,"pitch":16,"zoom":.9,"cz":600},"set":{"L1":{"_d":.6,"cellA":.3}}}]}
```

| type | 상태 |
| --- | --- |
| `sheet` | `x,y`(왼쪽 위) `z`(깊이) `w,h` `rows`,`cols`,`vals` 칸 격자 `cellA`(칸 진하기 배수) `fill` `lw` `label` `lp`(top, bottom, left, right) `ltone` `rowLabels`(행 이름) `rowA` |
| `dot` | `x,y,z` `r`(원근으로 크기 변함) `label` `lp` |
| `line` | `x,y,z`에서 `x2,y2,z2`까지 `arrow` `dash` `label` `lat`(글자 위치 0~1) `lp` |
| `text` | 화면 좌표 `x,y`. `world:true`면 `x,y,z`를 투영한 자리 |

판이 20장을 넘으면 가운데 판은 `cellA`를 0.3 안팎으로 낮춰야 겹쳐도 읽힌다. 깊이 축을 표시하는 `line`은 판 위쪽 모서리 바깥에 두면 판을 가로지르지 않는다.

`bars`와 `space`는 `morph` 위에 만든 장면이라 `els`와 비트별 `set`으로 요소를 더할 수 있다.

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
