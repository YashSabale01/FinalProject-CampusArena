#!/bin/bash
# =============================================================================
# scripts/start_app.sh
# CodeDeploy ApplicationStart hook
# =============================================================================
set -e
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== ApplicationStart: $(date) ==="
 
APP_DIR=/opt/campusarena/server
 
# ---------------------------------------------------------------------------
# Safety net: ensure Node.js is installed
# ---------------------------------------------------------------------------
if ! command -v node &>/dev/null; then
  echo "Node.js not found — installing..."
  curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
  dnf install -y nodejs
fi
 
# ---------------------------------------------------------------------------
# Safety net: ensure PM2 is installed
# ---------------------------------------------------------------------------
if ! command -v pm2 &>/dev/null; then
  echo "PM2 not found — installing..."
  npm install -g pm2
fi
 
echo "Node: $(node -v) | NPM: $(npm -v) | PM2: $(pm2 -v)"
 
# ---------------------------------------------------------------------------
# Verify the app directory and entry point exist before starting
# ---------------------------------------------------------------------------
cd "$APP_DIR"
 
# Detect entry point — check common names in order of preference
if [ -f "server.js" ]; then
  ENTRY="server.js"
elif [ -f "index.js" ]; then
  ENTRY="index.js"
elif [ -f "app.js" ]; then
  ENTRY="app.js"
else
  echo "ERROR: No entry point found in $APP_DIR (tried server.js, index.js, app.js)"
  echo "Files present:"
  ls -la "$APP_DIR"
  exit 1
fi
 
echo "Entry point: $ENTRY"
 
# Verify .env exists and has MONGODB_URI (basic sanity check)
if [ ! -f "$APP_DIR/.env" ]; then
  echo "ERROR: .env file missing. AfterInstall hook may have failed."
  exit 1
fi
 
if ! grep -q "^MONGODB_URI=." "$APP_DIR/.env"; then
  echo "WARNING: MONGODB_URI appears empty in .env — app may fail to connect to MongoDB."
fi
 
# ---------------------------------------------------------------------------
# Stop and remove any existing PM2 process for a clean start
# ---------------------------------------------------------------------------
pm2 stop campusarena-backend 2>/dev/null || true
pm2 delete campusarena-backend 2>/dev/null || true
 
# ---------------------------------------------------------------------------
# Start app directly with the entry file (more reliable than npm start)
# ---------------------------------------------------------------------------
pm2 start "$ENTRY" \
  --name "campusarena-backend" \
  --env production \
  --update-env
 
# ---------------------------------------------------------------------------
# Register PM2 as a systemd service so it survives reboots
# pm2 startup prints a command that must be executed — capture and run it
# ---------------------------------------------------------------------------
echo "Registering PM2 as systemd service..."
PM2_STARTUP_CMD=$(pm2 startup systemd -u root --hp /root 2>&1 | grep "sudo" | tail -1 || true)
 
if [ -n "$PM2_STARTUP_CMD" ]; then
  echo "Running: $PM2_STARTUP_CMD"
  eval "$PM2_STARTUP_CMD" || true
else
  env PATH="$PATH:/usr/bin" pm2 startup systemd -u root --hp /root || true
fi
 
# Save the current PM2 process list so it restarts after reboot
pm2 save --force
 
# ---------------------------------------------------------------------------
# Final status check — if app is not online, fail the deployment explicitly
# ---------------------------------------------------------------------------
sleep 3
 
PM2_STATUS=$(pm2 jlist 2>/dev/null | python3 -c "
import sys, json
procs = json.load(sys.stdin)
for p in procs:
    if p.get('name') == 'campusarena-backend':
        print(p.get('pm2_env', {}).get('status', 'unknown'))
        break
else:
    print('not_found')
" 2>/dev/null || echo "unknown")
 
echo "PM2 process status: $PM2_STATUS"
 
if [ "$PM2_STATUS" != "online" ]; then
  echo "ERROR: campusarena-backend is not online (status: $PM2_STATUS)"
  echo "--- PM2 logs (last 30 lines) ---"
  pm2 logs campusarena-backend --lines 30 --nostream 2>/dev/null || true
  exit 1
fi
 
echo "PM2 process list:"
pm2 list
 
echo "=== ApplicationStart complete — app is running ==="
