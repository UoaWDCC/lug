import type { Email } from "@/generated/prisma/client";
import { selectRecipients } from "@/domain/email/audience";
import { renderEmail } from "@/lib/email/renderEmail";
import { sendEmail } from "@/lib/email/sendEmail";
import { buildUnsubscribeLinks } from "@/lib/email/unsubscribe";
import { findAllOptedOutEmails } from "@/repositories/emailOptOutRepository";
import {
  claimEmailForSending,
  updateEmail,
} from "@/repositories/emailRepository";
import { findAudienceMembers } from "@/repositories/memberRepository";

export type DeliveryResult =
  | { status: "sent"; delivered: number }
  | { status: "partial"; delivered: number; failed: number }
  /** Nothing went out, so the email is back to DRAFT and can be retried */
  | { status: "failed" }
  | { status: "no_recipients" }
  /** Another request already claimed it (double-click, resubmitted form) */
  | { status: "already_sent" }
  | { status: "database" };

// Sends one message per recipient, one after another (never a shared To/CC list)
export async function deliverEmail(email: Email): Promise<DeliveryResult> {
  const recipients = await findRecipients(email);
  if (recipients.length === 0) return { status: "no_recipients" };

  const claim = await claimEmailForSending(email.id);
  if (!claim.ok) return { status: "database" };
  if (!claim.data) return { status: "already_sent" };

  let delivered = 0;
  for (const to of recipients) {
    try {
      const links = await buildUnsubscribeLinks(to);
      const { html, text } = renderEmail({
        subject: email.subject,
        body: email.body,
        unsubscribeUrl: links.pageUrl,
      });
      await sendEmail({
        to,
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

  const failed = recipients.length - delivered;
  if (delivered === 0) {
    await updateEmail(email.id, { status: "DRAFT" });
    return { status: "failed" };
  }

  // Partly sent emails are FAILED, not DRAFT: sending again would reach some members twice
  await updateEmail(email.id, {
    status: failed === 0 ? "SENT" : "FAILED",
    sentAt: new Date(),
    recipientCount: delivered,
  });
  return failed === 0
    ? { status: "sent", delivered }
    : { status: "partial", delivered, failed };
}

async function findRecipients(email: Email): Promise<string[]> {
  const [{ currentMembers, earlierMembers }, optedOutEmails] =
    await Promise.all([findAudienceMembers(), findAllOptedOutEmails()]);

  return selectRecipients({
    audience: email.audience,
    currentMembers,
    earlierMembers,
    optedOutEmails,
  });
}
