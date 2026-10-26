-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('STATIC_FILE', 'STRUCTURED_NOTE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentExportFormat" AS ENUM ('DOCX', 'PDF');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "content" JSONB,
ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "type" "DocumentType" NOT NULL DEFAULT 'STATIC_FILE',
ALTER COLUMN "originalName" DROP NOT NULL,
ALTER COLUMN "storageKey" DROP NOT NULL,
ALTER COLUMN "mimeType" SET DEFAULT 'application/vnd.tiptap+json',
ALTER COLUMN "sizeBytes" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "actorId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAsset" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentExportJob" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "format" "DocumentExportFormat" NOT NULL,
    "status" "DocumentExportStatus" NOT NULL DEFAULT 'PENDING',
    "storageKey" TEXT,
    "fileSize" BIGINT,
    "errorMessage" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentVersion_documentId_createdAt_idx" ON "DocumentVersion"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentVersion_actorId_idx" ON "DocumentVersion"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_documentId_revision_key" ON "DocumentVersion"("documentId", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAsset_storageKey_key" ON "DocumentAsset"("storageKey");

-- CreateIndex
CREATE INDEX "DocumentAsset_documentId_idx" ON "DocumentAsset"("documentId");

-- CreateIndex
CREATE INDEX "DocumentAsset_storageKey_idx" ON "DocumentAsset"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentExportJob_storageKey_key" ON "DocumentExportJob"("storageKey");

-- CreateIndex
CREATE INDEX "DocumentExportJob_documentId_revision_idx" ON "DocumentExportJob"("documentId", "revision");

-- CreateIndex
CREATE INDEX "DocumentExportJob_createdById_idx" ON "DocumentExportJob"("createdById");

-- CreateIndex
CREATE INDEX "DocumentExportJob_status_createdAt_idx" ON "DocumentExportJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Document_type_status_idx" ON "Document"("type", "status");

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAsset" ADD CONSTRAINT "DocumentAsset_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentExportJob" ADD CONSTRAINT "DocumentExportJob_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentExportJob" ADD CONSTRAINT "DocumentExportJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
