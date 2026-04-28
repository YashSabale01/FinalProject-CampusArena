#!/bin/bash
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== BeforeInstall: $(date) ==="

# Stop PM2 gracefully if running
if command -v pm2 &>/dev/null; then
  echo "Stopping PM2..."
  pm2 stop campusarena-backend 2>/dev/null || true
  pm2 delete campusarena-backend 2>/dev/null || true
fi

# Backup .env if it exists
if [ -f /opt/campusarena/server/.env ]; then
  cp /opt/campusarena/server/.env /tmp/campusarena.env.bak
  echo ".env backed up"
fi

echo "=== BeforeInstall complete ==="
