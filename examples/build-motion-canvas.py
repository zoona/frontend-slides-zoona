#!/usr/bin/env python3
"""캔버스 장면 예시 덱 생성. 질문 한 건이 라우터를 지나 모델이 정해지는 과정을 컷 없는 한 장면으로 그림(값은 예시).
사용: python3 examples/build-motion-canvas.py  → examples/motion-canvas.src.html
묶기: python3 scripts/inline-motion.py examples/motion-canvas.src.html examples/motion-canvas.html
열 때 P 키 또는 주소 끝 ?auto=1 로 자동 재생"""
import json, math, pathlib

HERE = pathlib.Path(__file__).resolve().parent


def h(i):
    x = math.sin(i * 127.1 + 11.7) * 43758.5453
    return x - math.floor(x)


TOK = ["삼각형", "넓이", "공식", "은?"]
CHX = [-435, -145, 145, 435]
VEC = [[round(.18 + .82 * h(i * 31 + j * 7 + 3), 3) for j in range(10)] for i in range(4)]
AVG = [round(sum(v[j] for v in VEC) / 4, 3) for j in range(10)]
M = [("Gemini 3 Flash", .40, .02), ("DeepSeek V4 Flash", .55, .03), ("DeepSeek V4 Pro", .90, .15)]
MX, MY, VY = 1280, [170, 470, 770], 470

els = [{"id": "q", "type": "pill", "x": 0, "y": 0, "w": 760, "h": 96, "text": "삼각형 넓이 공식은?", "typed": True, "button": True, "parts": TOK}]
els += [{"id": f"t{i}", "type": "card", "x": CHX[i], "y": 170, "w": 250, "h": 150, "bars": VEC[i]} for i in range(4)]
els += [{"id": "vq", "type": "card", "x": 0, "y": VY, "w": 624, "h": 196, "fs": 30, "t": "질문 벡터", "note": "숫자 768개", "bars": AVG},
        {"id": "avg", "type": "chip", "x": -222, "y": VY - 136, "s": "칸마다 평균"},
        {"id": "ex", "type": "text", "x": 250, "y": VY + 128, "s": "값은 예시", "fs": 22}]
els += [{"id": f"w{i}", "type": "wire", "from": "vq", "to": f"m{i}"} for i in range(3)]
els += [{"id": f"m{i}", "type": "card", "x": MX, "y": MY[i], "w": 640, "h": 220, "t": nm, "sub": "정답 확률", "v": p, "d": 2, "max": 1} for i, (nm, p, c) in enumerate(M)]
els += [{"id": "tg", "type": "toggle", "x": MX + 110, "y": -14, "w": 420, "label": "비용 반영 (λ)"}]
els += [{"id": f"c{i}", "type": "chip", "tone": "line", "fs": 23, "x": MX + 170, "y": MY[i] - 58, "s": f"− λ × 비용 {c:.2f}"} for i, (nm, p, c) in enumerate(M)]
els += [{"id": "pk", "type": "chip", "tone": "white", "x": MX + 228, "y": MY[2] - 66, "s": "선택"},
        {"id": "tag", "type": "chip", "tone": "accent", "fs": 32, "x": 612, "y": 0, "s": "→ DeepSeek V4 Pro"}]

beats = [
    {"dur": 2.4, "cam": [0, 0, 1.62], "set": {"q": {}}, "cap": "질문 한 건이 들어옴"},
    {"dur": 1.9, "click": "q", "clickAt": .7, "cam": [0, 74, 1.2], "set": {"q": {"split": 1}}, "step": 0, "cap": "토큰으로 자르고 토큰마다 숫자 벡터를 붙임"},
    {"dur": 2.4, "stagger": .12, "set": {f"t{i}": {} for i in range(4)}, "cap": "토큰으로 자르고 토큰마다 숫자 벡터를 붙임"},
    {"dur": 3.5, "cam": [0, 520, 1.32], "stagger": .05, "set": {**{f"t{i}": {"x": (i - 1.5) * 20, "y": VY + 10} for i in range(4)}, "vq": {"_d": .6}, "avg": {"_d": 1.3}},
     "hide": [f"t{i}" for i in range(4)], "step": 1, "cap": "칸마다 평균을 내 벡터 하나로 줄임"},
    {"dur": 4.4, "cam": [645, 448, .875], "set": {**{f"w{i}": {"_d": .3 + i * .1} for i in range(3)}, **{f"m{i}": {"_d": .5 + i * .2} for i in range(3)}, "ex": {"_d": 1.4}, "tg": {"_d": 2.6}},
     "hide": ["avg"], "step": 2, "cap": "모델마다 정답 확률을 냄"},
    {"dur": 2.2, "click": "tg", "clickAt": 1.1, "cam": [1090, 446, .93], "set": {"tg": {"on": 1}, **{f"c{i}": {"_d": .4 + i * .1} for i in range(3)}}, "cap": "확률에서 λ × 비용을 뺌"},
    {"dur": 2.0, "set": {**{f"c{i}": {"y": MY[i] + 40, "_d": i * .08} for i in range(3)}, **{f"m{i}": {"v": round(p - c, 2), "sub": "점수 = 정답 확률 − λ × 비용", "_d": .1 + i * .08} for i, (nm, p, c) in enumerate(M)}},
     "hide": [f"c{i}" for i in range(3)], "cap": "확률에서 λ × 비용을 뺌"},
    {"dur": 1.8, "cam": [1262, 742, 1.46], "set": {"m2": {"on": 1, "_d": 0}, "m0": {"a": .5, "_d": 0}, "m1": {"a": .5, "_d": 0}, "w2": {"hot": 1, "_d": 0}, "w0": {"a": .45, "_d": 0}, "w1": {"a": .45, "_d": 0}, "pk": {"_d": .35}},
     "cap": "점수가 가장 큰 모델로 보냄"},
    {"dur": 3.2, "cam": [560, 400, .735], "camMove": 1.2, "set": {"q": {"split": 0, "_d": 1.0}, "tag": {"_d": 1.7}}, "step": None, "cap": "질문 한 건의 모델이 정해짐"},
]
data = {"title": "질문 한 건이 라우터를 지나는 과정", "kicker": "캔버스 장면", "way": "따라가기", "steps": ["Encoder", "Pooling", "Routing head"], "els": els, "beats": beats}

head = (HERE / "motion-demo.src.html").read_text(encoding="utf8").split('<section class="slide active">')[0].replace("움직임 장면 데모", "캔버스 장면 예시")
scene = f'<section class="slide active" data-motion="canvas"><script type="application/json">{json.dumps(data, ensure_ascii=False)}</script></section>'
tail = '</div></div>\n<script>/*DM-BOOT*/</script><script>/*DM-JS*/</script>\n<script>DeckMotion.init({look:"mg"});</script></body></html>\n'
out = HERE / "motion-canvas.src.html"
out.write_text(head + scene + tail, encoding="utf8")
print(out)
