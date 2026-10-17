import { redirect } from "next/navigation";
import { getMockMembers } from "@/lib/mock/members";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { adminNoticeClass } from "@/app/admin/_components/adminStyles";
import { EmailComposer } from "./EmailComposer";

const intents = ["send", "schedule", "draft"] as const;
type Intent = (typeof intents)[number];

/* Shown after submitting, until real sending exists, so nobody thinks an email went out. */
const notices: Record<Intent, string> = {
  send: "Nothing was sent: email delivery isn't connected yet. The message was only logged on the server.",
  schedule:
    "Nothing was scheduled: email delivery isn't connected yet. The message was only logged on the server.",
  draft:
    "Drafts aren't saved yet: email storage isn't connected. The message was only logged on the server.",
};

async function sendEmail(formData: FormData) {
  "use server";
  await requireAdmin();
  // TODO: Fix with real mailing list later
  const email = {
    intent: formData.get("intent"),
    audience: formData.get("audience"),
    scheduledAt: formData.get("scheduledAt"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  };
  console.log("mailing list send", email);

  const intent = intents.find((value) => value === email.intent) ?? "send";
  redirect(`/admin/emails?notice=${intent}`);
}

type PageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export default async function AdminEmailsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const members = await getMockMembers();
  const { notice } = await searchParams;
  const noticeMessage = intents.find((value) => value === notice);

  return (
    <section>
      <AdminPageHeader
        title="Send Email"
        description="Compose and send emails to your mailing list."
      />

      {noticeMessage && (
        <p role="status" className={`mt-6 ${adminNoticeClass}`}>
          {notices[noticeMessage]}
        </p>
      )}

      <EmailComposer action={sendEmail} memberCount={members.length} />
    </section>
  );
}
