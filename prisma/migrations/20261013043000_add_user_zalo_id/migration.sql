-- AlterTable
ALTER TABLE "User" ADD COLUMN     "zaloId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_zaloId_key" ON "User"("zaloId");
