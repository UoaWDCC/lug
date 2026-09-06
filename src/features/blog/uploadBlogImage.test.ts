import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, uploadMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  uploadMock: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/lib/storage/localStorage", () => ({
  imageStorage: {
    upload: uploadMock,
  },
}));

import uploadBlogImage from "./uploadBlogImage";

beforeEach(() => {
  requireAdminMock.mockReset();
  uploadMock.mockReset();
  requireAdminMock.mockResolvedValue({ adminId: 1, role: "PRESIDENT" });
});

describe("uploadBlogImage", () => {
  it("requires admin before reading the file", async () => {
    const authError = new Error("Unauthenticated");
    requireAdminMock.mockRejectedValueOnce(authError);

    await expect(uploadBlogImage(new FormData())).rejects.toBe(authError);

    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("returns an error when the file is missing", async () => {
    const result = await uploadBlogImage(new FormData());

    expect(result).toEqual({ error: "Missing file: file" });
    expect(uploadMock).not.toHaveBeenCalled();
  });
});
