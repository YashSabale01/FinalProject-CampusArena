#!/bin/bash
# =============================================================================
# scripts/after_install.sh
# =============================================================================
set -e
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== AfterInstall: $(date) ==="
 
APP_DIR=/opt/campusarena/server
 
# Always write the .env file — never rely on backup
# These values come from the CloudFormation parameters stored in SSM
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region 2>/dev/null || echo "ap-south-1")
 
# Try to get secrets from SSM first
MONGODB_URI=$(aws ssm get-parameter --name /campusarena/MONGODB_URI --region $REGION --query Parameter.Value --output text 2>/dev/null || echo "")
JWT_SECRET=$(aws ssm get-parameter --name /campusarena/JWT_SECRET --region $REGION --query Parameter.Value --output text 2>/dev/null || echo "")
STRIPE_PK=$(aws ssm get-parameter --name /campusarena/STRIPE_PUBLISHABLE_KEY --region $REGION --query Parameter.Value --output text 2>/dev/null || echo "")
STRIPE_SK=$(aws ssm get-parameter --name /campusarena/STRIPE_SECRET_KEY --region $REGION --query Parameter.Value --output text 2>/dev/null || echo "")
 
# Get CloudFront domain from instance tags or use default
CF_DOMAIN=$(aws cloudformation describe-stacks --stack-name production-CampusArena --region $REGION --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" --output text 2>/dev/null || echo "https://d1ua6bzb34kwo5.cloudfront.net")
 
# Write .env
mkdir -p $APP_DIR
cat > $APP_DIR/.env << ENVEOF
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
 
chmod 600 $APP_DIR/.env
 
# Ensure uploads directory exists
mkdir -p $APP_DIR/uploads
chmod 755 $APP_DIR/uploads
 
# Set ownership
chown -R ec2-user:ec2-user $APP_DIR
chmod 600 $APP_DIR/.env
 
echo "=== AfterInstall complete ==="
