import type { Metadata } from "next";
import Link from "next/link";

import {
  accentButtonClass,
  ghostButtonClass,
} from "@/components/primitive/buttonStyles";
import { maskEmail } from "@/domain/email/mask";
import {
  resubscribeAction,
  unsubscribeAction,
} from "@/features/mailing-list/subscriptionActions";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe | The Linux User Group",
  robots: { index: false },
};

type SearchParams = {
  token?: string | string[];
  status?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

/* Opening this page never changes anything (mail scanners open every link in an email).
   Only the buttons do, as plain form POSTs, so it works with JS disabled. */
export default async function UnsubscribePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = firstValue(params.token);
  const status = firstValue(params.status);
  const email = token ? await verifyUnsubscribeToken(token) : null;

  if (!email) {
    return (
      <Card title="This link doesn't work">
        <Text>
          The unsubscribe link may be incomplete. Try copying the whole link
          from the email, or ask a club exec to take you off the list.
        </Text>
        <HomeLink />
      </Card>
    );
  }

  const maskedEmail = maskEmail(email);

  switch (status) {
    case "unsubscribed":
      return (
        <Card title="You're unsubscribed">
          <Text>
            {`${maskedEmail} won't get LUG@UoA mailing list emails any more. Clicked by mistake?`}
          </Text>
          <TokenForm
            action={resubscribeAction}
            token={token}
            label="Resubscribe"
            className={ghostButtonClass}
          />
        </Card>
      );
    case "resubscribed":
      return (
        <Card title="You're back on the list">
          <Text>{maskedEmail} will get LUG@UoA mailing list emails again.</Text>
          <HomeLink />
        </Card>
      );
    case "error":
      return (
        <Card title="Something went wrong">
          <Text>Nothing was changed. Please try the link again later.</Text>
          <HomeLink />
        </Card>
      );
    default:
      return (
        <Card title="Unsubscribe?">
          <Text>
            Stop sending LUG@UoA mailing list emails to {maskedEmail}?
          </Text>
          <TokenForm
            action={unsubscribeAction}
            token={token}
            label="Unsubscribe"
            className={accentButtonClass}
          />
        </Card>
      );
  }
}

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative z-10 flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-5 pt-2 pb-6">
      <div className="w-full max-w-[700px] rounded-[18px] border border-[var(--accent)] bg-[var(--card-bg)] p-9 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <h1 className="m-0 mb-3.5 text-[40px] font-black">{title}</h1>
        {children}
      </div>
    </main>
  );
}

function Text({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mb-8 text-xl leading-[1.6] text-[var(--muted)]">
      {children}
    </p>
  );
}

function TokenForm({
  action,
  token,
  label,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  token: string;
  label: string;
  className: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <button type="submit" className={`${className} w-full`}>
        {label}
      </button>
    </form>
  );
}

function HomeLink() {
  return (
    <Link href="/" className={`${ghostButtonClass} w-full`}>
      Back to home
    </Link>
  );
}
