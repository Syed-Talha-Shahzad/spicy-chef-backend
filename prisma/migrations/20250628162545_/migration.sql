/*
  Warnings:

  - You are about to drop the column `branchId` on the `modifier` table. All the data in the column will be lost.
  - Added the required column `branch_id` to the `modifier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "modifier" DROP CONSTRAINT "modifier_branchId_fkey";

-- AlterTable
ALTER TABLE "modifier" DROP COLUMN "branchId",
ADD COLUMN     "branch_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "modifier" ADD CONSTRAINT "modifier_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
