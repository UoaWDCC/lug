export type ParsedRegistrationFormSubmission = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;

  isConditionalReturningMember: string | null;
  isCurrentUoaStudent: string | null;

  upi: string | null;
  studentId: string | null;

  faculty: string[];
  programme: string | null;
  yearLevel: string | null;

  primaryAffiliation: string | null;
  nonUoaExcerpt: string | null;
  nonUoaPitch: string | null;

  linuxSkillLevel: string | null;
  potentialInvolvement: string[];
  discordUsername: string | null;
};

function getTextField(formData: FormData, fieldName: string): string | null {
  const value = formData.get(fieldName);
  if (typeof value !== "string") {
    return null;
  }
  const trimmedValue = value.trim();
  return trimmedValue === "" ? null : trimmedValue;
}

function getLowercaseTextField(
  formData: FormData,
  fieldName: string,
): string | null {
  const value = getTextField(formData, fieldName);

  return value === null ? null : value.toLowerCase();
}

function getCheckboxGroup(formData: FormData, fieldName: string): string[] {
  return formData
    .getAll(fieldName)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value !== "");
}

export function parseRegistrationFormData(
  formData: FormData,
): ParsedRegistrationFormSubmission {
  return {
    firstName: getTextField(formData, "firstName"),
    lastName: getTextField(formData, "lastName"),
    email: getLowercaseTextField(formData, "email"),

    isConditionalReturningMember: getTextField(
      formData,
      "isConditionalReturningMember",
    ),
    isCurrentUoaStudent: getTextField(formData, "isCurrentUoaStudent"),

    upi: getLowercaseTextField(formData, "upi"),
    studentId: getTextField(formData, "studentId"),
    faculty: getCheckboxGroup(formData, "faculty"),
    programme: getTextField(formData, "programme"),
    yearLevel: getTextField(formData, "yearLevel"),

    primaryAffiliation: getTextField(formData, "primaryAffiliation"),
    nonUoaExcerpt: getTextField(formData, "nonUoaExcerpt"),
    nonUoaPitch: getTextField(formData, "nonUoaPitch"),

    linuxSkillLevel: getTextField(formData, "linuxSkillLevel"),
    potentialInvolvement: getCheckboxGroup(formData, "potentialInvolvement"),
    discordUsername: getTextField(formData, "discordUsername"),
  };
}
