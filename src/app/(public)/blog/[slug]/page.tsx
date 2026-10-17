import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { scrollableMainClass } from "@/components/primitive/buttonStyles";
import {
  getPublishedPost,
  usingPlaceholderPosts,
} from "@/features/blog/publicPosts";
import { ReadProgress } from "../_components/BlogScroll";

/* Markdown prose on the site's theme tokens. */
const PROSE_CLASS = [
  "text-[16.5px] leading-[1.72] text-[var(--body-text)] [text-wrap:pretty]",
  "[&_p]:m-0 [&_p]:mb-5",
  "[&_h1]:mt-9 [&_h1]:mb-3 [&_h1]:text-[28px] [&_h1]:leading-[1.15] [&_h1]:font-black [&_h1]:text-[var(--fg)]",
  "[&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:text-[24px] [&_h2]:leading-[1.2] [&_h2]:font-bold [&_h2]:text-[var(--fg)]",
  "[&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-[19px] [&_h3]:font-bold [&_h3]:text-[var(--fg)]",
  "[&_a]:text-[var(--accent-text)] [&_a]:underline [&_a]:underline-offset-2",
  "[&_strong]:font-bold [&_strong]:text-[var(--fg)]",
  "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1.5",
  "[&_blockquote]:mb-5 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--muted)]",
  "[&_code]:rounded [&_code]:bg-[var(--row-bg)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[14px]",
  "[&_pre]:mb-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[var(--row-border)] [&_pre]:bg-[var(--row-bg)] [&_pre]:p-4",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_hr]:my-8 [&_hr]:border-[var(--hairline)]",
  "[&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-lg",
  "[&_table]:mb-5 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[var(--hairline)] [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-[var(--hairline)] [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left",
].join(" ");

type PostPageProps = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  return (
    <main data-blog-scroll className={scrollableMainClass}>
      {/* Negative margins let the sticky bar run edge to edge inside the padded scroller. */}
      <div className="sticky top-0 z-30 -mx-5 -mt-2.5 flex items-center gap-3.5 border-b border-[var(--hairline)] bg-[var(--sticky-bg)] px-5 py-3 backdrop-blur-[12px] sm:-mx-9 sm:px-9">
        <Link
          href="/blog"
          className="shrink-0 rounded-lg border border-[var(--input-border)] px-[11px] py-1.5 font-mono text-[12.5px] text-[var(--accent-text)] no-underline transition-[background-color,transform] duration-[180ms] hover:-translate-x-[3px] hover:bg-[var(--row-hover-bg)]"
        >
          &lt;- all posts
        </Link>
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[var(--muted)]">
          {post.slug}.md
        </span>
        <ReadProgress />
      </div>

      <article className="max-w-[640px] pt-[34px]">
        <h1 className="m-0 mb-3 text-[34px] leading-[1.1] font-black tracking-[-1.2px] [text-wrap:pretty]">
          {post.title}
        </h1>
        <div className="mb-[30px] font-mono text-[12px] text-[var(--muted)]">
          {[
            post.authorName,
            post.date,
            post.readTime,
            usingPlaceholderPosts() && "placeholder post",
          ]
            .filter(Boolean)
            .join(" | ")}
        </div>

        <div className={PROSE_CLASS}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-[7px] border-t border-[var(--hairline)] pt-[18px]">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="rounded-full border border-[var(--row-border)] bg-[var(--row-bg)] px-[11px] py-[5px] font-mono text-[11.5px] text-[var(--accent-text)] no-underline transition-colors duration-[180ms] hover:bg-[var(--row-hover-bg)]"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug).catch(() => null);
  if (!post) return { title: "Post not found | The Linux User Group" };

  return {
    title: `${post.title} | The Linux User Group`,
    description: post.excerpt || undefined,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
  };
}
