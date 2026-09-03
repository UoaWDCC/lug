import type { Metadata } from "next";
import { Fira_Code, Lato } from "next/font/google";
import "./globals.css";

import NavBar from "@/components/layout/NavBar";
import TerminalDock from "@/components/terminal/TerminalDock";
import TerminalProvider from "@/components/terminal/TerminalProvider";
import ThemeScript from "@/components/theme/ThemeScript";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      // ThemeScript can rewrite data-theme before hydration, so server/client may legitimately differ.
      suppressHydrationWarning
      className={`${firaCode.variable} ${lato.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        {/* Fixed-viewport shell - the page never scrolls, each screen's <main> does. */}
        <div className="relative flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
          <div aria-hidden className="hero-layer hero-layer--dark z-0" />
          <div aria-hidden className="hero-layer hero-layer--light z-0" />

          {/* Root-level so the terminal session survives navigation. */}
          <TerminalProvider>
            <NavBar />
            {children}
            <TerminalDock />
          </TerminalProvider>
        </div>
      </body>
    </html>
  );
}
