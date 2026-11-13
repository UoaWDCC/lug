import { decodeUnsubscribeToken } from "@/lib/email/unsubscribe";
import {
  addEmailAddressOptOut,
  removeEmailAddressOptOut,
} from "@/repositories/emailAddressOptOutRepository";

export type SubscriptionChange = "unsubscribe" | "resubscribe";

export type SubscriptionStatus =
  | "unsubscribed"
  | "resubscribed"
  | "invalid_token"
  | "error";

// Shared by the unsubscribe page and the one-click endpoint. A bad token never reaches the database.
export async function updateSubscription(
  token: string,
  change: SubscriptionChange,
): Promise<SubscriptionStatus> {
  const email = await decodeUnsubscribeToken(token);
  if (!email) return "invalid_token";

  const result =
    change === "unsubscribe"
      ? await addEmailAddressOptOut(email)
      : await removeEmailAddressOptOut(email);
  if (!result.ok) {
    console.error(`Mailing list: failed to ${change}`, result.error);
    return "error";
  }

  return change === "unsubscribe" ? "unsubscribed" : "resubscribed";
}
