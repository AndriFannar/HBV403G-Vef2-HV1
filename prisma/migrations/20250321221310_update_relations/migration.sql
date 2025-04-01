/*
  Warnings:

  - The values [ALT] on the enum `FlowType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ref` on the `Reference` table. All the data in the column will be lost.
  - Changed the type of `conditionType` on the `Condition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `refType` to the `Reference` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('PRECONDITION', 'POSTCONDITION');

-- AlterEnum
BEGIN;
CREATE TYPE "FlowType_new" AS ENUM ('NORMAL', 'ALTERNATE', 'EXCEPTION');
ALTER TABLE "Flow" ALTER COLUMN "flowType" TYPE "FlowType_new" USING ("flowType"::text::"FlowType_new");
ALTER TYPE "FlowType" RENAME TO "FlowType_old";
ALTER TYPE "FlowType_new" RENAME TO "FlowType";
DROP TYPE "FlowType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Condition" DROP COLUMN "conditionType",
ADD COLUMN     "conditionType" "ConditionType" NOT NULL;

-- AlterTable
ALTER TABLE "Reference" DROP COLUMN "ref",
ADD COLUMN     "refType" "ReferenceType" NOT NULL;

-- DropEnum
DROP TYPE "conditionType";
