#!/usr/bin/env bash
# motion-capture.sh — 움직임 덱의 멈춤 지점 검사, PNG, PDF, 영상 출력
#   motion-capture.sh <덱 URL> <출력 폴더> [--video 파일.mp4] [--fps 30] [--pdf 파일.pdf] [--size 1920x1080]
# 필요: gstack browse(또는 BROWSE 환경변수), FFmpeg(영상)
set -euo pipefail
URL=$1; OUT=$2; shift 2
VIDEO=""; FPS=30; PDF=""; SIZE=1920x1080
while [ $# -gt 0 ]; do case "$1" in --video) VIDEO=$2; shift 2;; --fps) FPS=$2; shift 2;; --pdf) PDF=$2; shift 2;; --size) SIZE=$2; shift 2;; *) echo "알 수 없는 옵션 $1"; exit 2;; esac; done
B=${BROWSE:-$HOME/.claude/skills/gstack/browse/dist/browse}
mkdir -p "$OUT/stops"
export BROWSE_STATE_FILE="$OUT/.browse-state.json"   # 다른 세션과 브라우저를 나눠 쓰지 않음
trap '"$B" stop >/dev/null 2>&1 || true' EXIT
"$B" viewport "$SIZE" >/dev/null
"$B" goto "$URL" >/dev/null
sleep 1.5
val(){ "$B" js "$1" | sed -e '/UNTRUSTED/d' | tail -1; }
ISSUES=$(val "JSON.stringify(deckMotion.check())")
echo "$ISSUES" > "$OUT/check.json"
COUNT=$(python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print(len(d));[print(' ',o['stop'],o['kind'],o['text']) for o in d]" "$OUT/check.json")
echo "검사 결과: $COUNT"
N=$(val "deckMotion.stops.length")
for i in $(seq 0 $((N-1))); do "$B" js "deckMotion.goStop($i);1" >/dev/null; sleep .1; "$B" screenshot "$OUT/stops/$(printf %03d $i).png" >/dev/null; done
echo "멈춤 지점 ${N}장: $OUT/stops"
if [ -n "$PDF" ]; then
  W=${SIZE%x*}; H=${SIZE#*x}; PAGE="$OUT/stops/pages.html"
  { echo "<!doctype html><style>@page{size:${W}px ${H}px;margin:0}body{margin:0}img{display:block;width:${W}px;height:${H}px;break-after:page}</style>"; for f in "$OUT"/stops/*.png; do echo "<img src=\"$(basename "$f")\">"; done; } > "$PAGE"
  PORT=$(python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',0));print(s.getsockname()[1]);s.close()")
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$OUT/stops" >/dev/null 2>&1 & SRV=$!; sleep .6
  "$B" goto "http://127.0.0.1:$PORT/pages.html" >/dev/null; sleep 1; "$B" pdf "$PDF" >/dev/null; kill "$SRV" 2>/dev/null || true; echo "PDF $PDF"
  "$B" goto "$URL" >/dev/null; sleep 1
fi
if [ -n "$VIDEO" ]; then
  DUR=$(val "deckMotion.duration"); TOTAL=$(python3 -c "print(int(float('$DUR')*$FPS))"); mkdir -p "$OUT/frames"
  for i in $(seq 0 $((TOTAL-1))); do T=$(python3 -c "print($i/$FPS)"); "$B" js "deckMotion.seek($T);1" >/dev/null; "$B" screenshot "$OUT/frames/$(printf %06d $i).png" >/dev/null; done
  ffmpeg -v error -y -framerate "$FPS" -i "$OUT/frames/%06d.png" -pix_fmt yuv420p "$VIDEO"; echo "영상 $VIDEO ${DUR}초"
fi
