/*
  Warnings:

  - You are about to alter the column `skillsScoreAI` on the `Applicant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,2)` to `Decimal(6,2)`.
  - You are about to alter the column `experienceScoreAI` on the `Applicant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,2)` to `Decimal(6,2)`.
  - You are about to alter the column `educationScoreAI` on the `Applicant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,2)` to `Decimal(6,2)`.
  - You are about to alter the column `timezoneScoreAI` on the `Applicant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,2)` to `Decimal(6,2)`.
  - You are about to alter the column `overallScoreAI` on the `Applicant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(4,2)` to `Decimal(6,2)`.

*/
-- AlterTable
ALTER TABLE `Applicant` MODIFY `skillsScoreAI` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    MODIFY `experienceScoreAI` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    MODIFY `educationScoreAI` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    MODIFY `timezoneScoreAI` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    MODIFY `overallScoreAI` DECIMAL(6, 2) NOT NULL DEFAULT 0.00;
