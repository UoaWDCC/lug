import { getPrisma } from "../lib/db/prisma";
import { normaliseEmail } from "@/domain/email/audience";
import type { EmailAddressOptOut } from "@/generated/prisma/client";
import {
  runRepositoryOperation,
  type RepositoryResult,
} from "@/repositories/repositoryResult";

export type AddEmailAddressOptOutResult = RepositoryResult<EmailAddressOptOut>;

export type RemoveEmailAddressOptOutResult = RepositoryResult<number>;

// Upsert so unsubscribing twice (e.g. clicking an old email's link again) still succeeds.
export async function addEmailAddressOptOut(
  emailAddress: string,
): Promise<AddEmailAddressOptOutResult> {
  const normalised = normaliseEmail(emailAddress);

  return runRepositoryOperation(() =>
    getPrisma().emailAddressOptOut.upsert({
      where: {
        emailAddress: normalised,
      },
      create: {
        emailAddress: normalised,
      },
      update: {},
    }),
  );
}

// deleteMany rather than delete, so resubscribing when not opted out isn't an error.
export async function removeEmailAddressOptOut(
  emailAddress: string,
): Promise<RemoveEmailAddressOptOutResult> {
  return runRepositoryOperation(async () => {
    const { count } = await getPrisma().emailAddressOptOut.deleteMany({
      where: {
        emailAddress: normaliseEmail(emailAddress),
      },
    });

    return count;
  });
}

export async function findAllOptedOutEmailAddresses(): Promise<string[]> {
  const optOuts = await getPrisma().emailAddressOptOut.findMany({
    select: {
      emailAddress: true,
    },
  });

  return optOuts.map((optOut) => optOut.emailAddress);
}
