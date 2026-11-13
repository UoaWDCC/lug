import { describe, it, expect } from "vitest";
import { selectRecipientAddresses } from "../audience";
import type { AudienceMember } from "../types";

function member(overrides: Partial<AudienceMember> = {}): AudienceMember {
  return {
    email: "someone@example.com",
    isCurrentUoaStudent: false,
    upi: null,
    studentId: null,
    ...overrides,
  };
}

const newStudent = member({
  email: "new@aucklanduni.ac.nz",
  isCurrentUoaStudent: true,
  upi: "abcd123",
  studentId: "111",
});
const returningByEmail = member({ email: "Back@Example.com" });
const returningByUpi = member({
  email: "changed@aucklanduni.ac.nz",
  isCurrentUoaStudent: true,
  upi: "wxyz789",
  studentId: "222",
});

const currentMembers = [newStudent, returningByEmail, returningByUpi];
const earlierMembers = [
  member({ email: "back@example.com" }),
  member({ email: "old@aucklanduni.ac.nz", upi: "wxyz789", studentId: "222" }),
];

function recipients(
  audience: Parameters<typeof selectRecipientAddresses>[0]["audience"],
  optedOutEmailAddresses: string[] = [],
) {
  return selectRecipientAddresses({
    audience,
    currentMembers,
    earlierMembers,
    optedOutEmailAddresses,
  });
}

describe("selectRecipientAddresses", () => {
  it("sends to everyone this year for ALL, lowercased", () => {
    expect(recipients("ALL")).toEqual([
      "new@aucklanduni.ac.nz",
      "back@example.com",
      "changed@aucklanduni.ac.nz",
    ]);
  });

  it("only includes current UoA students for UOA_STUDENTS", () => {
    expect(recipients("UOA_STUDENTS")).toEqual([
      "new@aucklanduni.ac.nz",
      "changed@aucklanduni.ac.nz",
    ]);
  });

  it("treats a matching earlier email (any case) or upi + student ID as returning", () => {
    expect(recipients("RETURNING")).toEqual([
      "back@example.com",
      "changed@aucklanduni.ac.nz",
    ]);
  });

  it("treats everyone else as new", () => {
    expect(recipients("NEW")).toEqual(["new@aucklanduni.ac.nz"]);
  });

  it("doesn't match on upi alone", () => {
    const result = selectRecipientAddresses({
      audience: "RETURNING",
      currentMembers: [member({ upi: "abcd123", studentId: null })],
      earlierMembers: [member({ email: "x@y.com", upi: "abcd123" })],
      optedOutEmailAddresses: [],
    });
    expect(result).toEqual([]);
  });

  it("leaves out opted-out members, ignoring case", () => {
    expect(recipients("ALL", ["BACK@example.com"])).toEqual([
      "new@aucklanduni.ac.nz",
      "changed@aucklanduni.ac.nz",
    ]);
  });

  it("lists an address once even if it registered twice with different casing", () => {
    const result = selectRecipientAddresses({
      audience: "ALL",
      currentMembers: [
        member({ email: "dup@example.com" }),
        member({ email: "DUP@example.com" }),
      ],
      earlierMembers: [],
      optedOutEmailAddresses: [],
    });
    expect(result).toEqual(["dup@example.com"]);
  });
});
