import { describe, it, expect } from "vitest";
import { validateMemberRegistration } from "../validation";
import { ParsedRegistrationFormSubmission } from "@/features/membership-registration/parseRegistrationFormData";

// Base fixtures — one minimal valid submission per registration path.
// Each test spreads one of these and overrides exactly the field under test,
// so a failure only ever comes from the thing being tested.

const validReturningMember: ParsedRegistrationFormSubmission = {
  firstName: "Lionel",
  lastName: "Messi",
  email: "lionelmessithegoat@gmail.com",
  isConditionalReturningMember: "yes",
  isCurrentUoaStudent: null,
  upi: "lmes910",
  studentId: "123456789",
  faculty: [],
  majors: [],
  programme: null,
  yearLevel: null,
  primaryAffiliation: null,
  nonUoaExcerpt: null,
  nonUoaPitch: null,
  linuxSkillLevel: "BEGINNER_USER",
  potentialInvolvement: ["ATTENDING"],
  discordUsername: null,
};

const validCurrentUoaStudent: ParsedRegistrationFormSubmission = {
  firstName: "Erling",
  lastName: "Haaland",
  email: "haaland@gmail.com",
  isConditionalReturningMember: "no",
  isCurrentUoaStudent: "yes",
  upi: "ehaa909",
  studentId: "123456788",
  faculty: ["science"],
  majors: ["Computer Science"],
  programme: null,
  yearLevel: null,
  primaryAffiliation: null,
  nonUoaExcerpt: null,
  nonUoaPitch: null,
  linuxSkillLevel: "BEGINNER_USER",
  potentialInvolvement: ["ATTENDING"],
  discordUsername: null,
};

const validNonUoaStudent: ParsedRegistrationFormSubmission = {
  firstName: "Kylian",
  lastName: "Mbappe",
  email: "dictator@gmail.com",
  isConditionalReturningMember: "no",
  isCurrentUoaStudent: "no",
  upi: null,
  studentId: null,
  faculty: [],
  majors: [],
  programme: null,
  yearLevel: null,
  primaryAffiliation: "Independent",
  nonUoaExcerpt: null,
  nonUoaPitch: null,
  linuxSkillLevel: "BEGINNER_USER",
  potentialInvolvement: ["ATTENDING"],
  discordUsername: null,
};

describe("validateMemberRegistration - happy paths", () => {
  it("accepts a valid conditional returning member submission", () => {
    const result = validateMemberRegistration(validReturningMember);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        firstName: "Lionel",
        lastName: "Messi",
        email: "lionelmessithegoat@gmail.com",
        linuxSkillLevel: "BEGINNER_USER",
        potentialInvolvement: ["ATTENDING"],
        isConditionalReturningMember: true,
        upi: "lmes910",
        studentId: "123456789",
      });
    }
  });

  it("accepts a valid current UoA student submission", () => {
    const result = validateMemberRegistration(validCurrentUoaStudent);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        firstName: "Erling",
        lastName: "Haaland",
        email: "haaland@gmail.com",
        linuxSkillLevel: "BEGINNER_USER",
        potentialInvolvement: ["ATTENDING"],
        isConditionalReturningMember: false,
        isCurrentUoaStudent: true,
        upi: "ehaa909",
        studentId: "123456788",
        faculty: ["science"],
        programmeType: "OTHER",
        majors: ["Computer Science"],
      });
    }
  });

  it("accepts a valid non-UoA student submission", () => {
    const result = validateMemberRegistration(validNonUoaStudent);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        firstName: "Kylian",
        lastName: "Mbappe",
        email: "dictator@gmail.com",
        linuxSkillLevel: "BEGINNER_USER",
        potentialInvolvement: ["ATTENDING"],
        isConditionalReturningMember: false,
        isCurrentUoaStudent: false,
        primaryAffiliation: "Independent",
      });
    }
  });

  it("includes an optional discordUsername when provided", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      discordUsername: "goat_leo",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.discordUsername).toBe("goat_leo");
    }
  });

  it("includes optional nonUoaExcerpt/nonUoaPitch when provided", () => {
    const result = validateMemberRegistration({
      ...validNonUoaStudent,
      nonUoaExcerpt: "I build things.",
      nonUoaPitch: "I want to learn Linux.",
    });
    expect(result.ok).toBe(true);
    if (result.ok && "nonUoaExcerpt" in result.data) {
      expect(result.data.nonUoaExcerpt).toBe("I build things.");
      expect(result.data.nonUoaPitch).toBe("I want to learn Linux.");
    }
  });
});

