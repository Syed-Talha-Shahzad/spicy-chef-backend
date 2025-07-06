/*
  Warnings:

  - The `discount` column on the `item` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "item" DROP COLUMN "discount",
ADD COLUMN     "discount" INTEGER;
