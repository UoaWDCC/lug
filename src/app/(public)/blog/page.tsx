import { Metadata } from "next";

import { scrollableMainClass } from "@/components/primitive/buttonStyles";

export default function Blog() {
  return (
    <main className={scrollableMainClass}>
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-2 font-mono text-xl text-[var(--accent-text)]">
          $ ls ./blog
        </div>

        <h1 className="m-0 mb-4 text-[clamp(48px,7vw,73px)] font-black tracking-[-1px]">
          Blog
        </h1>

        <p className="m-0 text-xl leading-[1.6] text-[var(--muted)]">
          Placeholder Blog
        </p>
      </div>
    </main>
  );
}

export const metadata: Metadata = {
  title: "Blog | The Linux User Group",
  description:
    "Latest updates, tutorials, and news from The University of Auckland Linux User Group.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
    types: {
      "application/rss+xml": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/rss.xml`,
    },
  },
};
