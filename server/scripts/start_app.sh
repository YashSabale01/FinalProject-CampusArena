#!/bin/bash
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== ApplicationStart: $(date) ==="

# Install Node.js 18 if missing
if ! command -v node &>/dev/null; then
  echo "Installing Node.js 18..."
  curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
  dnf install -y nodejs --skip-broken
fi

# Install PM2 if missing
if ! command -v pm2 &>/dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

echo "Node: $(node -v) | PM2: $(pm2 -v)"

APP_DIR=/opt/campusarena/server

# Verify .env exists before starting
if [ ! -f $APP_DIR/.env ]; then
  echo "ERROR: .env file missing at $APP_DIR/.env — cannot start app"
  exit 1
fi

cd $APP_DIR

# Stop existing processes
pm2 stop campusarena-backend 2>/dev/null || true
pm2 delete campusarena-backend 2>/dev/null || true

# Start the app
pm2 start npm --name "campusarena-backend" -- start
pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save

# Wait a moment then verify it's still running (not crashed)
sleep 3
STATUS=$(pm2 list | grep campusarena-backend | grep -c "online" || echo "0")
if [ "$STATUS" = "0" ]; then
  echo "ERROR: App crashed after start. Logs:"
  pm2 logs campusarena-backend --lines 20 --nostream
  exit 1
fi

echo "App is online"
pm2 list
echo "=== ApplicationStart complete ==="
