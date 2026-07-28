/*
  Warnings:

  - A unique constraint covering the columns `[email,registrationYear]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[upi,studentId,registrationYear]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `registrationYear` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Member_email_key";

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "registrationYear" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_registrationYear_key" ON "Member"("email", "registrationYear");

-- CreateIndex
CREATE UNIQUE INDEX "Member_upi_studentId_registrationYear_key" ON "Member"("upi", "studentId", "registrationYear");
