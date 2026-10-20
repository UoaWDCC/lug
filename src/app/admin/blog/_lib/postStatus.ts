import type { PostStatus } from "@/generated/prisma/client";
import { adminBadgeClass } from "@/app/admin/_lib/adminStyles";

/* Shared by the post list and the editor header. */
export const postStatusBadges: Record<
  PostStatus,
  { label: string; className: string }
> = {
  PUBLISHED: { label: "Published", className: adminBadgeClass.positive },
  SCHEDULED: { label: "Scheduled", className: adminBadgeClass.neutral },
  DRAFT: { label: "Draft", className: adminBadgeClass.warning },
};
