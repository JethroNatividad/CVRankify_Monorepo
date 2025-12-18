/*
  Warnings:

  - You are about to drop the column `salaryRange` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Applicant` ADD COLUMN `expectedSalary` DECIMAL(15, 2) NULL;

-- AlterTable
ALTER TABLE `Job` DROP COLUMN `salaryRange`,
    ADD COLUMN `fixedSalary` DECIMAL(15, 2) NULL,
    ADD COLUMN `salaryCurrency` VARCHAR(10) NULL DEFAULT 'USD',
    ADD COLUMN `salaryRangeMax` DECIMAL(15, 2) NULL,
    ADD COLUMN `salaryRangeMin` DECIMAL(15, 2) NULL,
    ADD COLUMN `salaryType` VARCHAR(20) NULL;
