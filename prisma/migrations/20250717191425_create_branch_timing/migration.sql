-- CreateTable
CREATE TABLE "BranchTiming" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "BranchTiming_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BranchTiming" ADD CONSTRAINT "BranchTiming_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
