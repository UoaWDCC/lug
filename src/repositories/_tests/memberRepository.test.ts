import { describe, it, expect, vi, afterEach } from "vitest";
import type { MemberRegistration } from "@/domain/member/types";

const mockCreate = vi.hoisted(() => vi.fn());

const { FakePrismaClientKnownRequestError } = vi.hoisted(() => {
  class FakePrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      Object.setPrototypeOf(this, FakePrismaClientKnownRequestError.prototype);
    }
  }
  return { FakePrismaClientKnownRequestError };
});

vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    member: { create: mockCreate },
  }),
}));

vi.mock("@/generated/prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: FakePrismaClientKnownRequestError,
  },
}));

import { createMembershipRegistration } from "../memberRepository";

const currentYear = new Date().getFullYear();

const currentUoaStudent: MemberRegistration = {
  firstName: "Amy",
  lastName: "Chen",
  email: "amy@example.com",
  isConditionalReturningMember: false,
  isCurrentUoaStudent: true,
  upi: "achen123",
  studentId: "123456789",
  faculty: ["science"],
  programmeType: "BACHELOR",
  majors: ["Computer Science"],
  linuxSkillLevel: "BEGINNER_USER",
  potentialInvolvement: ["ATTENDING"],
};

const conditionalReturningMember: MemberRegistration = {
  firstName: "Ben",
  lastName: "Wu",
  email: "ben@example.com",
  isConditionalReturningMember: true,
  upi: "bwu456",
  studentId: "987654321",
  linuxSkillLevel: "POWER_USER",
  potentialInvolvement: [],
};

const nonUoaMember: MemberRegistration = {
  firstName: "Cara",
  lastName: "Lopez",
  email: "cara@example.com",
  isConditionalReturningMember: false,
  isCurrentUoaStudent: false,
  primaryAffiliation: "AUT",
  linuxSkillLevel: "NOTHING",
  potentialInvolvement: ["SPEAKING"],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("createMembershipRegistration", () => {
  it("maps a current UoA student registration to the correct create input", async () => {
    mockCreate.mockResolvedValueOnce({});

    const result = await createMembershipRegistration(currentUoaStudent);

    expect(result).toEqual({ ok: true });
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firstName: "Amy",
        lastName: "Chen",
        email: "amy@example.com",
        registrationYear: currentYear,
        faculty: ["science"],
        majors: ["Computer Science"],
        programmeType: "BACHELOR",
        upi: "achen123",
        studentId: "123456789",
        isCurrentUoaStudent: true,
      }),
    });
  });

  it("maps a conditional returning member registration without UoA-only fields", async () => {
    mockCreate.mockResolvedValueOnce({});

    const result = await createMembershipRegistration(
      conditionalReturningMember,
    );

    expect(result).toEqual({ ok: true });
    const callArg = mockCreate.mock.calls[0][0].data;
    expect(callArg.upi).toBe("bwu456");
    expect(callArg.studentId).toBe("987654321");
    expect(callArg.registrationYear).toBe(currentYear);
    expect(callArg.faculty).toBeUndefined();
    expect(callArg.programmeType).toBeUndefined();
    expect(callArg.majors).toBeUndefined();
  });

  it("maps a non-UoA member registration with an empty faculty array", async () => {
    mockCreate.mockResolvedValueOnce({});

    const result = await createMembershipRegistration(nonUoaMember);

    expect(result).toEqual({ ok: true });
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        faculty: [],
        primaryAffiliation: "AUT",
        isCurrentUoaStudent: false,
        registrationYear: currentYear,
      }),
    });
  });

  it("returns a duplicate error on a P2002 constraint violation", async () => {
    mockCreate.mockRejectedValueOnce(
      new FakePrismaClientKnownRequestError(
        "Unique constraint failed",
        "P2002",
      ),
    );

    const result = await createMembershipRegistration(currentUoaStudent);

    expect(result).toEqual({ ok: false, error: { type: "duplicate" } });
  });

  it("returns a database error for a non-P2002 Prisma error", async () => {
    mockCreate.mockRejectedValueOnce(
      new FakePrismaClientKnownRequestError("Foreign key failed", "P2003"),
    );

    const result = await createMembershipRegistration(currentUoaStudent);

    expect(result).toEqual({ ok: false, error: { type: "database" } });
  });

  it("returns a database error for a non-Prisma error", async () => {
    mockCreate.mockRejectedValueOnce(new Error("connection refused"));

    const result = await createMembershipRegistration(currentUoaStudent);

    expect(result).toEqual({ ok: false, error: { type: "database" } });
  });
});
