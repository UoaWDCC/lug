import { ParsedRegistrationFormSubmission } from "@/features/membership-registration/parseRegistrationFormData";
import {
  BaseMemberRegistration,
  ConditionalReturningMember,
  CurrentUoaStudentMember,
  Faculty,
  LinuxSkillLevel,
  MemberRegistration,
  NonCurrentUoaStudentMember,
  PotentialInvolvement,
  YearLevel,
} from "./types";
import {
  MAX_LENGTHS,
  VALID_YEAR_LEVELS,
  VALID_INVOLVEMENTS,
  VALID_SKILL_LEVELS,
  VALID_FACULTIES,
} from "./constants";
import { exceedsMax } from "./exceedsMax";

type RegistrationFormValidationError = {
  message: string;
};

export function validateMemberRegistration(
  parsedRegistrationForm: ParsedRegistrationFormSubmission,
):
  | { ok: true; data: MemberRegistration }
  | { ok: false; error: RegistrationFormValidationError } {
  const requiredFields = validateRequiredFields(parsedRegistrationForm);
  if (requiredFields.ok === false) {
    return { ok: false, error: requiredFields.error };
  }

  const fieldContent = validateFieldValues(parsedRegistrationForm);
  if (fieldContent.fieldsValid === false) {
    return { ok: false, error: fieldContent.error };
  }

  return { ok: true, data: toMemberRegistration(parsedRegistrationForm) };
}

//validate if required fields exist and are not null/empty string/undefined etc.
function validateRequiredFields(
  parsed: ParsedRegistrationFormSubmission,
): { ok: true } | { ok: false; error: RegistrationFormValidationError } {
  //Base fields required by all registrations
  const baseRequiredFields = validateBaseRequiredFields(parsed);
  if (baseRequiredFields.ok === false) {
    return baseRequiredFields;
  }

  const registrationPathRrequiredFields =
    validateRegistrationPathRequiredFields(parsed);
  if (registrationPathRrequiredFields.ok === false) {
    return registrationPathRrequiredFields;
  }

  return { ok: true };
}

function validateBaseRequiredFields(
  parsed: ParsedRegistrationFormSubmission,
): { ok: true } | { ok: false; error: RegistrationFormValidationError } {
  const requiredFields: string[] = [
    "firstName",
    "lastName",
    "email",
    "linuxSkillLevel",
    "potentialInvolvement",
    "isConditionalReturningMember",
  ];
  const errorDisplayNames: string[] = [
    "First name",
    "Last name",
    "Email",
    "Linux skill level",
    "Potential involvement",
    "Is Conditional Returning Member",
  ];
  for (const field of requiredFields) {
    if (!(field in parsed) || !parsed[field as keyof typeof parsed]) {
      const displayName = errorDisplayNames[requiredFields.indexOf(field)];
      return {
        ok: false,
        error: {
          message: `'${displayName}' field is required, and must not be null or empty`,
        },
      };
    }
  }

  if (parsed.potentialInvolvement.length === 0) {
    return {
      ok: false,
      error: {
        message:
          "At least one option for Potential Involvement must be selected",
      },
    };
  }
  return { ok: true };
}

