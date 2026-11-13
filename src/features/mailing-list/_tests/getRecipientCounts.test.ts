import { beforeEach, describe, expect, it, vi } from "vitest";

const { findAudienceMembersMock, findAllOptedOutEmailAddressesMock } =
  vi.hoisted(() => ({
    findAudienceMembersMock: vi.fn(),
    findAllOptedOutEmailAddressesMock: vi.fn(),
  }));

vi.mock("@/repositories/memberRepository", () => ({
  findAudienceMembers: findAudienceMembersMock,
}));

vi.mock("@/repositories/emailAddressOptOutRepository", () => ({
  findAllOptedOutEmailAddresses: findAllOptedOutEmailAddressesMock,
}));

import { getRecipientCounts } from "../getRecipientCounts";

const amy = {
  email: "amy@example.com",
  isCurrentUoaStudent: true,
  upi: "achen123",
  studentId: "123456789",
};
const ben = {
  email: "ben@example.com",
  isCurrentUoaStudent: false,
  upi: null,
  studentId: null,
};
const cara = {
  email: "cara@example.com",
  isCurrentUoaStudent: true,
  upi: "clop456",
  studentId: "987654321",
};

beforeEach(() => {
  findAudienceMembersMock.mockReset();
  findAllOptedOutEmailAddressesMock.mockReset();
});

describe("getRecipientCounts", () => {
  it("counts every audience option from one load of the data", async () => {
    findAudienceMembersMock.mockResolvedValue({
      currentMembers: [amy, ben, cara],
      earlierMembers: [{ ...amy, email: "amy.old@example.com" }],
    });
    findAllOptedOutEmailAddressesMock.mockResolvedValue([]);

    const counts = await getRecipientCounts();

    expect(counts).toEqual({ all: 3, new: 2, returning: 1, uoa: 2 });
    expect(findAudienceMembersMock).toHaveBeenCalledTimes(1);
    expect(findAllOptedOutEmailAddressesMock).toHaveBeenCalledTimes(1);
  });

  it("leaves opted-out members out of every count", async () => {
    findAudienceMembersMock.mockResolvedValue({
      currentMembers: [amy, ben, cara],
      earlierMembers: [],
    });
    findAllOptedOutEmailAddressesMock.mockResolvedValue(["cara@example.com"]);

    const counts = await getRecipientCounts();

    expect(counts).toEqual({ all: 2, new: 2, returning: 0, uoa: 1 });
  });
});
