/*
  Warnings:

  - You are about to drop the column `itemId` on the `orderItem` table. All the data in the column will be lost.
  - Added the required column `modifierOptionId` to the `orderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orderItem" DROP CONSTRAINT "orderItem_itemId_fkey";

-- AlterTable
ALTER TABLE "orderItem" DROP COLUMN "itemId",
ADD COLUMN     "modifierOptionId" TEXT NOT NULL,
ADD COLUMN     "variationId" TEXT;

-- AddForeignKey
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_modifierOptionId_fkey" FOREIGN KEY ("modifierOptionId") REFERENCES "modifierOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "variation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
