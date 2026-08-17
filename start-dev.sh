#!/bin/bash
# Mata qualquer processo na porta 3000 antes de iniciar o Next.js
PORT=3000
PID=$(netstat -ano 2>/dev/null | grep ":$PORT " | grep LISTENING | head -1 | awk '{print $5}')
if [ -n "$PID" ] && [ "$PID" != "0" ]; then
  echo "Matando processo $PID na porta $PORT..."
  taskkill //F //PID "$PID" 2>/dev/null || kill -9 "$PID" 2>/dev/null
  sleep 1
fi
echo "Iniciando Next.js na porta $PORT..."
cd "$(dirname "$0")"
exec npx next dev -p $PORT