function validateRegistrationPathRequiredFields(
  parsed: ParsedRegistrationFormSubmission,
): { ok: true } | { ok: false; error: RegistrationFormValidationError } {
  //check if the value of isConditionalReturningMember and isCurrentUoaStudent is valid.
  //It is a validity check(thus should be in validateFields function) but is required for the following checks so is moved here.
  if (!["yes", "no"].includes(parsed.isConditionalReturningMember as string)) {
    return {
      ok: false,
      error: {
        message: `isConditionalReturningMember field has value: '${parsed.isConditionalReturningMember}', must either have value 'yes' or 'no'`,
      },
    };
  }

  // If Conditional Returning Member is "no", then isCurrentUoaStudent becomes a required field
  if (parsed.isConditionalReturningMember === "no") {
    if (!("isCurrentUoaStudent" in parsed) || !parsed.isCurrentUoaStudent) {
      return {
        ok: false,
        error: {
          message:
            "'isCurrentUoaStudent' field is required if not a Conditional Returning Member",
        },
      };
    }
    if (!["yes", "no"].includes(parsed.isCurrentUoaStudent as string)) {
      return {
        ok: false,
        error: {
          message: `isCurrentUoaStudent field has value: '${parsed.isCurrentUoaStudent}', must either have value 'yes' or 'no'`,
        },
      };
    }
  }

  // Further check for fields that are only required if specific conditions are met
  if (parsed.isConditionalReturningMember === "yes") {
    if (!("upi" in parsed) || !parsed.upi) {
      return {
        ok: false,
        error: { message: "upi field is required for Uoa students" },
      };
    }
    if (!("studentId" in parsed) || !parsed.studentId) {
      return {
        ok: false,
        error: { message: "Student ID field is required for Uoa students" },
      };
    }
  } else if (parsed.isCurrentUoaStudent === "yes") {
    const requiredFieldsUoa = [
      "upi",
      "studentId",
      "faculty",
      "programme",
      "yearLevel",
    ];
    const errorDisplayNamesUoa = [
      "upi",
      "Student ID",
      "Faculty",
      "Programme",
      "Year level",
    ];
    for (const field of requiredFieldsUoa) {
      if (!(field in parsed) || !parsed[field as keyof typeof parsed]) {
        const displayName =
          errorDisplayNamesUoa[requiredFieldsUoa.indexOf(field)];
        return {
          ok: false,
          error: {
            message: `'${displayName}' field is required for Uoa students, and must not be null or empty`,
          },
        };
      }
    }

    //Extra check for if faculty is empty, at this point existence of faculty field is verified.
    if (parsed.faculty.length === 0) {
      return {
        ok: false,
        error: {
          message: "'faculty' field must not be an empty array",
        },
      };
    }
  } else if (parsed.isCurrentUoaStudent === "no") {
    if (!("primaryAffiliation" in parsed) || !parsed.primaryAffiliation) {
      return {
        ok: false,
        error: {
          message:
            "'Primary Affiliation' field is required for non-Uoa candidates, and must not be null or empty",
        },
      };
    }
  }
  return { ok: true };
}

function validateFieldValues(
  parsed: ParsedRegistrationFormSubmission,
):
  | { fieldsValid: true }
  | { fieldsValid: false; error: RegistrationFormValidationError } {
  if (!isValidEmail(parsed.email)) {
    return {
      fieldsValid: false,
      error: {
        message: `Email invalid: '${parsed.email}', please enter a valid email address`,
      },
    };
  }

  if (exceedsMax(parsed.firstName, "firstName")) {
    return {
      fieldsValid: false,
      error: {
        message: `First name must be under ${MAX_LENGTHS.firstName} characters`,
      },
    };
  }

  if (exceedsMax(parsed.lastName, "lastName")) {
    return {
      fieldsValid: false,
      error: {
        message: `Last name must be under ${MAX_LENGTHS.lastName} characters`,
      },
    };
  }

  if (!isLinuxSkillLevel(parsed.linuxSkillLevel)) {
    return {
      fieldsValid: false,
      error: {
        message: `linuxSkillLevel property has invalid value: '${parsed.linuxSkillLevel}'`,
      },
    };
  }
  for (const option of parsed.potentialInvolvement) {
    if (!isPotentialInvolvement(option)) {
      return {
        fieldsValid: false,
        error: {
          message: `potentialInvolvement field contains a selection with invalid value: '${option}'`,
        },
      };
    }
  }

  if (
    parsed.isConditionalReturningMember === "yes" ||
    parsed.isCurrentUoaStudent === "yes"
  ) {
    if (!isValidUPI(parsed.upi)) {
      return {
        fieldsValid: false,
        error: {
          message: `upi invalid: '${parsed.upi}', please enter a valid upi`,
        },
      };
    }

    if (!isValidStudentId(parsed.studentId)) {
      return {
        fieldsValid: false,
        error: {
          message: `studentId invalid: '${parsed.studentId}', please enter a valid student ID`,
        },
      };
    }
  }
  if (parsed.isCurrentUoaStudent === "yes") {
    if (!isYearLevel(parsed.yearLevel)) {
      return {
        fieldsValid: false,
        error: {
          message: `yearLevel property has invalid value: ${parsed.yearLevel}`,
        },
      };
    }

    if (exceedsMax(parsed.programme, "programme")) {
      return {
        fieldsValid: false,
        error: {
          message: `Programme must be under ${MAX_LENGTHS.programme} characters`,
        },
      };
    }

    for (const facultyOption of parsed.faculty) {
      if (!isFaculty(facultyOption)) {
        return {
          fieldsValid: false,
          error: {
            message: `faculty field contains a selection with invalid value: '${facultyOption}'`,
          },
        };
      }
    }
  }

  if (parsed.isCurrentUoaStudent === "no") {
    if (exceedsMax(parsed.primaryAffiliation, "primaryAffiliation")) {
      return {
        fieldsValid: false,
        error: {
          message: `Primary affiliation must be under ${MAX_LENGTHS.primaryAffiliation} characters`,
        },
      };
    }

    if (exceedsMax(parsed.nonUoaExcerpt, "nonUoaExcerpt")) {
      return {
        fieldsValid: false,
        error: {
          message: `Excerpt must be under ${MAX_LENGTHS.nonUoaExcerpt} characters`,
        },
      };
    }

    if (exceedsMax(parsed.nonUoaPitch, "nonUoaPitch")) {
      return {
        fieldsValid: false,
        error: {
          message: `Pitch must be under ${MAX_LENGTHS.nonUoaPitch} characters`,
        },
      };
    }
  }

  if (exceedsMax(parsed.discordUsername, "discordUsername")) {
    return {
      fieldsValid: false,
      error: {
        message: `Discord username must be under ${MAX_LENGTHS.discordUsername} characters`,
      },
    };
  }

  return { fieldsValid: true };
}

