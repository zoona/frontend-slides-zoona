#!/usr/bin/env python3
"""움직임 표현 모음 덱 생성. 설명 방식마다 한 장(MOTION_WAYS.md 순서), 전부 예시 데이터.
사용: python3 examples/build-motion-gallery.py  → examples/motion-gallery.src.html
묶기: python3 scripts/inline-motion.py examples/motion-gallery.src.html examples/motion-gallery.html"""
import json, math, pathlib

HERE = pathlib.Path(__file__).resolve().parent
BADGE = "예시"


def scene(kind, data, way, enter=None):
    data = dict(data)
    data["way"] = way
    if enter:
        data["enter"] = enter
    data.setdefault("badge", BADGE)
    return f'<section class="slide" data-motion="{kind}"><script type="application/json">{json.dumps(data, ensure_ascii=False)}</script></section>'


S = []

# 1. 같은 장면 두 번: 요청이 대기열을 지나 처리됨 → 같은 과정을 천천히
PATH = [[330, 560], [870, 560], [1050, 560], [1590, 560]]
els = [
    {"id": "u", "type": "icon", "shape": "user", "x": 250, "y": 560, "w": 120, "tone": "fg", "label": "사용자"},
    {"id": "q", "type": "icon", "shape": "queue", "x": 960, "y": 560, "w": 170, "tone": "c4", "label": "대기열"},
    {"id": "s", "type": "icon", "shape": "server", "x": 1670, "y": 560, "w": 130, "tone": "c2", "label": "서버"},
    {"id": "n", "type": "text", "x": 960, "y": 840, "size": 40, "weight": 800, "anchor": "middle", "pre": "처리 ", "suf": "건", "tone": "c2"},
]
for k in range(4):
    els.append({"id": f"p{k}", "type": "box", "w": 46, "h": 32, "fill": 1, "lw": 0, "rx": 6, "tone": "accent", "path": PATH, "trail": k == 0, "trailTone": "dim"})
S.append(scene("morph", {
    "kicker": "같은 장면 두 번", "els": els,
    "beats": [
        {"title": "요청 처리 과정", "stagger": .3, "set": {"u": {"enter": "drop"}, "q": {"enter": "drop"}, "s": {"enter": "drop"}}, "cap": "요청 네 건이 차례로 들어옴"},
        {"dur": 3.4, "move": 1.8, "set": {**{f"p{k}": {"u": 1, "_d": k * .45} for k in range(4)}, "n": {"v0": 0, "v": 4, "vease": "step", "vsteps": 4, "vdur": 3.1}},
         "cap": "대기열을 지나 서버에서 처리", "em": "대기열"},
        {"again": {"from": 1, "to": 1, "speed": .45}, "cap": "같은 과정을 천천히", "em": "천천히"},
    ]}, "같은 장면 두 번"))

# 2. 따라가기: 넓은 구간을 카메라가 따라감, 끝은 처음 구도
X = [160, 860, 1560, 2260, 2960]
NAMES = ["수집", "정제", "변환", "적재", "조회"]
els = []
for i, (x, nm) in enumerate(zip(X, NAMES)):
    els.append({"id": f"b{i}", "type": "box", "x": x, "y": 470, "w": 320, "h": 150, "fill": .12, "tone": "dim", "label": nm, "size": 48})
for i in range(4):
    els.append({"id": f"l{i}", "type": "link", "from": f"b{i}", "to": f"b{i+1}", "arrow": True, "tone": "dim", "lw": 4})
els.append({"id": "pk", "type": "dot", "r": 20, "tone": "accent", "path": [[x + 160, 668] for x in X], "trail": True, "trailTone": "accent", "trailW": 5})
els.append({"id": "al", "type": "text", "x": X[3] + 160, "y": 740, "size": 40, "weight": 800, "anchor": "middle", "tone": "warn", "s": "지연 4.2초"})
WIDE = [80, 300, 3300, 560]
cam = lambda i: [X[i] - 60, 400, 1140, 400]
S.append(scene("morph", {
    "kicker": "따라가기", "els": els,
    "beats": [
        {"title": "데이터 한 건의 경로", "cam": WIDE, "set": {**{f"b{i}": {} for i in range(5)}, **{f"l{i}": {} for i in range(4)}}, "cap": "다섯 단계를 지남"},
        {"cam": cam(0), "set": {"pk": {"u": .25, "_d": .6}, "b0": {"tone": "accent"}, "b1": {"tone": "accent", "_d": 1.2}}, "move": 1.4, "cap": "수집에서 정제로"},
        {"cam": cam(2), "set": {"pk": {"u": .5}, "b2": {"tone": "accent", "_d": .9}}, "move": 1.4, "cap": "변환까지 정상"},
        {"cam": cam(3), "set": {"pk": {"u": .75}, "b3": {"tone": "warn", "_d": .9}, "al": {"_d": 1.2}}, "move": 1.4, "cap": "적재에서 멈춤", "em": "멈춤"},
        {"cam": WIDE, "focus": ["b3", "al", "pk"], "cap": "전체에서 보면 한 구간 문제", "em": "한 구간"},
    ]}, "따라가기", enter="blur"))

