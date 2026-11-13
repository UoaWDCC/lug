import type { Email, Prisma } from "@/generated/prisma/client";

// Domain import (recipient address selection business logic)
import { selectRecipientAddresses } from "@/domain/email/audience";

// Email build and send I/O imports (no business logic)
import { renderEmail } from "@/lib/email/renderEmail";
import { sendEmail } from "@/lib/email/sendEmail";
import { buildUnsubscribeLinks } from "@/lib/email/unsubscribe";

// DB repo imports
import {
  claimEmailForSending,
  updateEmail,
} from "@/repositories/emailRepository";
import { findAudienceMembers } from "@/repositories/memberRepository";
import { findAllOptedOutEmailAddresses } from "@/repositories/emailAddressOptOutRepository";

export type DeliveryResult =
  | { status: "sent"; delivered: number }
  | { status: "partial"; delivered: number; failed: number }
  /** Nothing went out, so the email is back to DRAFT and can be retried */
  | { status: "failed" }
  | { status: "no_recipients" }
  /** Another request already claimed it (double-click, resubmitted form) */
  | { status: "already_sent" }
  | { status: "database" };

// Orchestrator: sends one message per recipient address, one after another (never a shared To/CC list)
export async function deliverEmail(email: Email): Promise<DeliveryResult> {
  const recipientAddresses = await getRecipientAddresses(email);
  if (recipientAddresses.length === 0) return { status: "no_recipients" };

  // Move the email from "DRAFT" to "SENT" in DB
  const claim = await claimEmailForSending(email.id);
  if (!claim.ok) return { status: "database" };
  if (!claim.data) return { status: "already_sent" };

  let delivered = 0;
  for (const recipientAddress of recipientAddresses) {
    try {
      const links = await buildUnsubscribeLinks(recipientAddress);
      const { html, text } = renderEmail({
        subject: email.subject,
        body: email.body,
        unsubscribeUrl: links.pageUrl,
      });
      await sendEmail({
        to: recipientAddress,
        subject: email.subject,
        html,
        text,
        headers: links.headers,
      });
      delivered++;
    } catch (error) {
      console.error("Mailing list: failed to send", {
        emailId: email.id,
        error,
      });
    }
  }

  const failed = recipientAddresses.length - delivered;
  if (delivered === 0) {
    await markEmail(email.id, { status: "DRAFT" });
    return { status: "failed" };
  }

  // Partly sent emails are FAILED, not DRAFT: sending again would reach some members twice
  await markEmail(email.id, {
    status: failed === 0 ? "SENT" : "FAILED",
    sentAt: new Date(),
    recipientCount: delivered,
  });
  return failed === 0
    ? { status: "sent", delivered }
    : { status: "partial", delivered, failed };
}

// Helper to get intended recipient addresses
async function getRecipientAddresses(email: Email): Promise<string[]> {
  const [{ currentMembers, earlierMembers }, optedOutEmailAddresses] =
    await Promise.all([findAudienceMembers(), findAllOptedOutEmailAddresses()]);

  return selectRecipientAddresses({
    audience: email.audience,
    currentMembers,
    earlierMembers,
    optedOutEmailAddresses,
  });
}

// The emails have already gone out by now, so a failed status update is logged, not shown
async function markEmail(id: string, data: Prisma.EmailUpdateInput) {
  const result = await updateEmail(id, data);
  if (!result.ok) {
    console.error("Mailing list: failed to update email status", {
      emailId: id,
      error: result.error,
    });
  }
}
