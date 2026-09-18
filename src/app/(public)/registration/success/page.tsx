import Link from "next/link";

import { accentButtonClass } from "@/components/primitive/buttonStyles";

export default function SuccessPage() {
  return (
    <main className="relative z-10 flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-5 pt-2 pb-6">
      <div className="w-full max-w-[700px] rounded-[18px] border border-[var(--accent)] bg-[var(--card-bg)] p-9 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-5 font-mono text-base text-[var(--accent-text)]">
          $ whoami
          <br />
          &gt; new_member
        </div>

        <h1 className="m-0 mb-3.5 text-[40px] font-black">
          You&apos;re in! &#127881;
        </h1>

        <p className="m-0 mb-8 text-xl leading-[1.6] text-[var(--muted)]">
          Welcome to LUG@UoA. Watch Discord for your first event invite.
        </p>

        <Link href="/" className={`${accentButtonClass} w-full`}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
