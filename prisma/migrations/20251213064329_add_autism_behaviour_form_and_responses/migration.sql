-- CreateTable
CREATE TABLE "AutismBehaviourForm" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER NOT NULL,
    "childId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutismBehaviourForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutismBehaviourQuestionResponse" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "parent_response" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutismBehaviourQuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutismBehaviourForm_parentId_idx" ON "AutismBehaviourForm"("parentId");

-- CreateIndex
CREATE INDEX "AutismBehaviourForm_childId_idx" ON "AutismBehaviourForm"("childId");

-- CreateIndex
CREATE INDEX "AutismBehaviourQuestionResponse_form_id_idx" ON "AutismBehaviourQuestionResponse"("form_id");

-- CreateIndex
CREATE INDEX "AutismBehaviourQuestionResponse_question_id_idx" ON "AutismBehaviourQuestionResponse"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "AutismBehaviourQuestionResponse_form_id_question_id_key" ON "AutismBehaviourQuestionResponse"("form_id", "question_id");

-- CreateIndex
CREATE INDEX "Child_parentId_idx" ON "Child"("parentId");

-- AddForeignKey
ALTER TABLE "AutismBehaviourForm" ADD CONSTRAINT "AutismBehaviourForm_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutismBehaviourForm" ADD CONSTRAINT "AutismBehaviourForm_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutismBehaviourQuestionResponse" ADD CONSTRAINT "AutismBehaviourQuestionResponse_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "AutismBehaviourForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutismBehaviourQuestionResponse" ADD CONSTRAINT "AutismBehaviourQuestionResponse_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "AutismBehaviourQuestionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;
