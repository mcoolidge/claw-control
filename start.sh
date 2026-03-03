#!/bin/bash
# start.sh — Start claw-control services
# Access at: http://192.168.8.199:3030 (local) or http://100.117.182.100:3030 (Tailscale)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🦞 Starting Claw Control..."

# Start memory service in background
echo "  → Memory service on :8765"
cd "$SCRIPT_DIR/memory-service"
nohup python3 main.py > /tmp/claw-memory.log 2>&1 &
echo $! > /tmp/claw-memory.pid

# Start Next.js app on 0.0.0.0 (network accessible)
echo "  → Web app on :3030"
cd "$SCRIPT_DIR"
nohup npx next start -H 0.0.0.0 -p 3030 > /tmp/claw-control.log 2>&1 &
echo $! > /tmp/claw-control.pid

sleep 2
echo ""
echo "✅ Claw Control running:"
echo "   Web:    http://192.168.8.199:3030"
echo "   Memory: http://192.168.8.199:8765"
echo "   (Also on Tailscale: http://100.117.182.100:3030)"
echo ""
echo "Logs: tail -f /tmp/claw-control.log /tmp/claw-memory.log"
echo "Stop: $SCRIPT_DIR/stop.sh"
