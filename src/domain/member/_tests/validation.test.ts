import { describe, it, expect } from "vitest";
import { validateMemberRegistration } from "../validation";
// import { ParsedRegistrationFormSubmission } from "@/features/membership-registration/parseRegistrationFormData";
// import { ProgrammeType } from "@/generated/prisma/enums";
import { UnvalidatedMemberSubmission } from "../types";

// Base fixtures — one minimal valid submission per registration path.
// Each test spreads one of these and overrides exactly the field under test,
// so a failure only ever comes from the thing being tested.

const validCurrentUoaStudent: UnvalidatedMemberSubmission = {
  firstName: "Erling",
  lastName: "Haaland",
  email: "haaland@gmail.com",
  isCurrentUoaStudent: "yes",
  upi: "ehaa909",
  studentId: "123456788",
  faculty: ["science"],
  programmeType: "BACHELOR",
  majors: ["Computer Science"],
  yearsRemaining: 2,
  primaryAffiliation: null,
  nonUoaExcerpt: null,
  nonUoaPitch: null,
  linuxSkillLevel: "BEGINNER_USER",
  potentialInvolvement: ["ATTENDING"],
  discordUsername: null,
};

const validNonUoaStudent: UnvalidatedMemberSubmission = {
  firstName: "Kylian",
  lastName: "Mbappe",
  email: "dictator@gmail.com",
  isCurrentUoaStudent: "no",
  upi: null,
  studentId: null,
  faculty: [],
  programmeType: null,
  majors: [],
  yearsRemaining: undefined,
  primaryAffiliation: "Independent",
  nonUoaExcerpt: null,
  nonUoaPitch: null,
  linuxSkillLevel: "BEGINNER_USER",
  potentialInvolvement: ["ATTENDING"],
  discordUsername: "mbappe98",
};

describe("validateMemberRegistration - happy paths", () => {
  it("accepts a valid current UoA student submission", () => {
    const result = validateMemberRegistration(validCurrentUoaStudent);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        firstName: "Erling",
        lastName: "Haaland",
        email: "haaland@gmail.com",
        isCurrentUoaStudent: true,
        upi: "ehaa909",
        studentId: "123456788",
        faculty: ["science"],
        programmeType: "BACHELOR",
        majors: ["Computer Science"],
        yearsRemaining: 2,
        linuxSkillLevel: "BEGINNER_USER",
        potentialInvolvement: ["ATTENDING"],
        discordUsername: undefined,
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
        isCurrentUoaStudent: false,
        primaryAffiliation: "Independent",
        nonUoaExcerpt: undefined,
        nonUoaPitch: undefined,
        linuxSkillLevel: "BEGINNER_USER",
        potentialInvolvement: ["ATTENDING"],
        discordUsername: "mbappe98",
      });
    }
  });

  it("includes an optional discordUsername when provided", () => {
    const result = validateMemberRegistration({
      ...validNonUoaStudent,
      discordUsername: "mbappe98",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.discordUsername).toBe("mbappe98");
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
      ...validCurrentUoaStudent,
      firstName: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing lastName", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      lastName: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing email", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      email: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing linuxSkillLevel", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      linuxSkillLevel: null,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an empty potentialInvolvement array", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      potentialInvolvement: [],
    });

    expect(result.ok).toBe(false);
  });
});

describe("required field validation - current UoA student path", () => {
  it("requires isCurrentUoaStudent", () => {
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

describe("yearsRemaining validation", () => {
  it("accepts a BACHELOR student with yearsRemaining", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      programmeType: "BACHELOR",
      yearsRemaining: 2,
    });

    expect(result.ok).toBe(true);
  });

  it("rejects a BACHELOR student without yearsRemaining", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      programmeType: "BACHELOR",
      yearsRemaining: undefined,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message: "Please select how many years you have remaining.",
      },
    });
  });

  it("allows yearsRemaining to be omitted for a non-BACHELOR programme", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      programmeType: "MASTER",
      yearsRemaining: undefined,
    });

    expect(result.ok).toBe(true);
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
      ...validCurrentUoaStudent,
      email: "not-an-email",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an email over 254 characters", () => {
    const longEmail = `${"a".repeat(250)}@example.com`;
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      email: longEmail,
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - firstName/lastName length", () => {
  it("rejects a firstName over 100 characters", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      firstName: "a".repeat(101),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a lastName over 100 characters", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      lastName: "a".repeat(101),
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - linuxSkillLevel / potentialInvolvement", () => {
  it("rejects a linuxSkillLevel outside the known set", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      linuxSkillLevel: "WIZARD",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a potentialInvolvement entry outside the known set", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      potentialInvolvement: ["ATTENDING", "PRESIDENT"],
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - upi/studentId format", () => {
  it("rejects an invalid upi format", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      upi: "12345",
    });
    expect(result.ok).toBe(false);
  });

  it("accepts an uppercase upi (case-insensitive)", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      upi: "LMES910",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects an invalid studentId format", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      studentId: "123",
    });
    expect(result.ok).toBe(false);
  });
});

describe("field value validation - faculty", () => {
  it("rejects an invalid faculty", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      faculty: ["Invalid Faculty"],
    });

    expect(result.ok).toBe(false);
  });

  it("rejects a blank faculty value", () => {
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
      ...validCurrentUoaStudent,
      discordUsername: null,
    });
    expect(result.ok).toBe(true);
  });

  it("accepts any discordUsername content, regardless of format, as long as it's within the length limit", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      discordUsername: "Leo_Messi..GOAT",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a discordUsername over 32 characters", () => {
    const result = validateMemberRegistration({
      ...validCurrentUoaStudent,
      discordUsername: "a".repeat(33),
    });
    expect(result.ok).toBe(false);
  });
});
