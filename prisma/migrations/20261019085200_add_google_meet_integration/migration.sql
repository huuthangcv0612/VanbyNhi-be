-- CreateEnum
CREATE TYPE "GoogleConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'NEEDS_REAUTH');

-- CreateEnum
CREATE TYPE "MeetSpaceStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "UserGoogleAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "encryptedRefreshToken" TEXT,
    "status" "GoogleConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "lastConnectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoogleAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMeetSpace" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "spaceName" TEXT,
    "meetingUri" TEXT,
    "meetingCode" TEXT,
    "status" "MeetSpaceStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassMeetSpace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoogleAccount_userId_key" ON "UserGoogleAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGoogleAccount_googleSub_key" ON "UserGoogleAccount"("googleSub");

-- CreateIndex
CREATE INDEX "UserGoogleAccount_userId_idx" ON "UserGoogleAccount"("userId");

-- CreateIndex
CREATE INDEX "UserGoogleAccount_googleSub_idx" ON "UserGoogleAccount"("googleSub");

-- CreateIndex
CREATE UNIQUE INDEX "ClassMeetSpace_classId_key" ON "ClassMeetSpace"("classId");

-- CreateIndex
CREATE INDEX "ClassMeetSpace_classId_idx" ON "ClassMeetSpace"("classId");

-- CreateIndex
CREATE INDEX "ClassMeetSpace_status_idx" ON "ClassMeetSpace"("status");

-- AddForeignKey
ALTER TABLE "UserGoogleAccount" ADD CONSTRAINT "UserGoogleAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMeetSpace" ADD CONSTRAINT "ClassMeetSpace_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
