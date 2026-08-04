import { Metadata } from "next";

import { scrollableMainClass } from "@/components/primitive/buttonStyles";

export default function Blog() {
  return (
    <main className={scrollableMainClass}>
      <div className="mx-auto max-w-[900px]">
        <div className="mb-1.5 font-mono text-sm text-[var(--accent-text)]">
          $ ls ./blog
        </div>

        <h1 className="m-0 mb-3.5 text-[clamp(30px,4.5vw,46px)] font-black tracking-[-1px]">
          Blog
        </h1>

        <p className="m-0 text-base leading-[1.6] text-[var(--muted)]">
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
