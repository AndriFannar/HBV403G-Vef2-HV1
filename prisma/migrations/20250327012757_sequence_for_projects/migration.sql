/*
  Warnings:

  - You are about to drop the column `businessRuleCount` on the `Project` table. All the data in the column will be lost.
  - Changed the type of `entityType` on the `UseCaseSequence` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProjectCounterType" AS ENUM ('BUSINESSRULE', 'USECASE');

-- CreateEnum
CREATE TYPE "UseCaseCounterType" AS ENUM ('ALTERNATEFLOW', 'EXCEPTIONFLOW', 'PRECONDITION', 'POSTCONDITION');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "businessRuleCount";

-- AlterTable
ALTER TABLE "UseCaseSequence" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "UseCaseCounterType" NOT NULL;

-- DropEnum
DROP TYPE "EntityType";

-- CreateTable
CREATE TABLE "ProjectSequence" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "entityType" "ProjectCounterType" NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "ProjectSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSequence_projectId_entityType_key" ON "ProjectSequence"("projectId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "UseCaseSequence_useCaseId_entityType_key" ON "UseCaseSequence"("useCaseId", "entityType");

-- AddForeignKey
ALTER TABLE "ProjectSequence" ADD CONSTRAINT "ProjectSequence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
