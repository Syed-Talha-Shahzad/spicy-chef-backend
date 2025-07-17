/*
  Warnings:

  - You are about to drop the `BranchTiming` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BranchTiming" DROP CONSTRAINT "BranchTiming_branchId_fkey";

-- DropTable
DROP TABLE "BranchTiming";

-- CreateTable
CREATE TABLE "branchTiming" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "branchTiming_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "branchTiming" ADD CONSTRAINT "branchTiming_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
