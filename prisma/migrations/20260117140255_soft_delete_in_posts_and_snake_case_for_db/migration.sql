/*
  Warnings:

  - You are about to drop the `AutismBehaviourForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AutismBehaviourQuestionResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AutismBehaviourQuestionnaire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AutismCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AutismCategoryOutput` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Child` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunityPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Parent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AutismBehaviourForm" DROP CONSTRAINT "AutismBehaviourForm_childId_fkey";

-- DropForeignKey
ALTER TABLE "AutismBehaviourForm" DROP CONSTRAINT "AutismBehaviourForm_parentId_fkey";

-- DropForeignKey
ALTER TABLE "AutismBehaviourQuestionResponse" DROP CONSTRAINT "AutismBehaviourQuestionResponse_form_id_fkey";

-- DropForeignKey
ALTER TABLE "AutismBehaviourQuestionResponse" DROP CONSTRAINT "AutismBehaviourQuestionResponse_question_id_fkey";

-- DropForeignKey
ALTER TABLE "AutismBehaviourQuestionnaire" DROP CONSTRAINT "AutismBehaviourQuestionnaire_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "AutismCategoryOutput" DROP CONSTRAINT "AutismCategoryOutput_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "AutismCategoryOutput" DROP CONSTRAINT "AutismCategoryOutput_formId_fkey";

-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_parentId_fkey";

-- DropForeignKey
ALTER TABLE "CommunityPost" DROP CONSTRAINT "CommunityPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_parentCommentId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_postId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_postId_fkey";

-- DropTable
DROP TABLE "AutismBehaviourForm";

-- DropTable
DROP TABLE "AutismBehaviourQuestionResponse";

-- DropTable
DROP TABLE "AutismBehaviourQuestionnaire";

-- DropTable
DROP TABLE "AutismCategory";

-- DropTable
DROP TABLE "AutismCategoryOutput";

-- DropTable
DROP TABLE "Child";

-- DropTable
DROP TABLE "CommunityPost";

-- DropTable
DROP TABLE "Parent";

-- DropTable
DROP TABLE "PostComment";

-- DropTable
DROP TABLE "RefreshToken";

-- DropTable
DROP TABLE "Vote";

-- CreateTable
CREATE TABLE "parents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferred_language" "SupportedLanguage" DEFAULT 'ENGLISH',
    "location" TEXT NOT NULL,
    "known_autism_history" TEXT,
    "preferred_communication_style" "CommunicationStyle" DEFAULT 'SIMPLE',
    "hashed_password" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "known_diagnosis" "DiagnosisTypes",
    "diagnosis_stage" "DiagnosisStages",
    "developmental_stage" "ChildDevelopmentStages",
    "dominant_hand" TEXT,
    "parent_id" INTEGER NOT NULL,
    "relation_with_parent" "ParentChildRelations",
    "needs_vector" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autism_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autism_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autism_behaviour_questionnaires" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autism_behaviour_questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autism_behaviour_forms" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "child_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autism_behaviour_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autism_behaviour_question_responses" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "parent_response" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autism_behaviour_question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autism_category_outputs" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL,
    "max_possible_score" INTEGER NOT NULL,
    "normalized_score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autism_category_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "parent_comment_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" SERIAL NOT NULL,
    "type" "VoteType" NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "post_id" INTEGER,
    "comment_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parents_phone_number_key" ON "parents"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "parents_email_key" ON "parents"("email");

-- CreateIndex
CREATE INDEX "parents_email_idx" ON "parents"("email");

-- CreateIndex
CREATE INDEX "children_parent_id_idx" ON "children"("parent_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_parent_id_idx" ON "refresh_tokens"("parent_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "autism_behaviour_forms_parent_id_idx" ON "autism_behaviour_forms"("parent_id");

-- CreateIndex
CREATE INDEX "autism_behaviour_forms_child_id_idx" ON "autism_behaviour_forms"("child_id");

-- CreateIndex
CREATE INDEX "autism_behaviour_question_responses_form_id_idx" ON "autism_behaviour_question_responses"("form_id");

-- CreateIndex
CREATE INDEX "autism_behaviour_question_responses_question_id_idx" ON "autism_behaviour_question_responses"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "autism_behaviour_question_responses_form_id_question_id_key" ON "autism_behaviour_question_responses"("form_id", "question_id");

-- CreateIndex
CREATE INDEX "autism_category_outputs_category_id_idx" ON "autism_category_outputs"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "autism_category_outputs_form_id_category_id_key" ON "autism_category_outputs"("form_id", "category_id");

-- CreateIndex
CREATE INDEX "community_posts_author_id_idx" ON "community_posts"("author_id");

-- CreateIndex
CREATE INDEX "community_posts_id_created_at_idx" ON "community_posts"("id", "created_at");

-- CreateIndex
CREATE INDEX "post_comments_post_id_idx" ON "post_comments"("post_id");

-- CreateIndex
CREATE INDEX "post_comments_parent_comment_id_idx" ON "post_comments"("parent_comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_parent_id_post_id_key" ON "votes"("parent_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_parent_id_comment_id_key" ON "votes"("parent_id", "comment_id");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autism_behaviour_questionnaires" ADD CONSTRAINT "autism_behaviour_questionnaires_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "autism_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autism_behaviour_forms" ADD CONSTRAINT "autism_behaviour_forms_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autism_behaviour_forms" ADD CONSTRAINT "autism_behaviour_forms_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autism_behaviour_question_responses" ADD CONSTRAINT "autism_behaviour_question_responses_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "autism_behaviour_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autism_behaviour_question_responses" ADD CONSTRAINT "autism_behaviour_question_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "autism_behaviour_questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autism_category_outputs" ADD CONSTRAINT "autism_category_outputs_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "autism_behaviour_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autism_category_outputs" ADD CONSTRAINT "autism_category_outputs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "autism_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "post_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "post_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
