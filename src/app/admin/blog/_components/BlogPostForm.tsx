import Link from "next/link";
import { BlogTag, type BlogPost } from "@/generated/prisma/client";
import {
  adminBackLinkClass,
  adminCheckInputClass,
  adminChipClass,
  adminErrorClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/app/admin/_lib/adminStyles";
import { PostEditor } from "./PostEditor";
import { TitleSlugInputs } from "./TitleSlugInputs";
import { PublishDateInput } from "./PublishDateInput";
import { postStatusBadges } from "../_lib/postStatus";

const FORM_ID = "blog-post-form";

type Props = {
  action: (formData: FormData) => Promise<void>;
  post?: BlogPost;
  errorMessage?: string;
};

export function BlogPostForm({ action, post, errorMessage }: Props) {
  const status = post ? postStatusBadges[post.status] : undefined;
  const isLive = post?.status === "PUBLISHED" || post?.status === "SCHEDULED";

  /* Pressing Enter in a text field submits with the form's first submit button, so the safe action
     comes first in the DOM. flex-row-reverse still shows the primary button on the right. */
  const actions = isLive ? (
    <div className="flex flex-row-reverse flex-wrap justify-end gap-3">
      <button
        type="submit"
        form={FORM_ID}
        name="intent"
        value="publish"
        className={adminPrimaryButtonClass}
      >
        Update
      </button>
      <button
        type="submit"
        form={FORM_ID}
        name="intent"
        value="draft"
        className={adminSecondaryButtonClass}
      >
        Unpublish
      </button>
    </div>
  ) : (
    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        form={FORM_ID}
        name="intent"
        value="draft"
        className={adminSecondaryButtonClass}
      >
        Save draft
      </button>
      <button
        type="submit"
        form={FORM_ID}
        name="intent"
        value="publish"
        className={adminPrimaryButtonClass}
      >
        Publish
      </button>
    </div>
  );

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link href="/admin/blog" className={adminBackLinkClass}>
            <span aria-hidden>←</span> Blog Posts
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <h1 className="text-4xl font-black tracking-tight">
              {post ? "Edit Post" : "New Post"}
            </h1>
            {status && <span className={status.className}>{status.label}</span>}
          </div>
        </div>
        {actions}
      </div>

      {errorMessage && (
        <p role="alert" className={`mt-6 ${adminErrorClass}`}>
          {errorMessage}
        </p>
      )}

      <form id={FORM_ID} action={action} className="mt-8 flex flex-col gap-6">
        {post && <input type="hidden" name="id" value={post.id} />}

        <div className="grid gap-6 md:grid-cols-2">
          <TitleSlugInputs
            inputClass={adminInputClass}
            labelClass={adminLabelClass}
            initialTitle={post?.title}
            initialSlug={post?.slug}
          />
        </div>

        <div>
          <label htmlFor="excerpt" className={adminLabelClass}>
            Summary
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={1}
            maxLength={500}
            defaultValue={post?.excerpt ?? ""}
            placeholder="One or two sentences shown on the blog list."
            // Starts one line tall and grows with the text (field-sizing); resize-y is the fallback.
            className={`${adminInputClass} resize-y [field-sizing:content]`}
          />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <fieldset className="min-w-0 flex-1">
            <legend className={adminLabelClass}>Tags</legend>
            <div className="flex flex-wrap gap-3">
              {Object.values(BlogTag).map((tag) => (
                <label key={tag} className={adminChipClass}>
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag}
                    defaultChecked={post?.tags.includes(tag)}
                    className={adminCheckInputClass}
                  />
                  {tag.toLowerCase()}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="md:w-72">
            <PublishDateInput initialValue={post?.publishedAt?.toISOString()} />
          </div>
        </div>

        <PostEditor initialContent={post?.content} />
      </form>
    </section>
  );
}
