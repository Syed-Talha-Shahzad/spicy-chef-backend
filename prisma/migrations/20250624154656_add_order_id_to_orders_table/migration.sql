/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "orderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "order_orderId_key" ON "order"("orderId");
