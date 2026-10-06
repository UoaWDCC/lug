import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateBlogPostAction } from "@/features/blog/updateBlogPostAction";
import { requireAdmin } from "@/lib/auth/session";
import { findBlogPostById } from "@/repositories/blogPostRepository";
import { BlogPostForm } from "../../BlogPostForm";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_id: "The post ID is invalid.",
  validation: "Check the post fields and try again.",
  not_found: "That post no longer exists.",
  duplicate: "That slug is already used by another post.",
  database: "The post could not be updated. Please try again.",
};

export default async function EditBlogPostPage({
  params,
  searchParams,
}: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const post = await findBlogPostById(id);
  if (!post) notFound();

  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin/blog" className="text-sm">
        ← All posts
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Edit blog post</h1>
      {errorMessage && (
        <p role="alert" className="mt-4 text-red-700">
          {errorMessage}
        </p>
      )}
      <BlogPostForm action={submitPost} post={post} />
    </main>
  );
}

async function submitPost(formData: FormData): Promise<void> {
  "use server";

  const result = await updateBlogPostAction(formData);
  if (result) {
    const id = formData.get("id");
    if (typeof id !== "string" || !id) redirect("/admin/blog");
    redirect(
      `/admin/blog/${encodeURIComponent(id)}/edit?error=${encodeURIComponent(result.error)}`,
    );
  }
}
