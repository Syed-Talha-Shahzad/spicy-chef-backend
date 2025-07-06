/*
  Warnings:

  - You are about to drop the column `deiveryFee` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "deiveryFee",
ADD COLUMN     "deliveryFee" DECIMAL(65,30) NOT NULL DEFAULT 0;
