/* The editor's buttons submit intent=draft|publish; the create/update actions only understand
   publishedAt (blank = draft, future = scheduled, past = published). This bridges the two. */

export function applyPublishIntent(formData: FormData, now = new Date()) {
  const intent = formData.get("intent");
  const publishedAt = formData.get("publishedAt");
  const hasDate = typeof publishedAt === "string" && publishedAt.trim() !== "";

  if (intent === "draft") {
    formData.set("publishedAt", "");
  } else if (intent === "publish" && !hasDate) {
    // No date chosen: publish immediately.
    formData.set("publishedAt", now.toISOString());
  }
  // intent=publish with a date keeps it (a future date schedules the post).
}
