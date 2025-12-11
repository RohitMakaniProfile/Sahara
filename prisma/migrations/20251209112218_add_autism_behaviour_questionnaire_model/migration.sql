-- CreateTable
CREATE TABLE "AutismBehaviourQuestionnaire" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutismBehaviourQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AutismBehaviourQuestionnaire" ADD CONSTRAINT "AutismBehaviourQuestionnaire_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AutismCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
