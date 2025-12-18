-- AlterTable
ALTER TABLE `Applicant` ADD COLUMN `applicantLocation` VARCHAR(255) NULL,
    ADD COLUMN `willingToRelocate` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Job` MODIFY `location` VARCHAR(255) NULL;
