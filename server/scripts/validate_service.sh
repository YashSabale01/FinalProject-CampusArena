#!/bin/bash
set -e
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== ValidateService: $(date) ==="

MAX_RETRIES=12
RETRY_INTERVAL=5
HEALTH_URL="http://localhost:8000/api/health"

for i in $(seq 1 $MAX_RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "Health check passed (HTTP $STATUS) on attempt $i"
    echo "=== ValidateService PASSED ==="
    exit 0
  fi
  echo "Attempt $i/$MAX_RETRIES: HTTP $STATUS — waiting ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "ERROR: Health check failed after $MAX_RETRIES attempts. Deployment failed."
pm2 logs campusarena-backend --lines 50 2>/dev/null || true
exit 1
