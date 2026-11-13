// This file: two server actions for the unsubscribe page's forms.

"use server";

import { redirect } from "next/navigation";
import {
  updateSubscription,
  type SubscriptionChange,
} from "./updateSubscription";

export async function unsubscribeAction(formData: FormData): Promise<void> {
  await changeSubscription(formData, "unsubscribe");
}

export async function resubscribeAction(formData: FormData): Promise<void> {
  await changeSubscription(formData, "resubscribe");
}

async function changeSubscription(
  formData: FormData,
  change: SubscriptionChange,
): Promise<void> {
  const value = formData.get("token");
  const token = typeof value === "string" ? value : "";
  const status = await updateSubscription(token, change);

  // Redirects back to the page afterwards, so refreshing it doesn't resubmit the form
  redirect(`/unsubscribe?${new URLSearchParams({ token, status })}`);
}
