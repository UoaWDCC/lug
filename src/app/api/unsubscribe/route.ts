import type { NextRequest } from "next/server";

import { updateSubscription } from "@/features/mailing-list/updateSubscription";

/* One-click unsubscribe (RFC 8058) for the inbox's own "Unsubscribe" button, linked from the
   List-Unsubscribe header. Only mail providers POST here, so it unsubscribes straight away; the
   footer link goes to the /unsubscribe confirm page instead. */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";

  switch (await updateSubscription(token, "unsubscribe")) {
    case "invalid_token":
      return new Response("Invalid unsubscribe link.", { status: 400 });
    case "error":
      return new Response("Couldn't unsubscribe. Please try again later.", {
        status: 500,
      });
    default:
      return new Response("Unsubscribed.", { status: 200 });
  }
}
