import { redirect } from "next/navigation";
import { createBlogPostAction } from "@/features/blog/createBlogPostAction";
import { applyPublishIntent } from "@/domain/blog/publishIntent";
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

  return <BlogPostForm action={submitPost} errorMessage={errorMessage} />;
}

async function submitPost(formData: FormData): Promise<void> {
  "use server";

  applyPublishIntent(formData);
  const result = await createBlogPostAction(formData);
  if (result) {
    redirect(`/admin/blog/new?error=${encodeURIComponent(result.error)}`);
  }
}
