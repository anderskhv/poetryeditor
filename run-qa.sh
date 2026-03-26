#!/usr/bin/env bash
#
# Visual QA runner for Poetry Editor
# Starts dev server, runs screenshot tests, stops server.
#
# Usage:
#   ./run-qa.sh                     # All pages
#   QA_PAGES=home,editor ./run-qa.sh  # Subset
#
set -euo pipefail
cd "$(dirname "$0")"

SCREENSHOT_DIR="e2e/screenshots"
PORT=5199

echo "=== Poetry Editor Visual QA ==="
echo ""

# Install playwright browsers if needed
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

# Start dev server in background
echo "Starting dev server on port $PORT..."
npm run dev -- --port $PORT --strictPort &
DEV_PID=$!

# Wait for server to be ready
echo "Waiting for dev server..."
for i in $(seq 1 30); do
  if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
    echo "Dev server ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Dev server failed to start within 30 seconds."
    kill $DEV_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# Run the visual QA tests
echo ""
echo "Running visual QA screenshots..."
BASE_URL="http://localhost:$PORT" npx playwright test e2e/visual-qa.spec.ts --reporter=list || true

# Stop dev server
echo ""
echo "Stopping dev server..."
kill $DEV_PID 2>/dev/null || true
wait $DEV_PID 2>/dev/null || true

# Summary
echo ""
echo "=== Done ==="
if [ -d "$SCREENSHOT_DIR" ]; then
  COUNT=$(find "$SCREENSHOT_DIR" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
  echo "Screenshots: $COUNT files in $SCREENSHOT_DIR/"
  ls -la "$SCREENSHOT_DIR"/*.png 2>/dev/null || echo "(no screenshots found)"
fi
