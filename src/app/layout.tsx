import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Fira_Code, Lato } from "next/font/google";
import "./globals.css";

import ThemeScript, { THEME_STORAGE_KEY } from "@/components/theme/ThemeScript";
import ScriptingFlag from "@/components/primitive/ScriptingFlag";

const firaCode = Fira_Code({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-sans",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUG@UoA - Linux Users Group at University of Auckland",
  description:
    "A club where we build, share, and talk about Linux, the free and open-source operating system.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read theme from cookie to set the initial theme on server-side
  const cookieStore = await cookies();
  const theme =
    cookieStore.get(THEME_STORAGE_KEY)?.value === "light" ? "light" : "dark";

  return (
    <html
      lang="en"
      data-theme={theme}
      // ThemeScript and ScriptingFlag set data-* attributes before hydration, so server/client may legitimately differ.
      suppressHydrationWarning
      className={`${firaCode.variable} ${lato.variable}`}
    >
      <head>
        <ScriptingFlag />
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
