"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { BlogContext } from "@/components/terminal/commands";
import TerminalPrompt from "@/components/terminal/TerminalPrompt";
import TerminalScreen from "@/components/terminal/TerminalScreen";
import { useTerminal } from "@/components/terminal/TerminalProvider";

/* Two column blog layout: page on the left, terminal sidebar on the right that folds into the dock pill. */
export default function BlogShell({
  posts,
  tags,
  children,
}: {
  posts: BlogContext["posts"];
  tags: readonly string[];
  children: React.ReactNode;
}) {
  const { isSidebarCollapsed, registerBlog } = useTerminal();

  const blog = useMemo<BlogContext>(() => ({ posts, tags }), [posts, tags]);

  useEffect(() => {
    registerBlog(blog);
    return () => registerBlog(null);
  }, [blog, registerBlog]);

  useReadingKeys();

  return (
    <div
      data-blog-shell
      className={`relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] bg-[var(--bg)] transition-[grid-template-columns] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isSidebarCollapsed
          ? "min-[900px]:grid-cols-[minmax(0,1fr)_0px]"
          : "min-[900px]:grid-cols-[minmax(0,1fr)_284px]"
      }`}
    >
      <div className="relative flex min-h-0 min-w-0 flex-col">{children}</div>

      <BlogSidebar posts={posts} tags={tags} />
    </div>
  );
}

const STEP = 140;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/* Vim style reading keys for the blog's scroll container. */
function useReadingKeys() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const scroller =
        document.querySelector<HTMLElement>("[data-blog-scroll]");
      if (!scroller) return;

      switch (event.key) {
        case "j":
        case "ArrowDown":
          scroller.scrollBy({ top: STEP, behavior: "smooth" });
          break;
        case "k":
        case "ArrowUp":
          scroller.scrollBy({ top: -STEP, behavior: "smooth" });
          break;
        case "g":
          scroller.scrollTo({ top: 0, behavior: "smooth" });
          break;
        case "G":
          scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
          break;
        default:
          return;
      }

      event.preventDefault();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

const smallButtonClass =
  "shrink-0 cursor-pointer rounded-[7px] border border-[var(--row-border)] px-2 py-0.5 font-mono text-[12px] text-[var(--muted)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent-text)]";

type TagRow = { key: string; label: string; href: string; count: number };

function tagRows(
  posts: BlogContext["posts"],
  tags: readonly string[],
): TagRow[] {
  return [
    { key: "all", label: "all posts", href: "/blog", count: posts.length },
    ...tags.map((tag) => ({
      key: tag,
      label: `#${tag}`,
      href: `/blog?tag=${tag}`,
      count: posts.filter((post) => post.tags.includes(tag)).length,
    })),
  ];
}

function TagList({ rows, active }: { rows: TagRow[]; active: string | null }) {
  return (
    <nav
      aria-label="Filter posts by tag"
      className="flex flex-col gap-[11px] px-3.5 py-[15px]"
    >
      {rows.map((row) => {
        const isActive = row.key === active;
        return (
          <Link
            key={row.key}
            href={row.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center justify-between gap-2.5 font-mono text-[12.5px] no-underline transition-colors duration-[180ms] hover:text-[var(--accent)] ${
              isActive
                ? "font-semibold text-[var(--accent-text)]"
                : "text-[var(--muted)]"
            }`}
          >
            <span>{row.label}</span>
            <span
              className={`text-[11.5px] ${row.count === 0 ? "text-[var(--muted)]" : "text-[var(--accent-text)]"}`}
            >
              {row.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* Highlights the current filter, but only on the index: a post page has no filter. */
function ActiveTagList({ rows }: { rows: TagRow[] }) {
  const pathname = usePathname();
  const params = useSearchParams();

  const tag = params.get("tag");
  const active =
    pathname !== "/blog"
      ? null
      : tag && rows.some((row) => row.key === tag)
        ? tag
        : "all";

  return <TagList rows={rows} active={active} />;
}

function BlogSidebar({
  posts,
  tags,
}: {
  posts: BlogContext["posts"];
  tags: readonly string[];
}) {
  const pathname = usePathname();
  const { isSidebarCollapsed, collapseSidebar } = useTerminal();
  const rows = tagRows(posts, tags);

  return (
    <aside
      aria-label="Blog terminal"
      inert={isSidebarCollapsed}
      className="relative z-40 hidden min-h-0 min-w-0 flex-col overflow-hidden border-l border-[var(--term-border)] bg-[var(--term-bg)] min-[900px]:flex"
    >
      {/* Fixed width so the contents clip, rather than reflow, while the column animates. */}
      <div className="flex h-full w-[284px] flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--hairline)] px-3.5 py-3">
          <span className="font-mono text-[12px] whitespace-nowrap text-[var(--muted)]">
            lug@uoa:~/blog
          </span>
          <button
            type="button"
            onClick={collapseSidebar}
            aria-label="Collapse the terminal into the dock"
            className={`${smallButtonClass} nojs:hidden`}
          >
            hide
          </button>
        </div>

        <Suspense fallback={<TagList rows={rows} active={null} />}>
          <ActiveTagList rows={rows} />
        </Suspense>

        <TerminalScreen compact className="min-h-0 flex-1 px-3.5 pb-2" />

        <div className="relative border-t border-[var(--input-border)] px-3.5 py-3">
          <TerminalPrompt
            compact
            cwd={pathname}
            placeholder="help"
            className="nojs:hidden"
          />
          <p className="m-0 hidden font-mono text-[12px] text-[var(--muted)] nojs:block">
            enable JavaScript to use the terminal
          </p>
        </div>
      </div>
    </aside>
  );
}
