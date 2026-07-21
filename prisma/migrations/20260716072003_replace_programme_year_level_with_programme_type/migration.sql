/*
  Warnings:

  - You are about to drop the column `programme` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `yearLevel` on the `Member` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProgrammeType" AS ENUM ('TFC_PRE_UNI', 'BACHELOR', 'MASTER', 'PHD', 'OTHER');

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "programme",
DROP COLUMN "yearLevel",
ADD COLUMN     "majors" TEXT[],
ADD COLUMN     "programmeType" "ProgrammeType",
ADD COLUMN     "yearsRemaining" INTEGER;

-- DropEnum
DROP TYPE "YearLevel";
