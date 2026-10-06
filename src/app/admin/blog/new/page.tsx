import { redirect } from "next/navigation";
import { createBlogPostAction } from "@/features/blog/createBlogPostAction";
import { requireAdmin } from "@/lib/auth/session";
import { BlogPostForm } from "../BlogPostForm";

const errorMessages: Record<string, string> = {
  validation: "Check the post fields and try again.",
  duplicate: "That slug is already used by another post.",
  database: "The post could not be saved. Please try again.",
  admin_not_found: "Your admin account could not be found.",
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  await requireAdmin();
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">New blog post</h1>
      {errorMessage && (
        <p role="alert" className="mt-4 text-red-700">
          {errorMessage}
        </p>
      )}
      <BlogPostForm action={submitPost} />
    </main>
  );
}

async function submitPost(formData: FormData): Promise<void> {
  "use server";

  const result = await createBlogPostAction(formData);
  if (result) {
    redirect(`/admin/blog/new?error=${encodeURIComponent(result.error)}`);
  }
}
