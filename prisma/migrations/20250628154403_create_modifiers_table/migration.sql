-- CreateTable
CREATE TABLE "modifier" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,

    CONSTRAINT "modifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifierOption" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "modifierId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modifierOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "modifierOption" ADD CONSTRAINT "modifierOption_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "modifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
