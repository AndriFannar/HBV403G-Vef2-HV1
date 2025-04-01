/*
  Warnings:

  - Made the column `description` on table `Condition` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Condition" ALTER COLUMN "description" SET NOT NULL;
