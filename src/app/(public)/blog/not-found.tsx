import Link from "next/link";

import {
  ghostButtonClass,
  scrollableMainClass,
} from "@/components/primitive/buttonStyles";

export default function BlogNotFound() {
  return (
    <main className={scrollableMainClass}>
      <div className="mx-auto max-w-[900px]">
        <div className="mb-2 font-mono text-lg text-[var(--accent-text)] sm:text-xl">
          $ cat ./blog/requested-post
        </div>

        <div className="mb-7 rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-6 sm:p-10">
          <p className="m-0 mb-2 font-mono text-[var(--accent-text)]">
            cat: No such file or directory
          </p>
          <h1 className="m-0 mb-3 text-[clamp(42px,7vw,72px)] font-black tracking-[-1px] text-[var(--fg)]">
            404
          </h1>
          <p className="m-0 text-xl leading-[1.5] text-[var(--muted)]">
            This blog post or tag could not be found.
          </p>
        </div>

        <Link href="/blog" className={ghostButtonClass}>
          &#8592; all posts
        </Link>
      </div>
    </main>
  );
}
