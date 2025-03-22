/*
  Warnings:

  - You are about to drop the column `useCaseId` on the `BusinessRule` table. All the data in the column will be lost.
  - You are about to drop the column `useCaseId` on the `Condition` table. All the data in the column will be lost.
  - You are about to drop the column `stepNo` on the `Step` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `BusinessRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `UseCase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BusinessRule" DROP CONSTRAINT "BusinessRule_useCaseId_fkey";

-- DropForeignKey
ALTER TABLE "Condition" DROP CONSTRAINT "Condition_useCaseId_fkey";

-- DropIndex
DROP INDEX "BusinessRule_publicId_key";

-- DropIndex
DROP INDEX "Condition_publicId_key";

-- DropIndex
DROP INDEX "Flow_publicId_key";

-- DropIndex
DROP INDEX "UseCase_publicId_key";

-- AlterTable
ALTER TABLE "BusinessRule" DROP COLUMN "useCaseId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Condition" DROP COLUMN "useCaseId";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Step" DROP COLUMN "stepNo",
ADD COLUMN     "publicId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UseCase" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "dateCreated" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "_ConditionToUseCase" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConditionToUseCase_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BusinessRuleToUseCase" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BusinessRuleToUseCase_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ConditionToUseCase_B_index" ON "_ConditionToUseCase"("B");

-- CreateIndex
CREATE INDEX "_BusinessRuleToUseCase_B_index" ON "_BusinessRuleToUseCase"("B");

-- AddForeignKey
ALTER TABLE "BusinessRule" ADD CONSTRAINT "BusinessRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConditionToUseCase" ADD CONSTRAINT "_ConditionToUseCase_A_fkey" FOREIGN KEY ("A") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConditionToUseCase" ADD CONSTRAINT "_ConditionToUseCase_B_fkey" FOREIGN KEY ("B") REFERENCES "UseCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessRuleToUseCase" ADD CONSTRAINT "_BusinessRuleToUseCase_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessRuleToUseCase" ADD CONSTRAINT "_BusinessRuleToUseCase_B_fkey" FOREIGN KEY ("B") REFERENCES "UseCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
