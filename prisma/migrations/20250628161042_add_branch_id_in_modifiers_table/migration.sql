/*
  Warnings:

  - Added the required column `branchId` to the `modifier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "modifier" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "modifier" ADD CONSTRAINT "modifier_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
