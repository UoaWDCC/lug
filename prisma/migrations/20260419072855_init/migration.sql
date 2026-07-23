-- CreateEnum
CREATE TYPE "University" AS ENUM ('UNIVERSITY_OF_AUCKLAND', 'OTHER');

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "university" "University" NOT NULL,
    "isReturning" BOOLEAN NOT NULL,
    "skillLevel" INTEGER NOT NULL,
    "upi" TEXT,
    "studentId" TEXT,
    "faculty" TEXT[],
    "programme" TEXT,
    "yearLevel" TEXT,
    "excerpt" TEXT,
    "pitch" TEXT,
    "potentialInvolvement" TEXT,
    "discordUser" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
