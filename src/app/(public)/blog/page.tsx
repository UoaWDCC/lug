import { Metadata } from "next";
import Link from "next/link";

import { scrollableMainClass } from "@/components/primitive/buttonStyles";
import {
  BLOG_TAGS,
  getPublishedPostSummaries,
  normaliseTag,
  postCountLabel,
  usingPlaceholderPosts,
} from "@/features/blog/publicPosts";
import { BlogHero } from "./_components/BlogScroll";

export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const { tag: rawTag } = await searchParams;
  const tag = normaliseTag(
    Array.isArray(rawTag) ? rawTag[0] : rawTag,
    BLOG_TAGS,
  );

  const { posts: allPosts, error: dbError } = await getPublishedPostSummaries();
  const posts = tag
    ? allPosts.filter((post) => post.tags.includes(tag))
    : allPosts;

  return (
    <>
      <BlogHero />

      <main data-blog-scroll className={scrollableMainClass}>
        <div className="max-w-[680px] pt-4">
          <div className="mb-1.5 font-mono text-[14px] text-[var(--accent-text)]">
            $ cd ~/blog
          </div>

          <h1 className="m-0 mb-2.5 text-[clamp(40px,7vw,46px)] leading-none font-black tracking-[-1.4px]">
            Blog
          </h1>

          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[12.5px] text-[var(--muted)]">
            {postCountLabel(posts.length, tag)}
            {usingPlaceholderPosts() && (
              <span className="rounded-full border border-dashed border-[var(--input-border)] px-2.5 py-0.5 text-[11.5px]">
                placeholder posts
              </span>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="mt-[22px] rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-[26px]">
              <div className="mb-2.5 font-mono text-[13px] text-[var(--muted)]">
                $ ls ./posts
              </div>
              <p className="m-0 mb-1.5 text-[24px] font-bold">
                {dbError ? "Could not load posts." : "No blogs yet."}
              </p>
              <p className="m-0 text-[15.5px] leading-[1.5] text-[var(--muted)]">
                {dbError
                  ? "The database server has not been deployed yet."
                  : "Stay tuned, the first post is on its way."}
              </p>
            </div>
          ) : (
            <ul className="m-0 mt-[22px] flex list-none flex-col p-0">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex flex-col gap-1.5 border-t border-[var(--hairline)] px-0.5 py-5 no-underline transition-[transform,border-color] duration-200 hover:translate-x-1 hover:border-[var(--accent)]"
                  >
                    <span className="font-mono text-[12px] font-medium text-[var(--accent-text)]">
                      {[post.date, post.authorName, post.readTime]
                        .filter(Boolean)
                        .join(" | ")}
                    </span>
                    <span className="text-[21px] leading-[1.28] font-bold text-[var(--fg)] [text-wrap:pretty]">
                      {post.title}
                    </span>
                    {post.excerpt && (
                      <span className="text-[14.5px] leading-[1.5] text-[var(--muted)] [text-wrap:pretty]">
                        {post.excerpt}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
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
