/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_createdById_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `Post`;

-- CreateTable
CREATE TABLE `Job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `skills` TEXT NOT NULL,
    `yearsOfExperience` TINYINT NOT NULL DEFAULT 0,
    `educationDegree` VARCHAR(100) NOT NULL,
    `educationField` VARCHAR(100) NULL,
    `timezone` VARCHAR(100) NOT NULL,
    `skillsWeight` DECIMAL(3, 2) NOT NULL DEFAULT 0.25,
    `experienceWeight` DECIMAL(3, 2) NOT NULL DEFAULT 0.25,
    `educationWeight` DECIMAL(3, 2) NOT NULL DEFAULT 0.25,
    `timezoneWeight` DECIMAL(3, 2) NOT NULL DEFAULT 0.25,
    `interviewing` TINYINT NOT NULL DEFAULT 0,
    `interviewsNeeded` TINYINT NOT NULL DEFAULT 1,
    `hires` TINYINT NOT NULL DEFAULT 0,
    `hiresNeeded` TINYINT NOT NULL DEFAULT 1,
    `isOpen` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NOT NULL,

    INDEX `Job_isOpen_createdAt_idx`(`isOpen`, `createdAt`),
    INDEX `Job_createdById_isOpen_idx`(`createdById`, `isOpen`),
    INDEX `Job_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Applicant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `resume` TEXT NOT NULL,
    `statusAI` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `skillsScoreAI` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    `experienceScoreAI` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    `educationScoreAI` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    `timezoneScoreAI` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    `overallScoreAI` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    `skillsFeedbackAI` TEXT NULL,
    `experienceFeedbackAI` TEXT NULL,
    `educationFeedbackAI` TEXT NULL,
    `timezoneFeedbackAI` TEXT NULL,
    `overallFeedbackAI` TEXT NULL,
    `currentStage` TINYINT NOT NULL DEFAULT 0,
    `interviewStatus` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `interviewNotes` TEXT NULL,
    `jobId` INTEGER NOT NULL,

    INDEX `Applicant_jobId_interviewStatus_idx`(`jobId`, `interviewStatus`),
    INDEX `Applicant_jobId_currentStage_idx`(`jobId`, `currentStage`),
    INDEX `Applicant_statusAI_idx`(`statusAI`),
    INDEX `Applicant_overallScoreAI_idx`(`overallScoreAI`),
    INDEX `Applicant_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Applicant` ADD CONSTRAINT `Applicant_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
