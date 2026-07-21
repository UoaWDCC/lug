import { getPrisma } from "../lib/db/prisma";
import { MemberRegistration } from "@/domain/member/types";
import { Prisma } from "@/generated/prisma/client";

type CreateMembershipRegistrationResult =
  | { ok: true }
  | { ok: false; error: { type: "duplicate" | "database" } };

export async function findMemberByUpiAndStudentId(
  upi: string,
  studentId: string,
) {
  return getPrisma().member.findFirst({
    where: {
      upi,
      studentId,
    },
  });
}

export async function createMembershipRegistration(
  registration: MemberRegistration,
): Promise<CreateMembershipRegistrationResult> {
  const memberData = toMemberCreateInput(registration);
  try {
    await getPrisma().member.create({ data: memberData });
    return { ok: true };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { ok: false, error: { type: "duplicate" } };
      }
    }

    return { ok: false, error: { type: "database" } };
  }
}

function toMemberCreateInput(
  registration: MemberRegistration,
): Prisma.MemberCreateInput {
  const memberData = {
    // Unconditional fields
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    linuxSkillLevel: registration.linuxSkillLevel,
    potentialInvolvement: registration.potentialInvolvement,
    discordUsername: registration.discordUsername,

    // Shared conditional field
    isConditionalReturningMember: registration.isConditionalReturningMember,
  };

  // Non-shared conditional fields
  const conditionalData =
    registration.isConditionalReturningMember === true
      ? {
          upi: registration.upi,
          studentId: registration.studentId,
        }
      : registration.isCurrentUoaStudent === true
        ? {
            faculty: registration.faculty,
            programme: registration.programme,
            yearLevel: registration.yearLevel,
            upi: registration.upi,
            studentId: registration.studentId,
            isCurrentUoaStudent: registration.isCurrentUoaStudent,
          }
        : {
            faculty: [],
            primaryAffiliation: registration.primaryAffiliation,
            nonUoaExcerpt: registration.nonUoaExcerpt,
            nonUoaPitch: registration.nonUoaPitch,
            isCurrentUoaStudent: registration.isCurrentUoaStudent,
          };

  return { ...memberData, ...conditionalData };
}
