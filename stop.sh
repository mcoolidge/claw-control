#!/bin/bash
# stop.sh — Stop claw-control services

echo "Stopping Claw Control..."

for pid_file in /tmp/claw-memory.pid /tmp/claw-control.pid; do
  if [ -f "$pid_file" ]; then
    PID=$(cat "$pid_file")
    kill "$PID" 2>/dev/null && echo "  Stopped PID $PID" || echo "  PID $PID not running"
    rm -f "$pid_file"
  fi
done

echo "Done."
