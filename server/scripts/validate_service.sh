#!/bin/bash
exec >> /var/log/campusarena-deploy.log 2>&1
echo "=== ValidateService: $(date) ==="

MAX_RETRIES=36
RETRY_INTERVAL=5
HEALTH_URL="http://localhost:8000/api/health"

for i in $(seq 1 $MAX_RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "Health check PASSED (HTTP $STATUS) on attempt $i"
    echo "=== ValidateService PASSED ==="
    exit 0
  fi
  echo "Attempt $i/$MAX_RETRIES: HTTP $STATUS — waiting ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo "ERROR: Health check failed after $MAX_RETRIES attempts"
pm2 logs campusarena-backend --lines 30 --nostream 2>/dev/null || true
exit 1
