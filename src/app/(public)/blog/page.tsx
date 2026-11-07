import { Metadata } from "next";
import Link from "next/link";

import {
  ghostButtonClass,
  scrollableMainClass,
} from "@/components/primitive/buttonStyles";
import { findPublishedBlogPosts } from "@/repositories/blogPostRepository";

import { BlogPostList } from "./BlogPostList";

import type { BlogPost } from "@/generated/prisma/client";

export default async function Blog() {
  let posts: BlogPost[] = [];
  let dbError = false;

  try {
    posts = await findPublishedBlogPosts();
  } catch {
    posts = [];
    dbError = true;
  }

  return (
    <main className={scrollableMainClass}>
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-2 font-mono text-lg text-[var(--accent-text)] sm:text-xl">
          $ ls ./blog
        </div>

        <h1 className="m-0 mb-5 text-[clamp(40px,7vw,73px)] font-black tracking-[-1px]">
          Blog
        </h1>

        {posts.length === 0 ? (
          <div className="mb-7 rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-6 sm:p-8">
            <div className="mb-2 font-mono text-[17px] text-[var(--muted)]">
              $ ls ./posts
            </div>
            <p className="m-0 mb-1.5 text-[24px] font-bold sm:text-[27px]">
              {dbError ? "Could not load posts." : "No blog posts yet."}
            </p>
            <p className="m-0 text-lg leading-[1.5] text-[var(--muted)]">
              {dbError
                ? "The database server has not been deployed yet."
                : "Stay tuned, the first post is on its way."}
            </p>
          </div>
        ) : (
          <BlogPostList posts={posts} />
        )}

        <Link href="/" className={ghostButtonClass}>
          &#8592; back home
        </Link>
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
