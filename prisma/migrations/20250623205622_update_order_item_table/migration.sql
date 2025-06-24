/*
  Warnings:

  - You are about to drop the column `name` on the `orderItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `orderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "orderItem" DROP COLUMN "name",
DROP COLUMN "price",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
