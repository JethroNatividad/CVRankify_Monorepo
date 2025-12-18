-- AlterTable
ALTER TABLE `Applicant` ADD COLUMN `parsedEducationField` VARCHAR(100) NULL,
    ADD COLUMN `parsedHighestEducationDegree` VARCHAR(100) NULL,
    ADD COLUMN `parsedSkills` TEXT NULL,
    ADD COLUMN `parsedTimezone` VARCHAR(100) NULL,
    ADD COLUMN `parsedYearsOfExperience` INTEGER NULL;
