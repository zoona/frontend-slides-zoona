#!/usr/bin/env python3
"""모션 덱 표현 다양성 점검. 장마다 장면, 설명 방식(way), 쓴 효과를 표로 뽑고 반복 패턴을 알린다.
사용: python3 scripts/motion-variety.py <덱.src.html 또는 .html>  (--strict면 알림이 있을 때 종료 코드 1)
기준은 MOTION_WAYS.md "덱 구성표"."""
import json, re, sys, html as H

src = open(sys.argv[1], encoding="utf8").read()
strict = "--strict" in sys.argv
secs = re.findall(r'<section class="slide[^"]*"([^>]*)>(.*?)</section>', src, re.S)

BEAT_FX = ["cam", "spot", "focus", "cap", "flash", "bg", "retone", "again", "cut"]
EL_FX = {"enter": "등장 방향", "exit": "퇴장", "path": "경로 이동", "vease": "값 곡선", "write": "다시 쓰기", "em": "강조어"}
TYPES = {"icon": "사물 그림", "burst": "흩어짐", "gauge": "계기판"}

rows, warns = [], []
for i, (attrs, body) in enumerate(secs, 1):
    m = re.search(r'data-motion="(\w+)"', attrs)
    kind = m.group(1) if m else "일반"
    data = {}
    j = re.search(r'<script type="application/json">(.*?)</script>', body, re.S)
    if j:
        try:
            data = json.loads(j.group(1))
        except Exception:
            data = {}
    enter = data.get("enter") or (re.search(r'data-enter="(\w+)"', attrs) or [None, None])[1]
    beats = data.get("beats") or []
    used = set()
    blob = json.dumps({k: v for k, v in data.items() if k != "enter"}, ensure_ascii=False)
    for k in BEAT_FX:
        if any(isinstance(b, dict) and k in b for b in beats) or (k in ("cap", "flash", "bg", "spot") and any(k in (f or {}) for f in data.get("fx") or [])):
            used.add(k)
    for k, nm in EL_FX.items():
        if f'"{k}"' in blob:
            used.add(nm)
    for t, nm in TYPES.items():
        if f'"type": "{t}"' in blob or f'"type":"{t}"' in blob:
            used.add(nm)
    if data.get("zoom"):
        used.add("줌 허브")
    if enter:
        used.add(f"전환 {enter}")
    notes = sum(1 for b in beats if isinstance(b, dict) and (b.get("note") or {}).get("big"))
    rows.append({"n": i, "kind": kind, "way": data.get("way", ""), "beats": len(beats) or (1 if kind == "일반" else 0), "fx": sorted(used), "notes": notes, "enter": enter})

print(f"{'장':>3}  {'장면':<9}{'설명 방식':<14}{'비트':>4}  효과")
for r in rows:
    print(f"{r['n']:>3}  {r['kind']:<9}{r['way']:<14}{r['beats']:>4}  {', '.join(r['fx'])}")

sc = [r for r in rows if r["kind"] != "일반"]
for a in range(len(rows) - 2):
    k = {rows[a + d]["kind"] for d in range(3)}
    w = [rows[a + d]["way"] for d in range(3)]
    if len(k) == 1 and "일반" not in k and (not all(w) or len(set(w)) < 3):
        warns.append(f"{rows[a]['n']}~{rows[a]['n']+2}장: 같은 장면({rows[a]['kind']}) 세 장 연속")
ways = [r["way"] for r in sc if r["way"]]
for a in range(len(ways) - 2):
    if ways[a] == ways[a + 1] == ways[a + 2]:
        warns.append(f"설명 방식 '{ways[a]}' 세 장 연속")
if len(sc) >= 5:
    if len(set(ways)) < 4:
        warns.append(f"설명 방식 {len(set(ways))}가지 (장면 장 {len(sc)}장이면 4가지 이상). 장 JSON에 way가 없으면 구성표부터")
    allfx = set().union(*[set(r["fx"]) for r in sc]) if sc else set()
    if len(allfx) < 5:
        warns.append(f"효과 {len(allfx)}가지만 씀: {', '.join(sorted(allfx)) or '없음'}")
nb = sum(r["beats"] for r in sc)
nn = sum(r["notes"] for r in sc)
if nb and nn / nb > .4:
    warns.append(f"큰 숫자 note가 비트 {nb}개 중 {nn}개. 몇 장, 한 가지 뜻에만")
flashes = sum(1 for r in sc if "flash" in r["fx"]) + sum(1 for r in rows if r["enter"] in ("flash", "black"))
if flashes > 3:
    warns.append(f"섬광과 검은 화면 {flashes}회. 덱당 2~3회 안쪽")
fl = [r for r in sc if r["kind"] == "flow"]
if len(sc) >= 4 and len(fl) * 2 > len(sc):
    warns.append(f"flow가 장면 장 {len(sc)}장 중 {len(fl)}장")

print()
print("알림 없음" if not warns else "\n".join("! " + w for w in warns))
sys.exit(1 if strict and warns else 0)
