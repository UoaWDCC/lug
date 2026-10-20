"use client";

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import {
  adminCardClass,
  adminCheckInputClass,
  adminChipClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSectionTitleClass,
  adminTagClass,
} from "@/app/admin/_components/adminStyles";

const audiences = [
  { value: "all", label: "All members" },
  { value: "new", label: "New members" },
  { value: "returning", label: "Returning members" },
  { value: "uoa", label: "UoA students only" },
] as const;

/* The preview mimics what lands in an inbox, so it keeps email-client colours (white body)
   in both admin themes rather than using the theme tokens. */
const emailBodyClass =
  "text-[15px] leading-relaxed text-[#1f2421] [overflow-wrap:anywhere] " +
  "[&>:first-child]:mt-0 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 " +
  "[&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-black [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-black [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-bold " +
  "[&_strong]:font-bold [&_em]:italic [&_a]:text-[#0f7a60] [&_a]:underline [&_hr]:my-5 [&_hr]:border-[#e3e6e4] " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-[#3fcca8] [&_blockquote]:pl-3 [&_blockquote]:text-[#5b635f] " +
  "[&_code]:rounded [&_code]:bg-[#eef3f1] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#eef3f1] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
  "[&_img]:max-w-full [&_img]:rounded-md";

type Props = {
  action: (formData: FormData) => Promise<void>;
  /** Recipient count for "All members"; other groups aren't defined on the backend yet. */
  memberCount: number;
};

export function EmailComposer({ action, memberCount }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<string>("all");
  const [scheduleLater, setScheduleLater] = useState(false);

  return (
    <form action={action} className="mt-10 flex flex-col gap-6">
      <section className={adminCardClass} aria-labelledby="recipients-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="recipients-heading"
            className="font-mono text-base font-semibold text-[var(--fg)]"
          >
            Recipients
          </h2>
          <p
            aria-live="polite"
            className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3.5 py-1 font-mono text-sm text-[var(--accent-text)]"
          >
            {audience === "all"
              ? `${memberCount} recipient${memberCount === 1 ? "" : "s"} will receive this email`
              : "Count for this group coming soon"}
          </p>
        </div>
        <fieldset className="mt-5">
          <legend className="sr-only">Send to</legend>
          <div className="flex flex-wrap gap-3">
            {audiences.map((option) => (
              <label key={option.value} className={adminChipClass}>
                <input
                  type="radio"
                  name="audience"
                  value={option.value}
                  checked={audience === option.value}
                  onChange={() => setAudience(option.value)}
                  className={adminCheckInputClass}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <div className="grid overflow-hidden rounded-2xl border border-[var(--input-border)] bg-[var(--card-bg)] lg:grid-cols-2">
        <div className="flex min-w-0 flex-col border-b border-[var(--divider)] lg:border-r lg:border-b-0">
          <div className="flex h-14 items-center border-b border-[var(--divider)] px-5">
            <h2 className={adminSectionTitleClass}>Compose</h2>
          </div>
          <div className="flex flex-1 flex-col gap-5 p-5">
            <div>
              <label htmlFor="subject" className={adminLabelClass}>
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="What's this email about?"
                className={adminInputClass}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="body" className="text-base font-bold">
                  Body
                </label>
                <span className={adminTagClass}>Markdown</span>
              </div>
              <textarea
                id="body"
                name="body"
                required
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={
                  "Hey everyone!\n\nWrite your email in **markdown**…"
                }
                className={`${adminInputClass} min-h-[28rem] flex-1 resize-y font-mono text-sm leading-7 [font-variant-ligatures:none]`}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex h-14 items-center border-b border-[var(--divider)] px-5">
            <h2 className={adminSectionTitleClass}>Preview</h2>
          </div>
          <div className="p-5 sm:p-8">
            <div
              aria-live="polite"
              className="mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            >
              <div className="flex flex-col items-center gap-3 border-b-4 border-[#3fcca8] bg-black px-6 py-7">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full"
                />
                <span className="font-sans text-xl font-black tracking-[-0.3px] text-white">
                  LUG@UoA
                </span>
              </div>
              <div className="px-6 py-7 sm:px-8">
                <h3 className="text-2xl font-black tracking-tight text-[#111412]">
                  {subject || (
                    <span className="text-[#9aa29e]">Your subject line</span>
                  )}
                </h3>
                <div className={`mt-4 ${emailBodyClass}`}>
                  {body ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                    >
                      {body}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-[#9aa29e]">
                      Your message will appear here as members will see it.
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-[#e3e6e4] bg-[#f4f6f5] px-6 py-4 text-center text-xs leading-5 text-[#6b736f]">
                You&apos;re receiving this because you&apos;re a member of
                LUG@UoA.
                <br />
                <span className="underline">Unsubscribe</span> from the mailing
                list.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2.5 font-mono text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={scheduleLater}
              onChange={(event) => setScheduleLater(event.target.checked)}
              className={adminCheckInputClass}
            />
            Schedule for later
          </label>
          <label htmlFor="scheduledAt" className="sr-only">
            Send at
          </label>
          {/* Fixed-width wrapper: adminInputClass is full-width by design. */}
          <div className="w-60">
            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              disabled={!scheduleLater}
              required={scheduleLater}
              className={`${adminInputClass} py-2 font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50`}
            />
          </div>
        </div>

        {/* Save draft comes first so Enter in the subject saves rather than sends. */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="intent"
            value="draft"
            formNoValidate
            className={adminSecondaryButtonClass}
          >
            Save draft
          </button>
          <button
            type="submit"
            name="intent"
            value={scheduleLater ? "schedule" : "send"}
            className={adminPrimaryButtonClass}
          >
            {scheduleLater ? "Schedule" : "Send now"}
          </button>
        </div>
      </div>
    </form>
  );
}
