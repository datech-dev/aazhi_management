-- Migration: add instagram_backups and instagram_restore_logs tables
-- Run this against your PostgreSQL database when DATABASE_URL is available.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = ''BackupStatus'') THEN
    CREATE TYPE "BackupStatus" AS ENUM (''PENDING'', ''RUNNING'', ''COMPLETED'', ''FAILED'');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = ''RestoreStatus'') THEN
    CREATE TYPE "RestoreStatus" AS ENUM (''PENDING'', ''COMPLETED'', ''FAILED'');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "instagram_backups" (
  "id"                TEXT        NOT NULL,
  "triggeredById"     TEXT,
  "triggerType"       TEXT        NOT NULL DEFAULT ''manual'',
  "status"            "BackupStatus" NOT NULL DEFAULT ''PENDING'',
  "instagramAccountId" TEXT,
  "instagramUsername" TEXT,
  "profileData"       JSONB,
  "postsData"         JSONB,
  "storiesData"       JSONB,
  "followersCount"    INTEGER,
  "followingCount"    INTEGER,
  "mediaCount"        INTEGER,
  "highlightsData"    JSONB,
  "biographyText"     TEXT,
  "websiteUrl"        TEXT,
  "contactEmail"      TEXT,
  "businessCategory"  TEXT,
  "errorMessage"      TEXT,
  "backupSizeKb"      INTEGER,
  "startedAt"         TIMESTAMP(3),
  "completedAt"       TIMESTAMP(3),
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "instagram_backups_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "instagram_backups_triggeredById_fkey"
    FOREIGN KEY ("triggeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "instagram_backups_status_idx" ON "instagram_backups"("status");
CREATE INDEX IF NOT EXISTS "instagram_backups_createdAt_idx" ON "instagram_backups"("createdAt");

CREATE TABLE IF NOT EXISTS "instagram_restore_logs" (
  "id"           TEXT        NOT NULL,
  "backupId"     TEXT        NOT NULL,
  "restoredById" TEXT,
  "status"       "RestoreStatus" NOT NULL DEFAULT ''PENDING'',
  "notes"        TEXT,
  "restoredAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "instagram_restore_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "instagram_restore_logs_backupId_fkey"
    FOREIGN KEY ("backupId") REFERENCES "instagram_backups"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "instagram_restore_logs_restoredById_fkey"
    FOREIGN KEY ("restoredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "instagram_restore_logs_backupId_idx" ON "instagram_restore_logs"("backupId");
