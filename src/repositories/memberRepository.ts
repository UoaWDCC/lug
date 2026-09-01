import { getPrisma } from "../lib/db/prisma";
import { MemberRegistration } from "@/domain/member/types";
import { Prisma } from "@/generated/prisma/client";

import type {
  LinuxSkillLevel,
  PotentialInvolvement,
  ProgrammeType,
} from "@/domain/member/types";

// for accepting member-update data - restricts updating irrelevant fields (compared with prisma.MemberUpdateInput)
export type MemberUpdateData = {
  firstName: string;
  lastName: string;
  email: string;
  discordUsername: string | null;

  faculty: string[];
  programmeType: ProgrammeType | null;
  majors: string[];
  yearsRemaining: number | null;

  linuxSkillLevel: LinuxSkillLevel;
  potentialInvolvement: PotentialInvolvement[];

  primaryAffiliation: string | null;
  nonUoaExcerpt: string | null;
  nonUoaPitch: string | null;
};

type RepositoryResult<TError extends string> =
  | { ok: true }
  | { ok: false; error: { type: TError } };

type CreateMembershipRegistrationResult = RepositoryResult<
  "duplicate" | "database"
>;

type UpdateMemberResult = RepositoryResult<
  "not_found" | "duplicate" | "database"
>;
type DeleteMemberResult = RepositoryResult<"not_found" | "database">;

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

export async function findMemberById(id: number) {
  return getPrisma().member.findUnique({
    where: { id },
  });
}

export async function findMemberByUpiAndStudentId(
  upi: string,
  studentId: string,
) {
  const currentYear = new Date().getFullYear();

  return getPrisma().member.findFirst({
    where: { upi, studentId, registrationYear: { lt: currentYear } },
    orderBy: { registrationYear: "desc" },
  });
}

export async function findAllMembers() {
  return getPrisma().member.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

function toMemberCreateInput(
  registration: MemberRegistration,
): Prisma.MemberCreateInput {
  const memberData = {
    // Unconditional fields
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    registrationYear: new Date().getFullYear(),
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
            majors: registration.majors,
            programmeType: registration.programmeType,
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

export async function updateMember(
  id: number,
  data: MemberUpdateData,
): Promise<UpdateMemberResult> {
  try {
    await getPrisma().member.update({
      where: { id },
      data,
    });

    return { ok: true };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { ok: false, error: { type: "not_found" } };
      }

      if (error.code === "P2002") {
        return { ok: false, error: { type: "duplicate" } };
      }
    }

    return { ok: false, error: { type: "database" } };
  }
}

export async function deleteMember(id: number): Promise<DeleteMemberResult> {
  try {
    await getPrisma().member.delete({ where: { id } });
    return { ok: true };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { ok: false, error: { type: "not_found" } };
      }
    }
    return { ok: false, error: { type: "database" } };
  }
}
