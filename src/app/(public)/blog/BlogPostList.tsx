import Link from "next/link";

import { blogTagPath, formatBlogTag } from "@/domain/blog/tags";

import type { BlogPost } from "@/generated/prisma/client";

type Props = {
  posts: BlogPost[];
};

const dateFormatter = new Intl.DateTimeFormat("en-NZ", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Pacific/Auckland",
});

export function BlogPostList({ posts }: Props) {
  return (
    <div className="mb-7 flex flex-col gap-3">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-5 transition-[border-color,transform] duration-150 hover:border-[var(--accent)] sm:p-6"
        >
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm text-[var(--muted)]">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {dateFormatter.format(post.publishedAt)}
              </time>
            )}
            <span aria-hidden>&middot;</span>
            <span>by {post.authorName}</span>
          </div>

          <h2 className="m-0 text-[24px] font-bold sm:text-[29px]">
            <Link
              href={`/blog/${post.slug}`}
              className="text-[var(--fg)] no-underline hover:text-[var(--accent-text)]"
            >
              {post.title}
            </Link>
          </h2>

          {post.excerpt && (
            <p className="my-2 text-base leading-[1.6] text-[var(--muted)] sm:text-lg">
              {post.excerpt}
            </p>
          )}

          {post.tags.length > 0 && (
            <ul
              className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0"
              aria-label="Tags"
            >
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={blogTagPath(tag)}
                    className="inline-block rounded-full border border-[var(--input-border)] bg-[var(--chip-bg)] px-3 py-1 font-mono text-xs text-[var(--accent-text)] no-underline hover:bg-[var(--chip-hover-bg)]"
                  >
                    {formatBlogTag(tag)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
