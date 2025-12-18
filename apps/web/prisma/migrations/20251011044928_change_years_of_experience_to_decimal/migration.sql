/*
  Warnings:

  - You are about to alter the column `parsedYearsOfExperience` on the `Applicant` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(6,2)`.

*/
-- AlterTable
ALTER TABLE `Applicant` MODIFY `parsedYearsOfExperience` DECIMAL(6, 2) NULL DEFAULT 0.00;
