import { Feed } from "feed";
import { findPublishedBlogPosts } from "@/repositories/blogPostRepository";

const siteURL: string =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
  const blogPosts = await findPublishedBlogPosts();
  const feed = new Feed({
    title: "The Linux User Group Website",
    description:
      "Latest updates from The University of Auckland Linux User Group",
    id: siteURL,
    link: siteURL,
    language: "en-NZ",
    copyright: `All rights reserved ${new Date().getFullYear()}`,
  });

  blogPosts.forEach((post) => {
    const url = `${siteURL}/blog/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.excerpt ?? "",
      date: post.publishedAt ?? post.createdAt,
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
