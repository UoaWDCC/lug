"use server";

import { redirect } from "next/navigation";
import type { Email } from "@/generated/prisma/client";
import type { ComposeEmailInput } from "@/domain/email/validation";
import { composeEmailSchema } from "@/domain/email/validation";
import { requireAdmin } from "@/lib/auth/session";
import { findAdminById } from "@/repositories/adminRepository";
import {
  createEmail,
  findEmailById,
  updateEmail,
} from "@/repositories/emailRepository";
import type { RepositoryResult } from "@/repositories/repositoryResult";
import { deliverEmail, type DeliveryResult } from "./deliverEmail";

export async function composeEmailAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const admin = await findAdminById(session.adminId);
  if (!admin) redirect(emailsPageUrl({ notice: "error" }));

  const emailId = readText(formData, "emailId");
  const parsed = composeEmailSchema.safeParse({
    intent: formData.get("intent"),
    audience: formData.get("audience"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    redirect(emailsPageUrl({ notice: "invalid", draft: emailId }));
  }

  const { intent, ...content } = parsed.data;
  const saved = await saveDraft(
    emailId,
    content,
    `${admin.firstName} ${admin.lastName}`,
  );
  if (!saved.ok) redirect(emailsPageUrl({ notice: "error", draft: emailId }));

  const email = saved.data;
  if (intent === "draft") {
    redirect(emailsPageUrl({ notice: "draft", draft: email.id }));
  }

  const result = await deliverEmail(email);
  redirect(emailsPageUrl(resultParams(result, email.id)));
}

// Updates the draft being edited, or creates a new one. An email that's no longer a draft
// (e.g. the form was resubmitted after sending) is never overwritten: it becomes a new draft.
async function saveDraft(
  emailId: string,
  content: Omit<ComposeEmailInput, "intent">,
  authorName: string,
): Promise<RepositoryResult<Email>> {
  const existing = emailId ? await findEmailById(emailId) : null;
  return existing?.status === "DRAFT"
    ? updateEmail(existing.id, content)
    : createEmail({ ...content, authorName });
}

function resultParams(
  result: DeliveryResult,
  emailId: string,
): Record<string, string> {
  switch (result.status) {
    case "sent":
      return { notice: "sent", count: String(result.delivered) };
    case "partial":
      return {
        notice: "partial",
        count: String(result.delivered),
        failed: String(result.failed),
      };
    case "already_sent":
      return { notice: "already_sent" };
    case "failed":
    case "no_recipients":
      return { notice: result.status, draft: emailId };
    case "database":
      return { notice: "error", draft: emailId };
  }
}

function emailsPageUrl(params: Record<string, string>): string {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== ""),
  );
  return `/admin/emails?${query}`;
}

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
