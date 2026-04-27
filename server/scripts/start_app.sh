#!/bin/bash
set -e
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== ApplicationStart: $(date) ==="

APP_DIR=/opt/campusarena/server

cd $APP_DIR

pm2 start npm --name "campusarena-backend" -- start
pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save

echo "PM2 status:"
pm2 list

echo "=== ApplicationStart complete ==="
