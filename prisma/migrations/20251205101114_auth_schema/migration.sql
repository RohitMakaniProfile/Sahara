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
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredLanguage" "SupportedLanguage" DEFAULT 'ENGLISH',
    "location" TEXT NOT NULL,
    "knownAutismHistory" TEXT,
    "preferredCommunicationStyle" "CommunicationStyle" DEFAULT 'SIMPLE',
    "hashedPassword" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "knownDiagnosis" "DiagnosisTypes",
    "diagnosisStage" "DiagnosisStages",
    "developmentalStage" "ChildDevelopmentStages",
    "dominantHand" TEXT,
    "parentId" INTEGER NOT NULL,
    "relationWithParent" "ParentChildRelations",
    "needsVector" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
CREATE UNIQUE INDEX "Parent_phone_number_key" ON "Parent"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE INDEX "Parent_email_idx" ON "Parent"("email");

-- CreateIndex
CREATE INDEX "RefreshToken_parent_id_idx" ON "RefreshToken"("parent_id");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
