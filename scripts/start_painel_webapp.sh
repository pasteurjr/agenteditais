#!/bin/bash
# Sobe o webapp Flask permanente do painel de validacao visual.
# Porta: $WEBAPP_PORT do .env (default 9876).

set -e
cd "$(dirname "$0")/.."

# Mata instancia previa, se houver
PORT="${WEBAPP_PORT:-9876}"
PIDS=$(ss -lntp 2>/dev/null | grep ":$PORT " | grep -oE "pid=[0-9]+" | cut -d= -f2 | sort -u)
for p in $PIDS; do
  echo "[start] matando processo previo PID=$p na porta $PORT"
  kill "$p" 2>/dev/null || true
done
sleep 1

cd testes/framework_visual
exec python3 -m webapp.app
