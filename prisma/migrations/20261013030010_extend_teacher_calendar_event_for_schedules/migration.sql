-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('ONLINE_MEET', 'ONLINE_WEB', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "TeacherCalendarEvent" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "meetingType" "MeetingType" NOT NULL DEFAULT 'ONLINE_MEET',
ADD COLUMN     "meetingUrl" TEXT,
ADD COLUMN     "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh';

-- CreateIndex
CREATE INDEX "TeacherCalendarEvent_status_idx" ON "TeacherCalendarEvent"("status");
