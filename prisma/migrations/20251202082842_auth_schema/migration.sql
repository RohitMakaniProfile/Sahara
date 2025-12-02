-- CreateEnum
CREATE TYPE "SupportedLanguage" AS ENUM ('ENGLISH', 'HINDI');

-- CreateEnum
CREATE TYPE "CommunicationStyle" AS ENUM ('SIMPLE', 'DETAILED', 'VISUAL_FIRST');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "DiagnosisTypes" AS ENUM ('AUTISM', 'ADHD', 'SPEECH_DELAY', 'NOT_DIAGNOSED');

-- CreateEnum
CREATE TYPE "DiagnosisStages" AS ENUM ('SUSPECTED', 'CONFIRMED', 'RECENTLY_DIAGNOSED');

-- CreateEnum
CREATE TYPE "ChildDevelopmentStages" AS ENUM ('TODDLER', 'EARLY_CHILDHOOD', 'SCHOOL_AGE');

-- CreateEnum
CREATE TYPE "ParentChildRelations" AS ENUM ('MOTHER', 'FATHER', 'CARETAKER', 'BROTHER', 'SISTER', 'OTHERS');

-- CreateTable
CREATE TABLE "Parent" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "phone_number" TEXT,
    "email" TEXT NOT NULL,
    "preferred_language" "SupportedLanguage" DEFAULT 'ENGLISH',
    "location" TEXT,
    "known_autism_history" TEXT,
    "preferred_communication_style" "CommunicationStyle" DEFAULT 'SIMPLE',
    "hashedPassword" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "dob" TIMESTAMP(3),
    "gender" "Gender",
    "known_diagnosis" "DiagnosisTypes",
    "diagnosis_stage" "DiagnosisStages",
    "developmental_stage" "ChildDevelopmentStages",
    "dominant_hand" TEXT,
    "parent_id" INTEGER NOT NULL,
    "relation_with_parent" "ParentChildRelations",
    "needs_vector" DOUBLE PRECISION[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE INDEX "RefreshToken_parent_id_idx" ON "RefreshToken"("parent_id");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
