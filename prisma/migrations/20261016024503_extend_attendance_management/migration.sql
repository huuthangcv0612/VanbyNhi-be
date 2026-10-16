-- CreateEnum
CREATE TYPE "AttendanceSessionStatus" AS ENUM ('OPEN', 'DRAFT', 'CLOSED');

-- CreateEnum
CREATE TYPE "CorrectionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceStatus" ADD VALUE 'EXCUSED_ABSENT';
ALTER TYPE "AttendanceStatus" ADD VALUE 'UNEXCUSED_ABSENT';
ALTER TYPE "AttendanceStatus" ADD VALUE 'NOT_MARKED';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "isMakeUp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalSessionId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'NOT_MARKED';

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceCorrectionRequest" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedStatus" "AttendanceStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "status" "CorrectionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceCorrectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyAttendanceSummary" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "billingYear" INTEGER NOT NULL,
    "billingMonth" INTEGER NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "presentCount" INTEGER NOT NULL DEFAULT 0,
    "lateCount" INTEGER NOT NULL DEFAULT 0,
    "excusedAbsentCount" INTEGER NOT NULL DEFAULT 0,
    "unexcusedAbsentCount" INTEGER NOT NULL DEFAULT 0,
    "notMarkedCount" INTEGER NOT NULL DEFAULT 0,
    "chargeableSessions" INTEGER NOT NULL DEFAULT 0,
    "tuitionAmount" DECIMAL(12,2),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyAttendanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassAttendanceConfig" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "chargePresent" BOOLEAN NOT NULL DEFAULT true,
    "chargeLate" BOOLEAN NOT NULL DEFAULT true,
    "chargeExcusedAbsent" BOOLEAN NOT NULL DEFAULT false,
    "chargeUnexcusedAbsent" BOOLEAN NOT NULL DEFAULT false,
    "allowMakeUpSession" BOOLEAN NOT NULL DEFAULT true,
    "retentionDays" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassAttendanceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSession_sessionId_key" ON "AttendanceSession"("sessionId");

-- CreateIndex
CREATE INDEX "AttendanceSession_classId_status_idx" ON "AttendanceSession"("classId", "status");

-- CreateIndex
CREATE INDEX "AttendanceSession_sessionId_idx" ON "AttendanceSession"("sessionId");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionRequest_attendanceId_status_idx" ON "AttendanceCorrectionRequest"("attendanceId", "status");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionRequest_studentId_status_idx" ON "AttendanceCorrectionRequest"("studentId", "status");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionRequest_status_createdAt_idx" ON "AttendanceCorrectionRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MonthlyAttendanceSummary_classId_billingYear_billingMonth_idx" ON "MonthlyAttendanceSummary"("classId", "billingYear", "billingMonth");

-- CreateIndex
CREATE INDEX "MonthlyAttendanceSummary_studentId_billingYear_billingMonth_idx" ON "MonthlyAttendanceSummary"("studentId", "billingYear", "billingMonth");

-- CreateIndex
CREATE INDEX "MonthlyAttendanceSummary_isClosed_idx" ON "MonthlyAttendanceSummary"("isClosed");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyAttendanceSummary_classId_studentId_billingYear_bill_key" ON "MonthlyAttendanceSummary"("classId", "studentId", "billingYear", "billingMonth");

-- CreateIndex
CREATE UNIQUE INDEX "ClassAttendanceConfig_classId_key" ON "ClassAttendanceConfig"("classId");

-- CreateIndex
CREATE INDEX "Attendance_studentId_status_idx" ON "Attendance"("studentId", "status");

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionRequest" ADD CONSTRAINT "AttendanceCorrectionRequest_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionRequest" ADD CONSTRAINT "AttendanceCorrectionRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionRequest" ADD CONSTRAINT "AttendanceCorrectionRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyAttendanceSummary" ADD CONSTRAINT "MonthlyAttendanceSummary_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyAttendanceSummary" ADD CONSTRAINT "MonthlyAttendanceSummary_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyAttendanceSummary" ADD CONSTRAINT "MonthlyAttendanceSummary_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ClassMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyAttendanceSummary" ADD CONSTRAINT "MonthlyAttendanceSummary_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAttendanceConfig" ADD CONSTRAINT "ClassAttendanceConfig_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
