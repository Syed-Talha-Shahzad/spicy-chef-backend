-- CreateTable
CREATE TABLE "variation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "variation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "variation" ADD CONSTRAINT "variation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
