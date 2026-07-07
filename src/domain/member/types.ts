export type LinuxSkillLevel =
  | "NOTHING"
  | "AWARE_OF_EXISTENCE"
  | "BEGINNER_USER"
  | "REGULAR_USER"
  | "POWER_USER"
  | "CONTRIBUTOR";

export type PotentialInvolvement =
  | "ATTENDING"
  | "SPEAKING"
  | "EXECUTIVE"
  | "PROJECTS";

export type YearLevel =
  | "FIRST_YEAR"
  | "SECOND_YEAR"
  | "THIRD_YEAR"
  | "FOURTH_YEAR"
  | "FIFTH_YEAR_OR_LATER"
  | "GRADUATED_WITHIN_2_YEARS";

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
  programme: string;
  yearLevel: YearLevel;
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
