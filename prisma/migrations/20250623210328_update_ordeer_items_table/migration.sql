/*
  Warnings:

  - Added the required column `itemId` to the `orderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orderItem" ADD COLUMN     "itemId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
