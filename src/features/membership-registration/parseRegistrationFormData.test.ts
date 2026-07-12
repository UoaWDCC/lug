import { describe, expect, it } from "vitest";
import { parseRegistrationFormData } from "./parseRegistrationFormData";

describe("parseRegistrationFormData", () => {
  it("parses a complete valid-looking form submission into the expected object", () => {
    const formData = new FormData();

    formData.set("firstName", "  David  ");
    formData.set("lastName", "  Raya  ");
    formData.set("email", "  DAVID@EXAMPLE.COM  ");

    formData.set("isConditionalReturningMember", "no");
    formData.set("isCurrentUoaStudent", "yes");

    formData.set("upi", "  DRAY123  ");
    formData.set("studentId", "  123456789  ");

    formData.append("faculty", "science");
    formData.append("faculty", "  engineeringDesign  ");

    formData.set("programme", "  Bachelor of Science  ");
    formData.set("yearLevel", "  year2  ");

    formData.set("primaryAffiliation", "  university-student  ");
    formData.set("nonUoaExcerpt", "  I like Linux.  ");
    formData.set("nonUoaPitch", "  I want to join the club.  ");

    formData.set("linuxSkillLevel", "  BEGINNER_USER  ");

    formData.append("potentialInvolvement", "  ATTENDING  ");
    formData.append("potentialInvolvement", "  PROJECTS  ");

    formData.set("discordUsername", "  davidraya  ");

    expect(parseRegistrationFormData(formData)).toEqual({
      firstName: "David",
      lastName: "Raya",
      email: "david@example.com",

      isConditionalReturningMember: "no",
      isCurrentUoaStudent: "yes",

      upi: "dray123",
      studentId: "123456789",

      faculty: ["science", "engineeringDesign"],
      programme: "Bachelor of Science",
      yearLevel: "year2",

      primaryAffiliation: "university-student",
      nonUoaExcerpt: "I like Linux.",
      nonUoaPitch: "I want to join the club.",

      linuxSkillLevel: "BEGINNER_USER",
      potentialInvolvement: ["ATTENDING", "PROJECTS"],
      discordUsername: "davidraya",
    });
  });

  it("handles missing fields safely", () => {
    const formData = new FormData();
    expect(parseRegistrationFormData(formData)).toEqual({
      firstName: null,
      lastName: null,
      email: null,

      isConditionalReturningMember: null,
      isCurrentUoaStudent: null,

      upi: null,
      studentId: null,

      faculty: [],
      programme: null,
      yearLevel: null,

      primaryAffiliation: null,
      nonUoaExcerpt: null,
      nonUoaPitch: null,

      linuxSkillLevel: null,
      potentialInvolvement: [],
      discordUsername: null,
    });
  });

  it("normalises empty and whitespace values", () => {
    const formData = new FormData();

    formData.set("firstName", "");
    formData.set("lastName", "   ");
    formData.set("email", "   ");
    formData.set("upi", "   ");
    formData.set("studentId", "   ");

    formData.append("faculty", "");
    formData.append("faculty", "   ");
    formData.append("faculty", "science");

    formData.append("potentialInvolvement", "");
    formData.append("potentialInvolvement", "   ");
    formData.append("potentialInvolvement", "ATTENDING");

    expect(parseRegistrationFormData(formData)).toMatchObject({
      firstName: null,
      lastName: null,
      email: null,
      upi: null,
      studentId: null,
      faculty: ["science"],
      potentialInvolvement: ["ATTENDING"],
    });
  });
});
