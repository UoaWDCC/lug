import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";
import {
  addEmailOptOut,
  removeEmailOptOut,
} from "@/repositories/emailOptOutRepository";

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
  const email = await verifyUnsubscribeToken(token);
  if (!email) return "invalid_token";

  const result =
    change === "unsubscribe"
      ? await addEmailOptOut(email)
      : await removeEmailOptOut(email);
  if (!result.ok) {
    console.error(`Mailing list: failed to ${change}`, result.error);
    return "error";
  }

  return change === "unsubscribe" ? "unsubscribed" : "resubscribed";
}
