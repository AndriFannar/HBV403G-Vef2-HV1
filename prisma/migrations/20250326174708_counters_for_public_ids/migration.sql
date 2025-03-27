/*
  Warnings:

  - You are about to drop the `_ConditionToUseCase` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId,publicId]` on the table `BusinessRule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[useCaseId,publicId]` on the table `Condition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[useCaseId,publicId]` on the table `Flow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[flowId,publicId]` on the table `Step` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,publicId]` on the table `UseCase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `useCaseId` to the `Condition` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('ALTERNATEFLOW', 'EXCEPTIONFLOW', 'PRECONDITION', 'POSTCONDITION');

-- DropForeignKey
ALTER TABLE "_ConditionToUseCase" DROP CONSTRAINT "_ConditionToUseCase_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConditionToUseCase" DROP CONSTRAINT "_ConditionToUseCase_B_fkey";

-- AlterTable
ALTER TABLE "Condition" ADD COLUMN     "useCaseId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Flow" ADD COLUMN     "stepCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "businessRuleCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_ConditionToUseCase";

-- CreateTable
CREATE TABLE "UseCaseSequence" (
    "id" SERIAL NOT NULL,
    "useCaseId" INTEGER NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "UseCaseSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UseCaseSequence_useCaseId_entityType_key" ON "UseCaseSequence"("useCaseId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessRule_projectId_publicId_key" ON "BusinessRule"("projectId", "publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Condition_useCaseId_publicId_key" ON "Condition"("useCaseId", "publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Flow_useCaseId_publicId_key" ON "Flow"("useCaseId", "publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Step_flowId_publicId_key" ON "Step"("flowId", "publicId");

-- CreateIndex
CREATE UNIQUE INDEX "UseCase_projectId_publicId_key" ON "UseCase"("projectId", "publicId");

-- AddForeignKey
ALTER TABLE "UseCaseSequence" ADD CONSTRAINT "UseCaseSequence_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
