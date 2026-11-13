/*
  Warnings:

  - You are about to drop the `EmailOptOut` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "EmailOptOut";

-- CreateTable
CREATE TABLE "EmailAddressOptOut" (
    "emailAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAddressOptOut_pkey" PRIMARY KEY ("emailAddress")
);
