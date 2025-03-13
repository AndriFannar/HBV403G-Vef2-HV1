/*
  Warnings:

  - You are about to drop the column `is_correct` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `questions` table. All the data in the column will be lost.
  - Added the required column `isCorrect` to the `answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_category_id_fkey";

-- DropIndex
DROP INDEX "idx_answers_question_id";

-- AlterTable
ALTER TABLE "answers" DROP COLUMN "is_correct",
DROP COLUMN "question_id",
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL,
ADD COLUMN     "questionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "category_id",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "idx_answers_question_id" ON "answers"("questionId");

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
