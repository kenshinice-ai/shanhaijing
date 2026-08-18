#!/usr/bin/env bash
set -Eeuo pipefail

# 山海经 Atlas · 静态化部署(零服务器)
#
# 产出一个完全自包含的静态站点(apps/web/dist),可托管到任何静态平台:
# Cloudflare Pages / Netlify / GitHub Pages / 任意对象存储 + CDN。
#
# 前置条件:本地 API + 数据库在运行(用于烘焙数据):
#   cd apps/api && DATABASE_URL=postgresql://…/shanhaijing_atlas API_PORT=4100 npx tsx src/index.ts
#
# 用法:
#   bash deploy/deploy-static.sh              # 烘焙 + 构建,产出 dist
#   bash deploy/deploy-static.sh --publish cf # 构建后用 wrangler 发布 Cloudflare Pages

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

API_URL="${BAKE_API_URL:-http://localhost:4100}"
CF_PROJECT="${CF_PROJECT:-shanhaijing-atlas}"
PROBE="atlas.shanhaijing.zh-CN.json"
PUBLISH=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --publish) PUBLISH="${2:-}"; shift 2 ;;
    *) echo "未知参数:$1" >&2; exit 1 ;;
  esac
done

echo "[1/5] 检查本地 API(烘焙数据源):$API_URL"
if ! curl -sf "$API_URL/health" > /dev/null; then
  echo "错误:API 未运行。先启动 API,再重试。" >&2
  exit 1
fi

# 烘焙暂存目录每次清空。上一代仓库让多个图集共用这个目录且从不清理,
# 结果任何一个图集的 dist 都会带上其他图集的 JSON 与媒体。
echo "[2/5] 清空烘焙暂存目录"
rm -rf "$ROOT/apps/web/public/data"

echo "[3/5] 烘焙静态数据(works + full atlas,双语)"
npm run bake:static -w @shanhaijing/api -- --api "$API_URL"

echo "[4/5] 静态模式构建(VITE_DATA_MODE=static,相对资源路径)"
VITE_DATA_MODE=static npm run build -w @shanhaijing/web -- --base=./

DIST="$ROOT/apps/web/dist"
echo "[5/5] 产物检查:$DIST"
test -f "$DIST/index.html"
test -f "$DIST/data/$PROBE"
test -f "$DIST/media/shanhaijing/artistic-overview-v1.svg"
if grep -rl "localhost:" "$DIST/assets" > /dev/null 2>&1; then
  echo "错误:产物中残留 localhost API 地址,静态模式未生效。" >&2
  exit 1
fi
# 单图集产物不应含任何其他图集的数据。
if ls "$DIST/data" | grep -v "^atlas\.shanhaijing\.\|^works\." > /dev/null 2>&1; then
  echo "错误:dist/data 含非山海经数据。" >&2
  ls "$DIST/data" >&2
  exit 1
fi
du -sh "$DIST"
echo "静态站点就绪。本地预览:npx vite preview --outDir apps/web/dist"

case "$PUBLISH" in
  cf)      npx wrangler pages deploy "$DIST" --project-name "$CF_PROJECT" --branch main ;;
  netlify) npx netlify deploy --dir "$DIST" --prod ;;
  "")      echo "未指定 --publish;把 dist 上传到任意静态托管即可。" ;;
  *)       echo "未知发布目标:$PUBLISH(支持 cf / netlify)" >&2; exit 1 ;;
esac
