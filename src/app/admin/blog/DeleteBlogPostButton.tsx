"use client";

import { useState } from "react";
import { deleteBlogPostAction } from "@/features/blog/deleteBlogPostAction";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { adminDeleteActionClass } from "@/app/admin/_components/adminStyles";

type Props = {
  id: string;
  title: string;
};

export function DeleteBlogPostButton({ id, title }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={adminDeleteActionClass}
      >
        Delete
      </button>

      <ConfirmDialog
        open={open}
        title="Delete this post?"
        confirmLabel="Delete post"
        pendingLabel="Deleting…"
        onClose={() => setOpen(false)}
        // Redirects back to /admin/blog either way; failures arrive as ?error= and show on the page.
        onConfirm={() => deleteBlogPostAction(id)}
      >
        <p className="font-bold text-[var(--fg)]">“{title}”</p>
        <p className="mt-2">
          This permanently removes the post and its link stops working. This
          can&apos;t be undone.
        </p>
      </ConfirmDialog>
    </>
  );
}
