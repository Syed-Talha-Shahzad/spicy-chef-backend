-- CreateTable
CREATE TABLE "itemModifier" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "modifierId" TEXT NOT NULL,

    CONSTRAINT "itemModifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "itemModifier_itemId_modifierId_key" ON "itemModifier"("itemId", "modifierId");

-- AddForeignKey
ALTER TABLE "itemModifier" ADD CONSTRAINT "itemModifier_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itemModifier" ADD CONSTRAINT "itemModifier_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "modifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
