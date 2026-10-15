import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, updateMemberMock, redirectMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  updateMemberMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/repositories/memberRepository", () => ({
  updateMember: updateMemberMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import updateMemberAction from "../updateMemberAction";

function buildFormData(
  overrides: Record<string, string | string[] | undefined> = {},
): FormData {
  const fields: Record<string, string | string[] | undefined> = {
    id: "1",
    firstName: "  Ada ",
    lastName: "Lovelace",
    email: " Ada@Example.com ",
    discordUsername: "",
    faculty: ["science"],
    programmeType: "BACHELOR",
    majors: ["Computer Science", "", ""],
    yearsRemaining: "2",
    linuxSkillLevel: "BEGINNER_USER",
    potentialInvolvement: ["ATTENDING"],
    primaryAffiliation: "",
    nonUoaExcerpt: "",
    nonUoaPitch: "",
    ...overrides,
  };

  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      formData.append(name, item);
    }
  }
  return formData;
}

beforeEach(() => {
  requireAdminMock.mockReset();
  updateMemberMock.mockReset();
  redirectMock.mockClear();
  requireAdminMock.mockResolvedValue({ adminId: 1, role: "PRESIDENT" });
  updateMemberMock.mockResolvedValue({ ok: true });
});

describe("updateMemberAction", () => {
  it("normalises valid data and redirects to the members page", async () => {
    await expect(updateMemberAction(buildFormData())).rejects.toThrow(
      "REDIRECT:/admin/members",
    );

    expect(updateMemberMock).toHaveBeenCalledWith(1, {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      discordUsername: null,
      faculty: ["science"],
      programmeType: "BACHELOR",
      majors: ["Computer Science"],
      yearsRemaining: 2,
      linuxSkillLevel: "BEGINNER_USER",
      potentialInvolvement: ["ATTENDING"],
      primaryAffiliation: null,
      nonUoaExcerpt: null,
      nonUoaPitch: null,
    });
  });

  it("treats blank programme type and years remaining as null", async () => {
    await expect(
      updateMemberAction(
        buildFormData({ programmeType: "", yearsRemaining: "" }),
      ),
    ).rejects.toThrow("REDIRECT:/admin/members");

    expect(updateMemberMock).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ programmeType: null, yearsRemaining: null }),
    );
  });

  it.each(["", "abc", "-1", "0", "1.5"])(
    "returns invalid_id for member ID %j",
    async (id) => {
      const result = await updateMemberAction(buildFormData({ id }));

      expect(result).toEqual({
        ok: false,
        error: "invalid_id",
        message: "The member ID is invalid.",
      });
      expect(updateMemberMock).not.toHaveBeenCalled();
    },
  );

  it.each<[string, Record<string, string | string[] | undefined>, string]>([
    ["missing first name", { firstName: "   " }, "First name is required"],
    ["long last name", { lastName: "a".repeat(101) }, "Last name is required"],
    [
      "invalid email",
      { email: "not-an-email" },
      "Enter a valid email address.",
    ],
    ["missing email", { email: undefined }, "Enter a valid email address."],
    [
      "long discord username",
      { discordUsername: "a".repeat(33) },
      "Discord username must be at most",
    ],
    [
      "too many faculties",
      { faculty: ["science", "law", "business"] },
      "Select at most 2 faculties.",
    ],
    [
      "invalid faculty",
      { faculty: ["science", "astrology"] },
      "Select a valid faculty.",
    ],
    [
      "too many majors",
      { majors: ["a", "b", "c", "d", "e"] },
      "Enter at most 4 majors",
    ],
    ["long major", { majors: ["a".repeat(41)] }, "Enter at most 4 majors"],
    [
      "invalid programme type",
      { programmeType: "DIPLOMA" },
      "Select a valid programme type.",
    ],
    [
      "invalid years remaining",
      { yearsRemaining: "6" },
      "Select a valid number of years remaining.",
    ],
    [
      "invalid skill level",
      { linuxSkillLevel: "WIZARD" },
      "Select a valid Linux skill level.",
    ],
    [
      "missing skill level",
      { linuxSkillLevel: undefined },
      "Select a valid Linux skill level.",
    ],
    [
      "no potential involvement",
      { potentialInvolvement: [] },
      "Select at least one valid potential involvement option.",
    ],
    [
      "invalid potential involvement",
      { potentialInvolvement: ["ATTENDING", "NAPPING"] },
      "Select at least one valid potential involvement option.",
    ],
    [
      "long primary affiliation",
      { primaryAffiliation: "a".repeat(151) },
      "Primary affiliation must be at most",
    ],
    [
      "long non-UoA excerpt",
      { nonUoaExcerpt: "a".repeat(501) },
      "Non-UoA excerpt must be at most",
    ],
    [
      "long non-UoA pitch",
      { nonUoaPitch: "a".repeat(501) },
      "Non-UoA pitch must be at most",
    ],
  ])("returns invalid_data for %s", async (_, overrides, message) => {
    const result = await updateMemberAction(buildFormData(overrides));

    expect(result).toEqual({
      ok: false,
      error: "invalid_data",
      message: expect.stringContaining(message),
    });
    expect(updateMemberMock).not.toHaveBeenCalled();
  });

  it.each([
    ["not_found", "The member could not be found."],
    ["duplicate", "That email is already used by another registration."],
    ["database", "The member could not be updated. Please try again."],
  ])("maps repository error %s to a message", async (type, message) => {
    updateMemberMock.mockResolvedValue({ ok: false, error: { type } });

    const result = await updateMemberAction(buildFormData());

    expect(result).toEqual({ ok: false, error: type, message });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
