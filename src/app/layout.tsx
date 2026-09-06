import type { Metadata } from "next";
import { Fira_Code, Lato } from "next/font/google";
import "./globals.css";

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
      suppressHydrationWarning
      className={`${firaCode.variable} ${lato.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
