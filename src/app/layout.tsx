import type { Metadata } from "next";
import { Fira_Code, Lato } from "next/font/google";
import "./globals.css";

import NavBar from "@/components/layout/NavBar";
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
      className={`${firaCode.variable} ${lato.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        {/* Fixed-viewport shell - the page never scrolls, each screen's <main> does. */}
        <div className="relative flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
          <div
            aria-hidden
            className="absolute inset-0 z-0 bg-[image:var(--hero-image)] bg-cover bg-[position:right_center] opacity-[var(--hero-opacity)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-[image:var(--hero-scrim)]"
          />

          <NavBar />
          {children}
        </div>
      </body>
    </html>
  );
}
