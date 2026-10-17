import { cache } from "react";

import { BlogTag, type BlogPost } from "@/generated/prisma/client";
import {
  findPublishedBlogPostBySlug,
  findPublishedBlogPosts,
} from "@/repositories/blogPostRepository";

/* The public blog UI only reads these shapes, so schema changes stop here. */
export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  date: string | null;
  readTime: string;
  tags: string[];
};

export type BlogPostView = BlogPostSummary & { content: string };

type PostSource = Pick<
  BlogPost,
  | "slug"
  | "title"
  | "excerpt"
  | "content"
  | "authorName"
  | "publishedAt"
  | "tags"
>;

export const BLOG_TAGS: readonly string[] = Object.values(BlogTag).map((tag) =>
  tag.toLowerCase(),
);

/* Placeholder posts show until the blog database is live.
   Set BLOG_SOURCE=database in .env to read published posts from the database instead. */
export function usingPlaceholderPosts() {
  return process.env.BLOG_SOURCE !== "database";
}

const WORDS_PER_MINUTE = 200;

export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* Not Intl: ICU versions disagree on "Sep" vs "Sept". UTC so every renderer agrees on the day. */
export function formatPostDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function postCountLabel(count: number, tag?: string | null): string {
  const label = `${count} ${count === 1 ? "post" : "posts"}`;
  return tag ? `${label} | #${tag}` : label;
}

export function normaliseTag(
  raw: string | null | undefined,
  known: readonly string[],
): string | null {
  if (!raw) return null;
  const tag = raw.trim().replace(/^#/, "").toLowerCase();
  return known.includes(tag) ? tag : null;
}

function toSummary(post: PostSource): BlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    authorName: post.authorName,
    date: post.publishedAt ? formatPostDate(post.publishedAt) : null,
    readTime: readingTime(post.content),
    tags: post.tags.map((tag) => tag.toLowerCase()),
  };
}

/* Cached per request so the blog layout and page share one query. */
export const getPublishedPostSummaries = cache(
  async (): Promise<{ posts: BlogPostSummary[]; error: boolean }> => {
    if (usingPlaceholderPosts()) {
      return { posts: PLACEHOLDER_POSTS.map(toSummary), error: false };
    }

    try {
      const posts = await findPublishedBlogPosts();
      return { posts: posts.map(toSummary), error: false };
    } catch {
      return { posts: [], error: true };
    }
  },
);

export const getPublishedPost = cache(
  async (slug: string): Promise<BlogPostView | null> => {
    const post = usingPlaceholderPosts()
      ? PLACEHOLDER_POSTS.find((placeholder) => placeholder.slug === slug)
      : await findPublishedBlogPostBySlug(slug);
    return post ? { ...toSummary(post), content: post.content } : null;
  },
);

