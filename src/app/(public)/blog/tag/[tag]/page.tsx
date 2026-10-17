import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ghostButtonClass,
  scrollableMainClass,
} from "@/components/primitive/buttonStyles";
import { formatBlogTag, parseBlogTag } from "@/domain/blog/tags";
import { findPublishedBlogPostsByTag } from "@/repositories/blogPostRepository";

import { BlogPostList } from "../../BlogPostList";

type Props = {
  params: Promise<{ tag: string }>;
};

export default async function BlogTagPage({ params }: Props) {
  const { tag: tagParam } = await params;
  const tag = parseBlogTag(tagParam);

  if (!tag) notFound();

  const posts = await findPublishedBlogPostsByTag(tag);
  const label = formatBlogTag(tag);

  return (
    <main className={scrollableMainClass}>
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-2 font-mono text-lg text-[var(--accent-text)] sm:text-xl">
          $ grep --tag {tag.toLowerCase()} ./blog/*
        </div>
        <h1 className="m-0 mb-5 text-[clamp(40px,7vw,73px)] font-black tracking-[-1px]">
          {label}
        </h1>

        {posts.length > 0 ? (
          <BlogPostList posts={posts} />
        ) : (
          <div className="mb-7 rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-6 sm:p-8">
            <p className="m-0 text-xl font-bold">
              No published posts with this tag yet.
            </p>
          </div>
        )}

        <Link href="/blog" className={ghostButtonClass}>
          &#8592; all posts
        </Link>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: tagParam } = await params;
  const tag = parseBlogTag(tagParam);

  if (!tag) return {};

  const label = formatBlogTag(tag);
  return {
    title: `${label} blog posts | The Linux User Group`,
    description: `${label} posts from The University of Auckland Linux User Group.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/tag/${tag.toLowerCase()}`,
    },
  };
}
