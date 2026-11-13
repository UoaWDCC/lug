import { getPrisma } from "../lib/db/prisma";
import { Prisma, type Email } from "@/generated/prisma/client";
import {
  runRepositoryOperation,
  type RepositoryResult,
} from "@/repositories/repositoryResult";

export type CreateEmailResult = RepositoryResult<Email>;

export type UpdateEmailResult = RepositoryResult<Email>;

export type ClaimEmailResult = RepositoryResult<boolean>;

export async function createEmail(
  data: Prisma.EmailCreateInput,
): Promise<CreateEmailResult> {
  return runRepositoryOperation(() =>
    getPrisma().email.create({
      data,
    }),
  );
}

export async function findEmailById(id: string): Promise<Email | null> {
  return getPrisma().email.findUnique({
    where: {
      id,
    },
  });
}

export async function updateEmail(
  id: string,
  data: Prisma.EmailUpdateInput,
): Promise<UpdateEmailResult> {
  return runRepositoryOperation(() =>
    getPrisma().email.update({
      where: {
        id,
      },
      data,
    }),
  );
}

// Moves DRAFT -> SENDING in one query. `data` is false if the email wasn't a draft
// (already sending or sent), so a double-clicked Send can't send twice.
export async function claimEmailForSending(
  id: string,
): Promise<ClaimEmailResult> {
  return runRepositoryOperation(async () => {
    const { count } = await getPrisma().email.updateMany({
      where: {
        id,
        status: "DRAFT",
      },
      data: {
        status: "SENDING",
      },
    });

    return count === 1;
  });
}