function toMemberRegistration(
  parsedForm: ParsedRegistrationFormSubmission,
): MemberRegistration {
  if (parsedForm.isConditionalReturningMember === "yes") {
    return toConditionalReturningMember(parsedForm);
  } else if (parsedForm.isCurrentUoaStudent === "yes") {
    return toCurrentUoaStudentMember(parsedForm);
  } else {
    return toNonCurrentUoaStudentMember(parsedForm);
  }
}

function toConditionalReturningMember(
  parsed: ParsedRegistrationFormSubmission,
): ConditionalReturningMember {
  const returningMember: ConditionalReturningMember = {
    ...toBaseMemberRegistration(parsed),
    isConditionalReturningMember: true,
    upi: parsed.upi!,
    studentId: parsed.studentId!,
  };
  return returningMember;
}

function toCurrentUoaStudentMember(
  parsed: ParsedRegistrationFormSubmission,
): CurrentUoaStudentMember {
  const uoaMember: CurrentUoaStudentMember = {
    ...toBaseMemberRegistration(parsed),
    isConditionalReturningMember: false,
    isCurrentUoaStudent: true,

    upi: parsed.upi!,
    studentId: parsed.studentId!,
    faculty: parsed.faculty as Faculty[],
    programme: parsed.programme!,
    yearLevel: parsed.yearLevel! as YearLevel,
  };
  return uoaMember;
}
function toNonCurrentUoaStudentMember(
  parsed: ParsedRegistrationFormSubmission,
): NonCurrentUoaStudentMember {
  const nonUoaMember: NonCurrentUoaStudentMember = {
    ...toBaseMemberRegistration(parsed),
    isConditionalReturningMember: false,
    isCurrentUoaStudent: false,
    primaryAffiliation: parsed.primaryAffiliation!,
    ...(parsed.nonUoaExcerpt !== null
      ? { nonUoaExcerpt: parsed.nonUoaExcerpt }
      : {}),
    ...(parsed.nonUoaPitch !== null ? { nonUoaPitch: parsed.nonUoaPitch } : {}),
  };
  return nonUoaMember;
}

function toBaseMemberRegistration(
  parsed: ParsedRegistrationFormSubmission,
): BaseMemberRegistration {
  const baseRegistration: BaseMemberRegistration = {
    firstName: parsed.firstName!,
    lastName: parsed.lastName!,
    email: parsed.email!,

    linuxSkillLevel: parsed.linuxSkillLevel as LinuxSkillLevel,
    potentialInvolvement: parsed.potentialInvolvement as PotentialInvolvement[],
    //only create dc username property if property exists in provided info
    ...(parsed.discordUsername !== null
      ? { discordUsername: parsed.discordUsername }
      : {}),
  };
  return baseRegistration;
}

function isValidUPI(upi: string | null): boolean {
  if (upi === null) return false;
  const upiRegex = /^[A-Za-z]{3,4}[0-9]{3}$/;
  return upiRegex.test(upi);
}

function isValidStudentId(studentId: string | null): boolean {
  if (studentId === null) return false;
  const studentIdRegex = /^[0-9]{9,10}$/;
  return studentIdRegex.test(studentId);
}

function isValidEmail(email: string | null): boolean {
  if (email === null) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.length <= 254 && emailRegex.test(email);
}

function isLinuxSkillLevel(value: string | null): value is LinuxSkillLevel {
  return (
    value !== null && VALID_SKILL_LEVELS.includes(value as LinuxSkillLevel)
  );
}

function isYearLevel(value: string | null): value is YearLevel {
  return value !== null && VALID_YEAR_LEVELS.includes(value as YearLevel);
}

function isPotentialInvolvement(value: string): value is PotentialInvolvement {
  return (
    value !== null && VALID_INVOLVEMENTS.includes(value as PotentialInvolvement)
  );
}

function isFaculty(value: string): value is Faculty {
  return value !== null && VALID_FACULTIES.includes(value as Faculty);
}
