import { getMockBlogItems } from "@/lib/mock/blog-posts";

async function createBlogPost(formData: FormData) {
  "use server";
  // TODO: persist to the database via a blog repo
  const post = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    content: formData.get("content"),
  };
  console.log("new blog post draft", post);
}

const inputClass =
  "block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none";
const labelClass = "block text-sm font-medium mb-1";

export default async function AdminBlogPage() {
  const posts = await getMockBlogItems();

  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold tracking-tight">Blog posts</h1>
      <p className="mt-1 text-sm text-gray-600">{posts.length} published</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Published</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr
                key={p.slug}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2">{p.title}</td>
                <td className="px-4 py-2 text-gray-600">{p.slug}</td>
                <td className="px-4 py-2 text-gray-600">{p.publishedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 max-w-xl">
        <h2 className="text-xl font-semibold">New post</h2>
        <form action={createBlogPost} className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="content" className={labelClass}>
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={6}
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Publish
          </button>
        </form>
      </div>
    </section>
  );
}
