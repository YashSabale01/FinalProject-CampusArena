#!/bin/bash
# =============================================================================
# scripts/after_install.sh
# CodeDeploy AfterInstall hook
# =============================================================================
set -e
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== AfterInstall: $(date) ==="
 
APP_DIR=/opt/campusarena/server
 
# ---------------------------------------------------------------------------
# Get region from instance metadata
# ---------------------------------------------------------------------------
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region 2>/dev/null || echo "ap-south-1")
echo "Region: $REGION"
 
# ---------------------------------------------------------------------------
# .env strategy:
#   1. Try SSM Parameter Store (most up-to-date secrets)
#   2. Fall back to the .env already written by UserData on first boot
#   3. If neither has a value, log a warning but continue
# ---------------------------------------------------------------------------
 
# Fetch secrets from SSM (these must be created manually or via CloudFormation
# AWS::SSM::Parameter resources BEFORE the first deployment)
echo "Fetching secrets from SSM..."
 
MONGODB_URI=$(aws ssm get-parameter \
  --name /campusarena/MONGODB_URI \
  --with-decryption \
  --region "$REGION" \
  --query Parameter.Value \
  --output text 2>/dev/null || echo "")
 
JWT_SECRET=$(aws ssm get-parameter \
  --name /campusarena/JWT_SECRET \
  --with-decryption \
  --region "$REGION" \
  --query Parameter.Value \
  --output text 2>/dev/null || echo "")
 
STRIPE_PK=$(aws ssm get-parameter \
  --name /campusarena/STRIPE_PUBLISHABLE_KEY \
  --with-decryption \
  --region "$REGION" \
  --query Parameter.Value \
  --output text 2>/dev/null || echo "")
 
STRIPE_SK=$(aws ssm get-parameter \
  --name /campusarena/STRIPE_SECRET_KEY \
  --with-decryption \
  --region "$REGION" \
  --query Parameter.Value \
  --output text 2>/dev/null || echo "")
 
# ---------------------------------------------------------------------------
# If SSM returned empty values, fall back to the existing .env from UserData
# (UserData writes this on first boot with the CloudFormation parameter values)
# ---------------------------------------------------------------------------
if [ -z "$MONGODB_URI" ] && [ -f "$APP_DIR/.env" ]; then
  echo "SSM params not found — checking existing .env from UserData..."
  MONGODB_URI=$(grep "^MONGODB_URI=" "$APP_DIR/.env" | cut -d'=' -f2- || echo "")
  JWT_SECRET=$(grep "^JWT_SECRET=" "$APP_DIR/.env" | cut -d'=' -f2- || echo "")
  STRIPE_PK=$(grep "^STRIPE_PUBLISHABLE_KEY=" "$APP_DIR/.env" | cut -d'=' -f2- || echo "")
  STRIPE_SK=$(grep "^STRIPE_SECRET_KEY=" "$APP_DIR/.env" | cut -d'=' -f2- || echo "")
fi
 
# Warn if still empty (app will likely fail to connect to DB, but don't block deploy)
if [ -z "$MONGODB_URI" ]; then
  echo "WARNING: MONGODB_URI is empty. Ensure SSM parameter /campusarena/MONGODB_URI exists."
fi
if [ -z "$JWT_SECRET" ]; then
  echo "WARNING: JWT_SECRET is empty. Ensure SSM parameter /campusarena/JWT_SECRET exists."
fi
 
# ---------------------------------------------------------------------------
# Get CloudFront URL from CloudFormation stack outputs
# ---------------------------------------------------------------------------
CF_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name production-CampusArena \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
  --output text 2>/dev/null || echo "")
 
# Fall back to existing .env value if CF lookup failed
if [ -z "$CF_DOMAIN" ] && [ -f "$APP_DIR/.env" ]; then
  CF_DOMAIN=$(grep "^FRONTEND_URL=" "$APP_DIR/.env" | cut -d'=' -f2- || echo "")
fi
 
if [ -z "$CF_DOMAIN" ]; then
  echo "WARNING: Could not determine CloudFront URL. FRONTEND_URL will be empty."
fi
 
# ---------------------------------------------------------------------------
# Write .env file (always overwrite with latest values)
# ---------------------------------------------------------------------------
mkdir -p "$APP_DIR"
 
cat > "$APP_DIR/.env" << ENVEOF
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
PORT=8000
NODE_ENV=production
FRONTEND_URL=${CF_DOMAIN}
DEFAULT_ADMIN_PASSWORD=Admin@123
STRIPE_PUBLISHABLE_KEY=${STRIPE_PK}
STRIPE_SECRET_KEY=${STRIPE_SK}
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
AWS_REGION=${REGION}
ENVEOF
 
chmod 600 "$APP_DIR/.env"
echo ".env written successfully."
 
# ---------------------------------------------------------------------------
# Ensure uploads directory exists with correct permissions
# ---------------------------------------------------------------------------
mkdir -p "$APP_DIR/uploads"
chmod 755 "$APP_DIR/uploads"
 
# ---------------------------------------------------------------------------
# Set ownership to root (consistent with PM2 running as root in start_app.sh)
# ---------------------------------------------------------------------------
chown -R root:root "$APP_DIR"
chmod 600 "$APP_DIR/.env"  # Re-apply after chown
 
echo "=== AfterInstall complete ==="
