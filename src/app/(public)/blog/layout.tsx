import {
  BLOG_TAGS,
  getPublishedPostSummaries,
} from "@/features/blog/publicPosts";
import BlogShell from "./_components/BlogShell";

export default async function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { posts } = await getPublishedPostSummaries();

  return (
    <BlogShell
      posts={posts.map(({ slug, tags }) => ({ slug, tags }))}
      tags={BLOG_TAGS}
    >
      {children}
    </BlogShell>
  );
}
