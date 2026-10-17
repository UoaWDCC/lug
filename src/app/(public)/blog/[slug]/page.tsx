import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import {
  ghostButtonClass,
  scrollableMainClass,
} from "@/components/primitive/buttonStyles";
import { blogTagPath, formatBlogTag } from "@/domain/blog/tags";
import { findPublishedBlogPostBySlug } from "@/repositories/blogPostRepository";

type Props = {
  params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-NZ", {
  dateStyle: "long",
  timeZone: "Pacific/Auckland",
});

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await findPublishedBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className={scrollableMainClass}>
      <article className="mx-auto max-w-[900px] rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] p-6 sm:p-10">
        <div className="mb-3 font-mono text-base text-[var(--accent-text)]">
          $ cat ./blog/{post.slug}.md
        </div>
        <h1 className="m-0 text-[clamp(36px,6vw,64px)] font-black leading-[1.05] tracking-[-1px]">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm text-[var(--muted)]">
          <span>by {post.authorName}</span>
          {post.publishedAt && (
            <>
              <span aria-hidden>&middot;</span>
              <time dateTime={post.publishedAt.toISOString()}>
                {dateFormatter.format(post.publishedAt)}
              </time>
            </>
          )}
        </div>

        {post.tags.length > 0 && (
          <ul
            className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0"
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

        {post.imageUrl && (
          // Blog images can come from any configured storage backend.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt=""
            className="mt-7 max-h-[520px] w-full rounded-xl object-cover"
          />
        )}

        <div className="mt-8 text-lg leading-[1.75] [overflow-wrap:anywhere] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-5 [&_code]:rounded [&_code]:bg-[var(--chip-bg)] [&_code]:px-1.5 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-2xl [&_h3]:font-semibold [&_hr]:my-8 [&_img]:max-w-full [&_li]:ml-6 [&_ol]:my-4 [&_ol]:list-decimal [&_p]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/60 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_td]:border [&_td]:border-[var(--input-border)] [&_td]:p-2 [&_th]:border [&_th]:border-[var(--input-border)] [&_th]:p-2 [&_ul]:my-4 [&_ul]:list-disc">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      <div className="mx-auto mt-5 max-w-[900px]">
        <Link href="/blog" className={ghostButtonClass}>
          &#8592; all posts
        </Link>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublishedBlogPostBySlug(slug);

  if (!post) return {};

  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} | The Linux User Group`,
    description: post.excerpt ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: canonical,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}
