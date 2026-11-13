import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
  updateSubscription: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("../updateSubscription", () => ({
  updateSubscription: mocks.updateSubscription,
}));

import { resubscribeAction, unsubscribeAction } from "../subscriptionActions";

function form(token: string): FormData {
  const formData = new FormData();
  formData.set("token", token);
  return formData;
}

// redirect() throws in Next.js too, so the action stops there
async function redirectedTo(action: Promise<void>): Promise<string> {
  const error = await action.catch((e) => e);
  return String(error.message).replace("redirect:", "");
}

beforeEach(() => {
  mocks.updateSubscription.mockResolvedValue("unsubscribed");
});

describe("subscription actions", () => {
  it("unsubscribes and goes back to the page with the result", async () => {
    const url = await redirectedTo(unsubscribeAction(form("a.b.c")));

    expect(mocks.updateSubscription).toHaveBeenCalledWith(
      "a.b.c",
      "unsubscribe",
    );
    expect(url).toBe("/unsubscribe?token=a.b.c&status=unsubscribed");
  });

  it("resubscribes", async () => {
    mocks.updateSubscription.mockResolvedValue("resubscribed");

    const url = await redirectedTo(resubscribeAction(form("a.b.c")));

    expect(mocks.updateSubscription).toHaveBeenCalledWith(
      "a.b.c",
      "resubscribe",
    );
    expect(url).toBe("/unsubscribe?token=a.b.c&status=resubscribed");
  });

  it("passes an empty token on when the form has none", async () => {
    mocks.updateSubscription.mockResolvedValue("invalid_token");

    const url = await redirectedTo(unsubscribeAction(new FormData()));

    expect(mocks.updateSubscription).toHaveBeenCalledWith("", "unsubscribe");
    expect(url).toBe("/unsubscribe?token=&status=invalid_token");
  });
});
