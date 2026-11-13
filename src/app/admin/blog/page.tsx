import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { findAllBlogPosts } from "@/repositories/blogPostRepository";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import {
  adminEditActionClass,
  adminErrorClass,
  adminPrimaryButtonClass,
  adminRowClass,
  adminTableWrapClass,
  adminTagClass,
  adminTdClass,
  adminThClass,
} from "@/app/admin/_lib/adminStyles";
import { DeleteBlogPostButton } from "./_components/DeleteBlogPostButton";
import { postStatusBadges } from "./_lib/postStatus";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  not_found: "That post no longer exists.",
  database: "The post could not be deleted. Please try again.",
};

const columns = ["Title", "Status", "Tags", "Author", "Published", "Actions"];

/* YYYY-MM-DD in the club's timezone, so a late-evening publish doesn't show as the next UTC day. */
function formatDate(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" });
}

export default async function AdminBlogPage({ searchParams }: PageProps) {
  await requireAdmin();
  const posts = await findAllBlogPosts();
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <section>
      <AdminPageHeader
        title="Blog Posts"
        count={`${posts.length} post${posts.length === 1 ? "" : "s"}`}
        description="Manage and publish blog posts."
        actions={
          <Link href="/admin/blog/new" className={adminPrimaryButtonClass}>
            <span aria-hidden className="text-xl leading-none">
              +
            </span>
            New post
          </Link>
        }
      />

      {errorMessage && (
        <p role="alert" className={`mt-6 ${adminErrorClass}`}>
          {errorMessage}
        </p>
      )}

      <div className={`mt-8 ${adminTableWrapClass}`}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className={adminThClass}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr className="border-t border-[var(--divider)]">
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No blog posts yet.{" "}
                  <Link href="/admin/blog/new">Write the first one</Link>.
                </td>
              </tr>
            )}
            {posts.map((post) => {
              const status = postStatusBadges[post.status];
              return (
                <tr key={post.id} className={adminRowClass}>
                  {/* Min widths stop titles squashing to a word per line on phones; the table scrolls instead. */}
                  <td className={`${adminTdClass} min-w-56 font-bold`}>
                    {post.title}
                  </td>
                  <td className={adminTdClass}>
                    <span className={status.className}>{status.label}</span>
                  </td>
                  <td className={`${adminTdClass} min-w-44`}>
                    {post.tags.length > 0 ? (
                      <ul className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <li key={tag} className={adminTagClass}>
                            {tag.toLowerCase()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className={`${adminTdClass} whitespace-nowrap`}>
                    {post.authorName}
                  </td>
                  <td
                    className={`${adminTdClass} font-mono text-sm whitespace-nowrap text-[var(--muted)]`}
                  >
                    {post.publishedAt ? (
                      <time dateTime={post.publishedAt.toISOString()}>
                        {formatDate(post.publishedAt)}
                      </time>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={adminTdClass}>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className={adminEditActionClass}
                      >
                        Edit
                      </Link>
                      <DeleteBlogPostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
