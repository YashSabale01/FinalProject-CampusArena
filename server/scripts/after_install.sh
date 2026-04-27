#!/bin/bash
set -e
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== AfterInstall: $(date) ==="

APP_DIR=/opt/campusarena/server

if [ -f /tmp/campusarena.env.bak ]; then
  echo "Restoring .env from backup..."
  cp /tmp/campusarena.env.bak $APP_DIR/.env
  chmod 600 $APP_DIR/.env
else
  echo "WARNING: No .env backup found. Secrets may be missing."
  echo "Run the stack's UserData logic or manually create $APP_DIR/.env"
fi

mkdir -p $APP_DIR/uploads
chmod 755 $APP_DIR/uploads

chown -R ec2-user:ec2-user $APP_DIR

echo "=== AfterInstall complete ==="
