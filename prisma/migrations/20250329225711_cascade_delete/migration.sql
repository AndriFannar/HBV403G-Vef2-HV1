-- DropForeignKey
ALTER TABLE "Actor" DROP CONSTRAINT "Actor_projectId_fkey";

-- DropForeignKey
ALTER TABLE "BusinessRule" DROP CONSTRAINT "BusinessRule_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Condition" DROP CONSTRAINT "Condition_useCaseId_fkey";

-- DropForeignKey
ALTER TABLE "Flow" DROP CONSTRAINT "Flow_useCaseId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectSequence" DROP CONSTRAINT "ProjectSequence_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Reference" DROP CONSTRAINT "Reference_stepId_fkey";

-- DropForeignKey
ALTER TABLE "Step" DROP CONSTRAINT "Step_flowId_fkey";

-- DropForeignKey
ALTER TABLE "UseCase" DROP CONSTRAINT "UseCase_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "UseCase" DROP CONSTRAINT "UseCase_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UseCaseSequence" DROP CONSTRAINT "UseCaseSequence_useCaseId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectSequence" ADD CONSTRAINT "ProjectSequence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actor" ADD CONSTRAINT "Actor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UseCaseSequence" ADD CONSTRAINT "UseCaseSequence_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UseCase" ADD CONSTRAINT "UseCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UseCase" ADD CONSTRAINT "UseCase_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRule" ADD CONSTRAINT "BusinessRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;
