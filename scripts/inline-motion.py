#!/usr/bin/env python3
"""덱 HTML의 표식 자리에 공용 CSS와 런타임을 넣어 단일 파일로 만든다.
표식: /*DM-BASE-CSS*/ /*DM-CSS*/ /*DM-JS*/  사용: inline-motion.py 입력.html 출력.html"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src, dst = sys.argv[1], sys.argv[2]
html = pathlib.Path(src).read_text(encoding="utf8")
base = (root / "viewport-base.css").read_text(encoding="utf8")
boot = re.search(r"<script>\s*(\(function \(\) \{.*?\}\)\(\);?)\s*</script>", base, re.S)
parts = {
    "/*DM-BASE-CSS*/": base,
    "/*DM-CSS*/": (root / "motion/deck-motion.css").read_text(encoding="utf8"),
    "/*DM-BOOT*/": boot.group(1) if boot else "",
    "/*DM-JS*/": (root / "motion/deck-motion.js").read_text(encoding="utf8"),
}
for k, v in parts.items():
    html = html.replace(k, v)
pathlib.Path(dst).write_text(html, encoding="utf8")
print(f"{dst} {len(html.encode())//1024}KB")
