/*
  Warnings:

  - You are about to alter the column `startMonth` on the `Experience` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(20)`.
  - You are about to alter the column `endMonth` on the `Experience` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `Experience` MODIFY `startYear` VARCHAR(4) NOT NULL,
    MODIFY `endYear` VARCHAR(4) NULL,
    MODIFY `startMonth` VARCHAR(20) NOT NULL,
    MODIFY `endMonth` VARCHAR(20) NULL;
