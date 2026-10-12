-- AlterEnum
ALTER TYPE "ClassStatus" ADD VALUE 'CLOSED';

-- AlterEnum
ALTER TYPE "MemberStatus" ADD VALUE 'PENDING';
ALTER TYPE "MemberStatus" ADD VALUE 'REJECTED';
ALTER TYPE "MemberStatus" ADD VALUE 'REMOVED';

-- AlterTable
ALTER TABLE "Class" ADD COLUMN "joinCode" TEXT;
UPDATE "Class" SET "joinCode" = "classCode" WHERE "joinCode" IS NULL;
ALTER TABLE "Class" ALTER COLUMN "joinCode" SET NOT NULL;
ALTER TABLE "Class" ADD COLUMN "maxStudents" INTEGER;

-- AlterTable
ALTER TABLE "ClassMember" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "ClassMember" ADD COLUMN "rejectedAt" TIMESTAMP(3);
ALTER TABLE "ClassMember" ADD COLUMN "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ClassMember" ALTER COLUMN "joinedAt" DROP NOT NULL;
ALTER TABLE "ClassMember" ALTER COLUMN "joinedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TeacherCalendarEvent" ADD COLUMN "classId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Class_joinCode_key" ON "Class"("joinCode");
CREATE INDEX "Class_joinCode_idx" ON "Class"("joinCode");
CREATE INDEX "TeacherCalendarEvent_classId_idx" ON "TeacherCalendarEvent"("classId");

-- CustomConstraint: Partial Unique Index ensuring max 1 PENDING enrollment per student per class
CREATE UNIQUE INDEX "unique_pending_enrollment_per_student_class" ON "ClassMember"("classId", "studentId") WHERE "status" = 'PENDING';

-- AddForeignKey
ALTER TABLE "TeacherCalendarEvent" ADD CONSTRAINT "TeacherCalendarEvent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
