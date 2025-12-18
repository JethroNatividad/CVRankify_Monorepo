/*
  Warnings:

  - Added the required column `employmentType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualifications` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workplaceType` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Job` ADD COLUMN `benefits` TEXT NULL,
    ADD COLUMN `employmentType` VARCHAR(50) NOT NULL,
    ADD COLUMN `industry` VARCHAR(100) NULL,
    ADD COLUMN `jobFunction` VARCHAR(100) NULL,
    ADD COLUMN `location` VARCHAR(255) NOT NULL,
    ADD COLUMN `preferredQualifications` TEXT NULL,
    ADD COLUMN `qualifications` TEXT NOT NULL,
    ADD COLUMN `salaryRange` VARCHAR(100) NULL,
    ADD COLUMN `workplaceType` VARCHAR(50) NOT NULL;
