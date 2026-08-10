import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, deleteMemberMock, redirectMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  deleteMemberMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/repositories/memberRepository", () => ({
  deleteMember: deleteMemberMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import deleteMemberAction from "../deleteMemberAction";

beforeEach(() => {
  requireAdminMock.mockReset();
  deleteMemberMock.mockReset();
  redirectMock.mockClear();
  requireAdminMock.mockResolvedValue({ adminId: 1, role: "PRESIDENT" });
});

describe("deleteMemberAction", () => {
  it.each([Number.NaN, -1, 0, 1.5])(
    "returns invalid_id for invalid member ID %s",
    async (id) => {
      const result = await deleteMemberAction(id);

      expect(result).toEqual({ ok: false, error: "invalid_id" });
      expect(deleteMemberMock).not.toHaveBeenCalled();
    },
  );

  it("calls requireAdmin before validating the member ID", async () => {
    const authError = new Error("Unauthenticated");
    requireAdminMock.mockRejectedValueOnce(authError);

    await expect(deleteMemberAction(-1)).rejects.toBe(authError);

    expect(deleteMemberMock).not.toHaveBeenCalled();
  });

  it("returns not_found when the member does not exist", async () => {
    deleteMemberMock.mockResolvedValueOnce({
      ok: false,
      error: { type: "not_found" },
    });

    const result = await deleteMemberAction(999);

    expect(deleteMemberMock).toHaveBeenCalledWith(999);
    expect(result).toEqual({ ok: false, error: "not_found" });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns database when deletion fails", async () => {
    deleteMemberMock.mockResolvedValueOnce({
      ok: false,
      error: { type: "database" },
    });

    const result = await deleteMemberAction(10);

    expect(result).toEqual({ ok: false, error: "database" });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects after successful deletion", async () => {
    deleteMemberMock.mockResolvedValueOnce({ ok: true });

    await expect(deleteMemberAction(10)).rejects.toThrow(
      "REDIRECT:/admin/members",
    );

    expect(deleteMemberMock).toHaveBeenCalledWith(10);
    expect(redirectMock).toHaveBeenCalledWith("/admin/members");
  });
});
