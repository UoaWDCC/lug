import { describe, it, expect, vi, afterEach } from "vitest";

const mockUpsert = vi.hoisted(() => vi.fn());
const mockDeleteMany = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  getPrisma: () => ({
    emailAddressOptOut: {
      upsert: mockUpsert,
      deleteMany: mockDeleteMany,
      findMany: mockFindMany,
    },
  }),
}));

import {
  addEmailAddressOptOut,
  findAllOptedOutEmailAddresses,
  removeEmailAddressOptOut,
} from "../emailAddressOptOutRepository";

afterEach(() => {
  vi.clearAllMocks();
});

describe("addEmailAddressOptOut", () => {
  it("stores the email trimmed and lowercased", async () => {
    mockUpsert.mockResolvedValueOnce({ emailAddress: "amy@example.com" });

    const result = await addEmailAddressOptOut("  Amy@Example.com ");

    expect(result.ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { emailAddress: "amy@example.com" },
      create: { emailAddress: "amy@example.com" },
      update: {},
    });
  });

  it("returns a database error when the query fails", async () => {
    mockUpsert.mockRejectedValueOnce(new Error("connection refused"));

    const result = await addEmailAddressOptOut("amy@example.com");

    expect(result).toEqual({ ok: false, error: { type: "database" } });
  });
});

describe("removeEmailAddressOptOut", () => {
  it("deletes by lowercased email and returns how many rows went", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 1 });

    const result = await removeEmailAddressOptOut("Amy@Example.com");

    expect(result).toEqual({ ok: true, data: 1 });
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { emailAddress: "amy@example.com" },
    });
  });

  it("succeeds when the email was not opted out", async () => {
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });

    const result = await removeEmailAddressOptOut("amy@example.com");

    expect(result).toEqual({ ok: true, data: 0 });
  });
});

describe("findAllOptedOutEmailAddresses", () => {
  it("returns just the email strings", async () => {
    mockFindMany.mockResolvedValueOnce([
      { emailAddress: "amy@example.com" },
      { emailAddress: "ben@example.com" },
    ]);

    const result = await findAllOptedOutEmailAddresses();

    expect(result).toEqual(["amy@example.com", "ben@example.com"]);
  });
});
