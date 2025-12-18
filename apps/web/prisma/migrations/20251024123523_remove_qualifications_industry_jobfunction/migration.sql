/*
  Warnings:

  - You are about to drop the column `industry` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `jobFunction` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `preferredQualifications` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `qualifications` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Job` DROP COLUMN `industry`,
    DROP COLUMN `jobFunction`,
    DROP COLUMN `preferredQualifications`,
    DROP COLUMN `qualifications`;
