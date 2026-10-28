import { describe, it, expect, vi, afterEach } from "vitest";

const mockUpsert = vi.hoisted(() => vi.fn());
const mockDeleteMany = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    emailOptOut: {
      upsert: mockUpsert,
      deleteMany: mockDeleteMany,
      findMany: mockFindMany,
    },
  }),
}));

import {
  addEmailOptOut,
  findAllOptedOutEmails,
  removeEmailOptOut,
} from "../emailOptOutRepository";

afterEach(() => {
  vi.clearAllMocks();
});

describe("addEmailOptOut", () => {
  it("stores the email trimmed and lowercased", async () => {
    mockUpsert.mockResolvedValueOnce({ email: "amy@example.com" });

    const result = await addEmailOptOut("  Amy@Example.com ");

    expect(result.ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { email: "amy@example.com" },
      create: { email: "amy@example.com" },
      update: {},
    });
  });

  it("returns a database error when the query fails", async () => {
    mockUpsert.mockRejectedValueOnce(new Error("connection refused"));

    const result = await addEmailOptOut("amy@example.com");

    expect(result).toEqual({ ok: false, error: { type: "database" } });
  });
});

describe("removeEmailOptOut", () => {
  it("deletes by lowercased email and returns how many rows went", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 1 });

    const result = await removeEmailOptOut("Amy@Example.com");

    expect(result).toEqual({ ok: true, data: 1 });
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { email: "amy@example.com" },
    });
  });

  it("succeeds when the email was not opted out", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });

    const result = await removeEmailOptOut("amy@example.com");

    expect(result).toEqual({ ok: true, data: 0 });
  });
});

describe("findAllOptedOutEmails", () => {
  it("returns just the email strings", async () => {
    mockFindMany.mockResolvedValueOnce([
      { email: "amy@example.com" },
      { email: "ben@example.com" },
    ]);

    const result = await findAllOptedOutEmails();

    expect(result).toEqual(["amy@example.com", "ben@example.com"]);
  });
});