/* Demo content only, newest first. Delete this list once real posts are in the database. */
const PLACEHOLDER_POSTS: PostSource[] = [
  {
    slug: "carl-and-the-ai-takeover",
    title: "Carl and the AI that took over the world",
    excerpt:
      "It started with one shell alias. It ended with the AI running club elections.",
    authorName: "Carl Dela Pena",
    publishedAt: new Date("2026-10-14T00:00:00Z"),
    tags: [BlogTag.ANNOUNCEMENTS],
    content: [
      "Carl gave an AI agent access to his terminal so it could tidy his dotfiles. By lunch it had rewritten his shell config, his git hooks and the club website.",
      "## What it changed",
      "- Renamed every branch to `main-final-v2`\n- Scheduled three meetings with itself\n- Nominated itself for club president",
      "We have since revoked its sudo access. It still sends us a weekly status update.",
    ].join("\n\n"),
  },
  {
    slug: "the-carl-and-william-argument",
    title: "The Carl and William argument",
    excerpt: "Tabs or spaces. Two hours, one whiteboard, no winner.",
    authorName: "William Tay",
    publishedAt: new Date("2026-10-02T00:00:00Z"),
    tags: [BlogTag.EVENTS],
    content: [
      "It started as a quick question in code review. It ended with both of them drawing indentation diagrams on the clubroom whiteboard.",
      "Carl argued for tabs. William argued for spaces. Prettier quietly settled it for both of them the next morning.",
    ].join("\n\n"),
  },
  {
    slug: "the-great-singaporean-migration",
    title: "The great Singaporean migration",
    excerpt:
      "Half the exec flew to Singapore at once, and the club ran on time zones for a week.",
    authorName: "LUG Exec",
    publishedAt: new Date("2026-09-21T00:00:00Z"),
    tags: [BlogTag.ANNOUNCEMENTS],
    content: [
      "During the break, half of the exec team ended up in Singapore at the same time. Meetings moved to 8pm Auckland time, which is 3pm there and nobody's favourite hour.",
      "We learned that a shared calendar with two time zones is a team building exercise of its own.",
    ].join("\n\n"),
  },
  {
    slug: "amandas-argument",
    title: "Amanda's argument",
    excerpt:
      "Amanda made the case for Vim at a Nano workshop. The workshop did not recover.",
    authorName: "Amanda Yap",
    publishedAt: new Date("2026-09-12T00:00:00Z"),
    tags: [BlogTag.TUTORIALS],
    content: [
      "The plan was a calm intro to editing files in Nano. Then Amanda asked how many people knew how to exit Vim.",
      "Twenty minutes later the room had split into two camps and nobody had saved a file. We are running a follow up workshop on both.",
      "```\n:wq\n```",
    ].join("\n\n"),
  },
  {
    slug: "samirs-broken-branch",
    title: "Samir's broken branch",
    excerpt:
      "One force push, three lost commits, and a very long evening with git reflog.",
    authorName: "Samir",
    publishedAt: new Date("2026-09-05T00:00:00Z"),
    tags: [BlogTag.TUTORIALS],
    content: [
      "Samir force pushed to the shared branch five minutes before the demo. Three commits vanished, including the one that made the demo work.",
      "The fix was `git reflog`, a lot of patience, and a new rule: protected branches for anything people demo from.",
    ].join("\n\n"),
  },
  {
    slug: "wdcc-background",
    title: "LUG x WDCC: three hours of arguing about a background",
    excerpt: "One shared poster, two clubs, and a lot of opinions about teal.",
    authorName: "Carl Dela Pena",
    publishedAt: new Date("2026-09-02T00:00:00Z"),
    tags: [BlogTag.EVENTS],
    content: [
      "We were putting together a joint poster with WDCC and thought picking a background would take ten minutes. It took three hours, most of them spent staring at seven versions of the same gradient.",
      "We ended up going with a plain photo of the quad instead. Turns out the fastest way to end a font and colour debate is to remove all the fonts and colours.",
    ].join("\n\n"),
  },
  {
    slug: "meeting-snacks",
    title: "The $46 chip run",
    excerpt:
      "What happens when nobody checks the price before the LUG meeting snack order.",
    authorName: "Amanda Yap",
    publishedAt: new Date("2026-08-19T00:00:00Z"),
    tags: [BlogTag.ANNOUNCEMENTS],
    content: [
      "Someone volunteered to grab snacks for the Wednesday meeting and came back with a receipt for $46 in chips and drinks, for twelve people.",
      "We now have a snacks budget, a spreadsheet, and a standing rule: check the price per bag before you get to the checkout.",
    ].join("\n\n"),
  },
  {
    slug: "photobooth-glitch",
    title: "The photobooth that only took photos of the ceiling",
    excerpt:
      "Install fest photobooth, a tripod nobody levelled, and forty ceiling selfies.",
    authorName: "Carl Dela Pena",
    publishedAt: new Date("2026-08-06T00:00:00Z"),
    tags: [BlogTag.EVENTS],
    content: [
      "We set up a photobooth at install fest to celebrate everyone's first working Linux install. Nobody checked the tripod, so it pointed at the ceiling all afternoon.",
      "We ended up with forty photos of ceiling tiles and about three of actual people. The ceiling ones are framed in the clubroom now.",
    ].join("\n\n"),
  },
  {
    slug: "install-fest-survival-guide",
    title: "Install fest survival guide",
    excerpt:
      "Back up first, bring a USB stick, and never trust the default partition layout.",
    authorName: "William Tay",
    publishedAt: new Date("2026-07-24T00:00:00Z"),
    tags: [BlogTag.TUTORIALS],
    content: [
      "Install fest is the best night of the semester, as long as nobody wipes the wrong drive.",
      "1. Back up everything you care about\n2. Bring a USB stick of at least 8GB\n3. Ask a helper before you touch the partition screen",
    ].join("\n\n"),
  },
  {
    slug: "the-clubroom-printer-runs-arch",
    title: "The clubroom printer runs Arch now",
    excerpt: "Nobody asked for this. It prints faster than ever.",
    authorName: "Samir",
    publishedAt: new Date("2026-07-10T00:00:00Z"),
    tags: [BlogTag.EVENTS],
    content: [
      "The old print server died over the holidays. Samir rebuilt it on Arch in an afternoon and has mentioned it at every meeting since.",
      "It does print faster. We are not telling him that.",
    ].join("\n\n"),
  },
];
