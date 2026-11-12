-- RenameTable
ALTER TABLE "EmailOptOut" RENAME TO "EmailAddressOptOut";

-- RenameColumn
ALTER TABLE "EmailAddressOptOut" RENAME COLUMN "email" TO "emailAddress";
