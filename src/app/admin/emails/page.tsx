import { requireAdmin } from "@/lib/auth/session";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import {
  adminErrorClass,
  adminNoticeClass,
} from "@/app/admin/_lib/adminStyles";
import { FORM_VALUE_BY_AUDIENCE } from "@/domain/email/validation";
import { composeEmailAction } from "@/features/mailing-list/composeEmailAction";
import { getRecipientCounts } from "@/features/mailing-list/getRecipientCounts";
import { findEmailById } from "@/repositories/emailRepository";
import { EmailComposer, type ComposerDraft } from "./_components/EmailComposer";

type SearchParams = {
  notice?: string;
  draft?: string;
  count?: string;
  failed?: string;
};

type Notice = { message: string; isError: boolean };

function plural(count: string | undefined, word: string): string {
  return `${count ?? 0} ${word}${count === "1" ? "" : "s"}`;
}

/** Maps every possible outcome string to a user-friendly message.
 *  Changing the draft ID remounts the component so React resets all the useState values.  */
function readNotice(params: SearchParams): Notice | null {
  switch (params.notice) {
    case "draft":
      return { message: "Draft saved.", isError: false };
    case "sent":
      return {
        message: `Email sent to ${plural(params.count, "recipient")}.`,
        isError: false,
      };
    case "partial":
      return {
        message: `Sent to ${plural(params.count, "recipient")}, but ${plural(params.failed, "email")} couldn't be sent. Don't send it again, or the others will get it twice. Check the server logs.`,
        isError: true,
      };
    case "failed":
      return {
        message:
          "Nothing was sent: the mail server couldn't be reached. Your email is saved as a draft, so you can try again.",
        isError: true,
      };
    case "no_recipients":
      return {
        message:
          "Nothing was sent: nobody in this group is on the mailing list. Your email is saved as a draft.",
        isError: true,
      };
    case "already_sent":
      return {
        message: "This email was already sent, so it wasn't sent again.",
        isError: true,
      };
    case "invalid":
      return {
        message:
          "Check the subject and body: both are needed to send, and they have length limits.",
        isError: true,
      };
    case "error":
      return {
        message: "Something went wrong saving the email. Please try again.",
        isError: true,
      };
    default:
      return null;
  }
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminEmailsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  // Load recipient counts and optionally a saved draft in parallel
  const [recipientCounts, saved] = await Promise.all([
    getRecipientCounts(),
    params.draft ? findEmailById(params.draft) : null,
  ]);

  // Read notice query param (set by composeEmailAction after redirect) to show success/error banners
  const notice = readNotice(params);

  // Only drafts can be reopened; a sent email's link just shows an empty composer
  const draft: ComposerDraft | undefined =
    saved?.status === "DRAFT"
      ? {
          id: saved.id,
          audience: FORM_VALUE_BY_AUDIENCE[saved.audience],
          subject: saved.subject,
          body: saved.body,
        }
      : undefined;

  return (
    <section>
      <AdminPageHeader
        title="Send Email"
        description="Compose and send emails to your mailing list."
      />

      {notice && (
        <p
          role={notice.isError ? "alert" : "status"}
          className={`mt-6 ${notice.isError ? adminErrorClass : adminNoticeClass}`}
        >
          {notice.message}
        </p>
      )}

      {/* key: a different draft (or none) remounts the composer with fresh values */}
      <EmailComposer
        key={draft?.id ?? "new"}
        action={composeEmailAction}
        recipientCounts={recipientCounts}
        draft={draft}
      />
    </section>
  );
}
