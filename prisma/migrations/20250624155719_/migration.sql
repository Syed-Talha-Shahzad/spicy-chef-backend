/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `orderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "orderItem_orderId_key" ON "orderItem"("orderId");
