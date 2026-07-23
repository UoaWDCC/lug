export type RegistrationPage =
  | "start"
  | "returningUoa"
  | "newMember"
  | "newUoa"
  | "newNonUoa"
  | "final";

export type RegistrationDraft = {
  page: RegistrationPage;
  pageStack: RegistrationPage[];

  // Start page
  email?: string;
  isConditionalReturningMember?: string;

  // New member page
  firstName?: string;
  lastName?: string;
  isCurrentUoaStudent?: string;

  // Returning/current UoA fields
  upi?: string;
  studentId?: string;

  // Current UoA only
  faculty?: string[];
  otherFaculty?: string;
  programme?: string;
  yearLevel?: string;

  // Non-UoA only
  primaryAffiliation?: string;
  nonUoaExcerpt?: string;
  nonUoaPitch?: string;

  // Final page
  linuxSkillLevel?: string;
  potentialInvolvement?: string[];
  discordUsername?: string;
};

export type RegistrationFormState = {
  error?: string;
  fields?: Partial<RegistrationDraft>;
} | null;
