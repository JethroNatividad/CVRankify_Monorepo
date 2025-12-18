/*
  Warnings:

  - You are about to drop the column `isRelevant` on the `Experience` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Experience` DROP COLUMN `isRelevant`,
    ADD COLUMN `relevant` BOOLEAN NULL DEFAULT false;
