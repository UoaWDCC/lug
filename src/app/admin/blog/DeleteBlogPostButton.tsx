"use client";

import { deleteBlogPostAction } from "@/features/blog/deleteBlogPostAction";

type Props = {
  id: string;
  title: string;
};

export function DeleteBlogPostButton({ id, title }: Props) {
  return (
    <form
      action={deleteBlogPostAction.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-red-700 hover:underline">
        Delete
      </button>
    </form>
  );
}
