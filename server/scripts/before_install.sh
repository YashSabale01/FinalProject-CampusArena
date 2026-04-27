#!/bin/bash
set -e
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== BeforeInstall: $(date) ==="

if command -v pm2 &>/dev/null; then
  echo "Stopping PM2 app..."
  pm2 stop campusarena-backend 2>/dev/null || true
  pm2 delete campusarena-backend 2>/dev/null || true
fi

if [ -f /opt/campusarena/server/.env ]; then
  echo "Backing up .env..."
  cp /opt/campusarena/server/.env /tmp/campusarena.env.bak
fi

echo "=== BeforeInstall complete ==="
