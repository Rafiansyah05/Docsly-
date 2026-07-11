#!/bin/bash

# Docsly Database Backup Script
# Usage: ./scripts/backup.sh <SUPABASE_DB_URL>

if [ -z "$1" ]; then
  echo "Error: Database URL is required."
  echo "Usage: ./backup.sh postgres://postgres:password@localhost:54322/postgres"
  exit 1
fi

DB_URL=$1
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/docsly_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting backup of Docsly Database..."
pg_dump "$DB_URL" -c -O -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successful! File saved to: $BACKUP_FILE"
  
  # Retention Policy: Keep only the last 30 backups
  echo "Cleaning up old backups (keeping last 30)..."
  ls -tp $BACKUP_DIR/docsly_backup_*.sql | grep -v '/$' | tail -n +31 | xargs -I {} rm -- {}
  echo "Cleanup complete."
else
  echo "Backup failed!"
  exit 1
fi
