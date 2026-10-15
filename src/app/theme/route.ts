import { NextRequest, NextResponse } from "next/server";

import { THEME_STORAGE_KEY } from "@/components/theme/ThemeScript";

/* No-JS fallback for ThemeToggle: flip the cookie, then reload the page it came from. */
export async function POST(request: NextRequest) {
  const current = request.cookies.get(THEME_STORAGE_KEY)?.value;
  const next = current === "light" ? "dark" : "light";

  // Path only, so a forged Referer can't redirect off-site.
  let back = "/";
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      back = url.pathname + url.search;
    } catch {
      // Malformed Referer; fall back to home.
    }
  }

  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: back },
  });

  // Not httpOnly: applyTheme rewrites it from the client.
  response.cookies.set(THEME_STORAGE_KEY, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}
