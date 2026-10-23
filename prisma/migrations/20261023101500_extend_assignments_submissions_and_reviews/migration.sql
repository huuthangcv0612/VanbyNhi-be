-- AlterEnum
ALTER TYPE "UploadTargetType" ADD VALUE IF NOT EXISTS 'ASSIGNMENT';
ALTER TYPE "UploadTargetType" ADD VALUE IF NOT EXISTS 'SUBMISSION';
ALTER TYPE "UploadTargetType" ADD VALUE IF NOT EXISTS 'REVIEW';

-- AlterEnum
ALTER TYPE "AssignmentStatus" ADD VALUE IF NOT EXISTS 'RETURNED';

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'RETURNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "maxScore" DECIMAL(5,2) NOT NULL DEFAULT 10.00;
ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "allowResubmission" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER;

-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "isLate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AssignmentSubmission" ALTER COLUMN "score" TYPE DECIMAL(5,2);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SubmissionReview" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "score" DECIMAL(5,2),
    "feedback" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AssignmentAttachment" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SubmissionAttachment" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ReviewAttachment" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SubmissionReview_submissionId_key" ON "SubmissionReview"("submissionId");
CREATE INDEX IF NOT EXISTS "SubmissionReview_submissionId_idx" ON "SubmissionReview"("submissionId");
CREATE INDEX IF NOT EXISTS "SubmissionReview_reviewerId_idx" ON "SubmissionReview"("reviewerId");
CREATE INDEX IF NOT EXISTS "SubmissionReview_status_idx" ON "SubmissionReview"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AssignmentAttachment_storageKey_key" ON "AssignmentAttachment"("storageKey");
CREATE INDEX IF NOT EXISTS "AssignmentAttachment_assignmentId_idx" ON "AssignmentAttachment"("assignmentId");
CREATE INDEX IF NOT EXISTS "AssignmentAttachment_storageKey_idx" ON "AssignmentAttachment"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SubmissionAttachment_storageKey_key" ON "SubmissionAttachment"("storageKey");
CREATE INDEX IF NOT EXISTS "SubmissionAttachment_submissionId_idx" ON "SubmissionAttachment"("submissionId");
CREATE INDEX IF NOT EXISTS "SubmissionAttachment_storageKey_idx" ON "SubmissionAttachment"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ReviewAttachment_storageKey_key" ON "ReviewAttachment"("storageKey");
CREATE INDEX IF NOT EXISTS "ReviewAttachment_reviewId_idx" ON "ReviewAttachment"("reviewId");
CREATE INDEX IF NOT EXISTS "ReviewAttachment_storageKey_idx" ON "ReviewAttachment"("storageKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AssignmentSubmission_studentId_assignmentId_idx" ON "AssignmentSubmission"("studentId", "assignmentId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "SubmissionReview" ADD CONSTRAINT "SubmissionReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "SubmissionReview" ADD CONSTRAINT "SubmissionReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "AssignmentAttachment" ADD CONSTRAINT "AssignmentAttachment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "AssignmentAttachment" ADD CONSTRAINT "AssignmentAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "SubmissionAttachment" ADD CONSTRAINT "SubmissionAttachment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "SubmissionAttachment" ADD CONSTRAINT "SubmissionAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ReviewAttachment" ADD CONSTRAINT "ReviewAttachment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "SubmissionReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ReviewAttachment" ADD CONSTRAINT "ReviewAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
