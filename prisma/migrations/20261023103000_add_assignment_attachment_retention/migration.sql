-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "AttachmentCleanupStatus" AS ENUM ('PENDING', 'PROCESSING', 'CLEANED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "AssignmentAttachment" ADD COLUMN IF NOT EXISTS "retentionExpiresAt" TIMESTAMP(3);
ALTER TABLE "AssignmentAttachment" ADD COLUMN IF NOT EXISTS "isKeepForever" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AssignmentAttachment" ADD COLUMN IF NOT EXISTS "cleanupStatus" "AttachmentCleanupStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "AssignmentAttachment" ADD COLUMN IF NOT EXISTS "cleanupAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AssignmentAttachment" ADD COLUMN IF NOT EXISTS "lastCleanupError" TEXT;
ALTER TABLE "AssignmentAttachment" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3);
ALTER TABLE "AssignmentAttachment" ADD COLUMN IF NOT EXISTS "cleanedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SubmissionAttachment" ADD COLUMN IF NOT EXISTS "retentionExpiresAt" TIMESTAMP(3);
ALTER TABLE "SubmissionAttachment" ADD COLUMN IF NOT EXISTS "isKeepForever" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SubmissionAttachment" ADD COLUMN IF NOT EXISTS "cleanupStatus" "AttachmentCleanupStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "SubmissionAttachment" ADD COLUMN IF NOT EXISTS "cleanupAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SubmissionAttachment" ADD COLUMN IF NOT EXISTS "lastCleanupError" TEXT;
ALTER TABLE "SubmissionAttachment" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3);
ALTER TABLE "SubmissionAttachment" ADD COLUMN IF NOT EXISTS "cleanedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ReviewAttachment" ADD COLUMN IF NOT EXISTS "retentionExpiresAt" TIMESTAMP(3);
ALTER TABLE "ReviewAttachment" ADD COLUMN IF NOT EXISTS "isKeepForever" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ReviewAttachment" ADD COLUMN IF NOT EXISTS "cleanupStatus" "AttachmentCleanupStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ReviewAttachment" ADD COLUMN IF NOT EXISTS "cleanupAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ReviewAttachment" ADD COLUMN IF NOT EXISTS "lastCleanupError" TEXT;
ALTER TABLE "ReviewAttachment" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3);
ALTER TABLE "ReviewAttachment" ADD COLUMN IF NOT EXISTS "cleanedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssignmentAttachment_cleanupStatus_retentionExpiresAt_idx" ON "AssignmentAttachment"("cleanupStatus", "retentionExpiresAt");
CREATE INDEX IF NOT EXISTS "AssignmentAttachment_retentionExpiresAt_idx" ON "AssignmentAttachment"("retentionExpiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SubmissionAttachment_cleanupStatus_retentionExpiresAt_idx" ON "SubmissionAttachment"("cleanupStatus", "retentionExpiresAt");
CREATE INDEX IF NOT EXISTS "SubmissionAttachment_retentionExpiresAt_idx" ON "SubmissionAttachment"("retentionExpiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReviewAttachment_cleanupStatus_retentionExpiresAt_idx" ON "ReviewAttachment"("cleanupStatus", "retentionExpiresAt");
CREATE INDEX IF NOT EXISTS "ReviewAttachment_retentionExpiresAt_idx" ON "ReviewAttachment"("retentionExpiresAt");
