import { Metadata } from "next";
import Link from "next/link";

import {
  ghostButtonClass,
  scrollableMainClass,
} from "@/components/primitive/buttonStyles";
import getBlogPosts from "@/features/blog/getBlogPosts";

/* Split so one- and two-digit days keep the mono column aligned. */
function formatDate(publishedAt: string) {
  const date = new Date(publishedAt);
  const parts = new Intl.DateTimeFormat("en-NZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return { day: part("weekday"), date: part("day"), month: part("month") };
}

export default async function Blog() {
  const posts = await getBlogPosts();

  return (
    <main className={scrollableMainClass}>
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-2 font-mono text-lg text-[var(--accent-text)] sm:text-xl">
          $ ls ./lug-blog
        </div>

        <h1 className="m-0 mb-5 text-[clamp(40px,7vw,73px)] font-black tracking-[-1px]">
          LUG Blog
        </h1>

        {posts.length === 0 ? (
          <div className="mb-7 rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-6 sm:p-8">
            <div className="mb-2 font-mono text-[17px] text-[var(--muted)]">
              $ ls ./posts
            </div>
            <p className="m-0 mb-1.5 text-[24px] font-bold sm:text-[27px]">
              No blogs yet.
            </p>
            <p className="m-0 text-lg leading-[1.5] text-[var(--muted)]">
              Stay tuned, the first post is on its way.
            </p>
          </div>
        ) : (
          <div className="mb-7 flex flex-col gap-2.5">
            {posts.map((post) => {
              const when = formatDate(post.publishedAt);

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="flex flex-wrap items-start gap-4 rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-5 no-underline transition-[border-color,transform] duration-150 hover:border-[var(--accent)] sm:gap-5"
                >
                  <div className="flex min-w-[140px] items-baseline gap-2 font-mono text-[17px] font-semibold text-[var(--accent-text)] tabular-nums sm:text-[18px]">
                    <span className="w-[3ch]">{when.day}</span>
                    <span className="w-[2ch] text-right">{when.date}</span>
                    <span className="w-[3ch]">{when.month}</span>
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <div className="mb-1.5 text-[22px] font-bold text-[var(--fg)] sm:text-[27px]">
                      {post.title}
                    </div>
                    <div className="text-base leading-[1.5] text-[var(--muted)] sm:text-lg">
                      {post.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Link href="/" className={ghostButtonClass}>
          &#8592; back home
        </Link>
      </div>
    </main>
  );
}

export const metadata: Metadata = {
  title: "LUG Blog | The Linux User Group",
  description:
    "Latest updates, tutorials, and news from The University of Auckland Linux User Group.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
    types: {
      "application/rss+xml": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/rss.xml`,
    },
  },
};
