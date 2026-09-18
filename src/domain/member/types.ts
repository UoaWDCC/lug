import type {
  VALID_SKILL_LEVELS,
  VALID_INVOLVEMENTS,
  VALID_PROGRAMME_TYPES,
  VALID_FACULTIES,
} from "./constants";

export type LinuxSkillLevel = (typeof VALID_SKILL_LEVELS)[number];
export type PotentialInvolvement = (typeof VALID_INVOLVEMENTS)[number];
export type ProgrammeType = (typeof VALID_PROGRAMME_TYPES)[number];
export type Faculty = (typeof VALID_FACULTIES)[number];

export type UnvalidatedMemberSubmission = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isCurrentUoaStudent: string | null;
  upi: string | null;
  studentId: string | null;
  faculty: string[];
  majors: string[];
  programmeType: string | null;
  yearsRemaining: number | undefined;
  primaryAffiliation: string | null;
  nonUoaExcerpt: string | null;
  nonUoaPitch: string | null;
  linuxSkillLevel: string | null;
  potentialInvolvement: string[];
  discordUsername: string | null;
};

export type BaseMemberRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  discordUsername?: string;
  linuxSkillLevel: LinuxSkillLevel;
  potentialInvolvement: PotentialInvolvement[];
};

export type CurrentUoaStudentMember = BaseMemberRegistration & {
  isCurrentUoaStudent: true;
  upi: string;
  studentId: string;
  faculty: Faculty[];
  programmeType: ProgrammeType;
  majors: string[];
  yearsRemaining?: number;
};

export type NonCurrentUoaStudentMember = BaseMemberRegistration & {
  isCurrentUoaStudent: false;
  primaryAffiliation: string;
  nonUoaExcerpt?: string;
  nonUoaPitch?: string;
};

export type MemberRegistration =
  | CurrentUoaStudentMember
  | NonCurrentUoaStudentMember;
