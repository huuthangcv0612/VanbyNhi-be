-- CreateEnum
CREATE TYPE "CalendarNotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'CANCELLED', 'FAILED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CALENDAR';

-- CreateTable
CREATE TABLE "TeacherCalendarLabel" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherCalendarLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherCalendarEvent" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT,
    "meetUrl" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "labelId" TEXT,
    "reminderMinutes" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarEventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarNotification" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "CalendarNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherCalendarLabel_teacherId_idx" ON "TeacherCalendarLabel"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherCalendarLabel_teacherId_name_key" ON "TeacherCalendarLabel"("teacherId", "name");

-- CreateIndex
CREATE INDEX "TeacherCalendarEvent_teacherId_startAt_idx" ON "TeacherCalendarEvent"("teacherId", "startAt");

-- CreateIndex
CREATE INDEX "TeacherCalendarEvent_teacherId_endAt_idx" ON "TeacherCalendarEvent"("teacherId", "endAt");

-- CreateIndex
CREATE INDEX "TeacherCalendarEvent_labelId_idx" ON "TeacherCalendarEvent"("labelId");

-- CreateIndex
CREATE INDEX "CalendarEventParticipant_studentId_idx" ON "CalendarEventParticipant"("studentId");

-- CreateIndex
CREATE INDEX "CalendarEventParticipant_eventId_idx" ON "CalendarEventParticipant"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventParticipant_eventId_studentId_key" ON "CalendarEventParticipant"("eventId", "studentId");

-- CreateIndex
CREATE INDEX "CalendarNotification_status_scheduledAt_idx" ON "CalendarNotification"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "CalendarNotification_eventId_recipientId_idx" ON "CalendarNotification"("eventId", "recipientId");

-- CreateIndex
CREATE INDEX "CalendarNotification_recipientId_idx" ON "CalendarNotification"("recipientId");

-- AddForeignKey
ALTER TABLE "TeacherCalendarLabel" ADD CONSTRAINT "TeacherCalendarLabel_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCalendarEvent" ADD CONSTRAINT "TeacherCalendarEvent_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCalendarEvent" ADD CONSTRAINT "TeacherCalendarEvent_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "TeacherCalendarLabel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventParticipant" ADD CONSTRAINT "CalendarEventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TeacherCalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventParticipant" ADD CONSTRAINT "CalendarEventParticipant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarNotification" ADD CONSTRAINT "CalendarNotification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TeacherCalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarNotification" ADD CONSTRAINT "CalendarNotification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
