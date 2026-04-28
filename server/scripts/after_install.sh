#!/bin/bash
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== AfterInstall: $(date) ==="

APP_DIR=/opt/campusarena/server
REGION="ap-south-1"

# Ensure directories exist
mkdir -p $APP_DIR/uploads
chmod 755 $APP_DIR/uploads

# Try to get secrets from SSM Parameter Store
echo "Fetching secrets from SSM..."
MONGODB_URI=$(aws ssm get-parameter --name /campusarena/MONGODB_URI --region $REGION --query Parameter.Value --output text 2>/dev/null)
JWT_SECRET=$(aws ssm get-parameter --name /campusarena/JWT_SECRET --region $REGION --query Parameter.Value --output text 2>/dev/null)
STRIPE_PK=$(aws ssm get-parameter --name /campusarena/STRIPE_PUBLISHABLE_KEY --region $REGION --query Parameter.Value --output text 2>/dev/null)
STRIPE_SK=$(aws ssm get-parameter --name /campusarena/STRIPE_SECRET_KEY --region $REGION --query Parameter.Value --output text 2>/dev/null)

# If SSM worked, write fresh .env
if [ -n "$MONGODB_URI" ]; then
  echo "Writing .env from SSM..."
  cat > $APP_DIR/.env << ENVEOF
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://d1ua6bzb34kwo5.cloudfront.net
DEFAULT_ADMIN_PASSWORD=Admin@123
STRIPE_PUBLISHABLE_KEY=${STRIPE_PK}
STRIPE_SECRET_KEY=${STRIPE_SK}
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
AWS_REGION=${REGION}
ENVEOF
  echo ".env written from SSM successfully"

# SSM failed — try backup from before_install
elif [ -f /tmp/campusarena.env.bak ]; then
  echo "SSM failed — restoring .env from backup"
  cp /tmp/campusarena.env.bak $APP_DIR/.env
  echo "=== AfterInstall complete (from backup) ==="

# Both failed — cannot proceed safely
else
  echo "ERROR: SSM fetch failed and no backup found."
  echo "Fix: ensure EC2 IAM role has ssm:GetParameter permission for /campusarena/* in ap-south-1"
  echo "Then retry the deployment."
  exit 1
fi

chmod 600 $APP_DIR/.env
chown -R ec2-user:ec2-user $APP_DIR
chmod 600 $APP_DIR/.env

echo "=== AfterInstall complete ==="
