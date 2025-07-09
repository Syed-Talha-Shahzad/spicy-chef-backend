/*
  Warnings:

  - You are about to alter the column `price` on the `modifierOption` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "modifierOption" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
