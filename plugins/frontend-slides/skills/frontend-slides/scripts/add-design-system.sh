#!/usr/bin/env bash
# add-design-system.sh — pull DESIGN.md files from getdesign.md's open catalog
# (VoltAgent/awesome-design-md) into the frontend-slides design-system library.
#
# No node/npx required — pure curl. Mirrors `npx getdesign add <brand>`.
#
#   add-design-system.sh --list                 list all available brands
#   add-design-system.sh --all                  fetch EVERY brand in the catalog
#   add-design-system.sh linear.app             fetch one brand
#   add-design-system.sh stripe vercel notion    fetch several
#   add-design-system.sh --force apple           re-fetch even if it exists
#   add-design-system.sh --force --all           re-fetch the whole catalog
#
set -euo pipefail

REPO="VoltAgent/awesome-design-md"
RAW="https://raw.githubusercontent.com/${REPO}/main/design-md"
API="https://api.github.com/repos/${REPO}/contents/design-md"
# 저장 위치: env → 플러그인 번들(../design-systems) → 개인 라이브러리
_self_dir="$(cd "$(dirname "$0")" && pwd)"
_bundled="$(cd "$_self_dir/.." && pwd)/design-systems"
DEST="${DESIGN_SYSTEMS_DIR:-$( [ -d "$_bundled" ] && printf '%s' "$_bundled" || printf '%s' "$HOME/.claude/design-systems" )}"

force=0
do_list=0
do_all=0
args=()
for a in "$@"; do
  case "$a" in
    --force|-f) force=1 ;;
    --list|-l)  do_list=1 ;;
    --all|-a)   do_all=1 ;;
    --help|-h)  sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*)         echo "unknown flag: $a" >&2; exit 2 ;;
    *)          args+=("$a") ;;
  esac
done

# Normalize a remote folder name to a local filename slug (linear.app -> linear).
slug() { printf '%s' "$1" | sed -E 's/\.(app|ai|com|io|md)$//'; }

# Resolve a GitHub token: explicit env var → gh CLI login token → none.
# The contents API is rate-limited to 60 req/hr for unauthenticated callers.
resolve_token() {
  local t="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
  if [ -z "$t" ] && command -v gh >/dev/null 2>&1; then
    t="$(gh auth token 2>/dev/null || true)"
  fi
  printf '%s' "$t"
}

# Echo every brand folder name (one per line) from the catalog, or fail (rc=1)
# with a helpful message on stderr.
list_brands() {
  local token auth=() tmp code
  token="$(resolve_token)"
  [ -n "$token" ] && auth=(-H "Authorization: Bearer $token")

  tmp="$(mktemp)"
  # ${arr[@]+"${arr[@]}"} = expand safely even when empty (bash 3.2 + set -u).
  code=$(curl -sSL ${auth[@]+"${auth[@]}"} -H "Accept: application/vnd.github+json" \
    -w '%{http_code}' "$API" -o "$tmp" 2>/dev/null) || code=000

  if [ "$code" != 200 ]; then
    rm -f "$tmp"
    echo "Could not reach the catalog (HTTP ${code}) — the GitHub API is likely rate-limited." >&2
    echo "Fixes:" >&2
    echo "  • gh auth login                  then retry (uses gh's token automatically)" >&2
    echo "  • or export GITHUB_TOKEN=<token>  then retry (raises the API limit)" >&2
    echo "  • or browse the catalog: https://github.com/${REPO}/tree/main/design-md" >&2
    echo "  • fetching by name still works without the catalog: add-design-system.sh linear.app" >&2
    return 1
  fi

  grep -oE '"name":[[:space:]]*"[^"]+"' "$tmp" \
    | sed -E 's/.*"([^"]+)"$/\1/' | sort
  rm -f "$tmp"
}

# --list — just show the catalog and exit.
if [ "$do_list" -eq 1 ]; then
  echo "Available brands (getdesign.md / ${REPO}):"
  list_brands | { pr -3 -t -w 80 2>/dev/null || sed 's/^/  /'; }
  echo
  echo "Fetch one:  add-design-system.sh <brand>"
  echo "Fetch all:  add-design-system.sh --all"
  exit 0
fi

# --all — resolve the full brand list, then fall through to the fetch loop.
if [ "$do_all" -eq 1 ]; then
  echo "Resolving full catalog…" >&2
  # Read brand names into args (portable, no mapfile — bash 3.2 friendly).
  while IFS= read -r b; do [ -n "$b" ] && args+=("$b"); done < <(list_brands)
  echo "Fetching ${#args[@]} brand(s) → $DEST" >&2
fi

if [ "${#args[@]}" -eq 0 ]; then
  echo "usage: add-design-system.sh [--list] [--all] [--force] <brand> [brand...]" >&2
  exit 2
fi

mkdir -p "$DEST"
ok=0; fail=0; skip=0
for brand in "${args[@]}"; do
  name="$(slug "$brand")"
  out="$DEST/${name}.md"
  if [ -e "$out" ] && [ "$force" -eq 0 ]; then
    printf "skip   %-14s (exists — use --force to overwrite)\n" "$name.md"
    skip=$((skip+1)); continue
  fi
  tmp="$(mktemp)"
  if code=$(curl -fsSL -w '%{http_code}' "$RAW/${brand}/DESIGN.md" -o "$tmp" 2>/dev/null) && [ "$code" = 200 ]; then
    mv "$tmp" "$out"
    printf "added  %-14s (%s bytes)\n" "$name.md" "$(wc -c < "$out" | tr -d ' ')"
    ok=$((ok+1))
  else
    rm -f "$tmp"
    printf "FAIL   %-14s (HTTP %s — check name; try --list)\n" "$brand" "${code:-?}"
    fail=$((fail+1))
  fi
done

echo "---"
echo "added $ok, skipped $skip, failed $fail  ->  $DEST"
[ "$fail" -eq 0 ]
