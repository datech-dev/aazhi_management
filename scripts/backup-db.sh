#!/usr/bin/env bash

# Aazhi Designer Studio — Automated PostgreSQL Database Backup Script
# Usage: ./scripts/backup-db.sh

set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/aazhi-studio}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/aazhi_db_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "📦 Starting Aazhi Studio Database Backup at ${TIMESTAMP}..."

if [ -z "${DATABASE_URL}" ]; then
  echo "⚠️ DATABASE_URL not set, falling back to local postgres instance"
  pg_dump -U postgres aazhi_db | gzip > "${BACKUP_FILE}"
else
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
fi

echo "✅ Backup completed successfully: ${BACKUP_FILE}"

# Retention Cleanup: Delete backups older than 14 days
echo "🧹 Cleaning up database backups older than 14 days..."
find "${BACKUP_DIR}" -type f -name "aazhi_db_backup_*.sql.gz" -mtime +14 -exec rm -f {} \;

echo "✨ Database Backup & Retention Task Completed!"
