import { getPrisma } from "../lib/db/prisma";
import { normaliseEmail } from "@/domain/email/audience";
import type { EmailOptOut } from "@/generated/prisma/client";
import {
  runRepositoryOperation,
  type RepositoryResult,
} from "@/repositories/repositoryResult";

export type AddEmailOptOutResult = RepositoryResult<EmailOptOut>;

export type RemoveEmailOptOutResult = RepositoryResult<number>;

// Upsert so unsubscribing twice (e.g. clicking an old email's link again) still succeeds.
export async function addEmailOptOut(
  email: string,
): Promise<AddEmailOptOutResult> {
  const normalisedEmail = normaliseEmail(email);

  return runRepositoryOperation(() =>
    getPrisma().emailOptOut.upsert({
      where: {
        email: normalisedEmail,
      },
      create: {
        email: normalisedEmail,
      },
      update: {},
    }),
  );
}

// deleteMany rather than delete, so resubscribing when not opted out isn't an error.
export async function removeEmailOptOut(
  email: string,
): Promise<RemoveEmailOptOutResult> {
  return runRepositoryOperation(async () => {
    const { count } = await getPrisma().emailOptOut.deleteMany({
      where: {
        email: normaliseEmail(email),
      },
    });

    return count;
  });
}

export async function findAllOptedOutEmails(): Promise<string[]> {
  const optOuts = await getPrisma().emailOptOut.findMany({
    select: {
      email: true,
    },
  });

  return optOuts.map((optOut) => optOut.email);
}