describe("required field validation - base fields", () => {
  it("rejects a missing firstName", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      firstName: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing lastName", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      lastName: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing email", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      email: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing linuxSkillLevel", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      linuxSkillLevel: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing isConditionalReturningMember", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      isConditionalReturningMember: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an isConditionalReturningMember value that isn't yes/no", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      isConditionalReturningMember: "maybe",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an empty potentialInvolvement array", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      potentialInvolvement: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/Potential Involvement/);
    }
  });
});

describe("required field validation - conditional returning member path", () => {
  it("rejects a missing upi", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      upi: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing studentId", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      studentId: null,
    });
    expect(result.ok).toBe(false);
  });
});

describe("required field validation - current UoA student path", () => {
  it("requires isCurrentUoaStudent when not a returning member", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      isCurrentUoaStudent: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an isCurrentUoaStudent value that isn't yes/no", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      isCurrentUoaStudent: "maybe",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing upi", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      upi: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing studentId", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      studentId: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an empty faculty array", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      faculty: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/faculty/);
    }
  });
});

describe("required field validation - non-UoA student path", () => {
  it("rejects a missing primaryAffiliation", () => {
    const result = validateMemberRegistration({
      ...validNonUoaStudent,
      primaryAffiliation: null,
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - email", () => {
  it("rejects an invalid email format", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      email: "not-an-email",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an email over 254 characters", () => {
    const longEmail = `${"a".repeat(250)}@example.com`;
    const result = validateMemberRegistration({
      ...validReturningMember,
      email: longEmail,
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - firstName/lastName length", () => {
  it("rejects a firstName over 100 characters", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      firstName: "a".repeat(101),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a lastName over 100 characters", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      lastName: "a".repeat(101),
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - linuxSkillLevel / potentialInvolvement", () => {
  it("rejects a linuxSkillLevel outside the known set", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      linuxSkillLevel: "WIZARD",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a potentialInvolvement entry outside the known set", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      potentialInvolvement: ["ATTENDING", "PRESIDENT"],
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - upi/studentId format", () => {
  it("rejects an invalid upi format", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      upi: "12345",
    });
    expect(result.ok).toBe(false);
  });

  it("accepts an uppercase upi (case-insensitive)", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      upi: "LMES910",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects an invalid studentId format", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      studentId: "123",
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - faculty (current UoA path)", () => {
  it("rejects a faculty entry over 100 characters", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      faculty: ["a".repeat(101)],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a faculty entry that is blank", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      faculty: ["   "],
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - non-UoA path length checks", () => {
  it("rejects a primaryAffiliation over 150 characters", () => {
    const result = validateMemberRegistration({
      ...validNonUoaStudent,
      primaryAffiliation: "a".repeat(151),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a nonUoaExcerpt over 500 characters", () => {
    const result = validateMemberRegistration({
      ...validNonUoaStudent,
      nonUoaExcerpt: "a".repeat(501),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a nonUoaPitch over 500 characters", () => {
    const result = validateMemberRegistration({
      ...validNonUoaStudent,
      nonUoaPitch: "a".repeat(501),
    });
    expect(result.ok).toBe(false);
  });

  it("accepts nonUoaExcerpt/nonUoaPitch exactly at the limit (boundary)", () => {
    const result = validateMemberRegistration({
      ...validNonUoaStudent,
      nonUoaExcerpt: "a".repeat(500),
      nonUoaPitch: "a".repeat(500),
    });
    expect(result.ok).toBe(true);
  });
});

describe("field value validation - discordUsername", () => {
  it("accepts a null discordUsername (optional field, not provided)", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      discordUsername: null,
    });
    expect(result.ok).toBe(true);
  });

  it("accepts any discordUsername content, regardless of format, as long as it's within the length limit", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      discordUsername: "Leo_Messi..GOAT",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a discordUsername over 32 characters", () => {
    const result = validateMemberRegistration({
      ...validReturningMember,
      discordUsername: "a".repeat(33),
    });
    expect(result.ok).toBe(false);
  });
});
