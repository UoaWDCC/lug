import type {
  VALID_SKILL_LEVELS,
  VALID_INVOLVEMENTS,
  VALID_PROGRAMME_TYPES,
} from "./constants";

export type LinuxSkillLevel = (typeof VALID_SKILL_LEVELS)[number];
export type PotentialInvolvement = (typeof VALID_INVOLVEMENTS)[number];
export type ProgrammeType = (typeof VALID_PROGRAMME_TYPES)[number];

// Shared base fields present on every registration path
export type BaseMemberRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  discordUsername?: string;
  linuxSkillLevel: LinuxSkillLevel;
  potentialInvolvement: PotentialInvolvement[];
};

// Case 1: Conditional returning member
export type ConditionalReturningMember = BaseMemberRegistration & {
  isConditionalReturningMember: true;
  upi: string;
  studentId: string;
};

// Case 2: Current UoA student
export type CurrentUoaStudentMember = BaseMemberRegistration & {
  isConditionalReturningMember: false;
  isCurrentUoaStudent: true;
  upi: string;
  studentId: string;
  faculty: string[];
  programmeType: ProgrammeType;
  majors: string[];
  yearsRemaining?: number;
};

// Case 3: Non-current UoA student
export type NonCurrentUoaStudentMember = BaseMemberRegistration & {
  isConditionalReturningMember: false;
  isCurrentUoaStudent: false;
  primaryAffiliation: string;
  nonUoaExcerpt?: string;
  nonUoaPitch?: string;
};

// Union type used everywhere a registration is handled
export type MemberRegistration =
  | ConditionalReturningMember
  | CurrentUoaStudentMember
  | NonCurrentUoaStudentMember;
