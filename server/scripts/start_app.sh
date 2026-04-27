#!/bin/bash
# =============================================================================
# scripts/start_app.sh
# CodeDeploy ApplicationStart hook
# =============================================================================
set -e
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== ApplicationStart: $(date) ==="
 
# Ensure Node.js is installed (safety net for fresh instances)
if ! command -v node &>/dev/null; then
  echo "Node.js not found — installing..."
  curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
  dnf install -y nodejs --skip-broken
fi
 
# Ensure PM2 is installed
if ! command -v pm2 &>/dev/null; then
  echo "PM2 not found — installing..."
  npm install -g pm2
fi
 
echo "Node: $(node -v) | PM2: $(pm2 -v)"
 
APP_DIR=/opt/campusarena/server
 
cd $APP_DIR
 
# Stop existing app if running
pm2 stop campusarena-backend 2>/dev/null || true
pm2 delete campusarena-backend 2>/dev/null || true
 
# Start with PM2
pm2 start npm --name "campusarena-backend" -- start
pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save
 
echo "PM2 status:"
pm2 list
 
echo "=== ApplicationStart complete ==="
