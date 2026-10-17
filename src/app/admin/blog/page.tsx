import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { findAllBlogPosts } from "@/repositories/blogPostRepository";
import { DeleteBlogPostButton } from "./DeleteBlogPostButton";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  not_found: "That post no longer exists.",
  database: "The post could not be deleted. Please try again.",
};

export default async function AdminBlogPage({ searchParams }: PageProps) {
  await requireAdmin();
  const posts = await findAllBlogPosts();
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog posts</h1>
          <p className="mt-1 text-sm text-gray-600">{posts.length} total</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New post
        </Link>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-4 text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                Title
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Tags
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Author
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Published
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-gray-600">
                  No blog posts yet.
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-gray-200">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">{post.status.toLowerCase()}</td>
                <td className="px-4 py-3">
                  {post.tags.length > 0
                    ? post.tags.map((tag) => tag.toLowerCase()).join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3">{post.authorName}</td>
                <td className="px-4 py-3">
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt.toISOString()}>
                      {post.publishedAt.toLocaleString("en-NZ")}
                    </time>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/blog/${post.id}/edit`}>Edit</Link>
                    <DeleteBlogPostButton id={post.id} title={post.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
