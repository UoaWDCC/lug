import { BlogTag, type BlogPost } from "@/generated/prisma/client";
import { PostEditor } from "./new/PostEditor";
import { TitleSlugInputs } from "./new/TitleSlugInputs";

const inputClass =
  "block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium";

type Props = {
  action: (formData: FormData) => Promise<void>;
  post?: BlogPost;
};

export function BlogPostForm({ action, post }: Props) {
  return (
    <form action={action} className="mt-6 space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      <TitleSlugInputs
        inputClass={inputClass}
        labelClass={labelClass}
        initialTitle={post?.title}
        initialSlug={post?.slug}
      />

      <div>
        <label htmlFor="excerpt" className={labelClass}>
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          maxLength={500}
          defaultValue={post?.excerpt ?? ""}
          className={inputClass}
        />
      </div>

      <PostEditor
        inputClass={inputClass}
        labelClass={labelClass}
        initialContent={post?.content}
      />

      <fieldset>
        <legend className={labelClass}>Tags</legend>
        <div className="flex flex-wrap gap-4">
          {Object.values(BlogTag).map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="tags"
                value={tag}
                defaultChecked={post?.tags.includes(tag)}
              />
              {tag.toLowerCase()}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="publishedAt" className={labelClass}>
          Publish date (leave blank for a draft)
        </label>
        <input
          id="publishedAt"
          name="publishedAt"
          type="datetime-local"
          defaultValue={post?.publishedAt?.toISOString().slice(0, 16) ?? ""}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        {post ? "Save changes" : "Save post"}
      </button>
    </form>
  );
}
