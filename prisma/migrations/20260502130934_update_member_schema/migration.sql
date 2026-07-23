/*
  Warnings:

  - You are about to drop the column `discordUser` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `excerpt` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `isReturning` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `pitch` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `skillLevel` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `university` on the `Member` table. All the data in the column will be lost.
  - The `yearLevel` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `potentialInvolvement` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `firstName` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isConditionalReturningMember` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linuxSkillLevel` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LinuxSkillLevel" AS ENUM ('NOTHING', 'AWARE_OF_EXISTENCE', 'BEGINNER_USER', 'REGULAR_USER', 'POWER_USER', 'CONTRIBUTOR');

-- CreateEnum
CREATE TYPE "PotentialInvolvement" AS ENUM ('ATTENDING', 'SPEAKING', 'EXECUTIVE', 'PROJECTS');

-- CreateEnum
CREATE TYPE "YearLevel" AS ENUM ('FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FOURTH_YEAR', 'FIFTH_YEAR_OR_LATER', 'GRADUATED_WITHIN_2_YEARS');

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "discordUser",
DROP COLUMN "excerpt",
DROP COLUMN "isReturning",
DROP COLUMN "name",
DROP COLUMN "pitch",
DROP COLUMN "skillLevel",
DROP COLUMN "university",
ADD COLUMN     "discordUsername" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isConditionalReturningMember" BOOLEAN NOT NULL,
ADD COLUMN     "isCurrentUoaStudent" BOOLEAN,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "linuxSkillLevel" "LinuxSkillLevel" NOT NULL,
ADD COLUMN     "nonUoaExcerpt" TEXT,
ADD COLUMN     "nonUoaPitch" TEXT,
ADD COLUMN     "primaryAffiliation" TEXT,
DROP COLUMN "yearLevel",
ADD COLUMN     "yearLevel" "YearLevel",
DROP COLUMN "potentialInvolvement",
ADD COLUMN     "potentialInvolvement" "PotentialInvolvement"[];

-- DropEnum
DROP TYPE "University";
