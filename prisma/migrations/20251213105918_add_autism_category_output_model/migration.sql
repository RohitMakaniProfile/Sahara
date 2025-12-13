-- CreateTable
CREATE TABLE "AutismCategoryOutput" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "maxPossibleScore" INTEGER NOT NULL,
    "normalizedScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutismCategoryOutput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutismCategoryOutput_categoryId_idx" ON "AutismCategoryOutput"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "AutismCategoryOutput_formId_categoryId_key" ON "AutismCategoryOutput"("formId", "categoryId");

-- AddForeignKey
ALTER TABLE "AutismCategoryOutput" ADD CONSTRAINT "AutismCategoryOutput_formId_fkey" FOREIGN KEY ("formId") REFERENCES "AutismBehaviourForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutismCategoryOutput" ADD CONSTRAINT "AutismCategoryOutput_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AutismCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
