/*
  Warnings:

  - You are about to drop the column `medical_condition` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "medical_condition",
ADD COLUMN     "medical_conditions" TEXT;
