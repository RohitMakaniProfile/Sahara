/*
  Warnings:

  - You are about to drop the column `iconUrl` on the `aac_categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "aac_categories" DROP COLUMN "iconUrl",
ADD COLUMN     "icon_url" TEXT;
