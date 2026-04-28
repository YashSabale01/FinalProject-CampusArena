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

# If SSM fetch failed, restore from backup
if [ -z "$MONGODB_URI" ] && [ -f /tmp/campusarena.env.bak ]; then
  echo "SSM fetch failed — restoring .env from backup"
  cp /tmp/campusarena.env.bak $APP_DIR/.env
  chmod 600 $APP_DIR/.env
  echo "=== AfterInstall complete (from backup) ==="
  exit 0
fi

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
  chmod 600 $APP_DIR/.env
  echo ".env written from SSM successfully"
else
  # Last resort — hardcode (only if SSM and backup both fail)
  echo "WARNING: SSM and backup both failed — writing hardcoded .env"
  cat > $APP_DIR/.env << ENVEOF
MONGODB_URI=mongodb+srv://campusarena:Campus123@cluster0.i8pb3l1.mongodb.net/campusarena?retryWrites=true&w=majority
JWT_SECRET=7fK!92kLm@#xPq8$ZrT6vW1yN3sUe%Q9
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://d1ua6bzb34kwo5.cloudfront.net
DEFAULT_ADMIN_PASSWORD=Admin@123
STRIPE_PUBLISHABLE_KEY=pk_test_51ST5KBRs46vuf9mZdmJElOQjXGJVIdArpIuZrAL584qsYQ2KV9uYyJUMVNU4N26jTTHKWkJ6fNhC5mSvuFiWtpcy00B2DQ5ulB
STRIPE_SECRET_KEY=sk_test_51ST5KBRs46vuf9mZw1yd8WSUnH6314woM44FYOTOrsGE1TiJ91f9cuzKrB6JIQh4rU3mWLqmFBmS47zEY1JOjZBM00X98ZepiN
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
AWS_REGION=${REGION}
ENVEOF
  chmod 600 $APP_DIR/.env
fi

# Fix ownership
chown -R ec2-user:ec2-user $APP_DIR
chmod 600 $APP_DIR/.env

echo "=== AfterInstall complete ==="
