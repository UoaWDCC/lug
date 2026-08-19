import { describe, it, expect, vi, afterEach } from "vitest";
import type { MemberRegistration } from "@/domain/member/types";

const mockCreate = vi.hoisted(() => vi.fn());
const mockFindFirst = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    member: { create: mockCreate, findFirst: mockFindFirst },
  }),
}));

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

vi.mock("@/generated/prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: FakePrismaClientKnownRequestError,
  },
}));

import {
  createMembershipRegistration,
  findMemberByUpiAndStudentId,
} from "../memberRepository";

const currentYear = new Date().getFullYear();

const currentUoaStudent: MemberRegistration = {
  firstName: "Amy",
  lastName: "Chen",
  email: "amy@example.com",
  isCurrentUoaStudent: true,
  upi: "achen123",
  studentId: "123456789",
  faculty: ["science"],
  programmeType: "BACHELOR",
  majors: ["Computer Science"],
  yearsRemaining: 2,
  linuxSkillLevel: "BEGINNER_USER",
  potentialInvolvement: ["ATTENDING"],
};

const nonUoaMember: MemberRegistration = {
  firstName: "Cara",
  lastName: "Lopez",
  email: "cara@example.com",
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
        yearsRemaining: 2,
        programmeType: "BACHELOR",
        upi: "achen123",
        studentId: "123456789",
        isCurrentUoaStudent: true,
      }),
    });
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

describe("findMemberByUpiAndStudentId", () => {
  it("queries for the most recent registration before the current year", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    await findMemberByUpiAndStudentId("abc123", "123456789");

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        upi: "abc123",
        studentId: "123456789",
        registrationYear: { lt: currentYear },
      },
      orderBy: { registrationYear: "desc" },
    });
  });

  it("returns the member record when a match exists", async () => {
    const previousMember = {
      id: 1,
      firstName: "Amy",
      email: "amy@example.com",
      registrationYear: currentYear - 1,
    };
    mockFindFirst.mockResolvedValueOnce(previousMember);

    const result = await findMemberByUpiAndStudentId("abc123", "123456789");

    expect(result).toEqual(previousMember);
  });

  it("returns null when no prior registration exists", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const result = await findMemberByUpiAndStudentId("xyz999", "000000000");

    expect(result).toBeNull();
  });
});