# 3. 폭증: 두 배씩 늘어나는 숫자, 칸 채우기, 바탕이 달아오름, 섬광과 흩어짐
COLS, ROWS = 16, 8
GX, GY, CW = 820, 300, 58
els = [{"id": "cnt", "type": "text", "x": 110, "y": 560, "size": 120, "weight": 800, "suf": "건", "tone": "fg"},
       {"id": "cl", "type": "text", "x": 110, "y": 630, "size": 32, "tone": "mut", "s": "영향 받은 요청"}]
N = COLS * ROWS
order = sorted(range(N), key=lambda k: (abs(k % COLS - 7.5) + abs(k // COLS - 3.5) * 1.6, k))
for rank, k in enumerate(order):
    c, r = k % COLS, k // COLS
    els.append({"id": f"c{k}", "type": "box", "x": GX + c * CW, "y": GY + r * CW, "w": CW - 8, "h": CW - 8, "fill": .9, "lw": 0, "rx": 6, "tone": "accent"})
DUR = 5.0
first = {f"c{order[0]}": {"_d": 0}}
grow = {}
for rank, k in enumerate(order[1:], start=1):
    grow[f"c{k}"] = {"_d": round(DUR * math.log2(rank + 1) / math.log2(N), 3), "enter": "pop"}
els.append({"id": "bs", "type": "burst", "x": GX + 7.5 * CW, "y": GY + 3.5 * CW, "r": 620, "pr": 9, "n": 40, "tone": "warn"})
S.append(scene("morph", {
    "kicker": "폭증", "els": els, "move": .35,
    "beats": [
        {"title": "장애 한 건", "set": {"cnt": {"v": 1}, "cl": {}, **first}, "cap": "처음은 한 건"},
        {"dur": 6.0, "set": {"cnt": {"v": 128, "vease": "double", "vdur": DUR, "_d": 0}, **grow}, "bg": "warn", "bgA": .14, "bgMove": DUR,
         "cap": "재시도가 겹치며 두 배씩 늘어남", "em": "두 배씩"},
        {"flash": True, "retone": {"warn": [f"c{k}" for k in range(N)] + ["cnt"]}, "set": {"bs": {"p": 1}}, "bg": "warn", "bgA": .28,
         "cap": "전체 요청이 영향 받음", "em": "전체"},
    ]}, "폭증", enter="black"))

# 4. 나란히 경주: 작은 일과 큰 일에서 이기는 쪽이 바뀜
els = [
    {"id": "hA", "type": "text", "x": 520, "y": 330, "size": 38, "weight": 800, "anchor": "middle", "s": "하나씩 차례로"},
    {"id": "hB", "type": "text", "x": 1400, "y": 330, "size": 38, "weight": 800, "anchor": "middle", "s": "나눠서 동시에"},
    {"id": "sep", "type": "box", "x": 959, "y": 300, "w": 2, "h": 560, "fill": 1, "lw": 0, "tone": "dim"},
]
for tag, job, x0 in (("1", "작은 일 4건", 0), ("2", "큰 일 400건", 0)):
    els += [
        {"id": f"gA{tag}", "type": "gauge", "x": 520, "y": 600, "r": 150, "lw": 22, "tone": "c4", "suf": "초", "d": 1, "size": 56, "label": job},
        {"id": f"gB{tag}", "type": "gauge", "x": 1400, "y": 600, "r": 150, "lw": 22, "tone": "c2", "suf": "초", "d": 1, "size": 56, "label": job},
    ]
S.append(scene("morph", {
    "kicker": "나란히 경주", "els": els,
    "beats": [
        {"title": "처리 방식 두 가지", "set": {"hA": {}, "hB": {}, "sep": {"a": .6}}, "cap": "같은 일을 두 방식으로"},
        {"title": "작은 일", "dur": 3.2, "set": {"gA1": {"frac": 1, "v0": 0, "v": 0.8, "vease": "lin", "vdur": 1.2, "_d": 0},
                                              "gB1": {"frac": 1, "v0": 0, "v": 2.1, "vease": "lin", "vdur": 2.6, "_d": 0}},
         "cap": "준비 시간 때문에 동시 처리가 느림", "em": "준비 시간"},
        {"retone": {"warn": ["gA1"], "dim": ["gB1"]}, "cap": "작은 일은 차례 처리가 빠름"},
        {"title": "큰 일", "dur": 3.6, "set": {"gA2": {"frac": 1, "v0": 0, "v": 80, "vease": "lin", "vdur": 3.2, "enter": "right"},
                                            "gB2": {"frac": 1, "v0": 0, "v": 6.3, "vease": "lin", "vdur": 1.4, "enter": "right"},
                                            "gA1": {"exit": "left"}, "gB1": {"exit": "left"}},
         "hide": ["gA1", "gB1"], "cap": "같은 경주를 조건만 바꿔 다시", "em": "조건만"},
        {"retone": {"warn": ["gB2"], "dim": ["gA2"]}, "flash": "warn", "cap": "큰 일은 동시 처리가 이김", "em": "이김"},
    ]}, "나란히 경주", enter="wipe"))

# 5. 초점: 구성도에서 한 곳을 밝히고 나머지는 어둡게
ICX = [("web", "globe", 300, 420, "웹"), ("api", "server", 780, 420, "API"), ("mq", "queue", 1260, 420, "메시지 큐"),
       ("wk", "cpu", 1260, 760, "작업기"), ("db", "db", 780, 760, "DB"), ("st", "cloud", 1660, 590, "저장소")]
els = [{"id": i, "type": "icon", "shape": sh, "x": x, "y": y, "w": 110, "tone": "mut", "label": nm, "lp": "top" if i in ("api", "mq") else "bottom"} for i, sh, x, y, nm in ICX]
for a, b in (("web", "api"), ("api", "mq"), ("mq", "wk"), ("wk", "db"), ("api", "db"), ("wk", "st")):
    els.append({"id": f"{a}-{b}", "type": "link", "from": a, "to": b, "arrow": True, "tone": "dim"})
els.append({"id": "gq", "type": "gauge", "x": 1640, "y": 300, "r": 70, "lw": 14, "tone": "warn", "suf": "%", "size": 38, "label": "큐 사용률"})
allids = [e["id"] for e in els if e["id"] != "gq"]
S.append(scene("morph", {
    "kicker": "초점", "els": els,
    "beats": [
        {"title": "서비스 구성", "stagger": .12, "set": {i: {} for i in allids}, "cap": "여섯 구성 요소"},
        {"spot": [1130, 200, 640, 330], "set": {"mq": {"tone": "warn"}, "gq": {"frac": .92, "v0": 0, "v": 92, "vdur": 1.6}}, "cap": "메시지 큐가 가득 참", "em": "가득"},
        {"spot": [1150, 680, 230, 200], "set": {"wk": {"tone": "warn"}}, "cap": "작업기가 따라가지 못함", "em": "작업기"},
        {"spot": None, "focus": ["mq", "wk", "mq-wk", "gq"], "cap": "병목은 큐와 작업기 사이", "em": "큐와 작업기 사이"},
    ]}, "초점", enter="pixel"))

# 6. 변신: 같은 사물이 모양을 바꾸며 이어짐, 글은 지우고 다시 씀
els = [{"id": "o", "type": "icon", "shape": "doc", "x": 960, "y": 560, "w": 240, "tone": "fg"},
       {"id": "w", "type": "text", "x": 960, "y": 820, "size": 56, "weight": 800, "anchor": "middle", "write": True, "s": "문서"}]
for k in range(4):
    els.append({"id": f"k{k}", "type": "box", "x": 660 + k * 160, "y": 500, "w": 120, "h": 120, "fill": .2, "tone": "c2", "label": f"조각 {k+1}", "size": 24})
S.append(scene("morph", {
    "kicker": "변신", "els": els,
    "beats": [
        {"title": "문서가 검색 가능한 형태로", "set": {"o": {"enter": "pop"}, "w": {}}, "cap": "문서 한 건"},
        {"set": {"o": {"w": 0, "a": 0}, **{f"k{k}": {"enter": "pop", "_d": .25 + k * .15} for k in range(4)}, "w": {"s": "조각 네 개"}}, "cap": "의미 단위로 나눔"},
        {"set": {**{f"k{k}": {"x": 900, "y": 500, "w": 120, "h": 120, "a": 0, "_d": k * .1} for k in range(4)}, "o": {"shape": "db", "w": 220, "a": 1, "tone": "c2", "_d": .5}, "w": {"s": "벡터 저장소"}},
         "cap": "조각을 숫자 벡터로 바꿔 저장", "em": "벡터"},
        {"set": {"o": {"shape": "search", "w": 200, "tone": "accent"}, "w": {"s": "의미로 찾기"}}, "cap": "질문과 가까운 조각을 찾음"},
    ]}, "변신"))

# 7. 쌓아 올리기: 0.5초 간격으로 떨어져 쌓이고, 빠지는 항목은 흩어짐
ITEMS = [("서버", 3, "c1"), ("저장", 1.5, "c2"), ("네트워크", 1, "c4"), ("라이선스", 2.5, "c5"), ("운영 인력", 4, "warn")]
els, y, setb = [], 900, {}
tot = 0
for i, (nm, v, tone) in enumerate(ITEMS):
    h = v * 46
    y -= h + 8
    els.append({"id": f"s{i}", "type": "box", "x": 700, "y": y, "w": 520, "h": h, "fill": .85, "lw": 0, "tone": tone, "label": f"{nm} {v:g}", "ltone": "on", "size": 30})
els.append({"id": "tot", "type": "text", "x": 1320, "y": 560, "size": 96, "weight": 800, "suf": "억", "d": 1, "tone": "fg"})
els.append({"id": "tl", "type": "text", "x": 1320, "y": 620, "size": 30, "tone": "mut", "s": "연간 합계"})
S.append(scene("morph", {
    "kicker": "쌓아 올리기", "els": els,
    "beats": [
        {"title": "비용 항목", "dur": 4.0, "stagger": .5, "set": {**{f"s{i}": {"enter": "drop"} for i in range(5)},
                                                                "tot": {"v0": 0, "v": 12, "vease": "accel", "vdur": 3.2, "_d": 0}, "tl": {"_d": 0}}, "cap": "항목이 하나씩 쌓임"},
        {"set": {"s3": {"exit": "scatter"}, "s4": {"y": 900 - (3 + 1.5 + 1) * 46 - 24 - 4 * 46 - 8, "_d": .5}, "tot": {"v": 9.5, "_d": .4}}, "hide": ["s3"],
         "cap": "라이선스를 빼면", "em": "라이선스"},
    ]}, "쌓아 올리기"))

# 8. 흐름 + 효과: 기존 flow 장면에도 자막과 바깥 어둡게
S.append(scene("flow", {
    "kicker": "흐름에 초점",
    "nodes": [{"id": "a", "label": "주문", "col": 0}, {"id": "b", "label": "결제", "col": 1}, {"id": "c", "label": "재고 확인", "col": 2, "tone": "warn"}, {"id": "d", "label": "배송", "col": 3}],
    "edges": [{"from": "a", "to": "b", "w": 3}, {"from": "b", "to": "c", "w": 3}, {"from": "c", "to": "d", "w": 3}],
    "beats": [{"title": "주문 처리 흐름", "cap": "네 단계"},
              {"particles": True, "cap": "주문이 흐름을 따라 이동"},
              {"particles": True, "spot": [1010, 520, 380, 130], "cap": "재고 확인에서 대기 발생", "em": "대기"}]}, "흐름", enter="flash"))

head = (HERE / "motion-demo.src.html").read_text(encoding="utf8").split('<section class="slide active">')[0].replace("움직임 장면 데모", "움직임 표현 모음")
cover = '<section class="slide active"><div class="slide-content cover"><h1>움직임 표현 모음</h1><p>설명 방식 여덟 가지 (전부 예시 데이터)</p></div></section>'
end = '<section class="slide" data-enter="black"><div class="slide-content cover"><h1>움직임 표현 모음</h1><p>처음 구도로 돌아와 닫음</p></div></section>'
tail = '</div></div>\n<script>/*DM-BOOT*/</script><script>/*DM-JS*/</script>\n<script>DeckMotion.init();addEventListener(\'keydown\',e=>{if(e.key===\'t\')document.documentElement.classList.toggle(\'theme-paper\')});</script></body></html>\n'
out = HERE / "motion-gallery.src.html"
out.write_text(head + cover + "".join(S) + end + tail, encoding="utf8")
print(out)
