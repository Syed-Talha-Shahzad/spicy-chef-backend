-- CreateEnum
CREATE TYPE "orderType" AS ENUM ('DELIVERY', 'COLLECTION');

-- CreateEnum
CREATE TYPE "paymentType" AS ENUM ('CASH', 'STRIPE');

-- CreateEnum
CREATE TYPE "paymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "orderType" "orderType" NOT NULL,
    "paymentType" "paymentType" NOT NULL,
    "paymentStatus" "paymentStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "orderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
