-- AlterTable
ALTER TABLE "autism_behaviour_questionnaires" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
