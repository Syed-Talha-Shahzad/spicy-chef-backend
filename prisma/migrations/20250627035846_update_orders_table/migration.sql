/*
  Warnings:

  - Added the required column `address` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNo` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "phoneNo" TEXT NOT NULL,
ADD COLUMN     "postCode" TEXT;
